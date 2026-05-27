import { getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';
import { doc, getDoc, getDocs, updateDoc, collection, query, where, setDoc, deleteDoc, Timestamp, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let playerDecks = { deck0: [], deck1: [], deck2: [] };
let activeDeckIndex = 0;
let playerDeck = [];
let opponentDeck = [];
let opponentData = null;
let currentRound = 1;
let playerScore = 0;
let opponentScore = 0;
let playedPlayerCards = [];
let playedOpponentCards = [];
let globalScoresCache = {};
let isBotMatch = false;
let liveMatchActive = false;

const RARITY_MULT = { 'common': 1.0, 'rare': 1.1, 'epic': 1.3, 'legendary': 1.5 };
const RARITY_ORDER = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };

const FACTION_ADVANTAGE = {
    'jedi': 'sith',
    'sith': 'rebell',
    'rebell': 'imperium',
    'imperium': 'mandalorianer',
    'mandalorianer': 'klon',
    'klon': 'jedi',
    'kopfgeldj?ger': 'jedi',
    'droid': 'kopfgeldj?ger'
};

function getMainFaction(tags) {
    if(!tags) return 'neutral';
    const tg = tags.map(t => t.toLowerCase());
    if(tg.includes('jedi')) return 'jedi';
    if(tg.includes('sith')) return 'sith';
    if(tg.includes('klon')) return 'klon';
    if(tg.includes('rebell') || tg.includes('rebellion')) return 'rebell';
    if(tg.includes('imperium')) return 'imperium';
    if(tg.includes('mandalorianer') || tg.includes('mandalorian')) return 'mandalorianer';
    if(tg.includes('kopfgeldj?ger') || tg.includes('kopfgeldjaeger')) return 'kopfgeldj?ger';
    if(tg.includes('droid') || tg.includes('droide')) return 'droid';
    return 'neutral';
}

function calculateSynergy(deck) {
    if(!deck || deck.length === 0) return [];
    const counts = {};
    deck.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        const f = getMainFaction(dbC ? dbC.tags : []);
        if(f !== 'neutral') { counts[f] = (counts[f] || 0) + 1; }
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2);
    return top2.map(t => ({ faction: t[0], count: t[1], mult: 1.0 + (t[1] * 0.01) }));
}

function getSynergyMult(synergies) {
    let total = 1.0;
    synergies.forEach(s => { total += (s.mult - 1.0); });
    return total;
}

async function loadGlobalScores() {
    if(globalScoresCache[currentMode]) return globalScoresCache[currentMode];
    try {
        const docRef = doc(db, "scores", `${currentMode}_classic_all`);
        const snap = await getDoc(docRef);
        if(snap.exists() && snap.data().characters) {
            const chars = snap.data().characters;
            const res = {};
            for(const [name, data] of Object.entries(chars)) {
                res[name] = data.score / (data.count || 1);
            }
            globalScoresCache[currentMode] = res;
            return res;
        }
    } catch(e) { console.error("Error loading scores", e); }
    return {};
}

function getCardScore(charName) {
    const scores = globalScoresCache[currentMode] || {};
    return scores[charName] || 2.5;
}

