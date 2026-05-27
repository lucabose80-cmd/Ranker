import { LEGENDARY_POOL } from './data-starwars.js';
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
    
    const useSpecial = document.getElementById('profile-special-avatar-toggle')?.checked;
    
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);

    sortedChars.forEach(char => {
        const isDiscovered = user.discovered && user.discovered.includes(char.name);
        const card = document.createElement('div');
        
        let targetImg = char.img;
        let isLegSpecial = false;
        if (useSpecial) {
            const hasLegendary = inventory.some(c => c.charName === char.name && (c.rarity === 'legendary' || user.role === 'admin' || user.isTestUser));
            if (hasLegendary && LEGENDARY_POOL && LEGENDARY_POOL[char.name]) {
                targetImg = LEGENDARY_POOL[char.name].specialImg;
                isLegSpecial = true;
            }
        }
        
        if (isDiscovered) {
            const isNew = !seenIds.includes(char.name);
            card.className = `lexikon-card avatar-card ${currentAvatar === targetImg ? 'selected' : ''}`;
            if (isLegSpecial) {
                card.style.border = '2px solid #ffd700';
                card.style.boxShadow = '0 0 10px #ffd700';
            }
            card.innerHTML = `<img src="${targetImg}"><span>${char.name}${isNew ? ' <span style="background:#ffd700; color:#000; font-size:0.55rem; font-weight:bold; padding:1px 3px; border-radius:3px; margin-left:3px; vertical-align:middle;">NEU</span>' : ''}</span>`;
            
            if (isNew) {
                card.addEventListener('mouseenter', () => markAsSeen(char.name, card), { once: true });
            }
            card.addEventListener('click', async () => {
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                const res = await updateUserProfile(user.displayName, null, targetImg);
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
            document.getElementById('profile-custom-panel').classList.toggle('hidden', target !== 'custom');
            document.getElementById('profile-trades-panel').classList.toggle('hidden', target !== 'trades');
            if (target === 'trades') {
                renderTradesPanel();
            }
        });
    });

    const twinBtn = document.getElementById('twin-search-btn');
    if (twinBtn) {
        twinBtn.onclick = async () => {
            twinBtn.disabled = true;
            twinBtn.textContent = '🔮 Suche läuft...';
            const resultDiv = document.getElementById('twin-search-result');
            resultDiv.classList.remove('hidden');
            resultDiv.innerHTML = `<div class="loader" style="margin: 10px auto;"></div>`;
            
            try {
                const { db } = await import('./firebase-config.js');
                const { collection, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
                
                const freshUser = getCurrentUser();
                if (!freshUser) {
                    resultDiv.textContent = "Fehler: Nicht angemeldet.";
                    return;
                }
                
                // Fetch all scores documents
                const scoresSnap = await getDocs(collection(db, "scores"));
                
                const userAverages = {};
                
                // Aggregate all category lists for each user to get "overall" picks
                scoresSnap.forEach(docSnap => {
                    const docId = docSnap.id;
                    const prefix = `${currentMode}_classic_`;
                    if (!docId.startsWith(prefix) || docId.endsWith('_global')) return;
                    
                    let rest = docId.substring(prefix.length);
                    const cats = ['klon_', 'peak_', 'vehicle_', 'hardcore_', 'waifu_', 'husbando_', 'shounen_'];
                    for (const cat of cats) {
                        if (rest.startsWith(cat)) { rest = rest.substring(cat.length); break; }
                    }
                    const username = rest;
                    
                    if (!userAverages[username]) userAverages[username] = { chars: {}, min: Infinity, max: -Infinity };
                    
                    const otherData = docSnap.data().characters || {};
                    for (const [name, data] of Object.entries(otherData)) {
                        if (!userAverages[username].chars[name]) userAverages[username].chars[name] = { score: 0, count: 0 };
                        userAverages[username].chars[name].score += data.score;
                        userAverages[username].chars[name].count += (data.count || 1);
                    }
                });

                // Calculate Averages and Min/Max for everyone
                for (const [uname, uData] of Object.entries(userAverages)) {
                    uData.avgScores = {};
                    for (const [charName, data] of Object.entries(uData.chars)) {
                        const avg = data.score / data.count;
                        uData.avgScores[charName] = avg;
                        if (avg < uData.min) uData.min = avg;
                        if (avg > uData.max) uData.max = avg;
                    }
                    uData.normalized = {};
                    for (const [charName, avg] of Object.entries(uData.avgScores)) {
                        uData.normalized[charName] = uData.max > uData.min ? (avg - uData.min) / (uData.max - uData.min) : 0.5;
                    }
                }

                const myData = userAverages[freshUser.username];
                if (!myData || Object.keys(myData.chars).length === 0) {
                    resultDiv.innerHTML = `<span style="color:#ff4757;">Du musst zuerst mindestens ein klassisches Spiel in diesem Modus spielen, um Rankings zu haben!</span>`;
                    return;
                }

                let bestTwin = null;
                let highestMatch = -1;
                let bestOverlap = 0;
                let sharedFavs = [];
                
                for (const [otherUsername, otherData] of Object.entries(userAverages)) {
                    if (otherUsername === freshUser.username) continue;
                    
                    let overlapCount = 0;
                    let maeSum = 0;
                    const common = [];
                    
                    for (const name of Object.keys(myData.normalized)) {
                        if (otherData.normalized[name] !== undefined) {
                            overlapCount++;
                            maeSum += Math.abs(myData.normalized[name] - otherData.normalized[name]);
                            if (myData.normalized[name] > 0.6 && otherData.normalized[name] > 0.6) {
                                common.push(name);
                            }
                        }
                    }
                    
                    if (overlapCount >= 1) {
                        const mae = maeSum / overlapCount;
                        const weight = Math.min(overlapCount, 5) / 5;
                        const matchScore = weight * (1 - mae);
                        
                        if (matchScore > highestMatch) {
                            highestMatch = matchScore;
                            bestTwin = otherUsername;
                            bestOverlap = overlapCount;
                            sharedFavs = common.slice(0, 3);
                        }
                    }
                }
                
                if (bestTwin) {
                    const matchPercent = Math.round(highestMatch * 100);
                    let favsText = sharedFavs.length > 0 ? `Gemeinsame Favoriten: <span style="color:#fff;">${sharedFavs.join(', ')}</span>` : 'Keine gemeinsamen Favoriten gefunden.';
                    resultDiv.innerHTML = `
                        <div style="font-weight:bold; color:#a855f7; margin-bottom:5px; font-size:0.95rem;">Dein Star Wars Zwilling gefunden!</div>
                        <div>Spieler: <strong style="color:#fff;">${bestTwin}</strong></div>
                        <div style="margin:5px 0;">Übereinstimmung: <strong style="color:#2ed573; font-size:1.1rem;">${matchPercent}%</strong></div>
                        <div style="font-size:0.8rem; color:#94a3b8; margin-top:5px;">${favsText} <br><span style="font-size:0.75rem;">(${bestOverlap} gemeinsam bewertete Charaktere)</span></div>
                    `;
                } else {
                    resultDiv.innerHTML = `<span style="color:#ffd700;">Keine anderen Spieler mit gemeinsamen Bewertungen in der Datenbank gefunden.</span>`;
                }
            } catch (err) {
                console.error(err);
                resultDiv.textContent = "Fehler bei der Zwillings-Suche.";
            } finally {
                twinBtn.disabled = false;
                twinBtn.textContent = '🔮 Zwillings-Suche';
            }
        };
    }

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

    const specialAvatarToggle = document.getElementById('profile-special-avatar-toggle');
    if (specialAvatarToggle) {
        specialAvatarToggle.addEventListener('change', () => {
            renderAvatarSelection(); renderCustomLookSelection();
        });
    }

    refreshProfileContent();
}

// Wird jedes Mal aufgerufen wenn das Profil geöffnet wird oder der Modus wechselt
export async function refreshProfileContent() {
    const { refreshCurrentUser } = await import('./auth.js');
    const user = await refreshCurrentUser();
    if (!user) return;

    renderAvatarSelection(); renderCustomLookSelection();

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
    const tabTrades = document.getElementById('profile-tab-btn-trades');

    if (tabAvatar) tabAvatar.innerHTML = `Avatare${hasUnseenAvatar ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    if (tabTitle) tabTitle.innerHTML = `Titel${hasUnseenTitle ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    if (tabTheme) tabTheme.innerHTML = `Farbschemas${hasUnseenTheme ? ' <span style="color:#ffd700;">●</span>' : ''}`;
    
    if (tabTrades) {
        import('./firebase-config.js').then(async ({ db }) => {
            const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
            const q = query(collection(db, "trades"), where("receiverId", "==", user.uid), where("status", "==", "pending"), where("mode", "==", currentMode));
            const snap = await getDocs(q);
            const hasIncoming = !snap.empty;
            tabTrades.innerHTML = `Tauschen${hasIncoming ? ' <span style="color:#ffd700;">●</span>' : ''}`;
        }).catch(err => console.error(err));
    }
    
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
        const aUnlockedList = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
        let aLocked = a.secret ? !aUnlockedList.includes(a.id) : gamesPlayed < a.required;
        if (a.condition && a.condition.type === 'bot_defeat') aLocked = !aUnlockedList.includes(a.id);
        const bUnlockedList = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
        let bLocked = b.secret ? !bUnlockedList.includes(b.id) : gamesPlayed < b.required;
        if (b.condition && b.condition.type === 'bot_defeat') bLocked = !bUnlockedList.includes(b.id);
        return (aLocked === bLocked) ? 0 : aLocked ? 1 : -1;
    });

    availableTitles.forEach(t => {
        let isLocked = gamesPlayed < t.required;
        const unlockedList = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
        if (t.condition && t.condition.type === 'bot_defeat') {
            isLocked = !unlockedList.includes(t.id);
        }
        
        if (t.secret) {
            const unlockedList = currentMode === 'starwars' ? (user.unlocked_titles_starwars || []) : (user.unlocked_titles_waifu || []);
            if (!unlockedList.includes(t.id)) { return; }
            isLocked = false;
        }
        
        let reqText = isLocked ? `Benötigt ${t.required} Spiele` : 'Freigeschaltet';
        if (t.condition && t.condition.type === 'bot_defeat' && isLocked) {
            reqText = `Besiege Bot Stufe ${t.condition.level} im Cardgame`;
        }
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
    for (const [oppName, stats] of Object.entries(matchups)) {
        if (stats.losses > meisterLosses) { meisterLosses = stats.losses; meister = oppName; }
    }
    
    let schueler = null; let schuelerWins = 0;
    for (const [oppName, stats] of Object.entries(matchups)) {
        if (oppName !== meister && stats.wins > schuelerWins) { schuelerWins = stats.wins; schueler = oppName; }
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
                        <span>Konto: <span style="color:#00d2d3;">${(user.username && (user.username.toLowerCase() === 'test1' || user.username.toLowerCase() === 'test2')) ? '∞' : (user.credits || 0)} Credits</span></span>
                    </h3>
                    <div style="display: flex; gap: 5px; font-size: 0.75rem; flex-wrap: wrap; margin-top:5px;">
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Classic: ${user['credits_earned_' + currentMode + '_normal'] || 0}/20</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Klon: ${user['credits_earned_' + currentMode + '_klon'] || 0}/20</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Peak: ${user['credits_earned_' + currentMode + '_peak'] || 0}/20</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Vehicle: ${user['credits_earned_' + currentMode + '_vehicle'] || 0}/20</div>
                        <div style="background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid #444;">Hardcore: ${user['credits_earned_' + currentMode + '_hardcore'] || 0}/20</div>
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
                    const isLegSpecial = card.rarity === 'legendary' && LEGENDARY_POOL && LEGENDARY_POOL[card.charName];
                    const bg = `url('${isLegSpecial ? LEGENDARY_POOL[card.charName].specialImg : charObj.img}')`;
                    let rarityBorder = '3px solid #111';
                    if (card.rarity === 'rare') rarityBorder = '3px solid #ff9f43';
                    if (card.rarity === 'epic') rarityBorder = '3px solid #9b59b6';
                    if (card.rarity === 'legendary') rarityBorder = '3px solid #ffd700';
                    
                    html += `<div class="album-showcase-slot" data-slot="${i}" ondragover="event.preventDefault()" ondrop="window.dropCardToShowcase(event, ${i})" style="width:80px; height:120px; border-radius:8px; background-size:cover; background-position:center; background-image:${bg}; border:${rarityBorder}; position:relative; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.5);">
                        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.8); color:#fff; font-size:0.6rem; text-align:center; padding:3px; border-bottom-left-radius:5px; border-bottom-right-radius:5px;">${card.charName}</div>
                    </div>`;
                } else {
                    html += `<div class="album-showcase-slot" data-slot="${i}" ondragover="event.preventDefault()" ondrop="window.dropCardToShowcase(event, ${i})" style="width:80px; height:120px; border-radius:8px; background:rgba(0,0,0,0.5); border:1px dashed #555; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:#666; font-size:2rem;">+</span></div>`;
                }
            } else {
                html += `<div class="album-showcase-slot" data-slot="${i}" ondragover="event.preventDefault()" ondrop="window.dropCardToShowcase(event, ${i})" style="width:80px; height:120px; border-radius:8px; background:rgba(0,0,0,0.5); border:1px dashed #555; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span style="color:#666; font-size:2rem;">+</span></div>`;
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

window.renderCommunityAlbum = async function(user, containerId, filterPack = 'all', sortMode = 'rarity_desc') {
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);
    const albumGrid = document.getElementById(containerId);
    if (!albumGrid) return;
    
    albumGrid.innerHTML = '';
    albumGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:25px; max-height:400px; overflow-y:auto; padding: 10px;';
    
    let isPackView = (filterPack && filterPack !== 'all');
    const grouped = {};
    if (isPackView) {
        const localBoosters = [
            { id: 'starwars_all', filter: (char) => true },
            { id: 'starwars_klon', filter: (char) => char.tags && char.tags.includes('klon') && (!char.tags || !char.tags.includes('vehicle')) },
            { id: 'starwars_jedi_sith', filter: (char) => {
                if (char.tags && char.tags.includes('vehicle')) return false;
                if (char.tags && (char.tags.includes('jedi') || char.tags.includes('sith'))) return true;
                if (char.name === 'General Grievous' || char.name === 'Asajj Ventress') return true;
                return false;
            }}
        ];
        const booster = localBoosters.find(b => b.id === filterPack);
        if (booster) {
            const packPool = activeCharacterDatabase.filter(c => booster.filter(c));
            packPool.forEach(c => { grouped[c.name] = []; });
        }
    }
    inventory.forEach(c => {
        if (isPackView && !grouped.hasOwnProperty(c.charName)) return; // Card not part of this pack's pool
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });
    if (!isPackView) {
        Object.keys(grouped).forEach(k => {
            if (grouped[k].length === 0) delete grouped[k];
        });
    }
    if (Object.keys(grouped).length === 0) {
        albumGrid.innerHTML = '<div style="color:#666; grid-column: 1 / -1; text-align:center; padding: 20px;">Keine Karten gefunden.</div>';
        return;
    }


    const rarVal = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
    const RARITY_BORDERS = {
        'common': '3px solid #111',
        'rare': '3px solid #ff9f43',
        'epic': '3px solid #9b59b6',
        'legendary': '3px solid #ffd700'
    };

    const charsToRender = Object.keys(grouped);
    const sortedChars = charsToRender.sort((a,b) => {
        const highestA = grouped[a].length > 0 ? Math.max(...grouped[a].map(c => rarVal[c.rarity])) : 0;
        const highestB = grouped[b].length > 0 ? Math.max(...grouped[b].map(c => rarVal[c.rarity])) : 0;
        
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
        stackContainer.style.cssText = `position:relative; width:100%; aspect-ratio:2/3; margin-bottom: ${stackOffset}px; margin-right: ${stackOffset}px; cursor:pointer;`;
        
        stackContainer.draggable = true;
        stackContainer.ondragstart = (e) => {
            const topCard = cards[0];
            e.dataTransfer.setData('application/json', JSON.stringify({
                charName: topCard.charName,
                rarity: topCard.rarity,
                boosterId: topCard.boosterId
            }));
        };
        stackContainer.onclick = () => { if (cards.length > 0) window.openCardUpgradeModal(charName, cards, user); };
        if (cards.length === 0) {
            stackContainer.style.cssText = `position:relative; width:100%; aspect-ratio:2/3; margin-bottom: 0px; margin-right: 0px;`;
            const card = document.createElement('div');
            card.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background-image:url('${charObj.img}'); background-size:cover; background-position:center; border-radius:6px; border:3px solid #333; box-shadow: -2px -2px 5px rgba(0,0,0,0.5); overflow:hidden; filter: grayscale(100%) brightness(0.4); opacity: 0.6;`;
            stackContainer.appendChild(card);
            const missingText = document.createElement('div');
            missingText.textContent = "Fehlt";
            missingText.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-15deg); color:#fff; font-weight:bold; font-size:1.2rem; text-shadow: 0 0 5px #000; z-index:10; opacity: 0.8;";
            stackContainer.appendChild(missingText);
        } else {
            cards.slice(0, 5).forEach((c, idx) => {
            const card = document.createElement('div');
            const z = cards.length - idx;
            const offset = idx * 4;
            
            let isLegSpecial = false;
            let specialImg = '';
            if (c.rarity === 'legendary' && LEGENDARY_POOL && LEGENDARY_POOL[charName]) {
                isLegSpecial = true;
                specialImg = LEGENDARY_POOL[charName].specialImg;
            }
            
            card.style.cssText = `position:absolute; top:${offset}px; left:${offset}px; width:100%; height:100%; background-image:url('${charObj.img}'); background-size:cover; background-position:center; border-radius:6px; border:${RARITY_BORDERS[c.rarity] || '3px solid #111'}; z-index:${z}; box-shadow: -2px -2px 5px rgba(0,0,0,0.5); overflow:hidden; ${c.rarity === 'legendary' ? 'animation: legendary-flicker 1.5s infinite;' : ''}`;
            
            if (isLegSpecial) {
                setTimeout(() => {
                    card.style.transition = 'filter 0.5s ease-in-out';
                    card.style.filter = 'brightness(2) contrast(1.5) drop-shadow(0 0 10px #ffd700)';
                    setTimeout(() => {
                        card.style.backgroundImage = `url('${specialImg}')`;
                        card.style.filter = 'brightness(1) contrast(1)';
                    }, 500);
                }, 400 + Math.random() * 400);
            }
            
            if (c.rarity === 'epic' && idx === 0) {
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
            
            stackContainer.appendChild(card); }); } albumGrid.appendChild(stackContainer);
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
            <div class="modal-content" style="position:relative; max-width:400px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; max-height:80vh; overflow-y:auto;">
                <h3 style="margin-top:0;">Trophäe auswählen</h3>
                <div id="showcase-items-list" style="display:flex; flex-direction:column; gap:10px;"></div>
                <span id="close-showcase-modal" class="close-btn" style="position:absolute; right:15px; top:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-showcase-modal').addEventListener('click', () => modal.classList.add('hidden'));
        const escProfile = (e) => { if(e.key === "Escape") modal.classList.add("hidden"); };
        document.addEventListener("keydown", escProfile);
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
            <div class="modal-content" style="position:relative; max-width:500px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; max-height:80vh; overflow-y:auto;">
                <h3 style="margin-top:0;">Karte für Showcase wählen</h3>
                <div id="album-showcase-items-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:10px;"></div>
                <span id="close-album-showcase-modal" class="close-btn" style="position:absolute; right:15px; top:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-album-showcase-modal').addEventListener('click', () => modal.classList.add('hidden'));
        const escProfile = (e) => { if(e.key === "Escape") modal.classList.add("hidden"); };
        document.addEventListener("keydown", escProfile);
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
                // The new system uses points (avg. multiplier ~3). globalScore is approx (6 - rank) * 3.
                // So rank = 6 - (globalScore / 3). We clamp it between 1 and 5.
                let estimatedRank = 6 - (globalScore / 3);
                if(estimatedRank < 1) estimatedRank = 1;
                if(estimatedRank > 5) estimatedRank = 5;
                
                globalRanks[c.name] = estimatedRank;
            });
        }
    } catch(e) {}

    let maxDiff = -1;
    let delusionChar = null;
    let delusionUserAvg = 0;
    let delusionGlobalAvg = 0;

    for (const [name, stats] of Object.entries(charRanks)) {
        const userAvg = stats.sum / stats.count;
        const gRank = globalRanks[name];
        // Skip characters that have never been globally ranked
        if (gRank === undefined) continue;
        
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

export async function renderTradesPanel() {
    const incomingContainer = document.getElementById('profile-incoming-trades');
    const outgoingContainer = document.getElementById('profile-outgoing-trades');
    if (!incomingContainer || !outgoingContainer) return;
    
    incomingContainer.innerHTML = '<div class="loader" style="margin: 10px auto;"></div>';
    outgoingContainer.innerHTML = '<div class="loader" style="margin: 10px auto;"></div>';
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const { db } = await import('./firebase-config.js');
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        
        const qIncoming = query(collection(db, "trades"), where("receiverId", "==", user.uid), where("status", "==", "pending"), where("mode", "==", currentMode));
        const qOutgoing = query(collection(db, "trades"), where("senderId", "==", user.uid), where("status", "==", "pending"), where("mode", "==", currentMode));
        
        const [snapInc, snapOut] = await Promise.all([getDocs(qIncoming), getDocs(qOutgoing)]);
        
        incomingContainer.innerHTML = '';
        outgoingContainer.innerHTML = '';
        
        if (snapInc.empty) {
            incomingContainer.innerHTML = '<p class="prompt-text" style="color:#64748b; font-size:0.85rem; margin: 0;">Keine eingehenden Anfragen.</p>';
        } else {
            snapInc.forEach(docSnap => {
                const trade = docSnap.data();
                const tradeId = docSnap.id;
                
                const cardRow = document.createElement('div');
                cardRow.className = 'history-card';
                cardRow.style.padding = '10px';
                cardRow.style.marginBottom = '10px';
                cardRow.style.background = 'rgba(0,0,0,0.3)';
                cardRow.style.border = '1px solid #2a3142';
                
                cardRow.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            <strong style="color:#ffd700;">${trade.senderName}</strong> möchte tauschen:
                            <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">
                                Bietet dir: <span style="color:#fff; font-weight:bold;">${trade.giveCard.charName} (${trade.giveCard.rarity.toUpperCase()})</span>
                            </div>
                            <div style="font-size:0.85rem; color:#94a3b8;">
                                Möchte von dir: <span style="color:#fff; font-weight:bold;">${trade.takeCard.charName} (${trade.takeCard.rarity.toUpperCase()})</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:5px;">
                            <button class="rank-btn accept-trade-btn" data-id="${tradeId}" style="height:auto; padding:5px 12px; font-size:0.8rem; background:#2ed573; border-color:#2ed573; color:#fff; width:auto; margin:0;">Akzeptieren</button>
                            <button class="rank-btn decline-trade-btn" data-id="${tradeId}" style="height:auto; padding:5px 12px; font-size:0.8rem; background:#ff4757; border-color:#ff4757; color:#fff; width:auto; margin:0;">Ablehnen</button>
                        </div>
                    </div>
                `;
                incomingContainer.appendChild(cardRow);
            });
            
            incomingContainer.querySelectorAll('.accept-trade-btn').forEach(btn => {
                btn.addEventListener('click', () => handleAcceptTrade(btn.dataset.id));
            });
            incomingContainer.querySelectorAll('.decline-trade-btn').forEach(btn => {
                btn.addEventListener('click', () => handleDeclineTrade(btn.dataset.id));
            });
        }
        
        if (snapOut.empty) {
            outgoingContainer.innerHTML = '<p class="prompt-text" style="color:#64748b; font-size:0.85rem; margin: 0;">Keine gesendeten Anfragen.</p>';
        } else {
            snapOut.forEach(docSnap => {
                const trade = docSnap.data();
                const tradeId = docSnap.id;
                
                const cardRow = document.createElement('div');
                cardRow.className = 'history-card';
                cardRow.style.padding = '10px';
                cardRow.style.marginBottom = '10px';
                cardRow.style.background = 'rgba(0,0,0,0.3)';
                cardRow.style.border = '1px solid #2a3142';
                
                cardRow.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            Anfrage an <strong style="color:#ffd700;">${trade.receiverName}</strong>:
                            <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">
                                Du bietest: <span style="color:#fff; font-weight:bold;">${trade.giveCard.charName} (${trade.giveCard.rarity.toUpperCase()})</span>
                            </div>
                            <div style="font-size:0.85rem; color:#94a3b8;">
                                Du forderst: <span style="color:#fff; font-weight:bold;">${trade.takeCard.charName} (${trade.takeCard.rarity.toUpperCase()})</span>
                            </div>
                        </div>
                        <button class="rank-btn cancel-trade-btn" data-id="${tradeId}" style="height:auto; padding:5px 12px; font-size:0.8rem; background:#ff4757; border-color:#ff4757; color:#fff; width:auto; margin:0;">Zurückziehen</button>
                    </div>
                `;
                outgoingContainer.appendChild(cardRow);
            });
            
            outgoingContainer.querySelectorAll('.cancel-trade-btn').forEach(btn => {
                btn.addEventListener('click', () => handleCancelTrade(btn.dataset.id));
            });
        }
        
    } catch(err) {
        console.error(err);
        incomingContainer.innerHTML = '<p class="prompt-text" style="color:#ff4757;">Fehler beim Laden.</p>';
        outgoingContainer.innerHTML = '<p class="prompt-text" style="color:#ff4757;">Fehler beim Laden.</p>';
    }
}

async function handleAcceptTrade(tradeId) {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const { db } = await import('./firebase-config.js');
        const { doc, getDoc, runTransaction } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        
        await runTransaction(db, async (transaction) => {
            const tradeRef = doc(db, "trades", tradeId);
            const tradeSnap = await transaction.get(tradeRef);
            if (!tradeSnap.exists()) throw new Error("Tauschanfrage existiert nicht mehr.");
            
            const trade = tradeSnap.data();
            if (trade.status !== 'pending') throw new Error("Diese Anfrage ist nicht mehr ausstehend.");
            
            const senderRef = doc(db, "users", trade.senderId);
            const receiverRef = doc(db, "users", trade.receiverId);
            
            const [senderSnap, receiverSnap] = await Promise.all([
                transaction.get(senderRef),
                transaction.get(receiverRef)
            ]);
            
            if (!senderSnap.exists() || !receiverSnap.exists()) throw new Error("Ein beteiligter Spieler wurde nicht gefunden.");
            
            const senderData = senderSnap.data();
            const receiverData = receiverSnap.data();
            
            const field = `inventory_${trade.mode}`;
            const senderInv = senderData[field] || [];
            const receiverInv = receiverData[field] || [];
            
            const senderCardIdx = senderInv.findIndex(c => c.charName === trade.giveCard.charName && c.rarity === trade.giveCard.rarity);
            if (senderCardIdx === -1) throw new Error(`${trade.senderName} besitzt die angebotene Karte nicht mehr.`);
            
            const receiverCardIdx = receiverInv.findIndex(c => c.charName === trade.takeCard.charName && c.rarity === trade.takeCard.rarity);
            if (receiverCardIdx === -1) throw new Error(`Du besitzt die geforderte Karte nicht mehr.`);
            
            const giveCardObj = senderInv.splice(senderCardIdx, 1)[0];
            const takeCardObj = receiverInv.splice(receiverCardIdx, 1)[0];
            
            senderInv.push({
                ...takeCardObj,
                timestamp: Date.now()
            });
            
            receiverInv.push({
                ...giveCardObj,
                timestamp: Date.now()
            });
            
            transaction.update(senderRef, { [field]: senderInv });
            transaction.update(receiverRef, { [field]: receiverInv });
            transaction.update(tradeRef, { status: 'accepted' });
        });
        
        const { refreshCurrentUser } = await import('./auth.js');
        await refreshCurrentUser();
        
        alert("Tausch erfolgreich durchgeführt!");
        renderTradesPanel();
    } catch(err) {
        alert("Tausch fehlgeschlagen: " + err.message);
    }
}

