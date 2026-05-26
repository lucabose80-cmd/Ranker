function getSeenIds() {
    const raw = localStorage.getItem('seen_unlock_ids') || '';
    if (raw.startsWith('[')) {
        try {
            return JSON.parse(raw);
        } catch(e) {
            return [];
        }
    }
    return raw ? raw.split(',') : [];
}

// profile.js
import { updateUserProfile, getCurrentUser } from './auth.js';
import { activeCharacterDatabase } from './theme.js';
import { currentMode } from './mode-state.js';
import { TITLES } from './titles.js';
import { THEMES } from './themes.js';

export function renderAvatarSelection() {
    const user = getCurrentUser();
    const grid = document.getElementById('avatar-grid');
    if (!grid || !user) return;
    
    grid.innerHTML = '';
    const currentAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;

    const sortedChars = [...activeCharacterDatabase].sort((a,b) => a.name.localeCompare(b.name));
    const seenIds = getSeenIds();
    
    sortedChars.forEach(char => {
        const isDiscovered = user.discovered && user.discovered.includes(char.name);
        const card = document.createElement('div');
        
        if (isDiscovered) {
            const isNew = !seenIds.includes(char.name);
            card.className = `lexikon-card avatar-card ${currentAvatar === char.img ? 'selected' : ''}`;
            card.innerHTML = `<img src="${char.img}"><span>${char.name}${isNew ? ' <span style="background:#ffd700; color:#000; font-size:0.55rem; font-weight:bold; padding:1px 3px; border-radius:3px; margin-left:3px; vertical-align:middle;">NEU</span>' : ''}</span>`;
            
            if (isNew) {
                card.addEventListener('mouseenter', () => markAsSeen(char.name, card), { once: true });
            }
            card.addEventListener('click', async () => {
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const res = await updateUserProfile(user.displayName, null, char.img);
                if(res.success) {
                    updateTopbarAvatarElement(res.user);
                }
            });
        } else {
            card.className = `lexikon-card avatar-card locked`;
            card.style.opacity = '0.5';
            card.innerHTML = `<div class="lexikon-card-placeholder">?</div><span>???</span>`;
            card.title = "Noch nicht entdeckt!";
        }
        grid.appendChild(card);
    });
}

export function updateTopbarAvatarElement(user) {
    const topAvatar = document.getElementById('topbar-avatar');
    const avatarToUse = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
    
    if(avatarToUse) {
        topAvatar.src = avatarToUse;
        topAvatar.classList.remove('hidden');
    } else {
        topAvatar.classList.add('hidden');
    }
    
    // Title in Topbar aktualisieren
    const topTitle = document.getElementById('player-title');
    const activeTitle = currentMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
    
    if (activeTitle) {
        topTitle.textContent = activeTitle;
        topTitle.style.display = 'block';
    } else {
        topTitle.style.display = 'none';
    }

    // Apply active color theme
    applyColorTheme(user);
    checkProfileUnlockDot(user);
}

// Zeigt einen gelben Punkt am Profil-Button wenn neue Themes/Titel freigeschaltet wurden
export function checkProfileUnlockDot(user) {
    if (!user) return;
    const currentIds = [
        ...(user.unlocked_themes_starwars || []),
        ...(user.unlocked_themes_waifu || []),
        ...(user.unlocked_titles_starwars || []),
        ...(user.unlocked_titles_waifu || []),
        ...(user.discovered || [])
    ];
    const seenIds = getSeenIds();
    const hasNew = currentIds.some(id => !seenIds.includes(id));
    const dot = document.getElementById('profile-unlock-dot');
    if (dot) dot.style.display = hasNew ? 'block' : 'none';
}

export function clearProfileUnlockDot(user) {
    if (!user) return;
    const currentIds = [
        ...(user.unlocked_themes_starwars || []),
        ...(user.unlocked_themes_waifu || []),
        ...(user.unlocked_titles_starwars || []),
        ...(user.unlocked_titles_waifu || []),
        ...(user.discovered || [])
    ];
    localStorage.setItem('seen_unlock_ids', JSON.stringify(currentIds));
    const dot = document.getElementById('profile-unlock-dot');
    if (dot) dot.style.display = 'none';
}

