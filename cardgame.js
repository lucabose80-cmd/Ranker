import { getCurrentUser, refreshCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';
import { doc, getDoc, getDocs, updateDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let playerDeck = [];
let opponentDeck = [];
let opponentData = null;
let currentRound = 1;
let playerScore = 0;
let opponentScore = 0;
let playedPlayerCards = [];
let playedOpponentCards = [];
let globalScoresCache = {};

const RARITY_MULT = { 'common': 1.0, 'rare': 1.1, 'epic': 1.3, 'legendary': 1.5 };

const FACTION_ADVANTAGE = {
    'jedi': 'sith',
    'sith': 'klon',
    'klon': 'jedi',
    'rebell': 'imperium',
    'imperium': 'mandalorianer',
    'mandalorianer': 'rebell'
};

function getMainFaction(tags) {
    if(!tags) return 'neutral';
    const tg = tags.map(t => t.toLowerCase());
    if(tg.includes('jedi')) return 'jedi';
    if(tg.includes('sith')) return 'sith';
    if(tg.includes('klon')) return 'klon';
    if(tg.includes('rebell') || tg.includes('rebellion')) return 'rebell';
    if(tg.includes('imperium')) return 'imperium';
    if(tg.includes('mandalorianer')) return 'mandalorianer';
    return 'neutral';
}

function calculateSynergy(deck) {
    if(!deck || deck.length === 0) return { faction: 'Keine', mult: 1.0, percentage: 0 };
    const counts = {};
    deck.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        const f = getMainFaction(dbC ? dbC.tags : []);
        if(f !== 'neutral') { counts[f] = (counts[f] || 0) + 1; }
    });
    let maxFaction = 'Keine';
    let maxCount = 0;
    for(const [f, c] of Object.entries(counts)) {
        if(c > maxCount) { maxCount = c; maxFaction = f; }
    }
    const pct = maxCount / deck.length;
    if(pct > 0.5) return { faction: maxFaction, mult: 1.05, percentage: Math.round(pct*100) };
    return { faction: 'Keine', mult: 1.0, percentage: Math.round(pct*100) };
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
    document.getElementById('cardgame-btn-deck').addEventListener('click', () => {
        document.getElementById('cardgame-main-menu').classList.add('hidden');
        document.getElementById('cardgame-deckbuilder').classList.remove('hidden');
        renderDeckbuilder();
    });
    
    document.getElementById('cardgame-deck-back').addEventListener('click', () => {
        document.getElementById('cardgame-deckbuilder').classList.add('hidden');
        document.getElementById('cardgame-main-menu').classList.remove('hidden');
    });

    document.getElementById('cardgame-save-deck').addEventListener('click', async () => {
        if(playerDeck.length !== 10) { alert("Dein Deck muss genau 10 Karten enthalten!"); return; }
        const user = getCurrentUser();
        if(!user) return;
        const field = currentMode === 'starwars' ? 'deck_starwars' : 'deck_waifu';
        user[field] = playerDeck;
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        try {
            await updateDoc(doc(db, "users", user.uid), { [field]: playerDeck });
            alert("Deck erfolgreich gespeichert!");
        } catch(e) { alert("Fehler beim Speichern!"); }
    });

    document.getElementById('cardgame-btn-play').addEventListener('click', async () => {
        const user = getCurrentUser();
        const field = currentMode === 'starwars' ? 'deck_starwars' : 'deck_waifu';
        if(!user || !user[field] || user[field].length !== 10) {
            alert("Bitte erstelle zuerst ein Deck mit 10 Karten!"); return;
        }
        playerDeck = [...user[field]];
        document.getElementById('cardgame-main-menu').classList.add('hidden');
        document.getElementById('cardgame-matchmaking').classList.remove('hidden');
        renderMatchmaking();
    });
    
    document.getElementById('cardgame-match-back').addEventListener('click', () => {
        document.getElementById('cardgame-matchmaking').classList.add('hidden');
        document.getElementById('cardgame-main-menu').classList.remove('hidden');
    });

    document.getElementById('match-next-round-btn').addEventListener('click', () => {
        document.getElementById('match-result-overlay').classList.add('hidden');
        document.getElementById('match-player-active').innerHTML = '';
        document.getElementById('match-opponent-active').innerHTML = '';
        if(currentRound > 10) {
            finishMatch();
        } else {
            renderHand();
        }
    });
}

