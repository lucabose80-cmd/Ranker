// admin.js
import { logout, getCurrentUser, updateUserProfile } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, onSnapshot, query, orderBy, limit, Timestamp, where, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';
import { currentMode } from './mode-state.js';
import { invalidateResetsCache } from './resets.js';
import { initAdminSuggestions } from './suggestions.js';

let chatAdminUnsubscribe = null;
let listenersBound = false;
let allUsersCache = []; // Cache der User für action-Buttons

function invalidateAllCaches() {
    invalidateResetsCache();
}

export function stopAdminPanel() {
    if(chatAdminUnsubscribe) chatAdminUnsubscribe();
    chatAdminUnsubscribe = null;
}

export async function initAdminPanel() {
    if(!listenersBound) {
        document.getElementById('admin-logout-btn').addEventListener('click', logout);
        
        document.getElementById('admin-reset-global-history').addEventListener('click', async () => {
            if(confirm(`Bist du sicher? Alle bisherigen Historien im Modus ${currentMode} werden für das Frontend unsichtbar.`)) {
                const field = `globalHistoryReset_${currentMode}`;
                const obj = {}; obj[field] = Timestamp.now();
                try {
                    // Schreib in config/resets anstatt in das Admin-Dokument (spart Reads)
                    await setDoc(doc(db, "config", "resets"), obj, { merge: true });
                    invalidateAllCaches();
                    alert(`Globale Historie für ${currentMode} zurückgesetzt.`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-global-scoreboard').addEventListener('click', async () => {
            if(confirm(`Bist du sicher? Alle Scoreboards im Modus ${currentMode} werden auf 0 gesetzt.\nDas löscht ALLE persönlichen und globalen Scoreboard-Einträge für ${currentMode}.`)) {
                const field = `globalScoreboardReset_${currentMode}`;
                const obj = {}; obj[field] = Timestamp.now();
                try {
                    await setDoc(doc(db, "config", "resets"), obj, { merge: true });
                    
                    // Globale Dokumente löschen
                    try { await deleteDoc(doc(db, "scores", `${currentMode}_classic_global`)); } catch(e) {}
                    try { await deleteDoc(doc(db, "scores", `${currentMode}_advanced_global`)); } catch(e) {}
                    
                    // Alle persönlichen Score-Dokumente löschen
                    const scoresSnap = await getDocs(collection(db, "scores"));
                    const deletes = [];
                    scoresSnap.forEach(d => {
                        if (d.id.startsWith(currentMode) && !d.id.endsWith('_global')) {
                            deletes.push(deleteDoc(doc(db, "scores", d.id)));
                        }
                    });
                    await Promise.all(deletes);
                    
                    invalidateAllCaches();
                    alert(`Globales Scoreboard für ${currentMode} vollständig zurückgesetzt (${deletes.length} persönliche Einträge gelöscht).`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-all-btn')?.addEventListener('click', async () => {
            if(confirm(`Bist du sicher? Das wird ALLE globalen und persönlichen Scoreboards sowie Historien für ${currentMode} komplett zurücksetzen.`)) {
                try {
                    const obj = {}; 
                    obj[`globalHistoryReset_${currentMode}`] = Timestamp.now();
                    obj[`globalScoreboardReset_${currentMode}`] = Timestamp.now();
                    await setDoc(doc(db, "config", "resets"), obj, { merge: true });


                    const scoresSnap = await getDocs(collection(db, "scores"));
                    const deletes = [];
                    scoresSnap.forEach(d => {
                        if (d.id.startsWith(currentMode)) {
                            deletes.push(deleteDoc(doc(db, "scores", d.id)));
                        }
                    });
                    await Promise.all(deletes);
                    
                    invalidateAllCaches();
                    alert(`ALLES für ${currentMode} vollständig zurückgesetzt.`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-mode-btn')?.addEventListener('click', async () => {
            const modeVal = document.getElementById('admin-reset-mode-select').value;
            if(confirm(`Bist du sicher? Alle Scoreboard-Einträge für den ausgewählten Spielmodus "${modeVal}" werden gelöscht.`)) {
                try {
                    const scoresSnap = await getDocs(collection(db, "scores"));
                    const deletes = [];
                    scoresSnap.forEach(d => {
                        if (d.id.startsWith(`${currentMode}_${modeVal}_`)) {
                            deletes.push(deleteDoc(doc(db, "scores", d.id)));
                        }
                    });
                    await Promise.all(deletes);
                    invalidateAllCaches();
                    alert(`Scoreboard für Spielmodus ${modeVal} zurückgesetzt.`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-player-btn')?.addEventListener('click', async () => {
            const playerVal = document.getElementById('admin-reset-player-select').value;
            const modeVal = document.getElementById('admin-reset-mode-select').value;
            
            if(!playerVal) { alert("Bitte wähle zuerst einen Spieler aus der Liste."); return; }
            
            if(confirm(`Bist du sicher? Der Spieler ${playerVal} wird aus dem Scoreboard für "${modeVal}" gelöscht.`)) {
                try {
                    await deleteDoc(doc(db, "scores", `${currentMode}_${modeVal}_${playerVal}`));
                    alert(`Spieler ${playerVal} wurde aus ${modeVal} gelöscht.`);
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });
        document.getElementById('admin-clear-chat-btn').addEventListener('click', async () => {
            if(confirm("Gesamten Chat löschen? Dies entfernt alle Nachrichten dauerhaft!")) {
                try {
                    const snap = await getDocs(query(collection(db, "chat"), limit(500)));
                    const deletes = [];
                    snap.forEach(d => deletes.push(deleteDoc(doc(db, "chat", d.id))));
                    await Promise.all(deletes);
                    alert("Chat geleert!");
                } catch(e) { console.error(e); alert(`Fehler: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-adventure-btn')?.addEventListener('click', async () => {
            if(confirm("⚔️ ABENTEUER-RESET\n\nDen Abenteuer-Fortschritt (Level & Deck) ALLER Spieler auf Level 1 zurücksetzen?\n\nDies ist nötig wenn sich die Level-Reihenfolge geändert hat.\nDie Spieler behalten ihre normalen Credits und Karten.")) {
                try {
                    const btn = document.getElementById('admin-reset-adventure-btn');
                    btn.textContent = "Wird zurückgesetzt...";
                    btn.disabled = true;

                    const snap = await getDocs(query(collection(db, "users"), limit(100)));
                    const updates = [];
                    let count = 0;
                    snap.forEach(d => {
                        const u = d.data();
                        if (u.username === 'admin') return;
                        updates.push(updateDoc(doc(db, "users", d.id), {
                            adventure_level: 1,
                            adventure_deck: null
                        }));
                        count++;
                    });
                    await Promise.all(updates);

                    btn.textContent = "⚔️ Abenteuer-Fortschritt ALLER zurücksetzen";
                    btn.disabled = false;
                    alert(`✅ Erledigt! ${count} Spieler wurden auf Level 1 zurückgesetzt.`);
                    await refreshAdminPanel();
                } catch(e) {
                    console.error(e);
                    document.getElementById('admin-reset-adventure-btn').disabled = false;
                    document.getElementById('admin-reset-adventure-btn').textContent = "⚔️ Abenteuer-Fortschritt ALLER zurücksetzen";
                    alert(`Fehler: ${e.message}`);
                }
            }
        });
        
        const maintBtn = document.getElementById('admin-maintenance-toggle');
        const maintBtns = document.querySelectorAll('.maint-btn');
        if (maintBtn) {
            getDoc(doc(db, "config", "maintenance")).then(docSnap => {
                const data = docSnap.exists() ? docSnap.data() : { active: false };
                const isMaint = data.active;
                maintBtn.textContent = isMaint ? 'Wartungsmodus (Komplette Seite) deaktivieren' : 'Wartungsmodus (Komplette Seite) aktivieren';
                maintBtn.style.color = isMaint ? '#2ed573' : '#ff9f43';
                maintBtn.style.borderColor = isMaint ? '#2ed573' : '#ff9f43';
                
                maintBtns.forEach(btn => {
                    const mode = btn.dataset.maint;
                    const isModeMaint = data[mode];
                    btn.textContent = isModeMaint ? `Wartung: ${mode.toUpperCase()} (Deaktivieren)` : `Wartung: ${mode.toUpperCase()}`;
                    btn.style.color = isModeMaint ? '#2ed573' : '#ff9f43';
                    btn.style.borderColor = isModeMaint ? '#2ed573' : '#ff9f43';
                });
            });
            
            maintBtn.addEventListener('click', async () => {
                try {
                    const docSnap = await getDoc(doc(db, "config", "maintenance"));
                    const data = docSnap.exists() ? docSnap.data() : {};
                    const currentStatus = data.active;
                    await setDoc(doc(db, "config", "maintenance"), { ...data, active: !currentStatus });
                    
                    maintBtn.textContent = !currentStatus ? 'Wartungsmodus (Komplette Seite) deaktivieren' : 'Wartungsmodus (Komplette Seite) aktivieren';
                    maintBtn.style.color = !currentStatus ? '#2ed573' : '#ff9f43';
                    maintBtn.style.borderColor = !currentStatus ? '#2ed573' : '#ff9f43';
                    alert(!currentStatus ? 'Wartungsmodus AKTIV. Spieler können sich nicht mehr einloggen.' : 'Wartungsmodus INAKTIV. Login wieder freigegeben.');
                } catch (e) {
                    console.error("Fehler beim Umschalten des Wartungsmodus", e);
                }
            });
            
            maintBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    try {
                        const mode = btn.dataset.maint;
                        const docSnap = await getDoc(doc(db, "config", "maintenance"));
                        const data = docSnap.exists() ? docSnap.data() : {};
                        const currentStatus = data[mode];
                        await setDoc(doc(db, "config", "maintenance"), { ...data, [mode]: !currentStatus });
                        
                        btn.textContent = !currentStatus ? `Wartung: ${mode.toUpperCase()} (Deaktivieren)` : `Wartung: ${mode.toUpperCase()}`;
                        btn.style.color = !currentStatus ? '#2ed573' : '#ff9f43';
                        btn.style.borderColor = !currentStatus ? '#2ed573' : '#ff9f43';
                        alert(!currentStatus ? `${mode.toUpperCase()} in Wartung!` : `${mode.toUpperCase()} Wartung beendet!`);
                    } catch (e) {
                        console.error("Fehler beim Umschalten des Wartungsmodus", e);
                    }
                });
            });
        }
        
        document.getElementById('admin-change-password-btn').addEventListener('click', async () => {
            const newPass = document.getElementById('admin-new-password').value;
            if (!newPass || newPass.trim() === '') {
                alert("Bitte ein gültiges Passwort eingeben.");
                return;
            }
            if (confirm("Möchtest du das Admin-Passwort wirklich ändern?")) {
                const res = await updateUserProfile(null, newPass, null, null, null);
                if (res !== false) {
                    alert("Admin-Passwort erfolgreich geändert!");
                    document.getElementById('admin-new-password').value = '';
                } else {
                    alert("Fehler beim Ändern des Passworts.");
                }
            }
        });
        
        const changePlayerBtn = document.getElementById('admin-change-player-password-btn');
        if (changePlayerBtn) {
            changePlayerBtn.addEventListener('click', async () => {
                const playerUid = document.getElementById('admin-player-password-select').value;
                const newPass = document.getElementById('admin-player-new-password').value;
                if (!playerUid) { alert("Bitte wähle zuerst einen Spieler aus."); return; }
                if (!newPass || newPass.trim() === '') { alert("Bitte ein gültiges Passwort eingeben."); return; }
                
                if (confirm("Möchtest du das Passwort dieses Spielers wirklich ändern?")) {
                    try {
                        const { getAuth, updatePassword } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");
                        const { doc, updateDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                        
                        // We must store it or update it. But wait, updatePassword only works for the CURRENT logged-in user.
                        // Admin cannot update another user's auth password directly using the client SDK.
                        // We need a workaround or we store the password in firestore for plain auth if we use our own auth?
                        // Wait, auth.js does manual auth:
                        // `const snap = await getDoc(doc(db, "users", ...));`
                        // Yes! auth.js just checks password field in firestore!
                        await updateDoc(doc(db, "users", playerUid), {
                            password: newPass
                        });
                        alert("Spieler-Passwort erfolgreich geändert!");
                        document.getElementById('admin-player-new-password').value = '';
                    } catch(e) {
                        alert("Fehler beim Ändern des Passworts: " + e.message);
                    }
                }
            });
        }
        
        document.getElementById('admin-test-sound-1').addEventListener('click', () => {
            if (window.playStarWars8BitTheme) {
                window.playStarWars8BitTheme();
            } else {
                alert("Sound-Funktion noch nicht geladen.");
            }
        });
        
        // --- Mailbox / Systemnachricht senden ---
        const sendMailBtn = document.getElementById('admin-send-mail-btn');
        if (sendMailBtn) {
            sendMailBtn.addEventListener('click', async () => {
                const playerUid = document.getElementById('admin-mail-player-select').value;
                const title = document.getElementById('admin-mail-title').value.trim();
                const text = document.getElementById('admin-mail-text').value.trim();
                const credits = parseInt(document.getElementById('admin-mail-credits').value) || 0;
                
                if (!playerUid) { alert("Bitte einen Spieler auswählen."); return; }
                if (!title) { alert("Bitte einen Titel eingeben."); return; }
                if (!text && credits <= 0) { alert("Bitte eine Nachricht oder Credits eingeben."); return; }
                
                if (confirm(`Möchtest du diese Nachricht an ${playerUid === 'all' ? 'ALLE SPIELER' : 'den ausgewählten Spieler'} senden?`)) {
                    sendMailBtn.disabled = true;
                    sendMailBtn.textContent = "Wird gesendet...";
                    try {
                        const { doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                        
                        const newMsg = {
                            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            title: title,
                            text: text,
                            credits: credits,
                            timestamp: Date.now(),
                            claimed: false
                        };
                        
                        if (playerUid === 'all') {
                            // Sende an alle (im Cache)
                            let promises = [];
                            allUsersCache.filter(u => u.username !== 'admin').forEach(u => {
                                const userRef = doc(db, "users", u.id);
                                const currentMailbox = u.mailbox || [];
                                currentMailbox.push(newMsg);
                                promises.push(updateDoc(userRef, { mailbox: currentMailbox }));
                            });
                            await Promise.all(promises);
                            alert(`Nachricht erfolgreich an ${promises.length} Spieler gesendet!`);
                        } else {
                            const userRef = doc(db, "users", playerUid);
                            const userSnap = await getDoc(userRef);
                            
                            if (!userSnap.exists()) {
                                alert("Spieler nicht gefunden.");
                                sendMailBtn.disabled = false;
                                sendMailBtn.textContent = "Nachricht senden";
                                return;
                            }
                            
                            const userData = userSnap.data();
                            const currentMailbox = userData.mailbox || [];
                            currentMailbox.push(newMsg);
                            
                            await updateDoc(userRef, { mailbox: currentMailbox });
                            alert("Nachricht erfolgreich gesendet!");
                        }
                        
                        document.getElementById('admin-mail-title').value = '';
                        document.getElementById('admin-mail-text').value = '';
                        document.getElementById('admin-mail-credits').value = '0';
                    } catch(e) {
                        alert("Fehler beim Senden der Nachricht: " + e.message);
                    }
                    sendMailBtn.disabled = false;
                    sendMailBtn.textContent = "Nachricht senden";
                }
            });
        }

        listenersBound = true;
    }

    await refreshAdminPanel();
    initAdminSuggestions();
}

export async function refreshAdminPanel() {
    const modeInd = document.getElementById('admin-mode-indicator');
    if(modeInd) {
        modeInd.textContent = currentMode === 'starwars' ? 'Modus: Star Wars' : 'Modus: Anime';
        modeInd.style.color = currentMode === 'starwars' ? '#3b82f6' : '#ff2a9d';
        modeInd.style.background = '#2a3142';
    }

    await renderUserList();
    initChatModeration();
}

async function renderUserList() {
    const userList = document.getElementById('admin-user-list');
    if(!userList) return;
    userList.innerHTML = '<p class="prompt-text" style="padding:10px;">Lade Benutzer...</p>';
    
    // Begrenzung auf 100 User, um Reads zu sparen. (Paginierung wäre besser, aber dies schützt vor Extremkosten)
    const querySnapshot = await getDocs(query(collection(db, "users"), limit(100)));
    let users = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    
    allUsersCache = users; // Für die Action-Buttons cachen

    // Haupt-Admin aus der Liste filtern (bleibt versteckt)
    const normalUsers = users.filter(u => u.username !== 'admin');
    const adminUser = users.find(u => u.username === 'admin');

    const playerSelect = document.getElementById('admin-reset-player-select');
    const pwPlayerSelect = document.getElementById('admin-player-password-select');
    const mailPlayerSelect = document.getElementById('admin-mail-player-select');
    
    if (playerSelect) {
        playerSelect.innerHTML = '<option value="">Wähle Spieler...</option>';
        normalUsers.forEach(u => {
            playerSelect.innerHTML += `<option value="${u.username}">${u.displayName || u.username}</option>`;
        });
    }
    if (pwPlayerSelect) {
        pwPlayerSelect.innerHTML = '<option value="">Wähle Spieler...</option>';
        normalUsers.forEach(u => {
            pwPlayerSelect.innerHTML += `<option value="${u.uid}">${u.displayName || u.username}</option>`;
        });
    }
    if (mailPlayerSelect) {
        mailPlayerSelect.innerHTML = '<option value="">Wähle Spieler...</option>';
        mailPlayerSelect.innerHTML += '<option value="all" style="color:#ff4757; font-weight:bold;">** ALLEN SPIELERN **</option>';
        normalUsers.forEach(u => {
            mailPlayerSelect.innerHTML += `<option value="${u.uid}">${u.displayName || u.username} (${u.username})</option>`;
        });
    }

    // Globale Resets auslesen
    let globalHistReset = 0;
    let globalScoreReset = 0;
    try {
        const configSnap = await getDoc(doc(db, "config", "resets"));
        if (configSnap.exists()) {
            const data = configSnap.data();
            if(data[`globalHistoryReset_${currentMode}`]) globalHistReset = data[`globalHistoryReset_${currentMode}`].seconds;
            if(data[`globalScoreboardReset_${currentMode}`]) globalScoreReset = data[`globalScoreboardReset_${currentMode}`].seconds;
        }
    } catch (e) { console.warn(e); }

    // History für den aktuellen Modus abrufen
    let userHasHistory = {};
    let globalHasHistory = false;
    let globalHasScore = false;
    
    try {
        const qHist = query(collection(db, "history"), where("mode", "==", currentMode), limit(1000));
        const histSnap = await getDocs(qHist);
        histSnap.forEach(d => {
            const game = d.data();
            const gameSecs = game.timestamp ? game.timestamp.seconds : 0;
            const u = game.username;
            if(!userHasHistory[u]) userHasHistory[u] = [];
            userHasHistory[u].push(gameSecs);
        });
    } catch(e) { console.error("History-Ladefehler:", e); }

    normalUsers.sort((a,b) => a.username.localeCompare(b.username));
    const charNames = activeCharacterDatabase.map(c => c.name);

    if (normalUsers.length === 0) {
        userList.innerHTML = '<p class="prompt-text" style="padding:10px;">Keine normalen Benutzer gefunden.</p>';
    } else {
        userList.innerHTML = normalUsers.map(user => {
            // Discovery Status – GRÜN = hat Discovery (kann resetten), GRAU = leer
            const discovered = user.discovered || [];
            const hasDiscovery = discovered.some(n => charNames.includes(n));
            const discColor = hasDiscovery ? '#2ed573' : '#444';
            
            // History Status
            const personalHistReset = user[`historyResetAt_${currentMode}`] ? user[`historyResetAt_${currentMode}`].seconds : 0;
            const gamesHist = userHasHistory[user.username] || [];
            const hasActiveHist = gamesHist.some(s => s > globalHistReset && s > personalHistReset);
            const histColor = hasActiveHist ? '#2ed573' : '#444';
            if(hasActiveHist) globalHasHistory = true;

            // Scoreboard Status
            const personalScoreReset = user[`scoreboardResetAt_${currentMode}`] ? user[`scoreboardResetAt_${currentMode}`].seconds : 0;
            const hasActiveScore = gamesHist.some(s => s > globalScoreReset && s > personalScoreReset);
            const scoreColor = hasActiveScore ? '#2ed573' : '#444';
            if(hasActiveScore) globalHasScore = true;

            // Title & Theme Status – GRÜN = hat aktiven Wert, GRAU = leer
            const titleField = currentMode === 'starwars' ? 'activeTitle_starwars' : 'activeTitle_waifu';
            const themeField = currentMode === 'starwars' ? 'activeTheme_starwars' : 'activeTheme_waifu';
            const hasTitle = user[titleField] && user[titleField] !== '';
            const hasTheme = user[themeField] && user[themeField] !== '';
            const titleColor = hasTitle ? '#2ed573' : '#444';
            const themeColor = hasTheme ? '#2ed573' : '#444';

            return `
            <div class="admin-user-card" style="flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 10px;">
                <div style="display:flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <strong>${user.displayName || user.username}</strong>
                        <span style="color:#888; font-size:0.8rem; margin-left:5px;">(${user.username})</span>
                        ${user[`gamesPlayed_${currentMode}`] ? `<span style="color:#ffd700; font-size:0.75rem; margin-left:5px;">🎮 ${user[`gamesPlayed_${currentMode}`]}</span>` : ''}
                    </div>
                    <button class="text-btn delete-user-btn" style="color:#ff4757; white-space:nowrap;" data-id="${user.id}">Account löschen</button>
                </div>
                <div style="display:flex; gap: 5px; width: 100%; flex-wrap: wrap;">
                    <button class="rank-btn admin-user-action" data-action="discovery" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:70px; background-color:${discColor}; border-color:${discColor}; color:white;">🔍 Discovery</button>
                    <button class="rank-btn admin-user-action" data-action="history" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:70px; background-color:${histColor}; border-color:${histColor}; color:white;">📜 Historie</button>
                    <button class="rank-btn admin-user-action" data-action="scoreboard" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:70px; background-color:${scoreColor}; border-color:${scoreColor}; color:white;">🏆 Scoreboard</button>
                    <button class="rank-btn admin-user-action" data-action="title" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:60px; background-color:${titleColor}; border-color:${titleColor}; color:white;">🏅 Titel</button>
                    <button class="rank-btn admin-user-action" data-action="theme" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:80px; background-color:${themeColor}; border-color:${themeColor}; color:white;">🎨 Farbschema</button>
                    <button class="rank-btn admin-user-action" data-action="starwarsdle" data-id="${user.id}" style="height:auto; padding:5px 8px; flex:1; font-size:0.7rem; min-width:80px; background-color:#444; border-color:#444; color:white;">✨ Starwarsdle</button>
                </div>
            </div>
            `;
        }).join('');
    }

    // Global Buttons – GRÜN = gibt etwas zum Resetten, GRAU = bereits clean
    const btnHist = document.getElementById('admin-reset-global-history');
    if (btnHist) {
        btnHist.style.backgroundColor = globalHasHistory ? '#2ed573' : '#444';
        btnHist.style.borderColor = globalHasHistory ? '#2ed573' : '#444';
        btnHist.style.color = 'white';
    }
    const btnScore = document.getElementById('admin-reset-global-scoreboard');
    if (btnScore) {
        btnScore.style.backgroundColor = globalHasScore ? '#2ed573' : '#444';
        btnScore.style.borderColor = globalHasScore ? '#2ed573' : '#444';
        btnScore.style.color = 'white';
    }

    // Event Listener für User-Buttons
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const uid = e.target.closest('[data-id]').dataset.id || e.target.dataset.id;
            if (confirm(`Account wirklich komplett löschen?`)) {
                await deleteDoc(doc(db, "users", uid));
                invalidateAllCaches();
                renderUserList();
            }
        });
    });

    document.querySelectorAll('.admin-user-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const clickedBtn = e.target.closest('.admin-user-action');
            const uid = clickedBtn.dataset.id;
            const action = clickedBtn.dataset.action;
            const userRef = doc(db, "users", uid);
            const userDoc = allUsersCache.find(u => u.id === uid);
            if (!userDoc) { alert("Benutzer nicht gefunden."); return; }
            
            if(action === 'starwarsdle') {
                if(confirm(`StarWarsdle Scores für ${userDoc.displayName || userDoc.username} löschen?`)) {
                    const qDle = query(collection(db, 'starwarsdle_scores'), where('username', 'in', [userDoc.username, userDoc.displayName || userDoc.username]));
                    const snap = await getDocs(qDle);
                    let promises = [];
                    snap.forEach(d => promises.push(deleteDoc(d.ref)));
                    await Promise.all(promises);
                    await updateDoc(userRef, { 
                        starwarsdleGuesses: [],
                        starwarsdleWon: false,
                        starwarsdleDate: ""
                    });
                    alert('StarWarsdle Scores gelöscht.');
                    await refreshAdminPanel();
                }
            }
            if(action === 'discovery') {
                if(confirm(`Discovery für ${userDoc.displayName || userDoc.username} in ${currentMode} löschen?`)) {
                    const oldDisc = userDoc.discovered || [];
                    const newDisc = oldDisc.filter(n => !charNames.includes(n));
                    // discoveryResetAt setzt einen Timestamp, den der Client beim nächsten Spiel prüft
                    await updateDoc(userRef, { 
                        discovered: newDisc, 
                        newlyDiscovered: [],
                        discoveryResetAt: Timestamp.now()
                    });
                    invalidateAllCaches();
                    renderUserList();
                }
            } else if (action === 'history') {
                if(confirm(`Persönliche Historie für ${userDoc.displayName || userDoc.username} in ${currentMode} ausblenden?`)) {
                    const obj = {}; obj[`historyResetAt_${currentMode}`] = Timestamp.now();
                    await updateDoc(userRef, obj);
                    invalidateAllCaches();
                    renderUserList();
                }
            } else if (action === 'scoreboard') {
                if(confirm(`Persönliches Scoreboard für ${userDoc.displayName || userDoc.username} in ${currentMode} nullen?`)) {
                    const obj = {}; obj[`scoreboardResetAt_${currentMode}`] = Timestamp.now();
                    await updateDoc(userRef, obj);
                    try {
                        await deleteDoc(doc(db, "scores", `${currentMode}_classic_${userDoc.username}`));
                        await deleteDoc(doc(db, "scores", `${currentMode}_advanced_${userDoc.username}`));
                    } catch(e) { console.warn("Score-Dokument nicht gefunden:", e); }
                    invalidateAllCaches();
                    renderUserList();
                }
            } else if (action === 'title') {
                const titleField = currentMode === 'starwars' ? 'activeTitle_starwars' : 'activeTitle_waifu';
                const gamesField = currentMode === 'starwars' ? 'gamesPlayed_starwars' : 'gamesPlayed_waifu';
                const currentTitle = userDoc[titleField] || 'Kein Titel';
                if(confirm(`Aktiven Titel UND Spiele-Counter von '${userDoc.displayName || userDoc.username}' zurücksetzen?\nAktuell: ${currentTitle} (${userDoc[gamesField] || 0} Spiele)`)) {
                    const obj = {}; 
                    obj[titleField] = '';
                    obj[gamesField] = 0;
                    await updateDoc(userRef, obj);
                    renderUserList();
                }
            } else if (action === 'theme') {
                const themeField = currentMode === 'starwars' ? 'activeTheme_starwars' : 'activeTheme_waifu';
                const currentTheme = userDoc[themeField] || 'Standard';
                if(confirm(`Farbschema + Freischaltungen von '${userDoc.displayName || userDoc.username}' in ${currentMode} zurücksetzen?\nAktuell: ${currentTheme}`)) {
                    const obj = { [themeField]: '' };
                    // Auch die freigeschalteten Themes zurücksetzen (neue Logik: unlocked_themes_starwars)
                    if (currentMode === 'starwars') {
                        obj.unlocked_themes_starwars = [];
                    } else {
                        obj.unlocked_themes_waifu = [];
                    }
                    await updateDoc(userRef, obj);
                    renderUserList();
                }
            }
        });
    });
}

function initChatModeration() {
    const chatContainer = document.getElementById('admin-chat-list');
    const clearBtn = document.getElementById('admin-clear-chat-btn');
    if (!chatContainer) return;
    
    if(chatAdminUnsubscribe) chatAdminUnsubscribe();
    
    // Mehr Nachrichten laden + ohne orderBy Limit-Problem
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(200));
    
    chatAdminUnsubscribe = onSnapshot(qChat, (snapshot) => {
        chatContainer.innerHTML = '';
        let count = 0;

        snapshot.forEach(d => {
            count++;
            const msg = d.data();
            const date = msg.timestamp
                ? msg.timestamp.toDate().toLocaleString('de-DE', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})
                : '?';
            const modeTag = msg.userMode === 'starwars' ? '🌌' : '🌸';
            
            const reactions = msg.reactions || {};
            let reactionAdminHtml = '';
            Object.entries(reactions).forEach(([emoji, list]) => {
                if (list && list.length > 0) {
                    reactionAdminHtml += `
                        <span style="display:inline-flex; align-items:center; background:#222; border:1px solid #444; border-radius:3px; padding:1px 4px; font-size:0.75rem; margin-right:4px;">
                            <span>${emoji} (${list.length})</span>
                            <span class="delete-reaction-btn" data-id="${d.id}" data-emoji="${emoji}" style="color:#ff4757; margin-left:4px; cursor:pointer; font-weight:bold;">✕</span>
                        </span>
                    `;
                }
            });
            
            chatContainer.innerHTML += `
                <div style="display:flex; flex-direction:column; padding: 8px 10px; border-bottom: 1px solid #1a1f2e; gap: 4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap: 8px;">
                        <div style="font-size: 0.8rem; overflow:hidden; flex:1; min-width:0;">
                            <span style="color:#555;">[${date}]</span>
                            ${modeTag} <strong style="color:#ccc;">${msg.displayName || msg.username}</strong>:
                            <span style="color:#aaa; word-break:break-word;">${msg.text}</span>
                        </div>
                        <button class="text-btn delete-msg-btn" data-id="${d.id}" style="color:#ff4757; font-size:1.1rem; padding:0 5px; flex-shrink:0;">✕</button>
                    </div>
                    ${reactionAdminHtml ? `<div style="display:flex; flex-wrap:wrap; margin-top:2px;">${reactionAdminHtml}</div>` : ''}
                </div>
            `;
        });

        if(count === 0) {
            chatContainer.innerHTML = '<p class="prompt-text" style="padding: 15px; text-align:center;">Chat ist leer. ✅</p>';
            if (clearBtn) { clearBtn.style.backgroundColor = '#2ed573'; clearBtn.style.borderColor = '#2ed573'; }
        } else {
            if (clearBtn) { clearBtn.style.backgroundColor = '#ff4757'; clearBtn.style.borderColor = '#ff4757'; }
        }
        if (clearBtn) clearBtn.style.color = "white";

        document.querySelectorAll('.delete-msg-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.closest('[data-id]').dataset.id || e.target.dataset.id;
                await deleteDoc(doc(db, "chat", id));
            });
        });

        document.querySelectorAll('.delete-reaction-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const emoji = btn.dataset.emoji;
                if(confirm(`Reaktionen für ${emoji} auf dieser Nachricht wirklich löschen?`)) {
                    const msgRef = doc(db, "chat", id);
                    const updateObj = {};
                    updateObj[`reactions.${emoji}`] = [];
                    await updateDoc(msgRef, updateObj);
                }
            });
        });
    }, (err) => {
        console.error("Chat-Listener Fehler:", err);
        chatContainer.innerHTML = '<p class="prompt-text" style="color:#ff4757; padding:15px;">Fehler beim Laden des Chats.</p>';
    });
}

