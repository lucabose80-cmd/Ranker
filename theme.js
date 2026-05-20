// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { patchNotesWaifu } from './changelog-waifu.js';
import { updateChangelogContent } from './changelog.js';
import { initGame } from './game.js';
import { initAdvancedGame } from './game-advanced.js';
import { renderHistory, initHistoryListener, stopHistoryListener } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js';
import { renderAvatarSelection, updateTopbarAvatarElement, refreshProfileContent } from './profile.js';
import { getCurrentUser, startPresenceHeartbeat } from './auth.js';
import { initLiveSpectating, stopLiveSpectating } from './live.js';
import { refreshAdminPanel } from './admin.js';
import { currentMode, setCurrentMode, currentGameType } from './mode-state.js';

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
    
    const isHistoryVisible = !document.getElementById('history-content').classList.contains('hidden');
    const isScoreboardVisible = !document.getElementById('scoreboard-content').classList.contains('hidden');
    const isLiveVisible = !document.getElementById('live-content').classList.contains('hidden');

    if (isHistoryVisible || isScoreboardVisible) {
        initHistoryListener(true);
    } else {
        stopHistoryListener();
    }

    if (isLiveVisible) {
        initLiveSpectating(true);
    } else {
        stopLiveSpectating();
    }
    
    if (currentGameType === 'advanced') {
        initAdvancedGame();
    } else {
        initGame(); 
    }
    
    // Ändert das Profilbild oben links sofort passend zum neuen Modus ab!
    const user = getCurrentUser();
    if(user) {
        updateTopbarAvatarElement(user);
        startPresenceHeartbeat(); // Schickt den neuen Modus-Tag sofort an die Cloud
    }

    if (isHistoryVisible) renderHistory();
    if (isScoreboardVisible) renderScoreboard();
    if (!document.getElementById('lexikon-content').classList.contains('hidden')) renderLexikon();
    // Live-Spectating wird oben bereits initialisiert falls sichtbar

    renderAvatarSelection();
    refreshProfileContent(); // Aktualisiert Titel, Farbschemas & Counter passend zum neuen Modus
    refreshAdminPanel();
}