// changelog.js
import { getCurrentUser, markUpdatesAsRead } from './auth.js';
import { currentMode } from './mode-state.js';
import { roadmapStarWars, roadmapWaifu } from './roadmap.js';

let isModalInitialized = false;
let latestVersionString = '';

// Gruppiert Versionen nach Major.Minor (z.B. v2.8 und v2.8.1 -> eine Gruppe)
function getGroupKey(version) {
    const parts = version.replace('v', '').split('.');
    return `v${parts[0]}.${parts[1]}`;
}

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

// Gibt pro Change-Text ein passendes Icon zurück
function getChangeIcon(text) {
    const t = text.toLowerCase();
    if (t.startsWith('hotfix')) return '🔧';
    if (t.includes('neues feature') || t.includes('feature:')) return '✨';
    if (t.includes('ui-update') || t.includes('ui update') || t.includes('visualisierung')) return '🎨';
    if (t.includes('performance') || t.includes('optimierung') || t.includes('caching')) return '⚡';
    if (t.includes('neues admin') || t.includes('admin')) return '🛡️';
    if (t.includes('qualit') || t.includes('qol')) return '✅';
    return '▸';
}

export function initChangelog() {
    const btn = document.getElementById('changelog-open-btn');

    if (!document.getElementById('changelog-modal')) {
        const modal = document.createElement('div');
        modal.id = 'changelog-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="cl-modal-box">
                <div class="cl-header">
                    <div class="cl-header-left">
                        <span class="cl-logo">📦</span>
                        <div>
                            <div class="cl-title">Patch Notes</div>
                            <div class="cl-subtitle">Star Wars Ranking</div>
                        </div>
                    </div>
                    <button id="close-changelog-btn" class="cl-close-btn">✕</button>
                </div>
                <div class="cl-tabs">
                    <button class="cl-tab active" data-tab="patchnotes">📋 Updates</button>
                    <button class="cl-tab" data-tab="roadmap">🗺️ Roadmap</button>
                </div>
                <div class="cl-body">
                    <div id="changelog-patchnotes-panel"></div>
                    <div id="changelog-roadmap-panel" class="hidden"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-changelog-btn').addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

        modal.querySelectorAll('.cl-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.cl-tab').forEach(t => t.classList.remove('active'));
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
            if (latestVersionString) markUpdatesAsRead(currentMode, latestVersionString);
        });
        isModalInitialized = true;
    }
}