async function handleDeclineTrade(tradeId) {
    try {
        const { db } = await import('./firebase-config.js');
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        await updateDoc(doc(db, "trades", tradeId), { status: 'declined' });
        alert("Tauschanfrage abgelehnt.");
        renderTradesPanel();
    } catch(err) {
        alert("Fehler: " + err.message);
    }
}

async function handleCancelTrade(tradeId) {
    try {
        const { db } = await import('./firebase-config.js');
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        await updateDoc(doc(db, "trades", tradeId), { status: 'cancelled' });
        alert("Tauschanfrage zurückgezogen.");
        renderTradesPanel();
    } catch(err) {
        alert("Fehler: " + err.message);
    }
}
window.dropCardToShowcase = async function(event, slotIndex) {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData('application/json');
    if (!dataStr) return;
    try {
        const cardData = JSON.parse(dataStr);
        const { getCurrentUser } = await import('./auth.js');
        const { currentMode } = await import('./mode-state.js');
        const user = getCurrentUser();
        if (!user) return;
        
        let showcaseField = currentMode === 'starwars' ? 'album_showcase_starwars' : 'album_showcase_waifu';
        const currentShowcase = user[showcaseField] || [null, null, null];
        
        while(currentShowcase.length < 3) currentShowcase.push(null);
        
        currentShowcase[slotIndex] = cardData;
        user[showcaseField] = currentShowcase;
        
        const { db } = await import('./firebase-config.js');
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');
        await updateDoc(doc(db, 'users', user.uid), {
            [showcaseField]: currentShowcase
        });
        
        const { refreshProfileContent } = await import('./profile.js');
        refreshProfileContent();
        
    } catch(e) {
        console.error('Drop error', e);
    }
};

