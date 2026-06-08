import { starWarsCharacters } from './data-starwars.js';
import { getCurrentUser } from './auth.js';
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode } from './mode-state.js';
import { checkWeeklyReset } from './challenges.js';

let marathonLives = 3;
let marathonScore = 0;
let placedCharacters = [];
let currentDraw = null;
let remainingPool = [];
let globalAveragesMap = null; // Speichert die echten globalen Durchschnittswerte
let isProcessing = false;

// Hilfsfunktion: Gibt den echten Score aus Firebase zurück, oder Heuristik als Fallback
function getGlobalAverageScore(char) {
    if (globalAveragesMap && globalAveragesMap[char.name]) {
        return globalAveragesMap[char.name];
    }
    // Fallback Heuristik, falls ein Charakter (noch) nicht gerankt wurde
    let power = 25;
    const tags = char.tags || [];
    
    // Tiers
    if (tags.includes('peak') && (tags.includes('sith') || tags.includes('jedi'))) power += 15;
    else if (tags.includes('peak')) power += 10;
    
    if (tags.includes('jedi_meister') || tags.includes('sith_lord')) power += 8;
    else if (tags.includes('jedi') || tags.includes('sith')) power += 4;
    
    if (tags.includes('commander') || tags.includes('captain')) power += 6;
    else if (tags.includes('soldat')) power += 2;
    
    if (tags.includes('zivilist') || tags.includes('politiker')) power -= 4;
    if (tags.includes('droide')) power -= 2;
    if (tags.includes('padawan')) power += 2;

    return power;
}

export async function loadGlobalAverages() {
    try {
        const docRef = doc(db, "scores", `${currentMode}_classic_global`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().characters) {
            const charactersData = docSnap.data().characters;
            globalAveragesMap = {};
            
            Object.values(charactersData).forEach(charData => {
                const count = charData.count || 1;
                // Average score calculation, usually ranges from ~5 to ~45
                globalAveragesMap[charData.name] = charData.score / count; 
            });
            console.log("Marathon: Real global averages loaded!");
        }
    } catch(e) {
        console.error("Marathon: Failed to load global averages, using fallback.", e);
    }
}

export function initMarathon() {
    const startBtn = document.getElementById('marathon-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startMarathon);
    }
    loadGlobalAverages();
}

function playSuccessSound() {
    try {
        if(window.isAudioMuted) return;
        const actx = window.getSharedAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, actx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.3);
    } catch(e) {}
}

function playErrorSound() {
    try {
        if(window.isAudioMuted) return;
        const actx = window.getSharedAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, actx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.3);
    } catch(e) {}
}

function startMarathon() {
    marathonLives = 3;
    marathonScore = 0;
    placedCharacters = [];
    remainingPool = [...starWarsCharacters];
    
    updateHeaderUI();
    document.getElementById('marathon-list-container').innerHTML = '';
    
    // Erster Draw (wird direkt in die Liste gepackt)
    const firstChar = drawCharacter();
    placedCharacters.push(firstChar);
    
    renderPlacedList();
    drawNextCharacter();
}

function drawCharacter() {
    if (remainingPool.length === 0) return null;
    const index = Math.floor(Math.random() * remainingPool.length);
    return remainingPool.splice(index, 1)[0];
}

function drawNextCharacter() {
    currentDraw = drawCharacter();
    const container = document.getElementById('marathon-current-card');
    
    if (!currentDraw) {
        container.innerHTML = `<h3 style="color:#2ed573;">Wahnsinn! Du hast alle Charaktere gerankt!</h3>`;
        gameOver();
        return;
    }
    
    container.innerHTML = `
        <img src="${currentDraw.img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid #e74c3c; margin-bottom: 5px; box-shadow: 0 0 10px rgba(231,76,60,0.5);">
        <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${currentDraw.name}</h3>
    `;
    
    renderPlacedList();
    isProcessing = false;
}

function updateHeaderUI() {
    document.getElementById('marathon-score').textContent = marathonScore;
    let livesStr = '';
    for (let i = 0; i < marathonLives; i++) livesStr += '❤️';
    if (marathonLives === 0) livesStr = '💀';
    document.getElementById('marathon-lives').textContent = livesStr;
}

function renderPlacedList() {
    const listContainer = document.getElementById('marathon-list-container');
    listContainer.innerHTML = '';
    
    // Top Insert Button
    listContainer.appendChild(createInsertButton(0));
    
    placedCharacters.forEach((char, index) => {
        const charEl = document.createElement('div');
        charEl.className = 'glass-panel';
        charEl.style.display = 'flex';
        charEl.style.alignItems = 'center';
        charEl.style.padding = '5px 10px';
        charEl.style.gap = '8px';
        
        charEl.innerHTML = `
            <div style="font-weight:bold; font-size:1rem; color:#aaa;">#${index + 1}</div>
            <img src="${char.img}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;">
            <div style="font-size: 0.9rem; font-weight: bold; color: #fff;">${char.name}</div>
        `;
        listContainer.appendChild(charEl);
        
        // Insert Button below this character
        listContainer.appendChild(createInsertButton(index + 1));
    });
}

