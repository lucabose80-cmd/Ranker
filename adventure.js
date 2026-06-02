import { getCurrentUser, CURRENT_USER_KEY } from './auth.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';
import { trackWrite, trackRead } from './tracker.js';

import { startAdventureMatch, loadGlobalScores, getCardScore, getRarityColor } from './cardgame.js';

export function rollRarityForLevel(levelIdx) {
    const r = Math.random();
    if (levelIdx >= 18) { // 19, 20
        if(r < 0.10) return 'legendary';
        if(r < 0.30) return 'epic';
        if(r < 0.70) return 'rare';
        return 'common';
    } else if (levelIdx >= 14) { // 15, 16, 17, 18
        if(r < 0.05) return 'legendary';
        if(r < 0.20) return 'epic';
        if(r < 0.50) return 'rare';
        return 'common';
    } else if (levelIdx >= 9) { // 10, 11, 12, 13, 14
        if(r < 0.10) return 'epic';
        if(r < 0.40) return 'rare';
        return 'common';
    } else if (levelIdx >= 4) { // 5, 6, 7, 8, 9
        if(r < 0.20) return 'rare';
        return 'common';
    }
    return 'common';
}

function migrateDeck(deckArray) {
    if(!deckArray) return [];
    return deckArray.map(item => {
        if(typeof item === 'string') return { charName: item, rarity: 'common' };
        return item;
    });
}


const ADVENTURE_LEVELS = 20;

// Base deck all players start with in Adventure Mode
export const BASE_ADVENTURE_DECK = [
    { charName: 'Mon Mothma', rarity: 'common' }, // Rebell
    { charName: 'Commander Cody', rarity: 'common' }, // Klon
    { charName: 'B1 Battle Droide', rarity: 'common' }, // Droid
    { charName: 'Cad Bane', rarity: 'common' }, // Schurke / Unterwelt
    { charName: 'Rose Tico', rarity: 'common' }, // Widerstand
    { charName: 'FN-2199', rarity: 'common' }, // Erste Ordnung
    { charName: 'Admiral Piett', rarity: 'common' }, // Imperium
    { charName: 'Coleman Trebor', rarity: 'common' }, // Jedi
    { charName: 'Zam Wesell', rarity: 'common' }, // Kopfgeldjäger
    { charName: 'Nute Gunray', rarity: 'common' } // Separatist
];

