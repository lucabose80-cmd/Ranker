// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
// Auth Import angepasst
import { initAuth, loginOrRegister, logout, getCurrentUser } from './auth.js';
import { initAdminPanel } from './admin.js';

async function bootApp() {
    await initAuth(); 
    const currentUser = getCurrentUser();

    const authView = document.getElementById('auth-view');
    const gameView = document.getElementById('game-view');
    const adminView = document.getElementById('admin-view');

    if (!currentUser) {
        // Nicht eingeloggt -> Zeige Login
        authView.classList.remove('hidden');
        gameView.classList.add('hidden');
        
        // NEU: Passwort-Auge Logik
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('auth-password');
        
        togglePasswordBtn.addEventListener('click', () => {
            const currentType = passwordInput.getAttribute('type');
            if (currentType === 'password') {
                passwordInput.setAttribute('type', 'text');
                togglePasswordBtn.textContent = '🙈'; // Affe hält sich die Augen zu
            } else {
                passwordInput.setAttribute('type', 'password');
                togglePasswordBtn.textContent = '👁️'; // Normales Auge
            }
        });

        // NEU: Der kombinierte Button
        document.getElementById('login-btn').addEventListener('click', async () => {
            const usernameInput = document.getElementById('auth-username').value;
            const res = await loginOrRegister(usernameInput, passwordInput.value);
            
            if (res.success) {
                location.reload(); 
            } else {
                showAuthFeedback(res.message, false);
            }
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
        // Zeige den echten Benutzernamen (groß geschrieben durch CSS, aber intern sicher)
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

bootApp();