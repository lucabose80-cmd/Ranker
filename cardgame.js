import { getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { handleAdventureWin, handleAdventureLoss } from './adventure.js';
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';
import { LEGENDARY_POOL } from './data-starwars.js';
import { doc, getDoc, getDocs, updateDoc, collection, query, where, setDoc, deleteDoc, Timestamp, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
let isAdventureMatch = false;
let adventureLevelIndex = 0;

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

export async function loadGlobalScores() {
    if(globalScoresCache[currentMode]) return globalScoresCache[currentMode];
    try {
        const docRef = doc(db, "scores", `${currentMode}_classic_global`);
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

export function getCardScore(charName) {
    const scores = globalScoresCache[currentMode] || {};
    return scores[charName] || 9.0;
}

export function initCardgame() {
    document.getElementById('cardgame-deck-selector').addEventListener('change', (e) => {
        activeDeckIndex = parseInt(e.target.value);
    });

    document.getElementById('cardgame-btn-deck').addEventListener('click', async () => {
        await loadGlobalScores();
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
        listenToCardgameLobbies();
    });
    
    document.getElementById('cardgame-create-lobby-btn').addEventListener('click', () => {
        createCardgameLobby();
    });
    
    document.getElementById('cardgame-leave-lobby-btn').addEventListener('click', () => {
        leaveCardgameLobby();
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

    renderBots();
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
        const score = getCardScore(c.charName).toFixed(1);
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; position:relative;`;
        div.innerHTML = `<div style="position:absolute; top:-5px; right:-5px; background:#1a1e29; color:#ffd700; border:1px solid #ffd700; border-radius:50%; width:24px; height:24px; font-size:0.6rem; font-weight:bold; display:flex; justify-content:center; align-items:center; z-index:10;">${score}</div>
                         <img src="${dbC.img}" style="width:100%; height:100px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.65rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:3px;">${c.charName}</div>`;
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
    // Auto-clean invalid characters (e.g. deleted or renamed characters)
    playerDeck = playerDeck.filter(c => activeCharacterDatabase.some(x => x.name === c.charName));

    const slots = document.getElementById('cardgame-deck-slots');
    slots.innerHTML = '';
    document.getElementById('cardgame-deck-count').innerText = playerDeck.length;
    
    playerDeck.forEach((c, idx) => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const score = getCardScore(c.charName).toFixed(1);
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; position:relative;`;
        div.innerHTML = `<div style="position:absolute; top:-5px; right:-5px; background:#1a1e29; color:#ffd700; border:1px solid #ffd700; border-radius:50%; width:24px; height:24px; font-size:0.6rem; font-weight:bold; display:flex; justify-content:center; align-items:center; z-index:10;">${score}</div>
                         <img src="${dbC.img}" style="width:100%; height:100px; object-fit:cover; border-radius:3px;">
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

export function getRarityColor(rarity) {
    if(rarity === 'legendary' || rarity === 'legend') return '#ffd700';
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

const BOT_LEVELS = [
    { name: "Trainingsdroide (Lvl 1)", rarities: ['common'], popFilter: 'low', synergy: 'none', color: '#888', desc: "Nutzt nur häufige & unbeliebte Karten.", reward: 5 },
    { name: "Jawa (Lvl 2)", rarities: ['common', 'rare'], popFilter: 'low', synergy: 'none', color: '#a0a0a0', desc: "Nutzt schwache Karten, manchmal seltene.", reward: 10 },
    { name: "Sturmtruppler (Lvl 3)", rarities: ['common', 'rare'], popFilter: 'any', synergy: 'low', color: '#fff', desc: "Durchschnittliche Karten ohne Strategie.", reward: 20 },
    { name: "Kopfgeldjäger (Lvl 4)", rarities: ['rare'], popFilter: 'high', synergy: 'low', color: '#f39c12', desc: "Nutzt starke, seltene Karten.", reward: 50 },
    { name: "Inquisitor (Lvl 5)", rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'low', color: '#e74c3c', desc: "Solide Mischung aus selten und episch.", reward: 75 },
    { name: "Ritter der Ren (Lvl 6)", rarities: ['rare', 'epic'], popFilter: 'high', synergy: 'low', color: '#8e44ad', desc: "Starke epische Karten, wenig Synergie.", reward: 100 },
    { name: "Jedi-Ritter (Lvl 7)", rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#2ed573', desc: "Epische Karten mit gezielten Synergien.", reward: 150 },
    { name: "General Grievous (Lvl 8)", rarities: ['epic', 'legendary'], popFilter: 'any', synergy: 'high', color: '#95a5a6', desc: "Gefährliche Legendäre und starke Synergie.", reward: 200 },
    { name: "Darth Vader (Lvl 9)", rarities: ['epic', 'legendary'], popFilter: 'high', synergy: 'high', color: '#c0392b', desc: "Nur die stärksten Karten mit extremen Synergien.", reward: 300 },
    { name: "Großmeister Yoda (Lvl 10)", rarities: ['legendary'], popFilter: 'high', synergy: 'max', color: '#ffd700', desc: "Das perfekte Deck. Maximale Stärke.", reward: 500 }
];

function renderBots() {
    const list = document.getElementById('cardgame-bots-list');
    if (!list) return;
    list.innerHTML = '';
    
    const user = getCurrentUser();
    const defeatedField = currentMode === 'starwars' ? 'defeated_bots_starwars' : 'defeated_bots_waifu';
    const defeatedBots = user ? (user[defeatedField] || []) : [];
    
    BOT_LEVELS.forEach((bot, idx) => {
        const botLevel = idx + 1;
        const isDefeated = defeatedBots.includes(botLevel);
        const rewardHtml = isDefeated 
            ? `<div style="font-size:0.85rem; color:#2ed573; margin-top:10px; font-weight:bold;">✓ Bereits besiegt</div>` 
            : `<div style="font-size:0.85rem; color:#ffd700; margin-top:10px; font-weight:bold;">🏆 Erstsieg: ${bot.reward} Credits</div>`;
            
        const div = document.createElement('div');
        div.style.cssText = `background:#1a1e29; padding:20px; border:2px solid ${bot.color}; border-radius:10px; text-align:center; flex:1 1 250px; max-width:300px; display:flex; flex-direction:column; justify-content:space-between;`;
        div.innerHTML = `
            <div>
                <h3 style="color:${bot.color}; margin-top:0;">${bot.name}</h3>
                <p style="color:#888; font-size:0.9rem;">${bot.desc}</p>
                <div style="font-size:0.8rem; color:#aaa; margin-top:5px;">Rarität: ${bot.rarities.join(', ')}</div>
                <div style="font-size:0.8rem; color:#aaa;">Strategie: ${bot.synergy === 'max' ? 'Perfekt' : bot.synergy === 'high' ? 'Hoch' : bot.synergy === 'low' ? 'Gering' : 'Keine'}</div>
                ${rewardHtml}
            </div>
            <button class="rank-btn bot-start-btn" style="margin-top:15px; padding: 10px 20px; font-size: 1rem; width: 100%; border-color:${bot.color}; color:${bot.color};">Kampf starten</button>
        `;
        div.querySelector('.bot-start-btn').addEventListener('click', async () => await startBotMatch(bot));
        list.appendChild(div);
    });
}

async function startBotMatch(bot) {
    await loadGlobalScores();
    let candidates = [...activeCharacterDatabase];
    
    // Evaluate popularity
    if (bot.popFilter !== 'any') {
        candidates = candidates.sort((a, b) => {
            const sA = getCardScore(a.name);
            const sB = getCardScore(b.name);
            return sA - sB; // higher score means higher popularity (closer to 1.0) - wait, score is 1-5 where 1 is best
        });
        // So we want popular (low score) to be at the beginning of the array. sA - sB does ascending.
        
        const cut = Math.max(10, Math.floor(candidates.length * 0.4));
        if (bot.popFilter === 'high') {
            candidates = candidates.slice(0, cut);
        } else if (bot.popFilter === 'low') {
            candidates = candidates.slice(Math.max(0, candidates.length - cut));
        }
    }

    let deck = [];
    if (bot.synergy === 'none' || candidates.length < 10) {
        deck = candidates.sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
        const baseChar = candidates[Math.floor(Math.random() * candidates.length)];
        const targetFaction = (baseChar.faction && baseChar.faction.length > 0) ? baseChar.faction[0] : null;
        
        if (targetFaction) {
            let synChars = candidates.filter(c => c.faction && c.faction.includes(targetFaction)).sort(() => 0.5 - Math.random());
            let otherChars = candidates.filter(c => !c.faction || !c.faction.includes(targetFaction)).sort(() => 0.5 - Math.random());
            
            if (bot.synergy === 'max') {
                deck = synChars.slice(0, 10);
                if (deck.length < 10) deck = deck.concat(otherChars.slice(0, 10 - deck.length));
            } else if (bot.synergy === 'high') {
                const amountSyn = Math.min(synChars.length, 7);
                deck = synChars.slice(0, amountSyn).concat(otherChars.slice(0, 10 - amountSyn));
            } else if (bot.synergy === 'low') {
                const amountSyn = Math.min(synChars.length, 3);
                deck = synChars.slice(0, amountSyn).concat(otherChars.slice(0, 10 - amountSyn));
            }
        } else {
            deck = candidates.sort(() => 0.5 - Math.random()).slice(0, 10);
        }
    }
    
    // Fallback if not enough
    const usedNames = new Set();
    const finalDeck = [];
    
    for (let c of deck.slice(0, 10)) {
        let assignedRarity = bot.rarities[Math.floor(Math.random() * bot.rarities.length)];
        let finalCharName = c.name;
        
        if (assignedRarity === 'legendary' && (typeof LEGENDARY_POOL === 'undefined' || !LEGENDARY_POOL[finalCharName])) {
            if (typeof LEGENDARY_POOL !== 'undefined') {
                const legChars = Object.keys(LEGENDARY_POOL).filter(name => activeCharacterDatabase.some(x => x.name === name) && !usedNames.has(name));
                if (legChars.length > 0) {
                    finalCharName = legChars[Math.floor(Math.random() * legChars.length)];
                } else {
                    assignedRarity = 'epic';
                }
            } else {
                assignedRarity = 'epic';
            }
        }
        
        // Prevent duplicate fallback
        if (usedNames.has(finalCharName)) {
            const unused = activeCharacterDatabase.filter(x => !usedNames.has(x.name));
            if (unused.length > 0) {
                finalCharName = unused[Math.floor(Math.random() * unused.length)].name;
                if (assignedRarity === 'legendary' && (typeof LEGENDARY_POOL === 'undefined' || !LEGENDARY_POOL[finalCharName])) {
                    assignedRarity = 'epic';
                }
            }
        }
        
        usedNames.add(finalCharName);
        finalDeck.push({ charName: finalCharName, rarity: assignedRarity });
    }
    
    isBotMatch = true;
    startMatch({ username: `BOT: ${bot.name}`, displayName: `BOT: ${bot.name}`, botLevel: BOT_LEVELS.indexOf(bot) + 1 }, finalDeck);
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

export async function startAdventureMatch(levelIndex, oppData, oppDeckArr, playerAdventureDeckArr) {
    await loadGlobalScores();
    opponentData = oppData; 
    opponentDeck = [...oppDeckArr];
    playerDeck = [...playerAdventureDeckArr]; 
    
    currentRound = 1;
    playerScore = 0;
    opponentScore = 0;
    playedPlayerCards = [];
    playedOpponentCards = [];
    
    isBotMatch = true;
    isAdventureMatch = true;
    adventureLevelIndex = levelIndex;
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('cardgame-content').classList.remove('hidden');
    document.getElementById('cardgame-main-menu').classList.add('hidden');
    document.getElementById('cardgame-match').classList.remove('hidden');
    
    document.getElementById('match-player-score').innerText = '0';
    document.getElementById('match-opponent-score').innerText = '0';
    
    const pSyn = calculateSynergy(playerDeck);
    const oSyn = calculateSynergy(opponentDeck);
    
    document.getElementById('match-player-synergy').innerHTML = pSyn.map(s => `${s.faction} (+${s.count}%)`).join('<br>') || 'Keine';
    document.getElementById('match-opponent-synergy').innerHTML = oSyn.map(s => `${s.faction} (+${s.count}%)`).join('<br>') || 'Keine';
    
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
        div.style.cssText = `width:55px; height:55px; position:relative;`;
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
        const isPlayed = playedPlayerCards.includes(c);
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:${isPlayed ? 'not-allowed' : 'pointer'}; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; width:80px; transition:transform 0.2s; ${isPlayed ? 'filter:grayscale(100%) opacity(0.4);' : ''}`;
        
        if (!isPlayed) {
            div.onmouseover = () => div.style.transform = 'translateY(-5px)';
            div.onmouseout = () => div.style.transform = 'translateY(0)';
            div.addEventListener('click', () => {
                if (typeof isLivePvP !== 'undefined' && isLivePvP) {
                    const originalIndex = playerDeck.findIndex(deckCard => deckCard === c);
                    if(typeof playRoundLive === 'function') playRoundLive(originalIndex);
                } else {
                    playRound(c);
                }
            });
        }
        
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:80px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.6rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.charName}</div>`;
        hand.appendChild(div);
    });
}

function playRound(playerCard, explicitOppCard = null) {
    playedPlayerCards.push(playerCard);
    
    let oppCard;
    if (explicitOppCard) {
        oppCard = explicitOppCard;
    } else {
        const unplayedOpp = opponentDeck.filter(c => !playedOpponentCards.includes(c));
        if (typeof isBotMatch !== 'undefined' && isBotMatch && opponentData) {
            const pDb = activeCharacterDatabase.find(x => x.name === playerCard.charName);
            const pFac = getMainFaction(pDb.tags);
            const pSyn = getSynergyMult(calculateSynergy(playerDeck));
            const pBase = getCardScore(playerCard.charName);
            const pRar = RARITY_MULT[playerCard.rarity] || 1.0;
            let pBaseFinal = pBase * pRar * pSyn;
            
            // Adventure Modifiers for Player
            if (isAdventureMatch) {
                if (adventureLevelIndex === 9 && pFac === 'rebell') pBaseFinal *= 1.15;
                if (adventureLevelIndex === 17 && pFac === 'jedi') pBaseFinal *= 1.20;
            }
            
            let bestOpp = null;
            let bestScoreDiff = -999999;
            const oSyn = getSynergyMult(calculateSynergy(opponentDeck));
            
            unplayedOpp.forEach(c => {
                const oDb = activeCharacterDatabase.find(x => x.name === c.charName);
                const oFac = getMainFaction(oDb.tags);
                let pFacMult = 1.0; let oFacMult = 1.0;
                if(FACTION_ADVANTAGE[pFac] === oFac) pFacMult = 1.2;
                if(FACTION_ADVANTAGE[oFac] === pFac) oFacMult = 1.2;
                
                const oBase = getCardScore(c.charName);
                const oRar = RARITY_MULT[c.rarity] || 1.0;
                let oBaseFinal = oBase * oRar * oSyn;
                
                // Adventure Modifiers for Bot
                if (isAdventureMatch) {
                    if (adventureLevelIndex === 2 && oFac === 'imperium') oBaseFinal *= 1.10;
                    if (adventureLevelIndex === 3 && (oFac === 'kopfgeldjäger' || oFac === 'schurke')) oBaseFinal *= 1.15;
                    if (adventureLevelIndex === 4) oBaseFinal *= 1.20;
                    if (adventureLevelIndex === 5 && oDb.tags.includes('fahrzeug')) oBaseFinal *= 1.20;
                    if (adventureLevelIndex === 7 && oFac === 'sith') oBaseFinal *= 1.25;
                    if (adventureLevelIndex === 8 && c.charName === 'Emperor Palpatine') oBaseFinal *= 1.50;
                    if (adventureLevelIndex === 9 && oFac === 'rebell') oBaseFinal *= 1.15;
                    if (adventureLevelIndex === 10 && oDb.tags.includes('fahrzeug')) oBaseFinal *= 1.30;
                    if (adventureLevelIndex === 11 && oDb.tags.includes('ewok')) oBaseFinal *= 1.20;
                    if (adventureLevelIndex === 12 && oFac === 'imperium') oBaseFinal *= 1.15;
                    if (adventureLevelIndex === 13 && (oDb.tags.includes('fahrzeug') || oFac === 'kopfgeldjäger')) oBaseFinal *= 1.15;
                    if (adventureLevelIndex === 14) oBaseFinal *= 1.30;
                    if (adventureLevelIndex === 15 && c.charName === 'Rancor') oBaseFinal *= 2.0;
                    if (adventureLevelIndex === 16) oBaseFinal *= (1 + (Math.random() * 0.4));
                    if (adventureLevelIndex === 18 && oFac === 'imperium') oBaseFinal *= 1.25;
                    if (adventureLevelIndex === 19 && oFac === 'sith') oBaseFinal *= 1.30;
                    if (adventureLevelIndex === 19 && oFac === 'imperium') oBaseFinal *= 1.20;
                }
                
                const scoreDiff = (oBaseFinal * oFacMult) - (pBaseFinal * pFacMult);
                if (scoreDiff > bestScoreDiff) {
                    bestScoreDiff = scoreDiff;
                    bestOpp = c;
                }
            });
            
            if (!isAdventureMatch && opponentData.botLevel === 1 && Math.random() < 0.6) {
                oppCard = unplayedOpp[Math.floor(Math.random() * unplayedOpp.length)];
            } else if (!isAdventureMatch && opponentData.botLevel === 2 && Math.random() < 0.3) {
                oppCard = unplayedOpp[Math.floor(Math.random() * unplayedOpp.length)];
            } else {
                oppCard = bestOpp;
            }
        } else {
            oppCard = unplayedOpp[Math.floor(Math.random() * unplayedOpp.length)];
        }
    }
    
    if (!playedOpponentCards.includes(oppCard)) {
        playedOpponentCards.push(oppCard);
    }
    
    const pDb = activeCharacterDatabase.find(x => x.name === playerCard.charName);
    const oDb = activeCharacterDatabase.find(x => x.name === oppCard.charName);
    
    const actx = window.getSharedAudioContext ? window.getSharedAudioContext() : (window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)());
    
    function playTone(freq, time, dur, type="square", vol=0.1) {
        try {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(vol, time); gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.connect(gain); gain.connect(actx.destination);
            osc.start(time); osc.stop(time + dur);
        } catch(e){}
    }

    function playWinSound() {
        const t = actx.currentTime;
        playTone(523.25, t,      0.08, "sine", 0.12);
        playTone(659.25, t+0.09, 0.08, "sine", 0.12);
        playTone(783.99, t+0.18, 0.08, "sine", 0.12);
        playTone(1046.5, t+0.27, 0.3,  "sine", 0.15);
    }
    function playLoseSound() {
        const t = actx.currentTime;
        playTone(440,    t,      0.1,  "sine", 0.1);
        playTone(349.23, t+0.12, 0.1,  "sine", 0.1);
        playTone(293.66, t+0.25, 0.35, "sine", 0.12);
    }
    function playDrawSound() {
        const t = actx.currentTime;
        playTone(440, t, 0.15, "triangle", 0.08);
        playTone(440, t+0.2, 0.15, "triangle", 0.06);
    }
    function playLegendaryFanfare() {
        const t = actx.currentTime;
        playTone(440,   t,      0.1, "square", 0.08);
        playTone(554.37,t+0.1,  0.1, "square", 0.08);
        playTone(659.25,t+0.2,  0.1, "square", 0.08);
        playTone(880,   t+0.3,  0.5, "sine",   0.12);
    }
    function playEpicFanfare() {
        const t = actx.currentTime;
        playTone(523.25,t,      0.1, "square", 0.07);
        playTone(659.25,t+0.1,  0.1, "square", 0.07);
        playTone(783.99,t+0.2,  0.3, "sine",   0.1);
    }

    const getHoloHTML = (rarity) => rarity === "epic" ? `<div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:10; mix-blend-mode: color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear; border-radius:5px;"></div>` : "";
    const getLegStyle = (rarity) => rarity === "legendary" ? "animation: legendary-flicker 1.5s infinite;" : "";

    document.getElementById("match-player-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${pDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(playerCard.rarity)};"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${playerCard.charName}</div></div>`;
    document.getElementById("match-opponent-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${oDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(oppCard.rarity)};"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oppCard.charName}</div></div>`;

    renderOpponentDeckState();
    
    const pBase = getCardScore(playerCard.charName);
    const oBase = getCardScore(oppCard.charName);
    const pFac = getMainFaction(pDb.tags);
    const oFac = getMainFaction(oDb.tags);
    let pFacMult = 1.0; let oFacMult = 1.0;
    if(FACTION_ADVANTAGE[pFac] === oFac) pFacMult = 1.2;
    if(FACTION_ADVANTAGE[oFac] === pFac) oFacMult = 1.2;
    const pSynArr = calculateSynergy(playerDeck);
    const oSynArr = calculateSynergy(opponentDeck);
    const pSyn = getSynergyMult(pSynArr);
    const oSyn = getSynergyMult(oSynArr);
    let pRarMult = RARITY_MULT[playerCard.rarity] || 1.0;
    let oppRarMult = RARITY_MULT[oppCard.rarity] || 1.0;
    
    if (isAdventureMatch) {
        // Global difficulty scaling: Level 1 starts with 0.85x multiplier, goes up to 1.61x at Level 20
        const globalAdvScaling = 0.85 + (adventureLevelIndex * 0.04);
        oppRarMult *= globalAdvScaling;
    }
    
    if (isAdventureMatch && typeof opponentData !== 'undefined' && opponentData) {
        const advName = opponentData.name;
        if (advName === "Droiden-Armee" && oFac === 'droid') oppRarMult *= 1.10;
        if (advName === "Widerstand" && pFac === 'imperium') pRarMult *= 1.10;
        if (advName === "Bestien") oppRarMult *= (1.10 + (Math.random() * 0.20));
        if (advName === "Separatisten-Führung" && oFac === 'sith') oppRarMult *= 1.15;
        if (advName === "Jedi-Padawane" && pFac === 'kopfgeldjäger') pRarMult *= 1.15;
        if (advName === "Rebellen-Allianz" && oFac === 'rebell') oppRarMult *= 1.10;
        if (advName === "Inquisitoren" && oFac === 'imperium') oppRarMult *= 1.15;
        if (advName === "Nachtschwestern") oppRarMult *= 1.10;
        if (advName === "Kopfgeldjäger" && oFac === 'kopfgeldjäger') oppRarMult *= 1.15;
        if (advName === "Imperiale Flotte" && oDb.tags.includes('fahrzeug')) oppRarMult *= 1.20;
        if (advName === "Graue Machtnutzer" && pFac === 'jedi') pRarMult *= 0.90;
        if (advName === "Fahrzeuge der Republik" && oDb.tags.includes('fahrzeug')) oppRarMult *= 1.25;
        if (advName === "Mandalorianer" && oFac === 'mandalorianer') oppRarMult *= 1.20;
        if (advName === "Klon-Truppler" && oFac === 'klon') oppRarMult *= 1.25;
        if (advName === "Jedi-Meister" && oFac === 'jedi') oppRarMult *= 1.20;
        if (advName === "Jedi-Meister" && pFac === 'sith') pRarMult *= 1.15;
        if (advName === "Das Imperium" && oFac === 'imperium') oppRarMult *= 1.25;
        if (advName === "Die Sith") {
            if (oFac === 'sith') oppRarMult *= 1.30;
            if (oFac === 'imperium') oppRarMult *= 1.20;
        }
    }
    
    const pFinal = pBase * pRarMult * pFacMult * pSyn;
    const oFinal = oBase * oppRarMult * oFacMult * oSyn;
    
    let isWin = pFinal > oFinal;
    let isDraw = pFinal === oFinal;
    
    if(isWin)       { playerScore++; }
    else if(!isDraw){ opponentScore++; }
    
    document.getElementById('match-player-score').innerText = playerScore;
    document.getElementById('match-opponent-score').innerText = opponentScore;
    
    const user = getCurrentUser();
    if(user && liveMatchActive) updateLiveSpectator(user, `${playerScore}:${opponentScore} (Runde ${currentRound+1})`);

    const resultIcon = isWin ? '&#x1F3C6;' : (isDraw ? '&#x1F91D;' : '&#x1F4A5;');
    const resultLabel = isWin
        ? `<span style="color:#2ed573; font-size:1.4rem; font-weight:bold;">RUNDE GEWONNEN!</span>`
        : (isDraw
            ? `<span style="color:#ffd700; font-size:1.4rem; font-weight:bold;">UNENTSCHIEDEN</span>`
            : `<span style="color:#ff4757; font-size:1.4rem; font-weight:bold;">RUNDE VERLOREN!</span>`);

    document.getElementById('match-round-result').innerHTML = `<div style="font-size:2rem; margin-bottom:8px;">${resultIcon}</div>${resultLabel}`;

    const fmtMultiplier = (label, val, color, active) => active
        ? `<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; background:rgba(255,255,255,0.05); border-radius:4px; border-left:3px solid ${color};">
              <span style="color:#aaa; font-size:0.78rem;">${label}</span>
              <span style="color:${color}; font-weight:bold; font-size:0.85rem;">x${val.toFixed(2)}</span>
           </div>`
        : '';

    const pFacActive   = pFacMult !== 1.0;
    const oFacActive   = oFacMult !== 1.0;
    const pSynActive   = pSyn > 1.0;
    const oSynActive   = oSyn > 1.0;
    const pRarActive   = pRarMult > 1.0 || pRarMult < 1.0;
    const oRarActive   = oppRarMult > 1.0 || oppRarMult < 1.0;

    const pPct = Math.round((pFinal / (pFinal + oFinal)) * 100) || 50;
    const oPct = 100 - pPct;

    let pRarLabel = (isAdventureMatch && pRarMult !== (RARITY_MULT[playerCard.rarity] || 1.0)) ? "Modifikator" : `${playerCard.rarity[0].toUpperCase() + playerCard.rarity.slice(1)}-Karte`;
    let oRarLabel = (isAdventureMatch && oppRarMult !== (RARITY_MULT[oppCard.rarity] || 1.0)) ? "Modifikator" : `${oppCard.rarity[0].toUpperCase() + oppCard.rarity.slice(1)}-Karte`;

    document.getElementById('match-round-calc').innerHTML = `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:bold; margin-bottom:4px;">
                <span style="color:#2ed573;">Du: ${pFinal.toFixed(2)}</span>
                <span style="color:#ff4757;">Gegner: ${oFinal.toFixed(2)}</span>
            </div>
            <div style="height:12px; border-radius:6px; background:#222; overflow:hidden; border:1px solid #444;">
                <div style="height:100%; width:${pPct}%; background:linear-gradient(to right,#2ed573,#20bf6b); display:inline-block; border-radius:6px 0 0 6px; transition:width 0.5s;"></div>
            </div>
        </div>

        <div style="display:flex; gap:12px; text-align:left;">
            <div style="flex:1; background:#111; border-radius:8px; padding:10px; border:1px solid #2ed57355;">
                <div style="font-size:0.8rem; color:#2ed573; font-weight:bold; margin-bottom:6px; border-bottom:1px solid #2ed57333; padding-bottom:4px;">Du (${playerCard.charName})</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:0.78rem;">Basis-Score</span>
                    <span style="color:#fff; font-weight:bold; font-size:0.85rem;">${pBase.toFixed(2)}</span>
                </div>
                ${fmtMultiplier(pRarLabel, pRarMult, '#ff9f43', pRarActive)}
                ${fmtMultiplier(`Fraktions-Bonus (${pFac} > ${oFac})`, pFacMult, '#4da6ff', pFacActive)}
                ${fmtMultiplier(`Synergie-Bonus`, pSyn, '#a855f7', pSynActive)}
                <div style="margin-top:8px; padding-top:6px; border-top:1px solid #333; display:flex; justify-content:space-between;">
                    <span style="color:#aaa; font-size:0.8rem;">Gesamt</span>
                    <span style="color:#2ed573; font-size:1.1rem; font-weight:bold;">${pFinal.toFixed(2)}</span>
                </div>
            </div>
            <div style="flex:1; background:#111; border-radius:8px; padding:10px; border:1px solid #ff475755;">
                <div style="font-size:0.8rem; color:#ff4757; font-weight:bold; margin-bottom:6px; border-bottom:1px solid #ff475733; padding-bottom:4px;">Gegner (${oppCard.charName})</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:0.78rem;">Basis-Score</span>
                    <span style="color:#fff; font-weight:bold; font-size:0.85rem;">${oBase.toFixed(2)}</span>
                </div>
                ${fmtMultiplier(oRarLabel, oppRarMult, '#ff9f43', oRarActive)}
                ${fmtMultiplier(`Fraktions-Bonus (${oFac} > ${pFac})`, oFacMult, '#4da6ff', oFacActive)}
                ${fmtMultiplier(`Synergie-Bonus`, oSyn, '#a855f7', oSynActive)}
                <div style="margin-top:8px; padding-top:6px; border-top:1px solid #333; display:flex; justify-content:space-between;">
                    <span style="color:#aaa; font-size:0.8rem;">Gesamt</span>
                    <span style="color:#ff4757; font-size:1.1rem; font-weight:bold;">${oFinal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    currentRound++;
    document.getElementById('match-player-hand').innerHTML = '';

    const maxRar = RARITY_ORDER[playerCard.rarity] > RARITY_ORDER[oppCard.rarity] ? playerCard.rarity : oppCard.rarity;
    const pLeg = (playerCard.rarity === "legendary" && typeof LEGENDARY_POOL !== 'undefined' && LEGENDARY_POOL[playerCard.charName]) ? LEGENDARY_POOL[playerCard.charName] : null;
    const oLeg = (!isBotMatch && oppCard.rarity === "legendary" && typeof LEGENDARY_POOL !== 'undefined' && LEGENDARY_POOL[oppCard.charName]) ? LEGENDARY_POOL[oppCard.charName] : null;
    const triggerPlayerLegDelay = playerCard.rarity === "legendary";
    const triggerOppLegDelay = !isBotMatch && oppCard.rarity === "legendary";
    const hasLegendaryDelay = triggerPlayerLegDelay || triggerOppLegDelay;

    setTimeout(() => {
        if(maxRar === "legendary") {
            if (pLeg || oLeg) {
                const soundToPlay = pLeg ? pLeg.sound : (oLeg ? oLeg.sound : null);
                if (soundToPlay) {
                    const audio = new Audio(soundToPlay);
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log('Audio autoplay blocked', e));
                }
            } else if (hasLegendaryDelay) {
                playLegendaryFanfare();
            } else {
                playEpicFanfare(); 
            }
            const pImg = pLeg ? pLeg.specialImg : pDb.img;
            const oImg = oLeg ? oLeg.specialImg : oDb.img;
            const pFlicker = (triggerPlayerLegDelay || pLeg) ? 'animation: legendary-flicker 1.5s infinite;' : '';
            const oFlicker = (triggerOppLegDelay || oLeg) ? 'animation: legendary-flicker 1.5s infinite;' : '';
            document.getElementById("match-player-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${pImg}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(playerCard.rarity)}; ${triggerPlayerLegDelay ? getLegStyle(playerCard.rarity) : ''}; ${pFlicker}">${getHoloHTML(playerCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${playerCard.charName}</div></div>`;
            document.getElementById("match-opponent-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${oImg}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(oppCard.rarity)}; ${triggerOppLegDelay ? getLegStyle(oppCard.rarity) : ''}; ${oFlicker}">${getHoloHTML(oppCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oppCard.charName}</div></div>`;
        } else if(maxRar === "epic") {
            playEpicFanfare();
            document.getElementById("match-player-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${pDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(playerCard.rarity)};">${getHoloHTML(playerCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${playerCard.charName}</div></div>`;
            document.getElementById("match-opponent-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${oDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(oppCard.rarity)};">${getHoloHTML(oppCard.rarity)}<div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oppCard.charName}</div></div>`;
        }
    }, 50);

    const overlayDelay = hasLegendaryDelay ? 5000 : 200;

    setTimeout(() => {
        if(isWin)       playWinSound();
        else if(isDraw) playDrawSound();
        else            playLoseSound();
        if (currentRound > 10) {
            document.getElementById('match-result-overlay').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('match-result-overlay').classList.add('hidden');
                finishMatch();
            }, 1500);
        } else {
            document.getElementById('match-result-overlay').classList.remove('hidden');
        }
    }, overlayDelay);
}

async function finishMatch() {
    document.getElementById('cardgame-match').classList.add('hidden');
    document.getElementById('match-result-overlay').classList.add('hidden');
    
    if (isAdventureMatch) {
        document.getElementById('cardgame-content').classList.add('hidden');
        document.getElementById('adventure-content').classList.remove('hidden');
        
        if (playerScore > opponentScore) {
            handleAdventureWin(adventureLevelIndex);
        } else {
            handleAdventureLoss();
        }
        isAdventureMatch = false;
        isBotMatch = false;
        return;
    }
    
    document.getElementById('cardgame-main-menu').classList.remove('hidden');
    
    const user = getCurrentUser();
    if(user && liveMatchActive) {
        liveMatchActive = false;
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    
    if (typeof isLivePvP !== 'undefined' && isLivePvP) {
        isLivePvP = false;
        setTimeout(() => leaveCardgameLobby(), 500);
    }

    let finalRes = "Unentschieden";
    if(playerScore > opponentScore) {
        finalRes = "Sieg";
        
        if(isBotMatch && user && opponentData.botLevel) {
            const defeatedField = currentMode === 'starwars' ? 'defeated_bots_starwars' : 'defeated_bots_waifu';
            const defeatedBots = user[defeatedField] || [];
            
            if (!defeatedBots.includes(opponentData.botLevel)) {
                defeatedBots.push(opponentData.botLevel);
                user[defeatedField] = defeatedBots;
                
                // Credit rewards for level 1 to 10
                const creditRewards = {1:5, 2:10, 3:20, 4:50, 5:75, 6:100, 7:150, 8:200, 9:300, 10:500};
                const reward = creditRewards[opponentData.botLevel] || 0;
                user.credits = (user.credits || 0) + reward;
                
                // Unlock Title
                const titleId = `sw_bot_${opponentData.botLevel}`;
                const titlesField = currentMode === 'starwars' ? 'unlocked_titles_starwars' : 'unlocked_titles_waifu';
                let unlockedTitles = user[titlesField] || [];
                
                let unlockedNewTitle = false;
                if (!unlockedTitles.includes(titleId)) {
                    unlockedTitles.push(titleId);
                    user[titlesField] = unlockedTitles;
                    unlockedNewTitle = true;
                }
                
                localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
                updateDoc(doc(db, "users", user.uid), { 
                    [defeatedField]: defeatedBots, 
                    credits: user.credits,
                    [titlesField]: unlockedTitles 
                }).catch(console.error);
                
                const cb = document.getElementById('topbar-credits');
                if(cb) cb.innerHTML = `<span style="color:#ffd700;">💳</span> ${user.credits}`;
                
                alert(`Du hast das Match ${playerScore}:${opponentScore} gewonnen!\n\nERSTER SIEG GEGEN STUFE ${opponentData.botLevel}!\nDu erhältst ${reward} Credits${unlockedNewTitle ? ' und einen neuen Titel!' : '!'}`);
            } else {
                alert(`Du hast das Match ${playerScore}:${opponentScore} gewonnen!`);
            }
        } else if(!isBotMatch && user) {
            alert(`Du bekommst 5 Credits fuer den Sieg!`);
            user.credits = (user.credits || 0) + 5;
            localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
            await updateDoc(doc(db, "users", user.uid), { credits: user.credits });
            const cb = document.getElementById('topbar-credits');
            if(cb) cb.innerHTML = `<span style="color:#ffd700;">💳</span> ${user.credits}`;
        } else {
            alert(`Du hast das Match ${playerScore}:${opponentScore} gewonnen!`);
        }
    } else if(opponentScore > playerScore) {
        finalRes = "Niederlage";
        alert(`Du hast das Match ${playerScore}:${opponentScore} verloren!`);
    } else {
        alert(`Das Match endete unentschieden ${playerScore}:${opponentScore}!`);
    }

    if(user) {
        addDoc(collection(db, "history"), {
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
            playerDeck: playerDeck,
            opponentDeck: opponentDeck,
            date: Timestamp.now()
        }).catch(e => console.error("History save error:", e));
    }
}





let currentCardgameLobbyId = null;
let cardgameLobbyUnsubscribe = null;
let cardgameListUnsubscribe = null;
let isHost = false;

function listenToCardgameLobbies() {
    if (cardgameListUnsubscribe) cardgameListUnsubscribe();
    
    const q = query(collection(db, "cardgame_lobbies"), where("mode", "==", currentMode), where("status", "==", "waiting"));
    
    cardgameListUnsubscribe = onSnapshot(q, (snapshot) => {
        const list = document.getElementById('cardgame-opponent-list');
        if (!list) return;
        list.innerHTML = '';
        
        let hasLobbies = false;
        snapshot.forEach(d => {
            const lobby = d.data();
            lobby.id = d.id;
            
            hasLobbies = true;
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:15px; background:#1a1e29; border:1px solid #333; border-radius:8px;';
            div.innerHTML = `<div style="font-weight:bold; color:#fff; font-size:1.1rem;">Lobby von ${lobby.hostName}</div>
                             <button class="rank-btn" style="padding:10px 20px; font-size:1rem;">Beitreten</button>`;
            div.querySelector('button').addEventListener('click', () => joinCardgameLobby(lobby.id));
            list.appendChild(div);
        });
        
        if (!hasLobbies) {
            list.innerHTML = '<p class="prompt-text">Keine offenen Lobbys gefunden.</p>';
        }
    });
}

async function createCardgameLobby() {
    const user = getCurrentUser();
    if (!user) return;
    
    const lobbyId = "cg_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
    currentCardgameLobbyId = lobbyId;
    isHost = true;
    
    const lobbyData = {
        mode: currentMode,
        hostUid: user.uid,
        hostName: user.displayName || user.username,
        status: 'waiting',
        timestamp: Timestamp.now(),
        players: [{
            uid: user.uid,
            username: user.username,
            displayName: user.displayName || user.username,
            deck: playerDeck,
            picks: []
        }]
    };
    
    await setDoc(doc(db, "cardgame_lobbies", lobbyId), lobbyData);
    showCardgameLobbyWaiting();
    listenToSpecificCardgameLobby(lobbyId);
}

async function joinCardgameLobby(lobbyId) {
    const user = getCurrentUser();
    if (!user) return;
    
    const lobbyRef = doc(db, "cardgame_lobbies", lobbyId);
    const snap = await getDoc(lobbyRef);
    if (!snap.exists()) return;
    
    const lobby = snap.data();
    if (lobby.status !== 'waiting' || lobby.players.length >= 2) {
        alert("Lobby ist voll oder bereits gestartet.");
        return;
    }
    
    currentCardgameLobbyId = lobbyId;
    isHost = false;
    
    lobby.players.push({
        uid: user.uid,
        username: user.username,
        displayName: user.displayName || user.username,
        deck: playerDeck,
        picks: []
    });
    
    lobby.status = 'playing';
    lobby.round = 1;
    
    await updateDoc(lobbyRef, { players: lobby.players, status: 'playing', round: 1 });
    showCardgameLobbyWaiting();
    listenToSpecificCardgameLobby(lobbyId);
}

async function leaveCardgameLobby() {
    if (!currentCardgameLobbyId) {
        hideCardgameLobbyWaiting();
        return;
    }
    
    const user = getCurrentUser();
    const lobbyRef = doc(db, "cardgame_lobbies", currentCardgameLobbyId);
    
    if (cardgameLobbyUnsubscribe) cardgameLobbyUnsubscribe();
    cardgameLobbyUnsubscribe = null;
    
    try {
        const snap = await getDoc(lobbyRef);
        if (snap.exists()) {
            const lobby = snap.data();
            if (lobby.status !== 'finished') {
                if (lobby.players.length <= 1 || lobby.hostUid === user.uid) {
                    await deleteDoc(lobbyRef);
                } else {
                    lobby.players = lobby.players.filter(p => p.uid !== user.uid);
                    lobby.status = 'finished'; // Abort match if someone leaves
                    await updateDoc(lobbyRef, { players: lobby.players, status: 'finished' });
                }
            }
        }
    } catch(e) {}
    
    currentCardgameLobbyId = null;
    isHost = false;
    hideCardgameLobbyWaiting();
    
    // Switch back to menu
    document.getElementById('cardgame-matchmaking').classList.add('hidden');
    document.getElementById('cardgame-match').classList.add('hidden');
    document.getElementById('cardgame-main-menu').classList.remove('hidden');
}

function showCardgameLobbyWaiting() {
    document.getElementById('cardgame-create-lobby-btn').classList.add('hidden');
    document.getElementById('cardgame-opponent-list').classList.add('hidden');
    document.getElementById('cardgame-lobby-waiting').classList.remove('hidden');
}

function hideCardgameLobbyWaiting() {
    document.getElementById('cardgame-create-lobby-btn').classList.remove('hidden');
    document.getElementById('cardgame-opponent-list').classList.remove('hidden');
    document.getElementById('cardgame-lobby-waiting').classList.add('hidden');
}

function listenToSpecificCardgameLobby(lobbyId) {
    if (cardgameLobbyUnsubscribe) cardgameLobbyUnsubscribe();
    
    let matchStarted = false;
    
    cardgameLobbyUnsubscribe = onSnapshot(doc(db, "cardgame_lobbies", lobbyId), (docSnap) => {
        if (!docSnap.exists()) {
            alert("Die Lobby wurde geschlossen.");
            leaveCardgameLobby();
            return;
        }
        
        const lobby = docSnap.data();
        if (lobby.status === 'playing' && lobby.players.length === 2) {
            if (!matchStarted) {
                matchStarted = true;
                const user = getCurrentUser();
                const opponentObj = lobby.players.find(p => p.uid !== user.uid);
                isLivePvP = true;
                isBotMatch = false;
                startMatch({ username: opponentObj.username, displayName: opponentObj.displayName }, opponentObj.deck);
                hideCardgameLobbyWaiting();
            }
            handleCardgameLiveState(lobby);
        } else if (lobby.status === 'finished') {
            if (currentRound <= 10) {
                alert("Das Spiel wurde beendet (Gegner hat das Spiel verlassen). Du gewinnst automatisch!");
                playerScore = 10;
                opponentScore = 0;
                finishMatch();
            }
            leaveCardgameLobby();
        }
    });
}
let isLivePvP = false;
let livePvPRoundProcessed = false;

async function playRoundLive(cardIndex) {
    const user = getCurrentUser();
    if (!user || !currentCardgameLobbyId) return;

    // Temporarily disable hand
    const hand = document.getElementById('match-player-hand');
    if (hand) {
        hand.style.pointerEvents = 'none';
        hand.style.opacity = '0.5';
    }

    try {
        const lobbyRef = doc(db, "cardgame_lobbies", currentCardgameLobbyId);
        const snap = await getDoc(lobbyRef);
        if (snap.exists()) {
            const lobby = snap.data();
            const playerObj = lobby.players.find(p => p.uid === user.uid);
            if (playerObj && playerObj.picks.length < currentRound) {
                playerObj.picks.push(cardIndex);
                await updateDoc(lobbyRef, { players: lobby.players });
            }
        }
    } catch(e) {
        console.error("Fehler beim Senden der Karte:", e);
        if (hand) {
            hand.style.pointerEvents = 'auto';
            hand.style.opacity = '1.0';
        }
    }
}

function handleCardgameLiveState(lobby) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Determine opponent
    const opponentObj = lobby.players.find(p => p.uid !== user.uid);
    const myObj = lobby.players.find(p => p.uid === user.uid);
    
    if (!opponentObj || !myObj) return;

    // Check if both players have picked for the CURRENT round
    if (myObj.picks.length === currentRound && opponentObj.picks.length === currentRound && !livePvPRoundProcessed) {
        livePvPRoundProcessed = true;
        
        // Execute round
        const myCardIndex = myObj.picks[currentRound - 1];
        const oppCardIndex = opponentObj.picks[currentRound - 1];
        
        // Use local deck references so object equality (includes) works in renderHand
        const myCard = playerDeck[myCardIndex];
        const oppCard = opponentDeck[oppCardIndex];
        
        playRound(myCard, oppCard);
    }
    
    // Check if next round is ready to start
    if (myObj.picks.length < currentRound) {
        livePvPRoundProcessed = false;
        const hand = document.getElementById('match-player-hand');
        if (hand) {
            hand.style.pointerEvents = 'auto';
            hand.style.opacity = '1.0';
        }
    }
}
