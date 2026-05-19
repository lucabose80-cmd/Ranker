// live.js
import { db } from './firebase-config.js';
import { collection, onSnapshot, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let liveUnsubscribe = null;
let activeSpectatedUser = null; // Speichert, wen man gerade vergrößert anschaut

export function initLiveSpectating() {
    if(liveUnsubscribe) liveUnsubscribe();
    
    const grid = document.getElementById('live-games-grid');
    
    // Nur Spiele der letzten 2 Minuten abrufen
    const twoMinutesAgo = new Date(Date.now() - 120000);
    const qLive = query(collection(db, "live_games"), where("updatedAt", ">", Timestamp.fromDate(twoMinutesAgo)));
    
    liveUnsubscribe = onSnapshot(qLive, (snapshot) => {
        if (!grid) return;
        grid.innerHTML = '';
        const now = Date.now();
        let activeGames = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const username = docSnap.id;
            
            if (data.updatedAt && (now - data.updatedAt.toMillis()) < 120000) {
                activeGames++;
                const avatarImg = data.avatar ? `<img src="${data.avatar}" class="mini-avatar">` : '';
                
                let slotsHtml = '';
                for(let i = 1; i <= 5; i++) {
                    const char = data.placedCharacters[i];
                    slotsHtml += `<div class="live-slot-mini" style="background:${char ? 'transparent' : '#111'}">
                        ${char ? `<img src="${char.img}">` : ''}
                    </div>`;
                }

                // Erstellt eine klickbare Karte fürs Raster
                const card = document.createElement('div');
                card.className = 'live-grid-card';
                card.innerHTML = `
                    <div class="live-card-user">
                        ${avatarImg} <strong>${data.displayName}</strong>
                    </div>
                    <div class="live-board-mini">${slotsHtml}</div>
                    <button class="rank-btn spec-btn">Zuschauen</button>
                `;
                
                // Klick auf "Zuschauen" öffnet die Großansicht
                card.querySelector('.spec-btn').addEventListener('click', () => {
                    openSpectatorModal(username, data);
                });

                grid.appendChild(card);

                // Wenn man diesen Spieler gerade aktiv vergrößert hat, update das Modal live!
                if (activeSpectatedUser === username) {
                    updateSpectatorModalContent(data);
                }
            }
        });

        if (activeGames === 0) {
            grid.innerHTML = '<p class="prompt-text" style="grid-column: 1/-1;">Aktuell rankt niemand live.</p>';
        }
    });
}

function openSpectatorModal(username, data) {
    activeSpectatedUser = username;
    document.getElementById('spectator-modal').classList.remove('hidden');
    updateSpectatorModalContent(data);
}

export function closeSpectatorModal() {
    activeSpectatedUser = null;
    document.getElementById('spectator-modal').classList.add('hidden');
}

function updateSpectatorModalContent(data) {
    document.getElementById('spectator-title').textContent = `LIVE: ${data.displayName} schaut zu`;
    const board = document.getElementById('spectator-board');
    board.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
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
}