function renderDeckbuilder() {
    const user = getCurrentUser();
    if(!user) return;
    const invField = currentMode === 'starwars' ? 'inventory_starwars' : 'inventory_waifu';
    const deckField = currentMode === 'starwars' ? 'deck_starwars' : 'deck_waifu';
    
    const inventory = user[invField] || [];
    playerDeck = user[deckField] ? [...user[deckField]] : [];
    
    updateDeckUI();
    
    const invContainer = document.getElementById('cardgame-inventory');
    invContainer.innerHTML = '';
    
    const uniqueCards = [];
    const seen = new Set();
    inventory.forEach(c => {
        const key = c.charName + '_' + c.rarity;
        if(!seen.has(key)) { seen.add(key); uniqueCards.push(c); }
    });
    
    uniqueCards.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:pointer; border:2px solid ${getRarityColor(c.rarity)}; border-radius:5px; padding:5px; background:#222; text-align:center; position:relative;`;
        div.innerHTML = `<img src="${dbC.img}" style="width:100%; height:80px; object-fit:cover; border-radius:3px;">
                         <div style="font-size:0.6rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.charName}</div>`;
        div.addEventListener('click', () => {
            if(playerDeck.length < 10) {
                // Check if char already in deck regardless of rarity
                if(playerDeck.some(dc => dc.charName === c.charName)) {
                    alert("Charakter ist bereits im Deck!"); return;
                }
                playerDeck.push(c);
                updateDeckUI();
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
        });
        slots.appendChild(div);
    });
    
    const syn = calculateSynergy(playerDeck);
    document.getElementById('cardgame-synergy-info').innerHTML = syn.faction !== 'Keine' ? `${syn.faction.toUpperCase()} (${syn.percentage}%, +5% Score)` : `Keine (${syn.percentage}%)`;
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
        const deckField = currentMode === 'starwars' ? 'deck_starwars' : 'deck_waifu';
        const q = query(collection(db, "users"), where(deckField, "!=", null));
        const snap = await getDocs(q);
        list.innerHTML = '';
        const user = getCurrentUser();
        
        let opponents = [];
        snap.forEach(docSnap => {
            if(docSnap.id !== user.uid && docSnap.data()[deckField].length === 10) {
                opponents.push({ uid: docSnap.id, ...docSnap.data() });
            }
        });
        
        if(opponents.length === 0) { list.innerHTML = '<p class="prompt-text">Keine Gegner mit Deck gefunden.</p>'; return; }
        
        // Random 5 opponents
        opponents = opponents.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        opponents.forEach(opp => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; background:#1a1e29; border:1px solid #333; border-radius:8px;';
            div.innerHTML = `<div style="font-weight:bold; color:#fff;">${opp.displayName || opp.username}</div>
                             <button class="rank-btn" style="padding:5px 15px;">Herausfordern</button>`;
            div.querySelector('button').addEventListener('click', () => {
                startMatch(opp, opp[deckField]);
            });
            list.appendChild(div);
        });
    } catch(e) { list.innerHTML = 'Fehler beim Laden der Gegner.'; console.error(e); }
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
    document.getElementById('cardgame-match').classList.remove('hidden');
    
    document.getElementById('match-player-score').innerText = '0';
    document.getElementById('match-opponent-score').innerText = '0';
    document.getElementById('match-opponent-played').innerHTML = '';
    
    const pSyn = calculateSynergy(playerDeck);
    const oSyn = calculateSynergy(opponentDeck);
    document.getElementById('match-player-synergy').innerText = pSyn.faction !== 'Keine' ? `${pSyn.faction} (+5%)` : 'Keine';
    document.getElementById('match-opponent-synergy').innerText = oSyn.faction !== 'Keine' ? `${oSyn.faction} (+5%)` : 'Keine';
    
    renderHand();
}

