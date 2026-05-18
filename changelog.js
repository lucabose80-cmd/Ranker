// changelog.js

const patchNotes = [
    {
        version: "v2.0",
        title: "Server Heartbeat Update",
        changes: [
            "Echtes Online-System: Spieler verschwinden nach 45s Inaktivität.",
            "Live-Games sind nun synchronisiert und tatsächlich zuschau-bar.",
            "Ghost-Games Bereinigung im Admin-Panel eingebaut."
        ]
    },
    {
        version: "v1.9",
        title: "Admin Erweiterung",
        changes: [
            "Admin kann nun User und sich selbst gezielt zurücksetzen."
        ]
    },
    {
        version: "v1.8",
        title: "Developer Modus",
        changes: [
            "Neuer Entwickler-Modus im Admin-Bereich.",
            "Manuelle Auswahl von 5 Charakteren zum Testen von Themes.",
            "Fortschritt ist im Dev-Modus deaktiviert."
        ]
    },
    {
        version: "v1.2",
        title: "The Reveal Update",
        changes: [
            "Feature: Charakternamen werden am Ende des Spiels enthüllt.",
            "Feature: Großes neues Rating-UI am Ende des Spiels (1-10)."
        ]
    }
];

export function initChangelog() {
    const modalHTML = `
        <div id="changelog-modal" class="modal hidden">
            <div class="modal-content updates-content">
                <span id="close-modal" class="close-btn">&times;</span>
                <h2 class="updates-main-title">UPDATES & CHANGELOG</h2>
                <hr class="updates-divider">
                
                <div class="updates-list">
                    ${patchNotes.map(patch => `
                        <div class="update-card">
                            <h3 class="update-card-title">
                                <span class="version-badge">${patch.version}</span> ${patch.title}
                            </h3>
                            <ul>
                                ${patch.changes.map(change => `<li>${change}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const changelogBtn = document.getElementById('changelog-open-btn');
    const changelogModal = document.getElementById('changelog-modal');
    const closeModalBtn = document.getElementById('close-modal');

    changelogBtn.addEventListener('click', () => changelogModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => changelogModal.classList.add('hidden'));

    window.addEventListener('click', (e) => {
        if (e.target === changelogModal) changelogModal.classList.add('hidden');
    });
}