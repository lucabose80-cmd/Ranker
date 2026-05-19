// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { starWarsCharacters } from './data-starwars.js';
import { waifuCharacters } from './data-waifu.js';

export function initProfile() {
    const user = getCurrentUser();
    if(!user) return;

    document.getElementById('profile-displayname').value = user.displayName || user.username;
    
    // Grid mit allen Charakteren beider Universen füllen
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';
    const allChars = [...starWarsCharacters, ...waifuCharacters].sort((a,b) => a.name.localeCompare(b.name));
    
    let selectedAvatarPath = user.avatar;

    allChars.forEach(char => {
        const card = document.createElement('div');
        card.className = `lexikon-card avatar-card ${user.avatar === char.img ? 'selected' : ''}`;
        card.innerHTML = `<img src="${char.img}"><span>${char.name}</span>`;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedAvatarPath = char.img;
        });
        grid.appendChild(card);
    });

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        
        const res = await updateUserProfile(newName, newPass || null, selectedAvatarPath);
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        if(res.success) {
            feedback.textContent = "Profil erfolgreich aktualisiert!";
            feedback.style.color = "#2ed573";
            // Header-Update
            document.getElementById('player-greeting').textContent = `Willkommen, ${res.user.displayName}!`;
            if(res.user.avatar) {
                const topAvatar = document.getElementById('topbar-avatar');
                topAvatar.src = res.user.avatar;
                topAvatar.classList.remove('hidden');
            }
        } else {
            feedback.textContent = "Fehler: " + res.message;
            feedback.style.color = "#ff4757";
        }
    });
}