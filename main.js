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
import { initLiveSpectating } from './live.js'; // NEU

const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

function showView(viewId) {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('game-view').classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');
}

async function bootApp() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        setupAuthUI();
    } else if (currentUser.role === 'admin') {
        setupAdminUI();
    } else {
        setupGameUI(currentUser);
        startPresenceHeartbeat();
    }
    await initAuth(); 
}

function setupAuthUI() {
    showView('auth-view');
    const tBtn = document.getElementById('toggle-password');
    const pInput = document.getElementById('auth-password');
    const lBtn = document.getElementById('login-btn');
    
    tBtn.addEventListener('click', () => {
        const isP = pInput.type === 'password';
        pInput.type = isP ? 'text' : 'password';
        tBtn.innerHTML = isP ? eyeClosedSVG : eyeOpenSVG;
    });

    lBtn.addEventListener('click', async () => {
        lBtn.disabled = true; lBtn.textContent = "Lädt...";
        const res = await loginOrRegister(document.getElementById('auth-username').value, pInput.value);
        lBtn.disabled = false; lBtn.textContent = "Los geht's";
        if (res.success) location.reload();
        else showAuthFeedback(res.message, false);
    });
}

function setupAdminUI() {
    showView('admin-view');
    initAdminPanel();
}

function setupGameUI(user) {
    showView('game-view');
    document.getElementById('player-greeting').textContent = user.displayName;
    if(user.avatar) {
        const topA = document.getElementById('topbar-avatar');
        topA.src = user.avatar; topA.classList.remove('hidden');
    }
    document.getElementById('logout-btn').addEventListener('click', logout);

    const tabs = ['game-main-content', 'live-content', 'history-content', 'scoreboard-content', 'lexikon-content', 'community-content', 'profile-content'];
    
    // Tab Logik
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
        });
    });

    // Profil Klick Logik
    document.getElementById('profile-trigger').addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
        document.getElementById('profile-content').classList.remove('hidden');
    });

    // Chat Toggle Logik
    const chatWidget = document.getElementById('chat-widget');
    document.getElementById('chat-toggle-btn').addEventListener('click', () => chatWidget.classList.toggle('hidden'));
    document.getElementById('close-chat-btn').addEventListener('click', () => chatWidget.classList.add('hidden'));

    initRatingSystem();
    initChangelog();
    updateChangelogContent(patchNotesStarWars);
    initProfile();
    initCommunity();
    initLiveSpectating(); // Startet Live Updates

    document.querySelectorAll('.rank-btn').forEach(btn => {
        if (!btn.classList.contains('auth-btn')) btn.addEventListener('click', () => handleRankSelection(btn.dataset.rank, btn));
    });

    document.getElementById('restart-btn').addEventListener('click', initGame);
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); toggleTheme(); } });

    tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById('game-main-content').classList.remove('hidden');
    initGame();
}

function showAuthFeedback(msg, isSuccess) {
    const f = document.getElementById('auth-feedback');
    f.textContent = msg; f.style.color = isSuccess ? '#2ed573' : '#ff4757'; f.classList.remove('hidden'); 
}

bootApp();