export function updateChangelogContent(changelogData) {
    const patchPanel = document.getElementById('changelog-patchnotes-panel');
    const roadmapPanel = document.getElementById('changelog-roadmap-panel');
    if (!patchPanel) return;

    const grouped = groupVersions(changelogData);
    latestVersionString = changelogData[0]?.version || '';

    // Update the subtitle to reflect current mode
    const sub = document.querySelector('.cl-subtitle');
    if (sub) sub.textContent = currentMode === 'starwars' ? 'Star Wars Ranking' : 'Anime Ranking';

    // Hole letzten Stand aus Profil
    const user = getCurrentUser();
    const readField = currentMode === 'starwars' ? 'lastReadVersionStarWars' : 'lastReadVersionWaifu';
    const lastRead = user ? user[readField] : null;

    // --- Patch Notes rendern ---
    patchPanel.innerHTML = grouped.map((group, idx) => {
        const main = group.main;
        const patches = group.patches;
        
        let isLatest = false;
        if (lastRead) {
            const lastReadIndex = changelogData.findIndex(d => d.version === lastRead);
            if (lastReadIndex === -1) {
                isLatest = idx === 0;
            } else {
                const groupVersions = [main?.version, ...patches.map(p => p.version)].filter(Boolean);
                isLatest = groupVersions.some(v => {
                    const vi = changelogData.findIndex(d => d.version === v);
                    return vi !== -1 && vi < lastReadIndex;
                });
            }
        } else {
            isLatest = idx === 0; // Fallback: Wenn noch nie geöffnet, nur neuestes
        }

        const mainChangesHtml = main ? main.changes.map(c => `
            <div class="cl-change-item">
                <span class="cl-change-icon">${getChangeIcon(c)}</span>
                <span class="cl-change-text">${c.replace(/^(Hotfix|Neues Feature|Feature|UI-Update|Performance|Visualisierung|Optimierung|QoL|Balancing|Inhalts-Erweiterung|Vielfalt|Design|Globales|Neuer|Ranking Meta|Globale|Backend|Sicherheit|Sicherheits-Update):\s*/i, '')}</span>
            </div>
        `).join('') : '';

        const patchesHtml = patches.length > 0 ? `
            <button class="cl-hotfix-toggle">
                🔧 ${patches.length} Hotfix${patches.length > 1 ? 'es' : ''} <span class="cl-hotfix-arrow">▾</span>
            </button>
            <div class="cl-hotfix-list hidden">
                ${patches.map(p => `
                    <div class="cl-hotfix-entry">
                        <div class="cl-hotfix-header">
                            <span class="cl-version-tag cl-version-hotfix">${p.version}</span>
                            <span class="cl-hotfix-title">${p.title.replace(/^Hotfix:\s*/i, '')}</span>
                        </div>
                        ${p.changes.map(c => `
                            <div class="cl-change-item cl-change-item-small">
                                <span class="cl-change-icon">🔧</span>
                                <span class="cl-change-text">${c.replace(/^Hotfix:\s*/i, '')}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="cl-update-card ${isLatest ? 'cl-update-latest' : ''}">
                <div class="cl-update-header">
                    <div class="cl-update-header-left">
                        <span class="cl-version-tag">${group.key}</span>
                        ${isLatest ? '<span class="cl-latest-badge">NEU</span>' : ''}
                    </div>
                    <div class="cl-update-title">${main?.title || ''}</div>
                </div>
                <div class="cl-changes-list">
                    ${mainChangesHtml}
                </div>
                ${patchesHtml}
            </div>
        `;
    }).join('');

    // Accordion-Logik
    patchPanel.querySelectorAll('.cl-hotfix-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const list = btn.nextElementSibling;
            const arrow = btn.querySelector('.cl-hotfix-arrow');
            const isOpen = !list.classList.contains('hidden');
            list.classList.toggle('hidden');
            arrow.textContent = isOpen ? '▾' : '▴';
        });
    });

    // --- Roadmap rendern ---
    if (roadmapPanel) {
        import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js").then(async ({ collection, getDocs }) => {
            const { db } = await import('./firebase-config.js');
            let roadmapData = JSON.parse(JSON.stringify(currentMode === 'starwars' ? roadmapStarWars : roadmapWaifu));

            try {
                const snap = await getDocs(collection(db, "roadmap"));
                let communityItems = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    if (d.mode === currentMode) {
                        communityItems.push({
                            title: d.title,
                            desc: `${d.desc} <span style="color:#ffd700; font-size:0.8rem;">(★ ${d.votes} Votes)</span>`
                        });
                    }
                });
                if (communityItems.length > 0) {
                    roadmapData.push({ category: "💡 Community Wünsche", color: "#2ed573", items: communityItems });
                }
            } catch(e) {}

            roadmapPanel.innerHTML = roadmapData.map(section => `
                <div class="cl-roadmap-section">
                    <h3 class="cl-roadmap-category" style="color: ${section.color}; border-bottom-color: ${section.color}44;">${section.category}</h3>
                    ${section.items.map(item => `
                        <div class="cl-roadmap-item" style="border-left-color: ${section.color}">
                            <div class="cl-roadmap-item-title">${item.title}</div>
                            <div class="cl-roadmap-item-desc">${item.desc}</div>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        });
    }

    // Glow-Logik
    const openBtn = document.getElementById('changelog-open-btn');
    if (user && user.role !== 'admin') {
        const field = currentMode === 'starwars' ? 'lastReadVersionStarWars' : 'lastReadVersionWaifu';
        const lastRead = user[field] || '';
        if (lastRead !== latestVersionString) {
            openBtn.classList.add('text-gold-glow');
        } else {
            openBtn.classList.remove('text-gold-glow');
        }
    }
}
