import { starWarsCharacters } from "./data-starwars.js";
import { db } from "./firebase-config.js";
import { getCurrentUser, refreshCurrentUser } from "./auth.js";
import { collection, addDoc, Timestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// === 2. DAILY LOGIC ===
let dailyCharacter = null;
let currentGuesses = [];
let hasWonToday = false;

function getDailySeed() {
    const today = new Date();
    // Use local time day string "YYYY-MM-DD"
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString().slice(0, 10);
    return localISOTime;
}

function selectDailyCharacter() {
    const seed = getDailySeed();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; 
    }
    const index = Math.abs(hash) % starWarsCharacters.length;
    return starWarsCharacters[index];
}

// === 3. UI LOGIC ===
export async function initStarWarsdle() {
    
    dailyCharacter = selectDailyCharacter();
    
    const input = document.getElementById('starwarsdle-input');
    const autocomplete = document.getElementById('starwarsdle-autocomplete');
    const guessBtn = document.getElementById('starwarsdle-guess-btn');
    
    // Load progress
    await loadProgress();
    checkGlow();

    // Input Autocomplete
    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        autocomplete.innerHTML = '';
        if(!val) {
            autocomplete.style.display = 'none';
            return;
        }
        
        const matches = starWarsCharacters.filter(c => 
            c.name.toLowerCase().includes(val) && 
            !currentGuesses.some(g => g.name === c.name)
        ).slice(0, 5);
        
        if(matches.length > 0) {
            autocomplete.style.display = 'block';
            matches.forEach(m => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.cursor = 'pointer';
                div.style.borderBottom = '1px solid #333';
                div.textContent = m.name;
                div.addEventListener('click', () => {
                    input.value = m.name;
                    autocomplete.style.display = 'none';
                    makeGuess(m);
                });
                autocomplete.appendChild(div);
            });
        } else {
            autocomplete.style.display = 'none';
        }
    });

    guessBtn.addEventListener('click', () => {
        const val = input.value.toLowerCase();
        const match = starWarsCharacters.find(c => c.name.toLowerCase() === val);
        if(match && !currentGuesses.some(g => g.name === match.name)) {
            makeGuess(match);
            autocomplete.style.display = 'none';
        } else {
            alert("Charakter nicht gefunden oder bereits geraten!");
        }
    });

    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            guessBtn.click();
        }
    });
}

function checkGlow() {
    const seed = getDailySeed();
    const saved = localStorage.getItem('starwarsdle_date');
    const won = localStorage.getItem('starwarsdle_won');
    const glow = document.getElementById('starwarsdle-glow');
    if(glow) {
        if(saved !== seed || won !== 'true') {
            glow.style.display = 'block';
        } else {
            glow.style.display = 'none';
        }
    }
}

async function loadProgress() {
    const user = await refreshCurrentUser();
    if(user && user.starwarsdleResetAt) {
        const localReset = parseInt(localStorage.getItem("starwarsdle_local_reset") || "0");
        if (user.starwarsdleResetAt.seconds > localReset) {
            localStorage.setItem("starwarsdle_local_reset", user.starwarsdleResetAt.seconds.toString());
            localStorage.setItem("starwarsdle_date", "RESET");
            localStorage.setItem("starwarsdle_won", "false");
            localStorage.setItem("starwarsdle_guesses", "[]");
            localStorage.setItem("starwarsdle_streak", "0");
        }
    }
    const seed = getDailySeed();
    const savedDate = localStorage.getItem('starwarsdle_date');
    
    if(savedDate === seed) {
        const savedGuesses = JSON.parse(localStorage.getItem('starwarsdle_guesses') || '[]');
        savedGuesses.forEach(gName => {
            const char = starWarsCharacters.find(c => c.name === gName);
            if(char) renderGuess(char, true);
        });
        hasWonToday = localStorage.getItem('starwarsdle_won') === 'true';
        if(hasWonToday) {
            showWinScreen(JSON.parse(localStorage.getItem('starwarsdle_guesses')).length);
        } else if(currentGuesses.length >= 5) {
            showHints();
        }
    } else {
        // Reset for new day
        localStorage.setItem('starwarsdle_date', seed);
        localStorage.setItem('starwarsdle_guesses', '[]');
        localStorage.setItem('starwarsdle_won', 'false');
    }
}

function makeGuess(char) {
    if(hasWonToday) return;
    
    document.getElementById('starwarsdle-input').value = '';
    renderGuess(char, false);
    
    const savedGuesses = JSON.parse(localStorage.getItem('starwarsdle_guesses') || '[]');
    savedGuesses.push(char.name);
    localStorage.setItem('starwarsdle_guesses', JSON.stringify(savedGuesses));
    
    if(char.name === dailyCharacter.name) {
        hasWonToday = true;
        localStorage.setItem('starwarsdle_won', 'true');
        document.getElementById('starwarsdle-glow').style.display = 'none';
        showWinScreen(currentGuesses.length, true);
        saveScoreToFirebase(currentGuesses.length);
    } else {
        if(currentGuesses.length >= 5) {
            showHints();
        }
    }
}

function compareArrays(arr1, arr2) {
    const overlap = arr1.filter(item => arr2.includes(item));
    if(overlap.length === arr1.length && arr1.length === arr2.length) return "exact";
    if(overlap.length > 0) return "partial";
    return "none";
}

function getStyle(state) {
    if(state === "exact") return "background-color: #2ed573; color: white;";
    if(state === "partial") return "background-color: #ffa502; color: white;";
    return "background-color: #ff4757; color: white;";
}

