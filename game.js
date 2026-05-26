// game.js
import { activeCharacterDatabase } from './theme.js';
import { shuffleArray, preloadImages, drawFromBag } from './utils.js';
import { resetRatingUI } from './rating.js';
import { saveGameToHistory } from './history.js';
import { getCurrentUser } from './auth.js';
import { doc, setDoc, Timestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { currentMode, currentGameCategory } from './mode-state.js';

export let activePool = []; 
export let currentIndex = 0;
export let placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };

export function initGame() {
    // We will initialize currentIndex and placedCharacters inside the state check below
    
    const board = document.getElementById('ranking-board');
    board.className = "horizontal-board";
    board.innerHTML = Array.from({length: 5}, (_, i) => `
        <div class="rank-column" id="slot-${i+1}">
            <div class="card-container">
                <span class="rank-number">${i+1}</span>
                <div class="card-content"><span class="placeholder-icon">👤</span></div>
            </div>
            <div class="card-label"><span>???</span></div>
        </div>
    `).join('');

    // Buttons generieren
    const btnContainer = document.getElementById('rank-buttons-container');
    btnContainer.innerHTML = "";
    Array.from({length: 5}, (_, i) => {
        const btn = document.createElement('button');
        btn.className = "rank-btn";
        btn.dataset.rank = i + 1;
        btn.textContent = i + 1;
        btn.addEventListener('click', (e) => {
            if (!e.isTrusted) return alert("Bot Aktivität blockiert!");
            handleRankSelection(i + 1, btn);
        });
        btnContainer.appendChild(btn);
    });
    
    document.getElementById('end-screen-area').classList.add('hidden');
    document.getElementById('active-game-area').classList.remove('hidden');
    document.getElementById('current-image-container').classList.remove('gold-glow');
    document.getElementById('joker-area').classList.add('hidden');
    
    // Elemente wieder einblenden, falls sie durch Joker-Phase ausgeblendet wurden
    document.getElementById('current-image-container').parentNode.classList.remove('hidden');
    document.querySelector('.mystery-name').classList.remove('hidden');
    document.getElementById('action-prompt').classList.remove('hidden');
    document.getElementById('rank-buttons-container').classList.remove('hidden');
    
    const sameRestartBtn = document.getElementById('restart-same-btn');
    if (sameRestartBtn) {
        sameRestartBtn.classList.remove('hidden');
    }
    
    resetRatingUI();
    
    // Live Game Dokument aufräumen beim Neustart
    const user = getCurrentUser();
    if (user) {
        deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
    }
    
    const punishPoolStr = localStorage.getItem('punish_pool_' + currentMode + '_' + currentGameCategory + '_classic');
    if (punishPoolStr) {
        try {
            const cachedPool = JSON.parse(punishPoolStr);
            if (cachedPool && cachedPool.length === 5) {
                activePool = cachedPool;
                
                // Lade den Fortschritt
                const punishStateStr = localStorage.getItem('punish_state_' + currentMode + '_' + currentGameCategory + '_classic');
                if (punishStateStr) {
                    const state = JSON.parse(punishStateStr);
                    currentIndex = state.currentIndex || 0;
                    placedCharacters = state.placedCharacters || { 1: null, 2: null, 3: null, 4: null, 5: null };
                } else {
                    currentIndex = 0;
                    placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
                }
            } else {
                startFreshClassicGame();
            }
        } catch (e) {
            startFreshClassicGame();
        }
    } else {
        startFreshClassicGame();
    }
    
    function startFreshClassicGame() {
        let poolSource = activeCharacterDatabase;
        if (currentMode === 'starwars') {
            if (currentGameCategory === 'klon') {
                poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('klon'));
            } else if (currentGameCategory === 'peak') {
                poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('peak'));
            } else if (currentGameCategory === 'vehicle') {
                poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('vehicle'));
            }
        }
        const suffix = currentGameCategory === 'normal' ? '' : '_' + currentGameCategory;
        activePool = drawFromBag(poolSource, 5, 'bag_classic_' + currentMode + suffix);
        localStorage.setItem('punish_pool_' + currentMode + '_' + currentGameCategory + '_classic', JSON.stringify(activePool));
        localStorage.removeItem('punish_state_' + currentMode + '_' + currentGameCategory + '_classic');
        currentIndex = 0;
        placedCharacters = { 1: null, 2: null, 3: null, 4: null, 5: null };
    }
    
    // Restore DOM if we resumed a game
    for (let i = 1; i <= 5; i++) {
        if (placedCharacters[i]) {
            document.querySelector(`#slot-${i} .card-content`).innerHTML = `<img src="${placedCharacters[i].img}" alt="Ranked">`;
            const btn = document.querySelector(`.rank-btn[data-rank="${i}"]`);
            if (btn) btn.disabled = true;
        }
    }
    
    
    preloadImages(activePool);
    showNextCharacter();
}