// Adventure Campaign Configuration
export const ADVENTURE_CAMPAIGN = [
    // Phase 1: Die Gesetzlosen (Level 1-5)
    { name: "Plünderer", avatar: "", ruleId: "adv_rule_1", deck: ["Trace Martez", "Rafa Martez", "Gamorrean Guard", "B1 Battle Droide", "Ponda Baba", "Cornelius Evazan", "Salacious B. Crumb", "Gorian Shard", "Vane", "Nien Nunb"], ruleText: "Keine Sonderregeln." },
    { name: "Schmuggel-Ring", avatar: "", ruleId: "adv_rule_2", deck: ["Hondo Ohnaka", "DJ", "Enfys Nest", "Dryden Vos", "Qi'ra", "Han Solo", "Lando Calrissian", "Chewbacca", "Zam Wesell", "Greedo"], ruleText: "Keine Sonderregeln." },
    { name: "Separatisten-Patrouille", avatar: "", ruleId: "adv_rule_3", deck: ["B1 Battle Droide", "B2 Super Battle Droide", "Droideka", "Kommando Droide", "OOM-9", "Zwergspinnendroide", "Spybot", "Pit Droid", "AZI-3", "General Kalani"], ruleText: "Alle Droiden des Gegners haben +5% Basis-Stärke." },
    { name: "Piraten-Flotte", avatar: "", ruleId: "adv_rule_4", deck: ["Hondo Ohnaka", "Vane", "Gorian Shard", "Millennium Falcon", "Slave I", "Razor Crest", "TIE Fighter", "X-Wing", "Kragan Gorr", "Boba Fett"], ruleText: "Keine Sonderregeln." },
    { name: "Mandalorianische Söldner", avatar: "", ruleId: "adv_rule_5", deck: ["Din Djarin", "Bo-Katan Kryze", "Paz Vizsla", "The Armorer", "Koska Reeves", "Axe Woves", "Jango Fett", "Boba Fett", "Fenn Rau", "Pre Vizsla"], ruleText: "Gegnerische Mandalorianer verhindern deine Buffs auch bei nur 1 gespielten Mando (Silence)." },
    
    // Phase 2: Der Klonkrieg (Level 6-10)
    { name: "Droiden-Bataillon", avatar: "", ruleId: "adv_rule_6", deck: ["General Grievous", "B1 Battle Droide", "B2 Super Battle Droide", "Droideka", "Kommando Droide", "MagnaGuard", "OOM-9", "Wat Tambor", "Poggle the Lesser", "Nute Gunray"], ruleText: "Gegnerische Droiden-Verschmelzung gibt +2 statt +1 Boost." },
    { name: "Die 501. Legion", avatar: "", ruleId: "adv_rule_7", deck: ["Captain Rex", "Commander Cody", "Fives", "Echo", "Jesse", "Wolffe", "Gregor", "Kix", "Hardcase", "Appo"], ruleText: "Jeder besiegte Klon gibt +3 statt +2 Stats an die Überlebenden." },
    { name: "Fahrzeug-Depot", avatar: "", ruleId: "adv_rule_8", deck: ["AT-AT Walker", "AT-ST", "Republic Gunship (LAAT)", "Venator-class Star Destroyer", "Imperial Star Destroyer", "TIE Interceptor", "X-Wing", "Y-Wing", "A-Wing", "Millennium Falcon"], ruleText: "Gegnerische Fahrzeuge haben +10% Basis-Stärke." },
    { name: "Die Nachtschwestern", avatar: "", ruleId: "adv_rule_9", deck: ["Mother Talzin", "Asajj Ventress", "Merrin", "Morgan Elsbeth", "Old Daka", "Talia", "Savage Opress", "Darth Maul", "Rancor", "Osha Aniseya"], ruleText: "Der Gegner klaut deine ERSTE besiegte Karte in dieser Runde automatisch." },
    { name: "General Grievous [BOSS]", avatar: "", ruleId: "adv_rule_10", deck: ["General Grievous", "MagnaGuard", "B1 Battle Droide", "Droideka", "B2 Super Battle Droide", "Kommando Droide", "Count Dooku", "Asajj Ventress", "Soulless One", "Trade Federation Battleship"], ruleText: "BOSS: Gegnerischer Grievous und alle Droiden sind immun gegen 'Graue Machtnutzer' (Ausgleich)!" },

    // Phase 3: Die Rebellion (Level 11-15)
    { name: "Imperiale Patrouille", avatar: "", ruleId: "adv_rule_11", deck: ["Stormtrooper", "Scout Trooper", "Death Trooper", "Shoretrooper", "Snowtrooper", "TIE Fighter Pilot", "AT-AT Driver", "General Veers", "Admiral Piett", "Grand Moff Tarkin"], ruleText: "Gegnerisches Imperium zieht dir 30% (statt 25%) ab, wenn es gewinnt." },
    { name: "Rebellen-Zelle", avatar: "", ruleId: "adv_rule_12", deck: ["Jyn Erso", "Cassian Andor", "Saw Gerrera", "Mon Mothma", "Admiral Ackbar", "Wedge Antilles", "Hera Syndulla", "Sabine Wren", "Kanan Jarrus", "Ezra Bridger"], ruleText: "Gegnerische Rebellen bekommen x2.5 Punkte bei Comebacks (statt x2)." },
    { name: "Schatten-Kollektiv", avatar: "", ruleId: "adv_rule_13", deck: ["Darth Maul", "Savage Opress", "Pre Vizsla", "Bo-Katan Kryze", "Gar Saxon", "Dryden Vos", "Qi'ra", "Lom Pyke", "Ziro the Hutt", "Cad Bane"], ruleText: "Deine Klone und Droiden sind durch Jamming 10% schwächer." },
    { name: "Inquisitoren", avatar: "", ruleId: "adv_rule_14", deck: ["Grand Inquisitor", "Second Sister", "Third Sister", "Fifth Brother", "Seventh Sister", "Eighth Brother", "Ninth Sister", "Darth Vader", "Purge Trooper", "Suchdroide"], ruleText: "Gegnerische Sith millen (zerstören) 2 Karten auf deiner Hand statt 1." },
    { name: "Großadmiral Thrawn [BOSS]", avatar: "", ruleId: "adv_rule_15", deck: ["Grand Admiral Thrawn", "Imperial Star Destroyer", "Chimaera", "Rukh", "Governor Pryce", "Captain Pellaeon", "Death Trooper", "TIE Defender", "Admiral Piett", "Darth Vader"], ruleText: "BOSS: Thrawns Taktik: Wenn der Gegner führt, verlieren alle deine Karten -10% Stats." },

    // Phase 4: Das Erwachen (Level 16-20)
    { name: "Graue Wanderer", avatar: "", ruleId: "adv_rule_16", deck: ["Baylan Skoll", "Shin Hati", "Starkiller", "Ahsoka Tano (Weiß)", "Bendu", "Der Vater", "Die Tochter", "Der Sohn", "Qimir (Der Fremde)", "Asajj Ventress"], ruleText: "Die Regel 'Schwächste Karte gewinnt' gilt in 50% der Runden automatisch für den Gegner!" },
    { name: "Erwachen der Macht", avatar: "", ruleId: "adv_rule_17", deck: ["Rey Skywalker", "Luke Skywalker", "Leia Organa", "Ben Solo", "Yoda", "Obi-Wan Kenobi", "Qui-Gon Jinn", "Mace Windu", "Plo Koon", "Ahsoka Tano"], ruleText: "Gegnerische Jedi wenden IMMER den Gedankentrick an, auch ohne 3er-Bonus." },
    { name: "Die Erste Ordnung", avatar: "", ruleId: "adv_rule_18", deck: ["Kylo Ren", "Supreme Leader Snoke", "Captain Phasma", "General Hux", "Sith Trooper", "Executioner Trooper", "Allegiant General Pryde", "FN-2199", "Praetorian Guard", "Knights of Ren"], ruleText: "Besiegte Erste Ordnung-Karten kehren 1x mit 50% Stärke ins Deck des Gegners zurück!" },
    { name: "Jedi-Rat", avatar: "", ruleId: "adv_rule_19", deck: ["Yoda", "Mace Windu", "Plo Koon", "Ki-Adi-Mundi", "Saesee Tiin", "Kit Fisto", "Shaak Ti", "Luminara Unduli", "Oppo Rancisis", "Yaddle"], ruleText: "Die Macht ist stark: Gegnerische Karten haben pauschal +20% Basis-Stats." },
    { name: "Imperator Palpatine [FINAL BOSS]", avatar: "", ruleId: "adv_rule_20", deck: ["Emperor Palpatine", "Darth Vader", "Darth Maul", "Count Dooku", "Darth Plagueis", "Darth Malgus", "Darth Jar Jar", "Kylo Ren", "Supreme Leader Snoke", "Death Star"], ruleText: "FINAL BOSS: Alle gegnerischen Effekte (Imperium-Unterdrückung 50%, Sith-Milling x2) sind massiv verstärkt!" }
];

