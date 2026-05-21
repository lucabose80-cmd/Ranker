// scoreboard.js
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';
import { getCachedHistory } from './history.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { trackRead } from './tracker.js';

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

    container.innerHTML = '<p class="prompt-text">Lade Scoreboard...</p>';

    try {
        let displayNames = {};
        let allKnownUsers = [];
        try {
            // force=true beim direkten Render, damit nach Resets sofort aktuelle Daten sichtbar sind
            const { userResets: cachedUserResets } = await getResets();
            // Nur echte Spieler (kein Admin, keine Tester) ins Dropdown
            allKnownUsers = Object.keys(cachedUserResets).filter(uname => uname !== 'admin' && uname !== 'test1' && uname !== 'test2');
            allKnownUsers.forEach(uname => {
                displayNames[uname] = cachedUserResets[uname].displayName || uname;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets:", e);
        }

        // Dropdown-Menü mit allen bekannten Usern befüllen
        const sortedUsersList = allKnownUsers.sort((a, b) => {
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
                renderScoreboard();
            });
            typeSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            isFilterListenerAttached = true;
        }

        if (selectedType === 'versus') {
            // Render Versus Scoreboard (Wins)
            const winsField = `versusWins_${currentMode}`;
            const avatarField = currentMode === 'starwars' ? 'avatarStarWars' : 'avatarWaifu';
            const { userResets } = await getResets();
            
            const playersWithWins = Object.keys(userResets)
                .map(uname => ({
                    name: userResets[uname].displayName || uname,
                    score: userResets[uname][winsField] || 0,
                    img: userResets[uname][avatarField] || 'https://i.imgur.com/kS5x87t.png'
                }))
                .filter(p => p.score > 0)
                .sort((a, b) => b.score - a.score);

            if (selectedUser !== 'global') {
                const filtered = playersWithWins.filter(p => p.name === (userResets[selectedUser]?.displayName || selectedUser));
                renderScoreboardHTML(filtered, container);
            } else {
                renderScoreboardHTML(playersWithWins, container);
            }
            return;
        }

        // Das extrem optimierte "Running Total" Fetching (EXAKT 1 READ)
        const docRef = doc(db, "scores", `${currentMode}_${selectedType}_${selectedUser}`);
        const docSnap = await getDoc(docRef);
        trackRead(1);

        if (!docSnap.exists() || !docSnap.data().characters) {
            container.innerHTML = '<p class="prompt-text">Noch keine Daten für dieses Scoreboard vorhanden. Spiele ein Spiel, um den Anfang zu machen!</p>';
            return;
        }

        const charactersData = docSnap.data().characters;
        const sortedCharacters = Object.values(charactersData).sort((a, b) => b.score - a.score);

        renderScoreboardHTML(sortedCharacters, container);

    } catch (error) {
        console.error("Fehler beim Laden des Scoreboards:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Daten.</p>';
    }
}