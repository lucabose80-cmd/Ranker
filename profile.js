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
            document.getElementById('profile-album-panel').classList.toggle('hidden', target !== 'album');
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
    renderAlbumTab(user);

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
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333;">
                    <h3 style="margin:0 0 10px 0; color:#e2e8f0; font-size:1rem;">Gesamte Spiele gespielt: <span style="color:#ffd700;">${gamesPlayed}</span></h3>
                </div>
                <div style="flex:2; min-width:300px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; justify-content: center;">
                    <h3 style="margin:0 0 5px 0; color:#e2e8f0; font-size:1.2rem; display:flex; align-items:center; justify-content:space-between;">
                        <span>Konto: <span style="color:#00d2d3;">${user.credits || 0} Credits</span></span>
                    </h3>
                    <div style="display: flex; gap: 5px; font-size: 0.75rem; flex-wrap: wrap; margin-top:5px;">
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Classic: ${user['credits_earned_' + currentMode + '_normal'] || 0}/10</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Klon: ${user['credits_earned_' + currentMode + '_klon'] || 0}/10</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Peak: ${user['credits_earned_' + currentMode + '_peak'] || 0}/10</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Vehicle: ${user['credits_earned_' + currentMode + '_vehicle'] || 0}/10</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Hardcore: ${user['credits_earned_' + currentMode + '_hardcore'] || 0}/10</div>
                    </div>
                </div>
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

function renderAlbumTab(user) {
    const filterSelect = document.getElementById('album-pack-filter');
    const sortSelect = document.getElementById('album-sort-filter');
    
    const updateAlbum = () => {
        const pack = filterSelect ? filterSelect.value : 'all';
        const sort = sortSelect ? sortSelect.value : 'rarity_desc';
        window.renderCommunityAlbum(user, 'profile-album-grid-tab', pack, sort);
    };

    if (filterSelect) filterSelect.onchange = updateAlbum;
    if (sortSelect) sortSelect.onchange = updateAlbum;
    
    // Render Album Showcase
    const showcaseContainer = document.getElementById('album-showcase-container');
    if (showcaseContainer) {
        const showcaseData = currentMode === 'starwars' ? (user.album_showcase_starwars || []) : (user.album_showcase_waifu || []);
        let html = '';
        for (let i = 0; i < 3; i++) {
            const card = showcaseData[i];
            if (card) {
                const charObj = activeCharacterDatabase.find(c => c.name === card.charName);
                if (charObj) {
                    const bg = `url('${charObj.img}')`;
                    let rarityBorder = '3px solid #111';
                    if (card.rarity === 'rare') rarityBorder = '3px solid #ff9f43';
                    if (card.rarity === 'epic') rarityBorder = '3px solid #9b59b6';
                    if (card.rarity === 'legendary') rarityBorder = '3px solid #ffd700';
                    
                    html += `<div class="album-showcase-slot" data-slot="${i}" style="width:80px; height:120px; border-radius:8px; background-size:cover; background-position:center; background-image:${bg}; border:${rarityBorder}; position:relative; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.5);">
                        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.8); color:#fff; font-size:0.6rem; text-align:center; padding:3px; border-bottom-left-radius:5px; border-bottom-right-radius:5px;">${card.charName}</div>
                    </div>`;
                } else {
                    html += `<div class="album-showcase-slot" data-slot="${i}" style="width:80px; height:120px; border-radius:8px; background:rgba(0,0,0,0.5); border:1px dashed #555; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:#666; font-size:2rem;">+</span></div>`;
                }
            } else {
                html += `<div class="album-showcase-slot" data-slot="${i}" style="width:80px; height:120px; border-radius:8px; background:rgba(0,0,0,0.5); border:1px dashed #555; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:#666; font-size:2rem;">+</span></div>`;
            }
        }
        showcaseContainer.innerHTML = html;
        
        showcaseContainer.querySelectorAll('.album-showcase-slot').forEach(slot => {
        slot.addEventListener('click', () => { window.openAlbumShowcaseModal(user, slot.dataset.slot); });
        });
    }

    if (window.renderCommunityAlbum) {
        const initialPack = filterSelect ? filterSelect.value : 'all';
        const initialSort = sortSelect ? sortSelect.value : 'rarity_desc';
        window.renderCommunityAlbum(user, 'profile-album-grid-tab', initialPack, initialSort);
    }
}