function renderGuess(char, isLoad) {
    currentGuesses.push(char);
    const tbody = document.getElementById('starwarsdle-guesses');
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #333';
    
    // Gender
    let genderState = char.gender === dailyCharacter.gender ? "exact" : "none";
    // Species
    let speciesState = char.species === dailyCharacter.species ? "exact" : "none";
    // Faction
    let factionState = compareArrays(char.faction, dailyCharacter.faction);
    // Planet
    let planetState = char.planet === dailyCharacter.planet ? "exact" : "none";
    // Era
    let eraState = compareArrays(char.era, dailyCharacter.era);
    // Force
    let forceState = char.force === dailyCharacter.force ? "exact" : "none";

    tr.innerHTML = `
        <td style="padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <img src="${char.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <span style="font-size: 0.8rem;">${char.name}</span>
        </td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(genderState)}">${char.gender}</div></td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(speciesState)}">${char.species}</div></td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(planetState)}">${char.planet}</div></td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(factionState)}">${char.faction.join(', ')}</div></td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(eraState)}">${char.era.join(', ')}</div></td>
        <td style="padding: 10px;"><div style="padding: 5px; border-radius: 4px; ${getStyle(forceState)}">${char.force ? 'Ja' : 'Nein'}</div></td>
    `;
    
    // Animate in
    if(!isLoad) {
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(-10px)';
        tbody.prepend(tr);
        setTimeout(() => {
            tr.style.transition = 'all 0.3s ease';
            tr.style.opacity = '1';
            tr.style.transform = 'translateY(0)';
        }, 10);
    } else {
        tbody.prepend(tr);
    }
}

function showHints() {
    document.getElementById('starwarsdle-hints').style.display = 'block';
    
    // 5 attempts = Hint 1 (Faction)
    if(currentGuesses.length >= 5) {
        document.getElementById('starwarsdle-hint-faction').style.display = 'block';
        document.getElementById('starwarsdle-hint-faction-text').textContent = dailyCharacter.faction.join(', ');
    }
    // 7 attempts = Hint 2 (Image - rendered on canvas to hide src from DevTools)
    if(currentGuesses.length >= 7) {
        document.getElementById('starwarsdle-hint-image').style.display = 'block';
        const canvas = document.getElementById('starwarsdle-hint-canvas');
        if(canvas && !canvas.dataset.loaded) {
            canvas.dataset.loaded = '1';
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.filter = 'blur(2px)';
                ctx.drawImage(img, 0, 0, 80, 80);
            };
            img.src = dailyCharacter.img;
        }
    }
    // 9 attempts = Hint 3 (Letter)
    if(currentGuesses.length >= 9) {
        document.getElementById('starwarsdle-hint-letter').style.display = 'block';
        document.getElementById('starwarsdle-hint-letter-text').textContent = dailyCharacter.name.charAt(0).toUpperCase();
    }
}

function updateAndGetStreak(isNewWin) {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const todaySeed = (new Date(today - offset)).toISOString().slice(0, 10);
    
    let streak = parseInt(localStorage.getItem('starwarsdle_streak') || '0');
    const lastWin = localStorage.getItem('starwarsdle_last_win');

    if (isNewWin) {
        if (!lastWin) {
            streak = 1;
        } else if (lastWin !== todaySeed) {
            let isBroken = false;
            let checkDate = new Date(lastWin);
            checkDate.setUTCDate(checkDate.getUTCDate() + 1);
            const todayDate = new Date(todaySeed);
            
            while (checkDate < todayDate) {
                const dayOfWeek = checkDate.getUTCDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    isBroken = true;
                    break;
                }
                checkDate.setUTCDate(checkDate.getUTCDate() + 1);
            }
            
            if (isBroken) {
                streak = 1;
            } else {
                streak++;
            }
        }
        localStorage.setItem('starwarsdle_streak', streak.toString());
        localStorage.setItem('starwarsdle_last_win', todaySeed);
    }
    return streak;
}

function showWinScreen(attempts, isNewWin = false) {
    const streak = updateAndGetStreak(isNewWin);
    document.getElementById('starwarsdle-win').style.display = 'block';
    document.getElementById('starwarsdle-win-img').src = dailyCharacter.img;
    document.getElementById('starwarsdle-win-name').textContent = dailyCharacter.name;
    document.getElementById('starwarsdle-win-attempts').textContent = attempts;
    const streakEl = document.getElementById('starwarsdle-win-streak');
    if(streakEl) streakEl.textContent = streak;
    document.getElementById('starwarsdle-input').disabled = true;
    document.getElementById('starwarsdle-guess-btn').disabled = true;
}

async function saveScoreToFirebase(attempts) {
    const user = getCurrentUser();
    if(!user) return;
    
    const seed = getDailySeed();
    const userId = user.uid;
    const username = user.displayName || "Unknown";
    
    try {
        // Check if already submitted today
        const q = query(collection(db, "starwarsdle_scores"), where("userId", "==", userId), where("date", "==", seed));
        const snap = await getDocs(q);
        if(!snap.empty) return; // already saved
        
        await addDoc(collection(db, "starwarsdle_scores"), {
            userId, username, attempts, date: seed, timestamp: Timestamp.now()
        });
        
        const streak = parseInt(localStorage.getItem('starwarsdle_streak') || '0');
        await updateDoc(doc(db, "users", userId), {
            starwarsdleStreak: streak
        });
    } catch(e) {
        console.error("Error saving score: ", e);
    }
}



