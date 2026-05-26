import { db } from './firebase-config.js';
import { getCurrentUser, refreshCurrentUser } from './auth.js';
import { currentMode, activeCharacterDatabase } from './mode-state.js';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

let dailyCharacter = null;
let currentGuesses = [];
let hasWonToday = false;

function getDailySeed() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().slice(0, 10);
}

function selectDailyCharacter() {
    const seed = getDailySeed();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; 
    }
    const index = Math.abs(hash) % activeCharacterDatabase.length;
    return activeCharacterDatabase[index];
}

export async function initStarWarsdle() {
    document.getElementById('starwarsdle-guesses').innerHTML = '';
    dailyCharacter = selectDailyCharacter();
    currentGuesses = [];
    hasWonToday = false;
    
    const input = document.getElementById('starwarsdle-input');
    const autocomplete = document.getElementById('starwarsdle-autocomplete');
    const guessBtn = document.getElementById('starwarsdle-guess-btn');
    
    document.getElementById('starwarsdle-win').style.display = 'none';
    document.getElementById('starwarsdle-hints').style.display = 'none';
    document.getElementById('starwarsdle-hint-faction').style.display = 'none';
    document.getElementById('starwarsdle-hint-image').style.display = 'none';
    document.getElementById('starwarsdle-hint-letter').style.display = 'none';
    input.disabled = false;
    guessBtn.disabled = false;
    
    const thead = document.getElementById('starwarsdle-thead');
    if(currentMode === 'starwars') {
        thead.innerHTML = `<tr style="border-bottom: 2px solid #333;"><th style="padding: 5px;">Charakter</th><th style="padding: 5px;">Geschlecht</th><th style="padding: 5px;">Spezies</th><th style="padding: 5px;">Heimatplanet</th><th style="padding: 5px;">Fraktion</th><th style="padding: 5px;">Epoche</th><th style="padding: 5px;">Macht</th></tr>`;
    } else {
        thead.innerHTML = `<tr style="border-bottom: 2px solid #333;"><th style="padding: 5px;">Charakter</th><th style="padding: 5px;">Geschlecht</th><th style="padding: 5px;">Spezies</th><th style="padding: 5px;">Anime</th><th style="padding: 5px;">Haarfarbe</th><th style="padding: 5px;">Magie</th></tr>`;
    }

    await loadProgress();

    const handleInput = () => {
        const val = input.value.toLowerCase();
        autocomplete.innerHTML = '';
        if(!val) { autocomplete.style.display = 'none'; return; }
        
        const matches = activeCharacterDatabase.filter(c => 
            c.name.toLowerCase().includes(val) && 
            !currentGuesses.some(g => g.name === c.name)
        ).slice(0, 5);
        
        if(matches.length > 0) {
            autocomplete.style.display = 'block';
            matches.forEach(m => {
                const div = document.createElement('div');
                div.style.padding = '10px'; div.style.cursor = 'pointer'; div.style.borderBottom = '1px solid #333'; div.textContent = m.name;
                div.addEventListener('click', () => { input.value = m.name; autocomplete.style.display = 'none'; makeGuess(m); });
                autocomplete.appendChild(div);
            });
        } else { autocomplete.style.display = 'none'; }
    };
    input.removeEventListener('input', input._handleInput);
    input._handleInput = handleInput;
    input.addEventListener('input', handleInput);

    const handleGuess = () => {
        const val = input.value.toLowerCase();
        const match = activeCharacterDatabase.find(c => c.name.toLowerCase() === val);
        if(match && !currentGuesses.some(g => g.name === match.name)) {
            makeGuess(match); autocomplete.style.display = 'none';
        } else { alert('Charakter nicht gefunden oder bereits geraten!'); }
    };
    guessBtn.removeEventListener('click', guessBtn._handleGuess);
    guessBtn._handleGuess = handleGuess;
    guessBtn.addEventListener('click', handleGuess);

    const handleKey = (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            if (autocomplete.style.display !== 'none' && autocomplete.firstChild) autocomplete.firstChild.click();
            else guessBtn.click();
        }
    };
    input.removeEventListener('keydown', input._handleKey);
    input._handleKey = handleKey;
    input.addEventListener('keydown', handleKey);

    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== autocomplete) autocomplete.style.display = 'none';
    });
}

