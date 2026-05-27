// lexikon.js
import { activeCharacterDatabase } from './theme.js';
import { getCurrentUser, clearNewlyDiscovered } from './auth.js';

const TAG_LABELS = {
    jedi:            { label: '⚔️ Jedi',                color: '#3b82f6' },
    sith:            { label: '🔴 Sith',                 color: '#dc2626' },
    klon:            { label: '🪖 Klone',                color: '#64748b' },
    droide:          { label: '🤖 Droiden',              color: '#6b7280' },
    separatist:      { label: '☠️ Separatisten',         color: '#7c3aed' },
    rebell:          { label: '✊ Rebellen',              color: '#16a34a' },
    mandalorian:     { label: '🪬 Mandalorianer',        color: '#b45309' },
    death_watch:     { label: '⚔️ Death Watch',          color: '#1e293b' },
    schmuggel:       { label: '🃏 Schmuggler',            color: '#ca8a04' },
    vehicle:         { label: '🚀 Fahrzeuge',             color: '#9ca3af' },
    peak:            { label: '🏔️ Peak Modus',            color: '#fbbf24' },
    kopfgeldjäger:   { label: '🎯 Kopfgeldjäger',         color: '#f59e0b' },
    unterwelt:       { label: '💰 Unterwelt',             color: '#8b5cf6' },
    widerstand:      { label: '⭐ Widerstand',            color: '#f97316' },
    imperium:        { label: '⬛ Imperium',              color: '#1f2937' },
    erste_ordnung:   { label: '🩸 Erste Ordnung',        color: '#991b1b' },
    senat:           { label: '🏛️ Senat / Politiker',     color: '#14b8a6' },
    grau:            { label: '⚪ Graue Machtnutzer',      color: '#a3a3a3' },
    nachtschwester:  { label: '🔮 Nachtschwestern',       color: '#d946ef' },
    dathomir:        { label: '🌑 Dathomir',              color: '#be185d' },
    monster:         { label: '🦖 Monster',               color: '#84cc16' },
    meister:         { label: '🧠 Jedi-Meister',          color: '#60a5fa' },
    padawan:         { label: '🎓 Padawan',               color: '#93c5fd' },
    inquisitor:      { label: '🗡️ Inquisitoren',          color: '#7f1d1d' },
    videospiel:      { label: '🎮 Videospiele',           color: '#8b5cf6' },
    redet_nicht:     { label: '🤐 Redet nicht',           color: '#9ca3af' },
    bad_batch:       { label: '💀 Bad Batch',             color: '#475569' },
    "501st":         { label: '🔵 501st Legion',          color: '#2563eb' },
    "212th":         { label: '🟠 212th Battalion',       color: '#f97316' },
    "104th":         { label: '🐺 104th Battalion',       color: '#64748b' },
    coruscant_guard: { label: '🔴 Coruscant Wache',       color: '#ef4444' },
    captain:         { label: '⭐ Captain',               color: '#eab308' },
    commander:       { label: '⭐⭐ Commander',           color: '#f59e0b' },
    arc:             { label: '⚡ ARC-Trooper',           color: '#3b82f6' },
    soldat:          { label: '🪖 Soldat',                color: '#94a3b8' },
    hutte:           { label: '🐌 Hutten',                color: '#65a30d' },
    pirat:           { label: '🏴‍☠️ Space Piraten',         color: '#b45309' },
    heiss:           { label: '🔥 Hot',         color: '#f43f5e' },
    anime:           { label: '🌸 Anime',                 color: '#f472b6' },
    sonstige:        { label: '🌌 Sonstige',              color: '#555' }
};

let currentView = 'all'; // 'all' | 'tags' | 'peak'
let currentSearchQuery = '';

export async function renderLexikon() {
    const grid = document.getElementById('lexikon-grid');
    grid.innerHTML = '';

    const { refreshCurrentUser } = await import('./auth.js');
    const user = await refreshCurrentUser();
    const discoveredList = user && user.discovered ? user.discovered : [];

    if (currentView === 'all') {
        _renderAll(grid, user, discoveredList);
    } else if (currentView === 'peak') {
        _renderPeak(grid, user, discoveredList);
    } else {
        _renderByTags(grid, user, discoveredList);
    }
    
    if (user && user.newlyDiscovered && user.newlyDiscovered.length > 0) {
        clearNewlyDiscovered();
    }
}

