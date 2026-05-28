
window.getSharedAudioContext = function() {
    if (!window.sharedAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        window.sharedAudioContext = new AudioContext();
    }
    if (window.sharedAudioContext.state === 'suspended') {
        window.sharedAudioContext.resume();
    }
    return window.sharedAudioContext;
};
// main.js
import { initGame, handleRankSelection } from './game.js';
import { initAdvancedGame } from './game-advanced.js';
import { toggleTheme } from './theme.js';
import { initRatingSystem } from './rating.js';
import { initChangelog, updateChangelogContent } from './changelog.js';
import { patchNotesStarWars } from './changelog-starwars.js';
import { initAuth, loginOrRegister, logout, getCurrentUser, startPresenceHeartbeat, markCurrentUserOffline } from './auth.js';
import { initAdminPanel, stopAdminPanel } from './admin.js';
import { initAdventureMode } from './adventure.js?v=8.0.5';
import { renderHistory, initHistoryListener, stopHistoryListener } from './history.js';
import { renderScoreboard } from './scoreboard.js';
import { renderLexikon, initLexikonTabs } from './lexikon.js';
import { initProfile, renderAvatarSelection, updateTopbarAvatarElement, applyColorTheme, refreshProfileContent, clearProfileUnlockDot } from './profile.js';
import { initCommunity, stopCommunity } from './community.js';
import { initVersus, stopVersus } from './versus.js';
import { initStarWarsdle } from './starwarsdle.js';
import { initLiveSpectating, closeSpectatorModal, stopLiveSpectating } from './live.js';
import { currentGameType, setCurrentGameType, currentMode, currentGameCategory, setCurrentGameCategory } from './mode-state.js';
import { initTrackerUI } from './tracker.js';
import { initSuggestions, renderSuggestions, stopSuggestions } from './suggestions.js';
import { initInactivityWatcher } from './inactivity.js';
import { initPrivateChat } from './private-chat.js';
import { initShop } from './shop.js';
import { initCardgame } from './cardgame.js';

const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

// Globaler Cleanup für alle Firebase Listener bei Seitenunload oder Reload
function cleanupAllListeners() {
    stopHistoryListener();
    stopLiveSpectating();
    stopSuggestions();
    stopCommunity();
    stopVersus();
    stopAdminPanel();
}

window.addEventListener('beforeunload', cleanupAllListeners);
window.addEventListener('pagehide', () => {
    markCurrentUserOffline();
    cleanupAllListeners();
});

function showView(viewId) {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('game-view').classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');
}

async function bootApp() {
    let currentUser = getCurrentUser();
    if (!currentUser) {
        setupAuthUI();
    } else if (currentUser.role === 'admin') {
        setupAdminUI();
    } else {
        // Firestore-Daten holen und StarWarsdle-Fortschritt wiederherstellen
        try {
            const { refreshCurrentUser, restoreUserStorage } = await import('./auth.js');
            const freshUser = await refreshCurrentUser();
            if (freshUser) restoreUserStorage(freshUser);
        } catch(e) {}
        setupGameUI(currentUser);
        startPresenceHeartbeat();
    }
    await initAuth(); 
}

