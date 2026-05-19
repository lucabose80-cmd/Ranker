// scoreboard.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode } from './theme.js';

export async function renderScoreboard() {
    const container = document.getElementById('scoreboard-list');
    const filterSelect = document.getElementById('scoreboard-user-filter');
    const selectedUser = filterSelect.value; // "global" oder ein bestimmter Username

    container.innerHTML = '<p class="prompt-text">Berechne Punkte...</p>';

    try {
        // Alle Spiele des aktuellen Modus holen
        const q = query(collection(db, "history"), where("mode", "==", currentMode));
        const querySnapshot = await getDocs(q);
        
        let games = [];
        let allUsers = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            games.push(data);
            allUsers.add(data.username);
        });

        if (games.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Daten für ein Scoreboard vorhanden.</p>';
            return;
        }

        // Dropdown-Menü aktualisieren (nur beim ersten Laden oder wenn es leer ist)
        if (filterSelect.options.length <= 1) {
            const currentSelection = filterSelect.value;
            filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
            
            Array.from(allUsers).sort().forEach(user => {
                const option = document.createElement('option');
                option.value = user;
                option.textContent = `Spieler: ${user}`;
                filterSelect.appendChild(option);
            });
            // Alte Auswahl wiederherstellen
            if (Array.from(filterSelect.options).some(opt => opt.value === currentSelection)) {
                filterSelect.value = currentSelection;
            }
        }

        // Punkte berechnen
        let characterScores = {};

        games.forEach(game => {
            // Wenn nicht global und nicht der gewählte Spieler, überspringen
            if (selectedUser !== 'global' && game.username !== selectedUser) return;

            const ratingMulti = parseInt(game.rating) || 1;

            game.ranking.forEach(item => {
                const rank = parseInt(item.rank);
                // Platz 1 = 5 Pkt, Platz 2 = 4 Pkt, etc.
                const basePoints = 6 - rank; 
                const totalPoints = basePoints * ratingMulti;

                if (!characterScores[item.name]) {
                    characterScores[item.name] = { name: item.name, img: item.img, score: 0 };
                }
                characterScores[item.name].score += totalPoints;
            });
        });

        // In Array umwandeln und absteigend sortieren
        const sortedCharacters = Object.values(characterScores).sort((a, b) => b.score - a.score);

        if (sortedCharacters.length === 0) {
            container.innerHTML = `<p class="prompt-text">Keine Daten für diesen Filter gefunden.</p>`;
            return;
        }

        // UI rendern
        container.innerHTML = "";
        sortedCharacters.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = 'score-card';
            card.innerHTML = `
                <div class="score-rank">#${index + 1}</div>
                <div class="score-info">
                    <img src="${char.img}" alt="${char.name}">
                    <span>${char.name}</span>
                </div>
                <div class="score-points">${char.score} <span>PKT</span></div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Fehler beim Laden des Scoreboards:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Daten.</p>';
    }
}