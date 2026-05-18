// changelog.js

// Hier pflegst du in Zukunft einfach deine Updates ein
const patchNotes = [
    {
        version: "v1.2 - The Reveal Update",
        changes: [
            "Feature: Charakternamen werden am Ende des Spiels enthüllt.",
            "Feature: Spieler können ihre finale Liste mit 1 bis 10 bewerten.",
            "Code: Changelog komplett modularisiert und ausgelagert."
        ]
    },
    {
        version: "v1.1 - Sci-Fi UI Update",
        changes: [
            "Design: Komplettes Rework im Neon-Sci-Fi-Look.",
            "Mechanik: Steuerung auf Buttons im unteren Bereich umgestellt.",
            "Mechanik: 'Blind Ranking' eingeführt (Namen versteckt)."
        ]
    },
    {
        version: "v1.0 - Initial Release",
        changes: [
            "Grundgerüst des Spiels mit Drag-and-Drop.",
            "5 zufällige Charaktere aus dem Pool wählbar."
        ]
    }
];

// Diese Funktion exportieren wir, um sie in der main.js zu starten
export function initChangelog() {
    // 1. Das HTML für das Modal dynamisch generieren
    const modalHTML = `
        <div id="changelog-modal" class="modal hidden">
            <div class="modal-content">
                <span id="close-modal" class="close-btn">&times;</span>
                <h2>PATCH NOTES</h2>
                ${patchNotes.map(patch => `
                    <div class="patch-entry">
                        <h3>${patch.version}</h3>
                        <ul>
                            ${patch.changes.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 2. Das generierte HTML an das Ende des <body> anfügen
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Event Listener für das Modal aktivieren
    const changelogBtn = document.getElementById('changelog-open-btn');
    const changelogModal = document.getElementById('changelog-modal');
    const closeModalBtn = document.getElementById('close-modal');

    changelogBtn.addEventListener('click', () => changelogModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => changelogModal.classList.add('hidden'));

    // Schließen, wenn man außerhalb der Box klickt
    window.addEventListener('click', (e) => {
        if (e.target === changelogModal) changelogModal.classList.add('hidden');
    });
}