export function restartSameClassicGame() {
    localStorage.removeItem('punish_state_' + currentMode + '_' + currentGameCategory + '_classic');
    initGame();
}

export function showNextCharacter() {
    if (currentIndex < 5) {
        document.getElementById('progress-text').textContent = `CHARAKTER ${currentIndex + 1} / 5`;
        const currentChar = activePool[currentIndex];
        const imgContainer = document.getElementById('current-image-container');
        
        if (!currentChar) {
            console.warn('Kein aktueller Charakter gefunden, initiiere neues klassisches Spiel.');
            initGame();
            return;
        }
        
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild">`;
        
        const user = getCurrentUser();
        const discoveredList = user && user.discovered ? user.discovered : [];
        
        if (user && user.role !== 'admin' && !discoveredList.includes(currentChar.name)) {
            imgContainer.classList.add('gold-glow');
            // Charakter wurde aufgedeckt
        } else {
            imgContainer.classList.remove('gold-glow');
        }

    } else {
        // Wenn das Spiel zu Ende ist, Live-Status löschen
        const user = getCurrentUser();
        if (user) {
            deleteDoc(doc(db, "live_games", user.username)).catch(()=>{});
        }

        document.getElementById('active-game-area').classList.add('hidden');
        revealNames();
        document.getElementById('end-screen-area').classList.remove('hidden');
    }
}

export function revealNames() {
    for (let i = 1; i <= 5; i++) {
        const labelSpan = document.querySelector(`#slot-${i} .card-label span`);
        const placedChar = placedCharacters[i];
        if (!labelSpan) continue;
        if (placedChar && placedChar.name) {
            labelSpan.textContent = placedChar.name;
        } else {
            labelSpan.textContent = '???';
        }
        labelSpan.classList.add('revealed-name');
    }
}

export async function handleRankSelection(rank, buttonElement) {
    // The user has placed a character, but we only remove the punishment when they finish rating or start a new game.
    // Actually, we remove it when the game is finished (all 5 placed) so they can't reload during the game.
    
    const currentChar = activePool[currentIndex];
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked">`;
    placedCharacters[rank] = currentChar;
    
    buttonElement.disabled = true;
    currentIndex++;
    
    // Save progress to prevent reload-cheating
    localStorage.setItem('punish_state_' + currentMode + '_' + currentGameCategory + '_classic', JSON.stringify({
        currentIndex: currentIndex,
        placedCharacters: placedCharacters
    }));
    
    // Live Broadcast mit Pool-Info für Zuschauer
    const user = getCurrentUser();
    if(user && user.role !== 'admin' && !user.isTestUser) {
        try {
            setDoc(doc(db, "live_games", user.username), {
                displayName: user.displayName || user.username,
                avatar: user.avatar || '',
                placedCharacters,
                pool: activePool,
                currentIndex: currentIndex,
                updatedAt: Timestamp.now(),
                gameType: 'classic'
            }).catch(e => console.error("Live Broadcast Error:", e));
        } catch(e) {}
    }

    showNextCharacter();
}

export function submitFinalRating(value) {
    localStorage.removeItem('punish_pool_' + currentMode + '_' + currentGameCategory + '_classic');
    localStorage.removeItem('punish_state_' + currentMode + '_' + currentGameCategory + '_classic');
    saveGameToHistory(placedCharacters, value, activePool, 'classic', currentGameCategory);
}