window.renderCommunityAlbum = function(user, containerId, filterPack = 'all', sortMode = 'rarity_desc') {
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);
    const albumGrid = document.getElementById(containerId);
    if (!albumGrid) return;
    
    albumGrid.innerHTML = '';
    albumGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:25px; max-height:400px; overflow-y:auto; padding: 10px;';
    
    let filtered = inventory;
    if (filterPack && filterPack !== 'all') {
        filtered = inventory.filter(c => c.boosterId === filterPack);
    }

    if (filtered.length === 0) {
        albumGrid.innerHTML = '<div style="color:#666; grid-column: 1 / -1; text-align:center; padding: 20px;">Keine Karten gefunden.</div>';
        return;
    }
    
    const grouped = {};
    filtered.forEach(c => {
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });

    const rarVal = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
    const RARITY_BORDERS = {
        'common': '3px solid #111',
        'rare': '3px solid #ff9f43',
        'epic': '3px solid #9b59b6',
        'legendary': '3px solid #ffd700'
    };

    const sortedChars = Object.keys(grouped).sort((a,b) => {
        const highestA = Math.max(...grouped[a].map(c => rarVal[c.rarity]));
        const highestB = Math.max(...grouped[b].map(c => rarVal[c.rarity]));
        
        if (sortMode === 'rarity_desc') {
            if (highestA !== highestB) return highestB - highestA;
            return grouped[b].length - grouped[a].length;
        } else if (sortMode === 'rarity_asc') {
            if (highestA !== highestB) return highestA - highestB;
            return grouped[a].length - grouped[b].length;
        } else if (sortMode === 'count_desc') {
            if (grouped[a].length !== grouped[b].length) return grouped[b].length - grouped[a].length;
            return highestB - highestA;
        } else if (sortMode === 'name_asc') {
            return a.localeCompare(b);
        }
        
        // Default
        if (highestA !== highestB) return highestB - highestA;
        return grouped[b].length - grouped[a].length;
    });

    sortedChars.forEach(charName => {
        const charObj = activeCharacterDatabase.find(dbC => dbC.name === charName);
        if (!charObj) return;

        const cards = grouped[charName];
        cards.sort((a,b) => rarVal[b.rarity] - rarVal[a.rarity]);
        
        const stackContainer = document.createElement('div');
        stackContainer.className = 'album-stack-container';
        const stackOffset = Math.min(20, cards.length * 4);
        stackContainer.style.cssText = `position:relative; width:100%; aspect-ratio:2/3; margin-bottom: ${stackOffset}px; margin-right: ${stackOffset}px; cursor:help;`;
        
        cards.slice(0, 5).forEach((c, idx) => {
            const card = document.createElement('div');
            const z = cards.length - idx;
            const offset = idx * 4;
            
            card.style.cssText = `position:absolute; top:${offset}px; left:${offset}px; width:100%; height:100%; background-image:url('${charObj.img}'); background-size:cover; background-position:center; border-radius:6px; border:${RARITY_BORDERS[c.rarity] || '3px solid #111'}; z-index:${z}; box-shadow: -2px -2px 5px rgba(0,0,0,0.5); overflow:hidden;`;
            
            if ((c.rarity === 'epic' || c.rarity === 'legendary') && idx === 0) {
                const holo = document.createElement('div');
                holo.style.cssText = 'position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; mix-blend-mode:color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear;';
                card.appendChild(holo);
            }
            
            if (idx === 0) {
                 const badge = document.createElement('div');
                 badge.style.cssText = 'position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.8); color:#fff; font-size:0.7rem; font-weight:bold; padding:2px 5px; border-radius:4px; border:1px solid #444; pointer-events:none;';
                 badge.textContent = 'x' + cards.length;
                 card.appendChild(badge);
                 
                 const nameBanner = document.createElement('div');
                 nameBanner.style.cssText = 'position:absolute; bottom:25px; left:0; right:0; background:rgba(0,0,0,0.8); text-align:center; font-size:0.6rem; color:#fff; padding:3px; pointer-events:none; text-transform:uppercase; font-weight:bold;';
                 nameBanner.textContent = charName;
                 card.appendChild(nameBanner);
                 
                 const tooltipLines = [`<strong style="color:#2ed573;">${charName}</strong>`, `<span style="color:#aaa;">${cards.length} Gesamt</span>`];
                 const rarityCounts = {};
                 cards.forEach(c => rarityCounts[c.rarity] = (rarityCounts[c.rarity] || 0) + 1);
                 if (rarityCounts['legendary']) tooltipLines.push(`<span style="color:#ffd700;">Legendär: ${rarityCounts['legendary']}x</span>`);
                 if (rarityCounts['epic']) tooltipLines.push(`<span style="color:#9b59b6;">Episch: ${rarityCounts['epic']}x</span>`);
                 if (rarityCounts['rare']) tooltipLines.push(`<span style="color:#ff9f43;">Selten: ${rarityCounts['rare']}x</span>`);
                 if (rarityCounts['common']) tooltipLines.push(`<span style="color:#888;">Gewöhnlich: ${rarityCounts['common']}x</span>`);
                 
                 const tooltip = document.createElement('div');
                 tooltip.className = 'album-stack-tooltip';
                 tooltip.innerHTML = tooltipLines.join('<br>');
                 stackContainer.appendChild(tooltip);
                 
                 const topBanner = document.createElement('div');
                 const col = c.rarity === 'legendary' ? '#ffd700' : (c.rarity === 'epic' ? '#9b59b6' : (c.rarity === 'rare' ? '#ff9f43' : '#888'));
                 topBanner.style.cssText = `position:absolute; top:0; left:0; right:0; height:4px; background:${col};`;
                 card.appendChild(topBanner);
            }
            
            stackContainer.appendChild(card);
        });
        
        albumGrid.appendChild(stackContainer);
    });
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

