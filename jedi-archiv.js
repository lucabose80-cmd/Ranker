import { getCurrentUser } from './auth.js';
import { currentMode } from './mode-state.js';
import { starWarsCharacters } from './data-starwars.js';

let currentSlideIndex = 0;
const SLIDES_COUNT = 6;
let cachedStats = null;
let cachedUser = null;

export async function startJediArchive() {
    const user = getCurrentUser();
    if (!user) return;
    
    document.getElementById('jedi-archiv-modal').classList.remove('hidden');
    document.getElementById('jedi-archiv-slides').innerHTML = '<div class="jedi-loading">Lade Holocron-Datenbank...</div>';
    currentSlideIndex = 0;
    
    try {
        const { collection, query, where, getDocs, getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');

        const historyQuery = query(collection(db, "history"), where("username", "==", user.username));
        const gamesQuery = query(collection(db, "games"), where("username", "==", user.username));
        
        const [historySnap, gamesSnap] = await Promise.all([getDocs(historyQuery), getDocs(gamesQuery)]);
        const historyDocs = [...historySnap.docs.map(d => d.data()), ...gamesSnap.docs.map(d => d.data())];
        
        const gScoresSnap = await getDoc(doc(db, "scores", `${currentMode}_classic_global`));
        const globalStats = gScoresSnap.exists() ? gScoresSnap.data().characters : {};
        
        cachedStats = calculateStats(historyDocs, globalStats, user);
        cachedUser = user;
        
        renderSlide(currentSlideIndex);
        
    } catch(e) {
        console.error("Fehler beim Laden des Jedi-Archivs:", e);
        document.getElementById('jedi-archiv-slides').innerHTML = '<div class="jedi-loading">Fehler beim Zugriff auf das Archiv.</div>';
    }
}

function calculateStats(historyDocs, globalStats, user) {
    const charStats = {};
    let modeCounts = { 'Ranking': 0, 'Cardgame': 0, 'Imposter': 0, 'Marathon': 0 };
    
    historyDocs.forEach(doc => {
        const dMode = doc.mode || 'starwars'; // Fallback for very old games
        if (dMode === currentMode) {
            if (doc.gameType === 'classic' || doc.gameType === 'advanced' || !doc.gameType) {
                modeCounts['Ranking']++;
                
                let ranking = doc.ranking;
                if (!ranking && doc.character1) {
                    ranking = [];
                    for (let i = 1; i <= 5; i++) {
                        if (doc[`character${i}`]) ranking.push({ name: doc[`character${i}`], img: '' });
                    }
                }
                
                if (ranking && ranking.length > 0) {
                    const maxIdx = ranking.length - 1;
                    ranking.forEach((char, idx) => {
                        if (!charStats[char.name]) charStats[char.name] = { sum: 0, count: 0, img: char.img, name: char.name };
                        if (!charStats[char.name].img && char.img) charStats[char.name].img = char.img;
                        
                        const normalizedRank = maxIdx > 0 ? ((idx / maxIdx) * 4) + 1 : 1;
                        charStats[char.name].sum += normalizedRank;
                        charStats[char.name].count++;
                    });
                }
            } else if (doc.gameType === 'imposter') modeCounts['Imposter']++;
            else if (doc.gameType === 'marathon') modeCounts['Marathon']++;
        }
    });
    
    modeCounts['Cardgame'] = user.cardgameStats ? (user.cardgameStats.wins || 0) + (user.cardgameStats.losses || 0) : 0;
    modeCounts['StarWarsdle'] = user.starwarsdle_won || 0;
    
    let liebling = { name: "Niemand", img: "", avg: 999 };
    let erzfeind = { name: "Niemand", img: "", avg: -1 };
    let hotTake = { name: "Keiner", img: "", diff: 0, userAvg: 0, globalAvg: 0 };
    let totalJediRebel = 0;
    let totalSithEmpire = 0;
    
    const charsData = currentMode === 'starwars' ? starWarsCharacters : [];
    
    // Sort global characters to determine ranks
    const globalCharsList = Object.values(globalStats || {}).sort((a,b) => (b.score / (b.count || 1)) - (a.score / (a.count || 1)));
    
    Object.keys(charStats).forEach(name => {
        const stats = charStats[name];
        
        // Finde Missing Images in charsData falls nötig
        const charInfo = charsData.find(c => c.name === name);
        if (!stats.img && charInfo && charInfo.img) stats.img = charInfo.img;

        // Liebling / Erzfeind (Minimum 2 gespielte Runden für Repräsentativität)
        if (stats.count >= 2) {
            const avg = stats.sum / stats.count;
            if (avg < liebling.avg) { liebling = { name, avg, img: stats.img, count: stats.count }; }
            if (avg > erzfeind.avg) { erzfeind = { name, avg, img: stats.img, count: stats.count }; }
        }
        
        if (charInfo && stats.count > 0) {
            const f = charInfo.faction ? charInfo.faction.join(' ').toLowerCase() : '';
            if (f.includes('jedi') || f.includes('republik') || f.includes('rebell')) totalJediRebel += stats.count;
            if (f.includes('sith') || f.includes('imperium') || f.includes('separatist')) totalSithEmpire += stats.count;
        }
        
        if (stats.count >= 2 && globalStats && globalStats[name] && globalStats[name].count >= 3) {
            // Inverse the user average for comparison because global score is higher = better
            // stats.sum is 1 to 5 (1 is best).
            const userScore = 6 - (stats.sum / stats.count); 
            const globalAvgScore = globalStats[name].score / globalStats[name].count;
            const diff = userScore - globalAvgScore;
            
            if (diff > hotTake.diff) {
                hotTake = { name, img: stats.img, diff, userAvg: userScore, globalAvg: globalAvgScore };
            }
        }
    });

    if (liebling.avg === 999) liebling = { name: "Niemand", img: "", count: 0 };
    if (erzfeind.avg === -1) erzfeind = { name: "Niemand", img: "", count: 0 };

    let bestMode = "Ranking";
    let maxPlays = modeCounts['Ranking'];
    for(let m in modeCounts) {
        if(modeCounts[m] > maxPlays) { maxPlays = modeCounts[m]; bestMode = m; }
    }
    
    let alignment = "Neutral";
    let alignmentText = "Die Macht ist im Gleichgewicht bei dir.";
    if (totalSithEmpire > totalJediRebel * 1.5) {
        alignment = "Dunkle Seite";
        alignmentText = "Mit starker Affinität zu den Sith hast du dich der Dunklen Seite ergeben!";
    } else if (totalJediRebel > totalSithEmpire * 1.5) {
        alignment = "Helle Seite";
        alignmentText = "Die Macht ist stark in dir. Ein wahrer Beschützer des Friedens!";
    }

    return { liebling, erzfeind, hotTake, bestMode, alignment, alignmentText, plays: modeCounts[bestMode] };
}

function renderSlide(index) {
    const container = document.getElementById('jedi-archiv-slides');
    if (!cachedStats) return;
    
    if(window.playImposterSuccessSound) window.playImposterSuccessSound();
    
    let html = '';
    
    if (index === 0) {
        // Liebling
        html = `
            <div class="jedi-slide fade-in-scale">
                <h2>Dein treuester Verbündeter</h2>
                <div class="jedi-card gold-glow">
                    ${cachedStats.liebling.img ? `<img src="${cachedStats.liebling.img}">` : '<div class="jedi-placeholder"></div>'}
                </div>
                <h3>${cachedStats.liebling.name}</h3>
                <p>Wenn es hart auf hart kommt, wählst du immer ihn. Niemand steht im Durchschnitt weiter oben auf deinen Listen (Ø Platz ${(cachedStats.liebling.avg||1).toFixed(1)} nach ${cachedStats.liebling.count} Matches).</p>
            </div>
        `;
    } else if (index === 1) {
        // Erzfeind
        html = `
            <div class="jedi-slide fade-in-scale">
                <h2 style="color: #ff4757;">Dein Erzfeind</h2>
                <div class="jedi-card red-glow">
                    ${cachedStats.erzfeind.img ? `<img src="${cachedStats.erzfeind.img}">` : '<div class="jedi-placeholder"></div>'}
                </div>
                <h3>${cachedStats.erzfeind.name}</h3>
                <p>Jeder Held braucht einen Schurken. Mit ihm wirst du einfach nicht warm. Durchschnittlich verbanntest du ihn auf Platz ${(cachedStats.erzfeind.avg||5).toFixed(1)}.</p>
            </div>
        `;
    } else if (index === 2) {
        // Hot Take
        html = `
            <div class="jedi-slide fade-in-scale">
                <h2 style="color: #ffa502;">Der Hot-Take</h2>
                <div class="jedi-card orange-glow">
                    ${cachedStats.hotTake.img ? `<img src="${cachedStats.hotTake.img}">` : '<div class="jedi-placeholder"></div>'}
                </div>
                <h3>${cachedStats.hotTake.name}</h3>
                <p>Du schwimmst gegen den Strom! Während die Galaxis diesen Charakter sehr kritisch sieht, ist er für dich ein absoluter Top-Tier-Pick. Ein echter Hot-Take!</p>
            </div>
        `;
    } else if (index === 3) {
        // Alignment
        const color = cachedStats.alignment === 'Dunkle Seite' ? '#ff4757' : (cachedStats.alignment === 'Helle Seite' ? '#3498db' : '#2ed573');
        html = `
            <div class="jedi-slide fade-in-scale">
                <h2 style="color: ${color};">Deine Ausrichtung</h2>
                <div style="font-size: 5rem; margin: 20px 0;">⚖️</div>
                <h3 style="color: ${color};">${cachedStats.alignment}</h3>
                <p>${cachedStats.alignmentText}</p>
            </div>
        `;
    } else if (index === 4) {
        // Best Mode
        html = `
            <div class="jedi-slide fade-in-scale">
                <h2 style="color: #a29bfe;">Deine Spezialdisziplin</h2>
                <div style="font-size: 5rem; margin: 20px 0;">⚔️</div>
                <h3 style="color: #a29bfe;">${cachedStats.bestMode}</h3>
                <p>Hier zeigst du dein wahres Können. Mit ${cachedStats.plays} absolvierten Spielen machst du dir in diesem Sektor der Galaxis einen Namen!</p>
            </div>
        `;
    } else if (index === 5) {
        // Summary
        const titleText = currentMode === 'starwars' ? cachedUser.activeTitle_starwars : cachedUser.activeTitle_waifu;
        html = `
            <div class="jedi-slide fade-in-scale" id="jedi-summary-export" style="background: linear-gradient(135deg, #11151f 0%, #1e2738 100%); border: 2px solid #2a3142; padding: 20px; border-radius: 15px; min-width: 300px;">
                <h2 style="color: #ffd700; margin-bottom: 5px;">Holo-Chronik</h2>
                <h4 style="color: #888; margin-top: 0; margin-bottom: 20px;">${cachedUser.displayName || cachedUser.username} - ${titleText !== 'Kein Titel' ? titleText : 'Gefreiter'}</h4>
                
                <div style="display:flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                    <div style="text-align:center;">
                        <div class="jedi-mini-card gold-glow"><img src="${cachedStats.liebling.img}"></div>
                        <div style="font-size:0.7rem; color:#ffd700; margin-top:5px;">Liebling</div>
                    </div>
                    <div style="text-align:center;">
                        <div class="jedi-mini-card red-glow"><img src="${cachedStats.erzfeind.img}"></div>
                        <div style="font-size:0.7rem; color:#ff4757; margin-top:5px;">Erzfeind</div>
                    </div>
                    <div style="text-align:center;">
                        <div class="jedi-mini-card orange-glow"><img src="${cachedStats.hotTake.img}"></div>
                        <div style="font-size:0.7rem; color:#ffa502; margin-top:5px;">Hot-Take</div>
                    </div>
                </div>
                
                <div style="font-size: 0.9rem; margin-top: 10px;">Ausrichtung: <span style="font-weight:bold;">${cachedStats.alignment}</span></div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Bester Modus: <span style="font-weight:bold;">${cachedStats.bestMode}</span></div>
                <img src="favicon.svg" style="width: 30px; opacity: 0.5; margin-top: 20px;">
            </div>
            <button class="rank-btn" id="jedi-download-btn" style="margin-top: 30px; background: #2ed573; color: #111;">Als Bild speichern</button>
        `;
    }
    
    container.innerHTML = html;
    
    // Controls
    const nav = document.createElement('div');
    nav.className = 'jedi-nav';
    nav.innerHTML = `
        <button id="jedi-prev-btn" class="text-btn" ${index === 0 ? 'style="visibility:hidden;"' : ''}>Zurück</button>
        <span style="color:#666; font-size:0.8rem;">${index + 1} / ${SLIDES_COUNT}</span>
        <button id="jedi-next-btn" class="text-btn" ${index === SLIDES_COUNT - 1 ? 'style="visibility:hidden;"' : ''}>Weiter</button>
    `;
    container.appendChild(nav);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'jedi-close-btn';
    closeBtn.innerHTML = '✖';
    closeBtn.onclick = () => document.getElementById('jedi-archiv-modal').classList.add('hidden');
    container.appendChild(closeBtn);
    
    if (index > 0) document.getElementById('jedi-prev-btn').onclick = () => renderSlide(index - 1);
    if (index < SLIDES_COUNT - 1) document.getElementById('jedi-next-btn').onclick = () => renderSlide(index + 1);
    
    const downloadBtn = document.getElementById('jedi-download-btn');
    if (downloadBtn) {
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.onload = () => bindDownload(downloadBtn);
            document.head.appendChild(script);
        } else {
            bindDownload(downloadBtn);
        }
    }
}

function bindDownload(btn) {
    btn.onclick = () => {
        btn.textContent = 'Wird generiert...';
        btn.disabled = true;
        const target = document.getElementById('jedi-summary-export');
        html2canvas(target, { backgroundColor: '#111', useCORS: true, allowTaint: true }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Jedi_Archiv_${cachedUser.displayName || cachedUser.username}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            btn.textContent = 'Erfolgreich gespeichert!';
        }).catch(err => {
            console.error(err);
            btn.textContent = 'Fehler aufgetreten';
            btn.disabled = false;
        });
    };
}
