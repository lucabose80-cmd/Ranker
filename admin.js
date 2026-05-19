import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { logout } from './auth.js';

export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
    if (!list) {
        console.error("Fehler: admin-user-list Container nicht gefunden!");
        return;
    }
    list.innerHTML = '<h3>Spielerverwaltung (Daten werden geladen...)</h3>';

    // Logout-Button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if(logoutBtn) logoutBtn.onclick = logout;

    try {
        const usersSnap = await getDocs(collection(db, "users"));
        console.log("Anzahl gefundener User:", usersSnap.size);
        
        list.innerHTML = '<h3>Spielerverwaltung</h3>';

        usersSnap.forEach(userDoc => {
            const u = userDoc.data();
            console.log("Verarbeite User:", u.displayName);
            if (u.role === 'admin') return;

            const card = document.createElement('div');
            card.className = 'admin-user-card';
            card.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #222; margin-bottom: 5px;";
            
            card.innerHTML = `<span>${u.displayName}</span>`;
            
            const btnDiv = document.createElement('div');
            const resBtn = document.createElement('button');
            resBtn.textContent = "Discovery Reset";
            resBtn.style.cssText = "background: #ff4757; color: white; padding: 5px; cursor: pointer; margin-right: 5px;";
            
            resBtn.onclick = async () => {
                await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
                alert("Reset erfolgreich!");
            };

            btnDiv.appendChild(resBtn);
            card.appendChild(btnDiv);
            list.appendChild(card);
        });

    } catch (e) {
        console.error("FATALER FEHLER beim Laden der User:", e);
        list.innerHTML = '<p style="color:red;">Fehler beim Laden der Spielerdaten. Prüfe F12 Konsole.</p>';
    }
}