function setupAuthUI() {
    showView('auth-view');
    
    // --- Custom Autocomplete Setup ---
    let allUsernames = [];
    let activeIndex = -1;

    const input = document.getElementById('auth-username');
    const dropdown = document.getElementById('auth-autocomplete-dropdown');

    const closeDropdown = () => {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        activeIndex = -1;
    };

    const renderDropdown = (query) => {
        if (!query || query.length < 1) { closeDropdown(); return; }
        const matches = allUsernames.filter(u => u.toLowerCase().startsWith(query.toLowerCase()));
        if (matches.length === 0) { closeDropdown(); return; }

        dropdown.innerHTML = '';
        activeIndex = -1;
        matches.forEach(uname => {
            const item = document.createElement('div');
            item.className = 'auth-autocomplete-item';
            item.textContent = uname;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // verhindert blur vor click
                input.value = uname;
                closeDropdown();
            });
            dropdown.appendChild(item);
        });
        dropdown.classList.remove('hidden');
    };

    input.addEventListener('input', () => renderDropdown(input.value));

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.auth-autocomplete-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            input.value = items[activeIndex].textContent;
            closeDropdown();
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    input.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });

    // Usernames aus Cache laden
    const loadUsernames = (userResets) => {
        allUsernames = Object.keys(userResets).filter(u => u !== 'admin' && !u.startsWith('test'));
    };

    try {
        const cacheStr = localStorage.getItem('ranker_resets_cache');
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            if (cache.userResets && Object.keys(cache.userResets).length > 0) {
                loadUsernames(cache.userResets);
            }
        }
    } catch (e) {}

    // Immer auch frisch aus Firestore laden (im Hintergrund)
    import('./resets.js').then(({ getResets }) => {
        getResets().then(({ userResets }) => {
            if (userResets && Object.keys(userResets).length > 0) loadUsernames(userResets);
        }).catch(() => {});
    });

    const tBtn = document.getElementById('toggle-password');
    const pInput = document.getElementById('auth-password');
    const lBtn = document.getElementById('login-btn');
    
    tBtn.addEventListener('click', () => {
        const isP = pInput.type === 'password';
        pInput.type = isP ? 'text' : 'password';
        tBtn.innerHTML = isP ? eyeClosedSVG : eyeOpenSVG;
    });

    const handleLogin = async () => {
        lBtn.disabled = true; lBtn.textContent = "Lädt...";
        const res = await loginOrRegister(document.getElementById('auth-username').value, pInput.value);
        if (res.success) location.reload();
        else {
            lBtn.disabled = false; lBtn.textContent = "Los geht's";
            const f = document.getElementById('auth-feedback');
            f.textContent = res.message; f.style.color = '#ff4757'; f.classList.remove('hidden');
        }
    };

    lBtn.addEventListener('click', handleLogin);
    
    document.getElementById('auth-username').addEventListener('keypress', (e) => { if(e.key === 'Enter') handleLogin(); });
    pInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleLogin(); });
}

// Profil Overlay schließen
const closeProfileOverlay = () => {
    document.getElementById('profile-overlay').classList.add('hidden');
};

