import { starWarsCharacters } from "./data-starwars.js";
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, Timestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// === 1. DATEN-ANREICHERUNG (ALGORITHMISCH) ===
function enrichCharacters() {
    starWarsCharacters.forEach(c => {
        // Gender
        let gender = "Männlich";
        if(c.tags.includes("heiss") || ["Ahsoka Tano", "Leia Organa", "Shaak Ti", "Luminara Unduli", "Aayla Secura", "Bo-Katan Kryze", "Rey Skywalker", "Captain Phasma", "Asajj Ventress", "Merrin", "Morgan Elsbeth", "Mother Talzin", "Duchess Satine", "Ursa Wren", "Koska Reeves", "Jyn Erso", "Mon Mothma", "Hera Syndulla", "Sabine Wren", "Rose Tico", "Vice Admiral Holdo", "Maz Kanata", "Padme Amidala", "Riyo Chuchi", "Cere Junda", "Barriss Offee", "Katooni", "Second Sister", "Third Sister", "Seventh Sister", "Fennec Shand", "Zam Wesell", "Aurra Sing", "Qi'ra", "Oola", "Omega"].includes(c.name)) {
            gender = "Weiblich";
        }
        if(c.tags.includes("droide")) gender = "Droide";
        if(c.tags.includes("monster") || ["Grogu", "Rancor", "Wampa", "Sarlacc", "Nexu", "Acklay", "Reek", "Rathtar", "Zillo Beast", "Mudhorn"].includes(c.name)) gender = "Unbekannt";

        // Force
        let force = c.tags.includes("jedi") || ["Grogu", "Emperor Palpatine"].includes(c.name) || c.tags.includes("sith") || c.tags.includes("inquisitor") || c.tags.includes("nachtschwester") || c.tags.includes("grau");

        // Species
        let species = "Mensch";
        if(c.tags.includes("klon")) species = "Mensch (Klon)";
        if(c.tags.includes("droide")) species = "Droide";
        if(["Ahsoka Tano", "Shaak Ti"].includes(c.name)) species = "Togruta";
        if(["Yoda", "Grogu", "Yaddle"].includes(c.name)) species = "Yodas Spezies";
        if(["Darth Maul", "Savage Opress"].includes(c.name)) species = "Zabrak";
        if(["Chewbacca", "Gungi"].includes(c.name)) species = "Wookiee";
        if(["Jabba the Hutt", "Rotta the Hutt", "Ziro the Hutt", "Gardulla the Hutt", "The Twins"].includes(c.name) || c.tags.includes("hutte")) species = "Hutt";
        if(["Plo Koon"].includes(c.name)) species = "Kel Dor";
        if(["Kit Fisto", "Nahdar Vebb"].includes(c.name)) species = "Nautolaner";
        if(["Ki-Adi-Mundi"].includes(c.name)) species = "Cereaner";
        if(["Aayla Secura", "Bib Fortuna", "Hera Syndulla", "Oola"].includes(c.name)) species = "Twi'lek";
        if(["Asajj Ventress", "Merrin"].includes(c.name)) species = "Dathomirianer";
        if(c.tags.includes("monster")) species = "Monster";
        if(["Admiral Ackbar"].includes(c.name)) species = "Mon Calamari";
        if(["Cad Bane"].includes(c.name)) species = "Duros";

        // Faction
        let faction = [];
        if(c.tags.includes("jedi")) faction.push("Jedi-Orden");
        if(c.tags.includes("sith")) faction.push("Sith");
        if(c.tags.includes("imperium") || c.tags.includes("inquisitor")) faction.push("Imperium");
        if(c.tags.includes("rebell") || c.name === "Ahsoka Tano") faction.push("Rebellion");
        if(c.tags.includes("klon") && !c.tags.includes("imperium")) faction.push("Republik");
        if(c.tags.includes("separatist")) faction.push("Separatisten");
        if(c.tags.includes("mandalorian")) faction.push("Mandalorianer");
        if(c.tags.includes("kopfgeldjäger")) faction.push("Kopfgeldjäger");
        if(c.tags.includes("erste_ordnung")) faction.push("Erste Ordnung");
        if(c.tags.includes("widerstand")) faction.push("Widerstand");
        if(c.tags.includes("unterwelt") || c.tags.includes("schmuggel") || c.tags.includes("pirat") || c.tags.includes("hutte")) faction.push("Unterwelt");
        if(c.tags.includes("nachtschwester") || c.name === "Savage Opress" || c.name === "Darth Maul") faction.push("Nachtschwestern/Dathomir");
        if(c.tags.includes("senat")) faction.push("Senat");
        if(faction.length === 0) faction.push("Neutral");

        // Era
        let era = [];
        let p = ["klon", "separatist", "jedi"];
        if(p.some(t => c.tags.includes(t)) || ["Anakin Skywalker", "Obi-Wan Kenobi", "Padme Amidala", "Darth Maul", "Emperor Palpatine"].includes(c.name)) {
            era.push("Prequels/Clone Wars");
        }
        if(c.tags.includes("erste_ordnung") || c.tags.includes("widerstand") || ["Rey Skywalker", "Kylo Ren", "Luke Skywalker", "Leia Organa", "Han Solo", "Chewbacca"].includes(c.name)) {
            era.push("Sequels");
        }
        if(["Luke Skywalker", "Darth Vader", "Han Solo", "Leia Organa", "Emperor Palpatine", "Boba Fett", "Lando Calrissian"].includes(c.name) || c.tags.includes("imperium") || c.tags.includes("rebell")) {
            era.push("Originals");
        }
        if(c.tags.includes("mandalorian") || ["Grogu", "Moff Gideon", "Ahsoka Tano", "Boba Fett", "Luke Skywalker"].includes(c.name)) {
            era.push("Mandalorian/Ahsoka");
        }
        if(era.length === 0) era.push("Unbekannt");

        // Set enrichment
        c.gender = gender;
        c.species = species;
        c.faction = faction;
        c.era = era;
        c.force = force;
    });
}

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
export function initStarWarsdle() {
    enrichCharacters();
    dailyCharacter = selectDailyCharacter();
    
    const input = document.getElementById('starwarsdle-input');
    const autocomplete = document.getElementById('starwarsdle-autocomplete');
    const guessBtn = document.getElementById('starwarsdle-guess-btn');
    
    // Load progress
    loadProgress();
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
}

