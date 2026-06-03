import { collection, query, where, getDocs, limit, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { currentMode } from './mode-state.js';
import { updateWeeklyStat } from './challenges.js';

let imposterScore = 0;
let currentMatch = null;
let originalList = [];
let swappedList = [];
let swappedIndices = [];
let selectedIndices = [];
let cachedHistory = [];
let isLoading = false;

export async function initImposter() {
    console.log("Init Imposter Mode...");
    const userStr = localStorage.getItem('ranking_game_active_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        imposterScore = user.imposterScore || 0;
    } else {
        imposterScore = 0;
    }
    updateScoreDisplay();
    
    document.getElementById('imposter-submit-btn').addEventListener('click', handleImposterSubmit);
    document.getElementById('imposter-next-btn').addEventListener('click', loadNextImposter);
    
    // Listen for tab switch to load first match if empty
    const imposterTab = document.getElementById('nav-imposter');
    if (imposterTab) {
        imposterTab.addEventListener('click', () => {
            if (cachedHistory.length === 0 && !isLoading) {
                loadNextImposter();
            }
        });
    }
}

async function fetchImposterMatches() {
    isLoading = true;
    try {
        const historyRef = collection(db, "history");
        // Remove 'where' to avoid Firestore composite index requirements.
        // We just fetch the latest 100 matches and filter locally.
        const q = query(historyRef, orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        
        cachedHistory = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // We need a list of exactly 5 elements that were actually ranked AND it must match the current mode
            if (data.mode === currentMode && data.ranking && data.ranking.length === 5) {
                cachedHistory.push(data);
            }
        });
        
        // Shuffle the cached history so it's not always in the same order
        cachedHistory = cachedHistory.sort(() => Math.random() - 0.5);
    } catch (e) {
        console.error("Fehler beim Laden der Imposter-Matches: ", e);
    }
    isLoading = false;
}

export async function loadNextImposter() {
    if (isLoading) return;
    
    const container = document.getElementById('imposter-list-container');
    container.innerHTML = '<p style="color:#aaa; text-align:center;">Lade Akte...</p>';
    
    document.getElementById('imposter-submit-btn').classList.remove('hidden');
    document.getElementById('imposter-next-btn').classList.add('hidden');
    const rewardText = document.getElementById('imposter-reward-text');
    if (rewardText) rewardText.classList.add('hidden');
    
    resetSubmitButton();
    selectedIndices = [];
    
    if (cachedHistory.length === 0) {
        await fetchImposterMatches();
    }
    
    if (cachedHistory.length === 0) {
        container.innerHTML = '<p style="color:#ff4757; text-align:center;">Keine passenden Akten in der Datenbank gefunden.</p>';
        return;
    }
    
    currentMatch = cachedHistory.pop(); // Take one from the shuffled cache
    
    // Populate UI info
    document.getElementById('imposter-player-name').innerText = currentMatch.displayName || currentMatch.username;
    
    let categoryText = currentMatch.category || "Unbekannt";
    const catMap = {
        'normal': 'Expanded Universe',
        'klon': 'Nur Klone',
        'peak': 'Peak Ranking',
        'vehicle': 'Fahrzeuge',
        'hardcore': 'Hardcore Peak'
    };
    if (catMap[categoryText]) {
        categoryText = catMap[categoryText];
    }
    
    let typeText = currentMatch.gameType === 'advanced' ? ' (Advanced)' : ' (Classic)';
    document.getElementById('imposter-category').innerText = categoryText + typeText;
    
    let ratingText = currentMatch.rating || "N/A";
    if (typeof ratingText === "number" || !isNaN(parseInt(ratingText))) {
        ratingText = ratingText + "/10";
    }
    document.getElementById('imposter-rating').innerText = ratingText;
    
    // Prepare lists
    originalList = [...currentMatch.ranking];
    swappedList = [...currentMatch.ranking];
    
    // Pick 2 random distinct indices to swap
    let idx1 = Math.floor(Math.random() * 5);
    let idx2 = Math.floor(Math.random() * 5);
    while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * 5);
    }
    swappedIndices = [idx1, idx2];
    
    // Swap them
    let temp = swappedList[idx1];
    swappedList[idx1] = swappedList[idx2];
    swappedList[idx2] = temp;
    
    renderImposterList();
}

