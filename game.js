// game.js
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages } from './utils.js';
import { resetRatingUI } from './rating.js';
import { saveGameToHistory } from './history.js';
import { getCurrentUser, markCharacterAsDiscovered } from './auth.js'; // NEU importiert

export let activePool = []; 
export let currentIndex = 0;
export let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

export function initGame() {
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    // Alten Glow beim Neustart entfernen
    document.getElementById('current-image-container').classList.remove('gold-glow');
    resetRatingUI();
    
    document.querySelectorAll('.rank-btn').forEach(btn => btn.disabled = false);
    for (let i = 1; i <= 5; i++) {
        document.querySelector(`#slot-${i} .card-content`).innerHTML = '<span class="placeholder-icon">👤</span>';
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = '???';
        labelSpan.classList.remove('revealed-name');
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
        
        // NEU: Gold-Glow prüfen, wenn der Charakter brandneu für den User ist
        const user = getCurrentUser();
        const discoveredList = user && user.discovered ? user.discovered : [];
        
        if (user && user.role !== 'admin' && !discoveredList.includes(currentChar.name)) {
            imgContainer.classList.add('gold-glow');
            markCharacterAsDiscovered(currentChar.name); // Sofort als entdeckt markieren
        } else {
            imgContainer.classList.remove('gold-glow');
        }

    } else {
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

export function handleRankSelection(rank, buttonElement) {
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    showNextCharacter();
}

export function submitFinalRating(value) {
    saveGameToHistory(placedCharacters, value);
}