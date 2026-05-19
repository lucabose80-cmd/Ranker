// history.js
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './theme.js';

// Speichert ein fertiges Spiel in der Cloud
export async function saveGameToHistory(placedCharacters, rating) {
    const user = getCurrentUser();
    if (!user) return;

    // Wir bereiten die Daten vor (nur Namen und Bild-Pfade)
    const rankingData = [];
    for (let i = 1; i <= 5; i++) {
        rankingData.push({
            rank: i,
            name: placedCharacters[i].name,
            img: placedCharacters[i].img
        });
    }

    try {
        await addDoc(collection(db, "history"), {
            username: user.username,
            mode: currentMode,
            rating: rating,
            ranking: rankingData,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Fehler beim Speichern der Historie: ", e);
    }
}

// Holt die letzten 20 Spiele aus der Cloud
export async function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '<p class="prompt-text">Lade galaktische Archive...</p>';

    const q = query(collection(db, "history"), orderBy("timestamp", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        container.innerHTML = '<p class="prompt-text">Noch keine Spiele aufgezeichnet.</p>';
        return;
    }

    container.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const game = doc.data();
        const date = game.timestamp.toDate().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        card.className = `history-card ${game.mode}-card`;
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
            <div class="history-footer">
                <span class="history-mode-badge">${game.mode.toUpperCase()}</span>
                <span class="history-rating">Bewertung: <strong>${game.rating}/10</strong></span>
            </div>
        `;
        container.appendChild(card);
    });
}