async function loadProgress() {
    const user = await refreshCurrentUser();
    const seed = getDailySeed();
    const prefix = currentMode + 'dle';
    const savedDate = localStorage.getItem(prefix + '_date');
    
    if(savedDate === seed) {
        const savedGuesses = JSON.parse(localStorage.getItem(prefix + '_guesses') || '[]');
        savedGuesses.forEach(gName => {
            const char = activeCharacterDatabase.find(c => c.name === gName);
            if(char) renderGuess(char, true);
        });
        hasWonToday = localStorage.getItem(prefix + '_won') === 'true';
        if(hasWonToday) { showWinScreen(JSON.parse(localStorage.getItem(prefix + '_guesses')).length); } 
        else if(currentGuesses.length >= 5) { showHints(); }
    } else {
        localStorage.setItem(prefix + '_date', seed);
        localStorage.setItem(prefix + '_guesses', '[]');
        localStorage.setItem(prefix + '_won', 'false');
    }
}

function makeGuess(char) {
    if(hasWonToday) return;
    
    document.getElementById('starwarsdle-input').value = '';
    renderGuess(char, false);
    
    const prefix = currentMode + 'dle';
    const savedGuesses = JSON.parse(localStorage.getItem(prefix + '_guesses') || '[]');
    savedGuesses.push(char.name);
    localStorage.setItem(prefix + '_guesses', JSON.stringify(savedGuesses));
    
    if(char.name === dailyCharacter.name) {
        hasWonToday = true;
        localStorage.setItem(prefix + '_won', 'true');
        showWinScreen(currentGuesses.length, true);
        saveScoreToFirebase(currentGuesses.length);
    } else {
        if(currentGuesses.length >= 5) showHints();
        saveDailyStateToFirebase();
    }
}

function compareArrays(arr1, arr2) {
    if(!arr1 || !arr2) return 'none';
    const overlap = arr1.filter(item => arr2.includes(item));
    if(overlap.length === arr1.length && arr1.length === arr2.length) return 'exact';
    if(overlap.length > 0) return 'partial';
    return 'none';
}

function getStyle(state) {
    if(state === 'exact') return 'background-color: #2ed573; color: white;';
    if(state === 'partial') return 'background-color: #ffa502; color: white;';
    return 'background-color: #ff4757; color: white;';
}

function renderGuess(char, isLoad) {
    currentGuesses.push(char);
    const tbody = document.getElementById('starwarsdle-guesses');
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #333';
    
    let html = `<td style="padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 5px;"><img src="${char.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"><span style="font-size: 0.8rem;">${char.name}</span></td>`;
    
    if (currentMode === 'starwars') {
        let genderState = char.gender === dailyCharacter.gender ? 'exact' : 'none';
        let speciesState = char.species === dailyCharacter.species ? 'exact' : 'none';
        let factionState = compareArrays(char.faction, dailyCharacter.faction);
        let planetState = char.planet === dailyCharacter.planet ? 'exact' : 'none';
        let eraState = compareArrays(char.era, dailyCharacter.era);
        let forceState = char.force === dailyCharacter.force ? 'exact' : 'none';
        html += `<td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(genderState)}">${char.gender || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(speciesState)}">${char.species || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(planetState)}">${char.planet || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(factionState)}">${char.faction ? char.faction.join(', ') : '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(eraState)}">${char.era ? char.era.join(', ') : '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(forceState)}">${char.force ? 'Ja' : 'Nein'}</div></td>`;
    } else {
        let genderState = char.gender === dailyCharacter.gender ? 'exact' : 'none';
        let speciesState = char.species === dailyCharacter.species ? 'exact' : 'none';
        let animeState = char.anime === dailyCharacter.anime ? 'exact' : 'none';
        let hairState = char.hair === dailyCharacter.hair ? 'exact' : 'none';
        let magicState = char.magic === dailyCharacter.magic ? 'exact' : 'none';
        html += `<td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(genderState)}">${char.gender || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(speciesState)}">${char.species || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(animeState)}">${char.anime || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(hairState)}">${char.hair || '?'}</div></td><td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(magicState)}">${char.magic ? 'Ja' : 'Nein'}</div></td>`;
    }
    
    tr.innerHTML = html;
    if(!isLoad) { tr.style.opacity = '0'; tr.style.transform = 'translateY(-10px)'; tbody.prepend(tr); setTimeout(() => { tr.style.transition = 'all 0.3s ease'; tr.style.opacity = '1'; tr.style.transform = 'translateY(0)'; }, 10); } else { tbody.prepend(tr); }
}

