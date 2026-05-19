// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { activeCharacterDatabase, currentMode } from './theme.js';

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
}

export function initProfile() {
    const user = getCurrentUser();
    if(!user) return;
    document.getElementById('profile-displayname').value = user.displayName;
    renderAvatarSelection();

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        const res = await updateUserProfile(newName, newPass || null, undefined);
        
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        feedback.textContent = res.success ? "Daten gespeichert!" : "Fehler: " + res.message;
        feedback.style.color = res.success ? "#2ed573" : "#ff4757";
        if(res.success) document.getElementById('player-greeting').textContent = newName;
    });
}