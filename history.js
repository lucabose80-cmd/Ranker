// history.js
import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';

let historyCache = [];
let historyUnsubscribe = null;
let isFirstLoadComplete = false;

// Gibt die aktuell gecachten Historien-Daten zurück
export function getCachedHistory() {
    return { data: historyCache, isLoaded: isFirstLoadComplete };
}

// Startet den Echtzeit-Sync für den aktuellen Modus
export function initHistoryListener() {
    if (historyUnsubscribe) {
        historyUnsubscribe();
    }
    isFirstLoadComplete = false;

    const q = query(collection(db, "history"), where("mode", "==", currentMode));
    
    historyUnsubscribe = onSnapshot(q, (snapshot) => {
        let games = [];
        snapshot.forEach((doc) => {
            games.push(doc.data());
        });

        // Lokal sortieren nach Timestamp absteigend
        games.sort((a, b) => {
            const secondsA = a.timestamp ? a.timestamp.seconds : 0;
            const secondsB = b.timestamp ? b.timestamp.seconds : 0;
            return secondsB - secondsA;
        });

        historyCache = games;
        isFirstLoadComplete = true;

        // Falls die Tabs offen sind, triggern wir ein sofortiges re-rendering
        const historyContainer = document.getElementById('history-list');
        if (historyContainer && !document.getElementById('history-content').classList.contains('hidden')) {
            renderHistory();
        }

        // Scoreboard ebenfalls live aktualisieren falls offen
        const scoreboardContainer = document.getElementById('scoreboard-list');
        if (scoreboardContainer && !document.getElementById('scoreboard-content').classList.contains('hidden')) {
            // Import dynamisch oder wir verlassen uns darauf, dass renderScoreboard global importiert wird.
            // Um Zirkelbezüge zu vermeiden, rufen wir das Event oder die Render-Funktion auf.
            const filterSelect = document.getElementById('scoreboard-user-filter');
            if (filterSelect) {
                // Wir werfen ein Custom-Event oder rufen es auf, falls im Window-Scope registriert.
                // Noch einfacher: Wir dispatchen ein Event oder triggern ein Rerender über das UI.
                const event = new Event('change');
                filterSelect.dispatchEvent(event);
            }
        }
    }, (error) => {
        console.error("Fehler im History-Listener:", error);
    });
}
// Speichert ein fertiges Spiel in der Cloud
export async function saveGameToHistory(placedCharacters, rating, pool, gameType = 'classic') {
    const user = getCurrentUser();
    if (!user) return;

    const rankingData = [];
    const count = gameType === 'advanced' ? 10 : 5;
    for (let i = 1; i <= count; i++) {
        if (placedCharacters[i]) {
            rankingData.push({
                rank: i,
                name: placedCharacters[i].name,
                img: placedCharacters[i].img
            });
        }
    }

    const poolData = pool ? pool.map((c, idx) => ({ order: idx + 1, name: c.name, img: c.img })) : [];

    try {
        await addDoc(collection(db, "history"), {
            username: user.username,
            displayName: user.displayName || user.username,
            mode: currentMode,
            gameType: gameType,
            rating: rating,
            ranking: rankingData,
            pool: poolData,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Fehler beim Speichern der Historie: ", e);
    }
}

// Hilfsfunktion zum Rendern der HTML Karten
function renderHistoryHTML(games, container, displayNames) {
    if (games.length === 0) {
        container.innerHTML = '<p class="prompt-text">Noch keine Spiele in diesem Modus aufgezeichnet.</p>';
        return;
    }

    container.innerHTML = "";
    games.forEach((game) => {
        const dateObj = game.timestamp && typeof game.timestamp.toDate === 'function' 
            ? game.timestamp.toDate() 
            : new Date(game.timestamp.seconds * 1000);
            
        const date = dateObj.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const card = document.createElement('div');
        const isAdvanced = game.gameType === 'advanced' || game.ranking.length > 5;
        card.className = `history-card ${game.mode}-card ${isAdvanced ? 'advanced-history-card' : ''}`;

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

        const displayNameToUse = displayNames[game.username] || game.displayName || game.username;
        const modeBadge = isAdvanced ? '<span class="version-badge" style="background:#ffd700; color:#000; font-size:0.6rem; padding:1px 4px; margin-left:5px; border-radius:3px; font-weight:bold;">ADV</span>' : '';

        card.innerHTML = `
            <div class="history-header">
                <strong>${displayNameToUse}${modeBadge}</strong>
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
}

// Holt die gefilterten Spiele aus dem lokalen Echtzeit-Cache und rendert sie instant
export async function renderHistory() {
    const container = document.getElementById('history-list');
    
    if (!isFirstLoadComplete) {
        container.innerHTML = '<p class="prompt-text">Verbinde mit Archiven...</p>';
        return;
    }

    try {
        let globalHistoryResetSecs = 0;
        let userResets = {};
        let displayNames = {};
        
        try {
            const { adminResets, userResets: cachedUserResets } = await getResets();
            globalHistoryResetSecs = adminResets[`globalHistoryReset_${currentMode}`] || 0;
            
            Object.keys(cachedUserResets).forEach(uname => {
                userResets[uname] = cachedUserResets[uname][`historyResetAt_${currentMode}`] || 0;
                displayNames[uname] = cachedUserResets[uname].displayName || uname;
            });
        } catch(e) {
            console.error("Fehler beim Laden der Resets:", e);
        }

        // Filtern nach Resets aus dem RAM-Cache
        let filteredGames = [];
        historyCache.forEach((game) => {
            const gameSecs = game.timestamp ? game.timestamp.seconds : 0;
            const personalResetSecs = userResets[game.username] || 0;
            
            if (gameSecs > globalHistoryResetSecs && gameSecs > personalResetSecs) {
                filteredGames.push(game);
            }
        });

        // Zeige maximal die 20 neuesten an (bereits sortiert)
        const limitGames = filteredGames.slice(0, 20);

        renderHistoryHTML(limitGames, container, displayNames);
    } catch (error) {
        console.error("Fehler beim Rendern der Historie:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Historie.</p>';
    }
}