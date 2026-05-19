import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages } from './utils.js';
import { resetRatingUI } from './rating.js';

let activePool = [];
let currentIndex = 0;
let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

export function initGame() {
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    // UI zurücksetzen
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    resetRatingUI();
    
    // Obere Slots leeren
    document.querySelectorAll('.rank-btn').forEach(btn => btn.disabled = false);
    for (let i = 1; i <= 5; i++) {
        document.querySelector(`#slot-${i} .card-content`).innerHTML = '<span class="placeholder-icon">👤</span>';
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = '???';
        labelSpan.classList.remove('revealed-name');
    }
    
    // Charaktere ziehen und vorladen
    activePool = shuffleArray(activeCharacterDatabase).slice(0, 5);
    preloadImages(activePool);
    
    showNextCharacter();
}

export function showNextCharacter() {
    if (currentIndex < 5) {
        document.getElementById('progress-text').textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        document.getElementById('current-image-container').innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
    } else {
        // Spielende
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