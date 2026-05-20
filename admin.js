// admin.js
import { logout, getCurrentUser } from './auth.js';
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
                    const adminUid = getCurrentUser()?.uid;
                    if (!adminUid) throw new Error('Kein Admin eingeloggt.');
                    await updateDoc(doc(db, "users", adminUid), obj);
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
                    const adminUid = getCurrentUser()?.uid;
                    if (!adminUid) throw new Error('Kein Admin eingeloggt.');
                    await updateDoc(doc(db, "users", adminUid), obj);
                    
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
    
    // Alle User frisch laden (kein Cache hier, Admin braucht aktuelle Daten)
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = [];
    querySnapshot.forEach((d) => {
        const data = d.data();
        data.id = d.id;
        users.push(data);
    });
    
    allUsersCache = users; // Für die Action-Buttons cachen

    // Admin-User herausfiltern (Admin soll nicht in der Liste erscheinen)
    const normalUsers = users.filter(u => u.role !== 'admin');
    const adminUser = users.find(u => u.role === 'admin');

    // Globale Resets auslesen
    let globalHistReset = 0;
    let globalScoreReset = 0;
    if (adminUser) {
        if(adminUser[`globalHistoryReset_${currentMode}`]) globalHistReset = adminUser[`globalHistoryReset_${currentMode}`].seconds;
        if(adminUser[`globalScoreboardReset_${currentMode}`]) globalScoreReset = adminUser[`globalScoreboardReset_${currentMode}`].seconds;
    }

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
                const currentTitle = userDoc[titleField] || 'Kein Titel';
                if(confirm(`Aktiven Titel von '${userDoc.displayName || userDoc.username}' zurücksetzen?\nAktuell: ${currentTitle}`)) {
                    const obj = {}; obj[titleField] = '';
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
            
            chatContainer.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 10px; border-bottom: 1px solid #1a1f2e; gap: 8px;">
                    <div style="font-size: 0.8rem; overflow:hidden; flex:1; min-width:0;">
                        <span style="color:#555;">[${date}]</span>
                        ${modeTag} <strong style="color:#ccc;">${msg.displayName || msg.username}</strong>:
                        <span style="color:#aaa; word-break:break-word;">${msg.text}</span>
                    </div>
                    <button class="text-btn delete-msg-btn" data-id="${d.id}" style="color:#ff4757; font-size:1.1rem; padding:0 5px; flex-shrink:0;">✕</button>
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
    }, (err) => {
        console.error("Chat-Listener Fehler:", err);
        chatContainer.innerHTML = '<p class="prompt-text" style="color:#ff4757; padding:15px;">Fehler beim Laden des Chats.</p>';
    });
}