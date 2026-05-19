// main.js

import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { initChangelog, updateChangelogContent } from './changelog.js';

let currentMode = 'starwars'; 
let activeCharacterDatabase = starWarsCharacters; 
let activeChangelogDatabase = patchNotesStarWars;

let activePool = [];
let currentIndex = 0;
let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

const rankButtons = document.querySelectorAll('.rank-btn');
const imgContainer = document.getElementById('current-image-container');
const progressText = document.getElementById('progress-text');
const restartBtn = document.getElementById('restart-btn');
const activeGameArea = document.getElementById('active-game-area');
const endScreenArea = document.getElementById('end-screen-area');
const rateButtons = document.querySelectorAll('.rate-btn');
const ratingFeedback = document.getElementById('rating-feedback');
const mainTitle = document.getElementById('main-title'); 
const themeStylesheet = document.getElementById('theme-stylesheet'); 

// --- NEU: Preload Funktion ---
// Lädt die Bilder unsichtbar in den Speicher des Browsers
function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}
// -----------------------------

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault(); 
        
        if (currentMode === 'starwars') {
            currentMode = 'waifu';
            activeCharacterDatabase = waifuCharacters;
            activeChangelogDatabase = patchNotesWaifu;
            mainTitle.textContent = "WAIFU RANKING";
            themeStylesheet.href = "theme-waifu.css"; 
        } else {
            currentMode = 'starwars';
            activeCharacterDatabase = starWarsCharacters;
            activeChangelogDatabase = patchNotesStarWars;
            mainTitle.textContent = "STAR WARS RANKING";
            themeStylesheet.href = "theme-starwars.css"; 
        }
        
        updateChangelogContent(activeChangelogDatabase);
        initGame(); 
    }
});

function initGame() {
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
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
    
    const shuffled = [...activeCharacterDatabase].sort(() => 0.5 - Math.random());
    activePool = shuffled.slice(0, 5);
    
    // --- NEU: Bilder sofort vorladen, nachdem die 5 Charaktere gezogen wurden ---
    preloadImages(activePool);
    
    showNextCharacter();
}

function showNextCharacter() {
    if (currentIndex < 5) {
        progressText.textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        
        // Da das Bild jetzt im Cache ist, taucht es hier komplett ohne Ruckler auf!
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
    } else {
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
        
        document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
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
updateChangelogContent(activeChangelogDatabase);
initGame();