import { LEGENDARY_POOL } from './data-starwars.js';
// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp, getDocs, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { trackRead, trackWrite } from './tracker.js';
import { TITLES } from './titles.js';
import { THEMES } from './themes.js';
import { openPrivateChat } from './private-chat.js';
import { activeCharacterDatabase } from './theme.js';

const REACTION_EMOJIS = ['👍', '😂', '❤️', '😢', '😡'];

let chatUnsubscribe = null;
let onlineInterval = null;
let allUsersCache = [];
let isOnlineListBound = false;

export function stopCommunity() {
    if(chatUnsubscribe) chatUnsubscribe();
    if(onlineInterval) clearInterval(onlineInterval);
    chatUnsubscribe = null;
    onlineInterval = null;
    allUsersCache = [];
}

export function initCommunity() {
    const user = getCurrentUser();
    if(!user) return;

    // 1. Live Chat
    const chatContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if(chatUnsubscribe) chatUnsubscribe();
    const qChat = query(collection(db, "chat"), orderBy("timestamp", "desc"), limit(25));
    
    let isFirstLoad = true;

    chatUnsubscribe = onSnapshot(qChat, (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
        
        chatContainer.innerHTML = '';
        let hasNewFromOthers = false;

        messages.forEach(msg => {
            const isSelf = msg.username === user.username;
            if (!isSelf && !isFirstLoad) hasNewFromOthers = true;
            
            const modeText = msg.userMode === 'starwars' ? 'SW' : 'Anime';
            const modeClass = msg.userMode === 'starwars' ? 'tag-sw' : 'tag-anime';
            const avatarHtml = msg.avatar ? `<img src="${msg.avatar}">` : `<div class="mini-avatar" style="background:#444"></div>`;
            const titleHtml = msg.title && msg.title !== 'Kein Titel' ? `<span style="font-size:0.6rem; color:#ffd700; font-weight:bold; margin-left:5px; text-transform:uppercase;">${msg.title}</span>` : '';
            
            let themeStyle = '';
            if (msg.theme) {
                const themeData = THEMES[msg.userMode || 'starwars']?.find(t => t.id === msg.theme);
                if (themeData && themeData.preview) {
                    if (themeData.preview.includes('gradient')) {
                        themeStyle = `border-image: ${themeData.preview} 1; border-width: 2px; border-style: solid; background: #1c2331;`;
                    } else {
                        themeStyle = `border: 2px solid ${themeData.preview}; box-shadow: 0 0 5px ${themeData.preview}40; background: #1c2331;`;
                    }
                }
            }
            
            // Render reactions
            const reactions = msg.reactions || {};
            const reactionHtml = REACTION_EMOJIS.map(emoji => {
                const list = reactions[emoji] || [];
                const count = list.length;
                const userReacted = list.includes(user.username);
                return `
                    <button class="chat-reaction-btn${userReacted ? ' active' : ''}" data-emoji="${emoji}" data-msgid="${msg.id}" style="background: rgba(255,255,255,0.05); border: 1px solid ${userReacted ? 'var(--t-color, #ffd700)' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;">
                        <span>${emoji}</span>
                        ${count > 0 ? `<span style="font-size: 0.75rem; font-weight: bold; color: ${userReacted ? 'var(--t-color, #ffd700)' : '#aaa'}">${count}</span>` : ''}
                    </button>
                `;
            }).join('');

            chatContainer.innerHTML += `
                <div class="chat-msg ${isSelf ? 'self' : ''}">
                    ${avatarHtml}
                    <div class="chat-msg-body">
                        <span class="chat-username">
                            <span class="chat-mode-tag ${modeClass}">${modeText}</span> ${msg.displayName} ${titleHtml}
                        </span>
                        <div class="chat-msg-content" style="${themeStyle}">${msg.text}</div>
                        <div class="chat-reactions" style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
                            ${reactionHtml}
                        </div>
                    </div>
                </div>
            `;
        });

        // Add reaction listeners
        chatContainer.querySelectorAll('.chat-reaction-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const msgId = btn.dataset.msgid;
                const emoji = btn.dataset.emoji;
                
                const targetMsg = messages.find(m => m.id === msgId);
                if (!targetMsg) return;
                
                const currentReactions = targetMsg.reactions || {};
                const list = currentReactions[emoji] || [];
                
                let newList;
                if (list.includes(user.username)) {
                    newList = list.filter(u => u !== user.username);
                } else {
                    newList = [...list, user.username];
                }
                
                const msgRef = doc(db, "chat", msgId);
                try {
                    const updateObj = {};
                    updateObj[`reactions.${emoji}`] = newList;
                    await updateDoc(msgRef, updateObj);
                    trackWrite(1);
                } catch(e) {
                    console.error("Fehler beim Speichern der Reaktion:", e);
                }
            });
        });

        chatContainer.scrollTop = chatContainer.scrollHeight;

        if (hasNewFromOthers) {
            const chatWidget = document.getElementById('chat-widget');
            if (chatWidget && chatWidget.classList.contains('hidden')) {
                const btn = document.getElementById('chat-toggle-btn');
                if (btn) btn.classList.add('has-new');
            }
        }
        
        isFirstLoad = false;
    });

    const sendMessage = async () => {
        const text = input.value.trim();
        if(!text) return;
        input.value = '';
        
        // Dynamisch den zur Laufzeit aktuellen Avatar für die Nachricht wählen
        const activeAvatar = currentMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
        
        try {
            await addDoc(collection(db, "chat"), {
                username: user.username,
                displayName: user.displayName,
                avatar: activeAvatar || '',
                userMode: currentMode, // Welches Game der Schreiber gerade offen hat
                title: currentMode === 'starwars' ? (user.activeTitle_starwars || '') : (user.activeTitle_waifu || ''),
                theme: currentMode === 'starwars' ? (user.activeTheme_starwars || '') : (user.activeTheme_waifu || ''),
                text: text,
                timestamp: Timestamp.now()
            });
            trackWrite(1);
        } catch(e) {}
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

    // 2. Online Tracker – initiale Nutzerliste einmal laden, danach nur aktive User nachladen
    if(onlineInterval) {
        clearInterval(onlineInterval);
        onlineInterval = null;
    }
    
    const updateOnlineTracker = async (forceFullRefresh = false) => {
        const user = getCurrentUser(); // Neu laden, damit Titeländerungen wirken
        const onlineList = document.getElementById('online-users-list');
        if(!onlineList) return;
        
        try {
            const now = Date.now();
            const ACTIVE_THRESHOLD_MS = 120000; // 2 Minuten
            const activeSince = Timestamp.fromDate(new Date(now - ACTIVE_THRESHOLD_MS));

            if (forceFullRefresh || allUsersCache.length === 0) {
                const allUsersSnap = await getDocs(query(collection(db, "users"), limit(100)));
                trackRead(allUsersSnap.size);

                allUsersCache = [];
                allUsersSnap.forEach(docSnap => {
                    const u = docSnap.data();
                    if (u.username === 'admin' || u.username === 'test1' || u.username === 'test2') return;
                    allUsersCache.push({ ...u, uid: docSnap.id, username: u.username || docSnap.id, _isOnline: false });
                });
            }

            const activeUsersSnap = await getDocs(query(collection(db, "users"), where("lastActive", ">", activeSince), limit(100)));
            trackRead(activeUsersSnap.size);

            const activeUsers = new Set();
            activeUsersSnap.forEach(docSnap => {
                const u = docSnap.data();
                if (u.username === 'admin' || u.username === 'test1' || u.username === 'test2') return;
                activeUsers.add(docSnap.id);

                const existingIndex = allUsersCache.findIndex(item => item.uid === docSnap.id);
                if (existingIndex >= 0) {
                    allUsersCache[existingIndex] = { ...allUsersCache[existingIndex], ...u, uid: docSnap.id, username: u.username || docSnap.id };
                } else {
                    allUsersCache.push({ ...u, uid: docSnap.id, username: u.username || docSnap.id, _isOnline: false });
                }
            });

            let onlineCount = 0;
            const allUsers = allUsersCache.map(u => {
                const isOnline = activeUsers.has(u.uid);
                if (isOnline) onlineCount++;
                return { ...u, _isOnline: isOnline };
            });

            // Online zuerst, dann alphabetisch
            allUsers.sort((a, b) => {
                if (a._isOnline && !b._isOnline) return -1;
                if (!a._isOnline && b._isOnline) return 1;
                return (a.displayName || a.username).localeCompare(b.displayName || b.username);
            });

            onlineList.innerHTML = '';

            // Aktuellen User immer ganz oben (immer online), falls kein Geister-Account
            if (!user.isTestUser) {
                const uMode = currentMode;
                const userAvatar = uMode === 'starwars' ? user.avatarStarWars : user.avatarWaifu;
                const avatarHtml = userAvatar ? `<img src="${userAvatar}" class="mini-avatar">` : `<div class="mini-avatar" style="background:#444"></div>`;
                const activeTitle = uMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
                const titleHtml = activeTitle && activeTitle !== 'Kein Titel'
                    ? `<div style="font-size:0.65rem; color:#ffd700; font-weight:bold; margin-top:2px; text-transform:uppercase; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${activeTitle}</div>` : '';

                onlineList.innerHTML += `
                    <div class="online-user-card" style="cursor:pointer;" data-uid="${user.uid}">
                        <div class="online-indicator"></div>
                        ${avatarHtml}
                        <div class="online-user-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; text-align: left;">
                            <strong style="flex: unset; display: flex; align-items: center; min-width: 0;">
                                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.displayName || user.username}</span>
                                <span style="flex-shrink:0; color:#888; font-size:0.8rem; margin-left:5px;">(Du)</span>
                            </strong>
                            ${titleHtml}
                        </div>
                    </div>
                `;
            }

            // Alle anderen User (skip aktueller User)
            allUsers.forEach(u => {
                if (u.uid === user.uid || u.username === user.username) return;
                
                const otherMode = u.activeMode || 'starwars';
                const otherAvatar = otherMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu;
                const otherAvatarHtml = otherAvatar
                    ? `<img src="${otherAvatar}" class="mini-avatar">`
                    : `<div class="mini-avatar" style="background:#333"></div>`;
                const otherTitle = otherMode === 'starwars' ? u.activeTitle_starwars : u.activeTitle_waifu;
                const otherTitleHtml = otherTitle && otherTitle !== 'Kein Titel'
                    ? `<div style="font-size:0.65rem; color:#ffd700; font-weight:bold; margin-top:2px; text-transform:uppercase; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${otherTitle}</div>` : '';

                const offlineCss = u._isOnline ? '' : 'opacity: 0.45; filter: grayscale(0.5);';
                const indicatorClass = u._isOnline ? 'online-indicator' : 'online-indicator offline';

                onlineList.innerHTML += `
                    <div class="online-user-card" style="${offlineCss} cursor:pointer;" data-uid="${u.uid}">
                        <div class="${indicatorClass}"></div>
                        ${otherAvatarHtml}
                        <div class="online-user-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; text-align: left;">
                            <strong style="flex: unset; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.displayName || u.username}</strong>
                            ${otherTitleHtml}
                        </div>
                    </div>
                `;
            });

            document.getElementById('online-count').textContent = onlineCount;
        } catch(e) {
            console.error("Fehler beim Abrufen der Online-User: ", e);
        }
    };

    const refreshBtn = document.getElementById('refresh-online-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => updateOnlineTracker(true));
    }

    const onlineListEl = document.getElementById('online-users-list');
    if (onlineListEl && !isOnlineListBound) {
        onlineListEl.addEventListener('click', (e) => {
            const card = e.target.closest('.online-user-card');
            if (!card) return;
            const uid = card.dataset.uid;
            let clickedUser = null;
            const freshUser = getCurrentUser();
            if (uid === freshUser.uid) {
                clickedUser = freshUser;
            } else {
                clickedUser = allUsersCache.find(u => u.uid === uid);
            }
            if (clickedUser) {
                openUserProfileModal(clickedUser);
            }
        });
        isOnlineListBound = true;
    }

    updateOnlineTracker();
    onlineInterval = setInterval(() => updateOnlineTracker(), 300000);
}

