// changelog.js
import { getCurrentUser, markUpdatesAsRead } from './auth.js';
import { currentMode } from './theme.js';

let activeLatestVersion = "";
let isModalInitialized = false;

export function initChangelog() {
    const btn = document.getElementById('changelog-open-btn');

    // Das Modal (Pop-up Fenster) dynamisch aufbauen, falls es nicht existiert
    if (!document.getElementById('changelog-modal')) {
        const modal = document.createElement('div');
        modal.id = 'changelog-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="updates-content">
                <button id="close-changelog-btn" class="close-btn">✕</button>
                <h2 class="updates-main-title">PATCH NOTES</h2>
                <hr class="updates-divider">
                <div id="changelog-list"></div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-changelog-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Button Klick-Logik
    if (!isModalInitialized) {
        btn.addEventListener('click', () => {
            document.getElementById('changelog-modal').classList.remove('hidden');
            
            // Wenn man klickt, wird das Leuchten entfernt und in der Cloud als "gelesen" markiert
            btn.classList.remove('text-gold-glow');
            markUpdatesAsRead(currentMode, activeLatestVersion);
        });
        isModalInitialized = true;
    }
}

export function updateChangelogContent(changelogData) {
    const list = document.getElementById('changelog-list');
    if(!list) return;

    list.innerHTML = '';
    
    // Wir nehmen an, dass der erste Eintrag im Array immer das neuste Update ist
    activeLatestVersion = changelogData[0].version; 

    changelogData.forEach(patch => {
        let changesHtml = patch.changes.map(c => `<li>${c}</li>`).join('');
        list.innerHTML += `
            <div class="update-card">
                <h3 class="update-card-title">
                    <span class="version-badge">${patch.version}</span> ${patch.title}
                </h3>
                <ul>${changesHtml}</ul>
            </div>
        `;
    });

    // Prüfen ob der Button leuchten soll
    const user = getCurrentUser();
    const btn = document.getElementById('changelog-open-btn');

    if (user && user.role !== 'admin') {
        const field = currentMode === 'starwars' ? 'lastReadVersionStarWars' : 'lastReadVersionWaifu';
        const lastRead = user[field];

        // Hat der Spieler das neuste Update noch nicht gelesen? -> Leuchten an!
        if (lastRead !== activeLatestVersion) {
            btn.classList.add('text-gold-glow');
        } else {
            btn.classList.remove('text-gold-glow');
        }
    }
}