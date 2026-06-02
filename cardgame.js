import { getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { handleAdventureWin, handleAdventureLoss } from './adventure.js';
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';
import { LEGENDARY_POOL } from './data-starwars.js';
import { doc, getDoc, getDocs, updateDoc, collection, query, where, setDoc, deleteDoc, Timestamp, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { createCardHTML } from './components.js';

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
let playerHandRemaining = [];
let opponentHandRemaining = [];
let playerGraveyard = [];
let opponentGraveyard = [];
let pEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false };
let oEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false, rule9Done: false, rule18Done: false };
let globalScoresCache = {};
let isBotMatch = false;
let liveMatchActive = false;
let isAdventureMatch = false;
let adventureLevelIndex = 0;
let adventureRule = null;

const RARITY_MULT = { 'common': 1.0, 'rare': 1.1, 'epic': 1.3, 'legendary': 1.5 };
const RARITY_ORDER = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };

const FACTION_ADVANTAGE = {
    'jedi': 'sith',
    'sith': 'rebell',
    'rebell': 'imperium',
    'imperium': 'mandalorianer',
    'mandalorianer': 'klon',
    'klon': 'jedi',
    'Kopfgeldjäger': 'jedi',
    'droid': 'Kopfgeldjäger'
};

function getMainFaction(tags) {
    if(!tags) return 'neutral';
    const tg = tags.map(t => t.toLowerCase());
    if(tg.includes('501st')) return '501st';
    if(tg.includes('212th')) return '212th';
    if(tg.includes('bad_batch')) return 'bad_batch';
    if(tg.includes('hutte')) return 'hutte';
    if(tg.includes('schmuggel')) return 'schmuggel';
    
    if(tg.includes('jedi')) return 'jedi';
    if(tg.includes('sith')) return 'sith';
    if(tg.includes('rebell') || tg.includes('rebellen')) return 'rebell';
    if(tg.includes('imperium')) return 'imperium';
    if(tg.includes('klon') || tg.includes('clone')) return 'klon';
    if(tg.includes('mandalorianer') || tg.includes('mandalorian')) return 'mandalorianer';
    if(tg.includes('Kopfgeldjäger') || tg.includes('kopfgeldjaeger') || tg.includes('kopfgeldjger')) return 'Kopfgeldjäger';
    if(tg.includes('droid') || tg.includes('droide')) return 'droid';
    if(tg.includes('schurke') || tg.includes('unterwelt') || tg.includes('pirat')) return 'schurke';
    if(tg.includes('nachtschwester') || tg.includes('dathomir')) return 'nachtschwester';
    if(tg.includes('erste ordnung')) return 'erste ordnung';
    if(tg.includes('widerstand')) return 'widerstand';
    if(tg.includes('senat') || tg.includes('republik')) return 'senat';
    if(tg.includes('graue machtnutzer') || tg.includes('grau')) return 'graue machtnutzer';
    if(tg.includes('fahrzeug')) return 'fahrzeug';
    if(tg.includes('separatist')) return 'separatist';
    if(tg.includes('monster') || tg.includes('kreatur')) return 'monster';
    return 'neutral';
}

function getFactionDescription(faction) {
    const desc = {
        'mandalorianer': 'Silence',
        'graue machtnutzer': 'Ausgleich',
        'senat': 'Veto (0:0)',
        'fahrzeug': 'Überrollen',
        'sith': 'Ausdünnung',
        'schurke': 'Falsches Spiel',
        'imperium': 'Unterdrückung',
        'jedi': 'Gedankentrick',
        'rebell': 'Hoffnung',
        'klon': 'Klon-Kette',
        'nachtschwester': 'Nekromantie',
        'droid': 'Verschmelzung',
        'Kopfgeldjäger': 'Kopfgeld',
        'erste ordnung': 'Zwangsrekrutierung',
        'widerstand': 'Opfermut',
        'separatist': 'Übermacht',
        'monster': 'Raserei',
        'schmuggel': 'Flucht',
        'hutte': 'Erpressung',
        '501st': 'Vaders Faust',
        '212th': 'High Ground',
        'bad_batch': 'Kloneinheit 99'
    };
    return desc[faction] || 'Aktiv';
}

function getFactionTooltip(faction) {
    const desc = {
        'mandalorianer': 'Silence: Der Mandalorianer nutzt Beskar, um gegnerische Buff-Fähigkeiten (Score-Modifikatoren) für diese Runde komplett zu annullieren.\n\n• Ende: Die Silence-Wirkung hält genau eine Runde an.\n• Limit: Formation (Mindestens 4 benötigt)',
        'graue machtnutzer': 'Ausgleich: Die Grauen Machtnutzer streben nach Balance. In der Endabrechnung des Matches (Sieg/Niederlage) gewinnt ausnahmsweise derjenige, der WENIGER Runden gewonnen hat.\n\n• Ende: Die Regelumkehr gilt permanent für den finalen Ausgang des gesamten Matches.\n• Limit: Exklusiv (Maximal 1 erlaubt)',
        'senat': 'Veto: Verhindert eine direkte Niederlage. Falls dein Gegner gewinnen würde, wird das Ergebnis auf ein Unentschieden (0:0) eingefroren.\n\n• Ende: Gilt nur für diese eine Runde.\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'fahrzeug': 'Überrollen: Gewinnt das Fahrzeug die Runde, greift es sofort in einer Extra-Runde nochmals an und behält seinen Score.\n\n• Ende: Endet sofort und das Fahrzeug wird zerstört, falls es eine Runde verliert.\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'sith': 'Ausdünnung: Jede zweite (2.) gespielte Sith-Karte vernichtet sofort und dauerhaft eine zufällige Karte direkt von der feindlichen Hand.\n\n• Ende: Der Zähler ist während des gesamten Matches permanent aktiv.\n• Limit: Exklusiv (Maximal 4 erlaubt)',
        'jedi': 'Gedankentrick: Spielst du einen Jedi, zwingt dieser den Bot dazu, in seiner NÄCHSTEN Runde garantiert eine seiner 2 schwächsten Karten auszuspielen.\n\n• Ende: Der Effekt verbraucht sich automatisch beim Ausspielen der gegnerischen Karte.\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'schurke': 'Falsches Spiel: Vor der Gewinn-Ermittlung stiehlt der Schurke heimlich den aktuellen Score des Gegners und tauscht ihn gegen seinen eigenen.\n\n• Ende: Die geklauten Werte gelten ausschließlich in dieser Runde.\n• Limit: Formation (Mindestens 3 benötigt)',
        'imperium': 'Unterdrückung: Gewinnt das Imperium, baut es Stärken Druck auf. Die gegnerische Karte in der NÄCHSTEN Runde verliert pauschal 25% Basis-Score.\n\n• Ende: Verliert das Imperium, triggert der Effekt nicht. Der 25% Abzug verfällt nach 1 Runde.\n• Limit: Formation (Mindestens 4 benötigt)',
        'rebell': 'Hoffnung: Rebellen kämpfen aus Verzweiflung Stärker. Liegst du im aktuellen Gesamt-Match hinten (weniger Siege), verdoppelt der Rebell seinen Score.\n\n• Ende: Sobald du Gleichstand erreichst oder führst, entfällt die Verdopplung.\n• Limit: Formation (Mindestens 4 benötigt)',
        'klon': 'Klon-Kette: Stirbt ein Klon, wird sein Score global gespeichert. Der nächste gespielte Klon erhält diesen Score als permanenten Boost oben drauf.\n\n• Ende: Die Kette reißt sofort ab (Bonus = 0), wenn zwischen zwei Klonen eine andere Fraktion gespielt wird.\n• Limit: Formation (Mindestens 4 benötigt)',
        'nachtschwester': 'Nekromantie: Gewinnt die Nachtschwester, holt sie mit dunkler Magie die vom Gegner ZULETZT besiegte Karte aus dem feindlichen Friedhof in deine Hand.\n\n• Ende: Funktioniert nur bei einem aktiven Rundensieg.\n• Limit: Formation (Mindestens 3 benötigt)',
        'droid': 'Verschmelzung: Spielst du diesen Droiden, verdoppelt sich durch Schwarm-Intelligenz automatisch der Score deines NÄCHSTEN Droiden.\n\n• Ende: Der Verdopplungs-Bonus wird direkt beim Einsatz des nächsten Droiden verbraucht.\n• Limit: Formation (Mindestens 5 benötigt)',
        'Kopfgeldjäger': 'Kopfgeld: Zu Beginn des Matches wird die häufigste feindliche Fraktion als Ziel markiert. Besiegst du dieses Ziel im Duell, erhältst du 2 Match-Punkte (statt 1).\n\n• Ende: Das Hauptziel bleibt das ganze Match über dauerhaft markiert.\n• Limit: Formation (Mindestens 3 benötigt)',
        'erste ordnung': 'Zwangsrekrutierung: Gewinnt die Erste Ordnung, wird die gerade besiegte feindliche Karte nicht zerstört, sondern sofort in deine eigene Hand rekrutiert.\n\n• Ende: Der Effekt ist nur während der exakten Runde des Sieges aktiv.\n• Limit: Formation (Mindestens 4 benötigt)',
        'widerstand': 'Opfermut: Verliert ein Widerstandskämpfer, inspiriert sein Opfer das Team. Deine NÄCHSTE ausgespielte Karte erhält einen massiven Bonus von +4.0 Punkten.\n\n• Ende: Der Bonus verbraucht sich direkt in der Folgerunde.\n• Limit: Formation (Mindestens 4 benötigt)',
        'separatist': 'Übermacht: Hat die gegnerische Karte einen HÖHEREN Basis-Score als der Separatist, ruft dieser sofort Verstärkung und erhält pauschal +2.5 Score dazu.\n\n• Limit: Formation (Mindestens 4 benötigt)',
        'monster': 'Raserei: Monster sind absolut unberechenbar. Ihr finaler Score schwankt nach dem Ausspielen zufällig zwischen -20% und +20%.\n\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'schmuggel': 'Flucht: Schmuggler lassen sich ungern schnappen. Verliert der Schmuggler die Runde, wird er nicht zerstört, sondern mischt sich unauffällig zurück in dein Nachzieh-Deck.\n\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'hutte': 'Erpressung: Spielst du einen Hutten, zwingt dieser den Bot dazu, in seiner NÄCHSTEN Runde garantiert seine STÄRKSTE verbleibende Karte auszuspielen (Gegenteil vom Jedi).\n\n• Limit: Exklusiv (Maximal 2 erlaubt)',
        '501st': 'Vaders Faust: Gewinnt die 501st Legion ihre Runde, kennt sie keine Gnade und vernichtet sofort die nächste Karte auf dem gegnerischen Nachzieh-Deck.\n\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        '212th': 'High Ground: Die 212th agiert taktisch. Ist der Rarity-Multiplikator des Gegners höher als der eigene, wird dieser einfach kopiert und übernommen.\n\n• Limit: Exklusiv (Maximal 3 erlaubt)',
        'bad_batch': 'Kloneinheit 99: Massiver +4.0 Buff. Da sie aber Befehle verweigern, darfst du in deiner NÄCHSTEN Runde deine Karte nicht selbst wählen (Zufallszug).\n\n• Limit: Exklusiv (Maximal 2 erlaubt)'
    };
    return desc[faction] || 'Kein spezieller Effekt.';
}

