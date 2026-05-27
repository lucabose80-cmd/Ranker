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

// Gibt die aktuell gecachten Historien-Daten zur?ck
export function getCachedHistory() {
    return { data: historyCache, isLoaded: isFirstLoadComplete };
}

let currentListenerMode = null;

// Startet den Echtzeit-Sync f?r den aktuellen Modus
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
        
        const games = snapshot.docs.map(doc => doc.data())
            .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

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

// Beendet den Echtzeit-Sync f?r die Historie, um Reads im Hintergrund zu sparen
export function stopHistoryListener() {
    if (historyUnsubscribe) {
        historyUnsubscribe();
        historyUnsubscribe = null;
        currentListenerMode = null;
    }
}

let lastSaveTime = 0;
let lastSavedGameHash = "";

// Speichert ein fertiges Spiel in der Cloud
export async function saveGameToHistory(placedCharacters, rating, pool, gameType = 'classic', category = 'normal') {
    let user = getCurrentUser();
    if (!user || user.role === 'admin' || user.isTestUser) return;

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

    // Anti-Spam / Anti-Cheat: Verhindere das Speichern des exakt selben Spiels mehrfach
    const gameHash = rankingData.map(c => c.name).join('|') + "_" + gameType;
    const now = Date.now();
    
    if (now - lastSaveTime < 3000) return; // 3 Sekunden Cooldown
    if (gameHash === lastSavedGameHash) {
        console.warn("Dieses Spiel wurde bereits in der Historie gespeichert!");
        return; // Exakt gleiches Spiel wird nicht nochmal gewertet
    }
    
    lastSaveTime = now;
    lastSavedGameHash = gameHash;

    // Warten bis Charaktere als entdeckt markiert sind (aktualisiert localStorage)
    await markCharactersAsDiscovered(rankingData.map(c => c.name));
    // Aktuellen User aus localStorage neu laden, damit die Entdeckungen nicht ?berschrieben werden
    user = getCurrentUser();

    const poolData = pool ? pool.map((c, idx) => ({ order: idx + 1, name: c.name, img: c.img })) : [];

    const activeTitle = currentMode === 'starwars' ? (user.activeTitle_starwars || '') : (user.activeTitle_waifu || '');

    try {
        await addDoc(collection(db, "history"), {
            username: user.username,
            displayName: user.displayName || user.username,
            mode: currentMode,
            gameType: gameType,
            category: category,
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
        
        const klonGamesPlayedField = `gamesPlayed_${currentMode}_klon`;
        if (category === 'klon') {
            user[klonGamesPlayedField] = (user[klonGamesPlayedField] || 0) + 1;
        }

        // Grant Credits (10 for first 20 times per category, 5 afterwards)
        let earnedCredits = false;
        let earnedCreditAmount = 0;
        if (gameType === 'classic' || gameType === 'hardcore') {
            const cat = category || 'normal';
            const catField = `credits_earned_${currentMode}_${cat}`;
            const totalEarned = user[catField] || 0;
            
            user[catField] = totalEarned + 1;
            if (totalEarned < 20) {
                earnedCreditAmount = 10;
            } else {
                earnedCreditAmount = 5;
            }
            
            user.credits = (user.credits || 0) + earnedCreditAmount;
            earnedCredits = true;
            
            if (window.updateCreditProgressBars) {
                window.updateCreditProgressBars();
            }
        }

        // Track tags for themes ? 5 of the same tag in a single game unlocks the theme
        if (gameType === 'classic' && category === 'normal') {
            const { activeCharacterDatabase } = await import('./theme.js');
            const { THEMES } = await import('./themes.js');
            
            const charLookup = {};
            activeCharacterDatabase.forEach(c => { charLookup[c.name] = c.tags || []; });
            
            const tagCountsThisGame = {};
            rankingData.forEach(item => {
                (charLookup[item.name] || []).forEach(tag => {
                    tagCountsThisGame[tag] = (tagCountsThisGame[tag] || 0) + 1;
                });
            });
            
            const themesField = `unlocked_themes_${currentMode}`;
            if (!user[themesField]) user[themesField] = [];
            let unlockedAnyTheme = false;
            
            const availableThemes = THEMES[currentMode] || [];
            availableThemes.forEach(themeObj => {
                if (!user[themesField].includes(themeObj.id) && themeObj.condition && themeObj.condition.type === 'tag_full_team') {
                    const tag = themeObj.condition.tag;
                    const reqCount = themeObj.condition.count || 5;
                    if ((tagCountsThisGame[tag] || 0) >= reqCount) {
                        user[themesField].push(themeObj.id);
                        unlockedAnyTheme = true;
                        if (window.showUnlockNotification) {
                            window.showUnlockNotification('theme', themeObj.name);
                        }
                    }
                }
            });
            
            if (unlockedAnyTheme) {
                const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                updateDoc(doc(db, "users", user.uid), {
                    [themesField]: user[themesField]
                }).catch(e => console.error(e));
                trackWrite(1);
            }
        }
        
        // Title unlocks (Regular + Secret)
        const { TITLES } = await import('./titles.js');
        const titlesField = `unlocked_titles_${currentMode}`;
        if (!user[titlesField]) user[titlesField] = [];
        let unlockedAnyTitle = false;
        
        const oldGamesPlayed = (user[gamesPlayedField] || 1) - 1;
        const newGamesPlayed = user[gamesPlayedField];

        if (gameType === 'classic' && category === 'normal') {
            (TITLES[currentMode] || []).forEach(t => {
                if (t.secret) {
                    // Check secret conditions
                    if (t.condition && t.condition.type === 'has_characters') {
                        const hasAll = t.condition.chars.every(charName => rankingData.some(r => r.name === charName));
                        if (hasAll && !user[titlesField].includes(t.id)) {
                            user[titlesField].push(t.id);
                            unlockedAnyTitle = true;
                            if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                    } else if (t.condition && t.condition.type === 'has_discovered_characters') {
                        const discoveredList = user.discovered || [];
                        const hasAll = t.condition.chars.every(charName => discoveredList.includes(charName));
                        if (hasAll && !user[titlesField].includes(t.id)) {
                            user[titlesField].push(t.id);
                            unlockedAnyTitle = true;
                            if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                    } else if (t.condition && t.condition.type === 'has_tag_in_round') {
                        const count = rankingData.filter(r => r.tags && r.tags.includes(t.condition.tag)).length;
                        if (count >= t.condition.count && !user[titlesField].includes(t.id)) {
                            user[titlesField].push(t.id);
                            unlockedAnyTitle = true;
                            if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                    }
                } else {
                    // Regular titles
                    if (newGamesPlayed >= t.required) {
                        if (!user[titlesField].includes(t.id)) {
                            user[titlesField].push(t.id);
                            unlockedAnyTitle = true;
                            if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                    }
                }
            });
        }

        // Special Top5 / Bottom5 check
        const missingSpecialTitles = (TITLES[currentMode] || []).filter(t => t.condition && t.condition.type && t.condition.type.startsWith('special_') && !user[titlesField].includes(t.id));
        if (missingSpecialTitles.length > 0 && gameType === 'classic' && category === 'normal') {
            const { getDoc, doc: fDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
            const gScoresSnap = await getDoc(fDoc(db, "scores", `${currentMode}_classic_global`));
            if (gScoresSnap.exists()) {
                const chars = Object.values(gScoresSnap.data().characters || {});
                chars.sort((a,b) => (b.score / (b.count || 1)) - (a.score / (a.count || 1)));
                
                if (chars.length >= 5) {
                    const top5 = chars.slice(0, 5).map(c => c.name);
                    const bottom5 = chars.slice(-5).map(c => c.name);
                    
                    const pickedNames = rankingData.map(r => r.name);
                    const hasTop5 = pickedNames.every(n => top5.includes(n));
                    const hasBottom5 = pickedNames.every(n => bottom5.includes(n));
                    
                    missingSpecialTitles.forEach(t => {
                        if (t.condition.type === 'special_top5' && hasTop5) {
                            user[titlesField].push(t.id); unlockedAnyTitle = true; if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                        if (t.condition.type === 'special_bottom5' && hasBottom5) {
                            user[titlesField].push(t.id); unlockedAnyTitle = true; if (window.showUnlockNotification) window.showUnlockNotification('title', t.name);
                        }
                    });
                }
            }
        }

        if (unlockedAnyTitle) {
            const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
            updateDoc(doc(db, "users", user.uid), {
                [titlesField]: user[titlesField]
            }).catch(e => console.error(e));
            trackWrite(1);
        }


        const topChar = rankingData[0].name;
        const bottomChar = rankingData[rankingData.length - 1].name;
        
        const favField = `favorites_${currentMode}`;
        const nemField = `nemesis_${currentMode}`;
        if (!user[favField]) user[favField] = {};
        if (!user[nemField]) user[nemField] = {};
        user[favField][topChar] = (user[favField][topChar] || 0) + 1;
        user[nemField][bottomChar] = (user[nemField][bottomChar] || 0) + 1;

        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        
        // Asynchron das increment absenden
        const { updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        
        const updatePayload = {
            [gamesPlayedField]: increment(1),
            [`${favField}.${topChar}`]: increment(1),
            [`${nemField}.${bottomChar}`]: increment(1)
        };
        if (category === 'klon') {
            updatePayload[`gamesPlayed_${currentMode}_klon`] = increment(1);
        }
        
        if (earnedCredits) {
            const cat = category || 'normal';
            updatePayload[`credits_earned_${currentMode}_${cat}`] = increment(1);
            updatePayload.credits = increment(earnedCreditAmount);
        }
        
        updateDoc(doc(db, "users", user.uid), updatePayload).catch(e => console.error(e));
        trackWrite(1);

        // --- ANTI CHEAT SYSTEM ---
        let skipScoreboardUpdate = false;
        
        const lastRatingKey = `antiCheat_lastRating_${currentMode}_${gameType}`;
        const lastPatternKey = `antiCheat_lastPattern_${currentMode}_${gameType}`;
        const prevRating = localStorage.getItem(lastRatingKey);
        const prevPattern = localStorage.getItem(lastPatternKey);
        
        let patternStr = "";
        if (poolData && poolData.length > 0) {
            rankingData.forEach(item => {
                const pItem = poolData.find(p => p.name === item.name);
                if (pItem) patternStr += pItem.order;
            });
        }
        
        const isLinearPattern = patternStr === "12345" || patternStr === "54321" || patternStr === "12345678910" || patternStr === "10987654321";
        
        if (isLinearPattern) skipScoreboardUpdate = true;
        if (prevRating && prevRating === rating.toString()) skipScoreboardUpdate = true;
        if (prevPattern && prevPattern === patternStr) skipScoreboardUpdate = true;

        localStorage.setItem(lastRatingKey, rating.toString());
        if (patternStr) localStorage.setItem(lastPatternKey, patternStr);

        if (skipScoreboardUpdate) {
            console.log("Anti-Cheat: Scoreboard update ?bersprungen wegen wiederholtem Muster oder Wertung.");
            return; // Beende die Funktion hier, damit Scoreboard nicht gef?llt wird
        }

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
                count: increment(1),
                name: item.name,
                img: item.img
            };
        });

        const updates = {
            characters: characterUpdates,
            lastUpdated: Timestamp.now()
        };

        const suffix = category === 'normal' || !category ? '' : '_' + category;
        
        // Update Global Score
        await setDoc(doc(db, "scores", `${currentMode}_${gameType}${suffix}_global`), updates, { merge: true });
        trackWrite(1);

        // Update Personal Score
        await setDoc(doc(db, "scores", `${currentMode}_${gameType}${suffix}_${user.username}`), updates, { merge: true });
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
        const isAdvanced = game.gameType === 'advanced' || (game.ranking && game.ranking.length > 5);
        card.className = `history-card ${game.mode}-card ${isAdvanced ? 'advanced-history-card' : ''}`;

        if (game.type === 'versus') {
            const winnerNames = game.winners.map(wId => {
                const p = game.players.find(pl => pl.uid === wId);
                return p ? p.displayName : '???';
            }).join(', ');
            
            card.innerHTML = `
                <div class="history-header">
                    <div>
                        <strong>VERSUS MATCH</strong>
                        <div style="font-size:0.7rem; color:#ffd700; font-weight:bold; letter-spacing:1px; text-transform:uppercase; margin-top:2px;">Gewinner: ${winnerNames}</div>
                    </div>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-images" style="justify-content: center; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">&#x1F0CF;</span>
                    <span>${game.players.length} Spieler</span>
                </div>
            `;
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                openVersusResultModal(game);
            });
            container.appendChild(card);
            return;
        }

        if (game.type === 'cardgame') {
            const isWin = game.result === 'Sieg';
            const color = isWin ? '#2ed573' : (game.result === 'Niederlage' ? '#ff4757' : '#ffd700');
            card.innerHTML = `
                <div class="history-header">
                    <div>
                        <strong>CARDGAME ${game.isBot ? '(BOT)' : '(ONLINE)'}</strong>
                        <div style="font-size:0.75rem; color:${color}; font-weight:bold; margin-top:2px;">${game.result} vs ${game.opponent}</div>
                    </div>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-images" style="justify-content: center; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">&#x1F0CF;</span>
                    <span>Score: ${game.score}</span>
                </div>
            `;
            card.style.cursor = "pointer";
            card.addEventListener("click", () => { openCardgameResultModal(game); });
            container.appendChild(card);
            return;
        }

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

export async function openCardgameResultModal(game) {
    let modal = document.getElementById("cardgame-result-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cardgame-result-modal";
        modal.className = "modal hidden";
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px; max-height:90vh; overflow-y:auto;">
                <h2 style="color:#ffd700; margin-top:0;">Match Details</h2>
                <div id="cardgame-result-content"></div>
                <button id="close-cardgame-result-btn" class="rank-btn" style="margin-top:20px; width:100%;">Schlieﬂen</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById("close-cardgame-result-btn").onclick = () => modal.classList.add("hidden");
    }
    
    const content = document.getElementById("cardgame-result-content");
    content.innerHTML = "<p>Lade Ergebnisse...</p>";
    modal.classList.remove("hidden");

    const { activeCharacterDatabase } = await import("./theme.js");
    
    const getImgForChar = (name) => {
        const c = activeCharacterDatabase.find(x => x.name === name);
        return c ? c.img : "https://i.imgur.com/kS5x87t.png";
    };

    const getRarityColor = (rarity) => {
        if(rarity === "legendary") return "#ffd700";
        if(rarity === "epic") return "#9b59b6";
        if(rarity === "rare") return "#ff9f43";
        return "#888";
    };

    const renderDeck = (deck) => {
        if (!deck || deck.length === 0) return "<p style='color:#888; text-align:center;'>Kein Deck gefunden (Altes Match)</p>";
        return `<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:10px;">
            ${deck.map(c => `
                <div style="border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center;">
                    <img src="${getImgForChar(c.charName)}" style="width:100%; height:80px; object-fit:cover; border-radius:3px;">
                    <div style="font-size:0.7rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:3px;">${c.charName}</div>
                </div>
            `).join("")}
        </div>`;
    };

    content.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                <h3 style="color:#2ed573; margin-top:0; border-bottom:1px solid #333; padding-bottom:5px;">${game.username} (Du)</h3>
                ${renderDeck(game.playerDeck)}
            </div>
            <div style="text-align:center; font-size:1.5rem; font-weight:bold; color:#fff;">
                SCORE: ${game.score}
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                <h3 style="color:#ff4757; margin-top:0; border-bottom:1px solid #333; padding-bottom:5px;">${game.opponent} (Gegner)</h3>
                ${renderDeck(game.opponentDeck)}
            </div>
        </div>
    `;
}


export async function openCardgameResultModal(game) {
    let modal = document.getElementById("cardgame-result-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cardgame-result-modal";
        modal.className = "modal hidden";
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px; max-height:90vh; overflow-y:auto; background:#1a1e29; border:1px solid #333;">
                <h2 style="color:#ffd700; margin-top:0; text-align:center;">Match Details</h2>
                <div id="cardgame-result-content"></div>
                <button id="close-cardgame-result-btn" class="rank-btn" style="margin-top:20px; width:100%;">Schlieﬂen</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById("close-cardgame-result-btn").onclick = () => modal.classList.add("hidden");
    }
    
    const content = document.getElementById("cardgame-result-content");
    content.innerHTML = "<p>Lade Ergebnisse...</p>";
    modal.classList.remove("hidden");

    const { activeCharacterDatabase } = await import("./theme.js");
    
    const getImgForChar = (name) => {
        const c = activeCharacterDatabase.find(x => x.name === name);
        return c ? c.img : "https://i.imgur.com/kS5x87t.png";
    };

    const getRarityColor = (rarity) => {
        if(rarity === "legendary") return "#ffd700";
        if(rarity === "epic") return "#9b59b6";
        if(rarity === "rare") return "#ff9f43";
        return "#888";
    };

    const renderDeck = (deck) => {
        if (!deck || deck.length === 0) return "<p style='color:#888; text-align:center;'>Kein Deck gefunden (Altes Match)</p>";
        return `<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:10px;">
            ${deck.map(c => `
                <div style="border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center;">
                    <img src="${getImgForChar(c.charName)}" style="width:100%; height:80px; object-fit:cover; border-radius:3px;">
                    <div style="font-size:0.7rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:3px;">${c.charName}</div>
                </div>
            `).join("")}
        </div>`;
    };

    content.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                <h3 style="color:#2ed573; margin-top:0; border-bottom:1px solid #333; padding-bottom:5px;">${game.username} (Du)</h3>
                ${renderDeck(game.playerDeck)}
            </div>
            <div style="text-align:center; font-size:1.5rem; font-weight:bold; color:#fff;">
                SCORE: ${game.score}
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                <h3 style="color:#ff4757; margin-top:0; border-bottom:1px solid #333; padding-bottom:5px;">${game.opponent} (Gegner)</h3>
                ${renderDeck(game.opponentDeck)}
            </div>
        </div>
    `;
}

export async function openVersusResultModal(game) {
    const modal = document.getElementById('versus-result-modal');
    if (!modal) return;
    
    const content = document.getElementById('versus-result-content');
    content.innerHTML = '<p>Lade Ergebnisse...</p>';
    modal.classList.remove('hidden');

    const { activeCharacterDatabase } = await import('./theme.js');
    const getImgForChar = (name) => {
        const c = activeCharacterDatabase.find(x => x.name === name);
        return c ? c.img : 'https://i.imgur.com/kS5x87t.png';
    };
    
    // Fallbacks falls alte Datenstruktur geladen wird
    const safePerfectRanking = game.perfectRanking || game.characters || [];
    const safeWinners = game.winners || [];
    const safePlayers = game.players || [];
    
    // Close Button sofort binden, damit er auch bei Fehlern funktioniert
    document.getElementById('close-versus-result-btn').onclick = () => {
        modal.classList.add('hidden');
    };
    
    content.innerHTML = '';
    
    const winnerNames = safeWinners.map(uid => safePlayers.find(p => p.uid === uid)?.displayName || 'Unbekannt');
    const isTie = safeWinners.length === safePlayers.length && safePlayers.length > 1;
    const winnerBannerText = isTie ? "UNENTSCHIEDEN!" : `GEWINNER: ${winnerNames.join(', ')}`;
    
    content.innerHTML += `
        <div style="text-align:center; padding: 15px; border-radius: 8px; background: rgba(46, 213, 115, 0.2); border: 2px solid #2ed573;">
            <h2 style="margin:0; color:#2ed573; text-transform:uppercase; letter-spacing:2px; font-size:1.5rem;">${winnerBannerText}</h2>
        </div>
    `;
    
    content.innerHTML += `
        <div style="border: 1px solid #ffd700; padding: 10px; border-radius: 8px;">
            <h4 style="margin:0 0 10px 0; color:#ffd700;">Globales Konsens-Ranking (Perfekt)</h4>
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                ${safePerfectRanking.map((charName, i) => `
                    <div style="text-align:center;">
                        <img src="${getImgForChar(charName)}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                        <div style="font-size:0.7rem; font-weight:bold;">#${i+1}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    const sortedPlayers = [...safePlayers].sort((a,b) => (a.score || 0) - (b.score || 0));
    
    sortedPlayers.forEach(p => {
        const isWinner = safeWinners.includes(p.uid);
        content.innerHTML += `
            <div style="background: ${isWinner ? 'rgba(46, 213, 115, 0.2)' : 'rgba(0,0,0,0.3)'}; padding: 10px; border-radius: 8px; border: 1px solid ${isWinner ? '#2ed573' : '#333'};">
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.avatar}" style="width:30px; height:30px; border-radius:50%; border: 1px solid #555;">
                        <strong>${p.displayName}</strong>
                    </div>
                    <div style="font-size:0.8rem; color:#aaa;">Abweichung: <strong style="color:${isWinner ? '#2ed573' : '#fff'};">${p.score}</strong></div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${(p.picks || []).map((charName, i) => {
                        const perfectRank = safePerfectRanking.indexOf(charName) + 1;
                        const diff = Math.abs((i+1) - perfectRank);
                        const diffColor = diff === 0 ? '#2ed573' : (diff === 1 ? '#ffd700' : '#ff4757');
                        return `
                            <div style="text-align:center;">
                                <img src="${getImgForChar(charName)}" style="width:40px; height:40px; border-radius:4px; object-fit:cover; border-bottom: 3px solid ${diffColor};">
                                <div style="font-size:0.7rem; font-weight:bold;">#${i+1}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    // Render bets results
    const bets = game.bets || [];
    const pool = game.prizePool || 0;
    const winnersList = game.betWinners || [];
    
    let payoutInfo = '';
    if (bets.length > 0) {
        if (winnersList.length > 0) {
            payoutInfo = `
                <div style="background:rgba(46, 213, 115, 0.1); border:1px solid #2ed573; border-radius:6px; padding:10px; margin-bottom:10px; text-align:center;">
                    <span style="color:#2ed573; font-weight:bold; font-size:0.85rem;">
                        Gewinner der Wette erhalten je ${winnersList[0].payout} Credits:
                    </span>
                    <div style="color:#fff; font-size:0.85rem; margin-top:4px;">
                        ${winnersList.map(w => w.displayName).join(', ')}
                    </div>
                </div>
            `;
        } else {
            payoutInfo = `
                <div style="background:rgba(255,255,255,0.05); border:1px solid #666; border-radius:6px; padding:10px; margin-bottom:10px; text-align:center; color:#ccc; font-size:0.85rem;">
                    Kein Spieler hat richtig getippt. Die Eins?tze wurden zur?ckerstattet.
                </div>
            `;
        }
    } else {
        payoutInfo = `
            <div style="background:rgba(255,255,255,0.02); border:1px dashed #444; border-radius:6px; padding:10px; margin-bottom:10px; text-align:center; color:#888; font-size:0.85rem;">
                Keine Wetten in dieser Runde platziert.
            </div>
        `;
    }
    
    content.innerHTML += `
        <div style="margin-top: 15px; border: 1px solid #333; padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.2);">
            <h4 style="margin:0 0 10px 0; color:#ffd700; font-size:0.9rem; text-transform:uppercase;">Wett-Auswertung (Pool: ${pool} Credits)</h4>
            ${payoutInfo}
            ${bets.length > 0 ? `
                <div style="font-size:0.8rem; color:#94a3b8; max-height:120px; overflow-y:auto; background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; border:1px solid #222;">
                    ${bets.map(b => {
                        const correct = safeWinners.includes(b.targetUid);
                        const statusColor = correct ? '#2ed573' : '#ff4757';
                        const statusIcon = correct ? '?' : '?';
                        return `
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span>${b.displayName} gewettet auf ${b.targetName} (${b.amount} Credits)</span>
                                <span style="color:${statusColor}; font-weight:bold;">${statusIcon}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
        </div>
    `;
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
                        ${item ? `<img src="${item.img}">` : '<span class="placeholder-icon">??</span>'}
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
                const isVersus = game.type === 'versus';
                const isGameAdvanced = game.gameType === 'advanced' || (game.ranking && game.ranking.length > 5);
                
                let gameCategory = game.category || 'normal';
                
                let isMatch = false;
                if (selectedType === 'versus' && isVersus && gameCategory === 'normal') isMatch = true;
                else if (selectedType === 'versus_klon' && isVersus && gameCategory === 'klon') isMatch = true;
                else if (selectedType === 'versus_peak' && isVersus && gameCategory === 'peak') isMatch = true;
                else if (selectedType === 'versus_vehicle' && isVersus && gameCategory === 'vehicle') isMatch = true;
                else if (selectedType === 'advanced' && isGameAdvanced && !isVersus) isMatch = true;
                else if (selectedType === 'classic' && !isGameAdvanced && !isVersus && game.type !== 'cardgame' && gameCategory === 'normal') isMatch = true;
                else if (selectedType === 'classic_klon' && !isGameAdvanced && !isVersus && gameCategory === 'klon') isMatch = true;
                else if (selectedType === 'classic_peak' && !isGameAdvanced && !isVersus && gameCategory === 'peak') isMatch = true;
                else if (selectedType === 'cardgame' && game.type === 'cardgame') isMatch = true;
                else if (selectedType === 'classic_vehicle' && !isGameAdvanced && !isVersus && gameCategory === 'vehicle') isMatch = true;
                
                if (isMatch) filteredGames.push(game);
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







