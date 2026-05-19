// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser } from './auth.js';
import { initAdminPanel } from './admin.js';
import { renderHistory } from './history.js';

const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

// KUGELSICHERER FIX: Nutzt direkte Styles statt CSS-Klassen
function showView(viewId) {
    // 1. Alles hart verstecken
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'none';
    
    // 2. Nur das Ziel anzeigen (als flex, damit das Layout zentriert bleibt)
    document.getElementById(viewId).style.display = 'flex';
}

async function bootApp() {
    try {
        const currentUser = getCurrentUser();

        // Zeigt nun sauber nur den jeweiligen Bereich
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

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            // Auch hier nutzen wir nun direkte Styles für die Tabs
            document.getElementById('game-main-content').style.display = 'none';
            document.getElementById('history-content').style.display = 'none';
            
            link.classList.add('active');
            
            // Wenn es Game-Main-Content ist, soll es 'flex' sein, bei History reicht 'block'
            if (link.dataset.target === 'game-main-content') {
                document.getElementById(link.dataset.target).style.display = 'flex';
            } else {
                document.getElementById(link.dataset.target).style.display = 'block';
                renderHistory();
            }
        });
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

    // Initialen Tab setzen
    document.getElementById('game-main-content').style.display = 'flex';
    document.getElementById('history-content').style.display = 'none';
    
    initGame();
}

function showAuthFeedback(msg, isSuccess) {
    const feedback = document.getElementById('auth-feedback');
    feedback.textContent = msg;
    feedback.style.color = isSuccess ? '#2ed573' : '#ff4757';
    feedback.classList.remove('hidden'); // Hier ist hidden okay, da es nur ein <p> Tag ist
    feedback.style.display = 'block'; // Zur Sicherheit
}

bootApp();