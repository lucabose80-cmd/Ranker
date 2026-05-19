// scoreboard.js
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';
import { getCachedHistory, initHistoryListener } from './history.js';

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

export async function renderScoreboard(triggerListener = true) {
    const container = document.getElementById('scoreboard-list');
    const filterSelect = document.getElementById('scoreboard-user-filter');
    const typeSelect = document.getElementById('scoreboard-type-filter');
    
    const selectedUser = filterSelect.value || 'global'; 
    const selectedType = typeSelect.value || 'classic';

    if (triggerListener) {
        initHistoryListener(false, { type: selectedType, user: selectedUser });
    }

    const { data: historyCache, isLoaded } = getCachedHistory();

    if (!isLoaded) {
        container.innerHTML = '<p class="prompt-text">Berechne Punkte...</p>';
        return;
    }

    try {
        let globalScoreboardResetSecs = 0;
        let userResets = {};
        let displayNames = {};
        let allKnownUsers = [];
        try {
            const { adminResets, userResets: cachedUserResets } = await getResets();
            globalScoreboardResetSecs = adminResets[`globalScoreboardReset_${currentMode}`] || 0;
            
            allKnownUsers = Object.keys(cachedUserResets);
            allKnownUsers.forEach(uname => {
                userResets[uname] = cachedUserResets[uname][`scoreboardResetAt_${currentMode}`] || 0;
                displayNames[uname] = cachedUserResets[uname].displayName || uname;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets:", e);
        }

        let games = [];

        historyCache.forEach((data) => {
            const gameSecs = data.timestamp ? data.timestamp.seconds : 0;
            const personalResetSecs = userResets[data.username] || 0;

            // Zeitstempel-Reset checken
            if (gameSecs > globalScoreboardResetSecs && gameSecs > personalResetSecs) {
                // Da wir in initHistoryListener bereits filtern, können wir sie direkt nutzen
                games.push(data);
            }
        });

        // Dropdown-Menü aktualisieren (mit allen bekannten Spielern, nicht nur denen aus den letzten 12 Spielen)
        const sortedUsersList = allKnownUsers.sort((a, b) => {
            // Sortiere nach displayName
            const nameA = (displayNames[a] || a).toLowerCase();
            const nameB = (displayNames[b] || b).toLowerCase();
            return nameA.localeCompare(nameB);
        });
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
                renderScoreboard(true);
            });
            typeSelect.addEventListener('change', () => {
                renderScoreboard(true);
            });
            
            // Reagiert auf automatische Live-Updates aus history.js
            document.addEventListener('history-updated', () => {
                const scoreboardContainer = document.getElementById('scoreboard-list');
                if (scoreboardContainer && !document.getElementById('scoreboard-content').classList.contains('hidden')) {
                    renderScoreboard(false);
                }
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