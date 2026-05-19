// admin.js
import { logout, getCurrentUser } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, onSnapshot, query, orderBy, Timestamp, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode, activeCharacterDatabase } from './theme.js';

let chatAdminUnsubscribe = null;
let listenersBound = false;

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
                    alert(`Globale Historie für ${currentMode} zurückgesetzt.`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler beim Zurücksetzen: ${e.message}`); }
            }
        });

        document.getElementById('admin-reset-global-scoreboard').addEventListener('click', async () => {
            if(confirm(`Bist du sicher? Alle Scoreboards im Modus ${currentMode} werden für das Frontend auf 0 gesetzt.`)) {
                const field = `globalScoreboardReset_${currentMode}`;
                const obj = {}; obj[field] = Timestamp.now();
                try {
                    const adminUid = getCurrentUser()?.uid;
                    if (!adminUid) throw new Error('Kein Admin eingeloggt.');
                    await updateDoc(doc(db, "users", adminUid), obj);
                    alert(`Globales Scoreboard für ${currentMode} zurückgesetzt.`);
                    refreshAdminPanel();
                } catch(e) { console.error(e); alert(`Fehler beim Zurücksetzen: ${e.message}`); }
            }
        });

        document.getElementById('admin-clear-chat-btn').addEventListener('click', async () => {
            if(confirm("Gesamten Chat löschen? Dies entfernt alle Nachrichten dauerhaft!")) {
                const snap = await getDocs(collection(db, "chat"));
                snap.forEach(d => deleteDoc(doc(db, "chat", d.id)));
                alert("Chat geleert!");
                refreshAdminPanel();
            }
        });
        listenersBound = true;
    }

    await refreshAdminPanel();
}

export async function refreshAdminPanel() {
    // Mode Indicator aktualisieren
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
    
    // 3. User laden
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        users.push(data);
    });
    
    // Globale Resets aus dem Admin User auslesen (suche nach role === 'admin')
    let globalHistReset = 0;
    let globalScoreReset = 0;
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
        if(adminUser[`globalHistoryReset_${currentMode}`]) globalHistReset = adminUser[`globalHistoryReset_${currentMode}`].seconds;
        if(adminUser[`globalScoreboardReset_${currentMode}`]) globalScoreReset = adminUser[`globalScoreboardReset_${currentMode}`].seconds;
    }

    // History für den aktuellen Modus abrufen
    let userHasHistory = {};
    let globalHasHistory = false;
    let globalHasScore = false;
    
    try {
        const qHist = query(collection(db, "history"), where("mode", "==", currentMode));
        const histSnap = await getDocs(qHist);
        
        histSnap.forEach(d => {
            const game = d.data();
            const gameSecs = game.timestamp ? game.timestamp.seconds : 0;
            const u = game.username;
            if(!userHasHistory[u]) userHasHistory[u] = [];
            userHasHistory[u].push(gameSecs);
        });
    } catch(e) {}

    users.sort((a,b) => a.username.localeCompare(b.username));
    const charNames = activeCharacterDatabase.map(c => c.name);

    userList.innerHTML = users.map(user => {
        // Discovery Status
        const discovered = user.discovered || [];
        const hasDiscovery = discovered.some(n => charNames.includes(n));
        const discColor = hasDiscovery ? '#ff4757' : '#2ed573';
        
        // History Status
        const personalHistReset = user[`historyResetAt_${currentMode}`] ? user[`historyResetAt_${currentMode}`].seconds : 0;
        const gamesHist = userHasHistory[user.username] || [];
        const hasActiveHist = gamesHist.some(s => s > globalHistReset && s > personalHistReset);
        const histColor = hasActiveHist ? '#ff4757' : '#2ed573';
        if(hasActiveHist) globalHasHistory = true;

        // Scoreboard Status
        const personalScoreReset = user[`scoreboardResetAt_${currentMode}`] ? user[`scoreboardResetAt_${currentMode}`].seconds : 0;
        const hasActiveScore = gamesHist.some(s => s > globalScoreReset && s > personalScoreReset);
        const scoreColor = hasActiveScore ? '#ff4757' : '#2ed573';
        if(hasActiveScore) globalHasScore = true;

        return `
        <div class="admin-user-card" style="flex-direction: column; align-items: flex-start; gap: 10px;">
            <div style="display:flex; justify-content: space-between; width: 100%;">
                <span><strong>${user.username}</strong> <span class="role-badge ${user.role}">${user.role}</span></span>
                ${user.role !== 'admin' ? `<button class="text-btn delete-user-btn" style="color:#ff4757;" data-id="${user.id}">Account löschen</button>` : ''}
            </div>
            ${user.role !== 'admin' ? `
            <div style="display:flex; gap: 5px; width: 100%;">
                <button class="rank-btn admin-user-action" data-action="discovery" data-id="${user.id}" style="height: auto; padding: 5px; flex:1; font-size: 0.7rem; background-color: ${discColor}; border-color: ${discColor}; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Discovery</button>
                <button class="rank-btn admin-user-action" data-action="history" data-id="${user.id}" style="height: auto; padding: 5px; flex:1; font-size: 0.7rem; background-color: ${histColor}; border-color: ${histColor}; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Historie</button>
                <button class="rank-btn admin-user-action" data-action="scoreboard" data-id="${user.id}" style="height: auto; padding: 5px; flex:1; font-size: 0.7rem; background-color: ${scoreColor}; border-color: ${scoreColor}; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Scoreboard</button>
            </div>
            ` : ''}
        </div>
        `;
    }).join('');

    // Global Buttons einfärben
    const btnHist = document.getElementById('admin-reset-global-history');
    btnHist.style.backgroundColor = globalHasHistory ? '#ff4757' : '#2ed573';
    btnHist.style.borderColor = globalHasHistory ? '#ff4757' : '#2ed573';
    
    const btnScore = document.getElementById('admin-reset-global-scoreboard');
    btnScore.style.backgroundColor = globalHasScore ? '#ff4757' : '#2ed573';
    btnScore.style.borderColor = globalHasScore ? '#ff4757' : '#2ed573';

    // Listener (gleiche wie vorher, aber modus-spezifisch)
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const uid = e.target.dataset.id;
            if (confirm(`Account wirklich komplett löschen?`)) {
                await deleteDoc(doc(db, "users", uid));
                renderUserList();
            }
        });
    });

    document.querySelectorAll('.admin-user-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const uid = e.target.dataset.id;
            const action = e.target.dataset.action;
            const userRef = doc(db, "users", uid);
            const userDoc = users.find(u => u.id === uid);
            
            if(action === 'discovery') {
                if(confirm(`Discovery (Achievements) für ${currentMode} löschen?`)) {
                    const oldDisc = userDoc.discovered || [];
                    const newDisc = oldDisc.filter(n => !charNames.includes(n));
                    await updateDoc(userRef, { discovered: newDisc });
                    refreshAdminPanel();
                }
            } else if (action === 'history') {
                if(confirm(`Persönliche Historie für ${currentMode} ausblenden?`)) {
                    const obj = {}; obj[`historyResetAt_${currentMode}`] = Timestamp.now();
                    await updateDoc(userRef, obj);
                    refreshAdminPanel();
                }
            } else if (action === 'scoreboard') {
                if(confirm(`Persönliches Scoreboard für ${currentMode} nullen?`)) {
                    const obj = {}; obj[`scoreboardResetAt_${currentMode}`] = Timestamp.now();
                    await updateDoc(userRef, obj);
                    refreshAdminPanel();
                }
            }
        });
    });
}

function initChatModeration() {
    const chatContainer = document.getElementById('admin-chat-list');
    const clearBtn = document.getElementById('admin-clear-chat-btn');
    
    if(chatAdminUnsubscribe) chatAdminUnsubscribe();
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"));
    
    chatAdminUnsubscribe = onSnapshot(qChat, (snapshot) => {
        if(!chatContainer) return;
        chatContainer.innerHTML = '';
        let count = 0;
        snapshot.forEach(d => {
            count++;
            const msg = d.data();
            const date = msg.timestamp ? msg.timestamp.toDate().toLocaleString('de-DE', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : '';
            
            chatContainer.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #222;">
                    <div style="font-size: 0.8rem; overflow:hidden;">
                        <span style="color:#888;">[${date}]</span> <strong>${msg.displayName}</strong>: ${msg.text}
                    </div>
                    <button class="text-btn delete-msg-btn" data-id="${d.id}" style="color:#ff4757; font-size:1.2rem; padding: 0 10px;">✕</button>
                </div>
            `;
        });

        if(count === 0) {
            chatContainer.innerHTML = '<p class="prompt-text" style="padding: 15px;">Chat ist leer.</p>';
            clearBtn.style.backgroundColor = '#2ed573';
            clearBtn.style.borderColor = '#2ed573';
        } else {
            clearBtn.style.backgroundColor = '#ff4757';
            clearBtn.style.borderColor = '#ff4757';
        }
        clearBtn.style.color = "white";

        document.querySelectorAll('.delete-msg-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await deleteDoc(doc(db, "chat", id));
            });
        });
    });
}