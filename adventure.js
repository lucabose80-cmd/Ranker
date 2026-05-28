import { getCurrentUser, CURRENT_USER_KEY } from './auth.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';
import { trackWrite, trackRead } from './tracker.js';

import { startAdventureMatch, loadGlobalScores, getCardScore } from './cardgame.js';


const ADVENTURE_LEVELS = 20;

// Base deck all players start with in Adventure Mode
export const BASE_ADVENTURE_DECK = [
    "Luke Skywalker", 
    "C-3PO", 
    "R2-D2", 
    "B1 Battle Droide", 
    "Benthic Two Tubes", 
    "Nien Nunb", 
    "Obi-Wan Kenobi", 
    "Han Solo", 
    "Chewbacca", 
    "Leia Organa"
];

// Adventure Campaign Configuration
export const ADVENTURE_CAMPAIGN = [
    { name: "Die Unterwelt", avatar: "", deck: ["Trace Martez", "Rafa Martez", "Gamorrean Guard", "Bib Fortuna", "Rotta the Hutt", "Ziro the Hutt", "Gardulla the Hutt", "The Twins", "Jabba the Hutt", "Boba Fett"], ruleText: "Keine Sonderregeln." },
    { name: "Droiden-Armee", avatar: "", deck: ["B1 Battle Droide", "B2 Super Battle Droide", "Droideka", "Kommando Droide", "Suchdroide", "Zwergspinnendroide", "Spybot", "General Grievous", "AZI-3", "IG-88"], ruleText: "Gegnerische Droiden haben +10% Stärke." },
    { name: "Piraten & Schmuggler", avatar: "", deck: ["Hondo Ohnaka", "DJ", "Enfys Nest", "Dryden Vos", "Qi'ra", "Gorian Shard", "Kragan Gorr", "Vane", "Han Solo", "Lando Calrissian"], ruleText: "Keine Sonderregeln." },
    { name: "Erste Ordnung", avatar: "", deck: ["Kylo Ren", "Captain Phasma", "General Hux", "Supreme Leader Snoke", "FN-2199", "Sith Trooper", "Allegiant General Pryde", "Captain Peavey", "Executioner Trooper", "BB-9E"], ruleText: "Keine Sonderregeln." },
    { name: "Widerstand", avatar: "", deck: ["Rey Skywalker", "Poe Dameron", "Finn", "Rose Tico", "Vice Admiral Holdo", "Maz Kanata", "BB-8", "D-O", "Leia Organa", "Han Solo"], ruleText: "Gespieltes Imperium hat +10% Stärke gegen den Widerstand." },
    { name: "Bestien", avatar: "", deck: ["Rancor", "Wampa", "Sarlacc", "Nexu", "Acklay", "Reek", "Rathtar", "Zillo Beast", "Mudhorn", "Gamorrean Guard"], ruleText: "Gegner haben einen zufälligen Buff (10% bis 30%)." },
    { name: "Separatisten-Führung", avatar: "", deck: ["Count Dooku", "General Grievous", "Wat Tambor", "Poggle the Lesser", "Nute Gunray", "Admiral Trench", "San Hill", "Lux Bonteri", "General Kalani", "Asajj Ventress"], ruleText: "Gegnerische Sith haben +15% Stärke." },
    { name: "Jedi-Padawane", avatar: "", deck: ["Jecki Lon", "Ahsoka Tano", "Ezra Bridger", "Cal Kestis", "Barriss Offee", "Zett Jukassa", "Gungi", "Katooni", "Petro", "Nahdar Vebb"], ruleText: "Gespielte Kopfgeldjäger haben +15% Stärke." },
    { name: "Rebellen-Allianz", avatar: "", deck: ["Jyn Erso", "Cassian Andor", "Saw Gerrera", "Mon Mothma", "Admiral Ackbar", "Wedge Antilles", "Hera Syndulla", "Sabine Wren", "Nien Nunb", "Bail Organa"], ruleText: "Gegnerische Rebellen haben +10% Stärke." },
    { name: "Inquisitoren", avatar: "", deck: ["Grand Inquisitor", "Second Sister", "Third Sister", "Fifth Brother", "Seventh Sister", "Darth Vader", "Suchdroide", "Imperial Royal Guard", "Iden Versio", "Director Krennic"], ruleText: "Gegnerisches Imperium hat +15% Stärke." },
    { name: "Nachtschwestern", avatar: "", deck: ["Mother Talzin", "Asajj Ventress", "Merrin", "Morgan Elsbeth", "Savage Opress", "Darth Maul", "General Grievous", "Count Dooku", "Rancor", "Osha Aniseya"], ruleText: "Magie: Alle gegnerischen Karten sind 10% stärker." },
    { name: "Kopfgeldjäger", avatar: "", deck: ["Cad Bane", "Jango Fett", "Boba Fett", "Zam Wesell", "Embo", "Aurra Sing", "Bossk", "Fennec Shand", "IG-88", "IG-11"], ruleText: "Gegnerische Kopfgeldjäger sind 15% stärker." },
    { name: "Imperiale Flotte", avatar: "", deck: ["Imperial Star Destroyer", "Death Star", "TIE Fighter", "TIE Interceptor", "TIE Advanced x1", "Imperial Shuttle", "AT-AT Walker", "AT-ST", "Grand Admiral Thrawn", "Admiral Piett"], ruleText: "Gegnerische Fahrzeuge sind 20% stärker." },
    { name: "Graue Machtnutzer", avatar: "", deck: ["Baylan Skoll", "Shin Hati", "Morgan Elsbeth", "Starkiller", "Jod Na Nawood", "Ahsoka Tano", "Asajj Ventress", "Qimir (Der Fremde)", "Der Vater", "Die Tochter"], ruleText: "Deine Jedi sind 10% schwächer." },
    { name: "Fahrzeuge der Republik", avatar: "", deck: ["Republic Gunship (LAAT)", "AT-TE", "Venator-class Star Destroyer", "Jedi Starfighter (Delta-7)", "Jedi Interceptor (Eta-2)", "Naboo N-1 Starfighter", "Captain Rex", "Commander Cody", "Plo Koon", "Anakin Skywalker"], ruleText: "Gegnerische Fahrzeuge sind 25% stärker." },
    { name: "Mandalorianer", avatar: "", deck: ["Din Djarin", "Bo-Katan Kryze", "Pre Vizsla", "Paz Vizsla", "The Armorer", "Ursa Wren", "Koska Reeves", "Axe Woves", "Fenn Rau", "Gar Saxon"], ruleText: "Gegnerische Mandalorianer sind 20% stärker." },
    { name: "Klon-Truppler", avatar: "", deck: ["Captain Rex", "Commander Cody", "Fives", "Echo", "Jesse", "Wolffe", "Gregor", "Kix", "Hardcase", "Appo"], ruleText: "Gegnerische Klon-Truppler haben +25% Stärke." },
    { name: "Jedi-Meister", avatar: "", deck: ["Yoda", "Mace Windu", "Qui-Gon Jinn", "Kit Fisto", "Plo Koon", "Ki-Adi-Mundi", "Aayla Secura", "Shaak Ti", "Luminara Unduli", "Obi-Wan Kenobi"], ruleText: "Gegnerische Jedi haben +20% Stärke. Deine Sith +15%." },
    { name: "Das Imperium", avatar: "", deck: ["Emperor Palpatine", "Darth Vader", "Grand Moff Tarkin", "Grand Admiral Thrawn", "Director Krennic", "Moff Gideon", "Admiral Piett", "Imperial Royal Guard", "Death Star", "Iden Versio"], ruleText: "Gegnerisches Imperium hat +25% Stärke." },
    { name: "Die Sith", avatar: "", deck: ["Emperor Palpatine", "Darth Vader", "Darth Maul", "Count Dooku", "Darth Plagueis", "Darth Malgus", "Darth Jar Jar", "Kylo Ren", "Supreme Leader Snoke", "Savage Opress"], ruleText: "FINALER BOSS: Gegnerische Sith haben +30%, Imperium +20%." }
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
            const oppDeck = oppData.deck.map(name => ({ charName: name, rarity: 'common' }));
            const pDeck = (user.adventure_deck || BASE_ADVENTURE_DECK).map(name => ({ charName: name, rarity: 'common' }));
            
            startAdventureMatch(safeIdx, oppData, oppDeck, pDeck);
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
    document.getElementById('nav-adventure').addEventListener('click', () => {
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
        user.adventure_deck = [...BASE_ADVENTURE_DECK];
        updates.adventure_deck = user.adventure_deck;
        needsUpdate = true;
    } else {
        // Validate existing deck
        let isInvalid = false;
        user.adventure_deck.forEach(c => {
            if(!activeCharacterDatabase.find(dbC => dbC.name === c)) isInvalid = true;
        });
        if(isInvalid) {
            user.adventure_deck = [...BASE_ADVENTURE_DECK];
            updates.adventure_deck = user.adventure_deck;
            needsUpdate = true;
        }
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
    const container = document.getElementById('adventure-map-container');
    container.innerHTML = '';
    
    ADVENTURE_CAMPAIGN.forEach((level, index) => {
        const lvlNum = index + 1;
        const isPast = lvlNum < currentLvl;
        const isCurrent = lvlNum === currentLvl;
        const isLocked = lvlNum > currentLvl;
        
        let color = isLocked ? '#333' : (isPast ? '#2ed573' : '#ffd700');
        let icon = isLocked ? 'ðŸ”’' : (isPast ? 'âœ“' : 'âš”ï¸');
        
        const node = document.createElement('div');
        node.style.display = 'flex';
        node.style.flexDirection = 'column';
        node.style.alignItems = 'center';
        node.style.opacity = isLocked ? '0.5' : '1';
        node.title = `${level.name}\n${level.ruleText}`;
        
        node.innerHTML = `
            <div style="width: 50px; height: 50px; border-radius: 50%; background: ${color}; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; border: 2px solid #111; color: #111; font-weight: bold; margin-bottom: 5px;">
                ${isCurrent ? icon : lvlNum}
            </div>
            <div style="font-size: 0.7rem; color: ${color}; text-align: center; max-width: 60px; word-wrap: break-word;">${level.name}</div>
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
    
    const deck = user.adventure_deck || BASE_ADVENTURE_DECK;
    
    deck.forEach(cardName => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardName);
        if(!charObj) return;
        
        const cardEl = document.createElement('div');
        cardEl.style.position = 'relative';
        cardEl.innerHTML = `
            <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 1px solid #333;">
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
    if(cb) cb.innerHTML = `<span style="color:#ffd700;">ðŸ’³</span> ${user.credits}`;
    
    // Level up
    if(lvlNum === user.adventure_level) {
        user.adventure_level += 1;
    }
    
    // Reset to 1 if beaten the game! (or stay at 20? Let's stay at 21 to signify completion)
    // Actually, user requested they can try until they beat it. If they beat 20, they won the campaign.
    if (user.adventure_level > 20) {
        // Reset so they can play again if they want, or maybe just cap it?
        // Let's reset the run but keep the milestone flags so they can do it again for fun (5 credits).
        user.adventure_level = 1;
        user.adventure_deck = [...BASE_ADVENTURE_DECK];
        alert("HERZLICHEN GLÃœCKWUNSCH! Du hast die Abenteuer-Kampagne durchgespielt! Dein Run wird nun zurÃ¼ckgesetzt, du kannst aber jederzeit neu starten.");
    }
    
    // Save to DB
    const updates = {
        credits: user.credits,
        adventure_level: user.adventure_level,
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

// Called from cardgame.js when player loses
export function handleAdventureLoss() {
    const user = getCurrentUser();
    if(!user) return;
    
    alert("NIEDERLAGE! Dein Abenteuer-Lauf ist beendet. Du startest wieder bei Level 1 mit dem Standard-Deck.");
    
    user.adventure_level = 1;
    user.adventure_deck = [...BASE_ADVENTURE_DECK];
    
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
        if(!draftOptions.includes(card.name)) {
            draftOptions.push(card.name);
        }
    }
    
    const optionsContainer = document.getElementById('adventure-draft-options');
    optionsContainer.innerHTML = '';
    
    draftOptions.forEach(cardName => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardName);
        if(!charObj) return;
        
        const cardScore = getCardScore(cardName);
        
        const cardEl = document.createElement('div');
        cardEl.style.width = '120px';
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'transform 0.2s';
        cardEl.className = 'draft-card-option';
        
        cardEl.innerHTML = `
            <div style="position:relative;">
                <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 6px; border: 2px solid #333;">
                <div style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.8); border:1px solid #ffd700; color:#ffd700; border-radius:4px; padding:2px 5px; font-weight:bold; font-size:0.8rem;">
                    ★ ${cardScore.toFixed(1)}
                </div>
            </div>
            <div style="color: #fff; font-size: 0.8rem; text-align: center; margin-top: 5px;">${charObj.name}</div>
        `;
        
        cardEl.addEventListener('mouseenter', () => cardEl.style.transform = 'scale(1.05)');
        cardEl.addEventListener('mouseleave', () => cardEl.style.transform = 'scale(1)');
        
        cardEl.addEventListener('click', () => {
            selectDraftCard(cardName, charObj.img, cardScore);
        });
        
        optionsContainer.appendChild(cardEl);
    });
}

function selectDraftCard(newCardName, newCardImage, newCardScore) {
    document.getElementById('adventure-draft-step1').classList.add('hidden');
    document.getElementById('adventure-draft-step2').classList.remove('hidden');
    
    document.getElementById('adventure-draft-new-card-preview').innerHTML = `
        <div style="position:relative;">
            <img src="${newCardImage}" style="width: 80px; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px;">
            <div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.8); border:1px solid #2ed573; color:#2ed573; border-radius:4px; padding:1px 3px; font-weight:bold; font-size:0.7rem;">
                ★ ${newCardScore.toFixed(1)}
            </div>
        </div>
    `;
    
    const user = getCurrentUser();
    const removeContainer = document.getElementById('adventure-draft-remove-options');
    removeContainer.innerHTML = '';
    
    user.adventure_deck.forEach((cardName, index) => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardName);
        if(!charObj) return;
        
        const existingCardScore = getCardScore(cardName);
        
        const cardEl = document.createElement('div');
        cardEl.style.width = '80px';
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'transform 0.2s';
        
        // Mark worse cards with red, better with green implicitly? Actually just show the number.
        const diff = existingCardScore - newCardScore;
        const diffColor = diff < 0 ? '#ff4757' : (diff > 0 ? '#2ed573' : '#aaa');
        
        cardEl.innerHTML = `
            <div style="position:relative;">
                <img src="${charObj.img}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 2px solid #555;">
                <div style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.8); border:1px solid ${diffColor}; color:${diffColor}; border-radius:4px; padding:1px 3px; font-weight:bold; font-size:0.7rem;">
                    ★ ${existingCardScore.toFixed(1)}
                </div>
            </div>
            <div style="color: #aaa; font-size: 0.65rem; text-align: center; margin-top: 3px; word-wrap: break-word;">${charObj.name}</div>
            <div style="color: #ff4757; font-size: 0.65rem; text-align: center; padding: 2px 0; background: rgba(0,0,0,0.8);">Entfernen</div>
        `;
        
        cardEl.addEventListener('mouseenter', () => cardEl.style.opacity = '0.7');
        cardEl.addEventListener('mouseleave', () => cardEl.style.opacity = '1');
        
        cardEl.addEventListener('click', async () => {
            // Swap cards
            user.adventure_deck[index] = newCardName;
            
            // Save
            await updateDoc(doc(db, "users", user.uid), { adventure_deck: user.adventure_deck });
            trackWrite(1);
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