let draftOptions = [];

export function initAdventureMode() {
    const playBtn = document.getElementById('adventure-play-btn');
    const tutorialBtn = document.getElementById('adventure-tutorial-btn');
    const tutorialModal = document.getElementById('adventure-tutorial-modal');
    const closeTutorial = document.getElementById('adventure-tutorial-close');
    
    const skipDraftBtn = document.getElementById('adventure-draft-skip-btn');
    
    if(playBtn) {
        playBtn.addEventListener('click', () => {
            const user = getCurrentUser();
            if(!user) return;
            const levelIdx = (user.adventure_level || 1) - 1;
            const safeIdx = Math.min(levelIdx, ADVENTURE_CAMPAIGN.length - 1);
            const oppData = ADVENTURE_CAMPAIGN[safeIdx];
            const oppDeck = oppData.deck.map(name => ({ charName: name, rarity: rollRarityForLevel(levelIdx) }));
            const pDeck = migrateDeck(user.adventure_deck || BASE_ADVENTURE_DECK);
            
            startAdventureMatch(safeIdx, oppData, oppDeck, pDeck);
        });
    }
    
    const abortBtn = document.getElementById('adventure-abort-btn');
    if(abortBtn) {
        abortBtn.addEventListener('click', () => {
            const user = getCurrentUser();
            if(!user) return;
            if (user.adventure_level > 1) {
                if (confirm("Möchtest du deinen aktuellen Lauf wirklich abbrechen? Dein aktuelles Deck geht verloren und du startest wieder bei Level 1.")) {
                    handleAdventureLoss(true);
                }
            } else {
                alert("Du bist bereits auf Level 1! Wenn du das Start-Deck ändern möchtest, musst du in einem Match antreten.");
            }
        });
    }
    
    if(tutorialBtn) tutorialBtn.addEventListener('click', () => tutorialModal.classList.remove('hidden'));
    if(closeTutorial) closeTutorial.addEventListener('click', () => tutorialModal.classList.add('hidden'));
    
    if(skipDraftBtn) {
        skipDraftBtn.addEventListener('click', () => {
            document.getElementById('adventure-draft-screen').classList.add('hidden');
            document.getElementById('adventure-main-screen').classList.remove('hidden');
            renderAdventureMap();
            renderAdventureDeck();
        });
    }

    // Refresh UI when entering tab
    document.getElementById('subnav-cardgame-adventure').addEventListener('click', () => {
        verifyAdventureInit();
        renderAdventureMap();
        renderAdventureDeck();
    });
}

