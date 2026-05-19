// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser } from './auth.js';
import { initAdminPanel } from './admin.js';
import { renderHistory } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js'; // NEU Importiert

const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

function showView(viewId) {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('game-view').classList.add('hidden');
    
    document.getElementById(viewId).classList.remove('hidden');
}

async function bootApp() {
    try {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            setupAuthUI();
        } else if (currentUser.role === 'admin') {
            setupAdminUI();
        } else {
            setupGameUI(currentUser);
        }

        await initAuth(); 

    } catch (error) {
        console.error("Kritischer Fehler beim App-Start:", error);
        showAuthFeedback("Systemfehler: Konnte nicht mit der Datenbank verbinden.", false);
    }
}

function setupAuthUI() {
    showView('auth-view');
    
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('login-btn');
    
    togglePasswordBtn.addEventListener('click', () => {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        togglePasswordBtn.innerHTML = isPass ? eyeClosedSVG : eyeOpenSVG;
    });

    loginBtn.addEventListener('click', async () => {
        loginBtn.disabled = true;
        loginBtn.textContent = "Lädt...";
        
        const usernameInput = document.getElementById('auth-username').value;
        const res = await loginOrRegister(usernameInput, passwordInput.value);
        
        loginBtn.disabled = false;
        loginBtn.textContent = "Los geht's";

        if (res.success) {
            location.reload();
        } else {
            showAuthFeedback(res.message, false);
        }
    });
}

function setupAdminUI() {
    showView('admin-view');
    initAdminPanel();
}

function setupGameUI(user) {
    showView('game-view');
    document.getElementById('player-greeting').textContent = `Willkommen, ${user.username}!`;
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Tab-Navigation inkl. Lexikon
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            document.getElementById('game-main-content').classList.add('hidden');
            document.getElementById('history-content').classList.add('hidden');
            document.getElementById('scoreboard-content').classList.add('hidden');
            document.getElementById('lexikon-content').classList.add('hidden'); // NEU
            
            link.classList.add('active');
            document.getElementById(link.dataset.target).classList.remove('hidden');
            
            if (link.dataset.target === 'history-content') renderHistory();
            if (link.dataset.target === 'scoreboard-content') renderScoreboard();
            if (link.dataset.target === 'lexikon-content') renderLexikon(); // NEU
        });
    });

    document.getElementById('scoreboard-user-filter').addEventListener('change', () => {
        renderScoreboard();
    });

    initRatingSystem();
    initChangelog();
    updateChangelogContent(patchNotesStarWars);

    document.querySelectorAll('.rank-btn').forEach(btn => {
        if (!btn.classList.contains('auth-btn')) { 
            btn.addEventListener('click', () => handleRankSelection(btn.dataset.rank, btn));
        }
    });

    document.getElementById('restart-btn').addEventListener('click', initGame);
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); toggleTheme(); } });

    document.getElementById('game-main-content').classList.remove('hidden');
    document.getElementById('history-content').classList.add('hidden');
    document.getElementById('scoreboard-content').classList.add('hidden');
    document.getElementById('lexikon-content').classList.add('hidden');
    
    initGame();
}

function showAuthFeedback(msg, isSuccess) {
    const feedback = document.getElementById('auth-feedback');
    feedback.textContent = msg;
    feedback.style.color = isSuccess ? '#2ed573' : '#ff4757';
    feedback.classList.remove('hidden'); 
}

bootApp();