function showHints() {
    document.getElementById('starwarsdle-hints').style.display = 'block';
    if(currentGuesses.length >= 5) {
        document.getElementById('starwarsdle-hint-faction').style.display = 'block';
        document.getElementById('starwarsdle-hint-faction-text').textContent = currentMode === 'starwars' ? (dailyCharacter.faction ? dailyCharacter.faction.join(', ') : '?') : dailyCharacter.anime;
    }
    if(currentGuesses.length >= 10) {
        document.getElementById('starwarsdle-hint-image').style.display = 'block';
        const canvas = document.getElementById('starwarsdle-hint-canvas');
        if(canvas && !canvas.dataset.loaded) { canvas.dataset.loaded = '1'; const ctx = canvas.getContext('2d'); const img = new Image(); img.onload = () => { ctx.filter = 'blur(2px)'; ctx.drawImage(img, 0, 0, 80, 80); }; img.src = dailyCharacter.img; }
    }
    if(currentGuesses.length >= 15) {
        document.getElementById('starwarsdle-hint-letter').style.display = 'block';
        document.getElementById('starwarsdle-hint-letter-text').textContent = dailyCharacter.name.charAt(0).toUpperCase();
    }
}

function showWinScreen(attempts) {
    document.getElementById('starwarsdle-win').style.display = 'block';
    document.getElementById('starwarsdle-win-img').src = dailyCharacter.img;
    document.getElementById('starwarsdle-win-name').textContent = dailyCharacter.name;
    document.getElementById('starwarsdle-win-attempts').textContent = attempts;
    document.getElementById('starwarsdle-input').disabled = true;
    document.getElementById('starwarsdle-guess-btn').disabled = true;
}

async function saveDailyStateToFirebase() {
    const user = getCurrentUser();
    if(!user || user.role === 'admin' || user.isTestUser) return;
    const seed = getDailySeed();
    const prefix = currentMode + 'dle';
    const guesses = JSON.parse(localStorage.getItem(prefix + '_guesses') || '[]');
    const won = localStorage.getItem(prefix + '_won') === 'true';
    try {
        await updateDoc(doc(db, "users", user.uid), { [`${prefix}Guesses`]: guesses, [`${prefix}Won`]: won, [`${prefix}Date`]: seed });
    } catch(e) {}
}

async function saveScoreToFirebase(attempts) {
    const user = getCurrentUser();
    if(!user) return;
    const seed = getDailySeed();
    const userId = user.uid;
    const username = user.displayName || "Unknown";
    try {
        const q = query(collection(db, currentMode + "dle_scores"), where("userId", "==", userId), where("date", "==", seed));
        const snap = await getDocs(q);
        if (snap.empty) {
            await addDoc(collection(db, currentMode + "dle_scores"), { userId, username, attempts, date: seed, timestamp: Timestamp.now() });
        }
        await saveDailyStateToFirebase();
        await refreshCurrentUser();
    } catch(e) {}
}
