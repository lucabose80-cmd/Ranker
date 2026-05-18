// main.js
import { starWarsCharacters } from './data.js';

let activePool = [];
let currentIndex = 0; // Welcher der 5 Charaktere ist gerade dran?
let filledRanks = { 1: false, 2: false, 3: false, 4: false, 5: false };

// DOM Elemente
const slots = document.querySelectorAll('.rank-slot');
const currentContainer = document.getElementById('current-character-container');
const promptText = document.getElementById('current-prompt');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
    // Spielstatus zurücksetzen
    currentIndex = 0;
    filledRanks = { 1: false, 2: false, 3: false, 4: false, 5: false };
    restartBtn.classList.add('hidden');
    
    // 5 zufällige Charaktere ziehen
    const shuffled = [...starWarsCharacters].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    resetRankingBoard();
    showNextCharacter();
}

function resetRankingBoard() {
    slots.forEach(slot => {
        const rank = slot.dataset.rank;
        slot.innerHTML = `<span class="rank-number">${rank}</span>`;
        slot.classList.remove('filled');
    });
}

function showNextCharacter() {
    if (currentIndex < 5) {
        // Zeige nur das Bild des aktuellen Charakters (ohne Namen)
        const currentChar = activePool[currentIndex];
        currentContainer.innerHTML = `<img src="${currentChar.img}" alt="Unbekannter Charakter" class="current-img">`;
        promptText.textContent = `Auf welchen Platz setzt du diesen Charakter?`;
    } else {
        // Spiel vorbei
        currentContainer.innerHTML = '';
        promptText.textContent = `Ranking komplett! Die Macht ist stark in dir.`;
        restartBtn.classList.remove('hidden');
    }
}

// Event Listener für die Platzierungen (Ranking-Slots)
slots.forEach(slot => {
    slot.addEventListener('click', () => {
        const rank = slot.dataset.rank;
        
        // Prüfen: Ist das Spiel noch nicht vorbei UND ist der Platz noch frei?
        if (currentIndex < 5 && !filledRanks[rank]) {
            const currentChar = activePool[currentIndex];
            
            // Slot befüllen (Hier kannst du entscheiden, ob am Ende der Name stehen soll. Ich habe ihn hier weggelassen, nur das Bild wird gezeigt).
            slot.innerHTML = `
                <span class="rank-number top-left">${rank}</span>
                <img src="${currentChar.img}" alt="Star Wars Charakter" class="ranked-img">
            `;
            slot.classList.add('filled');
            filledRanks[rank] = true; // Platz als belegt markieren
            
            // Nächsten Charakter vorbereiten
            currentIndex++;
            showNextCharacter();
        }
    });
});

// Event Listener für den Neustart-Button
restartBtn.addEventListener('click', initGame);

// Spiel beim Laden der Seite starten
initGame();