function openUserProfileModal(u) {
    if (!document.getElementById('public-profile-modal')) {
        const modal = document.createElement('div');
        modal.id = 'public-profile-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="cl-modal-box" style="max-width: 900px; width: 95vw; text-align:center; position: relative;">
                <div class="cl-modal-header" style="justify-content: space-between; margin-bottom: 15px;">
                    <h2 style="margin:0;">Spieler-Profil</h2>
                    <button id="close-public-profile-btn" class="text-btn">SCHLIESSEN</button>
                </div>
                <div class="cl-modal-content" id="public-profile-content" style="text-align: left;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-public-profile-btn').addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
    }

    const modal = document.getElementById('public-profile-modal');
    const content = document.getElementById('public-profile-content');
    const user = getCurrentUser();
    if (!user) return;
    
    let progressHtml = '';
    if (currentMode === 'starwars') {
        const swGames = u.gamesPlayed_starwars || 0;
        const swUnlockedList = u.unlocked_titles_starwars || [];
        const swTitles = (TITLES['starwars'] || []).filter(t => {
            const isUnlocked = swUnlockedList.includes(t.id) || (!t.secret && swGames >= t.required);
            if (t.secret && !isUnlocked) return false;
            return isUnlocked;
        }).map(t => t.name);
        const swThemes = u.unlocked_themes_starwars || [];
        const swThemeNames = (THEMES['starwars'] || []).filter(t => t.id.endsWith('_default') || swThemes.includes(t.id)).map(t => t.name);
        
        const favs = u.favorites_starwars || {};
        const nems = u.nemesis_starwars || {};
        let topFav = null, topFavCount = 0;
        for (const [name, count] of Object.entries(favs)) { if (count > topFavCount) { topFavCount = count; topFav = name; } }
        let topNem = null, topNemCount = 0;
        for (const [name, count] of Object.entries(nems)) { if (count > topNemCount) { topNemCount = count; topNem = name; } }
        
        const matchups = u.versusMatchups || {};
        let meister = null, meisterLosses = 0, schueler = null, schuelerWins = 0;
        for (const [oppName, stats] of Object.entries(matchups)) {
            if (stats.losses > meisterLosses) { meisterLosses = stats.losses; meister = oppName; }
            if (stats.wins > schuelerWins) { schuelerWins = stats.wins; schueler = oppName; }
        }
        
        progressHtml = `
            <div style="background:#11151f; padding:15px; border-radius:8px; border:1px solid #2a3142;">
                <h4 style="margin:0 0 10px 0; color:#e2e8f0; border-bottom:1px solid #2a3142; padding-bottom:5px;">Star Wars Fortschritt</h4>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Spiele gespielt: <span style="color:#fff">${swGames}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Titel: <span style="color:#fff">${swTitles.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Themes: <span style="color:#fff">${swThemeNames.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#2ed573; margin-bottom:5px;">Lieblingscharakter: <span style="color:#fff">${topFav ? `${topFav} (${topFavCount}x auf Platz 1)` : '-'}</span></div>
                <div style="font-size:0.85rem; color:#ff4757;">Nemesis: <span style="color:#fff">${topNem ? `${topNem} (${topNemCount}x auf Platz 5)` : '-'}</span></div>
                
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <div style="flex:1; font-size:0.85rem; color:#ff9f43; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; text-align:center;">
                        Meister<br><span style="color:#fff; font-weight:bold;">${meister || '-'}</span>
                    </div>
                    <div style="flex:1; font-size:0.85rem; color:#0abde3; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; text-align:center;">
                        Schüler<br><span style="color:#fff; font-weight:bold;">${schueler || '-'}</span>
                    </div>
                </div>

                <div id="community-machtverirrung-${u.username}"></div>
                
                <div style="margin-top:15px; border-top:1px solid #2a3142; padding-top:10px;">
                    <h5 style="margin:0 0 10px 0; color:#e2e8f0; font-size:0.8rem; text-align:center;">Trophäenschrank</h5>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        ${[0,1,2].map(i => {
                            const item = (u.showcase_starwars || [])[i];
                            let content = '<span style="color:#444; font-size:1.5rem;">+</span>';
                            if (item) {
                                if (item.type === 'title') content = `<div style="color:#ffd700; font-size:0.6rem; font-weight:bold; text-transform:uppercase;">Titel</div><div style="color:#fff; font-size:0.75rem; margin-top:2px; text-align:center;">${item.name}</div>`;
                                else if (item.type === 'theme') content = `<div style="color:#2ed573; font-size:0.6rem; font-weight:bold; text-transform:uppercase;">Theme</div><div style="color:#fff; font-size:0.75rem; margin-top:2px; text-align:center;">${item.name}</div>`;
                            }
                            return `<div style="flex:1; max-width:80px; height:60px; background: rgba(0,0,0,0.5); border: 1px dashed #444; border-radius: 6px; display:flex; flex-direction:column; align-items:center; justify-content:center;">${content}</div>`;
                        }).join('')}
                    </div>
                </div>

                <div style="margin-top:15px; border-top:1px solid #2a3142; padding-top:10px;">
                    <h5 style="margin:0 0 10px 0; color:#e2e8f0; font-size:0.8rem; text-align:center;">Karten Showcase</h5>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        ${[0,1,2].map(i => {
                            const item = (u.album_showcase_starwars || [])[i];
                            if (item) {
                                const dbObj = activeCharacterDatabase.find(c => c.name === item.charName);
                                if (dbObj) {
                                    let border = '2px solid #111';
                                    if(item.rarity==='rare') border='2px solid #ff9f43';
                                    if(item.rarity==='epic') border='2px solid #9b59b6';
                                    if(item.rarity==='legendary') border='2px solid #ffd700';
                                    
                                    let imgPath = dbObj.img;
                                    if(item.rarity==='legendary' && LEGENDARY_POOL && LEGENDARY_POOL[item.charName]) {
                                        imgPath = LEGENDARY_POOL[item.charName].specialImg;
                                    }
                                    
                                    const holo = (item.rarity==='epic') ? `<div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; mix-blend-mode:color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear;"></div>` : '';
                                    const legStyle = (item.rarity==='legendary') ? `animation: legendary-flicker 1.5s infinite;` : '';
                                    return `<div class="community-showcase-card" style="width:60px; height:90px; border-radius:6px; background-image:url('${imgPath}'); background-size:cover; background-position:center; border:${border}; position:relative; box-shadow:0 2px 5px rgba(0,0,0,0.5); ${legStyle}">
                                        ${holo}
                                        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.8); color:#fff; font-size:0.5rem; text-align:center; padding:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.charName}</div>
                                    </div>`;
                                }
                            }
                            return `<div style="width:60px; height:90px; border-radius:6px; background:rgba(0,0,0,0.5); border:1px dashed #444; display:flex; align-items:center; justify-content:center;"><span style="color:#444; font-size:1.5rem;">+</span></div>`;
                        }).join('')}
                    </div>
            </div>
        `;
    } else {
        const animeGames = u.gamesPlayed_waifu || 0;
        const animeUnlockedList = u.unlocked_titles_waifu || [];
        const animeTitles = (TITLES['waifu'] || []).filter(t => {
            const isUnlocked = animeUnlockedList.includes(t.id) || (!t.secret && animeGames >= t.required);
            if (t.secret && !isUnlocked) return false;
            return isUnlocked;
        }).map(t => t.name);
        const animeThemes = u.unlocked_themes_waifu || [];
        const animeThemeNames = (THEMES['waifu'] || []).filter(t => t.id.endsWith('_default') || animeThemes.includes(t.id)).map(t => t.name);
        
        const favs = u.favorites_waifu || {};
        const nems = u.nemesis_waifu || {};
        let topFav = null, topFavCount = 0;
        for (const [name, count] of Object.entries(favs)) { if (count > topFavCount) { topFavCount = count; topFav = name; } }
        let topNem = null, topNemCount = 0;
        for (const [name, count] of Object.entries(nems)) { if (count > topNemCount) { topNemCount = count; topNem = name; } }
        
        const matchups = u.versusMatchups || {};
        let meister = null, meisterLosses = 0, schueler = null, schuelerWins = 0;
        for (const [oppName, stats] of Object.entries(matchups)) {
            if (stats.losses > meisterLosses) { meisterLosses = stats.losses; meister = oppName; }
            if (stats.wins > schuelerWins) { schuelerWins = stats.wins; schueler = oppName; }
        }
        
        progressHtml = `
            <div style="background:#11151f; padding:15px; border-radius:8px; border:1px solid #2a3142;">
                <h4 style="margin:0 0 10px 0; color:#e2e8f0; border-bottom:1px solid #2a3142; padding-bottom:5px;">Anime Fortschritt</h4>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Spiele gespielt: <span style="color:#fff">${animeGames}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Titel: <span style="color:#fff">${animeTitles.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Themes: <span style="color:#fff">${animeThemeNames.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#2ed573; margin-bottom:5px;">Lieblingscharakter: <span style="color:#fff">${topFav ? `${topFav} (${topFavCount}x auf Platz 1)` : '-'}</span></div>
                <div style="font-size:0.85rem; color:#ff4757;">Nemesis: <span style="color:#fff">${topNem ? `${topNem} (${topNemCount}x auf Platz 5)` : '-'}</span></div>
                
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <div style="flex:1; font-size:0.85rem; color:#ff9f43; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; text-align:center;">
                        Meister<br><span style="color:#fff; font-weight:bold;">${meister || '-'}</span>
                    </div>
                    <div style="flex:1; font-size:0.85rem; color:#0abde3; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; text-align:center;">
                        Schüler<br><span style="color:#fff; font-weight:bold;">${schueler || '-'}</span>
                    </div>
                </div>

                <div id="community-machtverirrung-${u.username}"></div>
                
                <div style="margin-top:15px; border-top:1px solid #2a3142; padding-top:10px;">
                    <h5 style="margin:0 0 10px 0; color:#e2e8f0; font-size:0.8rem; text-align:center;">Trophäenschrank</h5>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        ${[0,1,2].map(i => {
                            const item = (u.showcase_waifu || [])[i];
                            let content = '<span style="color:#444; font-size:1.5rem;">+</span>';
                            if (item) {
                                if (item.type === 'title') content = `<div style="color:#ffd700; font-size:0.6rem; font-weight:bold; text-transform:uppercase;">Titel</div><div style="color:#fff; font-size:0.75rem; margin-top:2px; text-align:center;">${item.name}</div>`;
                                else if (item.type === 'theme') content = `<div style="color:#2ed573; font-size:0.6rem; font-weight:bold; text-transform:uppercase;">Theme</div><div style="color:#fff; font-size:0.75rem; margin-top:2px; text-align:center;">${item.name}</div>`;
                            }
                            return `<div style="flex:1; max-width:80px; height:60px; background: rgba(0,0,0,0.5); border: 1px dashed #444; border-radius: 6px; display:flex; flex-direction:column; align-items:center; justify-content:center;">${content}</div>`;
                        }).join('')}
                    </div>
                </div>

                <div style="margin-top:15px; border-top:1px solid #2a3142; padding-top:10px;">
                    <h5 style="margin:0 0 10px 0; color:#e2e8f0; font-size:0.8rem; text-align:center;">Karten Showcase</h5>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        ${[0,1,2].map(i => {
                            const item = (u.album_showcase_waifu || [])[i];
                            if (item) {
                                const dbObj = activeCharacterDatabase.find(c => c.name === item.charName);
                                if (dbObj) {
                                    let border = '2px solid #111';
                                    if(item.rarity==='rare') border='2px solid #ff9f43';
                                    if(item.rarity==='epic') border='2px solid #9b59b6';
                                    if(item.rarity==='legendary') border='2px solid #ffd700';
                                    
                                    let imgPath = dbObj.img;
                                    if(item.rarity==='legendary' && LEGENDARY_POOL && LEGENDARY_POOL[item.charName]) {
                                        imgPath = LEGENDARY_POOL[item.charName].specialImg;
                                    }
                                    
                                    const holo = (item.rarity==='epic') ? `<div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; mix-blend-mode:color-dodge; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-gleam 2.5s infinite linear;"></div>` : '';
                                    const legStyle = (item.rarity==='legendary') ? `animation: legendary-flicker 1.5s infinite;` : '';
                                    return `<div class="community-showcase-card" style="width:60px; height:90px; border-radius:6px; background-image:url('${imgPath}'); background-size:cover; background-position:center; border:${border}; position:relative; box-shadow:0 2px 5px rgba(0,0,0,0.5); ${legStyle}">
                                        ${holo}
                                        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.8); color:#fff; font-size:0.5rem; text-align:center; padding:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.charName}</div>
                                    </div>`;
                                }
                            }
                            return `<div style="width:60px; height:90px; border-radius:6px; background:rgba(0,0,0,0.5); border:1px dashed #444; display:flex; align-items:center; justify-content:center;"><span style="color:#444; font-size:1.5rem;">+</span></div>`;
                        }).join('')}
                    </div>
            </div>
        `;
    }
    
    const avatar = (currentMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu) || '';
    const avatarHtml = avatar ? `<img src="${avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #555;margin:0 auto 10px; display:block;">` : `<div style="width:80px;height:80px;border-radius:50%;background:#444;margin:0 auto 10px; display:block;"></div>`;
    
    const activeTitle = (currentMode === 'starwars' ? u.activeTitle_starwars : u.activeTitle_waifu) || 'Kein Titel';
    
    content.innerHTML = `
        <div style="display:flex; gap:0; border: 1px solid #2a3142; border-radius: 10px; overflow: hidden; background: #0d111a; min-height: 400px;">
            <!-- LEFT PAGE: Identity & Actions -->
            <div style="flex: 0 0 260px; background: linear-gradient(160deg, #0f172a 60%, #1e293b); border-right: 2px solid #2a3142; padding: 25px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                ${avatarHtml}
                <h3 style="margin:0; font-size:1.4rem; color:#fff; text-align:center;">${u.displayName || u.username}</h3>
                <p style="color:#ffd700; font-weight:bold; margin:0; text-transform:uppercase; font-size:0.85rem; text-align:center; background:rgba(255,215,0,0.1); padding:4px 10px; border-radius:20px; border:1px solid rgba(255,215,0,0.3);">${activeTitle}</p>
                
                <div style="width:100%; height:1px; background:#2a3142; margin: 4px 0;"></div>
                
                ${user.uid !== u.uid ? `
                <div style="display: flex; flex-direction:column; gap: 8px; width: 100%;">
                    <button id="profile-chat-btn" class="rank-btn" style="width:100%; padding: 8px 10px; font-size: 0.8rem; border-color: #3b82f6; color: #3b82f6;">💬 NACHRICHT SENDEN</button>
                    <button id="profile-challenge-btn" class="rank-btn" style="width:100%; padding: 8px 10px; font-size: 0.8rem; border-color: #ff4757; color: #ff4757;">⚔️ HERAUSFORDERN</button>
                    ${currentMode === 'starwars' ? `<button id="profile-trade-btn" class="rank-btn" style="width:100%; padding: 8px 10px; font-size: 0.8rem; border-color: #ffd700; color: #ffd700;">🤝 KARTEN TAUSCHEN</button>` : ''}
                    <button class="rank-btn btn-sm" onclick='window.showUserAlbumModal(${JSON.stringify(u).replace(/'/g, "&#39;")})' style="width:100%; font-size:0.8rem; padding:8px 10px; border-color:#9b59b6; color:#9b59b6;">📖 SAMMELALBUM</button>
                </div>` : `
                <div style="display: flex; flex-direction:column; gap: 8px; width: 100%;">
                    <button class="rank-btn btn-sm" onclick='window.showUserAlbumModal(${JSON.stringify(u).replace(/'/g, "&#39;")})' style="width:100%; font-size:0.8rem; padding:8px 10px; border-color:#9b59b6; color:#9b59b6;">📖 SAMMELALBUM ANSEHEN</button>
                </div>`}
            </div>
            
            <!-- RIGHT PAGE: Stats & Showcase -->
            <div style="flex: 1; padding: 20px; overflow-y: auto; max-height: 75vh; display: flex; flex-direction: column; gap: 15px;">
                ${progressHtml}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    const challengeBtn = document.getElementById('profile-challenge-btn');
    if (challengeBtn) {
        challengeBtn.addEventListener('click', () => {
            import('./versus.js').then(m => m.sendVersusInvite(u));
            modal.classList.add('hidden');
        });
    }
    
    const chatBtn = document.getElementById('profile-chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            openPrivateChat(u);
            modal.classList.add('hidden');
        });
    }

    const tradeBtn = document.getElementById('profile-trade-btn');
    if (tradeBtn) {
        tradeBtn.addEventListener('click', () => {
            openTradeProposalModal(u);
            modal.classList.add('hidden');
        });
    }
    
    // Asynchronously load Machtverirrung
    setTimeout(() => { 
        if (window.loadMachtverirrung) window.loadMachtverirrung(u, `community-machtverirrung-${u.username}`);
    }, 100);
}