function createInsertButton(insertIndex) {
    const btn = document.createElement('button');
    btn.className = 'rank-btn';
    btn.style.width = '30px';
    btn.style.height = '40px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.padding = '0';
    btn.style.margin = '0';
    btn.style.fontSize = '1.2rem';
    btn.style.fontWeight = 'bold';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.border = '1px dashed rgba(255,255,255,0.2)';
    btn.style.color = '#aaa';
    btn.style.borderRadius = '8px';
    btn.textContent = '+';
    
    btn.onmouseover = () => {
        btn.style.background = 'rgba(231,76,60,0.3)';
        btn.style.borderColor = '#e74c3c';
        btn.style.color = '#fff';
    };
    btn.onmouseout = () => {
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
        btn.style.color = '#aaa';
    };
    
    btn.onclick = () => handleInsert(insertIndex);
    return btn;
}

function handleInsert(index) {
    if (!currentDraw || marathonLives <= 0 || isProcessing) return;
    isProcessing = true;
    
    const newScore = getGlobalAverageScore(currentDraw);
    
    let isMistake = false;
    
    // Check upper boundary (Lower index = higher rank = should have HIGHER score)
    // Wenn wir den Charakter einfügen, sollte der Charakter DARÜBER (index - 1) eigentlich BESSER sein (höherer Score).
    // Wenn der Charakter darüber aber schlechter ist, ist es 1 zu 1 ein Fehler im Vergleich zur globalen Liste.
    if (index > 0) {
        const charAbove = placedCharacters[index - 1];
        if (getGlobalAverageScore(charAbove) < newScore) {
            isMistake = true;
        }
    }
    
    // Check lower boundary (Higher index = lower rank = should have LOWER score)
    // Der Charakter DARUNTER (index) sollte eigentlich SCHLECHTER sein (niedrigerer Score).
    // Wenn er besser ist, ist es ein Fehler.
    if (index < placedCharacters.length) {
        const charBelow = placedCharacters[index];
        if (getGlobalAverageScore(charBelow) > newScore) {
            isMistake = true;
        }
    }
    
    if (isMistake) {
        playErrorSound();
        marathonLives--;
        updateHeaderUI();
        
        // Visuelles Feedback
        const container = document.getElementById('marathon-current-card');
        const oldHtml = container.innerHTML;
        container.innerHTML = `<h3 style="color:#ff4757; font-size:1.5rem;">FALSCH!</h3><p style="font-size: 0.9rem;">Zu weit vom globalen Schnitt entfernt!</p>`;
        
        setTimeout(() => {
            if (marathonLives <= 0) {
                gameOver(index);
            } else {
                container.innerHTML = oldHtml;
                isProcessing = false;
                // Wir rufen NICHT drawNextCharacter() auf, damit der Spieler denselben Charakter erneut einordnen muss!
            }
        }, 2000);
    } else {
        // Korrekt eingefügt!
        playSuccessSound();
        placedCharacters.splice(index, 0, currentDraw);
        marathonScore++;
        updateHeaderUI();
        
        drawNextCharacter();
    }
}

