// scoreboard.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode } from './theme.js';
import { getResets } from './resets.js';

let isFilterListenerAttached = false;
let scoreboardCache = {};

export function invalidateScoreboardCache() {
    scoreboardCache = {};
}

// Hilfsfunktion zum Rendern der berechneten Scoreboard-Karten
function renderScoreboardHTML(sortedCharacters, container) {
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
}

export async function renderScoreboard() {
    const container = document.getElementById('scoreboard-list');
    const filterSelect = document.getElementById('scoreboard-user-filter');
    const selectedUser = filterSelect.value; 
    const now = Date.now();

    // Cache-Key setzt sich aus Modus und Filter zusammen (z.B. "starwars_global")
    const cacheKey = `${currentMode}_${selectedUser}`;
    const cached = scoreboardCache[cacheKey];

    // Stale-While-Revalidate: Sofort rendern falls gecached
    if (cached) {
        // Dropdown befüllen
        filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
        cached.allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = `Spieler: ${user}`;
            filterSelect.appendChild(option);
        });
        filterSelect.value = selectedUser;

        // Scoreboard rendern
        renderScoreboardHTML(cached.sortedCharacters, container);

        // Klick-Listener für Filter anheften
        if (!isFilterListenerAttached) {
            filterSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            isFilterListenerAttached = true;
        }

        // Wenn Cache jünger als 15 Sek, sind wir fertig!
        if (now - cached.timestamp < 15000) {
            return;
        }
    } else {
        container.innerHTML = '<p class="prompt-text">Berechne Punkte...</p>';
    }

    try {
        let globalScoreboardResetSecs = 0;
        let userResets = {};
        try {
            const { adminResets, userResets: cachedUserResets } = await getResets();
            globalScoreboardResetSecs = adminResets[`globalScoreboardReset_${currentMode}`] || 0;
            
            Object.keys(cachedUserResets).forEach(uname => {
                userResets[uname] = cachedUserResets[uname][`scoreboardResetAt_${currentMode}`] || 0;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets:", e);
        }

        const q = query(collection(db, "history"), where("mode", "==", currentMode));
        const querySnapshot = await getDocs(q);
        
        let games = [];
        let allUsers = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const gameSecs = data.timestamp ? data.timestamp.seconds : 0;
            const personalResetSecs = userResets[data.username] || 0;

            if (gameSecs > globalScoreboardResetSecs && gameSecs > personalResetSecs) {
                games.push(data);
                allUsers.add(data.username);
            }
        });

        // Dropdown-Menü aktualisieren
        const sortedUsersList = Array.from(allUsers).sort();
        filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
        sortedUsersList.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = `Spieler: ${user}`;
            filterSelect.appendChild(option);
        });
        filterSelect.value = selectedUser;

        if (!isFilterListenerAttached) {
            filterSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            isFilterListenerAttached = true;
        }

        if (games.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Daten für ein Scoreboard vorhanden.</p>';
            // Cache leeren für diesen Zustand
            scoreboardCache[cacheKey] = {
                sortedCharacters: [],
                allUsers: sortedUsersList,
                timestamp: Date.now()
            };
            return;
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

        // Im Cache ablegen
        scoreboardCache[cacheKey] = {
            sortedCharacters,
            allUsers: sortedUsersList,
            timestamp: Date.now()
        };

        renderScoreboardHTML(sortedCharacters, container);

    } catch (error) {
        console.error("Fehler beim Laden des Scoreboards:", error);
        if (!cached) {
            container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Daten.</p>';
        }
    }
}