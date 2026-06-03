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
        <img src="${currentDraw.img}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid #e74c3c; margin-bottom: 10px; box-shadow: 0 0 15px rgba(231,76,60,0.5);">
        <h2 style="margin: 0; color: #fff;">${currentDraw.name}</h2>
    `;
    
    renderPlacedList();
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
        charEl.style.padding = '10px 20px';
        charEl.style.justifyContent = 'space-between';
        
        charEl.innerHTML = `
            <div style="display:flex; align-items:center; gap: 15px;">
                <div style="font-weight:bold; font-size:1.5rem; color:#aaa; width: 40px;">#${index + 1}</div>
                <img src="${char.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">${char.name}</div>
            </div>
        `;
        listContainer.appendChild(charEl);
        
        // Insert Button below this character
        listContainer.appendChild(createInsertButton(index + 1));
    });
}

function createInsertButton(insertIndex) {
    const btn = document.createElement('button');
    btn.className = 'rank-btn';
    btn.style.width = '100%';
    btn.style.padding = '5px';
    btn.style.margin = '2px 0';
    btn.style.fontSize = '0.9rem';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.border = '1px dashed rgba(255,255,255,0.2)';
    btn.style.color = '#aaa';
    btn.textContent = 'Hier einfügen';
    
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
    if (!currentDraw || marathonLives <= 0) return;
    
    const newScore = getGlobalAverageScore(currentDraw);
    
    let isMistake = false;
    
    // Check upper boundary (Lower index = higher rank = should have HIGHER score)
    // Wenn wir den Charakter einfügen, sollte der Charakter DARÜBER (index - 1) eigentlich BESSER sein (höherer Score).
    // Falls der Charakter darüber WESENTLICH schlechter ist (Score < newScore - 8), ist es ein Fehler.
    // Die Scores liegen normalerweise zwischen ~10 und ~45, daher ist eine Varianz von 8 realistisch.
    if (index > 0) {
        const charAbove = placedCharacters[index - 1];
        if (getGlobalAverageScore(charAbove) < newScore - 6) {
            isMistake = true;
        }
    }
    
    // Check lower boundary (Higher index = lower rank = should have LOWER score)
    // Der Charakter DARUNTER (index) sollte eigentlich SCHLECHTER sein (niedrigerer Score).
    // Falls der Charakter darunter WESENTLICH besser ist (Score > newScore + 8), ist es ein Fehler.
    if (index < placedCharacters.length) {
        const charBelow = placedCharacters[index];
        if (getGlobalAverageScore(charBelow) > newScore + 6) {
            isMistake = true;
        }
    }
    
    if (isMistake) {
        marathonLives--;
        updateHeaderUI();
        
        // Visuelles Feedback
        const container = document.getElementById('marathon-current-card');
        const oldHtml = container.innerHTML;
        container.innerHTML = `<h3 style="color:#ff4757; font-size:2rem;">FALSCH!</h3><p>Das weicht zu stark vom globalen Durchschnitt ab!</p>`;
        
        setTimeout(() => {
            if (marathonLives <= 0) {
                gameOver();
            } else {
                container.innerHTML = oldHtml;
                drawNextCharacter();
            }
        }, 2000);
    } else {
        // Korrekt eingefügt!
        placedCharacters.splice(index, 0, currentDraw);
        marathonScore++;
        updateHeaderUI();
        
        drawNextCharacter();
    }
}

async function gameOver() {
    const container = document.getElementById('marathon-current-card');
    container.innerHTML = `
        <h2 style="color: #ff4757; font-size: 2.5rem; margin-bottom: 10px;">GAME OVER</h2>
        <p style="font-size: 1.2rem; color: #fff;">Du hast <strong style="color:#ffd700;">${marathonScore}</strong> Charaktere erfolgreich eingeordnet!</p>
        <button id="marathon-restart-btn" class="rank-btn" style="margin-top:20px; padding: 10px 20px; font-size: 1.2rem; background: #3498db; color: white;">Erneut Spielen</button>
    `;
    
    document.getElementById('marathon-restart-btn').addEventListener('click', startMarathon);
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        // 1. Speichere im persönlichen Profil (All-time highscore)
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            const currentHigh = data.marathonHighscore || 0;
            if (marathonScore > currentHigh) {
                await updateDoc(userRef, { marathonHighscore: marathonScore });
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