window.openAlbumShowcaseModal = function(user, slotIndex) {
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);
    
    let modal = document.getElementById('album-showcase-selector-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'album-showcase-selector-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:500px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; max-height:80vh; overflow-y:auto;">
                <h3 style="margin-top:0;">Karte für Showcase wählen</h3>
                <div id="album-showcase-items-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:10px;"></div>
                <button id="close-album-showcase-modal" class="btn secondary-btn" style="margin-top:20px; width:100%;">Schließen</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-album-showcase-modal').addEventListener('click', () => modal.classList.add('hidden'));
    }
    
    const list = document.getElementById('album-showcase-items-list');
    list.innerHTML = '';
    
    const emptyBtn = document.createElement('button');
    emptyBtn.className = 'btn';
    emptyBtn.style.cssText = 'grid-column: 1 / -1; background:#333; color:#fff; border:none; padding:10px; border-radius:5px; cursor:pointer; text-align:center; margin-bottom:10px;';
    emptyBtn.textContent = '❌ Slot leeren';
    emptyBtn.onclick = async () => {
        await window.updateAlbumShowcaseSlot(user, slotIndex, null);
        modal.classList.add('hidden');
    };
    list.appendChild(emptyBtn);

    // Get unique highest cards
    const grouped = {};
    inventory.forEach(c => {
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });

    const rarVal = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
    const RARITY_BORDERS = {
        'common': '3px solid #111', 'rare': '3px solid #ff9f43',
        'epic': '3px solid #9b59b6', 'legendary': '3px solid #ffd700'
    };

    Object.keys(grouped).forEach(charName => {
        const charObj = activeCharacterDatabase.find(dbC => dbC.name === charName);
        if (!charObj) return;

        const cards = grouped[charName];
        cards.sort((a,b) => rarVal[b.rarity] - rarVal[a.rarity]);
        const bestCard = cards[0];

        const cardEl = document.createElement('div');
        cardEl.style.cssText = `width:100%; aspect-ratio:2/3; background-image:url('${charObj.img}'); background-size:cover; background-position:center; border-radius:6px; border:${RARITY_BORDERS[bestCard.rarity] || '3px solid #111'}; cursor:pointer; overflow:hidden; position:relative;`;
        
        const nameBanner = document.createElement('div');
        nameBanner.style.cssText = 'position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.8); text-align:center; font-size:0.6rem; color:#fff; padding:3px; pointer-events:none;';
        nameBanner.textContent = charName;
        cardEl.appendChild(nameBanner);

        cardEl.onclick = async () => {
            await window.updateAlbumShowcaseSlot(user, slotIndex, { charName: bestCard.charName, rarity: bestCard.rarity });
            modal.classList.add('hidden');
        };
        list.appendChild(cardEl);
    });
    
    modal.classList.remove('hidden');
};

window.updateAlbumShowcaseSlot = async function(user, slotIndex, itemData) {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    const { db } = await import('./firebase-config.js');
    
    const field = currentMode === 'starwars' ? 'album_showcase_starwars' : 'album_showcase_waifu';
    const showcase = user[field] || [null, null, null];
    showcase[slotIndex] = itemData;
    
    user[field] = showcase;
    localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
    
    await updateDoc(doc(db, "users", user.uid), { [field]: showcase });
    renderAlbumTab(user);
};

