import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';

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