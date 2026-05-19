export function initChangelog() {
    const modalHTML = `
        <div id="changelog-modal" class="modal hidden">
            <div class="modal-content updates-content">
                <span id="close-modal" class="close-btn">&times;</span>
                <h2 class="updates-main-title">UPDATES & CHANGELOG</h2>
                <hr class="updates-divider">
                <div id="updates-list-container" class="updates-list"></div>
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

export function updateChangelogContent(patchNotesArray) {
    const container = document.getElementById('updates-list-container');
    container.innerHTML = patchNotesArray.map(patch => `
        <div class="update-card">
            <h3 class="update-card-title">
                <span class="version-badge">${patch.version}</span> ${patch.title}
            </h3>
            <ul>
                ${patch.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}