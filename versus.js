import { db } from './firebase-config.js';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, Timestamp, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser, refreshCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray } from './utils.js';
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
    document.getElementById('abort-versus-game-btn').onclick = () => {
        document.getElementById('abort-versus-game-btn').classList.add('hidden');
        leaveVersusLobby();
        window.location.reload(); // Force full reload to clear any hung state
    };

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
    
    // Generiere 5 Charaktere
    const chars = shuffleArray(activeCharacterDatabase).slice(0, 5).map(c => c.name);
    
    const lobbyId = "lobby_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    const activeAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
    
    const lobbyData = {
        mode: currentMode,
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
            document.getElementById('versus-waiting-room-view').classList.add('hidden');
            document.getElementById('versus-lobby-list-view').classList.remove('hidden');
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
    
    document.getElementById('versus-waiting-room-view').classList.add('hidden');
    document.getElementById('versus-lobby-list-view').classList.remove('hidden');
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
                document.getElementById('versus-room-status').innerHTML = "Du bist fertig! Warte auf die anderen Spieler...<br><br><div class='loader'></div>";
                leaveBtn.classList.remove('hidden'); // Darf immer verlassen, falls Lobby hängt
            }
            
            // Überprüfen ob alle fertig sind
            const allFinished = lobby.players.every(p => p.status === 'finished');
            if (allFinished) {
                // Der erste Spieler in der Liste übernimmt die Auswertung, falls Host buggy ist
                const evaluatorUid = lobby.players.length > 0 ? lobby.players[0].uid : null;
                if (user.uid === evaluatorUid) {
                    await evaluateVersusMatch(lobbyId, lobby);
                }
            }
        } else if (lobby.status === 'finished') {
            // Zeige Endbildschirm
            leaveBtn.classList.remove('hidden');
            leaveBtn.textContent = "Zurück zur Übersicht";
            document.getElementById('game-main-content').classList.add('hidden');
            document.getElementById('versus-content').classList.remove('hidden');
            document.getElementById('versus-room-status').innerHTML = "Spiel beendet! Siehe Historie.";
            
            // ODER wir zeigen direkt das Resultat-Modal.
            // ... (Hier rufen wir die Funktion auf, die in history.js das Modal öffnet)
            import('./history.js').then(module => {
                const dummyGame = { ...lobby, mode: lobby.mode, type: 'versus', timestamp: Timestamp.now() };
                module.openVersusResultModal(dummyGame);
            });
            
            leaveVersusLobby(); // Cleanup
        }
    });
}

// Auswertung des Versus Matches
async function evaluateVersusMatch(lobbyId, lobby) {
    // 1. Hole das globale Scoreboard für den Modus
    const scoresRef = doc(db, "scores", `${lobby.mode}_classic_global`);
    const scoresSnap = await getDoc(scoresRef);
    const globalScores = scoresSnap.exists() ? scoresSnap.data() : {};
    
    // 2. Erstelle ein "Perfektes" Ranking der 5 Charaktere
    const perfectRanking = [...lobby.characters].sort((a, b) => {
        const safeA = a.replace(/[\.\/\[\]~#]/g, '_');
        const safeB = b.replace(/[\.\/\[\]~#]/g, '_');
        const scoreA = globalScores.characters?.[safeA]?.score || 0;
        const scoreB = globalScores.characters?.[safeB]?.score || 0;
        return scoreB - scoreA; // Absteigend (meiste Punkte = Platz 1)
    });
    
    // Check if there are any global scores for these characters
    let totalPoints = 0;
    lobby.characters.forEach(c => {
        const safe = c.replace(/[\.\/\[\]~#]/g, '_');
        totalPoints += globalScores.characters?.[safe]?.score || 0;
    });

    let bestScore = Infinity;
    let winners = [];
    
    if (totalPoints === 0) {
        // No global scores yet, it's a tie for everyone
        lobby.players.forEach(player => {
            player.score = 0; // 0 Abweichung
            winners.push(player.uid);
        });
        // We won't increment win stats for 0-point unranked games
    } else {
        // Normal evaluation
        lobby.players.forEach(player => {
            let diffSum = 0;
            // player.picks enthält die Namen in Reihenfolge von 1 bis 5
            player.picks.forEach((pickName, index) => {
                const playerRank = index + 1;
                const perfectRank = perfectRanking.indexOf(pickName) + 1;
                diffSum += Math.abs(playerRank - perfectRank);
            });
            player.score = diffSum;
            
            if (diffSum < bestScore) {
                bestScore = diffSum;
                winners = [player.uid];
            } else if (diffSum === bestScore) {
                winners.push(player.uid);
            }
        });
        
        // 4. Update die Stats der Gewinner
        const winnerPromises = winners.map(async (winnerUid) => {
            const uRef = doc(db, "users", winnerUid);
            const winField = `versusWins_${lobby.mode}`;
            const uSnap = await getDoc(uRef);
            if (uSnap.exists()) {
                const data = uSnap.data();
                const wins = (data[winField] || 0) + 1;
                await updateDoc(uRef, { [winField]: wins });
            }
        });
        await Promise.all(winnerPromises);
    }
    
    // 5. Speichere das Spiel in die History
    const historyData = {
        mode: lobby.mode,
        type: 'versus',
        timestamp: Timestamp.now(),
        characters: lobby.characters,
        players: lobby.players,
        perfectRanking: perfectRanking,
        winners: winners
    };
    await setDoc(doc(db, "history", `versus_${Date.now()}`), historyData);
    
    // 6. Setze Lobby auf Finished und speichere die Results in der Lobby
    await updateDoc(doc(db, "versus_lobbies", lobbyId), {
        status: 'finished',
        players: lobby.players,
        perfectRanking: perfectRanking,
        winners: winners
    });
}