window.showUserAlbumModal = function(u) {
    let modal = document.getElementById('foreign-album-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'foreign-album-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; max-height:90vh; overflow-y:auto; position:relative;">
                <button id="close-foreign-album-btn" style="position:absolute; top:10px; right:10px; background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">✕</button>
                <h3 style="margin-top:0; text-align:center; color:#ffd700;">Sammelalbum von <span id="foreign-album-name"></span></h3>
                
                <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
                    <select id="foreign-album-pack-filter" style="padding:8px; border-radius:4px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid #444;">
                        <option value="all">Alle Packs</option>
                        <option value="starwars_all">Galaktisches Standard-Pack</option>
                        <option value="starwars_klon">Klonkrieger Elite-Pack</option>
                        <option value="starwars_jedi_sith">Machtanwender Pack</option>
                    </select>
                    <select id="foreign-album-sort-filter" style="padding:8px; border-radius:4px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid #444;">
                        <option value="rarity_desc">Seltenste zuerst</option>
                        <option value="rarity_asc">Gewöhnlichste zuerst</option>
                        <option value="count_desc">Meiste zuerst</option>
                        <option value="name_asc">Name (A-Z)</option>
                    </select>
                </div>
                
                <div id="foreign-album-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:25px; padding:10px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-foreign-album-btn').addEventListener('click', () => modal.classList.add('hidden'));
        const escForeign = (e) => { if(e.key === 'Escape') { modal.classList.add('hidden'); document.removeEventListener('keydown', escForeign); } };
        document.addEventListener('keydown', escForeign);
    }
    
    document.getElementById('foreign-album-name').textContent = u.displayName || u.username;
    
    const packFilter = document.getElementById('foreign-album-pack-filter');
    const sortFilter = document.getElementById('foreign-album-sort-filter');
    
    const update = () => {
        if (window.renderCommunityAlbum) {
            window.renderCommunityAlbum(u, 'foreign-album-grid', packFilter.value, sortFilter.value);
        }
    };
    
    packFilter.onchange = update;
    sortFilter.onchange = update;
    
    packFilter.value = 'all';
    sortFilter.value = 'rarity_desc';
    update();
    
    modal.classList.remove('hidden');
};