export function initCardgame() {
    document.getElementById('cardgame-deck-selector').addEventListener('change', (e) => {
        activeDeckIndex = parseInt(e.target.value);
    });

    document.getElementById('cardgame-btn-deck').addEventListener('click', () => {
        document.getElementById('cardgame-main-menu').classList.add('hidden');
        document.getElementById('cardgame-deckbuilder').classList.remove('hidden');
        renderDeckbuilder();
    });
    
    document.getElementById('cardgame-deck-back').addEventListener('click', () => {
        document.getElementById('cardgame-deckbuilder').classList.add('hidden');
        document.getElementById('cardgame-main-menu').classList.remove('hidden');
    });

    document.getElementById('cardgame-sort-select').addEventListener('change', () => {
        renderInventory();
    });

    document.getElementById('cardgame-save-deck').addEventListener('click', async () => {
        if(playerDeck.length !== 10) { alert("Dein Deck muss genau 10 Karten enthalten!"); return; }
        const user = getCurrentUser();
        if(!user) return;
        const field = currentMode === 'starwars' ? 'decks_starwars' : 'decks_waifu';
        
        let savedDecks = user[field];
        if(!savedDecks || Array.isArray(savedDecks)) { 
            savedDecks = { deck0: [], deck1: [], deck2: [] }; 
        }
        savedDecks[`deck${activeDeckIndex}`] = playerDeck;
        user[field] = savedDecks;
        
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        try {
            await updateDoc(doc(db, "users", user.uid), { [field]: savedDecks });
            alert(`Deck ${activeDeckIndex + 1} erfolgreich gespeichert!`);
        } catch(e) { 
            console.error("Speichern Fehler:", e);
            alert("Fehler beim Speichern in der Cloud, aber lokal gespeichert."); 
        }
    });

    document.getElementById('cardgame-btn-play').addEventListener('click', async () => {
        const user = getCurrentUser();
        const field = currentMode === 'starwars' ? 'decks_starwars' : 'decks_waifu';
        const userDecks = user[field];
        if(!user || !userDecks || Array.isArray(userDecks) || !userDecks[`deck${activeDeckIndex}`] || userDecks[`deck${activeDeckIndex}`].length !== 10) {
            alert(`Bitte erstelle zuerst Deck ${activeDeckIndex + 1} mit genau 10 Karten!`); return;
        }
        playerDeck = [...userDecks[`deck${activeDeckIndex}`]];
        document.getElementById('cardgame-main-menu').classList.add('hidden');
        document.getElementById('cardgame-matchmaking').classList.remove('hidden');
        renderMatchmaking();
    });
    
    document.getElementById('cardgame-match-back').addEventListener('click', () => {
        document.getElementById('cardgame-matchmaking').classList.add('hidden');
        document.getElementById('cardgame-main-menu').classList.remove('hidden');
    });

    // BOT BUTTONS
    document.getElementById('cardgame-btn-bot').addEventListener('click', () => {
        const user = getCurrentUser();
        const field = currentMode === 'starwars' ? 'decks_starwars' : 'decks_waifu';
        const userDecks = user[field];
        if(!user || !userDecks || Array.isArray(userDecks) || !userDecks[`deck${activeDeckIndex}`] || userDecks[`deck${activeDeckIndex}`].length !== 10) {
            alert(`Bitte erstelle zuerst Deck ${activeDeckIndex + 1} mit genau 10 Karten!`); return;
        }
        playerDeck = [...userDecks[`deck${activeDeckIndex}`]];
        document.getElementById('cardgame-main-menu').classList.add('hidden');
        document.getElementById('cardgame-bots').classList.remove('hidden');
    });

    document.getElementById('cardgame-bots-back').addEventListener('click', () => {
        document.getElementById('cardgame-bots').classList.add('hidden');
        document.getElementById('cardgame-main-menu').classList.remove('hidden');
    });

    document.getElementById('bot-b1-btn').addEventListener('click', () => {
        startBotMatch('B1-Kampfdroide', ['common', 'rare']);
    });

    document.getElementById('bot-inquisitor-btn').addEventListener('click', () => {
        startBotMatch('Inquisitor', ['rare', 'epic']);
    });

    document.getElementById('match-next-round-btn').addEventListener('click', () => {
        document.getElementById('match-result-overlay').classList.add('hidden');
        document.getElementById('match-player-active').innerHTML = '';
        document.getElementById('match-opponent-active').innerHTML = '';
        if(currentRound > 10) {
            finishMatch();
        } else {
            renderHand();
            renderOpponentDeckState();
        }
    });
}

function renderDeckbuilder() {
    const user = getCurrentUser();
    if(!user) return;
    const deckField = currentMode === 'starwars' ? 'decks_starwars' : 'decks_waifu';
    let savedDecks = user[deckField];
    if(!savedDecks || Array.isArray(savedDecks)) { 
        savedDecks = { deck0: [], deck1: [], deck2: [] }; 
    }
    playerDecks = savedDecks;
    playerDeck = [...(playerDecks[`deck${activeDeckIndex}`] || [])];
    
    updateDeckUI();
    renderInventory();
}

function renderInventory() {
    const user = getCurrentUser();
    const invField = currentMode === 'starwars' ? 'inventory_starwars' : 'inventory_waifu';
    const inventory = user[invField] || [];
    
    const invContainer = document.getElementById('cardgame-inventory');
    invContainer.innerHTML = '';
    
    const uniqueCards = [];
    const seen = new Set();
    const deckCharNames = playerDeck.map(d => d.charName);

    inventory.forEach(c => {
        // Skip if already in deck
        if(deckCharNames.includes(c.charName)) return;

        // Keep only highest rarity for a char
        const currentRarity = RARITY_ORDER[c.rarity] || 1;
        const existingIdx = uniqueCards.findIndex(x => x.charName === c.charName);
        if(existingIdx >= 0) {
            const existingRarity = RARITY_ORDER[uniqueCards[existingIdx].rarity] || 1;
            if(currentRarity > existingRarity) {
                uniqueCards[existingIdx] = c;
            }
        } else {
            uniqueCards.push(c);
        }
    });
    
    const sortMode = document.getElementById('cardgame-sort-select').value;
    uniqueCards.sort((a, b) => {
        if(sortMode === 'rarity') return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
        if(sortMode === 'faction') {
            const dbA = activeCharacterDatabase.find(x => x.name === a.charName);
            const dbB = activeCharacterDatabase.find(x => x.name === b.charName);
            const fA = getMainFaction(dbA ? dbA.tags : []);
            const fB = getMainFaction(dbB ? dbB.tags : []);
            return fA.localeCompare(fB);
        }
        return a.charName.localeCompare(b.charName);
    });
    
    uniqueCards.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; position:relative;`;
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:70px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.6rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.charName}</div>`;
        div.addEventListener('click', () => {
            if(playerDeck.length < 10) {
                playerDeck.push(c);
                updateDeckUI();
                renderInventory();
            } else { alert("Deck ist voll (10 Karten)!"); }
        });
        invContainer.appendChild(div);
    });
}

