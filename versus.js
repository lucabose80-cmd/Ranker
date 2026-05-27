import { db } from './firebase-config.js';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, Timestamp, getDocs, getDoc, runTransaction, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser, refreshCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, drawFromBag } from './utils.js';
import { initGameVersus } from './game-versus.js';

let currentLobbyId = null;
let lobbyUnsubscribe = null;
let lobbiesListUnsubscribe = null;
let isPlayingVersus = false;

export function stopVersus() {
    if (lobbyUnsubscribe) lobbyUnsubscribe();
    if (lobbiesListUnsubscribe) lobbiesListUnsubscribe();
    lobbyUnsubscribe = null;
    lobbiesListUnsubscribe = null;
    currentLobbyId = null;
    isPlayingVersus = false;
}

export async function initVersus() {
    const user = await refreshCurrentUser();
    if (!user) return;
    
    try {
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const snap = await getDoc(doc(db, "config", "maintenance"));
        if (snap.exists() && snap.data().versus) {
            document.getElementById('versus-lobby-list-view').innerHTML = `<p class="prompt-text" style="color:#ff4757;">Versus Modus ist derzeit wegen Wartungsarbeiten deaktiviert.</p>`;
            return;
        }
    } catch(e) {}

    const gamesPlayed = currentMode === 'starwars' ? (user.gamesPlayed_starwars || 0) : (user.gamesPlayed_waifu || 0);
    const container = document.getElementById('versus-lobby-list-view');
    
    if (gamesPlayed < 10) {
        container.innerHTML = `
            <h2>VERSUS LOBBYS</h2>
            <p class="prompt-text" style="color:#ff4757;">Versus Modus gesperrt!</p>
            <p class="prompt-text">Du musst zuerst 10 klassische Spiele in diesem Universum abschließen, bevor du an Versus-Matches teilnehmen kannst. (${gamesPlayed}/10)</p>
        `;
        return;
    }

    document.getElementById('create-versus-lobby-btn').onclick = createVersusLobby;
    document.getElementById('leave-versus-lobby-btn').onclick = leaveVersusLobby;
    document.getElementById('start-versus-game-btn').onclick = startVersusGame;
    document.getElementById('abort-versus-game-btn').onclick = async () => {
        const btn = document.getElementById('abort-versus-game-btn');
        btn.classList.add('hidden');
        
        // Live Game explizit löschen bevor wir die Seite verlassen
        const user = getCurrentUser();
        if (user) {
            try {
                await deleteDoc(doc(db, "live_games", user.username));
            } catch(e) {}
        }
        
        await leaveVersusLobby();
        window.location.reload(); // Force full reload to clear any hung state
    };

    const closeVersusResultBtn = document.getElementById('close-versus-result-btn');
    if (closeVersusResultBtn) {
        closeVersusResultBtn.onclick = () => {
            const modal = document.getElementById('versus-result-modal');
            if (modal) modal.classList.add('hidden');
        };
    }

    listenToLobbies();
}

