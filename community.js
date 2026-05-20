// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp, getDocs, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { trackRead, trackWrite } from './tracker.js';

let chatUnsubscribe = null;
let onlineInterval = null;

export function initCommunity() {
    const user = getCurrentUser();
    if(!user) return;

    // 1. Live Chat
    const chatContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if(chatUnsubscribe) chatUnsubscribe();
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(25));
    
    chatUnsubscribe = onSnapshot(qChat, (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        messages.reverse();
        
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const isSelf = msg.username === user.username;
            
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

    // 2. Online Tracker (Unter dem Profil platziert, alle 60s abfragen statt Echtzeit-Snapshot)
    if(onlineInterval) clearInterval(onlineInterval);
    
    const updateOnlineTracker = async () => {
        const onlineList = document.getElementById('online-users-list');
        if(!onlineList) return;
        
        try {
            const sixMinutesAgo = new Date(Date.now() - 360000);
            const qOnline = query(collection(db, "users"), where("lastActive", ">=", Timestamp.fromDate(sixMinutesAgo)), limit(50));
            const snapshot = await getDocs(qOnline);
            trackRead(snapshot.size);
            onlineList.innerHTML = '';
            let count = 0;
            const now = Date.now();

            // 1. Der aktuell eingetragene User selbst ist immer online und steht ganz oben!
            const uMode = currentMode;
            const userAvatar = uMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
            const avatarHtml = userAvatar ? `<img src="${userAvatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
            const modeText = uMode === 'starwars' ? 'SW' : 'Anime';
            const modeClass = uMode === 'starwars' ? 'tag-sw' : 'tag-anime';

            onlineList.innerHTML += `
                <div class="online-user-card">
                    <div class="online-indicator"></div>
                    ${avatarHtml}
                    <strong>${user.displayName || user.username} (Du)</strong>
                    <span class="chat-mode-tag ${modeClass}" style="margin-left:auto;">${modeText}</span>
                </div>
            `;
            count++;

            // 2. Andere User hinzufügen, die aktiv sind
            snapshot.forEach(docSnap => {
                try {
                    const u = docSnap.data();
                    if (u.username === user.username) return; // Duplikate des aktuellen Users vermeiden

                    let isOnline = false;
                    if (u.lastActive) {
                        let lastActiveMillis = 0;
                        if (typeof u.lastActive.toMillis === 'function') {
                            lastActiveMillis = u.lastActive.toMillis();
                        } else if (u.lastActive.seconds) {
                            lastActiveMillis = u.lastActive.seconds * 1000;
                        } else {
                            lastActiveMillis = new Date(u.lastActive).getTime();
                        }

                        if (!isNaN(lastActiveMillis)) {
                            isOnline = (now - lastActiveMillis) < 360000; // 6 Minuten (knapp über 3-Min-Heartbeat, unter 5-Min-Inaktivitäts-Timeout)
                        }
                    }

                    if(isOnline) {
                        count++;
                        const otherMode = u.activeMode || 'starwars';
                        const otherAvatar = otherMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu;
                        const otherAvatarHtml = otherAvatar ? `<img src="${otherAvatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
                        
                        const otherModeText = otherMode === 'starwars' ? 'SW' : 'Anime';
                        const otherModeClass = otherMode === 'starwars' ? 'tag-sw' : 'tag-anime';

                        onlineList.innerHTML += `
                            <div class="online-user-card">
                                <div class="online-indicator"></div>
                                ${otherAvatarHtml}
                                <strong>${u.displayName || u.username}</strong>
                                <span class="chat-mode-tag ${otherModeClass}" style="margin-left:auto;">${otherModeText}</span>
                            </div>
                        `;
                    }
                } catch(err) {
                    console.error("Fehler beim Laden eines Users im Online-Tracker: ", err);
                }
            });
            document.getElementById('online-count').textContent = count;
        } catch(e) {
            console.error("Fehler beim Abrufen der Online-User: ", e);
        }
    };

    updateOnlineTracker();
    onlineInterval = setInterval(updateOnlineTracker, 120000); // Polling (120s) spart noch einmal 50% der Reads!
}