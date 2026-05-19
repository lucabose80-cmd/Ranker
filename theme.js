// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';
import { renderHistory } from './history.js';
import { renderScoreboard } from './scoreboard.js';

export let currentMode = 'starwars'; 
export let activeCharacterDatabase = starWarsCharacters; 

export function toggleTheme() {
    const mainTitle = document.getElementById('main-title'); 
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let activeChangelogDatabase;

    // Filter-Dropdown bei Moduswechsel leeren, damit es sich neu aufbaut
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
    
    // Repariert: Wir prüfen, ob die Klasse 'hidden' fehlt, statt auf direkte Styles zu schauen
    if (!document.getElementById('history-content').classList.contains('hidden')) {
        renderHistory();
    }
    if (!document.getElementById('scoreboard-content').classList.contains('hidden')) {
        renderScoreboard();
    }
}