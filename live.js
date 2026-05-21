// live.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, where, Timestamp, getDocs, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { trackRead } from './tracker.js';
import { currentMode } from './mode-state.js';

let activeSpectatedUser = null;
let currentLiveMode = null;
let spectatorUnsubscribe = null;

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

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const username = docSnap.id;
            
            activeGames++;
            const avatarImg = data.avatar ? `<img src="${data.avatar}" class="mini-avatar">` : '';
                
                const isAdvanced = data.gameType === 'advanced';
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
                        ${avatarImg} <strong>${data.displayName}</strong> ${isAdvanced ? '<span class="chat-mode-tag tag-sw" style="font-size:0.55rem; padding:1px 4px; margin-left:5px; background-color:#ffe81f !important; color:#000 !important; box-shadow:none; vertical-align:middle;">ADV</span>' : ''}
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
    updateSpectatorModalContent(data);
    
    // Live-Update nur für diesen einen Spieler abonnieren
    if (spectatorUnsubscribe) spectatorUnsubscribe();
    spectatorUnsubscribe = onSnapshot(doc(db, "live_games", username), (docSnap) => {
        if (docSnap.exists() && activeSpectatedUser === username) {
            trackRead(1);
            updateSpectatorModalContent(docSnap.data());
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

function updateSpectatorModalContent(data) {
    const isAdvanced = data.gameType === 'advanced';
    const maxSlots = isAdvanced ? 10 : 5;
    
    document.getElementById('spectator-title').textContent = `LIVE: ${data.displayName} rankt gerade (${isAdvanced ? 'Advanced' : 'Klassisch'})`;
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
                    if (idx < currentIdx) stateClass = 'pool-placed';
                    else if (idx === currentIdx) stateClass = 'pool-current';
                    else stateClass = 'pool-upcoming';
                    return `
                        <div class="spectator-pool-item ${stateClass}" title="${char.name}">
                            <img src="${char.img}">
                            <span>${char.name}</span>
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