// Ensure user has base fields
async function verifyAdventureInit() {
    const user = getCurrentUser();
    if(!user) return;
    
    let needsUpdate = false;
    let updates = {};
    
    if(!user.adventure_level) {
        user.adventure_level = 1;
        updates.adventure_level = 1;
        needsUpdate = true;
    }
    if(!user.adventure_deck || user.adventure_deck.length !== 10) {
        user.adventure_deck = migrateDeck(BASE_ADVENTURE_DECK);
        updates.adventure_deck = user.adventure_deck;
        needsUpdate = true;
    } else {
        const isLegacy = user.adventure_deck.some(c => typeof c === 'string');
        if (isLegacy) {
            user.adventure_deck = migrateDeck(user.adventure_deck);
            updates.adventure_deck = user.adventure_deck;
            needsUpdate = true;
        }
        
        let isInvalid = false;
        user.adventure_deck.forEach(c => {
            if(!activeCharacterDatabase.find(dbC => dbC.name === c.charName)) isInvalid = true;
        });
        if(isInvalid) {
            user.adventure_deck = migrateDeck(BASE_ADVENTURE_DECK);
            updates.adventure_deck = user.adventure_deck;
            needsUpdate = true;
        }
    }
    
    if(!user.adventure_highest_level) {
        user.adventure_highest_level = user.adventure_level || 1;
        updates.adventure_highest_level = user.adventure_highest_level;
        needsUpdate = true;
    }
    
    if(needsUpdate) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        await updateDoc(doc(db, "users", user.uid), updates);
        trackWrite(1);
    }
    
    document.getElementById('adventure-current-level').textContent = `${user.adventure_level} / 20`;
    document.getElementById('adventure-next-level-btn-text').textContent = user.adventure_level;
}