function listenToLobbies() {
    if (lobbiesListUnsubscribe) lobbiesListUnsubscribe();
    
    const q = query(collection(db, "versus_lobbies"), where("mode", "==", currentMode), where("status", "in", ["waiting", "playing"]));
    
    lobbiesListUnsubscribe = onSnapshot(q, (snapshot) => {
        const grid = document.getElementById('versus-lobbies-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        let hasLobbies = false;
        snapshot.forEach(d => {
            const lobby = d.data();
            lobby.id = d.id;
            
            // Verstecke "playing" Lobbys, wenn der Spieler nicht selbst drin ist
            const user = getCurrentUser();
            const isInLobby = lobby.players.some(p => p.uid === user.uid);
            if (lobby.status === 'playing' && !isInLobby) return;
            
            hasLobbies = true;
            
            const card = document.createElement('div');
            card.className = 'history-card';
            card.style.cursor = lobby.status === 'waiting' && !isInLobby ? 'pointer' : 'default';
            card.style.textAlign = 'center';
            card.style.position = 'relative';
            
            card.innerHTML = `
                <div style="font-weight:bold; margin-bottom: 5px; color:#ffd700;">Lobby von ${lobby.hostName}</div>
                <div style="color:#aaa; font-size: 0.85rem; margin-bottom: 10px;">Spieler: ${lobby.players.length}/8</div>
                <div style="font-size: 0.8rem; color:${lobby.status==='waiting' ? '#2ed573' : '#ff4757'};">${lobby.status === 'waiting' ? 'Wartet auf Spieler' : 'Spiel läuft'}</div>
            `;
            
            if (lobby.status === 'waiting' && !isInLobby && lobby.players.length < 8) {
                card.onclick = () => joinVersusLobby(lobby.id);
            } else if (isInLobby && lobby.status === 'waiting') {
                // Spieler ist drin, also Raum öffnen
                card.onclick = () => showWaitingRoom(lobby.id);
                // Direkt dorthin wechseln, wenn man grad nicht drinnen ist
                if (currentLobbyId !== lobby.id) {
                    showWaitingRoom(lobby.id);
                }
            } else if (isInLobby && lobby.status === 'playing') {
                if (currentLobbyId !== lobby.id) {
                    showWaitingRoom(lobby.id); // Triggers transition
                }
            }
            
            grid.appendChild(card);
        });
        
        if (!hasLobbies) {
            grid.innerHTML = '<p class="prompt-text">Keine offenen Lobbys gefunden.</p>';
        }
    });
}

async function createVersusLobby() {
    const user = getCurrentUser();
    if (!user) return;
    
    const catSelect = document.getElementById('versus-category-select');
    const category = catSelect ? catSelect.value : 'normal';
    
    let poolSource = activeCharacterDatabase;
    if (currentMode === 'starwars') {
        if (category === 'vehicle') {
            poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('vehicle'));
        } else if (category === 'klon') {
            const klonGames = user['gamesPlayed_starwars_klon'] || 0;
            if (klonGames < 10) {
                alert("Du musst mindestens 10 Spiele im 'Nur Klone' Modus (Klassisch) absolviert haben, um den Klon-Versus Modus zu hosten!");
                return;
            }
            poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('klon') && !c.tags.includes('vehicle'));
        } else if (category === 'peak' || category === 'hardcore') {
            poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('peak') && !c.tags.includes('vehicle'));
        } else {
            // Expanded Universe ('normal'): alle Charaktere inklusive Fahrzeuge
            poolSource = activeCharacterDatabase;
        }
    } else {
        poolSource = activeCharacterDatabase.filter(c => !c.tags || !c.tags.includes('vehicle'));
    }
    
    // Generiere 5 Charaktere
    const suffix = category === 'normal' ? '' : '_' + category;
    const chars = drawFromBag(poolSource, 5, 'bag_versus_' + currentMode + suffix).map(c => c.name);
    
    const lobbyId = "lobby_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    const activeAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
    
    const lobbyData = {
        mode: currentMode,
        category: category,
        hostUid: user.uid,
        hostName: user.displayName || user.username,
        status: 'waiting',
        characters: chars,
        timestamp: Timestamp.now(),
        players: [{
            uid: user.uid,
            username: user.username,
            displayName: user.displayName || user.username,
            avatar: activeAvatar,
            status: 'waiting',
            picks: []
        }]
    };
    
    await setDoc(doc(db, "versus_lobbies", lobbyId), lobbyData);
    showWaitingRoom(lobbyId);
}

async function joinVersusLobby(lobbyId) {
    const user = getCurrentUser();
    if (!user) return;
    
    const lobbyRef = doc(db, "versus_lobbies", lobbyId);
    const snap = await getDoc(lobbyRef);
    if (!snap.exists()) return;
    
    const lobby = snap.data();
    if (lobby.status !== 'waiting' || lobby.players.length >= 8) {
        alert("Lobby ist voll oder bereits gestartet.");
        return;
    }
    
    const activeAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
    
    lobby.players.push({
        uid: user.uid,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: activeAvatar,
        status: 'waiting',
        picks: []
    });
    
    await updateDoc(lobbyRef, { players: lobby.players });
    showWaitingRoom(lobbyId);
}

async function leaveVersusLobby() {
    if (!currentLobbyId) return;
    
    const user = getCurrentUser();
    const lobbyRef = doc(db, "versus_lobbies", currentLobbyId);
    const snap = await getDoc(lobbyRef);
    
    if (snap.exists()) {
        const lobby = snap.data();
        if (lobby.status === 'finished') {
            // Die Lobby ist abgeschlossen. Wir dürfen die DB nicht mehr verändern, 
            // damit andere Spieler das Resultat noch in Ruhe abrufen können!
            if (lobbyUnsubscribe) lobbyUnsubscribe();
            lobbyUnsubscribe = null;
            currentLobbyId = null;
            resetVersusUI();
            return;
        }

        lobby.players = lobby.players.filter(p => p.uid !== user.uid);
        
        if (lobby.players.length === 0) {
            await deleteDoc(lobbyRef);
        } else {
            if (lobby.hostUid === user.uid) {
                lobby.hostUid = lobby.players[0].uid;
                lobby.hostName = lobby.players[0].displayName;
            }
            await updateDoc(lobbyRef, { players: lobby.players, hostUid: lobby.hostUid, hostName: lobby.hostName });
        }
    }
    
    if (lobbyUnsubscribe) lobbyUnsubscribe();
    lobbyUnsubscribe = null;
    currentLobbyId = null;
    
    resetVersusUI();
}

export function resetVersusUI() {
    const wRoom = document.getElementById('versus-waiting-room-view');
    const lList = document.getElementById('versus-lobby-list-view');
    if (wRoom) wRoom.classList.add('hidden');
    if (lList) lList.classList.remove('hidden');
    
    const gameMain = document.getElementById('game-main-content');
    const versusContent = document.getElementById('versus-content');
    if (gameMain) gameMain.classList.remove('hidden');
    if (versusContent) versusContent.classList.add('hidden');
    
    const abortBtn = document.getElementById('abort-versus-game-btn');
    if (abortBtn) abortBtn.classList.add('hidden');
    
    const modeSel = document.querySelector('.mode-selector');
    if (modeSel) modeSel.style.display = 'flex';
}

