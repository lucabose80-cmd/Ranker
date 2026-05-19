// scoreboard.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode } from './theme.js';

let isFilterListenerAttached = false;

export async function renderScoreboard() {
    const container = document.getElementById('scoreboard-list');
    const filterSelect = document.getElementById('scoreboard-user-filter');
    const selectedUser = filterSelect.value; 

    container.innerHTML = '<p class="prompt-text">Berechne Punkte...</p>';

    try {
        // Reset-Einstellungen vom Server laden
        let globalScoreboardResetSecs = 0;
        try {
            const serverDoc = await getDocs(query(collection(db, "server_settings")));
            serverDoc.forEach(d => {
                if(d.id === 'resets' && d.data()[`globalScoreboardReset_${currentMode}`]) {
                    globalScoreboardResetSecs = d.data()[`globalScoreboardReset_${currentMode}`].seconds;
                }
            });
        } catch(e) {}

        // User Reset-Timestamps laden
        let userResets = {};
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            usersSnap.forEach(d => {
                const u = d.data();
                if(u[`scoreboardResetAt_${currentMode}`]) userResets[u.username] = u[`scoreboardResetAt_${currentMode}`].seconds;
            });
        } catch(e) {}

        const q = query(collection(db, "history"), where("mode", "==", currentMode));
        const querySnapshot = await getDocs(q);
        
        let games = [];
        let allUsers = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const gameSecs = data.timestamp ? data.timestamp.seconds : 0;
            const personalResetSecs = userResets[data.username] || 0;

            // Nur hinzufügen, wenn das Spiel nach dem globalen UND persönlichen Reset stattfand
            if (gameSecs >= globalScoreboardResetSecs && gameSecs >= personalResetSecs) {
                games.push(data);
                allUsers.add(data.username);
            }
        });

        if (games.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Daten für ein Scoreboard vorhanden.</p>';
            return;
        }

        // Dropdown-Menü aktualisieren
        const currentSelection = filterSelect.value;
        filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
        
        Array.from(allUsers).sort().forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = `Spieler: ${user}`;
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentSelection;

        // KUGELSICHERER FIX: Der Eventlistener wird direkt hier verankert
        if (!isFilterListenerAttached) {
            filterSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            isFilterListenerAttached = true;
        }

        // Punkte berechnen
        let characterScores = {};

        games.forEach(game => {
            if (selectedUser !== 'global' && game.username !== selectedUser) return;

            const ratingMulti = parseInt(game.rating) || 1;

            game.ranking.forEach(item => {
                const rank = parseInt(item.rank);
                const basePoints = 6 - rank; 
                const totalPoints = basePoints * ratingMulti;

                if (!characterScores[item.name]) {
                    characterScores[item.name] = { name: item.name, img: item.img, score: 0 };
                }
                characterScores[item.name].score += totalPoints;
            });
        });

        const sortedCharacters = Object.values(characterScores).sort((a, b) => b.score - a.score);

        if (sortedCharacters.length === 0) {
            container.innerHTML = `<p class="prompt-text">Keine Daten für diesen Filter gefunden.</p>`;
            return;
        }

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