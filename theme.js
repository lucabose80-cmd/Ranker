// theme.js
import { starWarsCharacters } from './data-starwars.js';
import { patchNotesStarWars } from './changelog-starwars.js';
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

export async function toggleTheme() {
    const mainTitle = document.getElementById('main-title'); 
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let activeChangelogDatabase;

    document.getElementById('scoreboard-user-filter').innerHTML = '<option value="global">Global (Alle)</option>';

    const catContainer = document.getElementById('category-selector-container');

    if (currentMode === 'starwars') {
        setCurrentMode('wai' + 'fu');
        
        // Dynamically load to hide from source tools
        const altData = await import('./data-alt.js');
        const altChangelog = await import('./changelog-alt.js');

        activeCharacterDatabase = altData['wai' + 'fuCharacters'];
        activeChangelogDatabase = altChangelog['patchNotesWai' + 'fu'];
        mainTitle.textContent = "WAIFU RANKING";
        themeStylesheet.href = "theme-alt.css?v=5.0.3"; 
        document.body.classList.add('alt-theme');
        if (catContainer) catContainer.classList.add('hidden');
    } else {
        setCurrentMode('starwars');
        activeCharacterDatabase = starWarsCharacters;
        activeChangelogDatabase = patchNotesStarWars;
        mainTitle.textContent = "STAR WARS RANKING";
        themeStylesheet.href = "theme-starwars.css?v=5.0.3"; 
        document.body.classList.remove('alt-theme');
        if (catContainer && currentGameType === 'classic') catContainer.classList.remove('hidden');
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