// main.js

// 1. Importe aus den anderen Dateien
import { starWarsCharacters } from './data.js';
import { initChangelog } from './changelog.js';

// 2. Spiel-Variablen (State)
let activePool = [];
let currentIndex = 0;
let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

// 3. DOM Elemente referenzieren
// Spiel-Steuerung
const rankButtons = document.querySelectorAll('.rank-btn');
const imgContainer = document.getElementById('current-image-container');
const progressText = document.getElementById('progress-text');
const restartBtn = document.getElementById('restart-btn');
const actionArea = document.getElementById('action-area');

// Rating-System
const ratingArea = document.getElementById('rating-area');
const rateButtons = document.querySelectorAll('.rate-btn');
const ratingFeedback = document.getElementById('rating-feedback');

// 4. Spiellogik-Funktionen
function initGame() {
    // Variablen zurücksetzen
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    // UI zurücksetzen (Felder verstecken/anzeigen)
    restartBtn.classList.add('hidden');
    ratingArea.classList.add('hidden');
    ratingFeedback.classList.add('hidden');
    actionArea.classList.remove('hidden');
    
    // Buttons zurücksetzen
    rankButtons.forEach(btn => btn.disabled = false);
    rateButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Obere Slots visuell leeren
    for (let i = 1; i <= 5; i++) {
        document.querySelector(`#slot-${i} .card-content`).innerHTML = '<span class="placeholder-icon">👤</span>';
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = '???';
        labelSpan.classList.remove('revealed-name');
    }
    
    // 5 zufällige Charaktere aus dem Pool ziehen
    const shuffled = [...starWarsCharacters].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    // Den ersten Charakter anzeigen
    showNextCharacter();
}

function showNextCharacter() {
    // Solange wir noch nicht bei Charakter 6 (Index 5) sind...
    if (currentIndex < 5) {
        progressText.textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        
        // Bild in der Mitte anzeigen
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Star Wars Charakter">`;
    } else {
        // ... ansonsten ist das Spiel vorbei!
        progressText.textContent = "RANKING KOMPLETT";
        imgContainer.innerHTML = ''; // Mitte leeren
        actionArea.classList.add('hidden'); // Buttons verstecken
        
        revealNames(); // Namen auflösen!
        
        ratingArea.classList.remove('hidden'); // Rating anzeigen
        restartBtn.classList.remove('hidden'); // Neustart anzeigen
    }
}

function revealNames() {
    // Geht alle 5 Plätze durch und tauscht "???" gegen den gespeicherten Namen
    for (let i = 1; i <= 5; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = placedCharacters[i].name;
        labelSpan.classList.add('revealed-name'); // Startet die leuchtende CSS-Animation
    }
}

// 5. Event Listener (Klicks verarbeiten)

// Klicks auf die Ranking-Buttons (1-5)
rankButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const rank = btn.dataset.rank;
        const currentChar = activePool[currentIndex];
        
        // 1. Charakter-Bild oben in den gewählten Slot setzen
        document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked Charakter">`;
        
        // 2. Den Charakter intern für das Ende abspeichern
        placedCharacters[rank] = currentChar;
        
        // 3. Button deaktivieren (Platz ist jetzt belegt)
        btn.disabled = true;
        
        // 4. Zum nächsten Charakter wechseln
        currentIndex++;
        showNextCharacter();
    });
});

// Klicks auf die Rating-Buttons (1-10)
rateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Erstmal alle blauen Ränder entfernen
        rateButtons.forEach(b => b.classList.remove('selected'));
        // Dem geklickten Button den blauen Rand geben
        btn.classList.add('selected');
        
        // Feedback-Text anzeigen
        ratingFeedback.textContent = `Du hast deine Liste mit ${btn.textContent}/10 bewertet. Danke!`;
        ratingFeedback.classList.remove('hidden');
    });
});

// Klick auf Neustart
restartBtn.addEventListener('click', initGame);

// 6. Initiale Starts (beim Laden der Seite)

// Changelog generieren und Event-Listener aktivieren (ausgelagert in changelog.js)
initChangelog();

// Spiel starten
initGame();