export function renderAdventureMap() {
    const user = getCurrentUser();
    if(!user) return;
    
    const currentLvl = user.adventure_level || 1;
    const highestLvl = user.adventure_highest_level || currentLvl;
    const container = document.getElementById('adventure-map-container');
    container.innerHTML = '';
    
    ADVENTURE_CAMPAIGN.forEach((level, index) => {
        const lvlNum = index + 1;
        const isPast = lvlNum < currentLvl;
        const isCurrent = lvlNum === currentLvl;
        let isLocked = lvlNum > currentLvl;
        const isHighest = lvlNum === highestLvl;
        
        let color = isLocked ? '#333' : (isPast ? '#2ed573' : '#3498db');
        let icon = isLocked ? '<i class="fas fa-lock"></i>' : (isPast ? '<i class="fas fa-check"></i>' : '<i class="fas fa-crosshairs"></i>');
        let glow = '';
        
        if (isHighest) {
            color = '#ffd700';
            icon = isCurrent ? '<i class="fas fa-crosshairs"></i>' : '<i class="fas fa-star"></i>';
            glow = `box-shadow: 0 0 15px ${color};`;
        }
        
        const opacity = (isLocked && !isHighest) ? '0.5' : '1';
        
        const node = document.createElement('div');
        node.style.display = 'flex';
        node.style.flexDirection = 'column';
        node.style.alignItems = 'center';
        node.style.opacity = opacity;
        node.title = `${level.name}\n${level.ruleText}`;
        
        const isBoss = level.ruleText !== "Keine Sonderregeln.";
        const bossTag = isBoss ? `<div class="has-tooltip" data-tooltip="${level.ruleText.replace(/"/g, '&quot;')}" onclick="alert('${level.ruleText.replace(/'/g, "\\'")}')" style="margin-top: 4px; background: #ff4757; color: white; font-size: 0.55rem; padding: 2px 5px; border-radius: 3px; font-weight: bold; cursor: help; box-shadow: 0 0 5px rgba(255, 71, 87, 0.5);">BOSS</div>` : '';
        
        node.innerHTML = `
            <div style="width: 50px; height: 50px; border-radius: 50%; background: ${color}; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; border: 2px solid #111; color: #111; font-weight: bold; margin-bottom: 5px; ${glow}">
                ${isCurrent ? icon : (isHighest && !isPast ? icon : lvlNum)}
            </div>
            <div style="font-size: 0.7rem; color: ${color}; text-align: center; max-width: 60px; word-wrap: break-word;">${level.name}</div>
            ${bossTag}
        `;
        container.appendChild(node);
        
        if (lvlNum < ADVENTURE_LEVELS) {
            const line = document.createElement('div');
            line.style.width = '30px';
            line.style.height = '4px';
            line.style.background = isPast ? '#2ed573' : '#333';
            container.appendChild(line);
        }
    });
}

export function renderAdventureDeck() {
    const user = getCurrentUser();
    if(!user) return;
    
    const deckContainer = document.getElementById('adventure-current-deck');
    deckContainer.innerHTML = '';
    
    const deck = migrateDeck(user.adventure_deck || BASE_ADVENTURE_DECK);
    
    deck.forEach(cardObj => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardObj.charName);
        if(!charObj) return;
        
        const cardEl = document.createElement('div');
        cardEl.style.position = 'relative';
        cardEl.innerHTML = `
            <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 2px solid ${getRarityColor(cardObj.rarity)};">
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.65rem; text-align: center; padding: 2px 0;">${charObj.name}</div>
        `;
        deckContainer.appendChild(cardEl);
    });
}

