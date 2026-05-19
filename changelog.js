// changelog.js
import { getCurrentUser, markUpdatesAsRead } from './auth.js';
import { currentMode } from './mode-state.js';
import { roadmapStarWars, roadmapWaifu } from './roadmap.js';

let activeLatestGroupKey = "";
let isModalInitialized = false;
let latestVersionString = "";

// Extrahiert den Gruppen-Key aus einer Versionsnummer (z.B. "v2.2.1" -> "v2.2")
function getGroupKey(version) {
    const parts = version.replace('v', '').split('.');
    return `v${parts[0]}.${parts[1]}`;
}

// Gruppiert Versionen nach Major.Minor (z.B. v2.2 und v2.2.1 -> eine Gruppe)
function groupVersions(data) {
    const groups = {};
    const order = [];

    data.forEach(patch => {
        const gk = getGroupKey(patch.version);
        const isPatch = patch.version.replace('v', '').split('.').length > 2;

        if (!groups[gk]) {
            groups[gk] = { key: gk, main: null, patches: [] };
            order.push(gk);
        }

        if (isPatch) {
            groups[gk].patches.unshift(patch);
        } else {
            groups[gk].main = patch;
        }
    });

    return order.map(k => groups[k]);
}

export function initChangelog() {
    const btn = document.getElementById('changelog-open-btn');

    if (!document.getElementById('changelog-modal')) {
        const modal = document.createElement('div');
        modal.id = 'changelog-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="updates-content">
                <button id="close-changelog-btn" class="close-btn">✕</button>
                <h2 class="updates-main-title">UPDATES</h2>
                <div class="changelog-tabs">
                    <button class="changelog-tab active" data-tab="patchnotes">📋 Patch Notes</button>
                    <button class="changelog-tab" data-tab="roadmap">🗺️ Roadmap</button>
                </div>
                <hr class="updates-divider">
                <div id="changelog-patchnotes-panel"></div>
                <div id="changelog-roadmap-panel" class="hidden"></div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-changelog-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });

        modal.querySelectorAll('.changelog-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.changelog-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                document.getElementById('changelog-patchnotes-panel').classList.toggle('hidden', target !== 'patchnotes');
                document.getElementById('changelog-roadmap-panel').classList.toggle('hidden', target !== 'roadmap');
            });
        });
    }

    if (!isModalInitialized) {
        btn.addEventListener('click', () => {
            document.getElementById('changelog-modal').classList.remove('hidden');
            btn.classList.remove('text-gold-glow');
            if (latestVersionString) {
                markUpdatesAsRead(currentMode, latestVersionString);
            }
        });
        isModalInitialized = true;
    }
}

export function updateChangelogContent(changelogData) {
    const patchPanel = document.getElementById('changelog-patchnotes-panel');
    const roadmapPanel = document.getElementById('changelog-roadmap-panel');
    if (!patchPanel) return;

    const grouped = groupVersions(changelogData);
    activeLatestGroupKey = grouped[0]?.key || "";
    latestVersionString = changelogData[0]?.version || "";

    // --- Patch Notes rendern ---
    patchPanel.innerHTML = grouped.map((group, idx) => {
        const main = group.main;
        const patches = group.patches;

        const mainChangesHtml = main
            ? `<ul>${main.changes.map(c => `<li>${c}</li>`).join('')}</ul>`
            : '';

        const patchesHtml = patches.length > 0 ? `
            <button class="patch-accordion-btn">🔧 ${patches.length} Hotfix${patches.length > 1 ? 'es' : ''} anzeigen ▾</button>
            <div class="patch-accordion-content hidden">
                ${patches.map(p => `
                    <div class="patch-entry">
                        <div class="patch-entry-header">
                            <span class="version-badge version-badge-patch">${p.version}</span>
                            <span class="patch-entry-title-text">${p.title}</span>
                        </div>
                        <ul>${p.changes.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="update-card ${idx === 0 ? 'update-card-latest' : ''}">
                <h3 class="update-card-title">
                    <span class="version-badge">${group.key}</span>
                    <span>${main?.title || ''}</span>
                    ${idx === 0 ? '<span class="latest-badge">AKTUELL</span>' : ''}
                </h3>
                ${mainChangesHtml}
                ${patchesHtml}
            </div>
        `;
    }).join('');

    // Accordion-Logik anheften
    patchPanel.querySelectorAll('.patch-accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const isOpen = !content.classList.contains('hidden');
            content.classList.toggle('hidden');
            if (isOpen) {
                btn.textContent = btn.textContent.replace('verstecken ▴', 'anzeigen ▾');
            } else {
                btn.textContent = btn.textContent.replace('anzeigen ▾', 'verstecken ▴');
            }
        });
    });

    // --- Roadmap rendern ---
    if (roadmapPanel) {
        const roadmapData = currentMode === 'starwars' ? roadmapStarWars : roadmapWaifu;
        roadmapPanel.innerHTML = roadmapData.map(section => `
            <div class="roadmap-section">
                <h3 class="roadmap-section-title" style="color: ${section.color}">${section.category}</h3>
                <div class="roadmap-items">
                    ${section.items.map(item => `
                        <div class="roadmap-item" style="border-left-color: ${section.color}">
                            <div class="roadmap-item-title">${item.title}</div>
                            <div class="roadmap-item-desc">${item.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // --- Glow-Logik ---
    const user = getCurrentUser();
    const btn = document.getElementById('changelog-open-btn');
    if (user && user.role !== 'admin') {
        const field = currentMode === 'starwars' ? 'lastReadVersionStarWars' : 'lastReadVersionWaifu';
        const lastRead = user[field] || '';

        if (lastRead !== latestVersionString) {
            btn.classList.add('text-gold-glow');
        } else {
            btn.classList.remove('text-gold-glow');
        }
    }
}