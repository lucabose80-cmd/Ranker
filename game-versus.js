import { activeCharacterDatabase } from './theme.js';
import { preloadImages } from './utils.js';
import { getCurrentUser } from './auth.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebase-config.js';

let activePool = []; 
let currentIndex = 0;
let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
let currentLobby = null;

export function initGameVersus(lobby) {
    currentLobby = lobby;
    currentIndex = 0;
    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    
    // Finde die Character Objekte aus den Namen
    activePool = lobby.characters.map(name => {
        return activeCharacterDatabase.find(c => c.name === name) || { name: name, img: '' };
    });
    
    // Board zurücksetzen und Slots generieren
    const board = document.getElementById('ranking-board');
    board.className = "horizontal-board";
    board.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        board.innerHTML += `
            <div class="rank-column" id="slot-${i}">
                <div class="card-container">
                    <span class="rank-number">${i}</span>
                    <div class="card-content">
                        <span class="placeholder-icon">👤</span>
                    </div>
                </div>
                <div class="card-label"><span>???</span></div>
            </div>
        `;
    }

    // Buttons generieren
    const btnContainer = document.getElementById('rank-buttons-container');
    btnContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = "rank-btn";
        btn.setAttribute('data-rank', i);
        btn.textContent = i;
        btn.addEventListener('click', () => handleRankSelectionVersus(i, btn));
        btnContainer.appendChild(btn);
    }
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    document.getElementById('current-image-container').classList.remove('gold-glow');
    document.getElementById('joker-area').classList.add('hidden');
    
    document.getElementById('current-image-container').parentNode.classList.remove('hidden');
    document.querySelector('.mystery-name').classList.remove('hidden');
    document.getElementById('action-prompt').classList.remove('hidden');
    document.getElementById('rank-buttons-container').classList.remove('hidden');
    
    preloadImages(activePool);
    
    // Mode selector ausblenden
    const modeSel = document.querySelector('.mode-selector');
    if (modeSel) modeSel.style.display = 'none';
    
    showNextCharacterVersus();
}

function showNextCharacterVersus() {
    if (currentIndex < 5) {
        document.getElementById('progress-text').textContent = `CHARAKTER ${currentIndex + 1} / 5 (VERSUS)`;
        const currentChar = activePool[currentIndex];
        const imgContainer = document.getElementById('current-image-container');
        
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
        imgContainer.classList.remove('gold-glow');

    } else {
        document.getElementById('active-game-area').classList.add('hidden');
        revealNamesVersus();
        
        // Fertig! An Lobby senden.
        submitVersusPicks();
    }
}

function revealNamesVersus() {
    for (let i = 1; i <= 5; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        if (placedCharacters[i]) {
            labelSpan.textContent = placedCharacters[i].name;
            labelSpan.classList.add('revealed-name');
        }
    }
}

async function handleRankSelectionVersus(rank, buttonElement) {
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    
    showNextCharacterVersus();
}

async function submitVersusPicks() {
    const user = getCurrentUser();
    if (!user || !currentLobby) return;
    
    const picksArray = [];
    for (let i = 1; i <= 5; i++) {
        picksArray.push(placedCharacters[i].name);
    }
    
    const lobbyRef = doc(db, "versus_lobbies", currentLobby.id);
    
    try {
        // Transaction oder simples Update? Simples Update mit Array-Ersetzung ist schwierig wenn es concurrent ist.
        // Besser: getDoc, dann array updaten, dann setDoc. (Es ist ein Spielzeug-Projekt, Race-Conditions sind selten hier, da Arrays of objects)
        const snap = await getDoc(lobbyRef);
        if (snap.exists()) {
            const data = snap.data();
            const pIndex = data.players.findIndex(p => p.uid === user.uid);
            if (pIndex !== -1) {
                data.players[pIndex].picks = picksArray;
                data.players[pIndex].status = 'finished';
                
                // Sofortiges UI Feedback um Hängenbleiben zu verhindern
                document.getElementById('game-main-content').classList.add('hidden');
                document.getElementById('versus-content').classList.remove('hidden');
                document.getElementById('versus-room-status').innerHTML = "Sende Ranking...<br><br><div class='loader'></div>";
                
                await updateDoc(lobbyRef, { players: data.players });
            } else {
                alert("Du bist nicht mehr in der Lobby.");
            }
        }
    } catch(e) {
        console.error("Versus Submit Error", e);
        alert("Fehler beim Senden: " + e.message);
    }
}