// Called from cardgame.js when player wins a level
export function handleAdventureWin(levelIndex) {
    const user = getCurrentUser();
    if(!user) return;
    
    const lvlNum = levelIndex + 1;
    let creditsWon = 5;
    
    // Milestones
    if (lvlNum === 10 && !user.adventure_completed_10) {
        creditsWon = 50;
        user.adventure_completed_10 = true;
    } else if (lvlNum === 20 && !user.adventure_completed_20) {
        creditsWon = 100;
        user.adventure_completed_20 = true;
    }
    
    user.credits = (user.credits || 0) + creditsWon;
    const cb = document.getElementById('topbar-credits');
    if(cb) cb.innerHTML = `<span style="color:#ffd700;">💰</span> ${user.credits}`;
    
    // Level up
    if(lvlNum === user.adventure_level) {
        user.adventure_level += 1;
        if (user.adventure_level > (user.adventure_highest_level || 1)) {
            user.adventure_highest_level = user.adventure_level;
        }
    }
    
    // Reset to 1 if beaten the game! (or stay at 20? Let's stay at 21 to signify completion)
    // Actually, user requested they can try until they beat it. If they beat 20, they won the campaign.
    if (user.adventure_level > 20) {
        // Reset so they can play again if they want, or maybe just cap it?
        // Let's reset the run but keep the milestone flags so they can do it again for fun (5 credits).
        user.adventure_level = 1;
        user.adventure_deck = migrateDeck(BASE_ADVENTURE_DECK);
        alert("HERZLICHEN GLÜCKWUNSCH! Du hast die Abenteuer-Kampagne durchgespielt! Dein Run wird nun zurückgesetzt, du kannst aber jederzeit neu starten.");
    }
    
    // Save to DB
    const updates = {
        credits: user.credits,
        adventure_level: user.adventure_level,
        adventure_highest_level: user.adventure_highest_level || user.adventure_level,
        adventure_deck: user.adventure_deck,
        adventure_completed_10: user.adventure_completed_10 || false,
        adventure_completed_20: user.adventure_completed_20 || false
    };
    
    updateDoc(doc(db, "users", user.uid), updates);
    trackWrite(1);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    // Show Draft Screen (only if not beaten game just now)
    if (lvlNum <= 20) {
        showDraftScreen(levelIndex, creditsWon);
    } else {
        document.getElementById('adventure-draft-screen').classList.add('hidden');
        document.getElementById('adventure-main-screen').classList.remove('hidden');
        verifyAdventureInit();
        renderAdventureMap();
        renderAdventureDeck();
    }
}

// Called from cardgame.js when player loses, or when user aborts run
export function handleAdventureLoss(isAbort = false) {
    const user = getCurrentUser();
    if(!user) return;
    
    if (isAbort) {
        alert("Lauf abgebrochen. Du startest wieder bei Level 1 mit dem Standard-Deck.");
    } else {
        alert("NIEDERLAGE! Dein Abenteuer-Lauf ist beendet. Du startest wieder bei Level 1 mit dem Standard-Deck.");
    }
    
    user.adventure_level = 1;
    user.adventure_deck = migrateDeck(BASE_ADVENTURE_DECK);
    
    const updates = {
        adventure_level: 1,
        adventure_deck: user.adventure_deck
    };
    
    updateDoc(doc(db, "users", user.uid), updates);
    trackWrite(1);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    verifyAdventureInit();
    renderAdventureMap();
    renderAdventureDeck();
}

async function showDraftScreen(levelIndex, creditsWon) {
    document.getElementById('adventure-main-screen').classList.add('hidden');
    document.getElementById('adventure-draft-screen').classList.remove('hidden');
    document.getElementById('adventure-draft-step1').classList.remove('hidden');
    document.getElementById('adventure-draft-step2').classList.add('hidden');
    
    document.getElementById('adventure-draft-credit-reward').textContent = `${creditsWon} Credits`;
    
    await loadGlobalScores(); // Ensure scores are loaded for display
    
    draftOptions = [];
    
    // Pick 3 random unique cards from ENTIRE database
    const dbCopy = [...activeCharacterDatabase];
    while(draftOptions.length < 3 && dbCopy.length > 0) {
        const randIdx = Math.floor(Math.random() * dbCopy.length);
        const card = dbCopy.splice(randIdx, 1)[0];
        // Ensure no duplicates
        if(!draftOptions.find(o => o.charName === card.name)) {
            draftOptions.push({ charName: card.name, rarity: rollRarityForLevel(levelIndex) });
        }
    }
    
    const optionsContainer = document.getElementById('adventure-draft-options');
    optionsContainer.innerHTML = '';
    
    draftOptions.forEach(draftObj => {
        const charObj = activeCharacterDatabase.find(c => c.name === draftObj.charName);
        if(!charObj) return;
        
        const cardScore = getCardScore(draftObj.charName);
        
        const cardEl = document.createElement('div');
        cardEl.style.width = '120px';
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'transform 0.2s';
        cardEl.className = 'draft-card-option';
        
        cardEl.innerHTML = `
            <div style="position:relative;">
                <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 6px; border: 3px solid ${getRarityColor(draftObj.rarity)};">
                <div style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.8); border:1px solid #ffd700; color:#ffd700; border-radius:4px; padding:2px 5px; font-weight:bold; font-size:0.8rem;">
                    ★ ${cardScore.toFixed(1)}
                </div>
            </div>
            <div style="color: #fff; font-size: 0.8rem; text-align: center; margin-top: 5px;">${charObj.name}</div>
        `;
        
        cardEl.addEventListener('mouseenter', () => cardEl.style.transform = 'scale(1.05)');
        cardEl.addEventListener('mouseleave', () => cardEl.style.transform = 'scale(1)');
        
        cardEl.addEventListener('click', () => {
            selectDraftCard(draftObj, charObj.img, cardScore);
        });
        
        optionsContainer.appendChild(cardEl);
    });
}

