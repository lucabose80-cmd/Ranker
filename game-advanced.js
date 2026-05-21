// game-advanced.js
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages } from './utils.js';
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
    currentIndex = 0;
    jokerUsed = false;
    selectedJokerSlot = null;
    placedCharacters = {};
    for (let i = 1; i <= 10; i++) {
        placedCharacters[i] = null;
    }
    
    // Board-Klassen anpassen
    const board = document.getElementById('ranking-board');
    board.className = "horizontal-board advanced-board";
    
    // Slots generieren
    board.innerHTML = "";
    for (let i = 1; i <= 10; i++) {
        board.innerHTML += `
            <div class="rank-column" id="slot-${i}">
                <div class="card-container">
                    <span class="rank-number">${i}</span>
                    <div class="card-content">
                        <span class="placeholder-icon">👤</span>
                    </div>
                </div>
                <div class="card-label"><span>???</span></div>
            </div>
        `;
    }

    // Buttons generieren
    const btnContainer = document.getElementById('rank-buttons-container');
    btnContainer.innerHTML = "";
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = "rank-btn";
        btn.setAttribute('data-rank', i);
        btn.textContent = i;
        btn.addEventListener('click', () => handleAdvancedRankSelection(i, btn));
        btnContainer.appendChild(btn);
    }
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    document.getElementById('current-image-container').classList.remove('gold-glow');
    document.getElementById('joker-area').classList.add('hidden');
    
    // Sichtbarkeiten zurücksetzen
    document.getElementById('current-image-container').parentNode.classList.remove('hidden');
    document.querySelector('.mystery-name').classList.remove('hidden');
    document.getElementById('action-prompt').classList.remove('hidden');
    document.getElementById('rank-buttons-container').classList.remove('hidden');
    
    resetRatingUI();
    
    // Live Game Dokument aufräumen
    const user = getCurrentUser();
    if(user && user.role !== 'admin') {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    activePool = shuffleArray(activeCharacterDatabase).slice(0, 10);
    
    // Anti-Spachmann System: Ersten Charakter erzwingen, falls neugeladen wurde
    const punishName = localStorage.getItem('punish_char_' + currentMode + '_advanced');
    if (punishName) {
        const punishChar = activeCharacterDatabase.find(c => c.name === punishName);
        if (punishChar) {
            activePool = activePool.filter(c => c.name !== punishName);
            activePool.unshift(punishChar);
            activePool = activePool.slice(0, 10);
        }
    } else {
        localStorage.setItem('punish_char_' + currentMode + '_advanced', activePool[0].name);
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
    if(user && user.role !== 'admin') {
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
    if (currentIndex === 0) {
        // Spieler hat seinen ersten Charakter platziert -> Bestrafung aufheben
        localStorage.removeItem('punish_char_' + currentMode + '_advanced');
    }
    
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    
    // Live Broadcast
    const user = getCurrentUser();
    if(user && user.role !== 'admin') {
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
    saveGameToHistory(placedCharacters, value, activePool, 'advanced');
}