function updateDeckUI() {
    const slots = document.getElementById('cardgame-deck-slots');
    slots.innerHTML = '';
    document.getElementById('cardgame-deck-count').innerText = playerDeck.length;
    
    playerDeck.forEach((c, idx) => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center;`;
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:60px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.6rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.charName}</div>`;
        div.addEventListener('click', () => {
            playerDeck.splice(idx, 1);
            updateDeckUI();
            renderInventory();
        });
        slots.appendChild(div);
    });
    
    const syns = calculateSynergy(playerDeck);
    const synContainer = document.getElementById('cardgame-synergy-info');
    synContainer.innerHTML = '';
    if(syns.length === 0) {
        synContainer.innerHTML = 'Keine (0%)';
    } else {
        syns.forEach(s => {
            synContainer.innerHTML += `<div>${s.faction.toUpperCase()} (${s.count} Karten: +${s.count}%)</div>`;
        });
    }
}

function getRarityColor(rarity) {
    if(rarity === 'legendary') return '#ffd700';
    if(rarity === 'epic') return '#9b59b6';
    if(rarity === 'rare') return '#ff9f43';
    return '#888';
}

async function renderMatchmaking() {
    const list = document.getElementById('cardgame-opponent-list');
    list.innerHTML = '<div class="loader" style="margin: 20px auto;"></div>';
    try {
        const deckField = currentMode === 'starwars' ? 'decks_starwars' : 'decks_waifu';
        const q = query(collection(db, "users"), where(deckField, "!=", null));
        const snap = await getDocs(q);
        list.innerHTML = '';
        const user = getCurrentUser();
        
        let opponents = [];
        snap.forEach(docSnap => {
            if(docSnap.id !== user.uid) {
                const data = docSnap.data();
                if(data[deckField] && data[deckField].deck0 && data[deckField].deck0.length === 10) {
                    opponents.push({ uid: docSnap.id, deck: data[deckField].deck0, ...data });
                }
            }
        });
        
        if(opponents.length === 0) { list.innerHTML = '<p class="prompt-text">Keine Gegner mit Deck gefunden.</p>'; return; }
        
        opponents = opponents.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        opponents.forEach(opp => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:15px; background:#1a1e29; border:1px solid #333; border-radius:8px;';
            div.innerHTML = `<div style="font-weight:bold; color:#fff; font-size:1.1rem;">${opp.displayName || opp.username}</div>
                             <button class="rank-btn" style="padding:10px 20px; font-size:1rem;">Herausfordern</button>`;
            div.querySelector('button').addEventListener('click', () => {
                isBotMatch = false;
                startMatch(opp, opp.deck);
            });
            list.appendChild(div);
        });
    } catch(e) { list.innerHTML = 'Fehler beim Laden der Gegner.'; console.error(e); }
}

function startBotMatch(botName, allowedRarities) {
    let pool = [];
    activeCharacterDatabase.forEach(char => {
        const rarity = allowedRarities[Math.floor(Math.random() * allowedRarities.length)];
        pool.push({ charName: char.name, rarity: rarity });
    });
    pool = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    isBotMatch = true;
    startMatch({ username: `BOT: ${botName}`, displayName: `BOT: ${botName}` }, pool);
}

