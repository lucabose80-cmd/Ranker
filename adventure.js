import { getCurrentUser, CURRENT_USER_KEY } from './auth.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';
import { trackWrite, trackRead } from './tracker.js';
import { updateCreditUI } from './profile.js';
import { startAdventureMatch } from './cardgame.js'; // We will add this export later


const ADVENTURE_LEVELS = 20;

// Base deck all players start with in Adventure Mode
export const BASE_ADVENTURE_DECK = [
    "Luke Skywalker (Farmboy)", 
    "C-3PO", 
    "R2-D2", 
    "Jawa", 
    "Tusken Raider", 
    "Greedo", 
    "Obi-Wan Kenobi", 
    "Han Solo", 
    "Chewbacca", 
    "Prinzessin Leia"
];

// Adventure Campaign Configuration
export const ADVENTURE_CAMPAIGN = [
    { name: "Tusken Plünderer", avatar: "img/characters/Tusken Raider.webp", deck: ["Tusken Raider", "Tusken Raider", "Jawa", "Greedo", "Ponda Baba", "Dr. Evazan", "Wampa", "Jawa", "Tusken Raider", "R2-D2"], ruleText: "Keine Sonderregeln." },
    { name: "Cantina Schläger", avatar: "img/characters/Ponda Baba.webp", deck: ["Ponda Baba", "Dr. Evazan", "Greedo", "Han Solo", "Chewbacca", "Obi-Wan Kenobi", "Jawa", "Figrin D'an", "Wuher", "Garindan"], ruleText: "Keine Sonderregeln." },
    { name: "Sandtruppler", avatar: "img/characters/Sandtrooper.webp", deck: ["Sandtrooper", "Sandtrooper", "Sandtrooper", "Stormtrooper", "Stormtrooper", "Garindan", "Dewback", "Darth Vader", "Tarkin", "TIE Fighter Pilot"], ruleText: "Das Imperium hat +10% Stärke." },
    { name: "Jabba the Hutt", avatar: "img/characters/Jabba the Hutt.webp", deck: ["Jabba the Hutt", "Bib Fortuna", "Boba Fett", "Salacious Crumb", "Oola", "Max Rebo", "Gamorrean Guard", "Gamorrean Guard", "Rancor", "Boushh"], ruleText: "Kopfgeldjäger und Schurken haben +15% Stärke." },
    { name: "Boba Fett", avatar: "img/characters/Boba Fett.webp", deck: ["Boba Fett", "Bossk", "Dengar", "IG-88", "Zuckuss", "4-LOM", "Jango Fett", "Slave I", "Stormtrooper", "Darth Vader"], ruleText: "Boba Fett's Team hat perfekte Kopfgeldjäger-Synergie." },
    { name: "AT-AT Commander", avatar: "img/characters/General Veers.webp", deck: ["General Veers", "Snowtrooper", "Snowtrooper", "AT-AT", "AT-ST", "Darth Vader", "Stormtrooper", "Stormtrooper Commander", "Probe Droid", "Wampa"], ruleText: "Fahrzeuge haben +20% Stärke." },
    { name: "Imperiale Ehrengarde", avatar: "img/characters/Royal Guard.webp", deck: ["Royal Guard", "Royal Guard", "Emperor Palpatine", "Darth Vader", "Stormtrooper", "TIE Interceptor", "Moff Jerjerrod", "Admiral Piett", "Scout Trooper", "Biker Scout"], ruleText: "Imperium-Einheiten blocken 10% des Schadens." },
    { name: "Darth Vader", avatar: "img/characters/Darth Vader.webp", deck: ["Darth Vader", "Emperor Palpatine", "Stormtrooper", "Tarkin", "Boba Fett", "Imperial Star Destroyer", "TIE Advanced", "Royal Guard", "Royal Guard", "Inquisitor"], ruleText: "Sith haben +25% Stärke." },
    { name: "Imperator Palpatine", avatar: "img/characters/Emperor Palpatine.webp", deck: ["Emperor Palpatine", "Darth Vader", "Royal Guard", "Royal Guard", "Death Star", "Tarkin", "Stormtrooper", "Stormtrooper", "Imperial Officer", "TIE Fighter"], ruleText: "Imperator Palpatine hat +50% Basisstärke. Epische Karten sind für den Spieler gesperrt." },
    { name: "Rebellen-Verräter", avatar: "img/characters/Lando Calrissian.webp", deck: ["Lando Calrissian", "Han Solo", "Chewbacca", "Leia Organa (Bespin)", "Lobot", "Cloud Car", "Boba Fett", "Stormtrooper", "Darth Vader", "Ugnaught"], ruleText: "Rebellen gegen Rebellen: Alle Rebellen haben +15%." },
    // I will flesh out all 20 levels. Using simple copies for now to fill out 11-20.
    { name: "TIE-Pilot Squad", avatar: "img/characters/TIE Fighter Pilot.webp", deck: ["TIE Fighter Pilot", "TIE Fighter Pilot", "TIE Fighter", "TIE Interceptor", "TIE Bomber", "Darth Vader", "Tarkin", "Death Star", "Stormtrooper", "Imperial Probe Droid"], ruleText: "Fahrzeuge (Schiffe) haben +30%." },
    { name: "Ewok Stamm", avatar: "img/characters/Wicket.webp", deck: ["Wicket", "Chief Chirpa", "Logray", "Teebo", "Ewok Warrior", "Ewok Glider", "C-3PO", "R2-D2", "Chewbacca", "Han Solo (Endor)"], ruleText: "Ewoks haben +20%." },
    { name: "Scout Trooper", avatar: "img/characters/Scout Trooper.webp", deck: ["Scout Trooper", "Scout Trooper", "Biker Scout", "Speeder Bike", "Speeder Bike", "AT-ST", "Stormtrooper", "General Veers", "Darth Vader", "Imperial Officer"], ruleText: "Das Imperium hat +15%." },
    { name: "Admiral Piett", avatar: "img/characters/Admiral Piett.webp", deck: ["Admiral Piett", "Executor", "Imperial Star Destroyer", "Darth Vader", "Boba Fett", "Bossk", "Dengar", "IG-88", "Stormtrooper", "TIE Bomber"], ruleText: "Schiffe und Kopfgeldjäger haben +15%." },
    { name: "Moff Jerjerrod", avatar: "img/characters/Moff Jerjerrod.webp", deck: ["Moff Jerjerrod", "Death Star II", "Emperor Palpatine", "Darth Vader", "Royal Guard", "Royal Guard", "Stormtrooper", "Stormtrooper", "TIE Interceptor", "TIE Defender"], ruleText: "Keine Sonderregeln, aber extrem hohe Basisstärken." },
    { name: "Rancor", avatar: "img/characters/Rancor.webp", deck: ["Rancor", "Malakili", "Jabba the Hutt", "Oola", "Bib Fortuna", "Gamorrean Guard", "Gamorrean Guard", "Boba Fett", "Salacious Crumb", "Max Rebo"], ruleText: "Rancor hat +100% Stärke." },
    { name: "Boushh", avatar: "img/characters/Boushh.webp", deck: ["Boushh", "Chewbacca", "Han Solo (Carbonite)", "Lando Calrissian (Skiff Guard)", "Luke Skywalker (Jedi Knight)", "R2-D2", "C-3PO", "Jabba the Hutt", "Boba Fett", "Gamorrean Guard"], ruleText: "Alle Fraktionen gemischt. Zufällige Buffs jede Runde." },
    { name: "Luke Skywalker", avatar: "img/characters/Luke Skywalker (Jedi Knight).webp", deck: ["Luke Skywalker (Jedi Knight)", "Darth Vader", "Emperor Palpatine", "Obi-Wan Kenobi (Ghost)", "Yoda", "Leia Organa (Hoth)", "Han Solo", "Chewbacca", "Lando Calrissian", "Millennium Falcon"], ruleText: "Jedi haben +20%." },
    { name: "Großmoff Tarkin", avatar: "img/characters/Grand Moff Tarkin.webp", deck: ["Grand Moff Tarkin", "Death Star", "Darth Vader", "Princess Leia", "Stormtrooper", "Stormtrooper", "TIE Fighter", "TIE Fighter", "Imperial Officer", "Death Star Gunner"], ruleText: "Das Imperium hat +25%." },
    { name: "Der Imperator", avatar: "img/characters/Emperor Palpatine.webp", deck: ["Emperor Palpatine", "Darth Vader", "Luke Skywalker (Jedi Knight)", "Royal Guard", "Royal Guard", "Death Star II", "Admiral Piett", "Stormtrooper Commander", "TIE Interceptor", "Sith Eternal Fleet"], ruleText: "FINALER BOSS: Sith haben +30%, Imperium +20%. Legenden sind erlaubt." }
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
        let icon = isLocked ? '🔒' : (isPast ? '✓' : '⚔️');
        
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
            <img src="${charObj.image}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 1px solid #333;">
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
    updateCreditUI(user.credits);
    
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
        alert("HERZLICHEN GLÜCKWUNSCH! Du hast die Abenteuer-Kampagne durchgespielt! Dein Run wird nun zurückgesetzt, du kannst aber jederzeit neu starten.");
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

function showDraftScreen(levelIndex, creditsWon) {
    document.getElementById('adventure-main-screen').classList.add('hidden');
    document.getElementById('adventure-draft-screen').classList.remove('hidden');
    document.getElementById('adventure-draft-step1').classList.remove('hidden');
    document.getElementById('adventure-draft-step2').classList.add('hidden');
    
    document.getElementById('adventure-draft-credit-reward').textContent = `${creditsWon} Credits`;
    
    const opponentDeck = ADVENTURE_CAMPAIGN[levelIndex].deck;
    
    // Pick 3 random unique cards from opponent deck (or fallback to activeCharacterDatabase if deck has <3 unique)
    const uniqueOpponentCards = [...new Set(opponentDeck)];
    draftOptions = [];
    
    while(draftOptions.length < 3 && uniqueOpponentCards.length > 0) {
        const randIdx = Math.floor(Math.random() * uniqueOpponentCards.length);
        draftOptions.push(uniqueOpponentCards.splice(randIdx, 1)[0]);
    }
    
    // Fallback if needed
    while(draftOptions.length < 3) {
        const fallback = activeCharacterDatabase[Math.floor(Math.random() * activeCharacterDatabase.length)].name;
        if(!draftOptions.includes(fallback)) draftOptions.push(fallback);
    }
    
    const optionsContainer = document.getElementById('adventure-draft-options');
    optionsContainer.innerHTML = '';
    
    draftOptions.forEach(cardName => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardName);
        if(!charObj) return;
        
        const cardEl = document.createElement('div');
        cardEl.style.width = '120px';
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'transform 0.2s';
        cardEl.className = 'draft-card-option';
        
        cardEl.innerHTML = `
            <img src="${charObj.image}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 6px; border: 2px solid #333;">
            <div style="color: #fff; font-size: 0.8rem; text-align: center; margin-top: 5px;">${charObj.name}</div>
        `;
        
        cardEl.addEventListener('mouseenter', () => cardEl.style.transform = 'scale(1.05)');
        cardEl.addEventListener('mouseleave', () => cardEl.style.transform = 'scale(1)');
        
        cardEl.addEventListener('click', () => {
            selectDraftCard(cardName, charObj.image);
        });
        
        optionsContainer.appendChild(cardEl);
    });
}

function selectDraftCard(newCardName, newCardImage) {
    document.getElementById('adventure-draft-step1').classList.add('hidden');
    document.getElementById('adventure-draft-step2').classList.remove('hidden');
    
    document.getElementById('adventure-draft-new-card-preview').innerHTML = `
        <img src="${newCardImage}" style="width: 80px; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px;">
    `;
    
    const user = getCurrentUser();
    const removeContainer = document.getElementById('adventure-draft-remove-options');
    removeContainer.innerHTML = '';
    
    user.adventure_deck.forEach((cardName, index) => {
        const charObj = activeCharacterDatabase.find(c => c.name === cardName);
        if(!charObj) return;
        
        const cardEl = document.createElement('div');
        cardEl.style.cursor = 'pointer';
        cardEl.style.transition = 'opacity 0.2s';
        
        cardEl.innerHTML = `
            <img src="${charObj.image}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; border: 1px solid #333;">
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
