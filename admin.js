// admin.js
import { logout } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export async function initAdminPanel() {
    document.getElementById('admin-logout-btn').addEventListener('click', logout);
    await renderUserList();
}

async function renderUserList() {
    const userList = document.getElementById('admin-user-list');
    userList.innerHTML = '<p class="prompt-text">Lade Nutzer aus der Datenbank...</p>';
    
    // Alle Nutzer aus der Firebase Collection "users" abrufen
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data());
    });
    
    userList.innerHTML = users.map(user => `
        <div class="admin-user-card">
            <div>
                <strong>${user.username}</strong> 
                <span class="role-badge ${user.role}">${user.role}</span>
            </div>
            ${user.role !== 'admin' ? `<button class="delete-user-btn" data-username="${user.username}">Löschen</button>` : ''}
        </div>
    `).join('');

    // Event Listener für Lösch-Buttons
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const username = e.target.dataset.username;
            if (confirm(`Möchtest du den Account von ${username} wirklich aus der Cloud löschen?`)) {
                await deleteDoc(doc(db, "users", username));
                renderUserList(); // Liste aus der Cloud neu laden
            }
        });
    });
}