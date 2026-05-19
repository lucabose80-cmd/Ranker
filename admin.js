import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { logout } from './auth.js';

export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
    if (!list) return;
    list.innerHTML = '<h3>Spielerverwaltung</h3>';

    document.getElementById('admin-logout-btn').onclick = logout;

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(userDoc => {
        const u = userDoc.data();
        if (u.role === 'admin') return;

        const card = document.createElement('div');
        card.className = 'admin-user-card';
        card.innerHTML = `
            <span>${u.displayName}</span>
            <div>
                <button id="res-d-${userDoc.id}" style="padding:5px; cursor:pointer;">Discovery Reset</button>
                <button id="del-h-${userDoc.id}" style="padding:5px; cursor:pointer; background:#ff4757; color:white;">History Reset</button>
            </div>
        `;
        list.appendChild(card);

        document.getElementById(`res-d-${userDoc.id}`).onclick = async () => {
            await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
            alert("Discovery reset für " + u.displayName);
        };

        document.getElementById(`del-h-${userDoc.id}`).onclick = async () => {
            const histSnap = await getDocs(collection(db, "history"));
            const batch = [];
            histSnap.forEach((hDoc) => {
                if (hDoc.data().username === u.username) batch.push(deleteDoc(doc(db, "history", hDoc.id)));
            });
            await Promise.all(batch);
            alert("History gelöscht für " + u.displayName);
        };
    });
}