export function applyColorTheme(user) {
    // Remove ALL possible theme classes from ALL modes to avoid leakage between modes
    Object.values(THEMES).flat().forEach(t => {
        if (t.cssClass) document.body.classList.remove(t.cssClass);
    });

    const activeThemeId = currentMode === 'starwars' ? user.activeTheme_starwars : user.activeTheme_waifu;
    if (activeThemeId) {
        const themesForMode = THEMES[currentMode] || [];
        const themeObj = themesForMode.find(t => t.id === activeThemeId);
        if (themeObj && themeObj.cssClass) {
            document.body.classList.add(themeObj.cssClass);
        }
    }
}

export function initProfile() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById('profile-displayname').value = user.displayName;

    // Setup Tabs (nur einmal binden)
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            document.getElementById('profile-avatar-panel').classList.toggle('hidden', target !== 'avatar');
            document.getElementById('profile-title-panel').classList.toggle('hidden', target !== 'title');
            document.getElementById('profile-theme-panel').classList.toggle('hidden', target !== 'theme');
            document.getElementById('profile-stats-panel').classList.toggle('hidden', target !== 'stats');
        });
    });

    const handleProfileSave = async () => {
        const newName = document.getElementById('profile-displayname').value;
        const newPass = document.getElementById('profile-password').value;
        const res = await updateUserProfile(newName, newPass || null, undefined);
        const feedback = document.getElementById('profile-feedback');
        feedback.classList.remove('hidden');
        feedback.textContent = res.success ? "Daten gespeichert!" : "Fehler: " + res.message;
        feedback.style.color = res.success ? "#2ed573" : "#ff4757";
        if (res.success) {
            document.getElementById('player-greeting').textContent = newName;
            updateTopbarAvatarElement(res.user);
        }
    };

    document.getElementById('save-profile-btn').addEventListener('click', handleProfileSave);
    document.getElementById('profile-displayname').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleProfileSave(); });
    document.getElementById('profile-password').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleProfileSave(); });

    refreshProfileContent();
}

// Wird jedes Mal aufgerufen wenn das Profil geöffnet wird oder der Modus wechselt
export async function refreshProfileContent() {
    const { refreshCurrentUser } = await import('./auth.js');
    const user = await refreshCurrentUser();
    if (!user) return;

    renderAvatarSelection();

    const gamesPlayed = currentMode === 'starwars'
        ? (user.gamesPlayed_starwars || 0)
        : (user.gamesPlayed_waifu || 0);
    const el = document.getElementById('profile-games-count');
    if (el) el.textContent = gamesPlayed;

    renderTitleSelection(user, gamesPlayed);
    renderThemeSelection(user);
    renderStatsSelection(user);

    // Update tab labels with notification dots
    updateTabNotificationDots(user);
}

