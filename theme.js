// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';
import { renderHistory, initHistoryListener } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js';
import { renderAvatarSelection, updateTopbarAvatarElement } from './profile.js';
import { getCurrentUser, startPresenceHeartbeat } from './auth.js';
import { initLiveSpectating } from './live.js';
import { refreshAdminPanel } from './admin.js';
import { currentMode, setCurrentMode } from './mode-state.js';

export let activeCharacterDatabase = starWarsCharacters; 

export function toggleTheme() {
    const mainTitle = document.getElementById('main-title'); 
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let activeChangelogDatabase;

    document.getElementById('scoreboard-user-filter').innerHTML = '<option value="global">Global (Alle)</option>';

    if (currentMode === 'starwars') {
        setCurrentMode('waifu');
        activeCharacterDatabase = waifuCharacters;
        activeChangelogDatabase = patchNotesWaifu;
        mainTitle.textContent = "WAIFU RANKING";
        themeStylesheet.href = "theme-waifu.css"; 
        document.body.classList.add('waifu-theme');
    } else {
        setCurrentMode('starwars');
        activeCharacterDatabase = starWarsCharacters;
        activeChangelogDatabase = patchNotesStarWars;
        mainTitle.textContent = "STAR WARS RANKING";
        themeStylesheet.href = "theme-starwars.css"; 
        document.body.classList.remove('waifu-theme');
    }
    
    updateChangelogContent(activeChangelogDatabase);
    initHistoryListener(); // Listener auf das neue Universum umschalten
    initGame(); 
    
    // Ändert das Profilbild oben links sofort passend zum neuen Modus ab!
    const user = getCurrentUser();
    if(user) {
        updateTopbarAvatarElement(user);
        startPresenceHeartbeat(); // Schickt den neuen Modus-Tag sofort an die Cloud
    }

    if (!document.getElementById('history-content').classList.contains('hidden')) renderHistory();
    if (!document.getElementById('scoreboard-content').classList.contains('hidden')) renderScoreboard();
    if (!document.getElementById('lexikon-content').classList.contains('hidden')) renderLexikon();
    if (!document.getElementById('live-content').classList.contains('hidden')) initLiveSpectating();

    renderAvatarSelection();
    refreshAdminPanel();
}