export async function renderCustomLookSelection() {
    const grid = document.getElementById('custom-look-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const user = getCurrentUser();
    if (!user) return;
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);
    const charLooks = currentMode === 'starwars' ? (user.custom_look_starwars || {}) : (user.custom_look_waifu || {});
    
    const charsWithLegendary = [];
    inventory.forEach(c => {
        if ((c.rarity === 'legendary' || user.role === 'admin' || user.isTestUser) && LEGENDARY_POOL && LEGENDARY_POOL[c.charName] && !charsWithLegendary.includes(c.charName)) {
            charsWithLegendary.push(c.charName);
        }
    });
    
    charsWithLegendary.forEach(charName => {
        const dbChar = activeCharacterDatabase.find(c => c.name === charName);
        if (!dbChar || !LEGENDARY_POOL || !LEGENDARY_POOL[charName]) return;
        
        const currentSelected = charLooks[charName] || 'standard';
        
        const card = document.createElement('div');
        card.style.cssText = 'background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid #333; text-align:center;';
        
        card.innerHTML = `
            <h5 style='margin:0 0 10px 0; color:#fff;'>${charName}</h5>
            <div style='display:flex; justify-content:center; gap:10px;'>
                <div class='custom-look-option ${currentSelected === 'standard' ? 'selected' : ''}' data-type='standard' style='cursor:pointer; padding:5px; border-radius:5px; border:2px solid ${currentSelected === 'standard' ? '#2ed573' : 'transparent'};'>
                    <img src='${dbChar.img}' style='width:60px; height:60px; object-fit:cover; border-radius:5px; display:block; margin:0 auto 5px;'>
                    <div style='font-size:0.7rem; color:#aaa;'>Standard</div>
                </div>
                <div class='custom-look-option ${currentSelected === 'legendary' ? 'selected' : ''}' data-type='legendary' style='cursor:pointer; padding:5px; border-radius:5px; border:2px solid ${currentSelected === 'legendary' ? '#ffd700' : 'transparent'};'>
                    <img src='${LEGENDARY_POOL[charName].specialImg}' style='width:60px; height:60px; object-fit:cover; border-radius:5px; display:block; margin:0 auto 5px;'>
                    <div style='font-size:0.7rem; color:#ffd700;'>Legendär</div>
                </div>
            </div>
        `;
        
        const opts = card.querySelectorAll('.custom-look-option');
        opts.forEach(opt => {
            opt.addEventListener('click', async () => {
                const type = opt.dataset.type;
                charLooks[charName] = type;
                const field = currentMode === 'starwars' ? 'custom_look_starwars' : 'custom_look_waifu';
                user[field] = charLooks;
                localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
                const { db } = await import('./firebase-config.js');
                const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');
                await updateDoc(doc(db, 'users', user.uid), {
                    [field]: charLooks
                });
                renderCustomLookSelection();
            });
        });
        
        grid.appendChild(card);
    });
    
    if (grid.innerHTML === '') {
        grid.innerHTML = '<p class="prompt-text" style="grid-column: 1 / -1;">Keine legendären Charaktere freigeschaltet.</p>';
    }
}