async function openTradeProposalModal(targetUser) {
    const modal = document.getElementById('trade-proposal-modal');
    if (!modal) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    document.getElementById('trade-target-name').textContent = targetUser.displayName || targetUser.username;
    
    const myGrid = document.getElementById('trade-my-inventory-grid');
    const theirGrid = document.getElementById('trade-their-inventory-grid');
    const myPreview = document.getElementById('trade-my-selection-preview');
    const theirPreview = document.getElementById('trade-their-selection-preview');
    const sendBtn = document.getElementById('send-trade-proposal-btn');
    
    myGrid.innerHTML = '<div class="loader" style="margin: 10px auto;"></div>';
    theirGrid.innerHTML = '<div class="loader" style="margin: 10px auto;"></div>';
    myPreview.innerHTML = '<span style="color:#64748b; font-size:0.85rem;">Keine Karte ausgewählt</span>';
    theirPreview.innerHTML = '<span style="color:#64748b; font-size:0.85rem;">Keine Karte ausgewählt</span>';
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    
    let selectedMyCard = null;
    let selectedTheirCard = null;
    
    modal.classList.remove('hidden');
    
    try {
        const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        
        // Fetch fresh inventories
        const [mySnap, theirSnap] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDoc(doc(db, "users", targetUser.uid))
        ]);
        
        if (!mySnap.exists() || !theirSnap.exists()) {
            alert("Fehler beim Laden der Spielerdaten.");
            modal.classList.add('hidden');
            return;
        }
        
        const myData = mySnap.data();
        const theirData = theirSnap.data();
        
        const field = `inventory_${currentMode}`;
        const myInv = (myData[field] || []).filter(c => c.rarity !== 'legendary');
        const theirInv = (theirData[field] || []).filter(c => c.rarity !== 'legendary');
        
        const renderGrid = (inv, gridEl, isOwn) => {
            if (inv.length === 0) {
                gridEl.innerHTML = '<p style="color:#64748b; font-size:0.75rem; text-align:center; width:100%;">Keine Karten verfügbar.</p>';
                return;
            }
            
            gridEl.innerHTML = '';
            const grouped = {};
            inv.forEach(c => {
                if (!grouped[c.charName]) {
                    grouped[c.charName] = { charName: c.charName, rarities: [] };
                }
                if (!grouped[c.charName].rarities.includes(c.rarity)) {
                    grouped[c.charName].rarities.push(c.rarity);
                }
            });
            
            Object.values(grouped).forEach(card => {
                const dbObj = activeCharacterDatabase.find(char => char.name === card.charName);
                if (!dbObj) return;
                
                let border = '1px solid #333';
                
                const cardEl = document.createElement('div');
                cardEl.className = 'history-card';
                cardEl.style.width = '65px';
                cardEl.style.height = '95px';
                cardEl.style.backgroundImage = `url('${dbObj.img}')`;
                cardEl.style.backgroundSize = 'cover';
                cardEl.style.backgroundPosition = 'center';
                cardEl.style.border = border;
                cardEl.style.borderRadius = '4px';
                cardEl.style.position = 'relative';
                cardEl.style.cursor = 'pointer';
                cardEl.style.flexShrink = '0';
                cardEl.style.boxShadow = '0 1px 3px rgba(0,0,0,0.5)';
                
                cardEl.innerHTML = `
                    <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); color:#fff; font-size:0.45rem; text-align:center; padding:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${card.charName}</div>
                `;
                
                cardEl.addEventListener('click', () => {
                    gridEl.querySelectorAll('.history-card').forEach(el => el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.5)');
                    gridEl.querySelectorAll('.history-card').forEach(el => el.style.borderColor = '#333');
                    
                    cardEl.style.boxShadow = '0 0 8px #ffd700';
                    cardEl.style.borderColor = '#ffd700';
                    
                    const updatePreview = (selectedRarity) => {
                        let previewBorder = '1px solid #333';
                        if (selectedRarity === 'rare') previewBorder = '1px solid #ff9f43';
                        if (selectedRarity === 'epic') previewBorder = '1px solid #9b59b6';
                        
                        const selectHtml = `
                            <select class="trade-rarity-select" style="padding:4px; border-radius:4px; background:#222; color:#fff; border:1px solid #444; font-size:0.75rem; margin-top:5px; width:100%;">
                                ${card.rarities.map(r => `<option value="${r}" ${r === selectedRarity ? 'selected' : ''}>${r.toUpperCase()}</option>`).join('')}
                            </select>
                        `;
                        
                        const originalCard = inv.find(c => c.charName === card.charName && c.rarity === selectedRarity);
                        const cardObject = originalCard ? { ...originalCard } : { charName: card.charName, rarity: selectedRarity };
                        
                        if (isOwn) {
                            selectedMyCard = cardObject;
                            myPreview.innerHTML = `
                                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                                    <div style="width:40px; height:60px; flex-shrink:0; background-image:url('${dbObj.img}'); background-size:cover; background-position:center; border:${previewBorder}; border-radius:4px;"></div>
                                    <div style="text-align:left; flex:1;">
                                        <div style="font-weight:bold; font-size:0.85rem; color:#fff;">${card.charName}</div>
                                        ${selectHtml}
                                    </div>
                                </div>
                            `;
                            const sel = myPreview.querySelector('.trade-rarity-select');
                            sel.onchange = () => {
                                updatePreview(sel.value);
                            };
                        } else {
                            selectedTheirCard = cardObject;
                            theirPreview.innerHTML = `
                                <div style="display:flex; align-items:center; gap:10px; width:100%;">
                                    <div style="width:40px; height:60px; flex-shrink:0; background-image:url('${dbObj.img}'); background-size:cover; background-position:center; border:${previewBorder}; border-radius:4px;"></div>
                                    <div style="text-align:left; flex:1;">
                                        <div style="font-weight:bold; font-size:0.85rem; color:#fff;">${card.charName}</div>
                                        ${selectHtml}
                                    </div>
                                </div>
                            `;
                            const sel = theirPreview.querySelector('.trade-rarity-select');
                            sel.onchange = () => {
                                updatePreview(sel.value);
                            };
                        }
                        
                        if (selectedMyCard && selectedTheirCard) {
                            sendBtn.disabled = false;
                            sendBtn.style.opacity = '1';
                        }
                    };
                    
                    updatePreview(card.rarities[0]);
                });
                
                gridEl.appendChild(cardEl);
            });
        };
        
        renderGrid(myInv, myGrid, true);
        renderGrid(theirInv, theirGrid, false);
        
        const closeBtn = document.getElementById('close-trade-proposal-btn');
        closeBtn.onclick = () => modal.classList.add('hidden');
        
        sendBtn.onclick = async () => {
            if (!selectedMyCard || !selectedTheirCard) return;
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sende...';
            
            try {
                const tradeData = {
                    senderId: user.uid,
                    senderName: user.displayName || user.username,
                    receiverId: targetUser.uid,
                    receiverName: targetUser.displayName || targetUser.username,
                    giveCard: {
                        charName: selectedMyCard.charName,
                        rarity: selectedMyCard.rarity,
                        timestamp: selectedMyCard.timestamp,
                        boosterId: selectedMyCard.boosterId
                    },
                    takeCard: {
                        charName: selectedTheirCard.charName,
                        rarity: selectedTheirCard.rarity,
                        timestamp: selectedTheirCard.timestamp,
                        boosterId: selectedTheirCard.boosterId
                    },
                    status: 'pending',
                    mode: currentMode,
                    timestamp: Timestamp.now()
                };
                
                await addDoc(collection(db, "trades"), tradeData);
                alert("Tauschanfrage erfolgreich gesendet!");
                modal.classList.add('hidden');
            } catch(err) {
                alert("Fehler beim Senden: " + err.message);
                sendBtn.disabled = false;
                sendBtn.textContent = 'Tauschanfrage senden';
            }
        };
        
    } catch(err) {
        console.error(err);
        alert("Fehler beim Laden der Tauschdaten.");
        modal.classList.add('hidden');
    }
}