function calculateSynergy(deck) {
    if(!deck || deck.length === 0) return [];
    const counts = {};
    deck.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(dbC && dbC.tags) {
            let tags = dbC.tags.map(t => t.toLowerCase());
            let seenFacs = new Set();
            tags.forEach(t => {
                let f = getMainFaction([t]);
                if(f !== 'neutral') seenFacs.add(f);
            });
            seenFacs.forEach(f => {
                counts[f] = (counts[f] || 0) + 1;
            });
        }
    });
    
    let activeFactions = [];
    const checkMax = (fac, max) => { if(counts[fac] > 0 && counts[fac] <= max) activeFactions.push({ faction: fac, count: counts[fac] }); };
    const checkMin = (fac, min) => { if(counts[fac] >= min) activeFactions.push({ faction: fac, count: counts[fac] }); };
    const checkExact = (fac, ext) => { if(counts[fac] === ext) activeFactions.push({ faction: fac, count: counts[fac] }); };
    
    checkMax('mandalorianer', 3);
    checkMax('graue machtnutzer', 3);
    checkMax('senat', 3);
    checkMax('fahrzeug', 3);
    checkMax('sith', 4);
    checkMax('jedi', 3);
    
    checkMin('schurke', 3);
    checkMin('imperium', 4);
    checkMin('rebell', 4);
    checkMin('klon', 4);
    checkMin('nachtschwester', 3);
    checkMin('droid', 5);
    checkMin('Kopfgeldjäger', 3);
    checkMin('erste ordnung', 4);
    checkMin('widerstand', 4);
    checkMin('separatist', 4);
    
    checkMax('monster', 3);
    checkMax('schmuggel', 3);
    checkMax('hutte', 2);
    checkMax('501st', 3);
    checkMax('212th', 3);
    checkMax('bad_batch', 2);
    
    return activeFactions;
}