// Additional call added via script









// Additional call added via script
window.openCardUpgradeModal = function(charName, cards, user) {
    let modal = document.getElementById('card-upgrade-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'card-upgrade-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);
    }

    const rarityCounts = { 'common': 0, 'rare': 0, 'epic': 0, 'legendary': 0 };
    cards.forEach(c => rarityCounts[c.rarity]++);
    
    let html = `
        <div class="modal-content" style="position:relative; max-width:500px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; text-align:center;">
            <span id="close-upgrade-modal" class="close-btn" style="position:absolute; right:15px; top:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
            <h2 style="color:#ffd700; margin-top:0;">${charName} - Upgrades</h2>
            <div style="display:flex; justify-content:space-around; margin:20px 0;">
                <div>
                    <div style="color:#888; font-weight:bold;">Gewöhnlich</div>
                    <div style="font-size:1.5rem;">${rarityCounts.common}x</div>
                </div>
                <div>
                    <div style="color:#ff9f43; font-weight:bold;">Selten</div>
                    <div style="font-size:1.5rem;">${rarityCounts.rare}x</div>
                </div>
                <div>
                    <div style="color:#9b59b6; font-weight:bold;">Episch</div>
                    <div style="font-size:1.5rem;">${rarityCounts.epic}x</div>
                </div>
            </div>
            
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
    `;

    if (rarityCounts.common >= 5) {
        html += `<button id="btn-upgrade-common" class="rank-btn" style="background:#ff9f43; color:#000;">5 Gewöhnlich ➔ 1 Selten</button>`;
    }
    
    if (rarityCounts.rare >= 5) {
        const hasEpic = rarityCounts.epic > 0;
        const btnText = hasEpic ? "5 Selten ➔ 20 Kyber Kristalle (Duplikat)" : "5 Selten ➔ 1 Episch";
        html += `<button id="btn-upgrade-rare" class="rank-btn" style="background:#9b59b6; color:#fff;">${btnText}</button>`;
    }
    
    html += `</div></div>`;
    modal.innerHTML = html;
    modal.classList.remove('hidden');

    document.getElementById('close-upgrade-modal').onclick = () => modal.classList.add('hidden');
    
    const btnCommon = document.getElementById('btn-upgrade-common');
    if (btnCommon) {
        btnCommon.onclick = () => window.processCardUpgrade(charName, 'common', user);
    }
    
    const btnRare = document.getElementById('btn-upgrade-rare');
    if (btnRare) {
        btnRare.onclick = () => window.processCardUpgrade(charName, 'rare', user);
    }
};