function setupGameUI(user) {
    showView('game-view');
    document.getElementById('player-greeting').textContent = user.displayName;
    updateTopbarAvatarElement(user);
    applyColorTheme(user);
    document.getElementById('logout-btn').addEventListener('click', logout);

    window.top5GlobalChars = [];
    window.fetchTop5Global = async function() {
        try {
            const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
            const docRef = doc(db, "scores", `${currentMode}_classic_global`);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const chars = Object.values(snap.data().characters || {});
                chars.sort((a,b) => (b.score / (b.count || 1)) - (a.score / (a.count || 1)));
                window.top5GlobalChars = chars.slice(0, 5).map(c => c.name);
            } else {
                window.top5GlobalChars = [];
            }
        } catch(e) {}
    };
    window.fetchTop5Global();

    // Die Tabs des Spiels (ohne Community, ohne Profil)
    const tabs = ['game-main-content', 'live-content', 'history-content', 'scoreboard-content', 'lexikon-content', 'suggestions-content', 'versus-content', 'starwarsdle-content', 'shop-content', 'cardgame-content'];
    
    // Tab-Navigation mit erzwungenem Live-Reload bei JEDEM Klick
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            tabs.forEach(t => document.getElementById(t).classList.add('hidden'));
            
            link.classList.add('active');
            const target = link.dataset.target;
            document.getElementById(target).classList.remove('hidden');
            
            // Inaktive Hörer werden absichtlich NICHT mehr abbestellt! 
            // Wenn der Tab-Wechsel stattfindet, bleibt der Listener im Hintergrund aktiv.
            // Dadurch nutzt Firebase den lokalen Cache und löst beim erneuten Öffnen 0 (NULL) Reads aus!

            // SOFORTIGES ERZWUNGENES NEULADEN BEI TAB-KLICK
            if (target === 'history-content') {
                initHistoryListener();
                renderHistory();
            }
            if (target === 'scoreboard-content') {
                initHistoryListener();
                renderScoreboard();
            }
            if (target === 'suggestions-content') {
                initSuggestions();
                renderSuggestions();
            }
            if (target === 'lexikon-content') renderLexikon();
            if (target === 'live-content') initLiveSpectating();
            if (target === 'versus-content') initVersus();
            if (target === 'shop-content') initShop();
        });
    });

    initStarWarsdle();
    initCardgame();

    // Modus-Selector Buttons konfigurieren
    const mClassicBtn = document.getElementById('mode-classic-btn');
    const mAdvancedBtn = document.getElementById('mode-advanced-btn');
    
    // Initialize state
    if (currentGameType === 'advanced') {
        mAdvancedBtn.classList.add('active');
        mClassicBtn.classList.remove('active');
        const catContainer = document.getElementById('category-selector-container');
        if (catContainer) catContainer.classList.add('hidden');
        document.getElementById('game-subtitle').textContent = "Ordne 10 Charaktere blind ein. Wo landen sie und nutze deinen Joker!";
    } else {
        mClassicBtn.classList.add('active');
        mAdvancedBtn.classList.remove('active');
        const catContainer = document.getElementById('category-selector-container');
        if (catContainer && currentMode === 'starwars') catContainer.classList.remove('hidden');
        document.getElementById('game-subtitle').textContent = "Ordne 5 Charaktere blind ein. Wo landen sie?";
    }
    
    mClassicBtn.addEventListener('click', () => {
        if (currentGameType === 'classic') return;
        setCurrentGameType('classic');
        mClassicBtn.classList.add('active');
        mAdvancedBtn.classList.remove('active');
        
        const catContainer = document.getElementById('category-selector-container');
        if (catContainer && currentMode === 'starwars') catContainer.classList.remove('hidden');
        
        document.getElementById('game-subtitle').textContent = "Ordne 5 Charaktere blind ein. Wo landen sie?";
        initGame();
    });
    
    mAdvancedBtn.addEventListener('click', () => {
        if (currentGameType === 'advanced') return;
        setCurrentGameType('advanced');
        mAdvancedBtn.classList.add('active');
        mClassicBtn.classList.remove('active');
        
        const catContainer = document.getElementById('category-selector-container');
        if (catContainer) catContainer.classList.add('hidden');
        
        document.getElementById('game-subtitle').textContent = "Ordne 10 Charaktere blind ein. Wo landen sie und nutze deinen Joker!";
        initAdvancedGame();
    });

    const catNormalBtn = document.getElementById('cat-normal-btn');
    const catKlonBtn = document.getElementById('cat-klon-btn');
    const catPeakBtn = document.getElementById('cat-peak-btn');
    const catVehicleBtn = document.getElementById('cat-vehicle-btn');
    const catHardcoreBtn = document.getElementById('cat-hardcore-btn');
    
    if (catNormalBtn) {
        const updateCatButtons = (activeCat) => {
            [catNormalBtn, catKlonBtn, catPeakBtn, catVehicleBtn, catHardcoreBtn].forEach(btn => {
                if(btn) btn.classList.remove('active');
            });
            if (activeCat === 'normal') catNormalBtn.classList.add('active');
            if (activeCat === 'klon') catKlonBtn.classList.add('active');
            if (activeCat === 'peak') catPeakBtn.classList.add('active');
            if (activeCat === 'vehicle') catVehicleBtn.classList.add('active');
            if (activeCat === 'hardcore') catHardcoreBtn.classList.add('active');
        };

        const attachCatListener = (btn, cat) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (currentGameCategory === cat) return;
                setCurrentGameCategory(cat);
                updateCatButtons(cat);
                if (currentGameType === 'classic') initGame();
            });
        };
        
        attachCatListener(catNormalBtn, 'normal');
        attachCatListener(catKlonBtn, 'klon');
        attachCatListener(catPeakBtn, 'peak');
        attachCatListener(catVehicleBtn, 'vehicle');
        attachCatListener(catHardcoreBtn, 'hardcore');
        
        // Initialize state
        updateCatButtons(currentGameCategory);
    }

    // Profil Overlay öffnen
    document.getElementById('profile-trigger').addEventListener('click', () => {
        document.getElementById('profile-overlay').classList.remove('hidden');
        refreshProfileContent(); // Baut alles passend zum aktuellen Modus neu auf
    });
    
    document.getElementById('close-profile-btn').addEventListener('click', closeProfileOverlay);

    // Live-Zuschauer Modal schließen
    document.getElementById('close-spectator-btn').addEventListener('click', closeSpectatorModal);

    // Chat Box Toggle
    const chatWidget = document.getElementById('chat-widget');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    chatToggleBtn.addEventListener('click', () => {
        chatWidget.classList.toggle('hidden');
        chatToggleBtn.classList.remove('has-new');
        // Immer zum letzten Nachricht scrollen wenn Chat geöffnet wird
        if (!chatWidget.classList.contains('hidden')) {
            const msgs = document.getElementById('chat-messages');
            if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
        }
    });
    document.getElementById('close-chat-btn').addEventListener('click', () => chatWidget.classList.add('hidden'));

    // Online Sidebar Toggle
    const onlineSidebar = document.getElementById('online-sidebar');
    const onlineSidebarToggle = document.getElementById('online-sidebar-toggle');
    if (onlineSidebar && onlineSidebarToggle) {
        // Zustand laden
        if (localStorage.getItem('online-sidebar-collapsed') === 'true') {
            onlineSidebar.classList.add('collapsed');
        }
        
        onlineSidebarToggle.addEventListener('click', () => {
            onlineSidebar.classList.toggle('collapsed');
            localStorage.setItem('online-sidebar-collapsed', onlineSidebar.classList.contains('collapsed'));
        });
    }

    initRatingSystem();
    initChangelog();
    initAdventureMode();
    updateChangelogContent(patchNotesStarWars);
    initProfile();
    initLexikonTabs();
    initCommunity();
    initTrackerUI();
    initInactivityWatcher();
    initPrivateChat();
    import('./versus.js').then(m => m.initVersusInvitesListener());

    document.addEventListener('game:start-new', () => {
        if (currentGameType === 'advanced') {
            initAdvancedGame();
        } else {
            initGame();
        }
    });


    // Tutorial Logic
    const tutorialModal = document.getElementById('tutorial-modal');
    const tutorialOpenBtn = document.getElementById('tutorial-open-btn');
    const closeTutorialBtn = document.getElementById('close-tutorial-btn');
    const tutorialGotItBtn = document.getElementById('tutorial-got-it-btn');

    const openTutorial = () => { if (tutorialModal) tutorialModal.classList.remove('hidden'); };
    const closeTutorial = () => { if (tutorialModal) tutorialModal.classList.add('hidden'); };

    if (tutorialOpenBtn) tutorialOpenBtn.addEventListener('click', openTutorial);
    if (closeTutorialBtn) closeTutorialBtn.addEventListener('click', closeTutorial);
    if (tutorialGotItBtn) tutorialGotItBtn.addEventListener('click', closeTutorial);

    // Show tutorial on login if not shown this session
    if (!sessionStorage.getItem('tutorial_shown')) {
        sessionStorage.setItem('tutorial_shown', 'true');
        openTutorial();
    }

    // Tastenanschläge abfangen (Entf = Moduswechsel, Esc = Profil / Zuschauen schließen)
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Delete') { e.preventDefault(); toggleTheme(); }
        if (e.key === 'Escape') {
            closeProfileOverlay();
            closeSpectatorModal();
            closeTutorial();
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
    
    if (window.updateCreditProgressBars) window.updateCreditProgressBars();
}

