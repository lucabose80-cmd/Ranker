// main.js
import { initGame, handleRankSelection } from './game.js';
import { initAdvancedGame } from './game-advanced.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser, startPresenceHeartbeat } from './auth.js';
import { initAdminPanel } from './admin.js';
import { renderHistory, initHistoryListener, stopHistoryListener } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon } from './lexikon.js';
import { initProfile, renderAvatarSelection, updateTopbarAvatarElement } from './profile.js';
import { initCommunity } from './community.js';
import { initLiveSpectating, closeSpectatorModal, stopLiveSpectating } from './live.js';
import { currentGameType, setCurrentGameType } from './mode-state.js';
import { initTrackerUI } from './tracker.js';

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
        startPresenceHeartbeat(); // Startet den Online-Status-Ping
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
        if (res.success) location.reload();
        else {
            lBtn.disabled = false; lBtn.textContent = "Los geht's";
            const f = document.getElementById('auth-feedback');
            f.textContent = res.message; f.style.color = '#ff4757'; f.classList.remove('hidden');
        }
    });
}

// Profil Overlay schließen
const closeProfileOverlay = () => {
    document.getElementById('profile-overlay').classList.add('hidden');
};

function setupGameUI(user) {
    showView('game-view');
    document.getElementById('player-greeting').textContent = user.displayName;
    updateTopbarAvatarElement(user);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Die Tabs des Spiels (ohne Community, ohne Profil)
    const tabs = ['game-main-content', 'live-content', 'history-content', 'scoreboard-content', 'lexikon-content'];
    
    // Tab-Navigation mit erzwungenem Live-Reload bei JEDEM Klick
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
            
            link.classList.add('active');
            const target = link.dataset.target;
            document.getElementById(target).classList.remove('hidden');
            
            // Inaktive Hörer abbestellen, um Hintergrund-Reads zu eliminieren!
            if (target !== 'history-content' && target !== 'scoreboard-content') {
                stopHistoryListener();
            }
            if (target !== 'live-content') {
                stopLiveSpectating();
            }

            // SOFORTIGES ERZWUNGENES NEULADEN BEI TAB-KLICK
            if (target === 'history-content') {
                initHistoryListener();
                renderHistory();
            }
            if (target === 'scoreboard-content') {
                initHistoryListener();
                renderScoreboard();
            }
            if (target === 'lexikon-content') renderLexikon();
            if (target === 'live-content') initLiveSpectating();
        });
    });

    // Modus-Selector Buttons konfigurieren
    const mClassicBtn = document.getElementById('mode-classic-btn');
    const mAdvancedBtn = document.getElementById('mode-advanced-btn');
    
    mClassicBtn.addEventListener('click', () => {
        if (currentGameType === 'classic') return;
        setCurrentGameType('classic');
        mClassicBtn.classList.add('active');
        mAdvancedBtn.classList.remove('active');
        document.getElementById('game-subtitle').textContent = "Ordne 5 Charaktere blind ein. Wo landen sie?";
        initGame();
    });
    
    mAdvancedBtn.addEventListener('click', () => {
        if (currentGameType === 'advanced') return;
        setCurrentGameType('advanced');
        mAdvancedBtn.classList.add('active');
        mClassicBtn.classList.remove('active');
        document.getElementById('game-subtitle').textContent = "Ordne 10 Charaktere blind ein. Wo landen sie und nutze deinen Joker!";
        initAdvancedGame();
    });

    // Profil Overlay öffnen
    document.getElementById('profile-trigger').addEventListener('click', () => {
        document.getElementById('profile-overlay').classList.remove('hidden');
        renderAvatarSelection(); // Baut die Bilder passend zum aktuellen Universum auf
    });
    
    document.getElementById('close-profile-btn').addEventListener('click', closeProfileOverlay);

    // Live-Zuschauer Modal schließen
    document.getElementById('close-spectator-btn').addEventListener('click', closeSpectatorModal);

    // Chat Box Toggle
    const chatWidget = document.getElementById('chat-widget');
    document.getElementById('chat-toggle-btn').addEventListener('click', () => chatWidget.classList.toggle('hidden'));
    document.getElementById('close-chat-btn').addEventListener('click', () => chatWidget.classList.add('hidden'));

    initRatingSystem();
    initChangelog();
    updateChangelogContent(patchNotesStarWars);
    initProfile();
    initCommunity();
    initTrackerUI();

    document.getElementById('restart-btn').addEventListener('click', () => {
        if (currentGameType === 'advanced') {
            initAdvancedGame();
        } else {
            initGame();
        }
    });
    
    // Tastenanschläge abfangen (Pfeiltaste = Moduswechsel, Esc = Profil / Zuschauen schließen)
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'ArrowDown') { e.preventDefault(); toggleTheme(); }
        if (e.key === 'Escape') {
            closeProfileOverlay();
            closeSpectatorModal();
        }
    });

    tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
    document.getElementById('game-main-content').classList.remove('hidden');
    
    // Erstes Spiel starten
    if (currentGameType === 'advanced') {
        mAdvancedBtn.classList.add('active');
        mClassicBtn.classList.remove('active');
        initAdvancedGame();
    } else {
        mClassicBtn.classList.add('active');
        mAdvancedBtn.classList.remove('active');
        initGame();
    }
}

function setupAdminUI() {
    showView('admin-view');
    initAdminPanel(); 
}
bootApp();