window.processCardUpgrade = async function(charName, fromRarity, user) {
    const field = currentMode === 'starwars' ? 'inventory_starwars' : 'inventory_waifu';
    const inventory = user[field] || [];
    
    let count = 0;
    const indicesToRemove = [];
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].charName === charName && inventory[i].rarity === fromRarity) {
            indicesToRemove.push(i);
            count++;
            if (count === 5) break;
        }
    }
    
    if (count < 5) return;
    
    indicesToRemove.sort((a,b) => b-a).forEach(idx => {
        inventory.splice(idx, 1);
    });
    
    let toRarity = fromRarity === 'common' ? 'rare' : 'epic';
    let addedKyber = 0;
    let notificationText = `Karte auf ${toRarity.toUpperCase()} geupgradet!`;
    
    if (toRarity === 'epic') {
        const hasEpic = inventory.some(c => c.charName === charName && c.rarity === 'epic');
        if (hasEpic) {
            addedKyber = 20;
            const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
            user[kyberField] = (user[kyberField] || 0) + addedKyber;
            notificationText = 'Duplikat aufgelöst! +20 Kyber Kristalle erhalten.';
        } else {
            inventory.push({ charName: charName, rarity: 'epic', timestamp: Date.now(), boosterId: 'starwars_all' });
        }
    } else {
        inventory.push({ charName: charName, rarity: 'rare', timestamp: Date.now(), boosterId: 'starwars_all' });
    }
    
    user[field] = inventory;
    
    try {
        const { doc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');
        
        const updates = { [field]: inventory };
        if (addedKyber > 0) {
            const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
            updates[kyberField] = increment(addedKyber);
        }
        
        await updateDoc(doc(db, "users", user.uid), updates);
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        
        alert(notificationText);
        
        document.getElementById('card-upgrade-modal').classList.add('hidden');
        window.renderCommunityAlbum(user, 'profile-album-grid-tab', document.getElementById('album-pack-filter')?.value || 'all');
    } catch(e) {
        console.error("Fehler beim Upgrade:", e);
        alert("Ein Fehler ist aufgetreten.");
    }
};