async function startMatch(oppData, oppDeckArr) {
    await loadGlobalScores();
    opponentData = oppData;
    opponentDeck = [...oppDeckArr];
    currentRound = 1;
    playerScore = 0;
    opponentScore = 0;
    playedPlayerCards = [];
    playedOpponentCards = [];
    
    document.getElementById('cardgame-matchmaking').classList.add('hidden');
    document.getElementById('cardgame-bots').classList.add('hidden');
    document.getElementById('cardgame-match').classList.remove('hidden');
    
    document.getElementById('match-player-score').innerText = '0';
    document.getElementById('match-opponent-score').innerText = '0';
    
    const pSyn = calculateSynergy(playerDeck);
    const oSyn = calculateSynergy(opponentDeck);
    
    document.getElementById('match-player-synergy').innerHTML = pSyn.map(s => `${s.faction} (+${s.count}%)`).join('<br>') || 'Keine';
    document.getElementById('match-opponent-synergy').innerHTML = oSyn.map(s => `${s.faction} (+${s.count}%)`).join('<br>') || 'Keine';
    
    const user = getCurrentUser();
    if(user && !isBotMatch) {
        liveMatchActive = true;
        updateLiveSpectator(user, "0:0 (Runde 1)");
    }
    
    renderHand();
    renderOpponentDeckState();
}

function updateLiveSpectator(user, scoreText) {
    if(!liveMatchActive) return;
    try {
        setDoc(doc(db, "live_games", user.username), {
            displayName: user.displayName || user.username,
            avatar: user.avatar || '',
            placedCharacters: [],
            pool: [],
            mode: currentMode,
            gameType: "Cardgame",
            category: "normal",
            progress: `Cardgame vs ${opponentData.displayName} - ${scoreText}`,
            updatedAt: Timestamp.now(),
            isTestUser: user.isTestUser || false
        }).catch(()=>{});
    } catch(e){}
}

function renderOpponentDeckState() {
    const oppContainer = document.getElementById('match-opponent-played');
    oppContainer.innerHTML = '';
    opponentDeck.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const isPlayed = playedOpponentCards.includes(c);
        const div = document.createElement('div');
        div.style.cssText = `width:40px; height:40px; position:relative;`;
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:100%; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(c.rarity)}; ${isPlayed ? 'filter:grayscale(100%) opacity(0.3);' : ''}">`;
        div.title = c.charName;
        oppContainer.appendChild(div);
    });
}

function renderHand() {
    document.getElementById('match-round-number').innerText = `${currentRound}/10`;
    const hand = document.getElementById('match-player-hand');
    hand.innerHTML = '';
    
    playerDeck.forEach((c) => {
        if(playedPlayerCards.includes(c)) return;
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; width:80px; transition:transform 0.2s;`;
        div.onmouseover = () => div.style.transform = 'translateY(-5px)';
        div.onmouseout = () => div.style.transform = 'translateY(0)';
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:80px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.6rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.charName}</div>`;
        div.addEventListener('click', () => playRound(c));
        hand.appendChild(div);
    });
}

