import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, runTransaction } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';

function getWeekId() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, '0');
    const d = String(monday.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export async function initChallenges() {
    const btn = document.getElementById('nav-challenges-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('challenges-modal');
            if (modal) modal.classList.remove('hidden');
            renderChallenges();
        });
    }

    const closeBtn = document.getElementById('close-challenges-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('challenges-modal');
            if (modal) modal.classList.add('hidden');
        });
    }

    // Modal background click
    const modal = document.getElementById('challenges-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Automatically check for resets when logging in
    setTimeout(() => {
        checkWeeklyReset();
    }, 5000);
}

export async function checkWeeklyReset() {
    const currentWeek = getWeekId();
    const configRef = doc(db, 'config', 'weekly_challenges');

    try {
        await runTransaction(db, async (transaction) => {
            const configDoc = await transaction.get(configRef);
            if (!configDoc.exists()) {
                transaction.set(configRef, { currentWeek });
                return;
            }

            const data = configDoc.data();
            if (data.currentWeek !== currentWeek) {
                // We need to reset! But we also need to pay out rewards first.
                // We shouldn't do complex queries inside a transaction if we can avoid it.
                // But we must update the currentWeek to prevent multiple users from paying out.
                // We will mark the transition state.
                transaction.update(configRef, { currentWeek });
                
                // Then outside transaction we do the payout.
                // It's safe enough because the first person to get the transaction sets it.
                setTimeout(() => processRewards(data.currentWeek), 100);
            }
        });
    } catch (e) {
        console.warn("Could not check weekly reset:", e);
    }
}

async function processRewards(oldWeekId) {
    if (!oldWeekId) return;

    try {
        const statsRef = collection(db, "weekly_stats", oldWeekId, "players");
        const playersSnap = await getDocs(statsRef);
        
        let players = [];
        playersSnap.forEach(docSnap => players.push({ uid: docSnap.id, ...docSnap.data() }));

        // Category 1: Ranking Games
        players.sort((a, b) => (b.rankingGames || 0) - (a.rankingGames || 0));
        await payoutCategory(players.slice(0, 3), 'Fleißigster Ranker', [800, 400, 200]);

        // Category 2: Adventure Max Level
        players.sort((a, b) => (b.adventureMaxLevel || 0) - (a.adventureMaxLevel || 0));
        await payoutCategory(players.slice(0, 3), 'Abenteuer-Pionier', [800, 400, 200]);

        // Category 3: Starwarsdle Avg Tries
        const dlePlayers = players.filter(p => p.starwarsdleAvgTries && p.starwarsdleAvgTries > 0);
        dlePlayers.sort((a, b) => a.starwarsdleAvgTries - b.starwarsdleAvgTries);
        await payoutCategory(dlePlayers.slice(0, 3), 'Starwarsdle-Meister', [600, 300, 150]);

        // Category 4: Marathon Score
        const marathonPlayers = players.filter(p => p.marathonHighScore && p.marathonHighScore > 0);
        marathonPlayers.sort((a, b) => b.marathonHighScore - a.marathonHighScore);
        await payoutCategory(marathonPlayers.slice(0, 3), 'Marathon-Läufer', [600, 300, 150]);

        // Category 5: Imposter Score
        const imposterPlayers = players.filter(p => p.imposterScore && p.imposterScore > 0);
        imposterPlayers.sort((a, b) => b.imposterScore - a.imposterScore);
        await payoutCategory(imposterPlayers.slice(0, 3), 'Meister-Detektiv', [600, 300, 150]);

    } catch (e) {
        console.error("Error processing weekly rewards:", e);
    }
}

async function payoutCategory(topPlayers, categoryName, rewards) {
    for (let i = 0; i < topPlayers.length; i++) {
        const p = topPlayers[i];
        if (!p || p.isTestUser) continue;
        const reward = rewards[i];
        if (reward > 0) {
            try {
                const mailRef = doc(collection(db, "users", p.uid, "mailbox"));
                await setDoc(mailRef, {
                    title: `🏆 Sieg: ${categoryName}`,
                    message: `Herzlichen Glückwunsch! Du hast in der letzten Woche den ${i + 1}. Platz in der Kategorie '${categoryName}' belegt.\n\nZur Belohnung erhältst du ${reward} Credits.`,
                    credits: reward,
                    date: Date.now(),
                    read: false,
                    sender: "System"
                });
            } catch(e) {
                console.error("Could not send reward mail to", p.uid, e);
            }
        }
    }
}

