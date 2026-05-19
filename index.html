// admin.js
import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
    list.innerHTML = '<h3>Spielerverwaltung</h3>';

    // 1. Spieler-Liste laden
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(userDoc => {
        const u = userDoc.data();
        if (u.role === 'admin') return;

        const card = document.createElement('div');
        card.className = 'admin-user-card';
        card.innerHTML = `
            <span>${u.displayName}</span>
            <div>
                <button class="rank-btn" style="width:auto; font-size: 0.7rem;" id="reset-discovery-${userDoc.id}">Discovery Reset</button>
                <button class="rank-btn" style="width:auto; font-size: 0.7rem; background:#ff4757; color:white;" id="delete-history-${userDoc.id}">History Reset</button>
            </div>
        `;
        list.appendChild(card);

        // Discovery Reset
        document.getElementById(`reset-discovery-${userDoc.id}`).onclick = async () => {
            await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
            alert("Discovery für " + u.displayName + " zurückgesetzt.");
        };

        // History Reset (Löscht alle Einträge dieses Users aus der History)
        document.getElementById(`delete-history-${userDoc.id}`).onclick = async () => {
            const histSnap = await getDocs(collection(db, "history"));
            histSnap.forEach(async (hDoc) => {
                if (hDoc.data().username === u.username) await deleteDoc(doc(db, "history", hDoc.id));
            });
            alert("History für " + u.displayName + " gelöscht.");
        };
    });

    // 2. Chat-Verwaltung (Löschen)
    list.innerHTML += '<h3>Chat-Nachrichten</h3>';
    const chatSnap = await getDocs(query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(20)));
    chatSnap.forEach(chatDoc => {
        const msg = chatDoc.data();
        const row = document.createElement('div');
        row.className = 'admin-user-card';
        row.innerHTML = `<span>${msg.displayName}: ${msg.text}</span> <button class="rank-btn" style="width:auto; background:red; color:white;">X</button>`;
        row.querySelector('button').onclick = async () => {
            await deleteDoc(doc(db, "chat", chatDoc.id));
            row.remove();
        };
        list.appendChild(row);
    });
}