// live.js
import { db } from './firebase-config.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let liveUnsubscribe = null;

export function initLiveSpectating() {
    if(liveUnsubscribe) liveUnsubscribe();
    
    liveUnsubscribe = onSnapshot(collection(db, "live_games"), (snapshot) => {
        const container = document.getElementById('live-games-list');
        container.innerHTML = '';
        const now = Date.now();
        let activeGames = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Nur Spiele anzeigen, die in den letzten 2 Minuten geupdated wurden
            if (data.updatedAt && (now - data.updatedAt.toMillis()) < 120000) {
                activeGames++;
                const avatar = data.avatar ? `<img src="${data.avatar}" class="mini-avatar">` : '';
                
                // Wir bauen die 5 kleinen Slots auf
                let slotsHtml = '';
                for(let i = 1; i <= 5; i++) {
                    const char = data.placedCharacters[i];
                    if (char) {
                        slotsHtml += `<div class="live-slot-mini"><img src="${char.img}" title="Platz ${i}: ${char.name}"></div>`;
                    } else {
                        slotsHtml += `<div class="live-slot-mini" style="background:#111"></div>`;
                    }
                }

                container.innerHTML += `
                    <div class="history-card">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                            ${avatar} <strong>${data.displayName}</strong> rankt gerade...
                        </div>
                        <div class="live-board-mini">${slotsHtml}</div>
                    </div>
                `;
            }
        });

        if (activeGames === 0) {
            container.innerHTML = '<p class="prompt-text">Aktuell rankt niemand in diesem Universum.</p>';
        }
    });
}