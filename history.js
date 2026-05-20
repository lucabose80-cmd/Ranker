// history.js
import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where, limit, orderBy, Timestamp, setDoc, doc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser, markCharactersAsDiscovered } from './auth.js';
import { currentMode } from './mode-state.js';
import { getResets } from './resets.js';
import { trackRead, trackWrite } from './tracker.js';
import { starWarsCharacters } from './data-starwars.js';

let historyCache = [];
let historyUnsubscribe = null;
let isFirstLoadComplete = false;

// Gibt die aktuell gecachten Historien-Daten zurück
export function getCachedHistory() {
    return { data: historyCache, isLoaded: isFirstLoadComplete };
}

let currentListenerMode = null;

// Startet den Echtzeit-Sync für den aktuellen Modus
export function initHistoryListener(force = false) {
    if (!force && historyUnsubscribe && currentListenerMode === currentMode) {
        return;
    }
    currentListenerMode = currentMode;
    if (historyUnsubscribe) {
        historyUnsubscribe();
    }
    isFirstLoadComplete = false;

    const q = query(collection(db, "history"), where("mode", "==", currentMode), orderBy("timestamp", "desc"), limit(24));
    
    const handleHistorySnapshot = (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        const games = [];
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
            const filterSelect = document.getElementById('scoreboard-user-filter');
            if (filterSelect) {
                const event = new Event('change');
                filterSelect.dispatchEvent(event);
            }
        }
    };

    const handleHistoryError = (error) => {
        console.error("Fehler im History-Listener:", error);
        if (error?.message?.includes('index')) {
            const fallbackQuery = query(collection(db, "history"), orderBy("timestamp", "desc"), limit(24));
            historyUnsubscribe = onSnapshot(fallbackQuery, handleHistorySnapshot, (fallbackError) => {
                console.error("History listener fallback error:", fallbackError);
            });
        }
    };

    historyUnsubscribe = onSnapshot(q, handleHistorySnapshot, handleHistoryError);
}