function _renderAll(grid, user, discoveredList) {
    grid.className = 'lexikon-grid';
    grid.removeAttribute('style'); // Wichtig: vollständig entfernen, nicht nur leeren

    const sortedChars = [...activeCharacterDatabase]
        .filter(c => c.name.toLowerCase().includes(currentSearchQuery))
        .sort((a, b) => a.name.localeCompare(b.name));
    const newlyDiscovered = user && user.newlyDiscovered ? user.newlyDiscovered : [];

    sortedChars.forEach(char => {
        const isDiscovered = user && user.role !== 'admin' ? discoveredList.includes(char.name) : true;
        const isNew = newlyDiscovered.includes(char.name);

        const card = document.createElement('div');
        if (isDiscovered) {
            card.className = `lexikon-card ${isNew ? 'gold-glow' : ''}`;
            card.innerHTML = `
                <img src="${char.img}" alt="${char.name}" loading="lazy">
                <span>
                    ${char.name}
                    ${isNew ? '<b style="color:#ffd700; margin-left:5px;" title="Brandneu!">✨</b>' : ''}
                </span>
            `;
            card.style.cursor = 'pointer';
            card.onclick = () => openTagSuggestionModal(char);
        } else {
            card.className = `lexikon-card locked`;
            card.style.opacity = '0.5';
            card.innerHTML = `<div class="lexikon-card-placeholder">?</div><span>???</span>`;
            card.title = "Noch nicht entdeckt!";
        }
        grid.appendChild(card);
    });
}

function _renderPeak(grid, user, discoveredList) {
    grid.className = 'lexikon-grid';
    grid.removeAttribute('style');

    const sortedChars = [...activeCharacterDatabase]
        .filter(c => c.tags && c.tags.includes('peak') && c.name.toLowerCase().includes(currentSearchQuery))
        .sort((a, b) => a.name.localeCompare(b.name));
    const newlyDiscovered = user && user.newlyDiscovered ? user.newlyDiscovered : [];

    sortedChars.forEach(char => {
        const isDiscovered = user && user.role !== 'admin' ? discoveredList.includes(char.name) : true;
        const isNew = newlyDiscovered.includes(char.name);

        const card = document.createElement('div');
        if (isDiscovered) {
            card.className = `lexikon-card ${isNew ? 'gold-glow' : ''}`;
            card.innerHTML = `
                <img src="${char.img}" alt="${char.name}" loading="lazy">
                <span>
                    ${char.name}
                    ${isNew ? '<b style="color:#ffd700; margin-left:5px;" title="Brandneu!">✨</b>' : ''}
                </span>
            `;
            card.style.cursor = 'pointer';
            card.onclick = () => openTagSuggestionModal(char);
        } else {
            card.className = `lexikon-card locked`;
            card.style.opacity = '0.5';
            card.innerHTML = `<div class="lexikon-card-placeholder">?</div><span>???</span>`;
            card.title = "Noch nicht entdeckt!";
        }
        grid.appendChild(card);
    });
}

