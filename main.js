// main.js
import { starWarsCharacters } from './data.js';

let activePool = [];
let currentIndex = 0;

// DOM Elemente
const rankButtons = document.querySelectorAll('.rank-btn');
const imgContainer = document.getElementById('current-image-container');
const progressText = document.getElementById('progress-text');
const restartBtn = document.getElementById('restart-btn');
const actionArea = document.querySelector('.action-buttons');
const promptText = document.querySelector('.prompt-text');

function initGame() {
    currentIndex = 0;
    
    // UI zurücksetzen
    restartBtn.classList.add('hidden');
    actionArea.classList.remove('hidden');
    promptText.classList.remove('hidden');
    
    // Alle Buttons wieder aktivieren
    rankButtons.forEach(btn => btn.disabled = false);
    
    // Obere Slots leeren
    for (let i = 1; i <= 5; i++) {
        const slotContent = document.querySelector(`#slot-${i} .card-content`);
        slotContent.innerHTML = '<span class="placeholder-icon">👤</span>';
    }
    
    // 5 zufällige Charaktere ziehen
    const shuffled = [...starWarsCharacters].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    showNextCharacter();
}

function showNextCharacter() {
    if (currentIndex < 5) {
        progressText.textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        
        // Bild in der Mitte anzeigen
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Star Wars Charakter">`;
    } else {
        // Spielende
        progressText.textContent = "RANKING KOMPLETT";
        imgContainer.innerHTML = ''; // Mitte leeren
        actionArea.classList.add('hidden');
        promptText.classList.add('hidden');
        restartBtn.classList.remove('hidden');
    }
}

// Event Listener für die Buttons (1 bis 5)
rankButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const rank = btn.dataset.rank;
        const currentChar = activePool[currentIndex];
        
        // 1. Charakter-Bild oben in den gewählten Slot setzen
        const slotContent = document.querySelector(`#slot-${rank} .card-content`);
        slotContent.innerHTML = `<img src="${currentChar.img}" alt="Ranked Charakter">`;
        
        // 2. Den geklickten Button deaktivieren (Platz ist belegt)
        btn.disabled = true;
        
        // 3. Nächsten Charakter aufrufen
        currentIndex++;
        showNextCharacter();
    });
});

// Event Listener für den Neustart-Button
restartBtn.addEventListener('click', initGame);

// Spiel beim Laden der Seite starten
initGame();