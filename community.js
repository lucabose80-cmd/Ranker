// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';

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
        messages.reverse(); // Älteste oben
        
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const isSelf = msg.username === user.username;
            const avatarHtml = msg.avatar ? `<img src="${msg.avatar}">` : `<div class="mini-avatar" style="background:#444"></div>`;
            
            chatContainer.innerHTML += `
                <div class="chat-msg ${isSelf ? 'self' : ''}">
                    ${avatarHtml}
                    <div class="chat-msg-body">
                        <span class="chat-username">${msg.displayName}</span>
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
        try {
            await addDoc(collection(db, "chat"), {
                username: user.username,
                displayName: user.displayName || user.username,
                avatar: user.avatar || '',
                text: text,
                timestamp: Timestamp.now()
            });
        } catch(e) {}
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

    // 2. Online Tracker (Holt alle Nutzer, die in den letzten 60 Sekunden aktiv waren)
    if(onlineUnsubscribe) onlineUnsubscribe();
    onlineUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const onlineList = document.getElementById('online-users-list');
        onlineList.innerHTML = '';
        let count = 0;
        const now = Date.now();

        snapshot.forEach(docSnap => {
            const u = docSnap.data();
            if(u.lastActive) {
                // Wenn letzer Heartbeat weniger als 60 Sekunden her ist
                const isOnline = (now - u.lastActive.toMillis()) < 60000; 
                if(isOnline) {
                    count++;
                    const avatarHtml = u.avatar ? `<img src="${u.avatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
                    onlineList.innerHTML += `
                        <div class="online-user-card">
                            <div class="online-indicator"></div>
                            ${avatarHtml}
                            <strong>${u.displayName || u.username}</strong>
                        </div>
                    `;
                }
            }
        });
        document.getElementById('online-count').textContent = count;
    });
}