function renderHand() {
    document.getElementById('match-round-number').innerText = `${currentRound}/10`;
    const hand = document.getElementById('match-player-hand');
    hand.innerHTML = '';
    
    playerDeck.forEach((c, idx) => {
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
    
    // AI picks random unplayed card
    const unplayedOpp = opponentDeck.filter(c => !playedOpponentCards.includes(c));
    const oppCard = unplayedOpp[Math.floor(Math.random() * unplayedOpp.length)];
    playedOpponentCards.push(oppCard);
    
    // Show active cards
    const pDb = activeCharacterDatabase.find(x => x.name === playerCard.charName);
    const oDb = activeCharacterDatabase.find(x => x.name === oppCard.charName);
    
    document.getElementById('match-player-active').innerHTML = `<div style="text-align:center;"><img src="${pDb.img}" style="width:100px; height:100px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(playerCard.rarity)}"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${playerCard.charName}</div></div>`;
    document.getElementById('match-opponent-active').innerHTML = `<div style="text-align:center;"><img src="${oDb.img}" style="width:100px; height:100px; object-fit:cover; border-radius:5px; border:2px solid ${getRarityColor(oppCard.rarity)}"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oppCard.charName}</div></div>`;
    
    // Add to opponent played history UI
    const histDiv = document.createElement('img');
    histDiv.src = oDb.img;
    histDiv.style.cssText = `width:30px; height:30px; border-radius:50%; border:2px solid ${getRarityColor(oppCard.rarity)}; object-fit:cover;`;
    histDiv.title = oppCard.charName;
    document.getElementById('match-opponent-played').appendChild(histDiv);
    
    // Calculate Score
    const pBase = getCardScore(playerCard.charName);
    const oBase = getCardScore(oppCard.charName);
    
    const pFac = getMainFaction(pDb.tags);
    const oFac = getMainFaction(oDb.tags);
    
    let pFacMult = 1.0; let oFacMult = 1.0;
    if(FACTION_ADVANTAGE[pFac] === oFac) pFacMult = 1.2;
    if(FACTION_ADVANTAGE[oFac] === pFac) oFacMult = 1.2;
    
    const pSyn = calculateSynergy(playerDeck).mult;
    const oSyn = calculateSynergy(opponentDeck).mult;
    
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
    
    document.getElementById('match-round-result').innerHTML = resultText;
    document.getElementById('match-round-calc').innerHTML = `
        Dein Score: ${pBase.toFixed(2)} * ${pRar} * ${pFacMult} * ${pSyn} = <b style="color:#2ed573">${pFinal.toFixed(2)}</b><br>
        Gegner Score: ${oBase.toFixed(2)} * ${oRar} * ${oFacMult} * ${oSyn} = <b style="color:#ff4757">${oFinal.toFixed(2)}</b>
    `;
    
    currentRound++;
    document.getElementById('match-player-hand').innerHTML = ''; // Hide hand during result
    document.getElementById('match-result-overlay').classList.remove('hidden');
}

async function finishMatch() {
    document.getElementById('cardgame-match').classList.add('hidden');
    document.getElementById('cardgame-main-menu').classList.remove('hidden');
    
    if(playerScore > opponentScore) {
        alert(`Du hast das Match ${playerScore}:${opponentScore} gewonnen! Du erhältst 5 Credits!`);
        const user = getCurrentUser();
        if(user) {
            user.credits = (user.credits || 0) + 5;
            localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
            await updateDoc(doc(db, "users", user.uid), { credits: user.credits });
            document.getElementById('topbar-credits').innerHTML = `<span style="color:#ffd700;">?</span> ${user.credits}`;
        }
    } else if(opponentScore > playerScore) {
        alert(`Du hast das Match ${playerScore}:${opponentScore} verloren!`);
    } else {
        alert(`Das Match endete unentschieden ${playerScore}:${opponentScore}!`);
    }
}
