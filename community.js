// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp, getDocs, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { trackRead, trackWrite } from './tracker.js';

let chatUnsubscribe = null;
let onlineInterval = null;
let allUsersCache = [];

export function stopCommunity() {
    if(chatUnsubscribe) chatUnsubscribe();
    if(onlineInterval) clearInterval(onlineInterval);
    chatUnsubscribe = null;
    onlineInterval = null;
    allUsersCache = [];
}

export function initCommunity() {
    const user = getCurrentUser();
    if(!user) return;

    // 1. Live Chat
    const chatContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if(chatUnsubscribe) chatUnsubscribe();
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(25));
    
    let isFirstLoad = true;

    chatUnsubscribe = onSnapshot(qChat, (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        messages.reverse();
        
        chatContainer.innerHTML = '';
        let hasNewFromOthers = false;

        messages.forEach(msg => {
            const isSelf = msg.username === user.username;
            if (!isSelf && !isFirstLoad) hasNewFromOthers = true;
            
            // Berechne Modus-Tag Text und Klasse
            const modeText = msg.userMode === 'starwars' ? 'SW' : 'Anime';
            const modeClass = msg.userMode === 'starwars' ? 'tag-sw' : 'tag-anime';
            const avatarHtml = msg.avatar ? `<img src="${msg.avatar}">` : `<div class="mini-avatar" style="background:#444"></div>`;
            const titleHtml = msg.title && msg.title !== 'Kein Titel' ? `<span style="font-size:0.6rem; color:#ffd700; font-weight:bold; margin-left:5px; text-transform:uppercase;">${msg.title}</span>` : '';
            
            chatContainer.innerHTML += `
                <div class="chat-msg ${isSelf ? 'self' : ''}">
                    ${avatarHtml}
                    <div class="chat-msg-body">
                        <span class="chat-username">
                            <span class="chat-mode-tag ${modeClass}">${modeText}</span> ${msg.displayName} ${titleHtml}
                        </span>
                        <div class="chat-msg-content">${msg.text}</div>
                    </div>
                </div>
            `;
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (hasNewFromOthers) {
            const chatWidget = document.getElementById('chat-widget');
            if (chatWidget && chatWidget.classList.contains('hidden')) {
                const btn = document.getElementById('chat-toggle-btn');
                if (btn) btn.classList.add('has-new');
            }
        }
        
        isFirstLoad = false;
    });

    const sendMessage = async () => {
        const text = input.value.trim();
        if(!text) return;
        input.value = '';
        
        // Dynamisch den zur Laufzeit aktuellen Avatar für die Nachricht wählen
        const activeAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
        
        try {
            await addDoc(collection(db, "chat"), {
                username: user.username,
                displayName: user.displayName,
                avatar: activeAvatar || '',
                userMode: currentMode, // Welches Game der Schreiber gerade offen hat
                title: currentMode === 'starwars' ? (user.activeTitle_starwars || '') : (user.activeTitle_waifu || ''),
                text: text,
                timestamp: Timestamp.now()
            });
            trackWrite(1);
        } catch(e) {}
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

    // 2. Online Tracker – initiale Nutzerliste einmal laden, danach nur aktive User nachladen
    if(onlineInterval) clearInterval(onlineInterval);
    
    const updateOnlineTracker = async () => {
        const onlineList = document.getElementById('online-users-list');
        if(!onlineList) return;
        
        try {
            const now = Date.now();
            const SIX_MIN = 360000;
            const activeSince = Timestamp.fromDate(new Date(now - SIX_MIN));

            if (allUsersCache.length === 0) {
                const allUsersSnap = await getDocs(query(collection(db, "users"), limit(100)));
                trackRead(allUsersSnap.size);

                allUsersCache = [];
                allUsersSnap.forEach(docSnap => {
                    const u = docSnap.data();
                    if (u.role === 'admin') return;
                    allUsersCache.push({ ...u, username: docSnap.id, _isOnline: false });
                });
            }

            const activeUsersSnap = await getDocs(query(collection(db, "users"), where("lastActive", ">", activeSince), limit(100)));
            trackRead(activeUsersSnap.size);

            const activeUsers = new Set();
            activeUsersSnap.forEach(docSnap => {
                const u = docSnap.data();
                if (u.role === 'admin') return;
                activeUsers.add(docSnap.id);

                const existingIndex = allUsersCache.findIndex(item => item.username === docSnap.id);
                if (existingIndex >= 0) {
                    allUsersCache[existingIndex] = { ...allUsersCache[existingIndex], ...u, username: docSnap.id };
                } else {
                    allUsersCache.push({ ...u, username: docSnap.id, _isOnline: false });
                }
            });

            let onlineCount = 0;
            const allUsers = allUsersCache.map(u => {
                const isOnline = activeUsers.has(u.username);
                if (isOnline) onlineCount++;
                return { ...u, _isOnline: isOnline };
            });

            // Online zuerst, dann alphabetisch
            allUsers.sort((a, b) => {
                if (a._isOnline && !b._isOnline) return -1;
                if (!a._isOnline && b._isOnline) return 1;
                return (a.displayName || a.username).localeCompare(b.displayName || b.username);
            });

            onlineList.innerHTML = '';

            // Aktuellen User immer ganz oben (immer online)
            const uMode = currentMode;
            const userAvatar = uMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
            const avatarHtml = userAvatar ? `<img src="${userAvatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
            const modeText = uMode === 'starwars' ? 'SW' : 'Anime';
            const modeClass = uMode === 'starwars' ? 'tag-sw' : 'tag-anime';
            const activeTitle = uMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
            const titleHtml = activeTitle && activeTitle !== 'Kein Titel'
                ? `<span style="font-size:0.6rem; color:#ffd700; font-weight:bold; margin-left:4px; text-transform:uppercase;">${activeTitle}</span>` : '';

            onlineList.innerHTML += `
                <div class="online-user-card">
                    <div class="online-indicator"></div>
                    ${avatarHtml}
                    <strong>${user.displayName || user.username} (Du)${titleHtml}</strong>
                    <span class="chat-mode-tag ${modeClass}" style="margin-left:auto; flex-shrink:0;">${modeText}</span>
                </div>
            `;

            // Alle anderen User (skip aktueller User)
            allUsers.forEach(u => {
                if (u.username === user.username) return;
                
                const otherMode = u.activeMode || 'starwars';
                const otherAvatar = otherMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu;
                const otherAvatarHtml = otherAvatar
                    ? `<img src="${otherAvatar}" class="mini-avatar">`
                    : `<div class="mini-avatar" style="background:#333"></div>`;
                const otherModeText = otherMode === 'starwars' ? 'SW' : 'Anime';
                const otherModeClass = otherMode === 'starwars' ? 'tag-sw' : 'tag-anime';
                const otherTitle = otherMode === 'starwars' ? u.activeTitle_starwars : u.activeTitle_waifu;
                const otherTitleHtml = otherTitle && otherTitle !== 'Kein Titel'
                    ? `<span style="font-size:0.6rem; color:#ffd700; font-weight:bold; margin-left:4px; text-transform:uppercase;">${otherTitle}</span>` : '';

                const offlineCss = u._isOnline ? '' : 'opacity: 0.45; filter: grayscale(0.5);';
                const indicatorClass = u._isOnline ? 'online-indicator' : 'online-indicator offline';

                onlineList.innerHTML += `
                    <div class="online-user-card" style="${offlineCss}">
                        <div class="${indicatorClass}"></div>
                        ${otherAvatarHtml}
                        <strong>${u.displayName || u.username}${otherTitleHtml}</strong>
                        <span class="chat-mode-tag ${otherModeClass}" style="margin-left:auto; flex-shrink:0;">${otherModeText}</span>
                    </div>
                `;
            });

            document.getElementById('online-count').textContent = onlineCount + 1; // +1 für den aktuellen User
        } catch(e) {
            console.error("Fehler beim Abrufen der Online-User: ", e);
        }
    };

    updateOnlineTracker();
    onlineInterval = setInterval(updateOnlineTracker, 60000); // Alle 60s aktualisieren
}