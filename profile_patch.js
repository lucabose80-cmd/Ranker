function renderStatsSelection(user) {
    const container = document.getElementById('stats-container');
    if (!container) return;

    const gamesPlayed = currentMode === 'starwars' ? (user.gamesPlayed_starwars || 0) : (user.gamesPlayed_waifu || 0);
    const favs = currentMode === 'starwars' ? (user.favorites_starwars || {}) : (user.favorites_waifu || {});
    const nems = currentMode === 'starwars' ? (user.nemesis_starwars || {}) : (user.nemesis_waifu || {});

    let topFav = null; let topFavCount = 0;
    for (const [name, count] of Object.entries(favs)) { if (count > topFavCount) { topFavCount = count; topFav = name; } }

    let topNem = null; let topNemCount = 0;
    for (const [name, count] of Object.entries(nems)) { if (count > topNemCount) { topNemCount = count; topNem = name; } }

    const getCharImg = (name) => {
        if (!name) return '';
        const char = activeCharacterDatabase.find(c => c.name === name);
        return char ? char.img : '';
    };

    const favImg = getCharImg(topFav);
    const nemImg = getCharImg(topNem);

    const matchups = user.versusMatchups || {};
    let meister = null; let meisterLosses = 0;
    let schueler = null; let schuelerWins = 0;
    for (const [oppName, stats] of Object.entries(matchups)) {
        if (stats.losses > meisterLosses) { meisterLosses = stats.losses; meister = oppName; }
        if (stats.wins > schuelerWins) { schuelerWins = stats.wins; schueler = oppName; }
    }

    const showcase = currentMode === 'starwars' ? (user.showcase_starwars || []) : (user.showcase_waifu || []);

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <h3 style="margin:0 0 10px 0; color:#e2e8f0; font-size:1rem;">Gesamte Spiele gespielt: <span style="color:#ffd700;">${gamesPlayed}</span></h3>
            </div>
            
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; text-align:center;">
                    <h4 style="margin:0 0 15px 0; color:#2ed573;">Dein Lieblingscharakter</h4>
                    ${favImg ? `<img src="${favImg}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #2ed573;margin:0 auto 10px; display:block;">` : `<div style="width:80px;height:80px;border-radius:50%;background:#444;margin:0 auto 10px; display:block;"></div>`}
                    <div style="color:#fff; font-weight:bold;">${topFav || 'Noch keiner'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${topFavCount > 0 ? `${topFavCount}x auf Platz 1` : ''}</div>
                </div>
                
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; text-align:center;">
                    <h4 style="margin:0 0 15px 0; color:#ff4757;">Dein Nemesis</h4>
                    ${nemImg ? `<img src="${nemImg}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #ff4757;margin:0 auto 10px; display:block;">` : `<div style="width:80px;height:80px;border-radius:50%;background:#444;margin:0 auto 10px; display:block;"></div>`}
                    <div style="color:#fff; font-weight:bold;">${topNem || 'Noch keiner'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${topNemCount > 0 ? `${topNemCount}x auf Platz 5` : ''}</div>
                </div>
            </div>

            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; text-align:center;">
                    <h4 style="margin:0 0 15px 0; color:#ff9f43;">Dein Meister (Versus)</h4>
                    <div style="color:#fff; font-weight:bold;">${meister || 'Noch keiner'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${meisterLosses > 0 ? `${meisterLosses}x gegen dich verloren` : ''}</div>
                </div>
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; text-align:center;">
                    <h4 style="margin:0 0 15px 0; color:#0abde3;">Dein Schüler (Versus)</h4>
                    <div style="color:#fff; font-weight:bold;">${schueler || 'Noch keiner'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${schuelerWins > 0 ? `${schuelerWins}x von dir besiegt` : ''}</div>
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <h4 style="margin:0 0 15px 0; color:#e2e8f0; text-align:center;">Dein Trophäenschrank</h4>
                <div style="font-size:0.8rem; color:#94a3b8; text-align:center; margin-bottom:15px;">Zeige deine seltensten Titel und Themes. Klicke auf einen Slot.</div>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    ${[0, 1, 2].map(i => {
                        const item = showcase[i];
                        let content = '<span style="color:#666; font-size:2rem;">+</span>';
                        if (item) {
                            if (item.type === 'title') content = \`<div style="color:#ffd700; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Titel</div><div style="color:#fff; font-size:0.9rem; margin-top:5px; text-align:center;">\${item.name}</div>\`;
                            else if (item.type === 'theme') content = \`<div style="color:#2ed573; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Theme</div><div style="color:#fff; font-size:0.9rem; margin-top:5px; text-align:center;">\${item.name}</div>\`;
                        }
                        return \`<div class="showcase-slot" data-slot="\${i}" style="flex:1; min-width:80px; max-width:120px; height:100px; background: rgba(0,0,0,0.5); border: 1px dashed #555; border-radius: 8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;">\${content}</div>\`;
                    }).join('')}
                </div>
            </div>

            <div style="text-align:center; margin-top:10px;">
                <button id="btn-generate-tierlist" class="btn primary-btn" style="width:100%; max-width:300px;">
                    📊 Tiefergehende Analyse generieren
                </button>
            </div>
            <div id="analytics-result-area" style="margin-top:20px;"></div>
        </div>
    `;

    container.querySelectorAll('.showcase-slot').forEach(slot => {
        slot.addEventListener('click', () => { window.openShowcaseModal(user, slot.dataset.slot); });
    });

    document.getElementById('btn-generate-tierlist').addEventListener('click', () => { window.generateDeepAnalytics(user); });
}

window.openShowcaseModal = function(user, slotIndex) {
    const unlockedTitles = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
    const unlockedThemes = currentMode === 'starwars' ? (user.unlocked_themes_starwars || []) : (user.unlocked_themes_waifu || []);
    
    let modal = document.getElementById('showcase-selector-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'showcase-selector-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:400px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; max-height:80vh; overflow-y:auto;">
                <h3 style="margin-top:0;">Trophäe auswählen</h3>
                <div id="showcase-items-list" style="display:flex; flex-direction:column; gap:10px;"></div>
                <button id="close-showcase-modal" class="btn secondary-btn" style="margin-top:20px; width:100%;">Schließen</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-showcase-modal').addEventListener('click', () => modal.classList.add('hidden'));
    }
    
    const list = document.getElementById('showcase-items-list');
    list.innerHTML = '';
    
    const emptyBtn = document.createElement('button');
    emptyBtn.className = 'btn';
    emptyBtn.style.cssText = 'background:#333; color:#fff; border:none; padding:10px; border-radius:5px; cursor:pointer; text-align:left;';
    emptyBtn.textContent = '❌ Slot leeren';
    emptyBtn.onclick = async () => {
        await window.updateShowcaseSlot(user, slotIndex, null);
        modal.classList.add('hidden');
    };
    list.appendChild(emptyBtn);

    if (window.TITLES) {
        (window.TITLES[currentMode] || []).forEach(t => {
            if (unlockedTitles.includes(t.id)) {
                const btn = document.createElement('button');
                btn.style.cssText = 'background:#2d3748; color:#ffd700; border:1px solid #4a5568; padding:10px; border-radius:5px; cursor:pointer; text-align:left; font-weight:bold;';
                btn.textContent = `Titel: ${t.name}`;
                btn.onclick = async () => {
                    await window.updateShowcaseSlot(user, slotIndex, { type: 'title', id: t.id, name: t.name });
                    modal.classList.add('hidden');
                };
                list.appendChild(btn);
            }
        });
    }

    if (window.THEMES) {
        (window.THEMES[currentMode] || []).forEach(t => {
            if (unlockedThemes.includes(t.id)) {
                const btn = document.createElement('button');
                btn.style.cssText = 'background:#2d3748; color:#2ed573; border:1px solid #4a5568; padding:10px; border-radius:5px; cursor:pointer; text-align:left; font-weight:bold;';
                btn.textContent = `Theme: ${t.name}`;
                btn.onclick = async () => {
                    await window.updateShowcaseSlot(user, slotIndex, { type: 'theme', id: t.id, name: t.name });
                    modal.classList.add('hidden');
                };
                list.appendChild(btn);
            }
        });
    }
    
    modal.classList.remove('hidden');
};

window.updateShowcaseSlot = async function(user, slotIndex, itemData) {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    const { db } = await import('./firebase-config.js');
    
    const field = currentMode === 'starwars' ? 'showcase_starwars' : 'showcase_waifu';
    const showcase = user[field] || [null, null, null];
    showcase[slotIndex] = itemData;
    
    user[field] = showcase;
    await updateDoc(doc(db, "users", user.uid), { [field]: showcase });
    renderStatsSelection(user);
};

window.generateDeepAnalytics = async function(user) {
    const btn = document.getElementById('btn-generate-tierlist');
    const area = document.getElementById('analytics-result-area');
    btn.disabled = true;
    btn.textContent = 'Lade Historie (Dies kann einen Moment dauern)...';

    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    
    const qGames = query(collection(db, "games"), where("username", "==", user.username), where("mode", "==", currentMode));
    const snapGames = await getDocs(qGames);
    
    if (snapGames.empty) {
        area.innerHTML = '<div style="color:#ff4757; text-align:center;">Noch keine Spiele in diesem Modus gespielt!</div>';
        btn.disabled = false;
        btn.textContent = '📊 Tiefergehende Analyse generieren';
        return;
    }
    
    const charRanks = {}; 
    
    snapGames.forEach(docSnap => {
        const game = docSnap.data();
        if (game.ranking && game.ranking.length > 0) {
            game.ranking.forEach((char, idx) => {
                if (!charRanks[char.name]) charRanks[char.name] = { sum: 0, count: 0 };
                const maxIdx = game.ranking.length - 1;
                const normalizedRank = maxIdx > 0 ? ((idx / maxIdx) * 4) + 1 : 1;
                charRanks[char.name].sum += normalizedRank;
                charRanks[char.name].count++;
            });
        }
    });

    let globalRanks = {};
    try {
        const snapGlobal = await getDoc(doc(db, "scores", `${currentMode}_classic_global`));
        if (snapGlobal.exists()) {
            const chars = Object.values(snapGlobal.data().characters || {});
            chars.forEach(c => {
                const globalScore = c.score / (c.count || 1); 
                globalRanks[c.name] = 6 - globalScore;
            });
        }
    } catch(e) {}

    let maxDiff = -1;
    let delusionChar = null;
    let delusionUserAvg = 0;
    let delusionGlobalAvg = 0;

    const tiers = { S: [], A: [], B: [], C: [], D: [] };

    for (const [name, stats] of Object.entries(charRanks)) {
        const userAvg = stats.sum / stats.count;
        
        if (userAvg <= 1.5) tiers.S.push(name);
        else if (userAvg <= 2.5) tiers.A.push(name);
        else if (userAvg <= 3.5) tiers.B.push(name);
        else if (userAvg <= 4.5) tiers.C.push(name);
        else tiers.D.push(name);

        if (globalRanks[name]) {
            const diff = Math.abs(userAvg - globalRanks[name]);
            if (stats.count >= 2 && diff > maxDiff) {
                maxDiff = diff;
                delusionChar = name;
                delusionUserAvg = userAvg;
                delusionGlobalAvg = globalRanks[name];
            }
        }
    }

    let delusionHtml = '';
    if (delusionChar) {
        const diffDesc = delusionUserAvg < delusionGlobalAvg 
            ? "Du bewertest ihn <strong>viel besser</strong> als der Rest der Community!" 
            : "Du bewertest ihn <strong>viel schlechter</strong> als der Rest der Community!";
            
        delusionHtml = `
            <div style="background: rgba(156, 39, 176, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #9c27b0; text-align:center; margin-bottom: 20px;">
                <h4 style="margin:0 0 10px 0; color:#e056fd;">🌌 Machtverirrung (Größte Abweichung)</h4>
                <div style="color:#fff; font-size:1.2rem; font-weight:bold; margin-bottom:5px;">${delusionChar}</div>
                <div style="font-size:0.9rem; color:#e2e8f0; margin-top:5px; background:rgba(0,0,0,0.5); padding:8px; border-radius:4px; display:inline-block;">
                    Dein Schnitt: <strong>Platz ${delusionUserAvg.toFixed(1)}</strong> &nbsp;|&nbsp; Community: <strong>Platz ${delusionGlobalAvg.toFixed(1)}</strong>
                </div>
                <div style="color:#ffd700; margin-top:10px; font-weight:bold;">${diffDesc}</div>
            </div>
        `;
    }

    const getImg = (name) => {
        const c = activeCharacterDatabase.find(x => x.name === name);
        return c ? c.img : '';
    };

    const renderTierRow = (label, color, chars) => `
        <div style="display:flex; border-bottom:1px solid #333; background:#111;">
            <div style="width:60px; min-height:60px; display:flex; align-items:center; justify-content:center; background:${color}; color:#000; font-weight:bold; font-size:1.5rem;">${label}</div>
            <div style="flex:1; display:flex; flex-wrap:wrap; gap:5px; padding:8px; background:#1a1a1a;">
                ${chars.map(name => `<img src="${getImg(name)}" title="${name}" crossorigin="anonymous" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #333;">`).join('')}
            </div>
        </div>
    `;

    const tierListHtml = `
        <div id="tierlist-capture-area" style="border:2px solid #444; border-radius:8px; overflow:hidden; margin-bottom:15px; background:#111;">
            <div style="padding:15px; text-align:center; background:#222; color:#fff; font-weight:bold; border-bottom:1px solid #444; font-size:1.2rem;">
                ${user.displayName || user.username}s Tier-List (${currentMode === 'starwars' ? 'Star Wars' : 'Anime'})
            </div>
            ${renderTierRow('S', '#ff7f7f', tiers.S)}
            ${renderTierRow('A', '#ffbf7f', tiers.A)}
            ${renderTierRow('B', '#ffff7f', tiers.B)}
            ${renderTierRow('C', '#7fff7f', tiers.C)}
            ${renderTierRow('D', '#7fbfff', tiers.D)}
            <div style="padding:5px; text-align:center; background:#111; color:#666; font-size:0.7rem;">Generiert von Ranker</div>
        </div>
        <button id="btn-download-tierlist" class="btn" style="background:#2ed573; color:#000; width:100%; font-weight:bold;">
            📥 Tier-List als Bild speichern
        </button>
    `;

    area.innerHTML = delusionHtml + tierListHtml;
    btn.style.display = 'none';

    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = bindDownloadBtn;
        document.head.appendChild(script);
    } else {
        bindDownloadBtn();
    }

    function bindDownloadBtn() {
        document.getElementById('btn-download-tierlist').addEventListener('click', () => {
            const captureArea = document.getElementById('tierlist-capture-area');
            const downloadBtn = document.getElementById('btn-download-tierlist');
            downloadBtn.textContent = 'Wird generiert...';
            downloadBtn.disabled = true;
            
            html2canvas(captureArea, { backgroundColor: '#111', useCORS: true, allowTaint: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = `TierList_${user.displayName || user.username}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                downloadBtn.textContent = '📥 Tier-List als Bild speichern';
                downloadBtn.disabled = false;
            }).catch(e => {
                console.error(e);
                downloadBtn.textContent = 'Fehler beim Speichern!';
                setTimeout(() => { downloadBtn.textContent = '📥 Tier-List als Bild speichern'; downloadBtn.disabled = false; }, 2000);
            });
        });
    }
}
