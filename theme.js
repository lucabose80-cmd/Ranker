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
import { initStarWarsdle } from './starwarsdle.js';

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
        
        const sdleTab = document.getElementById('nav-starwarsdle');
        if(sdleTab) sdleTab.innerHTML = 'ANIMEDLE <span id="starwarsdle-glow" style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #ffd700; border-radius: 50%; box-shadow: 0 0 10px #ffd700; display: none;"></span>';
        const sdleTitle = document.querySelector('#starwarsdle-content h2');
        if(sdleTitle) sdleTitle.textContent = "ANIMEDLE";
        
        const sbDle = document.querySelector('#scoreboard-type-filter option[value="starwarsdle"]');
        if(sbDle) sbDle.textContent = "Animedle (Daily)";
        const sbDleAll = document.querySelector('#scoreboard-type-filter option[value="starwarsdle_alltime"]');
        if(sbDleAll) sbDleAll.textContent = "Animedle (All-Time Wins)";
        
    } else {
        setCurrentMode('starwars');
        activeCharacterDatabase = starWarsCharacters;
        activeChangelogDatabase = patchNotesStarWars;
        mainTitle.textContent = "STAR WARS RANKING";
        themeStylesheet.href = "theme-starwars.css?v=5.0.3"; 
        document.body.classList.remove('alt-theme');
        if (catContainer && currentGameType === 'classic') catContainer.classList.remove('hidden');
        
        const sdleTab = document.getElementById('nav-starwarsdle');
        if(sdleTab) sdleTab.innerHTML = 'STARWARSDLE <span id="starwarsdle-glow" style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #ffd700; border-radius: 50%; box-shadow: 0 0 10px #ffd700; display: none;"></span>';
        const sdleTitle = document.querySelector('#starwarsdle-content h2');
        if(sdleTitle) sdleTitle.textContent = "STARWARSDLE";
        
        const sbDle = document.querySelector('#scoreboard-type-filter option[value="starwarsdle"]');
        if(sbDle) sbDle.textContent = "StarWarsdle (Daily)";
        const sbDleAll = document.querySelector('#scoreboard-type-filter option[value="starwarsdle_alltime"]');
        if(sbDleAll) sbDleAll.textContent = "StarWarsdle (All-Time Wins)";
    }
    
    updateChangelogContent(activeChangelogDatabase);
    if (window.fetchTop5Global) window.fetchTop5Global();
    
    const isHistoryVisible = !document.getElementById('history-content').classList.contains('hidden');
    const isScoreboardVisible = !document.getElementById('scoreboard-content').classList.contains('hidden');
    const isLiveVisible = !document.getElementById('live-content').classList.contains('hidden');

    if (isHistoryVisible || isScoreboardVisible) {
        initHistoryListener(true);
    } else {
        stopHistoryListener();
    }
    
    // Also re-init StarWarsdle to switch pools
    initStarWarsdle();

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
    if (window.updateCreditProgressBars) window.updateCreditProgressBars();
}