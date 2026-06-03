// scoreboard.js
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';
import { getCachedHistory } from './history.js';
import { db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { trackRead } from './tracker.js';

let isFilterListenerAttached = false;
let hasInitializedFilterOptions = false;
let currentScoreboardData = [];
let currentIsAverageBased = false;

// Hilfsfunktion zum Rendern der berechneten Scoreboard-Karten
function renderScoreboardHTML(sortedCharacters, container, isAverageBased = false) {
    if (sortedCharacters.length === 0) {
        container.innerHTML = `<p class="prompt-text">Keine Daten für diesen Filter gefunden.</p>`;
        return;
    }

    container.innerHTML = "";
    sortedCharacters.forEach((char, index) => {
        const card = document.createElement('div');
        card.className = 'score-card';
        
        if (isAverageBased) {
            const count = char.count || 1;
            const avg = (char.score / count).toFixed(2);
            card.title = `Gesamtpunkte: ${char.score}\nGeranked: ${count}x\nBerechnung: ${char.score} / ${count} = ${avg} Ø`;
            card.innerHTML = `
                <div class="score-rank">#${index + 1}</div>
                <div class="score-info">
                    <img src="${char.img}" alt="${char.name}">
                    <span>${char.name}</span>
                </div>
                <div class="score-points" style="display:flex; flex-direction:column; align-items:flex-end;">
                    <div>${avg} <span>Ø PKT</span></div>
                    <div style="font-size:0.65rem; color:#888; font-weight:normal; margin-top:2px;">${count}x geranked</div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="score-rank">#${index + 1}</div>
                <div class="score-info">
                    <img src="${char.img}" alt="${char.name}">
                    <span>${char.name}</span>
                </div>
                <div class="score-points">${char.score} <span>${char.suffix || 'PKT'}</span></div>
            `;
        }
        
        container.appendChild(card);
    });
}

export async function renderScoreboard() {
    const container = document.getElementById('scoreboard-list');
    const filterSelect = document.getElementById('scoreboard-user-filter');
    const typeSelect = document.getElementById('scoreboard-type-filter');
    
    const selectedUser = filterSelect.value || 'global'; 
    const selectedType = typeSelect.value || 'classic';

    if (!container.innerHTML || container.innerHTML.trim() === "" || container.querySelector('.prompt-text')) {
        container.innerHTML = '<p class="prompt-text">Lade Scoreboard...</p>';
    }

    try {
        let displayNames = {};
        let allKnownUsers = [];
        try {
            // force=true beim direkten Render, damit nach Resets sofort aktuelle Daten sichtbar sind
            const { userResets: cachedUserResets } = await getResets(true);
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

        if (!hasInitializedFilterOptions) {
            filterSelect.innerHTML = '<option value="global">Global (Alle Spieler)</option>';
            sortedUsersList.forEach(uname => {
                const option = document.createElement('option');
                option.value = uname;
                option.textContent = `Spieler: ${displayNames[uname] || uname}`;
                filterSelect.appendChild(option);
            });
            filterSelect.value = selectedUser;
            hasInitializedFilterOptions = true;
        } else if (!filterSelect.querySelector(`option[value="${selectedUser}"]`)) {
            const option = document.createElement('option');
            option.value = selectedUser;
            option.textContent = `Spieler: ${displayNames[selectedUser] || selectedUser}`;
            filterSelect.appendChild(option);
            filterSelect.value = selectedUser;
        }

        if (!isFilterListenerAttached) {
            filterSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            typeSelect.addEventListener('change', () => {
                renderScoreboard();
            });
            const searchInput = document.getElementById('scoreboard-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    applyScoreboardSearch();
                });
            }
            isFilterListenerAttached = true;
        }

        if (selectedType.startsWith('starwarsdle')) {
            const isDaily = selectedType === 'starwarsdle';
            
            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const seed = (new Date(today - offset)).toISOString().slice(0, 10);
            
            let q;
            const collectionName = currentMode + "dle_scores";
            if (isDaily) {
                q = query(collection(db, collectionName), where("date", "==", seed));
            } else {
                q = collection(db, collectionName);
            }
            
            trackRead('Scoreboard.StarWarsdle');
            const snap = await getDocs(q);
            
            let results = [];
            const { userResets } = await getResets();
            const avatarField = currentMode === 'starwars' ? 'avatarStarWars' : 'avatarWaifu';
            
            const userResetsVals = Object.values(userResets);

            if (isDaily) {
                results = snap.docs.map(doc => {
                    const d = doc.data();
                    const u = userResetsVals.find(ur => ur.displayName === d.username);
                    return { name: d.username, score: d.attempts, img: u?.[avatarField] || 'https://i.imgur.com/kS5x87t.png', suffix: 'VERSUCHE' };
                }).filter(p => p.name.toLowerCase() !== 'test1' && p.name.toLowerCase() !== 'test2' && p.name.toLowerCase() !== 'admin')
                .sort((a, b) => a.score - b.score);
            } else {
                const winsMap = snap.docs.reduce((acc, doc) => {
                    const uname = doc.data().username;
                    acc[uname] = (acc[uname] || 0) + 1;
                    return acc;
                }, {});
                
                results = Object.entries(winsMap).map(([uname, score]) => {
                    const u = userResetsVals.find(ur => ur.displayName === uname);
                    return { name: uname, score, img: u?.[avatarField] || 'https://i.imgur.com/kS5x87t.png', suffix: 'WINS' };
                }).filter(p => p.name.toLowerCase() !== 'test1' && p.name.toLowerCase() !== 'test2' && p.name.toLowerCase() !== 'admin')
                .sort((a, b) => b.score - a.score);
            }

            if (selectedUser !== 'global') {
                const filtered = results.filter(p => p.name === (userResets[selectedUser]?.displayName || selectedUser));
                renderScoreboardHTML(filtered, container);
            } else {
                renderScoreboardHTML(results, container);
            }
            return;
        }

        if (selectedType === 'marathon') {
            trackRead('Scoreboard.Marathon');
            const snap = await getDocs(collection(db, "marathon_scores"));
            
            let results = [];
            const { userResets } = await getResets();
            const avatarField = currentMode === 'starwars' ? 'avatarStarWars' : 'avatarWaifu';
            const userResetsVals = Object.values(userResets);

            results = snap.docs.map(doc => {
                const d = doc.data();
                const u = userResetsVals.find(ur => ur.displayName === d.username) || userResetsVals.find(ur => ur.username === d.username);
                return { name: d.username, score: d.score || 0, img: u?.[avatarField] || 'https://i.imgur.com/kS5x87t.png', suffix: 'CHARS' };
            }).filter(p => p.name.toLowerCase() !== 'test1' && p.name.toLowerCase() !== 'test2' && p.name.toLowerCase() !== 'admin')
            .sort((a, b) => b.score - a.score);

            if (selectedUser !== 'global') {
                const filtered = results.filter(p => p.name === (userResets[selectedUser]?.displayName || selectedUser));
                renderScoreboardHTML(filtered, container);
            } else {
                renderScoreboardHTML(results, container);
            }
            return;
        }

        if (selectedType.startsWith('versus')) {
            // Render Versus Scoreboard (Wins)
            const suffix = selectedType === 'versus_klon' ? '_klon' : '';
            const winsField = `versusWins_${currentMode}${suffix}`;
            const avatarField = currentMode === 'starwars' ? 'avatarStarWars' : 'avatarWaifu';
            const { userResets } = await getResets();
            
            const playersWithWins = Object.keys(userResets)
                .map(uname => ({
                    name: userResets[uname].displayName || uname,
                    score: userResets[uname][winsField] || 0,
                    img: userResets[uname][avatarField] || 'https://i.imgur.com/kS5x87t.png',
                    suffix: 'WINS'
                }))
                .filter(p => p.score > 0 && p.name.toLowerCase() !== 'test1' && p.name.toLowerCase() !== 'test2' && p.name.toLowerCase() !== 'admin')
                .sort((a, b) => b.score - a.score);

            if (selectedUser !== 'global') {
                currentScoreboardData = playersWithWins.filter(p => p.name === (userResets[selectedUser]?.displayName || selectedUser));
            } else {
                currentScoreboardData = playersWithWins;
            }
            currentIsAverageBased = false;
            applyScoreboardSearch();
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
        const sortedCharacters = Object.values(charactersData).sort((a, b) => {
            const countA = a.count || 1;
            const countB = b.count || 1;
            const avgA = a.score / countA;
            const avgB = b.score / countB;
            
            if (Math.abs(avgB - avgA) < 0.001) {
                return countB - countA; // Bei gleichem Durchschnitt gewinnt derjenige, der öfter geranked wurde
            }
            return avgB - avgA;
        });

        currentScoreboardData = sortedCharacters;
        currentIsAverageBased = true;
        applyScoreboardSearch();

    } catch (error) {
        console.error("Fehler beim Laden des Scoreboards:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Daten.</p>';
    }
}

function applyScoreboardSearch() {
    const container = document.getElementById('scoreboard-list');
    const searchInput = document.getElementById('scoreboard-search-input');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (query.trim() === '') {
        renderScoreboardHTML(currentScoreboardData, container, currentIsAverageBased);
    } else {
        const filtered = currentScoreboardData.filter(char => {
            const charName = (char.name || char.username || '').toLowerCase();
            return charName.includes(query);
        });
        renderScoreboardHTML(filtered, container, currentIsAverageBased);
    }
}
