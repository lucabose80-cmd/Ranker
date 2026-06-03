import { getCurrentUser, CURRENT_USER_KEY } from './auth.js';
import { getResets } from './resets.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';
import { trackWrite, trackRead } from './tracker.js';
import { updateWeeklyStat } from './challenges.js';

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
    { charName: 'Luke Skywalker', rarity: 'rare' },
    { charName: 'Captain Rex', rarity: 'rare' },
    { charName: 'B2 Super Battle Droide', rarity: 'common' },
    { charName: 'Boba Fett', rarity: 'rare' },
    { charName: 'Finn', rarity: 'common' },
    { charName: 'Sith Trooper', rarity: 'common' },
    { charName: 'Grand Moff Tarkin', rarity: 'common' },
    { charName: 'Qui-Gon Jinn', rarity: 'rare' },
    { charName: 'IG-88', rarity: 'common' },
    { charName: 'Asajj Ventress', rarity: 'rare' }
];

// Adventure Campaign Configuration
export const ADVENTURE_CAMPAIGN = [
    // ============================================================
    // PHASE 1: Die Gesetzlosen (Level 1-5) - LEICHT
    // Gemischte Decks, kaum Synergie. Boss: Mando Silence
    // ============================================================

    // Level 1: Gemischt, kaum Synergie - idealer Einstieg
    { name: "Plunderer", avatar: "", ruleId: null,
      deck: ["Trace Martez", "Rafa Martez", "Gamorrean Guard", "B1 Battle Droide", "Jawa", "Kragan Gorr", "DJ", "Gorian Shard", "Vane", "Nien Nunb"],
      ruleText: "Keine Sonderregeln." },

    // Level 2: Fahrzeuge + Kopfgeldjager, erste leichte Synergie
    { name: "Piraten-Flotte", avatar: "", ruleId: null,
      deck: ["Hondo Ohnaka", "Boba Fett", "Bossk", "Fennec Shand", "Vane", "Gorian Shard", "Kragan Gorr", "Aurra Sing", "Zam Wesell", "Cad Bane"],
      ruleText: "Keine Sonderregeln." },

    // Level 3: Schmuggler-Synergie - Karten koennen zurueckkehren
    { name: "Schmuggel-Ring", avatar: "", ruleId: null,
      deck: ["Hondo Ohnaka", "Han Solo", "Chewbacca", "Bossk", "Zam Wesell", "IG-88", "Fennec Shand", "Jabba the Hutt", "Dryden Vos", "Gorian Shard"],
      ruleText: "Keine Sonderregeln." },

    // Level 4: Gemischt imperial, erste Starfighter
    { name: "Imperiale Patrouille", avatar: "", ruleId: null,
      deck: ["TIE Advanced x1", "X-Wing Starfighter", "Nien Nunb", "Kragan Gorr", "HK-47", "Wedge Antilles", "Admiral Piett", "Grand Moff Tarkin", "Lux Bonteri", "Qui-Gon Jinn"],
      ruleText: "Keine Sonderregeln." },

    // Level 5 (BOSS): Das ist der Weg
    { name: "Mandalorianische Soldner", avatar: "", ruleId: "adv_rule_5",
      deck: ["Din Djarin", "Bo-Katan Kryze", "The Armorer", "Bossk", "IG-88", "Fennec Shand", "Aurra Sing", "Jabba the Hutt", "Cad Bane", "Zam Wesell"],
      ruleText: "BOSS: Das ist der Weg. Alle deine eigenen Fraktionseffekte und Synergien sind für dieses komplette Match deaktiviert!" },

    // ============================================================
    // PHASE 2: Der Klonkrieg (Level 6-10) - MITTEL
    // Erste Fraktionssynergien. Boss: General Grievous
    // ============================================================

    // Level 6: Rebell-Synergie - Score x2 wenn hinten liegend
    { name: "Rebellen-Zelle", avatar: "", ruleId: null,
      deck: ["Jyn Erso", "Cassian Andor", "Saw Gerrera", "Mon Mothma", "Admiral Ackbar", "Wedge Antilles", "Hera Syndulla", "Sabine Wren", "Kanan Jarrus", "Ezra Bridger"],
      ruleText: "Keine Sonderregeln." },

    // Level 7: Separatisten - erste Droid-Synergie (jetzt mit Gegenkarten moeglich)
    { name: "Separatisten-Patrouille", avatar: "", ruleId: null,
      deck: ["B1 Battle Droide", "B2 Super Battle Droide", "Droideka", "Kommando Droide", "Wat Tambor", "Zwergspinnendroide", "Spybot", "Scorch", "AZI-3", "General Kalani"],
      ruleText: "Keine Sonderregeln." },

    // Level 8: Klon-Kette - Klon-Synergie mit Bonus auf tote Klone
    { name: "Die 501. Legion", avatar: "", ruleId: "adv_rule_7",
      deck: ["Captain Rex", "Fives", "Echo", "Commander Cody", "Waxer", "Boil", "Hunter", "Wrecker", "Wolffe", "Gregor"],
      ruleText: "Keine Sonderregeln." },

    // Level 9: Dark-Side-Mix, starke Einzelkarten
    { name: "Die Nachtschwestern", avatar: "", ruleId: "adv_rule_9",
      deck: ["Mother Talzin", "Asajj Ventress", "Merrin", "Morgan Elsbeth", "Der Sohn", "Barriss Offee", "Savage Opress", "Darth Maul", "Rancor", "Osha Aniseya"],
      ruleText: "Keine Sonderregeln." },

    // Level 10 (BOSS): General Grievous - Droiden immun gegen Ausgleich
    { name: "General Grievous", avatar: "", ruleId: "adv_rule_10",
      deck: ["General Grievous", "B1 Battle Droide", "Droideka", "B2 Super Battle Droide", "Kommando Droide", "Count Dooku", "Asajj Ventress", "Scorch", "Gardulla the Hutt", "Nute Gunray"],
      ruleText: "BOSS: Gegnerischer Grievous und alle Droiden sind immun gegen 'Graue Machtnutzer' (Ausgleich)!" },

    // ============================================================
    // PHASE 3: Die Rebellion (Level 11-15) - SCHWER
    // Starke Synergiekombos + Debuffs. Boss: Thrawn
    // ============================================================

    // Level 11: Starke Einzelkarten, kaum kontert ohne gutes Deck
    { name: "Graue Wanderer", avatar: "", ruleId: "adv_rule_16",
      deck: ["Baylan Skoll", "Darth Plagueis", "Darth Maul", "Asajj Ventress", "Count Dooku", "Wampa", "Rancor", "Cad Bane", "Bossk", "IG-88"],
      ruleText: "Keine Sonderregeln." },

    // Level 12: Droid x3 Boss-Synergieeffekt
    { name: "Droiden-Bataillon", avatar: "", ruleId: "adv_rule_6",
      deck: ["General Grievous", "B1 Battle Droide", "B2 Super Battle Droide", "Droideka", "Kommando Droide", "Rancor", "Commander Bly", "Wat Tambor", "Poggle the Lesser", "Nute Gunray"],
      ruleText: "Keine Sonderregeln." },

    // Level 13: Schatten-Kollektiv - debufft deine Klone und Droiden -10%
    { name: "Schatten-Kollektiv", avatar: "", ruleId: "adv_rule_13",
      deck: ["Darth Maul", "Savage Opress", "Pre Vizsla", "Bo-Katan Kryze", "Gar Saxon", "Dryden Vos", "Qi'ra", "Mae Aniseya", "Ziro the Hutt", "Cad Bane"],
      ruleText: "Keine Sonderregeln." },

    // Level 14: Inquisitoren - Sith Milling x2, starkes Imperium-Deck
    { name: "Inquisitoren", avatar: "", ruleId: "adv_rule_14",
      deck: ["Grand Inquisitor", "Second Sister", "Third Sister", "Darth Vader", "Grand Moff Tarkin", "Admiral Piett", "Moff Gideon", "Director Krennic", "Boba Fett", "Bossk"],
      ruleText: "Keine Sonderregeln." },

    // Level 15 (BOSS): Thrawn - -10% wenn Spieler in Fuehrung
    { name: "Grossadmiral Thrawn", avatar: "", ruleId: "adv_rule_15",
      deck: ["Grand Admiral Thrawn", "Imperial Star Destroyer", "Darth Vader", "Grand Moff Tarkin", "Jabba the Hutt", "Admiral Piett", "Moff Gideon", "Director Krennic", "Admiral Ackbar", "Saesee Tiin"],
      ruleText: "BOSS: Thrawns Taktik: Wenn der Gegner fuehrt, verlieren alle deine Karten -10% Stats." },

    // ============================================================
    // PHASE 4: Das Erwachen (Level 16-20) - EXTREM
    // Legendary-Decks, Boss-Effekte gestapelt. Finales Ziel
    // ============================================================

    // Level 16: Jedi-Gedankentrick zwingt schwachste Karte
    { name: "Erwachen der Macht", avatar: "", ruleId: "adv_rule_17",
      deck: ["Luke Skywalker", "Rey Skywalker", "Obi-Wan Kenobi", "Leia Organa", "Han Solo", "Chewbacca", "Lando Calrissian", "Poe Dameron", "Finn", "Maz Kanata"],
      ruleText: "Keine Sonderregeln." },

    // Level 17: Fahrzeuge +10% - jetzt mit Legendary-Chars
    { name: "Fahrzeug-Depot", avatar: "", ruleId: "adv_rule_8",
      deck: ["AT-AT Walker", "AT-ST", "TIE Interceptor", "Razor Crest", "Millennium Falcon", "Slave I", "Darth Vader", "Grand Moff Tarkin", "Admiral Piett", "Director Krennic"],
      ruleText: "BOSS: Gegnerische Fahrzeuge haben +10% Basis-Staerke." },

    // Level 18: Jedi-Rat + Klon-Combo - volle Synergie
    { name: "Jedi-Rat", avatar: "", ruleId: "adv_rule_19",
      deck: ["Yoda", "Mace Windu", "Plo Koon", "Captain Rex", "Commander Cody", "Fives", "Echo", "Jesse", "Wolffe", "Gregor"],
      ruleText: "Keine Sonderregeln." },

    // Level 19: Erste Ordnung - besiegte Karten kehren zurueck
    { name: "Die Erste Ordnung", avatar: "", ruleId: "adv_rule_18",
      deck: ["Kylo Ren", "Supreme Leader Snoke", "Captain Phasma", "General Hux", "Sith Trooper", "Executioner Trooper", "Allegiant General Pryde", "FN-2199", "Bo-Katan Kryze", "Vane"],
      ruleText: "BOSS: Besiegte Erste Ordnung-Karten kehren 1x mit 50% Staerke ins Deck des Gegners zurueck!" },

    // Level 20 (FINAL BOSS): Palpatine - alle Effekte massiv verstaerkt
    { name: "Imperator Palpatine", avatar: "", ruleId: "adv_rule_20",
      deck: ["Emperor Palpatine", "Darth Vader", "Darth Maul", "Count Dooku", "Grand Moff Tarkin", "Admiral Piett", "Imperial Royal Guard", "Moff Gideon", "Director Krennic", "Imperial Star Destroyer"],
      ruleText: "FINAL BOSS: Alle gegnerischen Effekte (Imperium-Unterdrueckung 50%, Sith-Milling x2) sind massiv verstaerkt!" }
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

export async function renderAdventureMap() {
    const user = getCurrentUser();
    if(!user) return;
    
    const currentLvl = user.adventure_level || 1;
    const highestLvl = user.adventure_highest_level || currentLvl;
    const container = document.getElementById('adventure-map-container');
    container.innerHTML = '';
    
    // Fetch other players progress
    let playersAtNodes = {};
    try {
        const { userResets } = await getResets(false);
        Object.values(userResets).forEach(u => {
            if (u.displayName !== user.displayName && u.adventure_highest_level) {
                const lvl = u.adventure_highest_level;
                if (!playersAtNodes[lvl]) playersAtNodes[lvl] = [];
                playersAtNodes[lvl].push({
                    name: u.displayName,
                    avatar: u.avatarStarWars || u.avatarWaifu || 'https://i.imgur.com/kS5x87t.png'
                });
            }
        });
    } catch(e) {
        console.warn("Could not fetch player positions", e);
    }
    
    ADVENTURE_CAMPAIGN.forEach((level, index) => {
        const lvlNum = index + 1;
        const isPast = lvlNum < currentLvl;
        const isCurrent = lvlNum === currentLvl;
        let isLocked = lvlNum > currentLvl;
        const isHighest = lvlNum === highestLvl;
        
        let color = isLocked ? '#333' : (isPast ? '#2ed573' : '#3498db');
        let icon = isLocked ? '<i class="fas fa-lock"></i>' : (isPast ? '<span style="font-size: 1.2rem;">⭐</span>' : '<span style="font-size: 1.2rem;">⚔️</span>');
        let glow = '';
        
        if (isHighest) {
            color = '#ffd700';
            icon = isCurrent ? '<span style="font-size: 1.2rem;">⚔️</span>' : '<span style="font-size: 1.2rem;">⭐</span>';
            glow = `box-shadow: 0 0 15px ${color};`;
        }
        
        const opacity = (isLocked && !isHighest) ? '0.5' : '1';
        
        const node = document.createElement('div');
        node.style.display = 'flex';
        node.style.flexDirection = 'column';
        node.style.alignItems = 'center';
        node.style.opacity = opacity;
        node.title = ''; // Disabled native tooltip to avoid overlap with custom hover
        
        const isBoss = level.ruleText !== "Keine Sonderregeln.";
        const tagColor = isBoss ? '#ff4757' : '#3498db';
        const tagText = isBoss ? 'BOSS' : 'DECK';
        const tagShadow = isBoss ? `box-shadow: 0 0 5px rgba(255, 71, 87, 0.5);` : '';
        
        const bossTagHtml = `<div class="adv-deck-tag" style="margin-top: 4px; background: ${tagColor}; color: white; font-size: 0.55rem; padding: 2px 5px; border-radius: 3px; font-weight: bold; cursor: help; ${tagShadow}">${tagText}</div>`;
        
        // Render Avatars HTML
        let avatarsHtml = '';
        if (playersAtNodes[lvlNum] && playersAtNodes[lvlNum].length > 0) {
            const pList = playersAtNodes[lvlNum];
            const toShow = pList.slice(0, 3);
            const extra = pList.length - 3;
            
            let avImgs = toShow.map(p => `<img src="${p.avatar}" data-pname="${p.name}" class="adv-avatar-img" style="width:20px; height:20px; border-radius:50%; border:1px solid #111; margin-left:-5px; object-fit:cover; cursor:help;">`).join('');
            if (extra > 0) {
                avImgs += `<div class="adv-avatar-img" data-pname="${extra} weitere Spieler" style="width:20px; height:20px; border-radius:50%; background:#333; color:#fff; font-size:0.55rem; display:flex; justify-content:center; align-items:center; border:1px solid #111; margin-left:-5px; cursor:help;">+${extra}</div>`;
            }
            
            avatarsHtml = `
                <div style="display:flex; justify-content:center; margin-top:5px; padding-left:5px;">
                    ${avImgs}
                </div>
            `;
        }
        
        node.innerHTML = `
            <div style="width: 50px; height: 50px; border-radius: 50%; background: ${color}; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; border: 2px solid #111; color: #111; font-weight: bold; margin-bottom: 5px; ${glow}">
                ${isCurrent ? icon : (isHighest && !isPast ? icon : lvlNum)}
            </div>
            <div style="font-size: 0.75rem; color: #e0e0e0; font-weight: bold; text-align: center; max-width: 60px; word-wrap: break-word; text-shadow: 1px 1px 2px #000;">${level.name}</div>
            ${bossTagHtml}
            ${avatarsHtml}
        `;
        
        const tagEl = node.querySelector('.adv-deck-tag');
        if (tagEl) {
            tagEl.addEventListener('mouseenter', (e) => {
                let hoverHtml = level.ruleText !== "Keine Sonderregeln." ? `<div style="color:#ff4757; font-weight:bold; margin-bottom:5px; width:100%;">${level.ruleText}</div>` : '';
                hoverHtml += `<div style="width:100%; color:#aaa; font-size:0.75rem; margin-bottom:5px;">Gegner-Deck:</div><div style="display:flex; flex-wrap:wrap; gap:4px;">`;
                level.deck.forEach(cName => {
                    const cDb = activeCharacterDatabase.find(x => x.name === cName);
                    if(cDb) {
                        hoverHtml += `<img src="${cDb.img}" style="width:38px; height:55px; object-fit:cover; border-radius:4px; border:1px solid #555;">`;
                    }
                });
                hoverHtml += `</div>`;
                
                let tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(!tooltipDiv) {
                    tooltipDiv = document.createElement('div');
                    tooltipDiv.id = 'adv-custom-tooltip';
                    tooltipDiv.style.cssText = 'position: fixed; z-index: 10000; background: rgba(15, 18, 25, 0.98); border: 2px solid #3498db; padding: 10px; border-radius: 8px; pointer-events: none; display: flex; flex-direction: column; width: 250px; box-shadow: 0 5px 15px rgba(0,0,0,0.8);';
                    document.body.appendChild(tooltipDiv);
                }
                
                if (isBoss) tooltipDiv.style.borderColor = '#ff4757';
                else tooltipDiv.style.borderColor = '#3498db';
                tooltipDiv.style.width = '250px';
                
                tooltipDiv.innerHTML = hoverHtml;
                tooltipDiv.style.display = 'flex';
                tooltipDiv.style.left = (e.clientX + 15) + 'px';
                tooltipDiv.style.top = (e.clientY + 15) + 'px';
            });
            tagEl.addEventListener('mousemove', (e) => {
                const tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(tooltipDiv) {
                    let newLeft = e.clientX + 15;
                    let newTop = e.clientY + 15;
                    if(newLeft + 260 > window.innerWidth) newLeft = e.clientX - 260; // Prevent overflow
                    tooltipDiv.style.left = newLeft + 'px';
                    tooltipDiv.style.top = newTop + 'px';
                }
            });
            tagEl.addEventListener('mouseleave', () => {
                const tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(tooltipDiv) tooltipDiv.style.display = 'none';
            });
        }

        const avatarEls = node.querySelectorAll('.adv-avatar-img');
        avatarEls.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                let pName = el.getAttribute('data-pname');
                let hoverHtml = `<div style="color:#fff; font-size:0.8rem; font-weight:bold; text-align:center;">${pName}</div>`;
                
                let tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(!tooltipDiv) {
                    tooltipDiv = document.createElement('div');
                    tooltipDiv.id = 'adv-custom-tooltip';
                    tooltipDiv.style.cssText = 'position: fixed; z-index: 10000; background: rgba(15, 18, 25, 0.98); border: 2px solid #3498db; padding: 10px; border-radius: 8px; pointer-events: none; display: flex; flex-direction: column; width: max-content; box-shadow: 0 5px 15px rgba(0,0,0,0.8);';
                    document.body.appendChild(tooltipDiv);
                }
                
                tooltipDiv.style.borderColor = '#2ed573';
                tooltipDiv.style.width = 'max-content';
                
                tooltipDiv.innerHTML = hoverHtml;
                tooltipDiv.style.display = 'flex';
                tooltipDiv.style.left = (e.clientX + 15) + 'px';
                tooltipDiv.style.top = (e.clientY + 15) + 'px';
            });
            el.addEventListener('mousemove', (e) => {
                const tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(tooltipDiv) {
                    let newLeft = e.clientX + 15;
                    let newTop = e.clientY + 15;
                    if(newLeft + 200 > window.innerWidth) newLeft = e.clientX - 200; 
                    tooltipDiv.style.left = newLeft + 'px';
                    tooltipDiv.style.top = newTop + 'px';
                }
            });
            el.addEventListener('mouseleave', () => {
                const tooltipDiv = document.getElementById('adv-custom-tooltip');
                if(tooltipDiv) tooltipDiv.style.display = 'none';
            });
        });
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
        updateWeeklyStat('adventureLevel', user.adventure_level);
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

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(10px); text-align:center;';
    const titleText = isAbort ? 'LAUF ABGEBROCHEN' : 'NIEDERLAGE';
    const descText = isAbort ? 'Du startest wieder bei Level 1 mit dem Standard-Deck.' : 'Dein Abenteuer-Lauf ist beendet. Du startest wieder bei Level 1.';
    
    overlay.innerHTML = `
        <h1 style="color:#ff4757; font-size:4rem; text-shadow:0 0 20px rgba(255,71,87,0.5); margin-bottom:20px; font-weight:900; letter-spacing:5px;">${titleText}</h1>
        <p style="color:#ccc; font-size:1.2rem; margin-bottom:40px;">${descText}</p>
        <button class="rank-btn auth-btn" style="padding:15px 40px; font-size:1.2rem; background:linear-gradient(135deg, #ff4757, #ff6b81); border-color:#ff4757;" onclick="this.parentElement.remove();">Zurück zum Abenteuer-Menü</button>
    `;
    document.body.appendChild(overlay);
}

    document.getElementById('adventure-main-screen').classList.add('hidden');
    document.getElementById('adventure-draft-screen').classList.remove('hidden');
    document.getElementById('adventure-draft-step0').classList.add('hidden');
    document.getElementById('adventure-draft-step1').classList.add('hidden');
    document.getElementById('adventure-draft-step2').classList.add('hidden');
    
    document.getElementById('adventure-draft-credit-reward').textContent = `${creditsWon} Credits`;
    
    await loadGlobalScores(); // Ensure scores are loaded for display
    
    const dbCopy = [...activeCharacterDatabase];
    const beatenLevel = ADVENTURE_CAMPAIGN[levelIndex];
    const isBoss = beatenLevel && beatenLevel.ruleText !== "Keine Sonderregeln.";
    
    // Setup Buff Selection if Boss
    if (isBoss) {
        document.getElementById('adventure-draft-step0').classList.remove('hidden');
        const buffOptionsContainer = document.getElementById('adventure-buff-options');
        buffOptionsContainer.innerHTML = '';
        
        const { ADVENTURE_BUFFS } = await import('./buffs.js');
        const user = getCurrentUser();
        const activeBuffs = user.adventure_buffs || [];
        
        // Filter out already owned buffs
        let availableBuffs = ADVENTURE_BUFFS.filter(b => !activeBuffs.includes(b.id));
        if (availableBuffs.length < 3) availableBuffs = [...ADVENTURE_BUFFS]; // fallback if they have almost all
        
        const choices = [];
        for (let i = 0; i < 3; i++) {
            if (availableBuffs.length === 0) break;
            const rIdx = Math.floor(Math.random() * availableBuffs.length);
            choices.push(availableBuffs[rIdx]);
            availableBuffs.splice(rIdx, 1);
        }
        
        choices.forEach(buff => {
            const bBtn = document.createElement('div');
            bBtn.style.cssText = 'background:#2c3e50; border:2px solid #b8860b; border-radius:8px; padding:15px; width:200px; cursor:pointer; text-align:center; transition:transform 0.2s;';
            bBtn.onmouseenter = () => bBtn.style.transform = 'scale(1.05)';
            bBtn.onmouseleave = () => bBtn.style.transform = 'scale(1)';
            bBtn.innerHTML = `
                <div style="font-size:2rem; margin-bottom:10px;">🌟</div>
                <div style="color:#ffd700; font-weight:bold; margin-bottom:5px;">${buff.name}</div>
                <div style="color:#aaa; font-size:0.8rem;">${buff.desc}</div>
            `;
            bBtn.onclick = async () => {
                const user = getCurrentUser();
                user.adventure_buffs = user.adventure_buffs || [];
                user.adventure_buffs.push(buff.id);
                
                const { db } = await import('./firebase-config.js');
                const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');
                await updateDoc(doc(db, 'users', user.uid), { adventure_buffs: user.adventure_buffs });
                localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
                
                // Hide step 0, show step 1 (draft)
                document.getElementById('adventure-draft-step0').classList.add('hidden');
                document.getElementById('adventure-draft-step1').classList.remove('hidden');
            };
            buffOptionsContainer.appendChild(bBtn);
        });
    } else {
        document.getElementById('adventure-draft-step1').classList.remove('hidden');
    }
    
    let draftOptions = [];
    
    // Pick random unique cards from ENTIRE database
    const dbCopy = [...activeCharacterDatabase];
    
    // Check if beaten level was a boss to offer 4 choices instead of 3
    const beatenLevel = ADVENTURE_CAMPAIGN[levelIndex];
    const isBoss = beatenLevel && beatenLevel.ruleText !== "Keine Sonderregeln.";
    const draftCount = isBoss ? 4 : 3;
    
    while(draftOptions.length < draftCount && dbCopy.length > 0) {
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








