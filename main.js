// main.js
import { starWarsCharacters } from './data.js';

let currentRank = 1;
let activePool = [];

// DOM Elemente
const poolContainer = document.getElementById('character-pool');
const promptText = document.getElementById('current-prompt');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
    currentRank = 1;
    restartBtn.classList.add('hidden');
    
    // 5 zufällige Charaktere ziehen
    const shuffled = [...starWarsCharacters].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    // UI zurücksetzen
    resetRankingBoard();
    updatePrompt();
    renderPool();
}

function renderPool() {
    poolContainer.innerHTML = ''; // Pool leeren
    
    activePool.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <img src="${character.img}" alt="${character.name}">
            <p>${character.name}</p>
        `;
        
        // Klick-Event: Charakter auswählen
        card.addEventListener('click', () => selectCharacter(character));
        poolContainer.appendChild(card);
    });
}

function selectCharacter(character) {
    if (currentRank > 5) return;

    // 1. Aus dem Pool entfernen und neu rendern
    activePool = activePool.filter(c => c.name !== character.name);
    renderPool();

    // 2. Unten ins Ranking einfügen
    const slot = document.getElementById(`rank-${currentRank}`);
    slot.innerHTML = `
        <span class="rank-number">${currentRank}.</span>
        <div class="ranked-character">
            <img src="${character.img}" alt="${character.name}">
            <span>${character.name}</span>
        </div>
    `;
    slot.classList.add('filled');

    // 3. Nächsten Platz vorbereiten
    currentRank++;
    updatePrompt();
}

function updatePrompt() {
    if (currentRank <= 5) {
        promptText.textContent = `Wähle deinen Platz ${currentRank}`;
    } else {
        promptText.textContent = `Die Macht ist stark in diesem Ranking!`;
        restartBtn.classList.remove('hidden');
    }
}

function resetRankingBoard() {
    for (let i = 1; i <= 5; i++) {
        const slot = document.getElementById(`rank-${i}`);
        slot.innerHTML = `<span class="rank-number">${i}.</span> <span class="placeholder-text">Wartet auf Auswahl...</span>`;
        slot.classList.remove('filled');
    }
}

// Event Listener für den Neustart-Button
restartBtn.addEventListener('click', initGame);

// Spiel beim Laden der Seite starten
initGame();