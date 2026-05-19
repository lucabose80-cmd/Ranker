// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';
import { renderHistory } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js'; // NEU Importiert

export let currentMode = 'starwars'; 
export let activeCharacterDatabase = starWarsCharacters; 

export function toggleTheme() {
    const mainTitle = document.getElementById('main-title'); 
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let activeChangelogDatabase;

    document.getElementById('scoreboard-user-filter').innerHTML = '<option value="global">Global (Alle Spieler)</option>';

    if (currentMode === 'starwars') {
        currentMode = 'waifu';
        activeCharacterDatabase = waifuCharacters;
        activeChangelogDatabase = patchNotesWaifu;
        mainTitle.textContent = "WAIFU RANKING";
        themeStylesheet.href = "theme-waifu.css"; 
        document.body.classList.add('waifu-theme');
    } else {
        currentMode = 'starwars';
        activeCharacterDatabase = starWarsCharacters;
        activeChangelogDatabase = patchNotesStarWars;
        mainTitle.textContent = "STAR WARS RANKING";
        themeStylesheet.href = "theme-starwars.css"; 
        document.body.classList.remove('waifu-theme');
    }
    
    updateChangelogContent(activeChangelogDatabase);
    
    initGame(); 
    
    // Live-Update der aktuellen Ansicht
    if (!document.getElementById('history-content').classList.contains('hidden')) {
        renderHistory();
    }
    if (!document.getElementById('scoreboard-content').classList.contains('hidden')) {
        renderScoreboard();
    }
    // NEU: Lexikon aktualisieren bei Theme-Wechsel
    if (!document.getElementById('lexikon-content').classList.contains('hidden')) {
        renderLexikon();
    }
}