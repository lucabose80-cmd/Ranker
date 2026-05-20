// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { currentMode } from './mode-state.js';
import { TITLES } from './titles.js';
import { THEMES } from './themes.js';

export function renderAvatarSelection() {
    const user = getCurrentUser();
    const grid = document.getElementById('avatar-grid');
    if (!grid || !user) return;
    
    grid.innerHTML = '';
    const currentAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;

    const sortedChars = [...activeCharacterDatabase].sort((a,b) => a.name.localeCompare(b.name));
    
    sortedChars.forEach(char => {
        const isDiscovered = user.discovered && user.discovered.includes(char.name);
        const card = document.createElement('div');
        
        if (isDiscovered) {
            card.className = `lexikon-card avatar-card ${currentAvatar === char.img ? 'selected' : ''}`;
            card.innerHTML = `<img src="${char.img}"><span>${char.name}</span>`;
            
            card.addEventListener('click', async () => {
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const res = await updateUserProfile(user.displayName, null, char.img);
                if(res.success) {
                    updateTopbarAvatarElement(res.user);
                }
            });
        } else {
            card.className = `lexikon-card avatar-card locked`;
            card.style.opacity = '0.5';
            card.innerHTML = `<div class="lexikon-card-placeholder">?</div><span>???</span>`;
            card.title = "Noch nicht entdeckt!";
        }
        grid.appendChild(card);
    });
}

export function updateTopbarAvatarElement(user) {
    const topAvatar = document.getElementById('topbar-avatar');
    const avatarToUse = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
    
    if(avatarToUse) {
        topAvatar.src = avatarToUse;
        topAvatar.classList.remove('hidden');
    } else {
        topAvatar.classList.add('hidden');
    }
    
    // Title in Topbar aktualisieren
    const topTitle = document.getElementById('player-title');
    const activeTitle = currentMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
    
    if (activeTitle) {
        topTitle.textContent = activeTitle;
        topTitle.style.display = 'block';
    } else {
        topTitle.style.display = 'none';
    }

    // Apply active color theme
    applyColorTheme(user);
}

export function applyColorTheme(user) {
    // Remove ALL possible theme classes from ALL modes to avoid leakage between modes
    Object.values(THEMES).flat().forEach(t => {
        if (t.cssClass) document.body.classList.remove(t.cssClass);
    });

    const activeThemeId = currentMode === 'starwars' ? user.activeTheme_starwars : user.activeTheme_waifu;
    if (activeThemeId) {
        const themesForMode = THEMES[currentMode] || [];
        const themeObj = themesForMode.find(t => t.id === activeThemeId);
        if (themeObj && themeObj.cssClass) {
            document.body.classList.add(themeObj.cssClass);
        }
    }
}

export function initProfile() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById('profile-displayname').value = user.displayName;

    // Setup Tabs (nur einmal binden)
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            document.getElementById('profile-avatar-panel').classList.toggle('hidden', target !== 'avatar');
            document.getElementById('profile-title-panel').classList.toggle('hidden', target !== 'title');
            document.getElementById('profile-theme-panel').classList.toggle('hidden', target !== 'theme');
        });
    });

    const handleProfileSave = async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        const res = await updateUserProfile(newName, newPass || null, undefined);
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        feedback.textContent = res.success ? "Daten gespeichert!" : "Fehler: " + res.message;
        feedback.style.color = res.success ? "#2ed573" : "#ff4757";
        if (res.success) {
            document.getElementById('player-greeting').textContent = newName;
            updateTopbarAvatarElement(res.user);
        }
    };

    document.getElementById('save-profile-btn').addEventListener('click', handleProfileSave);
    document.getElementById('profile-displayname').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleProfileSave(); });
    document.getElementById('profile-password').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleProfileSave(); });

    refreshProfileContent();
}

// Wird jedes Mal aufgerufen wenn das Profil geöffnet wird oder der Modus wechselt
export async function refreshProfileContent() {
    const { refreshCurrentUser } = await import('./auth.js');
    const user = await refreshCurrentUser();
    if (!user) return;

    renderAvatarSelection();

    const gamesPlayed = currentMode === 'starwars'
        ? (user.gamesPlayed_starwars || 0)
        : (user.gamesPlayed_waifu || 0);
    const el = document.getElementById('profile-games-count');
    if (el) el.textContent = gamesPlayed;

    renderTitleSelection(user, gamesPlayed);
    renderThemeSelection(user);
}

function renderTitleSelection(user, gamesPlayed) {
    const grid = document.getElementById('title-grid');
    if (!grid || !user) return;
    grid.innerHTML = '';
    
    const availableTitles = TITLES[currentMode] || [];
    const activeTitle = currentMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
    
    availableTitles.forEach(t => {
        const isLocked = gamesPlayed < t.required;
        const card = document.createElement('div');
        card.className = `title-card ${activeTitle === t.name ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="title-card-name">${isLocked ? '🔒 ' + t.name : t.name}</div>
            <div class="title-card-req">${isLocked ? `Benötigt ${t.required} Spiele` : 'Freigeschaltet'}</div>
        `;
        
        if (!isLocked) {
            card.addEventListener('click', async () => {
                document.querySelectorAll('.title-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const res = await updateUserProfile(user.displayName, null, null, t.name);
                if(res.success) {
                    updateTopbarAvatarElement(res.user);
                }
            });
        }
        
        grid.appendChild(card);
    });
}

function isThemeUnlocked(theme, user) {
    if (!theme.condition) return true;
    const { type, tag } = theme.condition;
    if (type === 'tag_full_team') {
        const unlockedThemes = user.unlocked_themes_starwars || [];
        return unlockedThemes.includes(theme.id);
    }
    return false;
}

function renderThemeSelection(user) {
    const grid = document.getElementById('theme-grid');
    if (!grid || !user) return;
    grid.innerHTML = '';

    const availableThemes = THEMES[currentMode] || [];
    const activeThemeId = currentMode === 'starwars' ? user.activeTheme_starwars : user.activeTheme_waifu;

    availableThemes.forEach(t => {
        const unlocked = isThemeUnlocked(t, user);
        const isSelected = activeThemeId === t.id || (!activeThemeId && t.id.endsWith('_default'));
        
        const card = document.createElement('div');
        card.className = `title-card ${isSelected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`;
        card.style.borderColor = unlocked && isSelected ? t.preview : '';

        let reqText = '';
        if (!unlocked && t.condition) {
            const { type, tag } = t.condition;
            if (type === 'tag_full_team') {
                reqText = `Ranke 5 ${tag.charAt(0).toUpperCase() + tag.slice(1)} im selben Spiel`;
            }
        } else if (unlocked) {
            reqText = 'Freigeschaltet';
        }

        card.innerHTML = `
            <div style="width:30px; height:30px; border-radius:50%; background:${t.preview}; margin-bottom:8px; border:2px solid rgba(255,255,255,0.2);"></div>
            <div class="title-card-name" style="color:${t.preview}">${!unlocked ? '🔒 ' : ''}${t.name}</div>
            <div class="title-card-req">${reqText}</div>
        `;

        if (unlocked) {
            card.addEventListener('click', async () => {
                document.querySelectorAll('#theme-grid .title-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const res = await updateUserProfile(user.displayName, null, null, null, t.id);
                if (res.success) {
                    applyColorTheme(res.user);
                }
            });
        }

        grid.appendChild(card);
    });
}