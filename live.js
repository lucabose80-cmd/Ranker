// live.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, where, Timestamp, getDocs, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { trackRead } from './tracker.js';
import { currentMode } from './mode-state.js';

let currentLiveMode = null;
let activeSpectatedUser = null;
let spectatorUnsubscribe = null;
let allLiveGamesCache = [];

export async function initLiveSpectating(force = false) {
    if (!force && currentLiveMode === currentMode) {
        return;
    }
    currentLiveMode = currentMode;
    
    const grid = document.getElementById('live-games-grid');
    if (!grid) return;
    
    // Refresh-Button injizieren, falls noch nicht da
    const liveSection = document.getElementById('live-content');
    if (liveSection && !document.getElementById('manual-live-refresh-btn')) {
        const headerArea = document.createElement('div');
        headerArea.style.textAlign = 'center';
        headerArea.style.marginBottom = '20px';
        headerArea.innerHTML = `<button id="manual-live-refresh-btn" class="rank-btn" style="width: auto; padding: 0 20px;">Live-Spiele suchen</button>`;
        grid.parentNode.insertBefore(headerArea, grid);
        
        document.getElementById('manual-live-refresh-btn').addEventListener('click', () => {
            fetchLiveGames(grid);
        });
    }

    // Beim ersten Öffnen einmal fetchen
    await fetchLiveGames(grid);
}

async function fetchLiveGames(grid) {
    const btn = document.getElementById('manual-live-refresh-btn');
    if (btn) { btn.textContent = "Suche..."; btn.disabled = true; }
    
    grid.innerHTML = '<div class="loader"></div><p style="text-align:center;">Lade aktive Spiele...</p>';
    
    try {
        const twoMinutesAgo = new Date(Date.now() - 120000);
        const qLive = query(collection(db, "live_games"), where("updatedAt", ">", Timestamp.fromDate(twoMinutesAgo)));
        
        const snapshot = await getDocs(qLive);
        trackRead(snapshot.size);
        
        grid.innerHTML = '';
        let activeGames = 0;
        allLiveGamesCache = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const username = docSnap.id;
            
            allLiveGamesCache.push({ username, data });
            
            activeGames++;
            const avatarImg = data.avatar ? `<img src="${data.avatar}" class="mini-avatar">` : '';
                
                const isAdvanced = data.gameType === 'advanced';
                const isVersus = data.gameType === 'versus';
                const maxSlots = isAdvanced ? 10 : 5;
                let slotsHtml = '';
                for(let i = 1; i <= maxSlots; i++) {
                    const char = data.placedCharacters[i];
                    slotsHtml += `<div class="live-slot-mini" style="background:${char ? 'transparent' : '#111'}">
                        ${char ? `<img src="${char.img}">` : ''}
                    </div>`;
                }

                const placed = Object.values(data.placedCharacters).filter(Boolean).length;
                const progressHtml = `<div class="live-progress-bar"><div class="live-progress-fill" style="width: ${(placed/maxSlots)*100}%"></div></div>`;

                const card = document.createElement('div');
                card.className = `live-grid-card ${isAdvanced ? 'advanced-live-card' : ''}`;
                card.innerHTML = `
                    <div class="live-card-user">
                        ${avatarImg} <strong>${data.displayName}</strong> 
                        ${isAdvanced ? '<span class="chat-mode-tag tag-sw" style="font-size:0.55rem; padding:1px 4px; margin-left:5px; background-color:#ffe81f !important; color:#000 !important; box-shadow:none; vertical-align:middle;">ADV</span>' : ''}
                        ${isVersus ? '<span class="chat-mode-tag tag-anime" style="font-size:0.55rem; padding:1px 4px; margin-left:5px; background-color:#ff4757 !important; color:#fff !important; box-shadow:none; vertical-align:middle;">VERSUS</span>' : ''}
                        <span class="live-placed-count">${placed}/${maxSlots}</span>
                    </div>
                    ${progressHtml}
                    <div class="live-board-mini ${isAdvanced ? 'advanced-board-mini' : ''}">${slotsHtml}</div>
                    <button class="rank-btn spec-btn">Zuschauen</button>
                `;
                
                card.querySelector('.spec-btn').addEventListener('click', () => {
                    openSpectatorModal(username, data);
                });

                grid.appendChild(card);
        });

        if (activeGames === 0) {
            grid.innerHTML = '<p class="prompt-text" style="grid-column: 1/-1;">Aktuell rankt niemand live.</p>';
        }
    } catch (e) {
        grid.innerHTML = '<p class="prompt-text" style="grid-column: 1/-1; color:red;">Fehler beim Laden.</p>';
    } finally {
        if (btn) { btn.textContent = "Live-Spiele suchen"; btn.disabled = false; }
    }
}

export function stopLiveSpectating() {
    if (spectatorUnsubscribe) {
        spectatorUnsubscribe();
        spectatorUnsubscribe = null;
    }
    currentLiveMode = null;
}

function openSpectatorModal(username, data) {
    activeSpectatedUser = username;
    document.getElementById('spectator-modal').classList.remove('hidden');
    updateSpectatorModalContent(username, data);
    
    // Live-Update nur für diesen einen Spieler abonnieren
    if (spectatorUnsubscribe) spectatorUnsubscribe();
    spectatorUnsubscribe = onSnapshot(doc(db, "live_games", username), (docSnap) => {
        if (docSnap.exists() && activeSpectatedUser === username) {
            trackRead(1);
            updateSpectatorModalContent(username, docSnap.data());
        } else {
            // Spiel ist wohl vorbei oder Dokument gelöscht
            document.getElementById('spectator-title').textContent = "Spiel beendet / Spieler offline";
        }
    });
}