function playRound(playerCard) {
    playedPlayerCards.push(playerCard);
    
    const unplayedOpp = opponentDeck.filter(c => !playedOpponentCards.includes(c));
    const oppCard = unplayedOpp[Math.floor(Math.random() * unplayedOpp.length)];
    playedOpponentCards.push(oppCard);
    
        const pDb = activeCharacterDatabase.find(x => x.name === playerCard.charName);
    const oDb = activeCharacterDatabase.find(x => x.name === oppCard.charName);
    
    const actx = window.getSharedAudioContext ? window.getSharedAudioContext() : (window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)());
    const now = actx.currentTime;
    function playTone(freq, time, dur, type="square") {
        try {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.connect(gain); gain.connect(actx.destination);
            osc.start(time); osc.stop(time + dur);
        } catch(e){}
    }

    // Play sounds based on highest rarity played
    const maxRar = RARITY_ORDER[playerCard.rarity] > RARITY_ORDER[oppCard.rarity] ? playerCard.rarity : oppCard.rarity;
    if(maxRar === "legendary") {
        playTone(440, now, 0.1); playTone(554.37, now + 0.1, 0.1); playTone(659.25, now + 0.2, 0.1); playTone(880, now + 0.3, 0.4);
    } else if (maxRar === "epic") {
        playTone(523.25, now, 0.1); playTone(659.25, now + 0.1, 0.1); playTone(783.99, now + 0.2, 0.3);
    } else {
        playTone(440, now, 0.15, "triangle");
    }

    const getHoloHTML = (rarity) => rarity === "epic" ? `<div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:10; mix-blend-mode: color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear; border-radius:5px;"></div>` : "";
    const getLegStyle = (rarity) => rarity === "legendary" ? "animation: legendary-flicker 1.5s infinite;" : "";

    document.getElementById("match-player-active").innerHTML = `<div style="text-align:center; position:relative; width:100px; height:100px;"><img src="${pDb.img}" style="width:100px; height:100px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(playerCard.rarity)}; ${getLegStyle(playerCard.rarity)}">${getHoloHTML(playerCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${playerCard.charName}</div></div>`;
    document.getElementById("match-opponent-active").innerHTML = `<div style="text-align:center; position:relative; width:100px; height:100px;"><img src="${oDb.img}" style="width:100px; height:100px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(oppCard.rarity)}; ${getLegStyle(oppCard.rarity)}">${getHoloHTML(oppCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oppCard.charName}</div></div>`;

    
    renderOpponentDeckState();
    
    const pBase = getCardScore(playerCard.charName);
    const oBase = getCardScore(oppCard.charName);
    
    const pFac = getMainFaction(pDb.tags);
    const oFac = getMainFaction(oDb.tags);
    
    let pFacMult = 1.0; let oFacMult = 1.0;
    if(FACTION_ADVANTAGE[pFac] === oFac) pFacMult = 1.2;
    if(FACTION_ADVANTAGE[oFac] === pFac) oFacMult = 1.2;
    
    const pSyn = getSynergyMult(calculateSynergy(playerDeck));
    const oSyn = getSynergyMult(calculateSynergy(opponentDeck));
    
    const pRar = RARITY_MULT[playerCard.rarity] || 1.0;
    const oRar = RARITY_MULT[oppCard.rarity] || 1.0;
    
    const pFinal = pBase * pRar * pFacMult * pSyn;
    const oFinal = oBase * oRar * oFacMult * oSyn;
    
    let resultText = '';
    if(pFinal > oFinal) { resultText = "<span style='color:#2ed573;'>Runde Gewonnen!</span>"; playerScore++; }
    else if(oFinal > pFinal) { resultText = "<span style='color:#ff4757;'>Runde Verloren!</span>"; opponentScore++; }
    else { resultText = "<span style='color:#ffd700;'>Unentschieden!</span>"; }
    
    document.getElementById('match-player-score').innerText = playerScore;
    document.getElementById('match-opponent-score').innerText = opponentScore;
    
    const user = getCurrentUser();
    if(user && liveMatchActive) updateLiveSpectator(user, `${playerScore}:${opponentScore} (Runde ${currentRound+1})`);
    
    document.getElementById('match-round-result').innerHTML = resultText;
    document.getElementById('match-round-calc').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; text-align:left; background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
            <div><span style="color:#2ed573">Du:</span> Base(${pBase.toFixed(1)}) * Rar(${pRar}) * Frak(${pFacMult}) * Syn(${pSyn.toFixed(2)}) = <b style="color:#2ed573">${pFinal.toFixed(1)}</b></div>
            <div><span style="color:#ff4757">Gegner:</span> Base(${oBase.toFixed(1)}) * Rar(${oRar}) * Frak(${oFacMult}) * Syn(${oSyn.toFixed(2)}) = <b style="color:#ff4757">${oFinal.toFixed(1)}</b></div>
        </div>
    `;
    
    currentRound++;
    document.getElementById('match-player-hand').innerHTML = ''; 
    document.getElementById('match-result-overlay').classList.remove('hidden');
}

async function finishMatch() {
    document.getElementById('cardgame-match').classList.add('hidden');
    document.getElementById('cardgame-main-menu').classList.remove('hidden');
    
    const user = getCurrentUser();
    if(user && liveMatchActive) {
        liveMatchActive = false;
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }

    let finalRes = "Unentschieden";
    if(playerScore > opponentScore) {
        finalRes = "Sieg";
        alert(`Du hast das Match ${playerScore}:${opponentScore} gewonnen!`);
        if(!isBotMatch && user) {
            alert(`Du bekommst 5 Credits fuer den Sieg!`);
            user.credits = (user.credits || 0) + 5;
            localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
            await updateDoc(doc(db, "users", user.uid), { credits: user.credits });
            const cb = document.getElementById('topbar-credits');
            if(cb) cb.innerHTML = `<span style="color:#ffd700;">?</span> ${user.credits}`;
        }
    } else if(opponentScore > playerScore) {
        finalRes = "Niederlage";
        alert(`Du hast das Match ${playerScore}:${opponentScore} verloren!`);
    } else {
        alert(`Das Match endete unentschieden ${playerScore}:${opponentScore}!`);
    }

    if(user) {
        addDoc(collection(db, "games"), {
            userUid: user.uid,
            username: user.username,
            mode: currentMode,
            type: "cardgame",
            gameType: "cardgame",
            category: "normal",
            result: finalRes,
            opponent: opponentData.displayName,
            score: `${playerScore}:${opponentScore}`,
            isBot: isBotMatch,
            date: Timestamp.now()
        }).catch(e => console.error("History save error:", e));
    }
}


