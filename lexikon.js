// lexikon.js
import { activeCharacterDatabase } from './theme.js';
import { getCurrentUser, clearNewlyDiscovered } from './auth.js';

const TAG_LABELS = {
    jedi:        { label: '⚔️ Jedi',        color: '#3b82f6' },
    sith:        { label: '🔴 Sith',         color: '#dc2626' },
    klon:        { label: '🪖 Klone',        color: '#64748b' },
    droide:      { label: '🤖 Droiden',      color: '#6b7280' },
    separatist:  { label: '☠️ Separatisten', color: '#7c3aed' },
    rebell:      { label: '✊ Rebellen',      color: '#16a34a' },
    mandalorian: { label: '🪬 Mandalorianer', color: '#b45309' },
    schmuggel:   { label: '🃏 Schmuggler',    color: '#ca8a04' },
    sonstige:    { label: '🌌 Sonstige',      color: '#555' }
};

let currentView = 'all'; // 'all' | 'tags'

export function renderLexikon() {
    const grid = document.getElementById('lexikon-grid');
    grid.innerHTML = '';

    const user = getCurrentUser();
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
            card.innerHTML = `<div style="width:100%; height:75%; display:flex; align-items:center; justify-content:center; font-size:3rem; color:#555;">?</div><span>???</span>`;
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
    const tagOrder = ['jedi', 'sith', 'klon', 'droide', 'separatist', 'rebell', 'mandalorian', 'schmuggel', 'sonstige'];
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
                card.innerHTML = `<div style="width:100%; height:75%; display:flex; align-items:center; justify-content:center; font-size:3rem; color:#555;">?</div><span>???</span>`;
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