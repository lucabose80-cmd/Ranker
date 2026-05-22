// community.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp, getDocs, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { trackRead, trackWrite } from './tracker.js';
import { TITLES } from './titles.js';
import { THEMES } from './themes.js';

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
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        messages.reverse();
        
        chatContainer.innerHTML = '';
        let hasNewFromOthers = false;

        messages.forEach(msg => {
            const isSelf = msg.username === user.username;
            if (!isSelf && !isFirstLoad) hasNewFromOthers = true;
            
            // Berechne Modus-Tag Text und Klasse
            const modeText = msg.userMode === 'starwars' ? 'SW' : 'Anime';
            const modeClass = msg.userMode === 'starwars' ? 'tag-sw' : 'tag-anime';
            const avatarHtml = msg.avatar ? `<img src="${msg.avatar}">` : `<div class="mini-avatar" style="background:#444"></div>`;
            const titleHtml = msg.title && msg.title !== 'Kein Titel' ? `<span style="font-size:0.6rem; color:#ffd700; font-weight:bold; margin-left:5px; text-transform:uppercase;">${msg.title}</span>` : '';
            
            let themeStyle = '';
            if (msg.theme) {
                const themeData = THEMES[msg.userMode || 'starwars']?.find(t => t.id === msg.theme);
                if (themeData && themeData.preview) {
                    if (themeData.preview.includes('gradient')) {
                        themeStyle = `border-image: ${themeData.preview} 1; border-width: 2px; border-style: solid;`;
                    } else {
                        themeStyle = `border-color: ${themeData.preview}; box-shadow: 0 0 5px ${themeData.preview}40;`;
                    }
                }
            }
            
            chatContainer.innerHTML += `
                <div class="chat-msg ${isSelf ? 'self' : ''}">
                    ${avatarHtml}
                    <div class="chat-msg-body">
                        <span class="chat-username">
                            <span class="chat-mode-tag ${modeClass}">${modeText}</span> ${msg.displayName} ${titleHtml}
                        </span>
                        <div class="chat-msg-content" style="${themeStyle}">${msg.text}</div>
                    </div>
                </div>
            `;
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
                const modeText = uMode === 'starwars' ? 'SW' : 'Anime';
                const modeClass = uMode === 'starwars' ? 'tag-sw' : 'tag-anime';
                const activeTitle = uMode === 'starwars' ? user.activeTitle_starwars : user.activeTitle_waifu;
                const titleHtml = activeTitle && activeTitle !== 'Kein Titel'
                    ? `<div style="font-size:0.65rem; color:#ffd700; font-weight:bold; margin-top:2px; text-transform:uppercase; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${activeTitle}</div>` : '';

                onlineList.innerHTML += `
                    <div class="online-user-card" style="cursor:pointer;" data-uid="${user.uid}">
                        <div class="online-indicator"></div>
                        ${avatarHtml}
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                            <strong style="flex: unset; display: flex; align-items: center; min-width: 0;">
                                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.displayName || user.username}</span>
                                <span style="flex-shrink:0; color:#888; font-size:0.8rem; margin-left:5px;">(Du)</span>
                            </strong>
                            ${titleHtml}
                            
                            ${(function() {
                                const sw = parseInt(localStorage.getItem("starwarsdle_streak") || "0");
                                return sw > 0 ? `<div style="font-size:0.65rem; color:#ff9f43; margin-top:2px; font-weight:bold;">🔥 SW-Streak: ${sw}</div>` : "";
                            })()}
                            ${user.waifudleStreak ? `<div style="font-size:0.65rem; color:#ff6b81; margin-top:2px; font-weight:bold;">🌸 Ani-Streak: ${user.waifudleStreak}</div>` : ""}
                        </div>
                        <span class="chat-mode-tag ${modeClass}" style="margin-left:auto; flex-shrink:0;">${modeText}</span>
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
                const otherModeText = otherMode === 'starwars' ? 'SW' : 'Anime';
                const otherModeClass = otherMode === 'starwars' ? 'tag-sw' : 'tag-anime';
                const otherTitle = otherMode === 'starwars' ? u.activeTitle_starwars : u.activeTitle_waifu;
                const otherTitleHtml = otherTitle && otherTitle !== 'Kein Titel'
                    ? `<div style="font-size:0.65rem; color:#ffd700; font-weight:bold; margin-top:2px; text-transform:uppercase; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${otherTitle}</div>` : '';

                const offlineCss = u._isOnline ? '' : 'opacity: 0.45; filter: grayscale(0.5);';
                const indicatorClass = u._isOnline ? 'online-indicator' : 'online-indicator offline';

                onlineList.innerHTML += `
                    <div class="online-user-card" style="${offlineCss} cursor:pointer;" data-uid="${u.uid}">
                        <div class="${indicatorClass}"></div>
                        ${otherAvatarHtml}
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                            <strong style="flex: unset; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.displayName || u.username}</strong>
                            ${otherTitleHtml}
                            ${(u.starwarsdleStreak && u.starwarsdleStreak > 0) ? `<div style="font-size:0.65rem; color:#ff9f43; margin-top:2px; font-weight:bold;">🔥 SW-Streak: ${u.starwarsdleStreak}</div>` : ""}
                            ${u.waifudleStreak ? `<div style="font-size:0.65rem; color:#ff6b81; margin-top:2px; font-weight:bold;">🌸 Ani-Streak: ${u.waifudleStreak}</div>` : ""}
                        </div>
                        <span class="chat-mode-tag ${otherModeClass}" style="margin-left:auto; flex-shrink:0;">${otherModeText}</span>
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
            if (uid === user.uid) {
                clickedUser = user;
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
}

function openUserProfileModal(u) {
    if (!document.getElementById('public-profile-modal')) {
        const modal = document.createElement('div');
        modal.id = 'public-profile-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="cl-modal-box" style="max-width: 500px; text-align:center; position: relative;">
                <div class="cl-modal-header" style="justify-content: space-between; margin-bottom: 20px;">
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
        
        progressHtml = `
            <div style="background:#11151f; padding:15px; border-radius:8px; border:1px solid #2a3142;">
                <h4 style="margin:0 0 10px 0; color:#e2e8f0; border-bottom:1px solid #2a3142; padding-bottom:5px;">Star Wars Fortschritt</h4>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Spiele gespielt: <span style="color:#fff">${swGames}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Titel: <span style="color:#fff">${swTitles.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8;">Freigeschaltete Themes: <span style="color:#fff">${swThemeNames.join(', ') || '-'}</span></div>
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
        
        progressHtml = `
            <div style="background:#11151f; padding:15px; border-radius:8px; border:1px solid #2a3142;">
                <h4 style="margin:0 0 10px 0; color:#e2e8f0; border-bottom:1px solid #2a3142; padding-bottom:5px;">Anime Fortschritt</h4>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Spiele gespielt: <span style="color:#fff">${animeGames}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8; margin-bottom:5px;">Freigeschaltete Titel: <span style="color:#fff">${animeTitles.join(', ') || '-'}</span></div>
                <div style="font-size:0.85rem; color:#94a3b8;">Freigeschaltete Themes: <span style="color:#fff">${animeThemeNames.join(', ') || '-'}</span></div>
            </div>
        `;
    }
    
    const avatar = (currentMode === 'starwars' ? u.avatarStarWars : u.avatarWaifu) || '';
    const avatarHtml = avatar ? `<img src="${avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #555;margin:0 auto 10px; display:block;">` : `<div style="width:80px;height:80px;border-radius:50%;background:#444;margin:0 auto 10px; display:block;"></div>`;
    
    const activeTitle = (currentMode === 'starwars' ? u.activeTitle_starwars : u.activeTitle_waifu) || 'Kein Titel';
    
    content.innerHTML = `
        <div style="text-align:center;">
            ${avatarHtml}
            <h3 style="margin:0; font-size:1.5rem; color:#fff;">${u.displayName || u.username}</h3>
            <p style="color:#ffd700; font-weight:bold; margin-top:5px; margin-bottom:20px; text-transform:uppercase; font-size:0.9rem;">${activeTitle}</p>
        </div>
        ${progressHtml}
    `;
    
    modal.classList.remove('hidden');
}

