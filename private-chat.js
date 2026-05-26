import { db } from './firebase-config.js';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';

let currentChatUnsubscribe = null;
let currentChatPartner = null;

export async function openPrivateChat(partnerUser) {
    const user = getCurrentUser();
    if (!user) return;
    
    currentChatPartner = partnerUser;
    
    document.getElementById('private-chat-title').textContent = `Chat mit ${partnerUser.displayName || partnerUser.username}`;
    document.getElementById('private-chat-modal').classList.remove('hidden');
    
    const chatId = [user.uid, partnerUser.uid].sort().join('_');
    
    const messagesDiv = document.getElementById('private-chat-messages');
    messagesDiv.innerHTML = '<div class="loader" style="align-self:center; margin-top:20px;"></div>';
    
    if (currentChatUnsubscribe) currentChatUnsubscribe();
    
    const q = query(collection(db, `private_chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
    
    currentChatUnsubscribe = onSnapshot(q, (snapshot) => {
        messagesDiv.innerHTML = '';
        if (snapshot.empty) {
            messagesDiv.innerHTML = '<div style="color:#aaa; text-align:center; margin-top:20px;">Noch keine Nachrichten.</div>';
        } else {
            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMe = msg.senderId === user.uid;
                const align = isMe ? 'flex-end' : 'flex-start';
                const bg = isMe ? '#3b82f6' : '#2a3142';
                messagesDiv.innerHTML += `
                    <div style="align-self: ${align}; background: ${bg}; padding: 8px 12px; border-radius: 12px; max-width: 80%; word-break: break-word; font-size: 0.9rem;">
                        ${msg.text}
                    </div>
                `;
            });
            setTimeout(() => { messagesDiv.scrollTop = messagesDiv.scrollHeight; }, 10);
        }
    });
}

export function initPrivateChat() {
    const closeBtn = document.getElementById('private-chat-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('private-chat-modal').classList.add('hidden');
            if (currentChatUnsubscribe) {
                currentChatUnsubscribe();
                currentChatUnsubscribe = null;
            }
        });
    }

    const sendBtn = document.getElementById('private-chat-send');
    const input = document.getElementById('private-chat-input');
    
    const sendMsg = async () => {
        const text = input.value.trim();
        if (!text || !currentChatPartner) return;
        
        const user = getCurrentUser();
        if (!user) return;
        
        const chatId = [user.uid, currentChatPartner.uid].sort().join('_');
        input.value = '';
        
        try {
            await addDoc(collection(db, `private_chats/${chatId}/messages`), {
                senderId: user.uid,
                senderName: user.displayName || user.username,
                text: text,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Chat Error:", e);
        }
    };
    
    if (sendBtn) sendBtn.addEventListener('click', sendMsg);
    if (input) input.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMsg(); });
}
