// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';
import { renderHistory } from './history.js';

export let currentMode = 'starwars'; 
export let activeCharacterDatabase = starWarsCharacters; 

export function toggleTheme() {
    const mainTitle = document.getElementById('main-title'); 
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let activeChangelogDatabase;

    if (currentMode === 'starwars') {
        currentMode = 'waifu';
        activeCharacterDatabase = waifuCharacters;
        activeChangelogDatabase = patchNotesWaifu;
        mainTitle.textContent = "WAIFU RANKING";
        themeStylesheet.href = "theme-waifu.css"; 
        document.body.classList.add('waifu-theme'); // Wichtig fürs CSS
    } else {
        currentMode = 'starwars';
        activeCharacterDatabase = starWarsCharacters;
        activeChangelogDatabase = patchNotesStarWars;
        mainTitle.textContent = "STAR WARS RANKING";
        themeStylesheet.href = "theme-starwars.css"; 
        document.body.classList.remove('waifu-theme');
    }
    
    updateChangelogContent(activeChangelogDatabase);
    
    // Spiel im Hintergrund neustarten
    initGame(); 
    
    // NEU: Wenn der Spieler den Historie-Tab offen hat und den Modus wechselt,
    // lädt die Historie sofort die Einträge des neuen Modus!
    if (!document.getElementById('history-content').classList.contains('hidden')) {
        renderHistory();
    }
}