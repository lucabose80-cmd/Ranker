// admin.js
import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { logout } from './auth.js';

export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
    list.innerHTML = '<h3>Spielerverwaltung</h3>';

    // 1. Admin Logout Logik
    document.getElementById('admin-logout-btn').onclick = logout;

    // 2. Spieler-Liste laden
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(userDoc => {
        const u = userDoc.data();
        if (u.role === 'admin') return;

        const card = document.createElement('div');
        card.className = 'admin-user-card';
        card.innerHTML = `
            <span>${u.displayName}</span>
            <div>
                <button class="rank-btn" id="res-d-${userDoc.id}" style="width:auto; font-size: 0.6rem;">Discovery Reset</button>
                <button class="rank-btn" id="del-h-${userDoc.id}" style="width:auto; font-size: 0.6rem; background:#ff4757; color:white;">History Reset</button>
            </div>
        `;
        list.appendChild(card);

        // Discovery Reset
        document.getElementById(`res-d-${userDoc.id}`).onclick = async () => {
            await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
            alert("Discovery für " + u.displayName + " zurückgesetzt.");
        };

        // History Reset
        document.getElementById(`del-h-${userDoc.id}`).onclick = async () => {
            const histSnap = await getDocs(collection(db, "history"));
            histSnap.forEach(async (hDoc) => {
                if (hDoc.data().username === u.username) await deleteDoc(doc(db, "history", hDoc.id));
            });
            alert("History für " + u.displayName + " gelöscht.");
        };
    });

    // 3. Chat-Verwaltung
    list.innerHTML += '<h3>Chat-Nachrichten</h3>';
    const chatSnap = await getDocs(query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(10)));
    chatSnap.forEach(chatDoc => {
        const msg = chatDoc.data();
        const row = document.createElement('div');
        row.className = 'admin-user-card';
        row.innerHTML = `<span>${msg.displayName}: ${msg.text}</span> <button class="rank-btn" style="width:30px; height:30px; background:red; color:white;">X</button>`;
        row.querySelector('button').onclick = async () => {
            await deleteDoc(doc(db, "chat", chatDoc.id));
            row.remove();
        };
        list.appendChild(row);
    });
}