async function gameOver(failedIndex) {
    const container = document.getElementById('marathon-current-card');
    
    let correctIndex = placedCharacters.length;
    if (placedCharacters.length > 0 && currentDraw) {
        const failScore = getGlobalAverageScore(currentDraw);
        for (let i = 0; i < placedCharacters.length; i++) {
            if (getGlobalAverageScore(placedCharacters[i]) < failScore) {
                correctIndex = i;
                break;
            }
        }
    }
    
    // Liste neu rendern mit visuellen Indikatoren (Rot für Falsch, Grün für Richtig)
    const listContainer = document.getElementById('marathon-list-container');
    listContainer.innerHTML = '';
    
    const createGhostCard = (char, type) => {
        const el = document.createElement('div');
        el.className = 'glass-panel';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.padding = '5px 10px';
        el.style.gap = '8px';
        
        if (type === 'red') {
            el.style.border = '2px solid #ff4757';
            el.style.background = 'rgba(255,71,87,0.2)';
            el.style.boxShadow = '0 0 10px rgba(255,71,87,0.5)';
        } else {
            el.style.border = '2px dashed #2ed573';
            el.style.background = 'rgba(46,213,115,0.2)';
            el.style.boxShadow = '0 0 10px rgba(46,213,115,0.3)';
        }
        
        el.innerHTML = `
            <div style="font-weight:bold; font-size:1.2rem; color:${type==='red'?'#ff4757':'#2ed573'};">${type === 'red' ? 'X' : '✓'}</div>
            <img src="${char.img}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;">
            <div style="font-size: 0.9rem; font-weight: bold; color: #fff;">${char.name}</div>
        `;
        return el;
    };
    
    for (let i = 0; i <= placedCharacters.length; i++) {
        // Bei Index i könnten wir den Ghost rendern
        if (i === failedIndex && typeof failedIndex !== 'undefined') {
            listContainer.appendChild(createGhostCard(currentDraw, 'red'));
        }
        if (i === correctIndex && typeof failedIndex !== 'undefined') {
            listContainer.appendChild(createGhostCard(currentDraw, 'green'));
        }
        
        // Regulärer Charakter
        if (i < placedCharacters.length) {
            const char = placedCharacters[i];
            const charEl = document.createElement('div');
            charEl.className = 'glass-panel';
            charEl.style.display = 'flex';
            charEl.style.alignItems = 'center';
            charEl.style.padding = '5px 10px';
            charEl.style.gap = '8px';
            charEl.style.opacity = '0.5'; // Restliche Liste leicht dimmen für Fokus auf Fehler/Richtig
            
            charEl.innerHTML = `
                <div style="font-weight:bold; font-size:1rem; color:#aaa;">#${i + 1}</div>
                <img src="${char.img}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;">
                <div style="font-size: 0.9rem; font-weight: bold; color: #fff;">${char.name}</div>
            `;
            listContainer.appendChild(charEl);
        }
    }

    let earnedCredits = 0;
    for (let i = 1; i <= marathonScore; i++) {
        if (i <= 5) {
            earnedCredits += 1;
        } else {
            earnedCredits += (i - 4);
        }
    }

    container.innerHTML = `
        <h2 style="color: #ff4757; font-size: 2.5rem; margin-bottom: 10px; margin-top: 0;">GAME OVER</h2>
        <p style="font-size: 1.2rem; color: #fff; margin-bottom: 5px;">Score: <strong style="color:#ffd700;">${marathonScore}</strong> Charaktere</p>
        <p style="font-size: 1.2rem; color: #fff; margin-bottom: 20px;">Belohnung: <strong style="color:#00d2d3;">+${earnedCredits} Credits</strong></p>
        <button id="marathon-restart-btn" class="rank-btn" style="width: 100%; height: auto; padding: 15px; font-size: 1.2rem; background: linear-gradient(135deg, rgba(231,76,60,0.7), rgba(192,57,43,0.7)); color: white !important;">Erneut Spielen</button>
    `;
    
    document.getElementById('marathon-restart-btn').addEventListener('click', startMarathon);
    
    const user = getCurrentUser();
    if (!user || user.isTestUser) return;
    
    try {
        // 1. Speichere im persönlichen Profil (All-time highscore und Credits Belohnung)
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            const currentHigh = data.marathonHighscore || 0;
            const currentCredits = data.credits || 0;
            
            const updates = {};
            if (marathonScore > 0) {
                updates.credits = currentCredits + earnedCredits;
            }
            if (marathonScore > currentHigh) {
                updates.marathonHighscore = marathonScore;
            }
            
            if (Object.keys(updates).length > 0) {
                await updateDoc(userRef, updates);
                
                // Lokalen User aktualisieren für die UI-Anzeige
                if (updates.credits) {
                    user.credits = updates.credits;
                    localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
                    if (window.updateCreditProgressBars) window.updateCreditProgressBars();
                }
            }
        }
        
        // 2. Speichere im Globalen Marathon-Scoreboard
        const marathonGlobalRef = doc(db, 'marathon_scores', user.uid);
        const marathonGlobalDoc = await getDoc(marathonGlobalRef);
        let globalHigh = 0;
        if (marathonGlobalDoc.exists()) {
            globalHigh = marathonGlobalDoc.data().score || 0;
        }
        if (marathonScore > globalHigh) {
            await setDoc(marathonGlobalRef, {
                username: user.displayName || user.username || 'Unbekannt',
                score: marathonScore,
                timestamp: new Date()
            });
        }
        
        // 3. Speichere für die Galaktische Liga (wöchentlich)
        await checkWeeklyReset(); // Sicherstellen, dass die aktuelle Woche geladen ist
        // Wait! We need to implement updateMarathonChallenge in challenges.js!
        import('./challenges.js').then(module => { module.updateWeeklyStat('marathonScore', marathonScore); });

    } catch (e) {
        console.error("Fehler beim Speichern des Marathon Scores:", e);
    }
}

