// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser } from './auth.js';
import { initAdminPanel } from './admin.js';

// SVG Icons für das Passwort-Feld
const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

async function bootApp() {
    await initAuth(); 
    const currentUser = getCurrentUser();

    const authView = document.getElementById('auth-view');
    const gameView = document.getElementById('game-view');
    const adminView = document.getElementById('admin-view');

    if (!currentUser) {
        authView.classList.remove('hidden');
        gameView.classList.add('hidden');
        
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('auth-password');
        
        togglePasswordBtn.addEventListener('click', () => {
            const currentType = passwordInput.getAttribute('type');
            if (currentType === 'password') {
                passwordInput.setAttribute('type', 'text');
                togglePasswordBtn.innerHTML = eyeClosedSVG; // Geschlossenes Auge
            } else {
                passwordInput.setAttribute('type', 'password');
                togglePasswordBtn.innerHTML = eyeOpenSVG; // Offenes Auge
            }
        });

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
        authView.classList.add('hidden');
        adminView.classList.remove('hidden');
        await initAdminPanel();

    } else {
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

bootApp();