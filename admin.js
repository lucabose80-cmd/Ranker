import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { logout } from './auth.js';

export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
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
                <button class="rank-btn" id="res-d-${userDoc.id}" style="width:auto; font-size: 0.6rem; background: #ff4757;">Discovery Reset</button>
                <button class="rank-btn" id="del-h-${userDoc.id}" style="width:auto; font-size: 0.6rem; background: #ff4757;">History Reset</button>
            </div>
        `;
        list.appendChild(card);

        // Discovery Reset mit grünem Feedback
        document.getElementById(`res-d-${userDoc.id}`).onclick = async (e) => {
            await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
            triggerSuccessFeedback(e.target);
        };

        // History Reset mit grünem Feedback
        document.getElementById(`del-h-${userDoc.id}`).onclick = async (e) => {
            const histSnap = await getDocs(collection(db, "history"));
            const batch = [];
            histSnap.forEach((hDoc) => {
                if (hDoc.data().username === u.username) batch.push(deleteDoc(doc(db, "history", hDoc.id)));
            });
            await Promise.all(batch);
            triggerSuccessFeedback(e.target);
        };
    });

    list.innerHTML += '<h3>Chat-Nachrichten</h3>';
    // ... (Chat Logik bleibt gleich)
}

// Hilfsfunktion für das grüne Feedback
function triggerSuccessFeedback(button) {
    const originalColor = button.style.background;
    button.style.background = "#2ed573"; // Grün bei Erfolg
    button.textContent = "Erledigt!";
    
    setTimeout(() => {
        button.style.background = originalColor; // Zurück zu Rot
        button.textContent = button.id.includes('res-d') ? "Discovery Reset" : "History Reset";
    }, 2000);
}