async function startVersusGame() {
    if (!currentLobbyId) return;
    const lobbyRef = doc(db, "versus_lobbies", currentLobbyId);
    await updateDoc(lobbyRef, { status: 'playing' });
}

function showWaitingRoom(lobbyId) {
    currentLobbyId = lobbyId;
    document.getElementById('versus-lobby-list-view').classList.add('hidden');
    document.getElementById('versus-waiting-room-view').classList.remove('hidden');
    
    if (lobbyUnsubscribe) lobbyUnsubscribe();
    
    lobbyUnsubscribe = onSnapshot(doc(db, "versus_lobbies", lobbyId), async (docSnap) => {
        if (!docSnap.exists()) {
            alert("Lobby wurde geschlossen.");
            leaveVersusLobby();
            return;
        }
        
        const lobby = docSnap.data();
        lobby.id = docSnap.id;
        const user = getCurrentUser();
        
        const isHost = lobby.hostUid === user.uid;
        const startBtn = document.getElementById('start-versus-game-btn');
        const leaveBtn = document.getElementById('leave-versus-lobby-btn');
        
        if (lobby.status === 'waiting') {
            window.versusModalOpenedForLobby = null; // Reset the modal flag for new rounds
        }
        
        if (isHost && lobby.status === 'waiting') {
            startBtn.classList.remove('hidden');
            if (lobby.players.length > 1) {
                startBtn.style.opacity = '1';
                startBtn.disabled = false;
            } else {
                startBtn.style.opacity = '0.5';
                startBtn.disabled = true;
                startBtn.title = "Warte auf andere Spieler...";
            }
        } else {
            startBtn.classList.add('hidden');
        }
        
        const grid = document.getElementById('versus-players-grid');
        grid.innerHTML = lobby.players.map(p => {
            const isMe = p.uid === user.uid;
            const isFinished = p.status === 'finished';
            const statusColor = isFinished ? '#2ed573' : (lobby.status === 'playing' ? '#ffd700' : '#ccc');
            const statusText = isFinished ? 'Fertig!' : (lobby.status === 'playing' ? 'Rankt...' : 'Bereit');
            
            return `
                <div class="history-card" style="text-align:center; padding:10px;">
                    <img src="${p.avatar}" style="width:50px;height:50px;object-fit:cover;border-radius:50%;margin-bottom:10px;border:2px solid ${isMe ? '#ffd700' : '#444'};">
                    <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.displayName}</div>
                    <div style="font-size:0.8rem; color:${statusColor}; margin-top:5px;">${statusText}</div>
                </div>
            `;
        }).join('');

        // Betting UI implementation
        const bettingContainer = document.getElementById('versus-betting-container');
        if (bettingContainer) {
            if (lobby.status === 'waiting') {
                try {
                    const uSnap = await getDoc(doc(db, "users", user.uid));
                    let credits = uSnap.exists() ? (uSnap.data().credits || 0) : 0;
                    if (user.username === 'test1' || user.username === 'test2' || user.role === 'admin') {
                        credits = Math.max(credits, 1000);
                    }
                    const myBet = (lobby.bets || []).find(b => b.uid === user.uid);
                    const totalPool = lobby.prizePool || 0;
                    
                    let poolHtml = `
                        <div style="background: rgba(46, 213, 115, 0.1); border: 1px solid #2ed573; border-radius: 6px; padding: 10px; text-align: center; margin-bottom: 15px;">
                            <span style="color: #2ed573; font-weight: bold; font-size: 0.95rem;">💰 Aktueller Preispool: ${totalPool} Credits</span>
                        </div>
                    `;
                    
                    if (myBet) {
                        bettingContainer.innerHTML = `
                            ${poolHtml}
                            <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 6px; padding: 12px; text-align: center;">
                                <p style="margin: 0; color: #ffd700; font-size: 0.9rem;">
                                    Du hast <strong>${myBet.amount} Credits</strong> auf <strong>${myBet.targetName}</strong> gewettet!
                                </p>
                            </div>
                        `;
                    } else {
                        const maxBet = Math.floor(credits / 10);
                        if (maxBet <= 0) {
                            bettingContainer.innerHTML = `
                                ${poolHtml}
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid #444; border-radius: 6px; padding: 12px; text-align: center; color:#94a3b8; font-size:0.85rem;">
                                    Mindestens 10 Credits benötigt für Wetten (Guthaben: ${credits}).
                                </div>
                            `;
                        } else {
                            bettingContainer.innerHTML = `
                                ${poolHtml}
                                <div style="background: rgba(255,255,255,0.05); border: 1px solid #333; border-radius: 6px; padding: 15px;">
                                    <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #ffd700; text-align: center;">Versus-Wette platzieren</h4>
                                    <div style="display: flex; flex-direction: column; gap: 10px;">
                                        <div style="display: flex; gap: 10px; align-items: center;">
                                            <span style="font-size: 0.85rem; color: #ccc; width: 80px;">Gewinner:</span>
                                            <select id="bet-target-select" style="flex: 1; padding: 6px; border-radius: 4px; background: #222; border: 1px solid #444; color: #fff;">
                                                ${lobby.players.map(p => `<option value="${p.uid}">${p.displayName}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div style="display: flex; gap: 10px; align-items: center;">
                                            <span style="font-size: 0.85rem; color: #ccc; width: 80px;">Einsatz:</span>
                                            <input type="number" id="bet-amount-input" min="1" max="${maxBet}" value="1" style="flex: 1; padding: 6px; border-radius: 4px; background: #222; border: 1px solid #444; color: #fff; text-align: center;">
                                            <span style="font-size: 0.75rem; color: #94a3b8;">(max. ${maxBet})</span>
                                        </div>
                                        <button id="submit-bet-btn" class="rank-btn" style="margin-top: 5px; font-size: 0.85rem; padding: 6px 12px;">Wette abgeben</button>
                                    </div>
                                </div>
                            `;
                            
                            const submitBetBtn = document.getElementById('submit-bet-btn');
                            if (submitBetBtn) {
                                submitBetBtn.onclick = async () => {
                                    const targetSelect = document.getElementById('bet-target-select');
                                    const amountInput = document.getElementById('bet-amount-input');
                                    if (!targetSelect || !amountInput) return;
                                    
                                    const targetUid = targetSelect.value;
                                    const targetPlayer = lobby.players.find(p => p.uid === targetUid);
                                    const targetName = targetPlayer ? targetPlayer.displayName : 'Unbekannt';
                                    const amount = parseInt(amountInput.value);
                                    
                                    if (isNaN(amount) || amount < 1 || amount > maxBet) {
                                        alert(`Ungültiger Wetteinsatz! Der Betrag muss zwischen 1 und ${maxBet} liegen.`);
                                        return;
                                    }
                                    
                                    submitBetBtn.disabled = true;
                                    submitBetBtn.textContent = 'Verarbeite...';
                                    
                                    try {
                                        await runTransaction(db, async (transaction) => {
                                            const userRef = doc(db, "users", user.uid);
                                            const userSnap = await transaction.get(userRef);
                                            if (!userSnap.exists()) throw new Error("Benutzer nicht gefunden.");
                                            
                                            const userData = userSnap.data();
                                            let currentCredits = userData.credits || 0;
                                            if (user.username === 'test1' || user.username === 'test2' || userData.role === 'admin') {
                                                currentCredits = Math.max(currentCredits, 1000);
                                            }
                                            if (currentCredits < amount) throw new Error("Nicht genügend Credits.");
                                            
                                            const lobbyRef = doc(db, "versus_lobbies", lobby.id);
                                            const lobbySnap = await transaction.get(lobbyRef);
                                            if (!lobbySnap.exists()) throw new Error("Lobby nicht gefunden.");
                                            
                                            const lobbyData = lobbySnap.data();
                                            if (lobbyData.status !== 'waiting') throw new Error("Wetten sind nur in der Wartephase erlaubt.");
                                            
                                            const existingBets = lobbyData.bets || [];
                                            if (existingBets.some(b => b.uid === user.uid)) {
                                                throw new Error("Du hast bereits eine Wette platziert.");
                                            }
                                            
                                            const finalCredits = (user.username === 'test1' || user.username === 'test2' || userData.role === 'admin')
                                                ? Math.max(0, (userData.credits || 0) - amount)
                                                : currentCredits - amount;
                                            
                                            transaction.update(userRef, { credits: finalCredits });
                                            
                                            existingBets.push({
                                                uid: user.uid,
                                                username: user.username,
                                                displayName: user.displayName || user.username,
                                                targetUid,
                                                targetName,
                                                amount
                                            });
                                            
                                            transaction.update(lobbyRef, {
                                                bets: existingBets,
                                                prizePool: (lobbyData.prizePool || 0) + amount
                                            });
                                        });
                                        
                                        alert("Wette erfolgreich abgegeben!");
                                    } catch(err) {
                                        alert("Wettfehler: " + err.message);
                                        submitBetBtn.disabled = false;
                                        submitBetBtn.textContent = 'Wette abgeben';
                                    }
                                };
                            }
                        }
                    }
                } catch(e) {
                    console.error("Bet UI load error:", e);
                }
            } else {
                const pool = lobby.prizePool || 0;
                bettingContainer.innerHTML = `
                    <div style="background: rgba(46, 213, 115, 0.1); border: 1px solid #2ed573; border-radius: 6px; padding: 10px; text-align: center; margin-bottom: 15px;">
                        <span style="color: #2ed573; font-weight: bold; font-size: 0.95rem;">💰 Spiel-Preispool: ${pool} Credits</span>
                    </div>
                `;
            }
        }
        
        if (lobby.status === 'playing') {
            const me = lobby.players.find(p => p.uid === user.uid);
            if (me && me.status !== 'finished') {
                if (!isPlayingVersus) {
                    isPlayingVersus = true;
                    // Game View starten!
                    document.getElementById('versus-content').classList.add('hidden');
                    document.getElementById('game-main-content').classList.remove('hidden');
                    
                    // Alle Nav-Buttons deaktivieren
                    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
                    
                    initGameVersus(lobby);
                }
            } else if (me && me.status === 'finished') {
                isPlayingVersus = false;
                // Warteraum anzeigen
                document.getElementById('game-main-content').classList.add('hidden');
                document.getElementById('versus-content').classList.remove('hidden');
                
                const allFinished = lobby.players.every(p => p.status === 'finished');
                
                if (!allFinished) {
                    // Manuelles Polling: Listener abbrechen um Reads zu sparen
                    if (lobbyUnsubscribe) {
                        lobbyUnsubscribe();
                        lobbyUnsubscribe = null;
                    }
                    
                    document.getElementById('versus-room-status').innerHTML = `
                        Du bist fertig! Lade die Lobby neu, sobald die anderen fertig sind.<br><br>
                        <button id="manual-refresh-versus-btn" class="rank-btn" style="height: auto; padding: 12px; font-size: 0.9rem;">Lobby aktualisieren</button>
                    `;
                    
                    setTimeout(() => {
                        const btn = document.getElementById('manual-refresh-versus-btn');
                        if (btn) {
                            btn.onclick = () => {
                                btn.textContent = "Prüfe...";
                                btn.disabled = true;
                                showWaitingRoom(lobbyId); // Neustart des Listeners für einen Check
                            };
                        }
                    }, 100);
                } else {
                    document.getElementById('versus-room-status').innerHTML = "Alle sind fertig! Werte Spiel aus...<br><br><div class='loader'></div>";
                }
                
                leaveBtn.classList.remove('hidden'); // Darf immer verlassen, falls Lobby hängt
            }
            
            // Überprüfen ob alle fertig sind
            const allFinished = lobby.players.every(p => p.status === 'finished');
            if (allFinished) {
                // Erlauben wir es JEDEM, der manuell refresht hat und alle fertig sieht.
                // Die Race-Condition wird innerhalb von evaluateVersusMatch abgefangen.
                await evaluateVersusMatch(lobbyId, lobby);
            }
        } else if (lobby.status === 'finished') {
            // Zeige Endbildschirm
            leaveBtn.classList.remove('hidden');
            leaveBtn.textContent = "Lobby verlassen";
            document.getElementById('game-main-content').classList.add('hidden');
            document.getElementById('versus-content').classList.remove('hidden');
            
            if (lobby.winners && lobby.winners.includes(user.uid) && !window.hasPlayedVersusWinSound) {
                window.hasPlayedVersusWinSound = true;
                if (window.playVersusVictorySound) window.playVersusVictorySound();
            }
            
            // Versus Titles Check
            const me = lobby.players.find(p => p.uid === user.uid);
            let newlyUnlocked = false;
            const titlesField = `unlocked_titles_${lobby.mode}`;
            const currentUnlocked = user[titlesField] || [];
            
            const { TITLES } = await import('./titles.js');
            const titles = TITLES[lobby.mode] || [];

            if (me && me.score === 0) {
                const perfectTitle = titles.find(t => t.condition?.type === 'special_versus_perfect');
                if (perfectTitle && !currentUnlocked.includes(perfectTitle.id)) {
                    currentUnlocked.push(perfectTitle.id); newlyUnlocked = true;
                    if (window.showUnlockNotification) window.showUnlockNotification('title', perfectTitle.name);
                }
            }

            if (lobby.players.length === 2) {
                const p1 = lobby.players[0].picks || [];
                const p2 = lobby.players[1].picks || [];
                if (p1.length === 5 && p2.length === 5) {
                    const isSame = p1.every((char, i) => char === p2[i]);
                    const isOpposite = p1.every((char, i) => char === p2[4 - i]);
                    
                    const matchTitle = titles.find(t => t.condition?.type === 'special_versus_match');
                    const oppTitle = titles.find(t => t.condition?.type === 'special_versus_opposite');
                    
                    if (isSame && matchTitle && !currentUnlocked.includes(matchTitle.id)) {
                        currentUnlocked.push(matchTitle.id); newlyUnlocked = true;
                        if (window.showUnlockNotification) window.showUnlockNotification('title', matchTitle.name);
                    }
                    if (isOpposite && oppTitle && !currentUnlocked.includes(oppTitle.id)) {
                        currentUnlocked.push(oppTitle.id); newlyUnlocked = true;
                        if (window.showUnlockNotification) window.showUnlockNotification('title', oppTitle.name);
                    }
                }
            }
            
            if (newlyUnlocked) {
                const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                user[titlesField] = currentUnlocked;
                updateDoc(doc(db, "users", user.uid), { [titlesField]: currentUnlocked }).catch(e=>console.log(e));
                localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
            }
            
            const readyCount = lobby.readyForRestart ? lobby.readyForRestart.length : 0;
            const isReady = lobby.readyForRestart && lobby.readyForRestart.includes(user.uid);
            
            document.getElementById('versus-room-status').innerHTML = `
                Spiel beendet! Siehe Historie.<br><br>
                <button id="restart-versus-btn" class="rank-btn" ${isReady ? 'disabled' : ''} style="height: auto; padding: 12px 24px; font-size: 0.9rem; margin: 10px auto; display: inline-block; width: auto; min-width: 200px; ${isReady ? 'opacity:0.5;' : ''}">
                    ${isReady ? `Warte auf andere... (${readyCount}/${lobby.players.length})` : 'Noch eine Runde'}
                </button>
            `;
            
            const restartBtn = document.getElementById('restart-versus-btn');
            if (restartBtn && !isReady) {
                restartBtn.onclick = async () => {
                    restartBtn.disabled = true;
                    restartBtn.textContent = "Bereit...";
                    try {
                        await runTransaction(db, async (transaction) => {
                            const snap = await transaction.get(doc(db, "versus_lobbies", lobbyId));
                            if (!snap.exists()) return;
                            const data = snap.data();
                            const readyList = data.readyForRestart || [];
                            if (!readyList.includes(user.uid)) {
                                readyList.push(user.uid);
                            }
                            
                            if (readyList.length >= data.players.length) {
                                // Alle bereit -> Neustart!
                                const { activeCharacterDatabase } = await import('./theme.js');
                                const { drawFromBag } = await import('./utils.js');
                                 let poolSource = activeCharacterDatabase;
                                if (data.mode === 'starwars') {
                                    if (data.category === 'vehicle') {
                                        poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('vehicle'));
                                    } else if (data.category === 'klon') {
                                        poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('klon') && !c.tags.includes('vehicle'));
                                    } else if (data.category === 'peak' || data.category === 'hardcore') {
                                        poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('peak') && !c.tags.includes('vehicle'));
                                    } else {
                                        // Expanded Universe ('normal'): alle Charaktere inklusive Fahrzeuge
                                        poolSource = activeCharacterDatabase;
                                    }
                                } else {
                                    poolSource = activeCharacterDatabase.filter(c => !c.tags || !c.tags.includes('vehicle'));
                                }
                                const suffix = !data.category || data.category === 'normal' ? '' : '_' + data.category;
                                const newChars = drawFromBag(poolSource, 5, 'bag_versus_' + data.mode + suffix).map(c => c.name);
                                
                                const resetPlayers = data.players.map(p => ({
                                    ...p, status: 'waiting', picks: [], score: 0
                                }));
                                
                                transaction.update(doc(db, "versus_lobbies", lobbyId), {
                                    status: 'waiting',
                                    readyForRestart: [],
                                    characters: newChars,
                                    players: resetPlayers,
                                    bets: [],
                                    prizePool: 0
                                });
                            } else {
                                transaction.update(doc(db, "versus_lobbies", lobbyId), {
                                    readyForRestart: readyList
                                });
                            }
                        });
                    } catch(e) { console.error(e); }
                };
            }
            
            // Result-Modal öffnen, falls es noch nicht geöffnet wurde (wir nutzen ein lokales flag)
            if (!window.versusModalOpenedForLobby || window.versusModalOpenedForLobby !== lobbyId) {
                window.versusModalOpenedForLobby = lobbyId;
                import('./history.js').then(module => {
                    const dummyGame = { ...lobby, mode: lobby.mode, type: 'versus', category: lobby.category || 'normal', timestamp: Timestamp.now() };
                    module.openVersusResultModal(dummyGame);
                });
            }
        }
    });
}

// Auswertung des Versus Matches
async function evaluateVersusMatch(lobbyId, localLobby) {
    // 0. Transaktions-Sperre: Verhindere, dass mehrere Clients gleichzeitig auswerten und hole frische Daten
    let freshLobby = null;
    try {
        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(doc(db, "versus_lobbies", lobbyId));
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.status === 'finished' || data.status === 'evaluating') return;
            
            transaction.update(doc(db, "versus_lobbies", lobbyId), { status: 'evaluating' });
            freshLobby = { id: snap.id, ...data };
        });
    } catch(e) { console.error("Lock error", e); }
    
    if (!freshLobby) return; // Ein anderer Spieler wertet bereits aus
    
    try {
        // 1. Hole das globale Scoreboard für den Modus
        const suffix = freshLobby.category === 'normal' || !freshLobby.category ? '' : '_' + freshLobby.category;
        const scoresRef = doc(db, "scores", `${freshLobby.mode}_classic${suffix}_global`);
        const scoresSnap = await getDoc(scoresRef);
        const globalScores = scoresSnap.exists() ? scoresSnap.data() : {};
        
        // 2. Erstelle ein "Perfektes" Ranking der 5 Charaktere
        const perfectRanking = [...freshLobby.characters].sort((a, b) => {
            const safeA = a.replace(/[\.\/\[\]~#]/g, '_');
            const safeB = b.replace(/[\.\/\[\]~#]/g, '_');
            const scoreA = globalScores.characters?.[safeA]?.score || 0;
            const scoreB = globalScores.characters?.[safeB]?.score || 0;
            return scoreB - scoreA; // Absteigend (meiste Punkte = Platz 1)
        });
        
        // Check if there are any global scores for these characters
        let totalPoints = 0;
        freshLobby.characters.forEach(c => {
            const safe = c.replace(/[\.\/\[\]~#]/g, '_');
            totalPoints += globalScores.characters?.[safe]?.score || 0;
        });

        let bestScore = Infinity;
        let winners = [];
        
        if (totalPoints === 0) {
            // No global scores yet, it's a tie for everyone
            freshLobby.players.forEach(player => {
                player.score = 0; // 0 Abweichung
                winners.push(player.uid);
            });
            // We won't increment win stats for 0-point unranked games
        } else {
            // Normal evaluation
            freshLobby.players.forEach(player => {
                let diffSum = 0;
                const picks = player.picks || [];
                // player.picks enthält die Namen in Reihenfolge von 1 bis 5
                for (let index = 0; index < 5; index++) {
                    const pickName = picks[index];
                    const playerRank = index + 1;
                    const perfectRank = pickName ? perfectRanking.indexOf(pickName) + 1 : 0;
                    if (perfectRank > 0) {
                        diffSum += Math.abs(playerRank - perfectRank);
                    } else {
                        diffSum += 5; // Maximaler Abstand/Strafe für fehlende Picks
                    }
                }
                player.score = diffSum;
                
                if (diffSum < bestScore) {
                    bestScore = diffSum;
                    winners = [player.uid];
                } else if (diffSum === bestScore) {
                    winners.push(player.uid);
                }
            });
            
            const hasTestUser = freshLobby.players.some(p => p.username === 'test1' || p.username === 'test2');
            
            if (!hasTestUser) {
                // 4. Update die Stats der Gewinner UND inkrementiere gamesPlayed für alle
                const playerPromises = freshLobby.players.map(async (player) => {
                    const uRef = doc(db, "users", player.uid);
                    const suffixWin = freshLobby.category === 'klon' ? '_klon' : '';
                    const winField = `versusWins_${freshLobby.mode}${suffixWin}`;
                    const gamesField = `gamesPlayed_${freshLobby.mode}`;
                    const uSnap = await getDoc(uRef);
                    if (uSnap.exists()) {
                        const userData = uSnap.data();
                        const updates = { [gamesField]: (userData[gamesField] || 0) + 1 };
                        
                        // Rivalitäten & Match-History
                        const opp = freshLobby.players.find(p => p.uid !== player.uid);
                        if (opp) {
                            const vsStats = userData.versusMatchups || {};
                            const oppName = opp.username;
                            if (!vsStats[oppName]) vsStats[oppName] = { wins: 0, losses: 0, draws: 0 };
                            
                            if (winners.includes(player.uid) && winners.includes(opp.uid)) {
                                vsStats[oppName].draws++;
                            } else if (winners.includes(player.uid)) {
                                vsStats[oppName].wins++;
                            } else {
                                vsStats[oppName].losses++;
                            }
                            updates.versusMatchups = vsStats;
                        }

                        if (winners.includes(player.uid)) {
                            updates[winField] = (userData[winField] || 0) + 1;
                        }
                        await updateDoc(uRef, updates);
                    }
                });
                await Promise.all(playerPromises);
            }
        }
        
        // Wetten-Auszahlung
        let betWinners = [];
        if (freshLobby.bets && freshLobby.bets.length > 0) {
            const totalPool = freshLobby.prizePool || 0;
            
            // Finde Spieler, die auf einen der Gewinner gesetzt haben
            const correctBettors = freshLobby.bets.filter(b => winners.includes(b.targetUid));
            
            if (correctBettors.length > 0) {
                const payoutPerBettor = Math.floor(totalPool / correctBettors.length);
                
                const payoutPromises = correctBettors.map(async (b) => {
                    const uRef = doc(db, "users", b.uid);
                    const uSnap = await getDoc(uRef);
                    if (uSnap.exists()) {
                        const userData = uSnap.data();
                        const newCredits = (userData.credits || 0) + payoutPerBettor;
                        await updateDoc(uRef, { credits: newCredits });
                    }
                });
                await Promise.all(payoutPromises);
                
                betWinners = correctBettors.map(b => ({
                    uid: b.uid,
                    displayName: b.displayName,
                    payout: payoutPerBettor
                }));
            } else {
                // Keine korrekten Wetten -> Rückerstattung
                const refundPromises = freshLobby.bets.map(async (b) => {
                    const uRef = doc(db, "users", b.uid);
                    const uSnap = await getDoc(uRef);
                    if (uSnap.exists()) {
                        const userData = uSnap.data();
                        const newCredits = (userData.credits || 0) + b.amount;
                        await updateDoc(uRef, { credits: newCredits });
                    }
                });
                await Promise.all(refundPromises);
            }
        }
        
        const hasTestUserGlobal = freshLobby.players.some(p => p.username === 'test1' || p.username === 'test2');
        if (!hasTestUserGlobal) {
            // 5. Speichere das Spiel in die History
            const historyData = {
                mode: freshLobby.mode,
                category: freshLobby.category || 'normal',
                type: 'versus',
                timestamp: Timestamp.now(),
                characters: freshLobby.characters,
                players: freshLobby.players,
                perfectRanking: perfectRanking,
                winners: winners,
                bets: freshLobby.bets || [],
                prizePool: freshLobby.prizePool || 0,
                betWinners: betWinners
            };
            await setDoc(doc(db, "history", `versus_${Date.now()}`), historyData);
        }
        
        // 6. Setze Lobby auf Finished und speichere die Results in der Lobby
        await updateDoc(doc(db, "versus_lobbies", lobbyId), {
            status: 'finished',
            players: freshLobby.players,
            perfectRanking: perfectRanking,
            winners: winners,
            bets: freshLobby.bets || [],
            prizePool: freshLobby.prizePool || 0,
            betWinners: betWinners
        });
    } catch(err) {
        console.error("Fehler bei versus-Auswertung:", err);
        // Fallback: Setze Lobby auf finished, damit es nicht blockiert bleibt
        await updateDoc(doc(db, "versus_lobbies", lobbyId), {
            status: 'finished',
            error: err.message
        });
    }
}

export async function sendVersusInvite(targetUser) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Create lobby if not in one
    if (!currentLobbyId) {
        await createVersusLobby();
        // Wait briefly for lobby creation to complete
        await new Promise(r => setTimeout(r, 1000));
    }
    
    if (!currentLobbyId) {
        alert("Fehler beim Erstellen der Lobby für die Einladung.");
        return;
    }
    
    // Add to versus_invites collection
    const inviteRef = collection(db, "versus_invites");
    await addDoc(inviteRef, {
        from: user.uid,
        fromName: user.displayName || user.username,
        to: targetUser.uid,
        lobbyId: currentLobbyId,
        mode: currentMode,
        timestamp: Timestamp.now(),
        status: 'pending'
    });
    
    alert(`Einladung an ${targetUser.displayName || targetUser.username} gesendet!`);
}

let inviteListenerUnsub = null;
export function initVersusInvitesListener() {
    const user = getCurrentUser();
    if (!user || user.role === 'admin' || user.isTestUser) return;
    
    if (inviteListenerUnsub) inviteListenerUnsub();
    
    const q = query(collection(db, "versus_invites"), where("to", "==", user.uid), where("status", "==", "pending"));
    inviteListenerUnsub = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const invite = change.doc.data();
                const id = change.doc.id;
                
                // Show a global toast notification
                showInviteToast(invite, id);
            }
        });
    });
}

function showInviteToast(invite, id) {
    const toast = document.createElement('div');
    toast.className = 'invite-toast';
    toast.style.cssText = 'position:fixed; top:20px; right:20px; background:#1e293b; border:2px solid #ff4757; color:#fff; padding:15px; border-radius:8px; z-index:9999; box-shadow:0 10px 25px rgba(0,0,0,0.5); width: 300px; animation: slideIn 0.3s ease-out;';
    toast.innerHTML = `
        <h4 style="margin:0 0 10px 0; color:#ff4757;">Versus Einladung!</h4>
        <p style="margin:0 0 15px 0; font-size:0.9rem;"><strong>${invite.fromName}</strong> fordert dich heraus!</p>
        <div style="display:flex; gap:10px;">
            <button class="rank-btn accept-btn" style="flex:1; padding:5px; font-size:0.8rem; background:#4cd137;">Annehmen</button>
            <button class="rank-btn decline-btn" style="flex:1; padding:5px; font-size:0.8rem; background:#353b48; border:1px solid #555;">Ablehnen</button>
        </div>
    `;
    document.body.appendChild(toast);
    
    toast.querySelector('.accept-btn').onclick = async () => {
        await updateDoc(doc(db, "versus_invites", id), { status: 'accepted' });
        document.body.removeChild(toast);
        
        // Go to versus tab
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const vsTab = document.querySelector('.nav-link[data-target="versus-content"]');
        if (vsTab) vsTab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        document.getElementById('versus-content').classList.remove('hidden');
        
        // Switch mode if needed
        if (currentMode !== invite.mode) {
            import('./theme.js').then(m => m.toggleTheme());
        }
        
        await initVersus();
        await joinVersusLobby(invite.lobbyId);
    };
    
    toast.querySelector('.decline-btn').onclick = async () => {
        await updateDoc(doc(db, "versus_invites", id), { status: 'declined' });
        document.body.removeChild(toast);
    };
    
    // Auto-remove after 30s
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
            updateDoc(doc(db, "versus_invites", id), { status: 'expired' }).catch(()=>{});
        }
    }, 30000);
}
