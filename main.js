import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js'; // Initialer Start-Changelog

// 1. Initialisiere die UI-Systeme
initRatingSystem();
initChangelog();
updateChangelogContent(patchNotesStarWars);

// 2. Verkable die 1-5 Ranking Buttons
document.querySelectorAll('.rank-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleRankSelection(btn.dataset.rank, btn);
    });
});

// 3. Verkable den Neustart Button
document.getElementById('restart-btn').addEventListener('click', initGame);

// 4. Verkable den Theme-Wechsel (Pfeiltaste Unten)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault(); 
        toggleTheme();
    }
});

// 5. Starte das Spiel!
initGame();