window.generateDeepAnalytics = async function(user) {
    const btn = document.getElementById('btn-generate-tierlist');
    const area = document.getElementById('analytics-result-area');
    btn.disabled = true;
    btn.textContent = 'Lade Historie (Dies kann einen Moment dauern)...';

    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    
    const qGamesOld = query(collection(db, "games"), where("username", "==", user.username), where("mode", "==", currentMode));
    const qGamesNew = query(collection(db, "history"), where("username", "==", user.username), where("mode", "==", currentMode));
    
    const [snapOld, snapNew] = await Promise.all([getDocs(qGamesOld), getDocs(qGamesNew)]);
    
    if (snapOld.empty && snapNew.empty) {
        area.innerHTML = '<div style="color:#ff4757; text-align:center;">Noch keine Spiele in diesem Modus gespielt!</div>';
        btn.disabled = false;
        btn.textContent = '📊 Tier-List Grafik generieren';
        return;
    }
    
    const charRanks = {}; 
    
    const processGame = (docSnap) => {
        const game = docSnap.data();
        let ranking = game.ranking;
        if (!ranking) {
            ranking = [];
            for (let i = 1; i <= 5; i++) {
                if (game[`character${i}`]) ranking.push({ name: game[`character${i}`], rank: i });
            }
        }
        
        if (ranking && ranking.length > 0) {
            ranking.forEach((char, idx) => {
                if (!charRanks[char.name]) charRanks[char.name] = { sum: 0, count: 0 };
                const maxIdx = ranking.length - 1;
                const normalizedRank = maxIdx > 0 ? ((idx / maxIdx) * 4) + 1 : 1;
                charRanks[char.name].sum += normalizedRank;
                charRanks[char.name].count++;
            });
        }
    };

    snapOld.forEach(processGame);
    snapNew.forEach(processGame);

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

    const tiers = { S: [], A: [], B: [], C: [], D: [], E: [], F: [] };

    for (const [name, stats] of Object.entries(charRanks)) {
        const avg = stats.sum / stats.count; 
        
        let tier = 'F';
        if (avg <= 1.3) tier = 'S';
        else if (avg <= 1.9) tier = 'A';
        else if (avg <= 2.5) tier = 'B';
        else if (avg <= 3.1) tier = 'C';
        else if (avg <= 3.7) tier = 'D';
        else if (avg <= 4.3) tier = 'E';

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
            ${renderTierRow('E', '#bf7fff', tiers.E)}
            ${renderTierRow('F', '#ff7fff', tiers.F)}
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
    const { collection, query, where, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    
    const qGamesOld = query(collection(db, "games"), where("username", "==", user.username), where("mode", "==", currentMode));
    const qGamesNew = query(collection(db, "history"), where("username", "==", user.username), where("mode", "==", currentMode));
    
    const [snapOld, snapNew] = await Promise.all([getDocs(qGamesOld), getDocs(qGamesNew)]);
    
    if (snapOld.empty && snapNew.empty) {
        area.innerHTML = ''; return;
    }
    
    const charRanks = {}; 
    const processGame = (docSnap) => {
        const game = docSnap.data();
        let ranking = game.ranking;
        if (!ranking) {
            ranking = [];
            for (let i = 1; i <= 5; i++) {
                if (game[`character${i}`]) ranking.push({ name: game[`character${i}`], rank: i });
            }
        }
        
        if (ranking && ranking.length > 0) {
            ranking.forEach((char, idx) => {
                if (!charRanks[char.name]) charRanks[char.name] = { sum: 0, count: 0 };
                const maxIdx = ranking.length - 1;
                const normalizedRank = maxIdx > 0 ? ((idx / maxIdx) * 4) + 1 : 1;
                charRanks[char.name].sum += normalizedRank;
                charRanks[char.name].count++;
            });
        }
    };
    snapOld.forEach(processGame);
    snapNew.forEach(processGame);

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
        let gRank = globalRanks[name];
        if (gRank === undefined) gRank = 3.0; // Fallback to exact middle if community hasn't ranked it yet
        
        const diff = Math.abs(userAvg - gRank);
        if (stats.count >= 2 && diff > maxDiff) {
            maxDiff = diff;
            delusionChar = name;
            delusionUserAvg = userAvg;
            delusionGlobalAvg = gRank;
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