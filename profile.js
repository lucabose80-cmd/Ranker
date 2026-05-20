// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { currentMode } from './mode-state.js';
import { TITLES } from './titles.js';

export function renderAvatarSelection() {
    const user = getCurrentUser();
    const grid = document.getElementById('avatar-grid');
    if (!grid || !user) return;
    
    grid.innerHTML = '';
    // Ziehe den passenden Avatar je nach Modus
    const currentAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;

    const sortedChars = [...activeCharacterDatabase].sort((a,b) => a.name.localeCompare(b.name));
    
    sortedChars.forEach(char => {
        const card = document.createElement('div');
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
}

export function initProfile() {
    const user = getCurrentUser();
    if(!user) return;
    document.getElementById('profile-displayname').value = user.displayName;
    renderAvatarSelection();
    
    const gamesPlayed = currentMode === 'starwars' ? (user.gamesPlayed_starwars || 0) : (user.gamesPlayed_waifu || 0);
    document.getElementById('profile-games-count').textContent = gamesPlayed;
    
    // Setup Tabs
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#fff';
                b.style.borderColor = '#333';
            });
            btn.classList.add('active');
            btn.style.background = ''; // reset to default rank-btn style
            btn.style.color = '';
            btn.style.borderColor = '';
            
            const target = btn.dataset.tab;
            document.getElementById('profile-avatar-panel').classList.toggle('hidden', target !== 'avatar');
            document.getElementById('profile-title-panel').classList.toggle('hidden', target !== 'title');
        });
    });

    renderTitleSelection(user, gamesPlayed);

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        
        const res = await updateUserProfile(newName, newPass || null, undefined);
        
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        feedback.textContent = res.success ? "Daten gespeichert!" : "Fehler: " + res.message;
        feedback.style.color = res.success ? "#2ed573" : "#ff4757";
        if(res.success) {
            document.getElementById('player-greeting').textContent = newName;
            updateTopbarAvatarElement(res.user);
        }
    });
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