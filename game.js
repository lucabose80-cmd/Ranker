// game.js
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages } from './utils.js';
import { resetRatingUI } from './rating.js';
import { saveGameToHistory } from './history.js';
import { getCurrentUser, markCharacterAsDiscovered } from './auth.js';
import { doc, setDoc, Timestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';

export let activePool = []; 
export let currentIndex = 0;
export let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

export function initGame() {
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    // Board zurücksetzen und Slots generieren
    const board = document.getElementById('ranking-board');
    board.className = "horizontal-board";
    board.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
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
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = "rank-btn";
        btn.setAttribute('data-rank', i);
        btn.textContent = i;
        btn.addEventListener('click', () => handleRankSelection(i, btn));
        btnContainer.appendChild(btn);
    }
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    document.getElementById('current-image-container').classList.remove('gold-glow');
    document.getElementById('joker-area').classList.add('hidden');
    
    // Elemente wieder einblenden, falls sie durch Joker-Phase ausgeblendet wurden
    document.getElementById('current-image-container').parentNode.classList.remove('hidden');
    document.querySelector('.mystery-name').classList.remove('hidden');
    document.getElementById('action-prompt').classList.remove('hidden');
    document.getElementById('rank-buttons-container').classList.remove('hidden');
    
    resetRatingUI();
    
    // Live Game Dokument aufräumen beim Neustart
    const user = getCurrentUser();
    if(user && user.role !== 'admin') {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    
    activePool = shuffleArray(activeCharacterDatabase).slice(0, 5);
    preloadImages(activePool);
    showNextCharacter();
}

export function showNextCharacter() {
    if (currentIndex < 5) {
        document.getElementById('progress-text').textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        const imgContainer = document.getElementById('current-image-container');
        
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
        
        const user = getCurrentUser();
        const discoveredList = user && user.discovered ? user.discovered : [];
        
        if (user && user.role !== 'admin' && !discoveredList.includes(currentChar.name)) {
            imgContainer.classList.add('gold-glow');
            markCharacterAsDiscovered(currentChar.name);
        } else {
            imgContainer.classList.remove('gold-glow');
        }

    } else {
        // Alle 5 platziert → Live-Dokument löschen
        const user = getCurrentUser();
        if(user && user.role !== 'admin') {
            deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
        }

        document.getElementById('active-game-area').classList.add('hidden');
        revealNames();
        document.getElementById('end-screen-area').classList.remove('hidden');
    }
}

export function revealNames() {
    for (let i = 1; i <= 5; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = placedCharacters[i].name;
        labelSpan.classList.add('revealed-name');
    }
}

export async function handleRankSelection(rank, buttonElement) {
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    
    // Live Broadcast mit Pool-Info für Zuschauer
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
                gameType: 'classic'
            }).catch(e => console.error("Live Broadcast Error:", e));
        } catch(e) {}
    }

    showNextCharacter();
}

export function submitFinalRating(value) {
    saveGameToHistory(placedCharacters, value, activePool, 'classic');
}