function setupAdminUI() {
    showView('admin-view');
    initAdminPanel(); 
}

window.playRankSound = function() {
    try {
        const actx = window.getSharedAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, actx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.1);
    } catch(e) {}
};

window.playFinishListSound = function() {
    try {
        const actx = window.getSharedAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, actx.currentTime + 0.15);
        osc.frequency.setValueAtTime(600, actx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1000, actx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.05, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.4);
    } catch(e) {}
};

window.playVersusVictorySound = function() {
    try {
        const actx = window.getSharedAudioContext();
        const playTone = (freq, time, duration) => {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.05);
            osc.connect(gain); gain.connect(actx.destination);
            osc.start(time); osc.stop(time + duration);
        };
        const now = actx.currentTime;
        playTone(523.25, now, 0.15); // C5
        playTone(659.25, now + 0.15, 0.15); // E5
        playTone(783.99, now + 0.3, 0.15); // G5
        playTone(1046.50, now + 0.45, 0.4); // C6
    } catch(e) {}
};

window.playStarWars8BitTheme = function() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const actx = window.getSharedAudioContext();
        
        function playTone(freq, time, duration) {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'square'; // 8-bit sound style
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.05);
            
            osc.connect(gain);
            gain.connect(actx.destination);
            
            osc.start(time);
            osc.stop(time + duration);
        }
        
        const now = actx.currentTime;
        // Star Wars Main Theme
        const g4 = 392.00, c5 = 523.25, d5 = 587.33, e5 = 659.25, f5 = 698.46, g5 = 783.99, c6 = 1046.50;
        const melody = [
            [g4, 0.0, 0.15], [g4, 0.2, 0.15], [g4, 0.4, 0.15],
            [c5, 0.6, 0.6], [g5, 1.4, 0.6],
            [f5, 2.2, 0.15], [e5, 2.4, 0.15], [d5, 2.6, 0.15],
            [c6, 2.8, 0.6], [g5, 3.6, 0.4],
            [f5, 4.2, 0.15], [e5, 4.4, 0.15], [d5, 4.6, 0.15],
            [c6, 4.8, 0.6], [g5, 5.6, 0.4],
            [f5, 6.2, 0.15], [e5, 6.4, 0.15], [f5, 6.6, 0.15],
            [d5, 6.8, 1.0]
        ];
        
        melody.forEach(([freq, time, dur]) => {
            playTone(freq, now + time, dur);
        });

    } catch(e) {
        console.warn("Audio play blocked", e);
    }
};

