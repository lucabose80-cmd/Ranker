import { getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { currentMode } from './mode-state.js';

let isShopInitialized = false;

const RARITIES = {
    COMMON: { id: 'common', name: 'Gewöhnlich', color: '#888888', dropRate: 0.80, border: '5px solid #111' },
    RARE: { id: 'rare', name: 'Selten', color: '#ff9f43', dropRate: 0.15, border: '5px solid #ff9f43' },
    EPIC: { id: 'epic', name: 'Episch', color: '#9b59b6', dropRate: 0.04, border: '5px solid #9b59b6', holo: true },
    LEGENDARY: { id: 'legendary', name: 'Legendär', color: '#ffd700', dropRate: 0.01, border: '5px solid #ffd700', holo: true }
};

export const LEGENDARY_POOL = {
    'Anakin Skywalker': {
        specialImg: 'Special.Bilder/anakin.selten.jpg',
        sound: 'sounds/imperialmarch.mp3',
        soundLoops: 1
    },
    'Darth Vader': {
        specialImg: 'Special.Bilder/vader.special.jpg',
        sound: 'sounds/vaderbreathing.mp3',
        soundLoops: 3
    }
};
window.LEGENDARY_POOL = LEGENDARY_POOL;

const BOOSTERS = [
    {
        id: 'starwars_all',
        name: 'Galaktisches Standard-Pack',
        cost: 100,
        img: 'Boosterpack.Bilder/starwars.jpg',
        filter: (char) => true
    },
    {
        id: 'starwars_klon',
        name: 'Klonkrieger Elite-Pack',
        cost: 100,
        img: 'Boosterpack.Bilder/klone.jpg',
        filter: (char) => char.tags && char.tags.includes('klon') && (!char.tags || !char.tags.includes('vehicle')),
        isLimited: true
    },
    {
        id: 'starwars_jedi_sith',
        name: 'Machtanwender Pack',
        cost: 100,
        img: 'Boosterpack.Bilder/machtanwender.jpg',
        filter: (char) => {
            if (char.tags && char.tags.includes('vehicle')) return false;
            if (char.tags && (char.tags.includes('jedi') || char.tags.includes('sith'))) return true;
            if (char.name === 'General Grievous' || char.name === 'Asajj Ventress') return true;
            return false;
        },
        isLimited: true
    }
];

export function initShop() {
    const user = getCurrentUser();
    if (!user) return;

    const isAdmin = (user.username && (user.username.toLowerCase() === 'test1' || user.username.toLowerCase() === 'test2'));
    document.getElementById('shop-credits-display').textContent = isAdmin ? '∞' : (user.credits || 0);

    const container = document.getElementById('booster-packs-container');
    container.innerHTML = '';

    if (currentMode !== 'starwars') {
        container.innerHTML = '<div style="color:#94a3b8; text-align:center; width:100%; font-size:1.2rem;">Booster-Packs sind derzeit nur im Star Wars Modus verfügbar.</div>';
        return;
    }

    // Info-Banner: Legendäre Belohnung
    const infoBanner = document.createElement('div');
    infoBanner.style.cssText = 'width:100%; box-sizing:border-box; background:linear-gradient(135deg, rgba(255,215,0,0.08), rgba(184,134,11,0.15)); border:1px solid rgba(255,215,0,0.4); border-radius:10px; padding:14px 20px; margin-bottom:20px; display:flex; align-items:center; gap:15px;';
    infoBanner.innerHTML = `
        <span style="font-size:2rem; flex-shrink:0;">✨</span>
        <div>
            <div style="color:#ffd700; font-weight:bold; font-size:0.95rem; margin-bottom:3px;">Satz-Belohnung: Legendäre Karte!</div>
            <div style="color:#e2e8f0; font-size:0.82rem; line-height:1.5;">
                Ziehe alle Charaktere eines Packs mindestens einmal aus diesem Pack — und erhalte <strong style="color:#ffd700;">einmalig eine zufällige Legendäre Karte</strong> als Belohnung!<br>
                <span style="color:#94a3b8; font-size:0.78rem;">Der Fortschritt wird separat pro Pack-Typ gezählt.</span>
            </div>
        </div>
    `;
    container.appendChild(infoBanner);

    BOOSTERS.forEach(booster => {
        const pool = activeCharacterDatabase.filter(booster.filter);
        if (pool.length === 0) return;
        
        const legCount = booster.id === 'starwars_jedi_sith' ? pool.filter(c => LEGENDARY_POOL[c.name]).length : 0;
        
        // Calculate distinct owned characters pulled from THIS specific booster
        const inv = user[`inventory_${currentMode}`] || [];
        const ownedNames = new Set(inv.filter(c => c.boosterId === booster.id).map(c => c.charName));
        const ownedCount = ownedNames.size;
        const totalCount = pool.length;
        const packComplete = ownedCount === totalCount;
        const alreadyClaimed = !!user[`claimedLegendary_${booster.id}`];

        const legacyDate = new Date('2026-06-10T00:00:00Z');
        const isLegacy = Date.now() > legacyDate.getTime();
        
        let displayCost = booster.cost;
        let displayName = booster.name;
        let limitBadge = '';
        if (booster.isLimited) {
            if (isLegacy) {
                displayCost = 150;
                displayName += ' (Legacy)';
                limitBadge = `<div style="position:absolute; top:10px; right:-25px; background:#ff4757; color:#fff; font-size:0.7rem; font-weight:bold; padding:4px 30px; transform:rotate(45deg); box-shadow:0 2px 4px rgba(0,0,0,0.5);">LEGACY</div>`;
            } else {
                limitBadge = `<div style="position:absolute; top:10px; right:-35px; background:#ffd700; color:#000; font-size:0.7rem; font-weight:bold; padding:4px 35px; transform:rotate(45deg); box-shadow:0 2px 4px rgba(0,0,0,0.5);">LIMITIERT (10.06.)</div>`;
            }
        }

        const el = document.createElement('div');
        el.className = 'booster-pack-card';
        el.style.cssText = 'background: rgba(0,0,0,0.5); border: 1px solid #333; border-radius: 8px; padding: 15px; width: 280px; text-align: center; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;';
        
        el.innerHTML = `
            ${limitBadge}
            <h3 style="margin:0 0 10px 0; color:#ffd700; text-transform:uppercase;">${displayName}</h3>
            ${booster.img ? `<img src="${booster.img}" style="width:100%; height:280px; object-fit:cover; border-radius:6px; margin-bottom:15px; border:2px solid #555; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">` : `<div style="width:100%; height:180px; background:linear-gradient(135deg, #0f172a, #1e293b); border-radius:6px; margin-bottom:15px; border:2px solid #555; display:flex; justify-content:center; align-items:center; font-size:4rem; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">📦</div>`}
            <p style="font-size:0.85rem; color:#94a3b8; margin:0 0 8px 0;">Mögliche Charaktere: <span style="color:#fff">${totalCount}</span></p>
            <div style="margin-bottom:12px; padding:8px 12px; border-radius:6px; background:rgba(255,215,0,0.08); border:1px solid ${packComplete ? '#ffd700' : '#444'};">
                <span style="font-size:0.85rem; color:${packComplete ? '#ffd700' : '#94a3b8'}; font-weight:bold;">
                    ${packComplete ? '🏆' : '📚'} Sammlung: ${ownedCount} von ${totalCount} Charakteren
                </span>
            </div>
            
            <div style="width:100%; background:rgba(0,0,0,0.3); border-radius:4px; padding:10px; margin-bottom:15px; display:flex; flex-direction:column; gap:5px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                    <span style="color:${RARITIES.COMMON.color}">${RARITIES.COMMON.name}</span>
                    <span>${(RARITIES.COMMON.dropRate * 100).toFixed(0)}%</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                    <span style="color:${RARITIES.RARE.color}">${RARITIES.RARE.name}</span>
                    <span>${(RARITIES.RARE.dropRate * 100).toFixed(0)}%</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                    <span style="color:${RARITIES.EPIC.color}">${RARITIES.EPIC.name}</span>
                    <span>${(RARITIES.EPIC.dropRate * 100).toFixed(0)}%</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:bold;">
                    <span style="color:${RARITIES.LEGENDARY.color}">${RARITIES.LEGENDARY.name}</span>
                    <span style="color:#ffd700;">${(RARITIES.LEGENDARY.dropRate * 100).toFixed(0)}% (${legCount} Karten)</span>
                </div>
            </div>

            <button class="rank-btn buy-booster-btn" style="width:100%; padding:15px; margin:0; font-size:1.1rem; border-color:#2ed573; color:#2ed573;" data-id="${booster.id}" data-cost="${displayCost}">
                🛒 ${displayCost} Credits
            </button>
            <div style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8; text-align: center;">
                Geöffnet: <span id="opened-count-${booster.id}" style="color: #ffd700; font-weight: bold;">${user[`packsOpened_${booster.id}`] || 0}</span>
            </div>
            ${packComplete && !alreadyClaimed ? `
            <button class="rank-btn claim-legendary-btn" data-id="${booster.id}" style="width:100%; padding:12px; margin-top:10px; font-size:1rem; background:linear-gradient(135deg,#b8860b,#ffd700); border:none; color:#000; font-weight:bold; border-radius:6px; cursor:pointer; animation: goldPulse 2s infinite ease-in-out;">
                ✨ Legendäre Karte beanspruchen!
            </button>` : packComplete && alreadyClaimed ? `
            <div style="margin-top:10px; font-size:0.8rem; color:#ffd700; text-align:center; opacity:0.7;">✓ Belohnung bereits beansprucht</div>` : ''}
        `;

        el.querySelector('.buy-booster-btn').addEventListener('click', () => openBooster(booster, pool, displayCost));
        
        const claimBtn = el.querySelector('.claim-legendary-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => claimPackLegendary(booster, pool));
        }
        
        container.appendChild(el);
    });

    isShopInitialized = true;
}

async function claimPackLegendary(booster, pool) {
    const user = getCurrentUser();
    if (!user) return;
    
    const claimKey = `claimedLegendary_${booster.id}`;
    if (user[claimKey]) {
        alert('Du hast diese Belohnung bereits beansprucht!');
        return;
    }
    
    // Find legendaries in pool — use all pool chars, not just LEGENDARY_POOL, as fallback
    const legendaryChars = pool.filter(c => LEGENDARY_POOL[c.name]);
    const charPool = legendaryChars.length > 0 ? legendaryChars : pool;
    const chosenChar = charPool[Math.floor(Math.random() * charPool.length)];
    
    try {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');
        
        const field = `inventory_${currentMode}`;
        const currentInventory = user[field] || [];
        
        currentInventory.push({
            charName: chosenChar.name,
            rarity: 'legendary',
            timestamp: Date.now(),
            boosterId: booster.id
        });
        
        user[field] = currentInventory;
        user[claimKey] = true;
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        
        await updateDoc(doc(db, "users", user.uid), {
            [field]: currentInventory,
            [claimKey]: true
        });
        
        if (window.showUnlockNotification) {
            window.showUnlockNotification('legendary', `Legendäre Karte erhalten: ${chosenChar.name}!`);
        } else {
            alert(`🌟 Du hast eine legendäre Karte erhalten: ${chosenChar.name}!`);
        }
        
        // Re-render shop to update button state
        initShop();
        
    } catch(e) {
        console.error('Fehler beim Beanspruchen der Legendären Karte:', e);
        alert('Fehler beim Beanspruchen der Belohnung.');
    }
}

async function openBooster(booster, pool, currentCost) {
    const user = getCurrentUser();
    if (!user) return;

    const isAdmin = (user.username && (user.username.toLowerCase() === 'test1' || user.username.toLowerCase() === 'test2'));
    
    if (!isAdmin && (user.credits || 0) < currentCost) {
        if (window.showUnlockNotification) window.showUnlockNotification('error', "Nicht genügend Credits!");
        else alert("Nicht genügend Credits!");
        return;
    }

    // Godpack Check (0.1% chance)
    const isGodPack = Math.random() < 0.001;
    
    const legendariesInPool = booster.id === 'starwars_jedi_sith' ? pool.filter(c => LEGENDARY_POOL[c.name]) : [];
    
    // Generate 5 cards
    const pulledCards = [];
    
    const getRarity = (rates) => {
        const rand = Math.random();
        let acc = 0;
        for (const key of Object.keys(rates)) {
            acc += rates[key].dropRate;
            if (rand <= acc) return rates[key];
        }
        return rates.COMMON || RARITIES.COMMON;
    };

    for (let i = 0; i < 5; i++) {
        let rarity;
        if (isGodPack) {
            rarity = (Math.random() < 0.2 && legendariesInPool.length > 0) ? RARITIES.LEGENDARY : RARITIES.EPIC;
        } else if (i === 4) {
            let rates = {
                RARE: { ...RARITIES.RARE, dropRate: 0.88 },
                EPIC: { ...RARITIES.EPIC, dropRate: 0.10 }
            };
            if (legendariesInPool.length > 0) rates.LEGENDARY = { ...RARITIES.LEGENDARY, dropRate: 0.02 };
            else rates.EPIC.dropRate += 0.02;
            
            if (isAdmin && legendariesInPool.length > 0) {
                rates = { LEGENDARY: { ...RARITIES.LEGENDARY, dropRate: 1.0 } };
            }
            
            rarity = getRarity(rates);
        } else {
            let rates = { ...RARITIES };
            if (legendariesInPool.length === 0) {
                delete rates.LEGENDARY;
                rates.EPIC.dropRate += RARITIES.LEGENDARY.dropRate;
            }
            rarity = getRarity(rates);
        }

        let char;
        if (rarity.id === 'legendary' && legendariesInPool.length > 0) {
            char = legendariesInPool[Math.floor(Math.random() * legendariesInPool.length)];
        } else {
            char = pool[Math.floor(Math.random() * pool.length)];
        }
        pulledCards.push({ char, rarity });
    }

    // Save to Firebase
    try {
        const { doc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');
        
        const field = `inventory_${currentMode}`;
        const currentInventory = user[field] || [];
        
        pulledCards.forEach(cardInfo => {
            const isNew = !currentInventory.some(c => c.charName === cardInfo.char.name && c.rarity === cardInfo.rarity.id);
            cardInfo.isNew = isNew;

            currentInventory.push({
                charName: cardInfo.char.name,
                rarity: cardInfo.rarity.id,
                timestamp: Date.now(),
                boosterId: booster.id
            });
        });
        
        const packCountField = `packsOpened_${booster.id}`;
        user[packCountField] = (user[packCountField] || 0) + 1;
        
        const countSpan = document.getElementById(`opened-count-${booster.id}`);
        if (countSpan) countSpan.textContent = user[packCountField];
        
        user[field] = currentInventory;
        if (!isAdmin) {
            user.credits -= currentCost;
            document.getElementById('shop-credits-display').textContent = user.credits;
        }
        
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));

        const updates = { [field]: currentInventory, [packCountField]: user[packCountField] };
        if (!isAdmin) updates.credits = increment(-currentCost);
        
        await updateDoc(doc(db, "users", user.uid), updates);
        
    } catch(e) {
        console.error("Fehler beim Speichern der Karte:", e);
    }

    // Show animation modal with 5 cards
    showPullAnimation(pulledCards, isGodPack);
}

function playFlipSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, actx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
}

function playGachaSound(rarity) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioContext();
        const now = actx.currentTime;
        function playTone(freq, time, dur, type='square') {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.05);
            osc.connect(gain); gain.connect(actx.destination);
            osc.start(time); osc.stop(time + dur);
        }
        
        if (rarity === 'legendary') {
            playTone(440, now, 0.1); playTone(554.37, now + 0.1, 0.1); playTone(659.25, now + 0.2, 0.1); playTone(880, now + 0.3, 0.4);
        } else if (rarity === 'epic') {
            playTone(523.25, now, 0.1); playTone(659.25, now + 0.1, 0.1); playTone(783.99, now + 0.2, 0.3);
        } else if (rarity === 'rare') {
            playTone(440, now, 0.15, 'triangle'); playTone(523.25, now + 0.15, 0.2, 'triangle');
        }
    } catch(e) {}
}

function showPullAnimation(pulledCards, isGodPack) {
    let modal = document.getElementById('pull-animation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pull-animation-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);

        if (!document.getElementById('holo-style')) {
            const style = document.createElement('style');
            style.id = 'holo-style';
            style.textContent = `
                @keyframes holo-gleam {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                @keyframes godpack-glow {
                    0% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.5); }
                    50% { box-shadow: 0 0 100px rgba(255, 215, 0, 1); }
                    100% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.5); }
                }
                @keyframes legendary-flicker {
                    0% { box-shadow: 0 0 10px #ffd700, inset 0 0 10px #ffd700; border-color: #ffd700; }
                    50% { box-shadow: 0 0 30px #ffea00, inset 0 0 20px #ffea00; border-color: #fff; }
                    100% { box-shadow: 0 0 10px #ffd700, inset 0 0 10px #ffd700; border-color: #ffd700; }
                }
                .pull-card-container {
                    perspective: 1000px; 
                    width: 200px; 
                    height: 300px; 
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .pull-card-container:hover {
                    transform: scale(1.05);
                }
                .pull-card-inner {
                    position:relative; 
                    width:100%; 
                    height:100%; 
                    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    transform-style: preserve-3d;
                }
                .pull-card-front {
                    position:absolute; width:100%; height:100%; backface-visibility:hidden; 
                    background:linear-gradient(135deg, #1e293b, #0f172a); 
                    border: 2px solid #333; border-radius:15px; display:flex; justify-content:center; align-items:center; 
                    font-size:4rem; box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
                }
                .pull-card-back {
                    position:absolute; width:100%; height:100%; backface-visibility:hidden; 
                    transform: rotateY(180deg); border-radius:15px; overflow:hidden; 
                    background-size: cover; background-position: center; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                }
            `;
            document.head.appendChild(style);
        }
    }

    const godpackStyle = isGodPack ? "animation: godpack-glow 2s infinite;" : "";
    const godpackText = isGodPack ? "<h2 style='color:#ffd700; text-transform:uppercase; text-shadow: 0 0 20px #ffd700; margin-bottom: 20px;'>✨ GODPACK ✨</h2>" : "";

    modal.innerHTML = `
        <div class="modal-content" style="background:rgba(10, 14, 23, 0.95); border:1px solid #333; box-shadow:0 0 50px rgba(0,0,0,0.8); text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px; border-radius: 12px; backdrop-filter: blur(10px); min-width: 80vw; min-height: 60vh; ${godpackStyle}">
            ${godpackText}
            <div id="pull-cards-wrapper" style="display:flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
                ${pulledCards.map((info, index) => {
                    const isLeg = info.rarity.id === 'legendary';
                    const isEpic = info.rarity.id === 'epic';
                    const showHolo = isEpic; // No holo for legendary, they get border flicker
                    const customStyle = isLeg ? "animation: legendary-flicker 1.5s infinite;" : "";
                    
                    return `
                    <div class="pull-card-container" id="card-container-${index}" data-index="${index}">
                        <div class="pull-card-inner" id="card-inner-${index}">
                            <div class="pull-card-front">
                                📦
                            </div>
                            <div class="pull-card-back" style="background-image: url('${info.char.img}'); border: ${info.rarity.border}; ${customStyle}">
                                ${showHolo ? `<div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:10; mix-blend-mode: color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear;"></div>` : ''}
                                ${info.isNew ? `<div style="position:absolute; top:10px; right:10px; background:#ff4757; color:#fff; font-size:0.7rem; font-weight:bold; padding:3px 8px; border-radius:12px; transform:rotate(15deg); border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.5); z-index: 20;">NEU!</div>` : ''}
                                <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7), transparent); padding:20px 10px 10px 10px; color:#fff; text-align:center;">
                                    <h3 style="margin:0 0 5px 0; font-size:1.1rem; text-transform:uppercase; text-shadow: 2px 2px 4px #000;">${info.char.name}</h3>
                                    <div style="font-size:0.8rem; font-weight:bold; text-transform:uppercase; letter-spacing: 1px; color: ${info.rarity.color};">${info.rarity.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
            <p id="pull-click-prompt" style="color:#fff; font-size:1.2rem; margin-top:30px; font-weight:bold; letter-spacing:1px; animation: pulse 1.5s infinite;">Klicke auf die Karten, um sie aufzudecken!</p>
            <button id="close-pull-btn" class="rank-btn hidden" style="margin-top: 30px; width: 200px;">Abschließen</button>
        </div>
    `;

    modal.classList.remove('hidden');

    let flippedCount = 0;
    const totalCards = pulledCards.length;

    pulledCards.forEach((info, index) => {
        const container = document.getElementById(`card-container-${index}`);
        const inner = document.getElementById(`card-inner-${index}`);

        const flipCard = () => {
            inner.style.transform = 'rotateY(180deg)';
            flippedCount++;
            
            playFlipSound();
            
            const isLegSpecial = (info.rarity.id === 'legendary' && LEGENDARY_POOL[info.char.name]);

            if (isLegSpecial) {
                const specialData = LEGENDARY_POOL[info.char.name];
                const audio = new Audio(specialData.sound);
                audio.volume = 0.5;
                let playCount = 1;
                audio.addEventListener('ended', () => {
                    if (playCount < (specialData.soundLoops || 1)) {
                        playCount++;
                        audio.play();
                    }
                });
                audio.play().catch(e => console.log("Audio play error", e));
                
                const backEl = inner.querySelector('.pull-card-back');
                setTimeout(() => {
                    backEl.style.transition = 'filter 0.5s ease-in-out';
                    backEl.style.filter = 'brightness(2) contrast(1.5) drop-shadow(0 0 20px #ffd700)';
                    setTimeout(() => {
                        backEl.style.backgroundImage = `url('${specialData.specialImg}')`;
                        backEl.style.filter = 'brightness(1) contrast(1)';
                    }, 500);
                }, 800);
            } else {
                if (info.rarity.id !== 'common') {
                    setTimeout(() => { playGachaSound(info.rarity.id); }, 200);
                }
            }

            container.removeEventListener('click', flipCard);
            container.style.cursor = 'default';

            if (flippedCount === totalCards) {
                document.getElementById('pull-click-prompt').classList.add('hidden');
                setTimeout(() => {
                    document.getElementById('close-pull-btn').classList.remove('hidden');
                }, 800);
            }
        };

        container.addEventListener('click', flipCard);
    });

    document.getElementById('close-pull-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}