function renderImposterList() {
    const container = document.getElementById('imposter-list-container');
    container.innerHTML = '';
    
    swappedList.forEach((char, index) => {
        const charEl = document.createElement('div');
        charEl.className = 'glass-panel imposter-card';
        charEl.dataset.index = index;
        charEl.style.display = 'flex';
        charEl.style.alignItems = 'center';
        charEl.style.padding = '10px 15px';
        charEl.style.gap = '15px';
        charEl.style.cursor = 'pointer';
        charEl.style.transition = 'all 0.2s ease';
        charEl.style.userSelect = 'none';
        
        // Initial style
        updateCardStyle(charEl, false);
        
        charEl.innerHTML = `
            <div style="font-weight:bold; font-size:1.2rem; color:#aaa; width: 25px;">#${index + 1}</div>
            <img src="${char.img}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
            <div style="font-size: 1rem; font-weight: bold; color: #fff;">${char.name}</div>
            <div class="imposter-check" style="margin-left: auto; font-size: 1.5rem; display: none;">✅</div>
        `;
        
        charEl.addEventListener('click', () => toggleSelection(index, charEl));
        container.appendChild(charEl);
    });
}

function toggleSelection(index, el) {
    const pos = selectedIndices.indexOf(index);
    if (pos > -1) {
        // Deselect
        selectedIndices.splice(pos, 1);
        updateCardStyle(el, false);
    } else {
        // Select (only if less than 2)
        if (selectedIndices.length < 2) {
            selectedIndices.push(index);
            updateCardStyle(el, true);
        }
    }
    
    updateSubmitButton();
}

function updateCardStyle(el, isSelected) {
    if (isSelected) {
        el.style.border = '2px solid #9b59b6';
        el.style.background = 'rgba(155,89,182,0.2)';
        el.style.transform = 'scale(1.02)';
        const check = el.querySelector('.imposter-check');
        if (check) check.style.display = 'block';
    } else {
        el.style.border = '1px solid rgba(255,255,255,0.1)';
        el.style.background = 'rgba(0,0,0,0.3)';
        el.style.transform = 'scale(1)';
        const check = el.querySelector('.imposter-check');
        if (check) check.style.display = 'none';
    }
}

function updateSubmitButton() {
    const btn = document.getElementById('imposter-submit-btn');
    if (selectedIndices.length === 2) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.innerText = 'Auflösen';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.innerText = `Auflösen (${selectedIndices.length}/2 Ausgewählt)`;
    }
}

function resetSubmitButton() {
    const btn = document.getElementById('imposter-submit-btn');
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
    btn.innerText = 'Auflösen (2 Auswählen)';
    btn.style.background = 'rgba(155,89,182,0.5)';
}

function handleImposterSubmit() {
    if (selectedIndices.length !== 2) return;
    
    const btn = document.getElementById('imposter-submit-btn');
    btn.classList.add('hidden');
    
    const nextBtn = document.getElementById('imposter-next-btn');
    nextBtn.classList.remove('hidden');
    
    const container = document.getElementById('imposter-list-container');
    const cards = container.querySelectorAll('.imposter-card');
    
    // Disable clicking
    cards.forEach(card => card.style.pointerEvents = 'none');
    
    const isCorrect = (selectedIndices.includes(swappedIndices[0]) && selectedIndices.includes(swappedIndices[1]));
    
    if (isCorrect) {
        if (window.playSuccessSound) window.playSuccessSound();
        imposterScore++;
        updateScoreDisplay();
        updateWeeklyStat('imposterScore', 1);
        
        // 20 Credits Belohnung
        const userStr = localStorage.getItem('ranking_game_active_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            user.credits = (user.credits || 0) + 20;
            localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
            if (window.updateCreditProgressBars) window.updateCreditProgressBars();
            
            // Firebase Update
            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, { credits: user.credits }).catch(e => console.error("Error updating credits: ", e));
            
            const rewardText = document.getElementById('imposter-reward-text');
            if (rewardText) {
                rewardText.classList.remove('hidden');
                // Force animation trigger
                rewardText.style.animation = 'none';
                rewardText.offsetHeight; /* trigger reflow */
                rewardText.style.animation = null; 
            }
        }
        
        // Highlight correct
        cards.forEach((card, idx) => {
            if (selectedIndices.includes(idx)) {
                card.style.border = '2px solid #2ed573';
                card.style.background = 'rgba(46,213,115,0.2)';
            } else {
                card.style.opacity = '0.5';
            }
        });
    } else {
        if (window.playErrorSound) window.playErrorSound();
        
        // Show what was wrong and what was right
        cards.forEach((card, idx) => {
            const check = card.querySelector('.imposter-check');
            if (check) check.style.display = 'none';
            
            if (swappedIndices.includes(idx)) {
                // This was the actual swapped one (should have been selected)
                card.style.border = '2px dashed #2ed573';
                card.style.background = 'rgba(46,213,115,0.2)';
                if (selectedIndices.includes(idx)) {
                    // They guessed this one right!
                    card.style.border = '2px solid #2ed573';
                }
            } else if (selectedIndices.includes(idx)) {
                // They guessed this one wrong
                card.style.border = '2px solid #ff4757';
                card.style.background = 'rgba(255,71,87,0.2)';
            } else {
                card.style.opacity = '0.5';
            }
        });
    }
}

function updateScoreDisplay() {
    document.getElementById('imposter-score-display').innerText = imposterScore;
}