export function updateTabNotificationDots(user) {
    if (!user) return;
    const seenIds = getSeenIds();
    const gamesPlayed = currentMode === 'starwars' ? (user.gamesPlayed_starwars || 0) : (user.gamesPlayed_waifu || 0);

    const sortedChars = activeCharacterDatabase;
    const hasUnseenAvatar = sortedChars.some(char => {
        const isDiscovered = user.discovered && user.discovered.includes(char.name);
        return isDiscovered && !seenIds.includes(char.name);
    });

    const unlockedTitles = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
    const hasUnseenTitle = (TITLES[currentMode] || []).some(t => {
        const isUnlocked = t.secret ? unlockedTitles.includes(t.id) : gamesPlayed >= t.required;
        return isUnlocked && !seenIds.includes(t.id);
    });

    const hasUnseenTheme = (THEMES[currentMode] || []).some(t => {
        const isUnlocked = isThemeUnlocked(t, user);
        return isUnlocked && !seenIds.includes(t.id);
    });

    const tabAvatar = document.getElementById('profile-tab-btn-avatar');
    const tabTitle = document.getElementById('profile-tab-btn-title');
    const tabTheme = document.getElementById('profile-tab-btn-theme');

    if (tabAvatar) tabAvatar.innerHTML = `Avatare${hasUnseenAvatar ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    if (tabTitle) tabTitle.innerHTML = `Titel${hasUnseenTitle ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    if (tabTheme) tabTheme.innerHTML = `Farbschemas${hasUnseenTheme ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    
    checkProfileUnlockDot(user);
}

function markAsSeen(id, cardElement) {
    const seenIds = getSeenIds();
    if (!seenIds.includes(id)) {
        seenIds.push(id);
        localStorage.setItem('seen_unlock_ids', JSON.stringify(seenIds));
        
        const badge = cardElement.querySelector('span[style*="background:#ffd700"]');
        if (badge) {
            badge.style.transition = 'opacity 0.2s ease';
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 200);
        }
        
        updateTabNotificationDots(getCurrentUser());
    }
}

function getCombination(n, r) {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    let res = 1;
    for (let i = 1; i <= r; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

function renderTitleSelection(user, gamesPlayed) {
    const grid = document.getElementById('title-grid');
    if (!grid || !user) return;
    grid.innerHTML = '';
    
    let availableTitles = [...(TITLES[currentMode] || [])];
    const activeTitle = currentMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
    
    availableTitles.sort((a, b) => {
        const aLocked = a.secret ? !(currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || [])).includes(a.id) : gamesPlayed < a.required;
        const bLocked = b.secret ? !(currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || [])).includes(b.id) : gamesPlayed < b.required;
        return (aLocked === bLocked) ? 0 : aLocked ? 1 : -1;
    });

    availableTitles.forEach(t => {
        let isLocked = gamesPlayed < t.required;
        
        if (t.secret) {
            const unlockedList = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
            if (!unlockedList.includes(t.id)) {
                return; // Verstecke den Titel komplett, wenn er nicht freigeschaltet ist
            }
            isLocked = false;
        }
        
        let reqText = isLocked ? `Benötigt ${t.required} Spiele` : 'Freigeschaltet';
        let probHtml = '';
        
        if (t.secret && t.condition && (t.condition.type === 'has_characters' || t.condition.type === 'has_discovered_characters')) {
            const totalChars = activeCharacterDatabase.length;
            const targetChars = t.condition.chars || t.condition.characters || [];
            const m = targetChars.length;
            
            const charsExist = targetChars.every(name => 
                activeCharacterDatabase.some(c => c.name === name)
            );
            
            if (!charsExist) {
                probHtml = `<br><span style="font-size:0.75rem; color:#ff4757;">(Nicht möglich)</span>`;
            } else if (totalChars >= 5 && m <= 5) {
                const waysToPickMfrom5 = getCombination(5, m);
                const waysToPickMfromTotal = getCombination(totalChars, m);
                const prob = waysToPickMfrom5 / waysToPickMfromTotal;
                const probPercent = (prob * 100).toFixed(4);
                probHtml = `<br><span style="font-size:0.75rem; color:#888;">(Chance: <strong style="color:#ffd700">${probPercent}%</strong>)</span>`;
            }
        } else if (t.secret && t.condition && t.condition.type === 'has_tag_in_round') {
            const totalChars = activeCharacterDatabase.length;
            const k = activeCharacterDatabase.filter(c => c.tags && c.tags.includes(t.condition.tag)).length;
            const m = t.condition.count;
            if (k < m) {
                probHtml = `<br><span style="font-size:0.75rem; color:#ff4757;">(Nicht möglich)</span>`;
            } else if (totalChars >= 5 && m <= 5) {
                const waysToPickM = getCombination(k, m);
                const waysToPickRest = getCombination(totalChars - k, 5 - m);
                const totalWays = getCombination(totalChars, 5);
                const prob = (waysToPickM * waysToPickRest) / totalWays;
                const probPercent = (prob * 100).toFixed(4);
                probHtml = `<br><span style="font-size:0.75rem; color:#888;">(Chance: <strong style="color:#ffd700">${probPercent}%</strong>)</span>`;
            }
        }
        
        reqText += probHtml;

        const card = document.createElement('div');
        card.className = `title-card ${activeTitle === t.name ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
        
        const seenIds = getSeenIds();
        const isNew = !isLocked && !seenIds.includes(t.id);
        card.innerHTML = `
            <div class="title-card-name">${isLocked ? '🔒 ' + t.name : t.name}${isNew ? ' <span style="background:#ffd700; color:#000; font-size:0.55rem; font-weight:bold; padding:1px 3px; border-radius:3px; margin-left:5px; vertical-align:middle;">NEU</span>' : ''}</div>
            <div class="title-card-req">${reqText}</div>
        `;
        
        if (isNew) {
            card.addEventListener('mouseenter', () => markAsSeen(t.id, card), { once: true });
        }
        if (!isLocked) {
            card.addEventListener('click', async () => {
                document.querySelectorAll('.title-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const res = await updateUserProfile(user.displayName, null, null, t.name);
                if(res.success) {
                    updateTopbarAvatarElement(res.user);
                }
            });
        }
        
        grid.appendChild(card);
    });
}

function isThemeUnlocked(theme, user) {
    if (!theme.condition) return true;
    const { type, tag } = theme.condition;
    if (type === 'tag_full_team') {
        const unlockedThemes = user.unlocked_themes_starwars || [];
        return unlockedThemes.includes(theme.id);
    }
    return false;
}

function renderThemeSelection(user) {
    const grid = document.getElementById('theme-grid');
    if (!grid || !user) return;
    grid.innerHTML = '';

    let availableThemes = [...(THEMES[currentMode] || [])];
    const activeThemeId = currentMode === 'starwars' ? user.activeTheme_starwars : user.activeTheme_waifu;

    availableThemes.sort((a, b) => {
        const aLocked = !isThemeUnlocked(a, user);
        const bLocked = !isThemeUnlocked(b, user);
        return (aLocked === bLocked) ? 0 : aLocked ? 1 : -1;
    });

    availableThemes.forEach(t => {
        const unlocked = isThemeUnlocked(t, user);
        
        // Verstecke geheime Themes, wenn sie noch nicht freigeschaltet sind
        if (t.secret && !unlocked) {
            return;
        }

        const isSelected = activeThemeId === t.id || (!activeThemeId && t.id.endsWith('_default'));
        
        const card = document.createElement('div');
        card.className = `title-card ${isSelected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`;
        card.style.borderColor = unlocked && isSelected ? t.preview : '';

        let reqText = '';
        let probHtml = '';

        if (t.condition && t.condition.type === 'tag_full_team') {
            const tag = t.condition.tag;
            const reqCount = t.condition.count || 5;
            const totalChars = activeCharacterDatabase.length;
            if (totalChars >= reqCount) {
                const matchingChars = activeCharacterDatabase.filter(c => c.tags && c.tags.includes(tag)).length;
                if (matchingChars >= reqCount) {
                    let prob = 1;
                    for (let i = 0; i < reqCount; i++) {
                        prob *= (matchingChars - i) / (totalChars - i);
                    }
                    const probPercent = (prob * 100).toFixed(4);
                    probHtml = `<br><span style="font-size:0.75rem; color:#888;">(Chance: <strong style="color:#ffd700">${probPercent}%</strong> - ${matchingChars}/${totalChars} Chars)</span>`;
                } else {
                    probHtml = `<br><span style="font-size:0.75rem; color:#ff4757;">(Unmöglich: nur ${matchingChars}/${reqCount} nötigen Chars vorhanden)</span>`;
                }
            }
        }

        if (!unlocked && t.condition) {
            const { type, tag, count } = t.condition;
            const reqCount = count || 5;
            if (type === 'tag_full_team') {
                reqText = `Ranke ${reqCount} ${tag.charAt(0).toUpperCase() + tag.slice(1)} im selben Spiel`;
            }
        } else if (unlocked) {
            reqText = 'Freigeschaltet';
        }
        
        reqText += probHtml;

        const seenIds = getSeenIds();
        const isNew = unlocked && !seenIds.includes(t.id);
        card.innerHTML = `
            <div style="width:30px; height:30px; border-radius:50%; background:${t.preview}; margin-bottom:8px; border:2px solid rgba(255,255,255,0.2);"></div>
            <div class="title-card-name" style="color:${t.preview}">${!unlocked ? '🔒 ' : ''}${t.name}${isNew ? ' <span style="background:#ffd700; color:#000; font-size:0.55rem; font-weight:bold; padding:1px 3px; border-radius:3px; margin-left:5px; vertical-align:middle;">NEU</span>' : ''}</div>
            <div class="title-card-req">${reqText}</div>
        `;

        if (isNew) {
            card.addEventListener('mouseenter', () => markAsSeen(t.id, card), { once: true });
        }
        if (unlocked) {
            card.addEventListener('click', async () => {
                document.querySelectorAll('#theme-grid .title-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const res = await updateUserProfile(user.displayName, null, null, null, t.id);
                if (res.success) {
                    applyColorTheme(res.user);
                }
            });
        }

        grid.appendChild(card);
    });
}

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
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${meisterLosses > 0 ? `${meisterLosses}x gegen dich gewonnen` : ''}</div>
                </div>
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; text-align:center;">
                    <h4 style="margin:0 0 15px 0; color:#0abde3;">Dein Schüler (Versus)</h4>
                    <div style="color:#fff; font-weight:bold;">${schueler || 'Noch keiner'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${schuelerWins > 0 ? `${schuelerWins}x von dir besiegt` : ''}</div>
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <h4 style="margin:0 0 15px 0; color:#e2e8f0; text-align:center;">Dein Trophäenschrank</h4>
                <div style="font-size:0.8rem; color:#94a3b8; text-align:center; margin-bottom:15px;">Zeige deine seltensten Titel und Themes.</div>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    ${[0, 1, 2].map(i => {
                        const item = showcase[i];
                        let content = '<span style="color:#666; font-size:2rem;">+</span>';
                        if (item) {
                            if (item.type === 'title') content = `<div style="color:#ffd700; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Titel</div><div style="color:#fff; font-size:0.9rem; margin-top:5px; text-align:center;">${item.name}</div>`;
                            else if (item.type === 'theme') content = `<div style="color:#2ed573; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Theme</div><div style="color:#fff; font-size:0.9rem; margin-top:5px; text-align:center;">${item.name}</div>`;
                        }
                        return `<div class="showcase-slot" data-slot="${i}" style="flex:1; min-width:80px; max-width:120px; height:100px; background: rgba(0,0,0,0.5); border: 1px dashed #555; border-radius: 8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;">${content}</div>`;
                    }).join('')}
                </div>
            </div>

            <div id="inline-machtverirrung-area"></div>

            <div style="text-align:center; margin-top:10px;">
                <button id="btn-generate-tierlist" class="btn primary-btn" style="width:100%; max-width:300px;">
                    📊 Tier-List Grafik generieren
                </button>
            </div>
            <div id="analytics-result-area" style="margin-top:20px;"></div>
        </div>
    `;

    container.querySelectorAll('.showcase-slot').forEach(slot => {
        slot.addEventListener('click', () => { window.openShowcaseModal(user, slot.dataset.slot); });
    });

    document.getElementById('btn-generate-tierlist').addEventListener('click', () => { window.generateDeepAnalytics(user); });

    // Load Machtverirrung asynchronously
    setTimeout(() => { window.loadMachtverirrung(user, 'inline-machtverirrung-area'); }, 100);
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

    if (TITLES && TITLES[currentMode]) {
        TITLES[currentMode].forEach(t => {
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

    if (THEMES && THEMES[currentMode]) {
        THEMES[currentMode].forEach(t => {
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
    localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
    
    await updateDoc(doc(db, "users", user.uid), { [field]: showcase });
    renderStatsSelection(user);
};

window.generateDeepAnalytics = async function(user) {
    const btn = document.getElementById('btn-generate-tierlist');
    const area = document.getElementById('analytics-result-area');
    btn.disabled = true;
    btn.textContent = 'Lade Historie (Dies kann einen Moment dauern)...';

    const { db } = await import('./firebase-config.js');
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    
    const snapPersonal = await getDoc(doc(db, "scores", `${currentMode}_classic_${user.username}`));
    
    if (!snapPersonal.exists()) {
        area.innerHTML = '<div style="color:#ff4757; text-align:center;">Noch keine Spiele in diesem Modus gespielt!</div>';
        btn.disabled = false;
        btn.textContent = '📊 Tier-List Grafik generieren';
        return;
    }
    
    const charRanks = {}; 
    const personalData = snapPersonal.data().characters || {};
    for (const [key, stats] of Object.entries(personalData)) {
        if (!stats.name) continue;
        const avgScore = stats.score / (stats.count || 1);
        charRanks[stats.name] = { score: avgScore, count: stats.count };
    }

    let globalRanks = {};
    try {
        const snapGlobal = await getDoc(doc(db, "scores", `${currentMode}_classic_global`));
        if (snapGlobal.exists()) {
            const chars = Object.values(snapGlobal.data().characters || {});
            chars.forEach(c => {
                const globalScore = c.score / (c.count || 1); 
                globalRanks[c.name] = globalScore;
            });
        }
    } catch(e) {}

    const tiers = { S: [], A: [], B: [], C: [], D: [] };

    for (const [name, stats] of Object.entries(charRanks)) {
        // avgScore is between 1 (worst) and 5 (best).
        // Let's create S, A, B, C, D tiers based on average.
        const avg = stats.score; 
        
        let tier = 'D';
        if (avg >= 4.5) tier = 'S';
        else if (avg >= 3.8) tier = 'A';
        else if (avg >= 3.0) tier = 'B';
        else if (avg >= 2.2) tier = 'C';

        if (tiers[tier]) {
            tiers[tier].push(name);
        }
    }

    const getImg = (name) => {
        const c = activeCharacterDatabase.find(x => x.name === name);
        return c ? c.img : '';
    };

    const renderTierRow = (label, color, chars) => `
        <div style="display:flex; border-bottom:1px solid #333; background:#111;">
            <div style="width:60px; min-height:60px; display:flex; align-items:center; justify-content:center; background:${color}; color:#000; font-weight:bold; font-size:1.5rem;">${label}</div>
            <div style="flex:1; display:flex; flex-wrap:wrap; gap:5px; padding:8px; background:#1a1a1a;">
                ${chars.map(name => {
                    const img = getImg(name);
                    return img ? `<img src="${img}" title="${name}" crossorigin="anonymous" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #333;">` : '';
                }).join('')}
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

    area.innerHTML = tierListHtml;
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

window.loadMachtverirrung = async function(user, targetDivId) {
    const area = document.getElementById(targetDivId);
    if (!area) return;
    area.innerHTML = '<div style="text-align:center; color:#94a3b8; font-size:0.8rem;">Berechne Machtverirrung...</div>';

    const { db } = await import('./firebase-config.js');
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    
    // Instead of querying history and requiring an index, we just read the personal scoreboard!
    const snapPersonal = await getDoc(doc(db, "scores", `${currentMode}_classic_${user.username}`));
    
    if (!snapPersonal.exists()) {
        area.innerHTML = ''; return;
    }
    
    const charRanks = {}; 
    const personalData = snapPersonal.data().characters || {};
    for (const [key, stats] of Object.entries(personalData)) {
        if (!stats.name) continue;
        // globalScore is calculated as (6 - avg points). Points are 1-5 where 5 is best.
        // Wait, history.js: totalPoints = basePoints * rating.
        // basePoints for classic normal is 5 for rank 1, 1 for rank 5.
        // So average points is between 1 and 5.
        // Let's normalize it to 1 (best) to 5 (worst) to match global logic:
        const avgScore = stats.score / (stats.count || 1);
        const normalizedRank = 6 - avgScore;
        charRanks[stats.name] = { sum: normalizedRank * stats.count, count: stats.count };
    }

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

    for (const [name, stats] of Object.entries(charRanks)) {
        const userAvg = stats.sum / stats.count;
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

    if (delusionChar) {
        const diffDesc = delusionUserAvg < delusionGlobalAvg 
            ? "Du bewertest ihn <strong>viel besser</strong> als der Rest der Community!" 
            : "Du bewertest ihn <strong>viel schlechter</strong> als der Rest der Community!";
            
        area.innerHTML = `
            <div style="background: rgba(156, 39, 176, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #9c27b0; text-align:center; margin-bottom: 20px;">
                <h4 style="margin:0 0 10px 0; color:#e056fd;">🌌 Machtverirrung (Größte Abweichung)</h4>
                <div style="color:#fff; font-size:1.2rem; font-weight:bold; margin-bottom:5px;">${delusionChar}</div>
                <div style="font-size:0.9rem; color:#e2e8f0; margin-top:5px; background:rgba(0,0,0,0.5); padding:8px; border-radius:4px; display:inline-block;">
                    ${user.displayName || user.username}s Schnitt: <strong>Platz ${delusionUserAvg.toFixed(1)}</strong> &nbsp;|&nbsp; Community: <strong>Platz ${delusionGlobalAvg.toFixed(1)}</strong>
                </div>
                <div style="color:#ffd700; margin-top:10px; font-weight:bold;">${diffDesc}</div>
            </div>
        `;
    } else {
        area.innerHTML = '';
    }
}