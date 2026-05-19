// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './theme.js';

let chatUnsubscribe = null;
let onlineUnsubscribe = null;

export function initCommunity() {
    const user = getCurrentUser();
    if(!user) return;

    // 1. Live Chat
    const chatContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if(chatUnsubscribe) chatUnsubscribe();
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(50));
    
    chatUnsubscribe = onSnapshot(qChat, (snapshot) => {
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
            
            chatContainer.innerHTML += `
                <div class="chat-msg ${isSelf ? 'self' : ''}">
                    ${avatarHtml}
                    <div class="chat-msg-body">
                        <span class="chat-username">
                            <span class="chat-mode-tag ${modeClass}">${modeText}</span> ${msg.displayName}
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
                text: text,
                timestamp: Timestamp.now()
            });
        } catch(e) {}
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

    // 2. Online Tracker (Unter dem Profil platziert)
    if(onlineUnsubscribe) onlineUnsubscribe();
    onlineUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const onlineList = document.getElementById('online-users-list');
        if(!onlineList) return;
        onlineList.innerHTML = '';
        let count = 0;
        const now = Date.now();

        snapshot.forEach(docSnap => {
            const u = docSnap.data();
            if(u.lastActive) {
                const isOnline = (now - u.lastActive.toMillis()) < 60000; 
                if(isOnline) {
                    count++;
                    const userAvatar = u.activeMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu;
                    const avatarHtml = userAvatar ? `<img src="${userAvatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
                    
                    const modeText = u.activeMode === 'starwars' ? 'SW' : 'Anime';
                    const modeClass = u.activeMode === 'starwars' ? 'tag-sw' : 'tag-anime';

                    onlineList.innerHTML += `
                        <div class="online-user-card">
                            <div class="online-indicator"></div>
                            ${avatarHtml}
                            <strong>${u.displayName}</strong>
                            <span class="chat-mode-tag ${modeClass}" style="margin-left:auto;">${modeText}</span>
                        </div>
                    `;
                }
            }
        });
        document.getElementById('online-count').textContent = count;
    });
}