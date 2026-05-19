// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';

let selectedAvatarPath = "";

export function renderAvatarSelection() {
    const user = getCurrentUser();
    const grid = document.getElementById('avatar-grid');
    if (!grid || !user) return;
    
    grid.innerHTML = '';
    selectedAvatarPath = user.avatar;

    // Nur Charaktere des aktiven Universums anzeigen
    const sortedChars = [...activeCharacterDatabase].sort((a,b) => a.name.localeCompare(b.name));
    
    sortedChars.forEach(char => {
        const card = document.createElement('div');
        card.className = `lexikon-card avatar-card ${selectedAvatarPath === char.img ? 'selected' : ''}`;
        card.innerHTML = `<img src="${char.img}"><span>${char.name}</span>`;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedAvatarPath = char.img;
        });
        grid.appendChild(card);
    });
}

export function initProfile() {
    const user = getCurrentUser();
    if(!user) return;

    document.getElementById('profile-displayname').value = user.displayName;
    renderAvatarSelection();

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        
        const res = await updateUserProfile(newName, newPass || null, selectedAvatarPath);
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        if(res.success) {
            feedback.textContent = "Profil erfolgreich aktualisiert!";
            feedback.style.color = "#2ed573";
            document.getElementById('player-greeting').textContent = res.user.displayName;
            if(res.user.avatar) {
                document.getElementById('topbar-avatar').src = res.user.avatar;
            }
        } else {
            feedback.textContent = "Fehler: " + res.message;
            feedback.style.color = "#ff4757";
        }
    });
}