function _renderByTags(grid, user, discoveredList) {
    grid.className = '';
    grid.style = 'display: flex; flex-direction: column; gap: 30px;';

    // Sammle alle vorhandenen Tags
    const tagMap = {};
    activeCharacterDatabase.forEach(char => {
        const tags = char.tags || ['sonstige'];
        tags.forEach(tag => {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(char);
        });
    });

    // Rendere pro Tag-Gruppe
    const tagOrder = [
        'jedi', 'meister', 'padawan', 'sith', 'inquisitor', 'grau', 'nachtschwester', 'dathomir',
        'klon', '501st', '212th', '104th', 'coruscant_guard', 'bad_batch', 'commander', 'captain', 'arc', 'soldat',
        'mandalorian', 'death_watch', 'kopfgeldjäger', 'unterwelt', 'hutte', 'pirat', 'schmuggel',
        'imperium', 'erste_ordnung', 'separatist', 'rebell', 'widerstand', 'senat',
        'droide', 'monster', 'vehicle', 'redet_nicht', 'videospiel', 'heiss', 'anime', 'sonstige'
    ];
    const newlyDiscovered = user && user.newlyDiscovered ? user.newlyDiscovered : [];

    tagOrder.forEach(tag => {
        if (!tagMap[tag]) return;
        const info = TAG_LABELS[tag] || { label: tag, color: '#888' };

        const labelText = info.label.toLowerCase();
        const matchesFaction = labelText.includes(currentSearchQuery);

        const filteredChars = tagMap[tag].filter(char => {
            return matchesFaction || char.name.toLowerCase().includes(currentSearchQuery);
        });

        if (filteredChars.length === 0) return;

        const section = document.createElement('div');
        section.innerHTML = `
            <h3 class="theme-heading" style="
                color: ${info.color};
                font-size: 0.9rem;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 0 0 12px 0;
                border-bottom: 1px solid ${info.color}44;
                padding-bottom: 8px;
            ">${info.label} (${filteredChars.length})</h3>
        `;

        const subGrid = document.createElement('div');
        subGrid.className = 'lexikon-grid';
        subGrid.style.marginTop = '0';

        filteredChars.sort((a, b) => a.name.localeCompare(b.name)).forEach(char => {
            const isDiscovered = user && user.role !== 'admin' ? discoveredList.includes(char.name) : true;
            const isNew = newlyDiscovered.includes(char.name);

            const card = document.createElement('div');
            if (isDiscovered) {
                card.className = `lexikon-card ${isNew ? 'gold-glow' : ''}`;
                card.innerHTML = `
                    <img src="${char.img}" alt="${char.name}" loading="lazy">
                    <span>
                        ${char.name}
                        ${isNew ? '<b style="color:#ffd700; margin-left:5px;" title="Brandneu!">✨</b>' : ''}
                    </span>
                `;
                card.style.cursor = 'pointer';
                card.onclick = () => openTagSuggestionModal(char);
            } else {
                card.className = `lexikon-card locked`;
                card.style.opacity = '0.5';
                card.innerHTML = `<div class="lexikon-card-placeholder">?</div><span>???</span>`;
                card.title = "Noch nicht entdeckt!";
            }
            subGrid.appendChild(card);
        });

        section.appendChild(subGrid);
        grid.appendChild(section);
    });
}

export function initLexikonTabs() {
    document.querySelectorAll('.lexikon-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lexikon-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderLexikon();
        });
    });

    const searchInput = document.getElementById('lexikon-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase();
            renderLexikon();
        });
    }

    // Tag Suggestion Modal Listeners
    const modal = document.getElementById('tag-suggestion-modal');
    if (modal) {
        document.getElementById('close-tag-suggestion-btn').onclick = () => {
            modal.classList.add('hidden');
        };
        document.getElementById('submit-tag-suggestion-btn').onclick = async () => {
            const input = document.getElementById('tag-suggestion-input').value;
            const charName = document.getElementById('tag-suggestion-name').textContent;
            if (!input.trim()) return alert('Bitte Text eingeben!');
            
            try {
                const { db } = await import('./firebase-config.js');
                const { collection, addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');
                const user = getCurrentUser();
                await addDoc(collection(db, 'suggestions'), {
                    text: `Tag Vorschlag für [${charName}]: ${input}`,
                    type: 'tag',
                    targetMode: 'starwars',
                    author: user ? user.username : 'Anonym',
                    authorDisplay: user ? (user.displayName || user.username) : 'Anonym',
                    timestamp: Timestamp.now(),
                    votes: 1,
                    votedBy: user ? [user.username] : []
                });
                alert('Vorschlag gesendet! Danke!');
                modal.classList.add('hidden');
            } catch (e) {
                console.error(e);
                alert('Fehler beim Senden.');
            }
        };
    }
}

function openTagSuggestionModal(char) {
    const modal = document.getElementById('tag-suggestion-modal');
    if (!modal) return;
    document.getElementById('tag-suggestion-img').src = char.img;
    document.getElementById('tag-suggestion-name').textContent = char.name;
    document.getElementById('tag-suggestion-input').value = '';
    modal.classList.remove('hidden');
}