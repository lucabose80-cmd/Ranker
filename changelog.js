// changelog.js
import { patchNotesStarWars } from './changelog-starwars.js';
import { futureIdeas } from './roadmap.js';

// Diese Funktion wird von main.js importiert
export function initChangelog() {
    console.log("Changelog initialisiert");
}

// Diese Funktion wird vom HTML-Button aufgerufen
export function switchChangelog(tab) {
    const container = document.getElementById('changelog-content');
    if (!container) return;
    container.innerHTML = '';

    if (tab === 'roadmap') {
        container.innerHTML = '<h3>Geplante Features</h3>';
        futureIdeas.forEach(idea => {
            container.innerHTML += `
                <div class="roadmap-item">
                    <strong>${idea.title}</strong> 
                    <span class="status-tag">${idea.status}</span>
                    <p>${idea.desc}</p>
                </div>
            `;
        });
    } else {
        container.innerHTML = '<h3>Patch Notes</h3>';
        patchNotesStarWars.forEach(note => {
            container.innerHTML += `
                <div class="patch-note">
                    <strong>${note.version} - ${note.title}</strong>
                    <ul>${note.changes.map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
            `;
        });
    }
}