function getSynergyMult(synergies) {
    return 1.0;
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
        if(playerHandRemaining.length === 0 && opponentHandRemaining.length === 0 && !pEffects.vehicles && !oEffects.vehicles) {
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
        if(sortMode === 'score') return getCardScore(b.charName) - getCardScore(a.charName);
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
                         <img loading="lazy" src="${dbC.img}" style="width:100%; height:100px; object-fit:cover; border-radius:3px;">
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
                         <img loading="lazy" src="${dbC.img}" style="width:100%; height:100px; object-fit:cover; border-radius:3px;">
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
        synContainer.innerHTML = 'Keine Effekte aktiv';
    } else {
        syns.forEach(s => {
            synContainer.innerHTML += `<div><span class="has-tooltip" data-tooltip="${getFactionTooltip(s.faction)}" style="cursor:help; color:#ffd700; font-weight:bold; border-bottom:1px dotted #ffd700;">${s.faction.toUpperCase()}</span> <span style="color:#aaa;">(${s.count} Karten):</span> <span style="color:#2ed573;">${getFactionDescription(s.faction)}</span></div>`;
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
    { name: "Droiden (Lvl 1)", factionFocus: 'droid', rarities: ['common', 'rare'], popFilter: 'any', synergy: 'high', color: '#95a5a6', desc: "Nutzt viele Droiden für Verschmelzungs-Boni.", reward: 150 },
    { name: "Klone (Lvl 2)", factionFocus: 'klon', rarities: ['common', 'rare'], popFilter: 'any', synergy: 'high', color: '#f1c40f', desc: "Spielt Klone in Folge, um Ketten-Boni zu maximieren.", reward: 150 },
    { name: "Rebellen (Lvl 3)", factionFocus: 'rebell', rarities: ['common', 'rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#e74c3c', desc: "Hofft auf Comebacks bei Rückstand.", reward: 150 },
    { name: "Erste Ordnung (Lvl 4)", factionFocus: 'erste ordnung', rarities: ['common', 'rare'], popFilter: 'any', synergy: 'high', color: '#e74c3c', desc: "Rekrutiert besiegte Karten.", reward: 150 },
    { name: "Imperium (Lvl 5)", factionFocus: 'imperium', rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#888', desc: "Unterdrückt Gegner nach einem Sieg.", reward: 150 },
    { name: "Nachtschwestern (Lvl 6)", factionFocus: 'nachtschwester', rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#9b59b6', desc: "Nutzt dunkle Magie für Nekromantie.", reward: 150 },
    { name: "Schurken (Lvl 7)", factionFocus: 'schurke', rarities: ['rare'], popFilter: 'any', synergy: 'high', color: '#e67e22', desc: "Klaut hinterlistig deine Score-Werte.", reward: 150 },
    { name: "Kopfgeldjäger (Lvl 8)", factionFocus: 'Kopfgeldjäger', rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#34495e', desc: "Macht Jagd auf deine häufigste Fraktion.", reward: 150 },
    { name: "Mandalorianer (Lvl 9)", factionFocus: 'mandalorian', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#ff9f43', desc: "Nutzt Beskar für Silence-Effekte.", reward: 150 },
    { name: "Senat (Lvl 10)", factionFocus: 'senat', rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#4da6ff', desc: "Friert Runden bei Niederlagen ein.", reward: 150 },
    { name: "Fahrzeuge (Lvl 11)", factionFocus: 'fahrzeug', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#aaa', desc: "Gefährliche Überrollen-Taktik.", reward: 150 },
    { name: "Graue Machtnutzer (Lvl 12)", factionFocus: 'graue machtnutzer', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#ccc', desc: "Dreht die Siegesbedingung um.", reward: 150 },
    { name: "Sith (Lvl 13)", factionFocus: 'sith', rarities: ['epic', 'legendary'], popFilter: 'any', synergy: 'high', color: '#cc4444', desc: "Zerstört passiv Karten auf deiner Hand.", reward: 150 },
    { name: "Jedi (Lvl 14)", factionFocus: 'jedi', rarities: ['epic', 'legendary'], popFilter: 'any', synergy: 'high', color: '#5dade2', desc: "Zwingt dich durch Gedankentricks zu Fehlern.", reward: 150 },
    { name: "Widerstand (Lvl 15)", factionFocus: 'widerstand', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#f39c12', desc: "Opfert Einheiten für brachiale Folge-Buffs.", reward: 150 },
    { name: "Separatisten (Lvl 16)", factionFocus: 'separatist', rarities: ['rare', 'epic'], popFilter: 'any', synergy: 'high', color: '#e67e22', desc: "Übermacht: Stark gegen Decks mit hohen Base-Stats.", reward: 150 },
    { name: "Monster (Lvl 17)", factionFocus: 'monster', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#8b4513', desc: "Unberechenbare Raserei-Schwankungen.", reward: 150 },
    { name: "Schmuggel (Lvl 18)", factionFocus: 'schmuggel', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#a0522d', desc: "Unverwüstlich: Kehren ins Deck zurück.", reward: 150 },
    { name: "212th (Lvl 19)", factionFocus: '212th', rarities: ['common', 'rare'], popFilter: 'any', synergy: 'high', color: '#d2691e', desc: "High Ground: Kopiert gegnerische Multiplikatoren.", reward: 150 },
    { name: "501st (Lvl 20)", factionFocus: '501st', rarities: ['epic'], popFilter: 'any', synergy: 'high', color: '#00008b', desc: "Vaders Faust: Vernichtet zusätzliche Karten.", reward: 150 },
    { name: "Bad Batch (Lvl 21)", factionFocus: 'bad_batch', rarities: ['epic', 'legendary'], popFilter: 'any', synergy: 'high', color: '#696969', desc: "Kloneinheit 99: Hoher Buff, aber zufällige Folgezüge.", reward: 150 },
    { name: "Hutten (Lvl 22)", factionFocus: 'hutte', rarities: ['legendary'], popFilter: 'any', synergy: 'high', color: '#2e8b57', desc: "Erpressung: Zwingt dich, deine stärkste Karte zu spielen.", reward: 150 }
];

function renderBots() {
    const list = document.getElementById('cardgame-bots-list');
    if (!list) return;
    list.innerHTML = '';
    
    const user = getCurrentUser();
    const defeatedField = currentMode === 'starwars' ? 'defeated_tut2_bots_starwars' : 'defeated_bots_waifu';
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
    if (bot.factionFocus) {
        let synChars = candidates.filter(c => {
            if(!c.tags) return false;
            let tags = c.tags.map(t => t.toLowerCase());
            let hasFac = false;
            tags.forEach(t => {
                let f = getMainFaction([t]);
                if(f === bot.factionFocus || (bot.factionFocus === 'senat' && f === 'senat')) hasFac = true;
            });
            return hasFac;
        }).sort(() => 0.5 - Math.random());
        
        let otherChars = candidates.filter(c => !synChars.includes(c)).sort(() => 0.5 - Math.random());
        
        // Versuche 7-10 Karten der Fraktion zu bekommen, aber respektiere Maximal-Limits!
        const MAX_LIMITS = { 'mandalorianer': 3, 'mandalorian': 3, 'graue machtnutzer': 3, 'senat': 3, 'fahrzeug': 3, 'sith': 4, 'jedi': 3, 'monster': 3, 'schmuggel': 3, 'hutte': 2, '501st': 3, '212th': 3, 'bad_batch': 2 };
        const maxAllowed = MAX_LIMITS[bot.factionFocus] || 10;
        const amountSyn = Math.min(synChars.length, maxAllowed);
        deck = synChars.slice(0, amountSyn).concat(otherChars.slice(0, 10 - amountSyn));
    } else {
        deck = candidates.sort(() => 0.5 - Math.random()).slice(0, 10);
    }
    
    // Ensure exactly 10 unique cards
    const usedNames = new Set();
    const finalCards = [];
    
    for (let c of deck.slice(0, 10)) {
        let finalCharName = c.name;
        if (usedNames.has(finalCharName)) {
            const unused = activeCharacterDatabase.filter(x => !usedNames.has(x.name));
            if (unused.length > 0) {
                finalCharName = unused[Math.floor(Math.random() * unused.length)].name;
            }
        }
        usedNames.add(finalCharName);
        finalCards.push(finalCharName);
    }
    
    // Find if any selected card has a legendary variant
    let legIndex = -1;
    if (typeof LEGENDARY_POOL !== 'undefined') {
        legIndex = finalCards.findIndex(name => LEGENDARY_POOL[name]);
    }
    
    const finalDeck = [];
    for (let i = 0; i < finalCards.length; i++) {
        // First 5 are Rare, remaining 5 are Epic
        let assignedRarity = i < 5 ? 'rare' : 'epic';
        finalDeck.push({ charName: finalCards[i], rarity: assignedRarity });
    }
    
    // Upgrade one Epic to Legendary if possible
    if (legIndex !== -1) {
        if (legIndex < 5) {
            // Swap char at legIndex (Rare) with char at index 5 (Epic) so the Legendary gets the Epic slot
            const temp = finalDeck[5].charName;
            finalDeck[5].charName = finalDeck[legIndex].charName;
            finalDeck[legIndex].charName = temp;
            finalDeck[5].rarity = 'legendary';
        } else {
            finalDeck[legIndex].rarity = 'legendary';
        }
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
    playerHandRemaining = [...playerDeck];
    opponentHandRemaining = [...opponentDeck];
    playerGraveyard = [];
    opponentGraveyard = [];
    pEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false };
    oEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false, rule9Done: false, rule18Done: false };
    
    document.getElementById('cardgame-matchmaking').classList.add('hidden');
    document.getElementById('cardgame-bots').classList.add('hidden');
    document.getElementById('cardgame-match').classList.remove('hidden');
    
    document.getElementById('match-player-score').innerText = '0';
    document.getElementById('match-opponent-score').innerText = '0';
    
    const pSyn = calculateSynergy(playerDeck);
    const oSyn = calculateSynergy(opponentDeck);
    
    if (pSyn.some(s => s.faction === 'Kopfgeldjäger')) pEffects.bountyTarget = oSyn.length > 0 ? oSyn[0].faction : 'neutral';
    if (oSyn.some(s => s.faction === 'Kopfgeldjäger')) oEffects.bountyTarget = pSyn.length > 0 ? pSyn[0].faction : 'neutral';
    
    document.getElementById('match-player-synergy').innerHTML = pSyn.map(s => `<span class="has-tooltip" data-tooltip="${getFactionTooltip(s.faction)}" style="cursor:help; color:#ffd700; border-bottom:1px dotted #ffd700;">${s.faction.toUpperCase()}</span>: <span style="color:#aaa;">${getFactionDescription(s.faction)}</span>`).join('<br>') || 'Keine Effekte';
    document.getElementById('match-opponent-synergy').innerHTML = oSyn.map(s => `<span class="has-tooltip" data-tooltip="${getFactionTooltip(s.faction)}" style="cursor:help; color:#ff4757; border-bottom:1px dotted #ff4757;">${s.faction.toUpperCase()}</span>: <span style="color:#aaa;">${getFactionDescription(s.faction)}</span>`).join('<br>') || 'Keine Effekte';
    
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
    playerHandRemaining = [...playerDeck];
    opponentHandRemaining = [...opponentDeck];
    playerGraveyard = [];
    opponentGraveyard = [];
    pEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false };
    oEffects = { forceStrongest: false, forceRandom: false, vehicles: null, sithPlayed: 0, cloneChain: 0, lastCloneDead: null, resistanceSacrificed: 0, orbitalStrike: false, nextDroidDouble: false, bountyTarget: null, oppression: false, forceWeakest: false, martyrBuff: false, rule9Done: false, rule18Done: false };
    
    isBotMatch = true;
    isAdventureMatch = true;
    adventureLevelIndex = levelIndex;
    adventureRule = oppData.ruleId || null;
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('cardgame-content').classList.remove('hidden');
    document.getElementById('cardgame-main-menu').classList.add('hidden');
    document.getElementById('cardgame-match').classList.remove('hidden');
    
    document.getElementById('match-player-score').innerText = '0';
    document.getElementById('match-opponent-score').innerText = '0';
    
    const pSyn = calculateSynergy(playerDeck);
    const oSyn = calculateSynergy(opponentDeck);
    
    if (pSyn.some(s => s.faction === 'Kopfgeldjäger')) pEffects.bountyTarget = oSyn.length > 0 ? oSyn[0].faction : 'neutral';
    if (oSyn.some(s => s.faction === 'Kopfgeldjäger')) oEffects.bountyTarget = pSyn.length > 0 ? pSyn[0].faction : 'neutral';
    
    document.getElementById('match-player-synergy').innerHTML = pSyn.map(s => `<span class="has-tooltip" data-tooltip="${getFactionTooltip(s.faction)}" style="cursor:help; color:#ffd700; border-bottom:1px dotted #ffd700;">${s.faction.toUpperCase()}</span>: <span style="color:#aaa;">${getFactionDescription(s.faction)}</span>`).join('<br>') || 'Keine Effekte';
    document.getElementById('match-opponent-synergy').innerHTML = oSyn.map(s => `<span class="has-tooltip" data-tooltip="${getFactionTooltip(s.faction)}" style="cursor:help; color:#ff4757; border-bottom:1px dotted #ff4757;">${s.faction.toUpperCase()}</span>: <span style="color:#aaa;">${getFactionDescription(s.faction)}</span>`).join('<br>') || 'Keine Effekte';
    
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
        const isPlayed = playedOpponentCards.includes(c) || opponentGraveyard.includes(c);
        const div = document.createElement('div');
        div.style.cssText = `width:55px; height:55px; position:relative;`;
        div.innerHTML = createCardHTML(dbC, c.rarity, isPlayed);
        div.title = c.charName;
        oppContainer.appendChild(div);
    });
}

function renderHand() {
    document.getElementById('match-round-number').innerText = `Runde ${currentRound}`;
    const hand = document.getElementById('match-player-hand');
    hand.innerHTML = '';
    
    if (pEffects.vehicles) {
        hand.innerHTML = '<div style="color:#fff; text-align:center; padding:20px; font-weight:bold;">Fahrzeug greift erneut an...</div>';
        setTimeout(() => { playRound(null); }, 1500);
        return;
    }
    
    if (playerHandRemaining.length === 0) {
        hand.innerHTML = '<div style="color:#fff; text-align:center; padding:20px; font-weight:bold;">Keine Karten mehr! Du setzt aus.</div>';
        setTimeout(() => { playRound(null); }, 1500);
        return;
    }
    
    let forcedCards = [];
    if (oEffects.forceWeakest && !pEffects.vehicles && playerHandRemaining.length > 0) {
        let sorted = [...playerHandRemaining].sort((a,b) => (getCardScore(a.charName)*(RARITY_MULT[a.rarity]||1.0)) - (getCardScore(b.charName)*(RARITY_MULT[b.rarity]||1.0)));
        forcedCards.push(sorted[0]);
        if(sorted.length > 1) forcedCards.push(sorted[1]);
    }

    playerDeck.forEach((c) => {
        const isPlayed = !playerHandRemaining.includes(c);
        const isForcedOut = forcedCards.length > 0 && !forcedCards.includes(c) && !isPlayed;
        const disabled = isPlayed || isForcedOut;
        
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        const div = document.createElement('div');
        div.style.cssText = `cursor:${disabled ? 'not-allowed' : 'pointer'}; border-radius:5px; padding:5px; background:#222; text-align:center; width:80px; transition:transform 0.2s; ${disabled ? 'filter:grayscale(100%) opacity(0.4);' : ''}`;
        if (isForcedOut) div.style.border = '1px solid #ff4757';
        
        if (!disabled) {
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
        
        div.innerHTML = createCardHTML(dbC, c.rarity, false, 'height:80px;') +
            `<div style="font-size:0.65rem; color:#fff; text-align:center; padding:3px; background:rgba(0,0,0,0.8);">${c.charName}</div>`;
        hand.appendChild(div);
    });
}

function playRound(playerCard, explicitOppCard = null) {
    let pForcedJedi = false;
    let oForcedJedi = false;
    let pLog = [];
    let oLog = [];

    if (playerCard && !pEffects.vehicles) {
        let allValid = [...playerHandRemaining];
        if (!allValid.includes(playerCard)) allValid.push(playerCard);

        if (oEffects.forceWeakest) {
            allValid.sort((a,b) => (getCardScore(a.charName)*(RARITY_MULT[a.rarity]||1.0)) - (getCardScore(b.charName)*(RARITY_MULT[b.rarity]||1.0)));
            let validChoices = [allValid[0]];
            if(allValid.length > 1) validChoices.push(allValid[1]);
            if (!validChoices.includes(playerCard)) playerCard = allValid[0];
            oEffects.forceWeakest = false;
            pForcedJedi = true;
        } else if (oEffects.forceStrongest) {
            allValid.sort((a,b) => (getCardScore(b.charName)*(RARITY_MULT[b.rarity]||1.0)) - (getCardScore(a.charName)*(RARITY_MULT[a.rarity]||1.0)));
            playerCard = allValid[0];
            oEffects.forceStrongest = false;
            pLog.push("Erpressung (Stärkste Karte erzwungen)");
        } else if (pEffects.forceRandom) {
            playerCard = allValid[Math.floor(Math.random() * allValid.length)];
            pEffects.forceRandom = false;
            pLog.push("Befehlsverweigerung (Zufällige Karte gezogen)");
        }
    }

    if (playerCard) {
        const idx = playerHandRemaining.findIndex(c => c === playerCard);
        if(idx > -1) playerHandRemaining.splice(idx, 1);
        playedPlayerCards.push(playerCard);
    }
    
    let oppCard = explicitOppCard;
    if (!oppCard) {
        if (oEffects.vehicles) {
            oppCard = oEffects.vehicles;
            oEffects.vehicles = null;
        } else if (opponentHandRemaining.length > 0) {
            if (pEffects.forceWeakest) {
                opponentHandRemaining.sort((a,b) => (getCardScore(a.charName)*(RARITY_MULT[a.rarity]||1.0)) - (getCardScore(b.charName)*(RARITY_MULT[b.rarity]||1.0)));
                let validChoices = [opponentHandRemaining[0]];
                if(opponentHandRemaining.length > 1) validChoices.push(opponentHandRemaining[1]);
                oppCard = validChoices[Math.floor(Math.random() * validChoices.length)];
                pEffects.forceWeakest = false;
                oForcedJedi = true;
            } else if (pEffects.forceStrongest) {
                opponentHandRemaining.sort((a,b) => (getCardScore(b.charName)*(RARITY_MULT[b.rarity]||1.0)) - (getCardScore(a.charName)*(RARITY_MULT[a.rarity]||1.0)));
                oppCard = opponentHandRemaining[0];
                pEffects.forceStrongest = false;
                oLog.push("Erpressung (Stärkste Karte erzwungen)");
            } else if (oEffects.forceRandom) {
                oppCard = opponentHandRemaining[Math.floor(Math.random() * opponentHandRemaining.length)];
                oEffects.forceRandom = false;
                oLog.push("Befehlsverweigerung (Zufällige Karte gezogen)");
            } else {
                let pDbCheat = playerCard ? activeCharacterDatabase.find(x => x.name === playerCard.charName) : null;
                let pFacCheat = pDbCheat ? getMainFaction(pDbCheat.tags) : 'neutral';
                let pScoreBase = playerCard ? (getCardScore(playerCard.charName) * (RARITY_MULT[playerCard.rarity] || 1.0)) : 0;
                
                let pSimScore = pScoreBase;
                if (pEffects.klon && pFacCheat === 'klon') pSimScore += pEffects.lastCloneDead;
                if (pEffects.droid && pFacCheat === 'droid') pSimScore *= 2;
                if (pFacCheat === 'bad_batch') pSimScore += 4.0;
                
                let bestCards = [];
                let bestScore = -99999;
                
                opponentHandRemaining.forEach(card => {
                    let db = activeCharacterDatabase.find(x => x.name === card.charName);
                    let fac = db ? getMainFaction(db.tags) : 'neutral';
                    let baseScore = getCardScore(card.charName) * (RARITY_MULT[card.rarity] || 1.0);
                    
                    let simulatedScore = baseScore;
                    if (oEffects.klon && fac === 'klon') simulatedScore += oEffects.lastCloneDead;
                    if (oEffects.droid && fac === 'droid') simulatedScore *= 2;
                    if (fac === 'bad_batch') simulatedScore += 4.0;
                    
                    let pSimScoreLocal = pSimScore;
                    if (fac === 'mandalorianer' || fac === 'mandalorian') pSimScoreLocal = pScoreBase; // Silence
                    
                    let diff = simulatedScore - pSimScoreLocal;
                    if (fac === 'graue machtnutzer') diff = pSimScoreLocal - simulatedScore; // Ausgleich
                    
                    let aiScore = 0;
                    
                    if (diff > 0) {
                        // Winning! Optimize to win with the smallest margin.
                        aiScore = 1000 - diff;
                    } else {
                        // Losing!
                        if (fac === 'senat') {
                            aiScore = 800; // Veto saves the round, great move!
                        } else if (fac === 'schmuggel') {
                            aiScore = 700; // Schmuggler returns to deck, good sacrifice!
                        } else {
                            // Sacrifice worst card (lowest score)
                            aiScore = -simulatedScore; 
                        }
                    }
                    
                    // Specific timing based on board state
                    if (fac === '501st' && diff > 0 && playerHandRemaining.length > 0) aiScore += 5;
                    if (fac === 'nachtschwester' && diff > 0 && playerGraveyard.length > 0) aiScore += 5;

                    // Add small randomness to prevent total predictability
                    aiScore += Math.random() * 0.5;
                    
                    if (aiScore > bestScore) {
                        bestScore = aiScore;
                        bestCards = [card];
                    } else if (Math.abs(aiScore - bestScore) < 0.1) {
                        bestCards.push(card);
                    }
                });
                
                oppCard = bestCards[Math.floor(Math.random() * bestCards.length)];
            }
        }
    }
    
    if (oppCard && !explicitOppCard && !oEffects.vehicles) {
        const idx = opponentHandRemaining.findIndex(c => c === oppCard);
        if(idx > -1) opponentHandRemaining.splice(idx, 1);
        if(!playedOpponentCards.includes(oppCard)) playedOpponentCards.push(oppCard);
    }
    
    let pDb = playerCard ? activeCharacterDatabase.find(x => x.name === playerCard.charName) : null;
    let oDb = oppCard ? activeCharacterDatabase.find(x => x.name === oppCard.charName) : null;
    
    let pFac = pDb ? getMainFaction(pDb.tags) : 'neutral';
    let oFac = oDb ? getMainFaction(oDb.tags) : 'neutral';
    
    let pTags = pDb && pDb.tags ? pDb.tags.map(t => t.toLowerCase()) : [];
    let oTags = oDb && oDb.tags ? oDb.tags.map(t => t.toLowerCase()) : [];
    let pSyn = calculateSynergy(playerDeck);
    let oSyn = calculateSynergy(opponentDeck);
    let pHas = (fac) => pSyn.some(s => s.faction === fac);
    let oHas = (fac) => oSyn.some(s => s.faction === fac);
    
    let pSilence = pHas('mandalorianer') && pFac === 'mandalorianer';
    let oSilence = oHas('mandalorianer') && oFac === 'mandalorianer';
    
    if (isAdventureMatch && adventureRule === 'adv_rule_5' && oTags.includes('mandalorian')) oSilence = true;


    let pRarMult = playerCard ? (RARITY_MULT[playerCard.rarity] || 1.0) : 1.0;
    let oRarMult = oppCard ? (RARITY_MULT[oppCard.rarity] || 1.0) : 1.0;
    
    if (!oSilence && pHas('212th') && pFac === '212th' && oRarMult > pRarMult) {
        pRarMult = oRarMult;
        pLog.push("High Ground (Rarity kopiert)");
    }
    if (!pSilence && oHas('212th') && oFac === '212th' && pRarMult > oRarMult) {
        oRarMult = pRarMult;
        oLog.push("High Ground (Rarity kopiert)");
    }

    let pBaseRaw = playerCard ? (playerCard.isGhost ? 0 : getCardScore(playerCard.charName)) : 0;
    let oBaseRaw = oppCard ? (oppCard.isGhost ? 0 : getCardScore(oppCard.charName)) : 0;
    if (oppCard && oppCard.rule18Revived) oBaseRaw *= 0.5;

    
    let pBase = pBaseRaw * pRarMult;
    let oBase = oBaseRaw * oRarMult;

    if (isAdventureMatch) {
        if (adventureRule === 'adv_rule_3' && oFac === 'droid') { oBase *= 1.05; oLog.push("Boss-Regel (+5%)"); }
        if (adventureRule === 'adv_rule_8' && oFac === 'fahrzeug') { oBase *= 1.10; oLog.push("Boss-Regel (+10%)"); }
        if (adventureRule === 'adv_rule_19') { oBase *= 1.20; oLog.push("Boss-Regel (+20%)"); }
        if (adventureRule === 'adv_rule_13' && (pFac === 'klon' || pFac === 'droid')) { pBase *= 0.90; pLog.push("Boss-Regel (-10%)"); }
        if (adventureRule === 'adv_rule_15' && opponentScore > playerScore) { pBase *= 0.90; pLog.push("Boss-Regel (Thrawn -10%)"); }
    }


    if (!oSilence && pHas('monster') && pFac === 'monster') {
        const factor = 1.0 + ((Math.random() * 40 - 20) / 100);
        pBase *= factor;
        pLog.push(`Raserei (${factor < 1 ? '-' : '+'}${Math.abs(Math.round((factor - 1) * 100))}%)`);
    }
    if (!pSilence && oHas('monster') && oFac === 'monster') {
        const factor = 1.0 + ((Math.random() * 40 - 20) / 100);
        oBase *= factor;
        oLog.push(`Raserei (${factor < 1 ? '-' : '+'}${Math.abs(Math.round((factor - 1) * 100))}%)`);
    }

    if (!oSilence && pHas('separatist') && pFac === 'separatist' && oBaseRaw > pBaseRaw) {
        pBase += 2.5;
        pLog.push("Übermacht (+2.5 Score)");
    }
    if (!pSilence && oHas('separatist') && oFac === 'separatist' && pBaseRaw > oBaseRaw) {
        oBase += 2.5;
        oLog.push("Übermacht (+2.5 Score)");
    }
    
    if (pForcedJedi) pLog.push("Gedankentrick (schwächere Karte erzwungen)");
    if (oForcedJedi) oLog.push("Gedankentrick (schwächere Karte erzwungen)");
    
    if (!pSilence && !oSilence) {
        let pSwap = pHas('schurke') && pFac === 'schurke';
        let oSwap = oHas('schurke') && oFac === 'schurke';
        if (pSwap !== oSwap && playerCard && oppCard) {
            let tempC = playerCard; playerCard = oppCard; oppCard = tempC;
            let tempDb = pDb; pDb = oDb; oDb = tempDb;
            let tempFac = pFac; pFac = oFac; oFac = tempFac;
            let tempBase = pBase; pBase = oBase; oBase = tempBase;
            if (pSwap) pLog.push("Falsches Spiel (Karten getauscht)");
            if (oSwap) oLog.push("Falsches Spiel (Karten getauscht)");
        }
    }
    
    if (pEffects.orbitalStrike) { pBase = 0; oBase = 0; pEffects.orbitalStrike = false; pLog.push("Orbitalschlag (Zerstört)"); oLog.push("Orbitalschlag (Zerstört)"); }
    if (oEffects.orbitalStrike) { pBase = 0; oBase = 0; oEffects.orbitalStrike = false; oLog.push("Orbitalschlag (Zerstört)"); pLog.push("Orbitalschlag (Zerstört)"); }
    
    if (pEffects.oppression) { 
        let mult = 0.75;
        if (isAdventureMatch && adventureRule === 'adv_rule_11') mult = 0.70;
        if (isAdventureMatch && adventureRule === 'adv_rule_20') mult = 0.65;
        pBase *= mult; pEffects.oppression = false; pLog.push(`Unterdrückt (-${Math.round((1-mult)*100)}% Score)`); 
    }
    if (oEffects.oppression) { oBase *= 0.75; oEffects.oppression = false; oLog.push("Unterdrückt (-25% Score)"); }


    if (pEffects.martyrBuff) { pBase += 4.0; pEffects.martyrBuff = false; pLog.push("Opfermut (+4.0 Score)"); }
    if (oEffects.martyrBuff) { oBase += 4.0; oEffects.martyrBuff = false; oLog.push("Opfermut (+4.0 Score)"); }

    if (playerCard) {
        if (!oSilence && pHas('klon') && pFac === 'klon') {
            pEffects.cloneChain++;
            if (pEffects.lastCloneDead) {
                pBase += pEffects.lastCloneDead;
                pLog.push(`Klon-Kette (+${pEffects.lastCloneDead.toFixed(1)} Score)`);
            }
        } else {
            pEffects.cloneChain = 0;
            pEffects.lastCloneDead = null;
        }
        
        if (!oSilence && pEffects.nextDroidDouble && pFac === 'droid') { pBase *= 2; pEffects.nextDroidDouble = false; pLog.push("Verschmelzung (Score x2)"); }
        if (!oSilence && pHas('rebell') && pFac === 'rebell' && playerScore < opponentScore) { pBase *= 2; pLog.push("Hoffnung (Score x2)"); }
        if (!oSilence && pHas('bad_batch') && pFac === 'bad_batch') { pBase += 4.0; pEffects.forceRandom = true; pLog.push("Kloneinheit 99 (+4.0 Score, Random Next)"); }
        if (!oSilence && pHas('hutte') && pFac === 'hutte') { pEffects.forceStrongest = true; pLog.push("Erpressung initiiert"); }
        if (pSilence) pLog.push("Beskar (Silence)");
    }
    if (oppCard) {
        if (!pSilence && oHas('klon') && oFac === 'klon') {
            oEffects.cloneChain++;
            if (oEffects.lastCloneDead) {
                let bonus = (isAdventureMatch && adventureRule === 'adv_rule_7') ? oEffects.lastCloneDead * 1.5 : oEffects.lastCloneDead;
                oBase += bonus;
                oLog.push(`Klon-Kette (+${bonus.toFixed(1)} Score)`);
            }
        } else {

            oEffects.cloneChain = 0;
            oEffects.lastCloneDead = null;
        }
        
        if (!pSilence && oEffects.nextDroidDouble && oFac === 'droid') { 
            let mult = (isAdventureMatch && adventureRule === 'adv_rule_6') ? 3 : 2;
            oBase *= mult; 
            oEffects.nextDroidDouble = false; 
            oLog.push(`Verschmelzung (Score x${mult})`); 
        }

        if (!pSilence && oHas('rebell') && oFac === 'rebell' && opponentScore < playerScore) { 
            let mult = (isAdventureMatch && adventureRule === 'adv_rule_12') ? 2.5 : 2;
            oBase *= mult; 
            oLog.push(`Hoffnung (Score x${mult})`); 
        }

        if (!pSilence && oHas('bad_batch') && oFac === 'bad_batch') { oBase += 4.0; oEffects.forceRandom = true; oLog.push("Kloneinheit 99 (+4.0 Score, Random Next)"); }
        if (!pSilence && oHas('hutte') && oFac === 'hutte') { oEffects.forceStrongest = true; oLog.push("Erpressung initiiert"); }
        if (oSilence) oLog.push("Beskar (Silence)");
    }
    
    let isWin = false;
    let isDraw = false;
    
    let lowestWins = false;
    if (!oSilence && pHas('graue machtnutzer') && pFac === 'graue machtnutzer') { lowestWins = true; pLog.push("Ausgleich (Niedriger gewinnt)"); }
    if (!pSilence && oHas('graue machtnutzer') && oFac === 'graue machtnutzer') { lowestWins = true; oLog.push("Ausgleich (Niedriger gewinnt)"); }
    
    if (isAdventureMatch) {
        if (adventureRule === 'adv_rule_16' && Math.random() < 0.5) { lowestWins = true; oLog.push("Boss-Regel (Ausgleich erzwungen)"); }
        if (adventureRule === 'adv_rule_10' && oFac === 'droid' && lowestWins) { lowestWins = false; oLog.push("Boss-Regel (Immun gegen Ausgleich)"); }
    }

    
    if (pBase === oBase) {
        isDraw = true;
    } else {
        isWin = lowestWins ? (pBase < oBase) : (pBase > oBase);
        if(!playerCard) isWin = false;
        if(!oppCard) isWin = true;
    }
    
    if (playerCard && !oSilence && pHas('senat') && pFac === 'senat' && !isWin && !isDraw) {
        isDraw = true; isWin = false; pBase = 0; oBase = 0; pLog.push("Vorladung (Runde eingefroren)"); oLog.push("Vorladung (Runde eingefroren)");
    }
    if (oppCard && !pSilence && oHas('senat') && oFac === 'senat' && isWin && !isDraw) {
        isDraw = true; isWin = false; pBase = 0; oBase = 0; oLog.push("Vorladung (Runde eingefroren)"); pLog.push("Vorladung (Runde eingefroren)");
    }
    
    if (isWin && !isDraw) {
        playerScore++;
        if (!oSilence && pHas('Kopfgeldjäger') && pFac === 'Kopfgeldjäger' && oFac === pEffects.bountyTarget) { playerScore++; pLog.push("Kopfgeldjäger (+1 Extra-Punkt)"); }
    } else if (!isWin && !isDraw) {
        opponentScore++;
        if (!pSilence && oHas('Kopfgeldjäger') && oFac === 'Kopfgeldjäger' && pFac === oEffects.bountyTarget) { opponentScore++; oLog.push("Kopfgeldjäger (+1 Extra-Punkt)"); }
    }
    
    if (playerCard) {
        if (!isWin && !isDraw && !oSilence) {
            if (pHas('widerstand') && pFac === 'widerstand') { pEffects.martyrBuff = true; pLog.push("Widerstand geopfert"); }
            if (pHas('jedi') && (pFac === 'jedi' || pTags.includes('jedi'))) { pEffects.forceWeakest = true; pLog.push("Gedankentrick initiiert"); }
            if (pFac === 'klon') { pEffects.lastCloneDead = pBase; }
            if (pFac === 'droid') { pEffects.nextDroidDouble = true; }
            
            if (pHas('schmuggel') && pFac === 'schmuggel') {
                playerHandRemaining.push(playerCard);
                pLog.push("Hyperraum-Flucht");
            } else {
                if (isAdventureMatch && adventureRule === 'adv_rule_9' && !oEffects.rule9Done) {
                    opponentHandRemaining.push(playerCard);
                    oEffects.rule9Done = true;
                    oLog.push("Boss-Regel (Erste Karte geklaut)");
                } else {
                    playerGraveyard.push(playerCard);
                }
            }
        }
        if (isWin && !isDraw && !oSilence) {
            if (pHas('imperium') && pFac === 'imperium') { pEffects.oppression = true; pLog.push("Unterdrückung aktiviert"); }
            if (pHas('jedi') && (pFac === 'jedi' || pTags.includes('jedi'))) { pEffects.forceWeakest = true; pLog.push("Gedankentrick initiiert"); }
            if (pHas('fahrzeug') && pFac === 'fahrzeug') { pEffects.vehicles = playerCard; playerCard.isGhost = false; pLog.push("Überrollen (Bleibt auf Feld)"); }
            const pHas501stLeader = playerDeck.some(c => c.charName === 'Darth Vader' || c.charName === 'Anakin Skywalker');
            if (pHas('501st') && pFac === '501st' && opponentHandRemaining.length > 0 && pHas501stLeader) {
                let destroyed = opponentHandRemaining.pop();
                if(destroyed) { opponentGraveyard.push(destroyed); pLog.push("Vaders Faust (Karte vernichtet)"); }
            }
            if (pHas('nachtschwester') && pFac === 'nachtschwester' && opponentGraveyard.length > 0) {
                let stolen = opponentGraveyard.pop();
                playerHandRemaining.push(stolen);
                pLog.push("Nekromantie (Karte geklaut)");
            }
            if (pHas('erste ordnung') && pFac === 'erste ordnung' && oppCard) {
                playerHandRemaining.push(oppCard);
                pLog.push("Zwangsrekrutierung");
            }
        }
        if (isDraw && !oSilence) {
            if (pHas('jedi') && (pFac === 'jedi' || pTags.includes('jedi'))) { pEffects.forceWeakest = true; pLog.push("Gedankentrick initiiert"); }
        }
    }
    
    if (oppCard) {
        if (isWin && !isDraw && !pSilence) {
            if (oHas('widerstand') && oFac === 'widerstand') { oEffects.martyrBuff = true; oLog.push("Widerstand geopfert"); }
            if ((oHas('jedi') || (isAdventureMatch && adventureRule === 'adv_rule_17')) && (oFac === 'jedi' || oTags.includes('jedi'))) { oEffects.forceWeakest = true; oLog.push("Gedankentrick initiiert"); }
            if (oFac === 'klon') { oEffects.lastCloneDead = oBase; }
            if (oFac === 'droid') { oEffects.nextDroidDouble = true; }
            
            if (oHas('schmuggel') && oFac === 'schmuggel') {
                opponentHandRemaining.push(oppCard);
                oLog.push("Hyperraum-Flucht");
            } else {
                if (isAdventureMatch && adventureRule === 'adv_rule_18' && !oEffects.rule18Done && oFac === 'erste ordnung') {
                    oppCard.rule18Revived = true;
                    opponentHandRemaining.push(oppCard);
                    oEffects.rule18Done = true;
                    oLog.push("Boss-Regel (Karte wiederbelebt)");
                } else {
                    opponentGraveyard.push(oppCard);
                }
            }
        } else if (!isWin && !isDraw && !pSilence) {
            if (oHas('imperium') && oFac === 'imperium') { oEffects.oppression = true; oLog.push("Unterdrückung aktiviert"); }
            if ((oHas('jedi') || (isAdventureMatch && adventureRule === 'adv_rule_17')) && (oFac === 'jedi' || oTags.includes('jedi'))) { oEffects.forceWeakest = true; oLog.push("Gedankentrick initiiert"); }
            if (oHas('fahrzeug') && oFac === 'fahrzeug') { oEffects.vehicles = oppCard; oppCard.isGhost = false; oLog.push("Überrollen (Bleibt auf Feld)"); }
            const oHas501stLeader = opponentDeck.some(c => c.charName === 'Darth Vader' || c.charName === 'Anakin Skywalker');
            if (oHas('501st') && oFac === '501st' && playerHandRemaining.length > 0 && oHas501stLeader) {
                let destroyed = playerHandRemaining.pop();
                if(destroyed) { playerGraveyard.push(destroyed); oLog.push("Vaders Faust (Karte vernichtet)"); }
            }
            if (oHas('nachtschwester') && oFac === 'nachtschwester' && playerGraveyard.length > 0) {
                let stolen = playerGraveyard.pop();
                opponentHandRemaining.push(stolen);
                oLog.push("Nekromantie (Karte geklaut)");
            }
            if (oHas('erste ordnung') && oFac === 'erste ordnung' && playerCard) {
                opponentHandRemaining.push(playerCard);
                oLog.push("Zwangsrekrutierung");
            }
        }
        if (isDraw && !pSilence) {
            if ((oHas('jedi') || (isAdventureMatch && adventureRule === 'adv_rule_17')) && (oFac === 'jedi' || oTags.includes('jedi'))) { oEffects.forceWeakest = true; oLog.push("Gedankentrick initiiert"); }
        }
    }
    
    if (playerCard && pFac === 'sith' && !oSilence) {
        pEffects.sithPlayed++;
        if (pEffects.sithPlayed === 2 && opponentHandRemaining.length > 0) {
            opponentGraveyard.push(opponentHandRemaining.pop());
            pLog.push("Ausdünnung (Karte vernichtet)");
        }
    }
    if (oppCard && oFac === 'sith' && !pSilence) {
        oEffects.sithPlayed++;
        if (oEffects.sithPlayed === 2 && playerHandRemaining.length > 0) {
            let millCount = 1;
            if (isAdventureMatch && (adventureRule === 'adv_rule_14' || adventureRule === 'adv_rule_20')) millCount = 2;
            for(let i=0; i<millCount; i++) {
                if (playerHandRemaining.length > 0) {
                    playerGraveyard.push(playerHandRemaining.pop());
                }
            }
            oLog.push(`Ausdünnung (${millCount} Karte(n) vernichtet)`);
            oEffects.sithPlayed = 0;
        }
    }

    document.getElementById('match-player-score').innerText = playerScore;
    document.getElementById('match-opponent-score').innerText = opponentScore;
    
    const resultIcon = isWin ? '&#x1F3C6;' : (isDraw ? '&#x1F91D;' : '&#x1F4A5;');
    const resultLabel = isWin
        ? `<span style="color:#2ed573; font-size:1.4rem; font-weight:bold;">RUNDE GEWONNEN!</span>`
        : (isDraw ? `<span style="color:#ffd700; font-size:1.4rem; font-weight:bold;">UNENTSCHIEDEN</span>` : `<span style="color:#ff4757; font-size:1.4rem; font-weight:bold;">RUNDE VERLOREN!</span>`);
            
    document.getElementById('match-round-result').innerHTML = `<div style="font-size:2rem; margin-bottom:8px;">${resultIcon}</div>${resultLabel}`;
    
    const pName = playerCard ? playerCard.charName : 'Niemand';
    const oName = oppCard ? oppCard.charName : 'Niemand';
    
    const pRarityName = playerCard ? playerCard.rarity : '';
    const oRarityName = oppCard ? oppCard.rarity : '';
    
    function getEffectTooltip(logMsg) {
        const m = logMsg.toLowerCase();
        if(m.includes('gedankentrick')) return 'Jedi: Zwingt den Gegner, seine schwächste Karte zu spielen.';
        if(m.includes('verschmelzung')) return 'Droiden: Verdoppelt den Basis-Score des nächsten gespielten Droiden.';
        if(m.includes('vaders faust')) return '501st: Zerstört eine zufällige Karte auf der Hand des Gegners.';
        if(m.includes('erpressung')) return 'Hutten: Zwingt den Gegner, seine stärkste Karte zu spielen.';
        if(m.includes('befehlsverweigerung')) return 'Befehl wurde durch einen Effekt blockiert, zufällige Karte gezogen.';
        if(m.includes('high ground')) return '212th: Kopiert den Seltenheits-Multiplikator des Gegners, wenn dieser höher ist.';
        if(m.includes('raserei')) return 'Monster: Erhöht oder verringert den Basis-Score drastisch.';
        if(m.includes('übermacht')) return 'Separatisten: Bonus-Score gegen Decks mit höheren Basis-Stats.';
        if(m.includes('falsches spiel')) return 'Schurken: Tauscht die gespielten Karten beider Spieler.';
        if(m.includes('orbitalschlag')) return 'Eine Karte wurde durch einen zerstörerischen Effekt vernichtet.';
        if(m.includes('Unterdrückt') || m.includes('unterdrückung')) return 'Imperium: Reduziert den Score des Gegners in der nächsten Runde um 25%.';
        if(m.includes('opfermut')) return 'Widerstand: Gibt in der nächsten Runde einen massiven +4.0 Score Bonus.';
        if(m.includes('klon-kette')) return 'Klone: Bonuspunkte basierend auf vorherigen Klone-Scores in Folge.';
        if(m.includes('hoffnung')) return 'Rebellen: Verdoppelt den Score, wenn du insgesamt im Rückstand bist.';
        if(m.includes('kloneinheit 99')) return 'Bad Batch: Massiver Score-Bonus, aber erzwingt danach einen zufälligen Zug.';
        if(m.includes('beskar')) return 'Mandalorianer: Unterdrückt gegnerische Effekte.';
        if(m.includes('ausgleich')) return 'Graue Machtnutzer: Die niedrigste Punktzahl gewinnt diese Runde.';
        if(m.includes('vorladung')) return 'Senat: Friert die Runde ein und macht sie zu einem Unentschieden.';
        if(m.includes('kopfgeld')) return 'Kopfgeldjäger: Gibt einen Extra-Punkt beim Besiegen der Ziel-Fraktion.';
        if(m.includes('hyperraum')) return 'Schmuggler: Die Karte kehrt bei Niederlage in die Hand zurück.';
        if(m.includes('überrollen')) return 'Fahrzeug: Die Karte bleibt nach einem Sieg auf dem Feld.';
        if(m.includes('nekromantie')) return 'Nachtschwestern: Klaut die zerstörte Karte des Gegners.';
        if(m.includes('zwangsrekrutierung')) return 'Erste Ordnung: Fügt die besiegte gegnerische Karte deiner Hand hinzu.';
        if(m.includes('ausdünnung')) return 'Sith: Vernichtet eine zusätzliche gegnerische Karte nach zwei gespielten Sith.';
        return '';
    }

    const formatDetailedCalc = (baseRaw, rarMult, rarName, finalScore, logs) => {
        let effHTML = '';
        if (logs.length > 0) {
            effHTML = `<div style="margin-top:8px; border-top:1px dashed #444; padding-top:8px;">
                          <div style="font-size:0.7rem; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Aktive Effekte:</div>
                          ${logs.map(l => {
                              const tip = getEffectTooltip(l);
                              if(tip) return `<div class="has-tooltip" data-tooltip="${tip}" style="color:#a855f7; font-size:0.75rem; margin-bottom:2px; cursor:help; border-bottom:1px dotted #a855f7; display:inline-block; margin-right:5px;">✨ ${l}</div><br>`;
                              return `<div style="color:#a855f7; font-size:0.75rem; margin-bottom:2px;">✨ ${l}</div>`;
                          }).join('')}
                       </div>`;
        } else {
            effHTML = `<div style="margin-top:8px; border-top:1px dashed #444; padding-top:8px; font-size:0.7rem; color:#555;">Keine aktiven Effekte</div>`;
        }
        
        return `
            <div style="font-size:0.8rem; color:#ccc; display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Basiswert:</span> <span>${baseRaw.toFixed(1)}</span>
            </div>
            <div style="font-size:0.8rem; color:#ccc; display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Seltenheit (${rarName}):</span> <span>x${rarMult.toFixed(2)}</span>
            </div>
            ${effHTML}
            <div style="margin-top:8px; border-top:1px solid #444; padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.8rem; color:#aaa;">Endgültiger Score:</span>
                <span style="color:#fff; font-size:1.4rem; font-weight:bold;">${finalScore.toFixed(1)}</span>
            </div>
        `;
    };

    document.getElementById('match-round-calc').innerHTML = `
        <div style="display:flex; gap:12px; text-align:left;">
            <div style="flex:1; background:#111; border-radius:8px; padding:12px; border:1px solid #2ed57355; box-shadow: 0 4px 10px rgba(46,213,115,0.1);">
                <div style="font-size:0.9rem; color:#2ed573; font-weight:bold; margin-bottom:8px; text-align:center; border-bottom:1px solid #2ed57355; padding-bottom:4px;">Du (${pName})</div>
                ${formatDetailedCalc(pBaseRaw, pRarMult, pRarityName, pBase, pLog)}
            </div>
            <div style="flex:1; background:#111; border-radius:8px; padding:12px; border:1px solid #ff475755; box-shadow: 0 4px 10px rgba(255,71,87,0.1);">
                <div style="font-size:0.9rem; color:#ff4757; font-weight:bold; margin-bottom:8px; text-align:center; border-bottom:1px solid #ff475755; padding-bottom:4px;">Gegner (${oName})</div>
                ${formatDetailedCalc(oBaseRaw, oRarMult, oRarityName, oBase, oLog)}
            </div>
        </div>

    `;
    
    currentRound++;
    document.getElementById('match-player-hand').innerHTML = '';
    
    if (playerCard && pDb) {
        document.getElementById("match-player-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${pDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid #fff;"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${pName}</div></div>`;
    } else {
        document.getElementById("match-player-active").innerHTML = ``;
    }
    
    if (oppCard && oDb) {
        document.getElementById("match-opponent-active").innerHTML = `<div style="text-align:center; position:relative; width:150px; height:210px;"><img src="${oDb.img}" style="width:150px; height:200px; object-fit:cover; border-radius:5px; border:2px solid #fff;"><div style="color:#fff; font-size:0.8rem; margin-top:5px;">${oName}</div></div>`;
    } else {
        document.getElementById("match-opponent-active").innerHTML = ``;
    }

    pLog.forEach((msg, i) => {
        setTimeout(() => showMatchToast(msg.split(' (')[0], true, '#2ed573'), 200 + (i * 600));
    });
    oLog.forEach((msg, i) => {
        setTimeout(() => showMatchToast(msg.split(' (')[0], false, '#ff4757'), 200 + (i * 600));
    });

    setTimeout(() => {
        document.getElementById('match-result-overlay').classList.remove('hidden');
        if (playerHandRemaining.length === 0 && opponentHandRemaining.length === 0 && !pEffects.vehicles && !oEffects.vehicles) {
            setTimeout(() => {
                document.getElementById('match-result-overlay').classList.add('hidden');
                finishMatch();
            }, 1500);
        }
    }, 200);
}

async function showMatchToast(text, isPlayer, color = '#ffd700') {
    const containerId = isPlayer ? 'match-player-active' : 'match-opponent-active';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'match-toast';
    toast.innerText = text;
    toast.style.color = color;
    // Randomize slight left/right to prevent overlapping
    toast.style.left = (20 + Math.random() * 60) + '%';
    toast.style.top = '20%';
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

async function finishMatch() {
    document.getElementById('cardgame-match').classList.add('hidden');
    document.getElementById('match-result-overlay').classList.add('hidden');
    
    if (isAdventureMatch) {
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
            const defeatedField = currentMode === 'starwars' ? 'defeated_tut2_bots_starwars' : 'defeated_bots_waifu';
            const defeatedBots = user[defeatedField] || [];
            
            if (!defeatedBots.includes(opponentData.botLevel)) {
                defeatedBots.push(opponentData.botLevel);
                user[defeatedField] = defeatedBots;
                
                // Credit rewards for level 1 to 10
                const reward = opponentData.reward || 0;
                user.credits = (user.credits || 0) + reward;
                
                // Unlock Title if all bots defeated
                const titlesField = currentMode === 'starwars' ? 'unlocked_titles_starwars' : 'unlocked_titles_waifu';
                let unlockedTitles = user[titlesField] || [];
                let unlockedNewTitle = false;
                
                if (defeatedBots.length === 22) {
                    const titleId = 'sw_tut_master';
                    if (!unlockedTitles.includes(titleId)) {
                        unlockedTitles.push(titleId);
                        user[titlesField] = unlockedTitles;
                        unlockedNewTitle = true;
                    }
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