function checkGlow() {
    const seed = getDailySeed();
    const saved = localStorage.getItem('starwarsdle_date');
    const glow = document.getElementById('starwarsdle-glow');
    if(glow) {
        if(saved !== seed) {
            glow.style.display = 'block';
        } else {
            glow.style.display = 'none';
        }
    }
}

function loadProgress() {
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
        showWinScreen(currentGuesses.length);
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
    // 7 attempts = Hint 2 (Image)
    if(currentGuesses.length >= 7) {
        document.getElementById('starwarsdle-hint-image').style.display = 'block';
        document.getElementById('starwarsdle-hint-image-img').src = dailyCharacter.img;
    }
    // 9 attempts = Hint 3 (Letter)
    if(currentGuesses.length >= 9) {
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

async function saveScoreToFirebase(attempts) {
    if(!auth.currentUser) return;
    
    const seed = getDailySeed();
    const userId = auth.currentUser.uid;
    const username = auth.currentUser.displayName || "Unknown";
    
    try {
        // Check if already submitted today
        const q = query(collection(db, "starwarsdle_scores"), where("userId", "==", userId), where("date", "==", seed));
        const snap = await getDocs(q);
        if(!snap.empty) return; // already saved
        
        await addDoc(collection(db, "starwarsdle_scores"), {
            userId: userId,
            username: username,
            attempts: attempts,
            date: seed,
            timestamp: Timestamp.now()
        });
    } catch(e) {
        console.error("Error saving score: ", e);
    }
}
