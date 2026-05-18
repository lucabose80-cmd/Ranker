// changelog.js

const patchNotes = [
    {
        version: "v1.4",
        title: "End-Screen & UI Overhaul",
        changes: [
            "Großes visuelles Upgrade für den End-Screen (Modernes Neon-Glow Design).",
            "Das 1-10 Rating-System nutzt nun große, interaktive Buttons.",
            "Updates-Menü überarbeitet: Neues Pop-up mit Versions-Badges und schicken Dark-Mode-Karten."
        ]
    },
    {
        version: "v1.3",
        title: "The Reveal & Modularisierung",
        changes: [
            "Überraschungseffekt: Charakternamen (???) werden mit einer Animation erst am Ende des Spiels enthüllt.",
            "Spieler können ihre fertige Ranking-Liste am Ende bewerten.",
            "Code-Architektur verbessert: Changelog und Patch Notes wurden in eine eigene Datei ausgelagert."
        ]
    },
    {
        version: "v1.2",
        title: "Sci-Fi Blind Ranking",
        changes: [
            "Neues Sci-Fi Panel-Design in dunklen Blautönen.",
            "Echtes 'Blind Ranking': Es wird immer nur ein Charakter gleichzeitig und ohne Namen gezeigt.",
            "Spielsteuerung komplett überarbeitet: Die Auswahl erfolgt nun über dedizierte 1-5 Buttons im unteren Bereich."
        ]
    },
    {
        version: "v1.1",
        title: "Star Wars Theme",
        changes: [
            "Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum.",
            "Profilbilder für alle Charaktere hinzugefügt.",
            "Drag-and-Drop Mechanik entfernt und durch ein intuitiveres, klickbasiertes System ersetzt."
        ]
    },
    {
        version: "v1.0",
        title: "Initial Release",
        changes: [
            "Grundgerüst des Ranking-Spiels veröffentlicht.",
            "Drag-and-Drop Mechanik mit 5 zufälligen Fantasy-Charakteren aus einem größeren Pool."
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