// Beendet den Echtzeit-Sync für die Historie, um Reads im Hintergrund zu sparen
export function stopHistoryListener() {
    if (historyUnsubscribe) {
        historyUnsubscribe();
        historyUnsubscribe = null;
        currentListenerMode = null;
    }
}
// Speichert ein fertiges Spiel in der Cloud
export async function saveGameToHistory(placedCharacters, rating, pool, gameType = 'classic') {
    let user = getCurrentUser();
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

    // Warten bis Charaktere als entdeckt markiert sind (aktualisiert localStorage)
    await markCharactersAsDiscovered(rankingData.map(c => c.name));
    // Aktuellen User aus localStorage neu laden, damit die Entdeckungen nicht überschrieben werden
    user = getCurrentUser();

    const poolData = pool ? pool.map((c, idx) => ({ order: idx + 1, name: c.name, img: c.img })) : [];

    const activeTitle = currentMode === 'starwars' ? (user.activeTitle_starwars || '') : (user.activeTitle_waifu || '');

    try {
        await addDoc(collection(db, "history"), {
            username: user.username,
            displayName: user.displayName || user.username,
            mode: currentMode,
            gameType: gameType,
            rating: rating,
            ranking: rankingData,
            pool: poolData,
            title: activeTitle,
            timestamp: Timestamp.now()
        });
        trackWrite(1);
        
        // Update User Games Played locally and in DB
        const gamesPlayedField = `gamesPlayed_${currentMode}`;
        user[gamesPlayedField] = (user[gamesPlayedField] || 0) + 1;

        // Track tags for themes – 5 of the same tag in a single game unlocks the theme
        if (currentMode === 'starwars' && gameType === 'classic') {
            const { activeCharacterDatabase } = await import('./theme.js');
            const charLookup = {};
            activeCharacterDatabase.forEach(c => { charLookup[c.name] = c.tags || []; });
            
            const tagCountsThisGame = {};
            rankingData.forEach(item => {
                (charLookup[item.name] || []).forEach(tag => {
                    tagCountsThisGame[tag] = (tagCountsThisGame[tag] || 0) + 1;
                });
            });
            
            if (!user.unlocked_themes_starwars) user.unlocked_themes_starwars = [];
            let unlockedAny = false;
            
            Object.entries(tagCountsThisGame).forEach(([tag, count]) => {
                if (count === 5) {
                    const themeId = `sw_theme_${tag}`;
                    if (!user.unlocked_themes_starwars.includes(themeId)) {
                        user.unlocked_themes_starwars.push(themeId);
                        unlockedAny = true;
                    }
                }
            });
            
            if (unlockedAny) {
                const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                updateDoc(doc(db, "users", user.uid), {
                    unlocked_themes_starwars: user.unlocked_themes_starwars
                }).catch(e => console.error(e));
                trackWrite(1);
            }
        }


        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        
        // Asynchron das increment absenden
        const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        updateDoc(doc(db, "users", user.uid), {
            [gamesPlayedField]: increment(1)
        }).catch(e => console.error(e));
        trackWrite(1);

        // --- AGGREGATED SCOREBOARD SYSTEM ---
        const ratingMulti = parseInt(rating) || 1;
        
        let characterUpdates = {};

        rankingData.forEach(item => {
            const rank = parseInt(item.rank);
            const basePoints = (count + 1) - rank; 
            const totalPoints = basePoints * ratingMulti;
            // Firesore Key safe machen
            const safeName = item.name.replace(/[\.\/\[\]~#]/g, '_');
            
            characterUpdates[safeName] = {
                score: increment(totalPoints),
                name: item.name,
                img: item.img
            };
        });

        const updates = {
            characters: characterUpdates,
            lastUpdated: Timestamp.now()
        };

        // Update Global Score
        await setDoc(doc(db, "scores", `${currentMode}_${gameType}_global`), updates, { merge: true });
        trackWrite(1);

        // Update Personal Score
        await setDoc(doc(db, "scores", `${currentMode}_${gameType}_${user.username}`), updates, { merge: true });
        trackWrite(1);

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
        const titleHtml = game.title && game.title !== 'Kein Titel' ? `<div style="font-size:0.7rem; color:#ffd700; font-weight:bold; letter-spacing:1px; text-transform:uppercase; margin-top:2px;">${game.title}</div>` : '';

        card.innerHTML = `
            <div class="history-header">
                <div>
                    <strong>${displayNameToUse}${modeBadge}</strong>
                    ${titleHtml}
                </div>
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
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            openArchiveDetailModal(game);
        });
        container.appendChild(card);
    });
}

function openArchiveDetailModal(game) {
    const isAdvanced = game.gameType === 'advanced' || game.ranking.length > 5;
    const maxSlots = isAdvanced ? 10 : 5;
    
    const modal = document.getElementById('spectator-modal');
    if (!modal) return;
    
    document.getElementById('spectator-title').textContent = `ARCHIV: ${game.displayName || game.username}s Ranking (${isAdvanced ? 'Advanced' : 'Klassisch'})`;
    const board = document.getElementById('spectator-board');
    board.innerHTML = '';
    
    if (isAdvanced) {
        board.className = 'horizontal-board advanced-board';
    } else {
        board.className = 'horizontal-board';
    }

    // Ranking-Board
    for (let i = 1; i <= maxSlots; i++) {
        const item = game.ranking.find(r => r.rank === i);
        board.innerHTML += `
            <div class="rank-column">
                <div class="card-container">
                    <span class="rank-number">${i}</span>
                    <div class="card-content" style="border-style: ${item ? 'solid' : 'dashed'}">
                        ${item ? `<img src="${item.img}">` : '<span class="placeholder-icon">👤</span>'}
                    </div>
                </div>
                <div class="card-label"><span>${item ? item.name : '???'}</span></div>
            </div>
        `;
    }

    // Pool anzeigen (Reihenfolge)
    const poolContainer = document.getElementById('spectator-pool');
    if (poolContainer && game.pool && game.pool.length > 0) {
        poolContainer.classList.remove('hidden');
        const sortedPool = [...game.pool].sort((a, b) => a.order - b.order);
        poolContainer.innerHTML = `
            <h4 class="spectator-pool-title">Erscheinungsreihenfolge</h4>
            <div class="spectator-pool-grid">
                ${sortedPool.map((char) => `
                    <div class="spectator-pool-item pool-placed" title="${char.name}">
                        <img src="${char.img}">
                        <span>${char.name}</span>
                        <div class="pool-order-badge">${char.order}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (poolContainer) {
        poolContainer.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

let isHistoryFilterListenerAttached = false;

// Holt die gefilterten Spiele aus dem lokalen Echtzeit-Cache und rendert sie instant
export async function renderHistory() {
    const container = document.getElementById('history-list');
    const typeSelect = document.getElementById('history-type-filter');
    const selectedType = typeSelect ? typeSelect.value : 'classic';

    if (typeSelect && !isHistoryFilterListenerAttached) {
        typeSelect.addEventListener('change', () => {
            renderHistory();
        });
        isHistoryFilterListenerAttached = true;
    }
    
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

        // Filtern nach Resets und Spieltyp aus dem RAM-Cache
        let filteredGames = [];
        historyCache.forEach((game) => {
            const gameSecs = game.timestamp ? game.timestamp.seconds : 0;
            const personalResetSecs = userResets[game.username] || 0;
            
            if (gameSecs > globalHistoryResetSecs && gameSecs > personalResetSecs) {
                const isGameAdvanced = game.gameType === 'advanced' || game.ranking.length > 5;
                if (selectedType === 'advanced' && isGameAdvanced) {
                    filteredGames.push(game);
                } else if (selectedType === 'classic' && !isGameAdvanced) {
                    filteredGames.push(game);
                }
            }
        });

        // Zeige maximal die 12 neuesten an (bereits sortiert)
        const limitGames = filteredGames.slice(0, 12);

        renderHistoryHTML(limitGames, container, displayNames);
    } catch (error) {
        console.error("Fehler beim Rendern der Historie:", error);
        container.innerHTML = '<p class="prompt-text" style="color: #ff4757;">Fehler beim Laden der Historie.</p>';
    }
}