window.showUnlockNotification = function(type, desc) {
    const notif = document.getElementById('unlock-notification');
    let titleText = 'Titel freigeschaltet!';
    if (type === 'theme') titleText = 'Farbschema freigeschaltet!';
    else if (type === 'credits') titleText = 'Belohnung erhalten!';
    else if (type === 'error') titleText = 'Achtung!';
    
    document.getElementById('unlock-title').textContent = titleText;
    document.getElementById('unlock-desc').textContent = desc;
    
    if (type === 'error') {
        notif.style.background = 'linear-gradient(135deg, rgba(150,0,0,0.95), rgba(80,0,0,0.95))';
        notif.style.border = '2px solid #ff4757';
    } else {
        notif.style.background = 'rgba(20, 24, 34, 0.95)';
        notif.style.border = '2px solid #ffd700';
    }
    
    // 8-bit Soundeffekt abspielen
    if (type !== 'error' && window.playStarWars8BitTheme) {
        window.playStarWars8BitTheme();
    }

    notif.classList.remove('hidden');
    // Force reflow
    void notif.offsetWidth;
    notif.classList.add('show');
    
    const closeBtn = document.getElementById('close-unlock-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            notif.classList.remove('show');
            setTimeout(() => notif.classList.add('hidden'), 500);
        };
    }
}

window.updateCreditProgressBars = function() {
    const container = document.getElementById('credit-progress-bars-container');
    if (!container) return;
    
    // Check if we are in classic mode and the category container is visible
    const catContainer = document.getElementById('category-selector-container');
    if (catContainer && catContainer.classList.contains('hidden')) {
        container.innerHTML = '';
        return;
    }

    // Try to get user from global object or localstorage
    let user = null;
    try {
        const stored = localStorage.getItem('ranking_game_active_user');
        if (stored) user = JSON.parse(stored);
    } catch(e) {}
    if (!user) return;

    // wir brauchen das aus mode-state.js
    const mode = window.currentModeForBars || (document.body.classList.contains('alt-theme') ? 'waifu' : 'starwars');
    
    const categories = [
        { id: 'normal', name: 'Expanded Universe', color: '#2ed573' },
        { id: 'klon', name: 'Nur Klone', color: '#3498db' },
        { id: 'peak', name: 'Peak Ranking', color: '#e67e22' },
        { id: 'vehicle', name: 'Fahrzeuge', color: '#9b59b6' },
        { id: 'hardcore', name: 'Hardcore Peak', color: '#e74c3c' }
    ];

    let html = '<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase;">Daily Booster-Credits Limit</span></div>';
    
    categories.forEach(cat => {
        const field = `credits_earned_${mode}_${cat.id}`;
        const earned = user[field] || 0;
        const percent = Math.min(100, (earned / 20) * 100);
        
        const displayEarned = earned > 20 ? earned : `${earned}/20`;
        html += `
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:120px; font-size:0.75rem; color:#e2e8f0; text-align:right;">${cat.name}</div>
                <div style="flex:1; height:8px; background:rgba(0,0,0,0.5); border-radius:4px; border:1px solid #333; overflow:hidden;">
                    <div style="width:${percent}%; height:100%; background:${cat.color}; transition:width 0.3s; box-shadow: 0 0 5px ${cat.color};"></div>
                </div>
                <div style="width:30px; font-size:0.7rem; color:#94a3b8; text-align:left;">${displayEarned}</div>
            </div>
        `;
    });

    container.innerHTML = html;
};

bootApp();


document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".profile-overlay:not(.hidden), .modal:not(.hidden)").forEach(modal => {
            modal.classList.add("hidden");
        });
    }
});
