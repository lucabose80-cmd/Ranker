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

export async function initGame() {
    const user = getCurrentUser();
    if (!user) return;
    
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
    try {
        const snap = await getDoc(doc(db, "config", "maintenance"));
        if (snap.exists()) {
            const data = snap.data();
            if (data.classic) {
                alert("Der klassische Modus ist derzeit wegen Wartungsarbeiten deaktiviert.");
                return;
            }
            if (data['cat_' + currentGameCategory]) {
                alert(`Die Kategorie '${currentGameCategory}' ist derzeit wegen Wartungsarbeiten deaktiviert.`);
                return;
            }
        }
    } catch(e) {}
    
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
    

    resetRatingUI();
    
    // Live Game Dokument aufräumen beim Neustart
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
            } else if (currentGameCategory === 'peak' || currentGameCategory === 'hardcore') {
                poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('peak'));
            } else if (currentGameCategory === 'vehicle') {
                poolSource = activeCharacterDatabase.filter(c => c.tags && c.tags.includes('vehicle'));
            } else {
                poolSource = activeCharacterDatabase.filter(c => !c.tags || !c.tags.includes('vehicle'));
            }
        } else {
            poolSource = activeCharacterDatabase.filter(c => !c.tags || !c.tags.includes('vehicle'));
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
        
        const hardcoreQuotes = {
            'Captain Rex': 'In my book, experience outranks everything.',
            'Commander Cody': 'Blast him!',
            'Fives': 'I am not just another number! None of us are!',
            'Echo': 'I am a soldier, like you!',
            'Wolffe': 'We are the Wolfpack.',
            'Gregor': 'It was an honor to serve with you, Rex.',
            'Obi-Wan Kenobi': 'Hello there.',
            'Yoda': 'Do or do not, there is no try.',
            'Anakin Skywalker': 'This is where the fun begins.',
            'Mace Windu': 'This party is over.',
            'Qui-Gon Jinn': 'There is always a bigger fish.',
            'Ahsoka Tano': 'I am no Jedi.',
            'Plo Koon': 'Not to me.',
            'Darth Vader': 'I find your lack of faith disturbing.',
            'Emperor Palpatine': 'I am the Senate.',
            'Darth Maul': 'Kenobi!!!',
            'Count Dooku': 'I have been looking forward to this.',
            'Grand Admiral Thrawn': 'To defeat an enemy, you must know them.',
            'Asajj Ventress': 'You are a fool to challenge me.',
            'Savage Opress': 'Brother, I am an unworthy apprentice.',
            'Din Djarin': 'This is the Way.',
            'Bo-Katan Kryze': 'Mandalore will survive.',
            'Boba Fett': 'I am a simple man making his way through the galaxy.',
            'Jango Fett': 'I am just a simple man trying to make my way in the universe.',
            'Pre Vizsla': 'For Mandalore!',
            'R2-D2': '*Beep boop beep*',
            'C-3PO': 'I am fluent in over six million forms of communication.',
            'General Grievous': 'General Kenobi. You are a bold one.',
            'BB-8': '*Happy beeps*',
            'K-2SO': 'Congratulations. You are being rescued.',
            'Kommando Droide': 'Roger roger.',
            'Chewbacca': '*Wookiee roar*',
            'Cassian Andor': 'Rebellions are built on hope.',
            'Cad Bane': 'I will take on any job... for the right price.',
            'Embo': '*Grunts*',
            'Padme Amidala': 'So this is how liberty dies... with thunderous applause.',
            'Grogu': '*Coos*'
        };
        
        const extraStyle = currentGameCategory === 'hardcore' ? 'filter: brightness(0);' : '';
        let quoteHtml = '';
        if (currentGameCategory === 'hardcore') {
            const quote = hardcoreQuotes[currentChar.name] || '...';
            quoteHtml = `<div style="text-align: center; font-style: italic; color: #ffd700; margin-top: 10px; font-size: 0.9rem;">"${quote}"</div>`;
        }
        imgContainer.innerHTML = `<img src="${currentChar.img}" alt="Charakter Bild" style="${extraStyle}">${quoteHtml}`;
        
        const user = getCurrentUser();
        const discoveredList = user && user.discovered ? user.discovered : [];
        
        if (user && user.role !== 'admin' && !discoveredList.includes(currentChar.name)) {
            imgContainer.classList.add('gold-glow');
            // Charakter wurde aufgedeckt
        } else {
            imgContainer.classList.remove('gold-glow');
        }

        if (window.top5GlobalChars && window.top5GlobalChars.includes(currentChar.name)) {
            imgContainer.classList.add('rainbow-border');
        } else {
            imgContainer.classList.remove('rainbow-border');
        }

    } else {
        if (window.playFinishListSound) window.playFinishListSound();
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
        
        const img = document.querySelector(`#slot-${i} .card-content img`);
        if (img) img.style.filter = 'none';
    }
}

export async function handleRankSelection(rank, buttonElement) {
    if (window.playRankSound) window.playRankSound();
    // The user has placed a character, but we only remove the punishment when they finish rating or start a new game.
    // Actually, we remove it when the game is finished (all 5 placed) so they can't reload during the game.
    
    const currentChar = activePool[currentIndex];
    const extraStyle = currentGameCategory === 'hardcore' ? 'filter: brightness(0);' : '';
    document.querySelector(`#slot-${rank} .card-content`).innerHTML = `<img src="${currentChar.img}" alt="Ranked" style="${extraStyle}">`;
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