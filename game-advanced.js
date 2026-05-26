// game-advanced.js
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages, drawFromBag } from './utils.js';
import { resetRatingUI } from './rating.js';
import { saveGameToHistory } from './history.js';
import { getCurrentUser } from './auth.js';
import { doc, setDoc, Timestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';

export let activePool = []; 
export let currentIndex = 0;
export let placedCharacters = {};
export let jokerUsed = false;
let selectedJokerSlot = null;

export function initAdvancedGame() {
    // We will initialize currentIndex, jokerUsed and placedCharacters inside the state check below
    
    // Board-Klassen anpassen
    const board = document.getElementById('ranking-board');
    board.className = "horizontal-board advanced-board";
    
    // Slots generieren
    board.innerHTML = Array.from({length: 10}, (_, i) => `
        <div class="rank-column" id="slot-${i+1}">
            <div class="card-container">
                <span class="rank-number">${i+1}</span>
                <div class="card-content"><span class="placeholder-icon">👤</span></div>
            </div>
            <div class="card-label"><span>???</span></div>
        </div>
    `).join('');

    // Buttons generieren
    const btnContainer = document.getElementById('rank-buttons-container');
    btnContainer.innerHTML = "";
    Array.from({length: 10}, (_, i) => {
        const btn = document.createElement('button');
        btn.className = "rank-btn";
        btn.dataset.rank = i + 1;
        btn.textContent = i + 1;
        btn.addEventListener('click', (e) => {
            if (!e.isTrusted) return alert("Bot Aktivität blockiert!");
            handleAdvancedRankSelection(i + 1, btn);
        });
        btnContainer.appendChild(btn);
    });
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    document.getElementById('current-image-container').classList.remove('gold-glow');
    document.getElementById('joker-area').classList.add('hidden');
    
    // Sichtbarkeiten zurücksetzen
    document.getElementById('current-image-container').parentNode.classList.remove('hidden');
    document.querySelector('.mystery-name').classList.remove('hidden');
    document.getElementById('action-prompt').classList.remove('hidden');
    document.getElementById('rank-buttons-container').classList.remove('hidden');

    const sameRestartBtn = document.getElementById('restart-same-btn');
    if (sameRestartBtn) {
        sameRestartBtn.classList.add('hidden');
    }
    
    resetRatingUI();
    
    // Live Game Dokument aufräumen beim Neustart
    const user = getCurrentUser();
    if (user) {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    const punishPoolStr = localStorage.getItem('punish_pool_' + currentMode + '_advanced');
    if (punishPoolStr) {
        try {
            const cachedPool = JSON.parse(punishPoolStr);
            if (cachedPool && cachedPool.length === 10) {
                activePool = cachedPool;
                
                // Lade den Fortschritt
                const punishStateStr = localStorage.getItem('punish_state_' + currentMode + '_advanced');
                if (punishStateStr) {
                    const state = JSON.parse(punishStateStr);
                    currentIndex = state.currentIndex || 0;
                    placedCharacters = state.placedCharacters || {};
                    jokerUsed = state.jokerUsed || false;
                } else {
                    currentIndex = 0;
                    jokerUsed = false;
                    placedCharacters = {};
                    for (let i = 1; i <= 10; i++) { placedCharacters[i] = null; }
                }
            } else {
                startFreshAdvancedGame();
            }
        } catch (e) {
            startFreshAdvancedGame();
        }
    } else {
        startFreshAdvancedGame();
    }
    
    function startFreshAdvancedGame() {
        activePool = drawFromBag(activeCharacterDatabase, 10, 'bag_advanced_' + currentMode);
        localStorage.setItem('punish_pool_' + currentMode + '_advanced', JSON.stringify(activePool));
        localStorage.removeItem('punish_state_' + currentMode + '_advanced');
        currentIndex = 0;
        jokerUsed = false;
        placedCharacters = {};
        for (let i = 1; i <= 10; i++) { placedCharacters[i] = null; }
    }
    
    // Restore DOM if we resumed a game
    for (let i = 1; i <= 10; i++) {
        if (placedCharacters[i]) {
            document.querySelector(`#slot-${i} .card-content`).innerHTML = `<img src="${placedCharacters[i].img}" alt="Ranked">`;
            const btn = document.querySelector(`.rank-btn[data-rank="${i}"]`);
            if (btn) btn.disabled = true;
        }
    }
    
    preloadImages(activePool);
    showNextAdvancedCharacter();
}

export function showNextAdvancedCharacter() {
    if (currentIndex < 10) {
        document.getElementById('progress-text').textContent = `CHARAKTER ${currentIndex + 1} / 10`;
        const currentChar = activePool[currentIndex];
        const imgContainer = document.getElementById('current-image-container');
        
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
        
        const user = getCurrentUser();
        const discoveredList = user && user.discovered ? user.discovered : [];
        
        if (user && user.role !== 'admin' && !discoveredList.includes(currentChar.name)) {
            imgContainer.classList.add('gold-glow');
            // Charakter wurde aufgedeckt
        } else {
            imgContainer.classList.remove('gold-glow');
        }

    } else {
        // Alle 10 platziert → Joker-Phase starten!
        startJokerPhase();
    }
}

function startJokerPhase() {
    // Live-Übertragung beenden/aktualisieren
    const user = getCurrentUser();
    if(user && user.role !== 'admin' && !user.isTestUser) {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }

    document.getElementById('progress-text').textContent = "🃏 JOKER PHASE";
    
    // Aktuelle Auswahl ausblenden
    document.getElementById('current-image-container').parentNode.classList.add('hidden');
    document.querySelector('.mystery-name').classList.add('hidden');
    document.getElementById('action-prompt').classList.add('hidden');
    document.getElementById('rank-buttons-container').classList.add('hidden');
    
    // Joker-Bereich einblenden
    const jokerArea = document.getElementById('joker-area');
    jokerArea.classList.remove('hidden');
    
    const skipBtn = document.getElementById('joker-skip-btn');
    skipBtn.textContent = "Ohne Joker fortfahren";
    skipBtn.onclick = finishAdvancedGame;

    // Slots anklickbar machen
    for (let i = 1; i <= 10; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        slotEl.classList.add('joker-selectable');
        slotEl.onclick = () => handleJokerSlotClick(i);
    }
}

function handleJokerSlotClick(slotNum) {
    if (jokerUsed) return;

    const clickedSlotEl = document.getElementById(`slot-${slotNum}`);

    if (selectedJokerSlot === null) {
        // Ersten Slot auswählen
        selectedJokerSlot = slotNum;
        clickedSlotEl.classList.add('joker-selected');
    } else if (selectedJokerSlot === slotNum) {
        // Klick auf den bereits ausgewählten Slot → Abwählen
        clickedSlotEl.classList.remove('joker-selected');
        selectedJokerSlot = null;
    } else {
        // Zweiten Slot auswählen → Tauschen!
        const firstSlotNum = selectedJokerSlot;
        
        // Optisch abwählen
        document.getElementById(`slot-${firstSlotNum}`).classList.remove('joker-selected');
        
        // Tauschen in den Daten
        const temp = placedCharacters[firstSlotNum];
        placedCharacters[firstSlotNum] = placedCharacters[slotNum];
        placedCharacters[slotNum] = temp;
        
        // UI auf den beiden getauschten Slots updaten
        updateSlotImage(firstSlotNum);
        updateSlotImage(slotNum);
        
        jokerUsed = true;
        selectedJokerSlot = null;
        
        // State aktualisieren, damit Tausch beim Neuladen erhalten bleibt
        localStorage.setItem('punish_state_' + currentMode + '_advanced', JSON.stringify({
            currentIndex: currentIndex,
            placedCharacters: placedCharacters,
            jokerUsed: jokerUsed
        }));
        
        // Joker-Phase beenden
        disableJokerSelection();
        
        const skipBtn = document.getElementById('joker-skip-btn');
        skipBtn.textContent = "Tausch fertig (Joker verbraucht)";
        skipBtn.style.borderColor = "#2ed573";
        skipBtn.style.color = "#2ed573";
        skipBtn.onclick = finishAdvancedGame;
    }
}

function updateSlotImage(slotNum) {
    const char = placedCharacters[slotNum];
    const content = document.querySelector(`#slot-${slotNum} .card-content`);
    if (char) {
        content.innerHTML = `<img src="${char.img}" alt="${char.name}">`;
    } else {
        content.innerHTML = '<span class="placeholder-icon">👤</span>';
    }
}

function disableJokerSelection() {
    for (let i = 1; i <= 10; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        slotEl.classList.remove('joker-selectable');
        slotEl.classList.remove('joker-selected');
        slotEl.onclick = null;
    }
}

function finishAdvancedGame() {
    disableJokerSelection();
    document.getElementById('joker-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.add('hidden');
    
    // Live-Status aufräumen
    const user = getCurrentUser();
    if (user) {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    
    revealAdvancedNames();
    document.getElementById('end-screen-area').classList.remove('hidden');
}

export function revealAdvancedNames() {
    for (let i = 1; i <= 10; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = placedCharacters[i].name;
        labelSpan.classList.add('revealed-name');
    }
}

export async function handleAdvancedRankSelection(rank, buttonElement) {
    // The user has placed a character, but we only remove the punishment when they finish rating or start a new game.
    // Actually, we remove it when the game is finished (all 10 placed) so they can't reload during the game.
    
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    
    // Save progress
    localStorage.setItem('punish_state_' + currentMode + '_advanced', JSON.stringify({
        currentIndex: currentIndex,
        placedCharacters: placedCharacters,
        jokerUsed: jokerUsed
    }));
    
    // Live Broadcast
    const user = getCurrentUser();
    if (user) {
        try {
            setDoc(doc(db, "live_games", user.username), {
                displayName: user.displayName || user.username,
                avatar: user.avatar || '',
                placedCharacters,
                pool: activePool,
                currentIndex: currentIndex,
                updatedAt: Timestamp.now(),
                gameType: 'advanced'
            }).catch(e => console.error("Live Broadcast Error:", e));
        } catch(e) {}
    }

    showNextAdvancedCharacter();
}

export function submitAdvancedFinalRating(value) {
    localStorage.removeItem('punish_pool_' + currentMode + '_advanced');
    localStorage.removeItem('punish_state_' + currentMode + '_advanced');
    saveGameToHistory(placedCharacters, value, activePool, 'advanced');
}
