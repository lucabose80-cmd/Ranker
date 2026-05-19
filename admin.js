export async function initAdminPanel() {
    const list = document.getElementById('admin-user-list');
    if (!list) return;
    list.innerHTML = '<h3>Spielerverwaltung</h3>';

    // Logout-Button Style-Fix
    const logoutBtn = document.getElementById('admin-logout-btn');
    logoutBtn.onclick = logout;
    logoutBtn.style.cssText = "background: #ff4757; color: white; border: none; padding: 10px; cursor: pointer; width: 100%; border-radius: 6px;";

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(userDoc => {
        const u = userDoc.data();
        if (u.role === 'admin') return;

        const card = document.createElement('div');
        card.className = 'admin-user-card';
        card.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #222;";
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = u.displayName;
        
        // Buttons direkt stylen, ohne externe Klassen
        const resBtn = document.createElement('button');
        resBtn.textContent = "Discovery Reset";
        resBtn.style.cssText = "background: #ff4757; color: white; border: none; padding: 5px 10px; margin-right: 5px; cursor: pointer; border-radius: 4px;";
        
        const delBtn = document.createElement('button');
        delBtn.textContent = "History Reset";
        delBtn.style.cssText = "background: #ff4757; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;";

        resBtn.onclick = async () => {
            await updateDoc(doc(db, "users", userDoc.id), { discovered: [] });
            resBtn.style.background = "#2ed573"; // Grün bei Erfolg
            resBtn.textContent = "Reset!";
            setTimeout(() => { resBtn.style.background = "#ff4757"; resBtn.textContent = "Discovery Reset"; }, 2000);
        };

        delBtn.onclick = async () => {
            const histSnap = await getDocs(collection(db, "history"));
            const batch = [];
            histSnap.forEach((hDoc) => {
                if (hDoc.data().username === u.username) batch.push(deleteDoc(doc(db, "history", hDoc.id)));
            });
            await Promise.all(batch);
            delBtn.style.background = "#2ed573"; // Grün bei Erfolg
            delBtn.textContent = "Gelöscht!";
            setTimeout(() => { delBtn.style.background = "#ff4757"; delBtn.textContent = "History Reset"; }, 2000);
        };

        card.appendChild(nameSpan);
        const btnContainer = document.createElement('div');
        btnContainer.appendChild(resBtn);
        btnContainer.appendChild(delBtn);
        card.appendChild(btnContainer);
        list.appendChild(card);
    });
}