// scoreboard.js
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';
import { getCachedHistory } from './history.js';

let isFilterListenerAttached = false;

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
    const typeSelect = document.getElementById('scoreboard-type-filter');
    
    const selectedUser = filterSelect.value || 'global'; 
    const selectedType = typeSelect.value || 'classic';

    const { data: historyCache, isLoaded } = getCachedHistory();

    if (!isLoaded) {
        container.innerHTML = '<p class="prompt-text">Berechne Punkte...</p>';
        return;
    }

    try {
        let globalScoreboardResetSecs = 0;
        let userResets = {};
        let displayNames = {};
        try {
            const { adminResets, userResets: cachedUserResets } = await getResets();
            globalScoreboardResetSecs = adminResets[`globalScoreboardReset_${currentMode}`] || 0;
            
            Object.keys(cachedUserResets).forEach(uname => {
                userResets[uname] = cachedUserResets[uname][`scoreboardResetAt_${currentMode}`] || 0;
                displayNames[uname] = cachedUserResets[uname].displayName || uname;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets:", e);
        }

        let games = [];
        let allUsers = new Set();

        // Spiele lokal aus dem synchronisierten RAM-Cache filtern
        historyCache.forEach((data) => {
            const gameSecs = data.timestamp ? data.timestamp.seconds : 0;
            const personalResetSecs = userResets[data.username] || 0;

            // Zeitstempel-Reset checken
            if (gameSecs > globalScoreboardResetSecs && gameSecs > personalResetSecs) {
                // Spieltyp checken (Classic vs. Advanced)
                const isGameAdvanced = data.gameType === 'advanced' || data.ranking.length > 5;
                if (selectedType === 'advanced' && isGameAdvanced) {
                    games.push(data);
                    allUsers.add(data.username);
                } else if (selectedType === 'classic' && !isGameAdvanced) {
                    games.push(data);
                    allUsers.add(data.username);
                }
            }
        });

        // Dropdown-Menü aktualisieren
        const sortedUsersList = Array.from(allUsers).sort();
        filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
        sortedUsersList.forEach(uname => {
            const option = document.createElement('option');
            option.value = uname;
            option.textContent = `Spieler: ${displayNames[uname] || uname}`;
            filterSelect.appendChild(option);
        });
        filterSelect.value = selectedUser;

        if (!isFilterListenerAttached) {
            filterSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            typeSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            isFilterListenerAttached = true;
        }

        if (games.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Daten für dieses Scoreboard vorhanden.</p>';
            return;
        }

        // Punkte berechnen
        let characterScores = {};
        games.forEach(game => {
            if (selectedUser !== 'global' && game.username !== selectedUser) return;

            const ratingMulti = parseInt(game.rating) || 1;
            const isGameAdvanced = game.gameType === 'advanced' || game.ranking.length > 5;
            const maxRank = isGameAdvanced ? 10 : 5;

            game.ranking.forEach(item => {
                const rank = parseInt(item.rank);
                const basePoints = (maxRank + 1) - rank; 
                const totalPoints = basePoints * ratingMulti;

                if (!characterScores[item.name]) {
                    characterScores[item.name] = { name: item.name, img: item.img, score: 0 };
                }
                characterScores[item.name].score += totalPoints;
            });
        });

        const sortedCharacters = Object.values(characterScores).sort((a, b) => b.score - a.score);

        renderScoreboardHTML(sortedCharacters, container);

    } catch (error) {
        console.error("Fehler beim Laden des Scoreboards:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Daten.</p>';
    }
}