export function closeSpectatorModal() {
    activeSpectatedUser = null;
    if (spectatorUnsubscribe) {
        spectatorUnsubscribe();
        spectatorUnsubscribe = null;
    }
    document.getElementById('spectator-modal').classList.add('hidden');
    
    // Refresh Grid wenn man das Modal schließt
    const grid = document.getElementById('live-games-grid');
    if (grid) fetchLiveGames(grid);
}

function updateSpectatorModalContent(username, data) {
    const isAdvanced = data.gameType === 'advanced';
    const isVersus = data.gameType === 'versus';
    const maxSlots = isAdvanced ? 10 : 5;
    
    const typeLabel = isVersus ? 'Versus' : (isAdvanced ? 'Advanced' : 'Klassisch');
    document.getElementById('spectator-title').textContent = `LIVE: ${data.displayName} rankt gerade (${typeLabel})`;
    
    const switcher = document.getElementById('spectator-switcher');
    switcher.innerHTML = '';
    
    if (isVersus && allLiveGamesCache.length > 0) {
        // Finde andere Spieler im SELBEN Versus-Match (wir erkennen es am gleichen Pool/Charakter-Set)
        const myPoolHash = (data.pool || []).map(c => c.name).sort().join(',');
        
        const peers = allLiveGamesCache.filter(item => {
            if (item.data.gameType !== 'versus') return false;
            const theirHash = (item.data.pool || []).map(c => c.name).sort().join(',');
            return theirHash === myPoolHash;
        });
        
        if (peers.length > 1) {
            switcher.innerHTML = peers.map(peer => {
                const isMe = peer.username === username;
                const border = isMe ? '2px solid #ffd700' : '1px solid #333';
                const opacity = isMe ? '1' : '0.5';
                const avatar = peer.data.avatar ? `<img src="${peer.data.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">` : `<div style="width:30px;height:30px;border-radius:50%;background:#333;"></div>`;
                return `
                    <div class="spec-switcher-btn" data-user="${peer.username}" style="display:flex; align-items:center; gap:5px; padding:5px 10px; border:${border}; border-radius:8px; opacity:${opacity}; cursor:pointer; background:#1a1e29;">
                        ${avatar} <span style="font-size:0.8rem;">${peer.data.displayName}</span>
                    </div>
                `;
            }).join('');
            
            // Buttons klickbar machen, um Modal-Inhalt zu wechseln ohne es zu schließen
            switcher.querySelectorAll('.spec-switcher-btn').forEach(btn => {
                btn.onclick = () => {
                    const nextUser = btn.getAttribute('data-user');
                    const nextData = allLiveGamesCache.find(p => p.username === nextUser)?.data;
                    if (nextData && nextUser !== username) {
                        openSpectatorModal(nextUser, nextData);
                    }
                };
            });
        }
    }

    const board = document.getElementById('spectator-board');
    board.innerHTML = '';
    
    if (isAdvanced) {
        board.className = 'horizontal-board advanced-board';
    } else {
        board.className = 'horizontal-board';
    }

    // Ranking-Board (platzierte Charaktere)
    for (let i = 1; i <= maxSlots; i++) {
        const char = data.placedCharacters[i];
        board.innerHTML += `
            <div class="rank-column">
                <div class="card-container">
                    <span class="rank-number">${i}</span>
                    <div class="card-content" style="border-style: ${char ? 'solid' : 'dashed'}">
                        ${char ? `<img src="${char.img}">` : '<span class="placeholder-icon">👤</span>'}
                    </div>
                </div>
                <div class="card-label"><span>${char ? char.name : '???'}</span></div>
            </div>
        `;
    }

    // Aktuelle Auswahl (Pool) – Erscheinungsreihenfolge der Charaktere
    const poolContainer = document.getElementById('spectator-pool');
    if (poolContainer && data.pool && data.pool.length > 0) {
        const currentIdx = data.currentIndex || 0;
        poolContainer.classList.remove('hidden');
        poolContainer.innerHTML = `
            <h4 class="spectator-pool-title">Aktuelle Auswahl (Erscheinungsreihenfolge)</h4>
            <div class="spectator-pool-grid">
                ${data.pool.map((char, idx) => {
                    let stateClass = '';
                    let displayImg = char.img;
                    let displayName = char.name;
                    
                    if (idx < currentIdx) {
                        stateClass = 'pool-placed';
                    } else if (idx === currentIdx) {
                        stateClass = 'pool-current';
                    } else {
                        stateClass = 'pool-upcoming';
                        displayImg = '';
                        displayName = '???';
                    }
                    
                    return `
                        <div class="spectator-pool-item ${stateClass}" title="${displayName}">
                            ${displayImg ? `<img src="${displayImg}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);"><span style="font-size:1.5rem;color:#fff;">?</span></div>`}
                            <span>${displayName}</span>
                            <div class="pool-order-badge">${idx + 1}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } else if (poolContainer) {
        poolContainer.classList.add('hidden');
    }
}