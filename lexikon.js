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
    schmuggel:       { label: '🃏 Schmuggler',            color: '#ca8a04' },
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
    heiss:           { label: '🔥 Heiße Waifus',         color: '#f43f5e' },
    anime:           { label: '🌸 Anime',                 color: '#f472b6' },
    sonstige:        { label: '🌌 Sonstige',              color: '#555' }
};

let currentView = 'all'; // 'all' | 'tags'

export async function renderLexikon() {
    const grid = document.getElementById('lexikon-grid');
    grid.innerHTML = '';

    const { refreshCurrentUser } = await import('./auth.js');
    const user = await refreshCurrentUser();
    const discoveredList = user && user.discovered ? user.discovered : [];

    if (currentView === 'all') {
        _renderAll(grid, user, discoveredList);
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

    const sortedChars = [...activeCharacterDatabase].sort((a, b) => a.name.localeCompare(b.name));
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
        'mandalorian', 'kopfgeldjäger', 'unterwelt', 'hutte', 'pirat', 'schmuggel',
        'imperium', 'erste_ordnung', 'separatist', 'rebell', 'widerstand', 'senat',
        'droide', 'monster', 'redet_nicht', 'videospiel', 'heiss', 'anime', 'sonstige'
    ];
    const newlyDiscovered = user && user.newlyDiscovered ? user.newlyDiscovered : [];

    tagOrder.forEach(tag => {
        if (!tagMap[tag]) return;
        const info = TAG_LABELS[tag] || { label: tag, color: '#888' };

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
            ">${info.label} (${tagMap[tag].length})</h3>
        `;

        const subGrid = document.createElement('div');
        subGrid.className = 'lexikon-grid';
        subGrid.style.marginTop = '0';

        tagMap[tag].sort((a, b) => a.name.localeCompare(b.name)).forEach(char => {
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
}