export async function updateWeeklyStat(category, value) {
    const user = getCurrentUser();
    if (!user || user.isTestUser) return;

    const currentWeek = getWeekId();
    const statRef = doc(db, "weekly_stats", currentWeek, "players", user.uid);

    try {
        const docSnap = await getDoc(statRef);
        let data = docSnap.exists() ? docSnap.data() : { displayName: user.displayName || user.username };
        let changed = false;

        if (category === 'rankingGames') {
            data.rankingGames = (data.rankingGames || 0) + value;
            changed = true;
        } else if (category === 'adventureLevel') {
            if (!data.adventureMaxLevel || value > data.adventureMaxLevel) {
                data.adventureMaxLevel = value;
                changed = true;
            }
        } else if (category === 'marathonScore') {
            if (!data.marathonHighScore || value > data.marathonHighScore) {
                data.marathonHighScore = value;
                changed = true;
            }
        } else if (category === 'starwarsdleTries') {
            data.starwarsdleWins = (data.starwarsdleWins || 0) + 1;
            data.starwarsdleTotalTries = (data.starwarsdleTotalTries || 0) + value;
            data.starwarsdleAvgTries = data.starwarsdleTotalTries / data.starwarsdleWins;
            changed = true;
        } else if (category === 'imposterScore') {
            data.imposterScore = (data.imposterScore || 0) + value;
            changed = true;
        }

        if (changed) {
            await setDoc(statRef, data, { merge: true });
        }
    } catch (e) {
        console.error("Error updating weekly stat:", e);
    }
}

export async function renderChallenges() {
    const user = getCurrentUser();
    const currentWeek = getWeekId();
    const statsRef = collection(db, "weekly_stats", currentWeek, "players");

    const html1 = document.getElementById('challenges-cat1-list');
    const html2 = document.getElementById('challenges-cat2-list');
    const html3 = document.getElementById('challenges-cat3-list');
    const html4 = document.getElementById('challenges-cat4-list');
    const html5 = document.getElementById('challenges-cat5-list');
    
    if (html1) html1.innerHTML = '<div style="text-align:center; padding: 20px;">Lade Daten...</div>';
    if (html2) html2.innerHTML = '<div style="text-align:center; padding: 20px;">Lade Daten...</div>';
    if (html3) html3.innerHTML = '<div style="text-align:center; padding: 20px;">Lade Daten...</div>';
    if (html4) html4.innerHTML = '<div style="text-align:center; padding: 20px;">Lade Daten...</div>';
    if (html5) html5.innerHTML = '<div style="text-align:center; padding: 20px;">Lade Daten...</div>';

    try {
        const snap = await getDocs(statsRef);
        let players = [];
        snap.forEach(docSnap => players.push({ uid: docSnap.id, ...docSnap.data() }));

        const renderCat = (container, list, getValue, formatValue, reverse = false) => {
            if (!container) return;
            const valid = list.filter(p => getValue(p) !== undefined && getValue(p) !== null && getValue(p) !== 0);
            valid.sort((a, b) => reverse ? getValue(a) - getValue(b) : getValue(b) - getValue(a));
            
            if (valid.length === 0) {
                container.innerHTML = '<div style="text-align:center; color:#aaa; padding:10px;">Noch keine Teilnehmer diese Woche.</div>';
                return;
            }

            let html = '';
            valid.forEach((p, index) => {
                let medal = `${index + 1}.`;
                let color = '#fff';
                let bg = 'rgba(0,0,0,0.3)';
                if (index === 0) { medal = '🥇'; color = '#ffd700'; bg = 'rgba(255,215,0,0.1)'; }
                if (index === 1) { medal = '🥈'; color = '#c0c0c0'; bg = 'rgba(192,192,192,0.1)'; }
                if (index === 2) { medal = '🥉'; color = '#cd7f32'; bg = 'rgba(205,127,50,0.1)'; }

                const isMe = user && p.uid === user.uid;
                const border = isMe ? 'border: 1px solid #3498db;' : 'border: 1px solid transparent;';

                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:5px; background:${bg}; border-radius:8px; ${border}">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:1.2rem; min-width:30px; text-align:center;">${medal}</span>
                            <span style="font-weight:bold; color:${isMe ? '#3498db' : '#e2e8f0'};">${p.displayName || p.uid}</span>
                        </div>
                        <div style="font-weight:bold; color:${color}; font-size:1.1rem;">
                            ${formatValue(getValue(p))}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        };

        renderCat(html1, players, p => p.rankingGames, v => `${v} Spiele`);
        renderCat(html2, players, p => p.adventureMaxLevel, v => `Level ${v}`);
        renderCat(html3, players, p => p.starwarsdleAvgTries, v => `Ø ${v.toFixed(2)} Versuche`, true);
        renderCat(html4, players, p => p.marathonHighScore, v => `${v} Charaktere`);
        renderCat(html5, players, p => p.imposterScore, v => `${v} Richtige`);

        // Update Reset Countdown
        const countdownEl = document.getElementById('challenges-countdown');
        if (countdownEl) {
            const now = new Date();
            const nextMonday = new Date(now);
            nextMonday.setHours(0,0,0,0);
            nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1) % 7);
            if (nextMonday.getTime() <= now.getTime()) nextMonday.setDate(nextMonday.getDate() + 7);
            
            const diff = nextMonday - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            countdownEl.textContent = `Reset in: ${days} Tag${days !== 1 ? 'en' : ''}, ${hours} Std.`;
        }

    } catch (e) {
        console.error("Error loading challenges:", e);
        if (html1) html1.innerHTML = '<div style="color:#ff4757; text-align:center;">Fehler beim Laden.</div>';
    }
}
