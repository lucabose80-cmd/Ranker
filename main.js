// main.js
import { initGame, handleRankSelection } from './game.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser, startPresenceHeartbeat } from './auth.js';
import { initAdminPanel } from './admin.js';
import { renderHistory } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js';
import { initProfile } from './profile.js';
import { initCommunity } from './community.js';

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
            startPresenceHeartbeat(); // Startet den Heartbeat!
        }
        await initAuth(); 
    } catch (error) {
        console.error("Kritischer Fehler beim App-Start:", error);
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
        loginBtn.disabled = true; loginBtn.textContent = "Lädt...";
        const res = await loginOrRegister(document.getElementById('auth-username').value, passwordInput.value);
        loginBtn.disabled = false; loginBtn.textContent = "Los geht's";
        if (res.success) location.reload();
        else {
            const f = document.getElementById('auth-feedback');
            f.textContent = res.message; f.style.color = '#ff4757'; f.classList.remove('hidden'); 
        }
    });
}

function setupAdminUI() {
    showView('admin-view');
    initAdminPanel();
}

function setupGameUI(user) {
    showView('game-view');
    document.getElementById('player-greeting').textContent = `Willkommen, ${user.displayName || user.username}!`;
    if(user.avatar) {
        const topAvatar = document.getElementById('topbar-avatar');
        topAvatar.src = user.avatar;
        topAvatar.classList.remove('hidden');
    }
    
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Alle Tabs
    const tabs = ['game-main-content', 'history-content', 'scoreboard-content', 'lexikon-content', 'community-content', 'profile-content', 'live-content'];
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
            
            link.classList.add('active');
            const target = link.dataset.target;
            document.getElementById(target).classList.remove('hidden');
            
            if (target === 'history-content') renderHistory();
            if (target === 'scoreboard-content') renderScoreboard();
            if (target === 'lexikon-content') renderLexikon();
            // Live Spectating kommt im nächsten Schritt, Community ist aber schon fertig
        });
    });

    document.getElementById('scoreboard-user-filter').addEventListener('change', renderScoreboard);

    initRatingSystem();
    initChangelog();
    updateChangelogContent(patchNotesStarWars);
    initProfile(); // Profil laden
    initCommunity(); // Chat & Online Liste laden

    document.querySelectorAll('.rank-btn').forEach(btn => {
        if (!btn.classList.contains('auth-btn')) btn.addEventListener('click', () => handleRankSelection(btn.dataset.rank, btn));
    });

    document.getElementById('restart-btn').addEventListener('click', initGame);
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); toggleTheme(); } });

    tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById('game-main-content').classList.remove('hidden');
    initGame();
}

bootApp();