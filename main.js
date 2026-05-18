// main.js
import { starWarsCharacters } from './data.js';
import { initChangelog } from './changelog.js';

let activePool = [];
let currentIndex = 0;
let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

// DOM Elemente
const rankButtons = document.querySelectorAll('.rank-btn');
const imgContainer = document.getElementById('current-image-container');
const progressText = document.getElementById('progress-text');
const restartBtn = document.getElementById('restart-btn');

// Phasen-Container
const activeGameArea = document.getElementById('active-game-area');
const endScreenArea = document.getElementById('end-screen-area');

// Rating
const rateButtons = document.querySelectorAll('.rate-btn');
const ratingFeedback = document.getElementById('rating-feedback');

function initGame() {
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    // Areas umschalten
    endScreenArea.classList.add('hidden');
    activeGameArea.classList.remove('hidden');
    ratingFeedback.classList.add('hidden');
    
    rankButtons.forEach(btn => btn.disabled = false);
    rateButtons.forEach(btn => btn.classList.remove('selected'));
    
    for (let i = 1; i <= 5; i++) {
        document.querySelector(`#slot-${i} .card-content`).innerHTML = '<span class="placeholder-icon">👤</span>';
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = '???';
        labelSpan.classList.remove('revealed-name');
    }
    
    const shuffled = [...starWarsCharacters].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    showNextCharacter();
}

function showNextCharacter() {
    if (currentIndex < 5) {
        progressText.textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Star Wars Charakter">`;
    } else {
        // Spielende: Verstecke das aktive Spiel, zeige den End-Screen
        activeGameArea.classList.add('hidden');
        revealNames();
        endScreenArea.classList.remove('hidden');
    }
}

function revealNames() {
    for (let i = 1; i <= 5; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        labelSpan.textContent = placedCharacters[i].name;
        labelSpan.classList.add('revealed-name');
    }
}

rankButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const rank = btn.dataset.rank;
        const currentChar = activePool[currentIndex];
        
        document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked Charakter">`;
        placedCharacters[rank] = currentChar;
        
        btn.disabled = true;
        currentIndex++;
        showNextCharacter();
    });
});

rateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        rateButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        ratingFeedback.textContent = `Du hast deine Liste mit ${btn.textContent}/10 bewertet. Danke!`;
        ratingFeedback.classList.remove('hidden');
    });
});

restartBtn.addEventListener('click', initGame);

initChangelog();
initGame();