// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, register, login, logout, getCurrentUser } from './auth.js';
import { initAdminPanel } from './admin.js';

// --- APP START (Asynchron wegen Datenbank-Check) ---
async function bootApp() {
    await initAuth(); // Wartet auf Firebase
    const currentUser = getCurrentUser();

    const authView = document.getElementById('auth-view');
    const gameView = document.getElementById('game-view');
    const adminView = document.getElementById('admin-view');

    if (!currentUser) {
        // Nicht eingeloggt -> Zeige Login
        authView.classList.remove('hidden');
        gameView.classList.add('hidden');
        
        document.getElementById('register-btn').addEventListener('click', async () => {
            const res = await register(document.getElementById('auth-username').value, document.getElementById('auth-password').value);
            showAuthFeedback(res.message, res.success);
        });

        document.getElementById('login-btn').addEventListener('click', async () => {
            const res = await login(document.getElementById('auth-username').value, document.getElementById('auth-password').value);
            if (res.success) location.reload(); 
            else showAuthFeedback(res.message, false);
        });

    } else if (currentUser.role === 'admin') {
        // Admin eingeloggt -> Zeige Admin Panel
        authView.classList.add('hidden');
        adminView.classList.remove('hidden');
        await initAdminPanel();

    } else {
        // Normaler Spieler eingeloggt -> Zeige Spiel
        authView.classList.add('hidden');
        gameView.classList.remove('hidden');
        document.getElementById('player-greeting').textContent = `Willkommen, ${currentUser.username}!`;
        document.getElementById('logout-btn').addEventListener('click', logout);

        initRatingSystem();
        initChangelog();
        updateChangelogContent(patchNotesStarWars);

        document.querySelectorAll('.rank-btn').forEach(btn => {
            if (!btn.classList.contains('auth-btn')) { 
                btn.addEventListener('click', () => handleRankSelection(btn.dataset.rank, btn));
            }
        });

        document.getElementById('restart-btn').addEventListener('click', initGame);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault(); 
                toggleTheme();
            }
        });

        initGame();
    }
}

function showAuthFeedback(msg, isSuccess) {
    const feedback = document.getElementById('auth-feedback');
    feedback.textContent = msg;
    feedback.style.color = isSuccess ? '#2ed573' : '#ff4757';
    feedback.classList.remove('hidden');
}

// Startet die App!
bootApp();