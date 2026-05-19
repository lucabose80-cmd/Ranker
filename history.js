// history.js
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './theme.js';
import { getResets } from './resets.js';

// Speichert ein fertiges Spiel in der Cloud
export async function saveGameToHistory(placedCharacters, rating, pool) {
    const user = getCurrentUser();
    if (!user) return;

    const rankingData = [];
    for (let i = 1; i <= 5; i++) {
        rankingData.push({
            rank: i,
            name: placedCharacters[i].name,
            img: placedCharacters[i].img
        });
    }

    // Erscheinungsreihenfolge speichern
    const poolData = pool ? pool.map((c, idx) => ({ order: idx + 1, name: c.name, img: c.img })) : [];

    try {
        await addDoc(collection(db, "history"), {
            username: user.username,
            mode: currentMode,
            rating: rating,
            ranking: rankingData,
            pool: poolData,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Fehler beim Speichern der Historie: ", e);
    }
}

// Holt nur die Spiele des aktuellen Modus aus der Cloud
export async function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '<p class="prompt-text">Lade Archive...</p>';

    try {
        // Reset-Einstellungen aus dem Cache laden
        let globalHistoryResetSecs = 0;
        let userResets = {};
        
        try {
            const { adminResets, userResets: cachedUserResets } = await getResets();
            globalHistoryResetSecs = adminResets[`globalHistoryReset_${currentMode}`] || 0;
            
            // Formatieren, damit userResets[username] direkt den historyResetAt_... Wert liefert
            Object.keys(cachedUserResets).forEach(uname => {
                userResets[uname] = cachedUserResets[uname][`historyResetAt_${currentMode}`] || 0;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets aus dem Cache:", e);
        }

        const q = query(collection(db, "history"), where("mode", "==", currentMode));
        const querySnapshot = await getDocs(q);
        
        let games = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const gameSecs = data.timestamp ? data.timestamp.seconds : 0;
            const personalResetSecs = userResets[data.username] || 0;
            
            // Nur hinzufügen, wenn das Spiel nach dem globalen UND persönlichen Reset stattfand
            if (gameSecs > globalHistoryResetSecs && gameSecs > personalResetSecs) {
                games.push(data);
            }
        });

        if (games.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Spiele in diesem Modus aufgezeichnet.</p>';
            return;
        }

        // Wir sortieren die Spiele lokal
        games.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        games = games.slice(0, 20); // Zeige maximal die 20 neuesten an

        container.innerHTML = "";
        games.forEach((game) => {
            const date = game.timestamp.toDate().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            const card = document.createElement('div');
            card.className = `history-card ${game.mode}-card`;

            // Erscheinungsreihenfolge (Pool) – nur wenn vorhanden
            const poolHtml = (game.pool && game.pool.length > 0) ? `
                <div class="history-pool">
                    <span class="history-pool-label">Erschienen in:</span>
                    <div class="history-pool-slots">
                        ${game.pool.map(item => `
                            <div class="history-pool-slot" title="${item.order}. ${item.name}">
                                <img src="${item.img}">
                                <span class="pool-order">${item.order}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="history-header">
                    <strong>${game.username}</strong>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-images">
                    ${game.ranking.map(item => `
                        <div class="history-img-slot" title="${item.name}">
                            <img src="${item.img}">
                            <span class="mini-rank">${item.rank}</span>
                        </div>
                    `).join('')}
                </div>
                ${poolHtml}
                <div class="history-footer">
                    <span class="history-rating">Bewertung: <strong>${game.rating}/10</strong></span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Historie:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Historie.</p>';
    }
}