function selectDraftCard(newDraftObj, newCardImage, newCardScore) {
    document.getElementById('adventure-draft-step1').classList.add('hidden');
    document.getElementById('adventure-draft-step2').classList.remove('hidden');
    
    document.getElementById('adventure-draft-new-card-preview').innerHTML = `
        <div style="position:relative;">
            <img src="${newCardImage}" style="width: 80px; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 2px solid ${getRarityColor(newDraftObj.rarity)};">
            <div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.8); border:1px solid #2ed573; color:#2ed573; border-radius:4px; padding:1px 3px; font-weight:bold; font-size:0.7rem;">
                ★ ${newCardScore.toFixed(1)}
            </div>
        </div>
    `;
    
    const user = getCurrentUser();
    const removeContainer = document.getElementById('adventure-draft-remove-options');
    removeContainer.innerHTML = '';
    
    const pDeck = migrateDeck(user.adventure_deck);
    
    pDeck.forEach((deckObj, index) => {
        const charObj = activeCharacterDatabase.find(c => c.name === deckObj.charName);
        if(!charObj) return;
        
        const existingCardScore = getCardScore(deckObj.charName);
        
        const cardEl = document.createElement('div');
        cardEl.style.width = '80px';
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'transform 0.2s';
        
        // Mark worse cards with red, better with green implicitly? Actually just show the number.
        const diff = existingCardScore - newCardScore;
        const diffColor = diff < 0 ? '#ff4757' : (diff > 0 ? '#2ed573' : '#aaa');
        
        cardEl.innerHTML = `
            <div style="position:relative;">
                <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 2px solid ${getRarityColor(deckObj.rarity)};">
                <div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.8); border:1px solid ${diffColor}; color:${diffColor}; border-radius:4px; padding:1px 3px; font-weight:bold; font-size:0.7rem;">
                    ★ ${existingCardScore.toFixed(1)}
                </div>
            </div>
            <div style="color: #aaa; font-size: 0.65rem; text-align: center; margin-top: 3px; word-wrap: break-word;">${charObj.name}</div>
            <div style="color: #ff4757; font-size: 0.65rem; text-align: center; padding: 2px 0; background: rgba(0,0,0,0.8);">Entfernen</div>
        `;
        
        cardEl.addEventListener('mouseenter', () => cardEl.style.opacity = '0.7');
        cardEl.addEventListener('mouseleave', () => cardEl.style.opacity = '1');
        
        cardEl.addEventListener('click', () => {
            pDeck[index] = newDraftObj;
            user.adventure_deck = pDeck;
            
            updateDoc(doc(db, "users", user.uid), {
                adventure_deck: user.adventure_deck
            });trackWrite(1);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            
            // Go back to map
            document.getElementById('adventure-draft-screen').classList.add('hidden');
            document.getElementById('adventure-main-screen').classList.remove('hidden');
            verifyAdventureInit();
            renderAdventureMap();
            renderAdventureDeck();
        });
        
        removeContainer.appendChild(cardEl);
    });
}







