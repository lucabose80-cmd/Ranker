import { db } from './firebase-config.js';
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { activeCharacterDatabase } from './theme.js';

let charts = {};

export async function openBalanceDashboard() {
    document.querySelector('.admin-grid').classList.add('hidden');
    document.getElementById('admin-open-balance-btn').classList.add('hidden');
    document.getElementById('admin-logout-btn').classList.add('hidden');
    document.getElementById('admin-balance-container').classList.remove('hidden');

    await loadAndRenderBalanceData();
}

export function closeBalanceDashboard() {
    document.querySelector('.admin-grid').classList.remove('hidden');
    document.getElementById('admin-open-balance-btn').classList.remove('hidden');
    document.getElementById('admin-logout-btn').classList.remove('hidden');
    document.getElementById('admin-balance-container').classList.add('hidden');
}

async function loadAndRenderBalanceData() {
    try {
        const q = query(
            collection(db, "history"),
            where("type", "==", "cardgame"),
            orderBy("date", "desc"),
            limit(100)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => d.data());

        const factionStats = {};
        const cardStats = {};
        const adventureStats = {};

        docs.forEach(game => {
            const isAdventure = game.gameType === "adventure";
            const isWin = game.result === "Sieg";
            const isLoss = game.result === "Niederlage";
            
            // Only count clear wins/losses for card balancing
            if (isWin || isLoss) {
                const pDeck = game.playerDeck || [];
                
                pDeck.forEach(card => {
                    // Update Card Stats
                    if (!cardStats[card.charName]) cardStats[card.charName] = { wins: 0, total: 0 };
                    cardStats[card.charName].total++;
                    if (isWin) cardStats[card.charName].wins++;

                    // Update Faction Stats
                    const cInfo = activeCharacterDatabase.find(c => c.name === card.charName);
                    if (cInfo && cInfo.faction) {
                        cInfo.faction.forEach(fac => {
                            if (!factionStats[fac]) factionStats[fac] = { wins: 0, total: 0 };
                            factionStats[fac].total++;
                            if (isWin) factionStats[fac].wins++;
                        });
                    }
                });
            }

            // Adventure Stats
            if (isAdventure && typeof game.adventureLevel === 'number') {
                const lvl = game.adventureLevel + 1; // 1-indexed
                if (!adventureStats[lvl]) adventureStats[lvl] = { wins: 0, total: 0 };
                adventureStats[lvl].total++;
                if (isWin) adventureStats[lvl].wins++;
            }
        });

        renderFactionChart(factionStats);
        renderCardChart(cardStats);
        renderAdventureChart(adventureStats);
        
    } catch (e) {
        console.error("Fehler beim Laden der Balance-Daten:", e);
        alert("Fehler beim Laden der Dashboard-Daten. Siehe Konsole.");
    }
}

function renderFactionChart(data) {
    const ctx = document.getElementById('balanceChartFactions').getContext('2d');
    if (charts.factions) charts.factions.destroy();

    const sortedFactions = Object.keys(data)
        .filter(f => data[f].total > 5) // Min. 5 plays
        .map(f => ({
            name: f,
            winrate: (data[f].wins / data[f].total) * 100,
            total: data[f].total
        }))
        .sort((a, b) => b.winrate - a.winrate);

    charts.factions = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedFactions.map(f => f.name),
            datasets: [{
                label: 'Winrate (%)',
                data: sortedFactions.map(f => f.winrate),
                backgroundColor: sortedFactions.map(f => f.winrate >= 50 ? 'rgba(46, 204, 113, 0.6)' : 'rgba(231, 76, 60, 0.6)'),
                borderColor: sortedFactions.map(f => f.winrate >= 50 ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.toFixed(1)}% (aus ${sortedFactions[ctx.dataIndex].total} Spielen)`
                    }
                }
            }
        }
    });
}

function renderCardChart(data) {
    const ctx = document.getElementById('balanceChartCards').getContext('2d');
    if (charts.cards) charts.cards.destroy();

    const sortedCards = Object.keys(data)
        .filter(c => data[c].total > 5) // Min. 5 plays
        .map(c => ({
            name: c,
            winrate: (data[c].wins / data[c].total) * 100,
            total: data[c].total
        }))
        .sort((a, b) => b.winrate - a.winrate);

    const topCards = sortedCards.slice(0, 5);
    const flopCards = sortedCards.slice(-5).reverse();
    const displayCards = [...topCards, ...flopCards];

    charts.cards = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayCards.map(c => c.name),
            datasets: [{
                label: 'Winrate (%)',
                data: displayCards.map(c => c.winrate),
                backgroundColor: displayCards.map(c => c.winrate >= 50 ? 'rgba(46, 204, 113, 0.6)' : 'rgba(231, 76, 60, 0.6)'),
                borderColor: displayCards.map(c => c.winrate >= 50 ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.toFixed(1)}% (aus ${displayCards[ctx.dataIndex].total} Zügen)`
                    }
                }
            }
        }
    });
}

function renderAdventureChart(data) {
    const ctx = document.getElementById('balanceChartAdventure').getContext('2d');
    if (charts.adventure) charts.adventure.destroy();

    const levels = Array.from({length: 20}, (_, i) => i + 1);
    const winrates = levels.map(lvl => {
        if (data[lvl] && data[lvl].total > 0) {
            return (data[lvl].wins / data[lvl].total) * 100;
        }
        return null;
    });

    charts.adventure = new Chart(ctx, {
        type: 'line',
        data: {
            labels: levels.map(l => `Level ${l}`),
            datasets: [{
                label: 'Winrate (%)',
                data: winrates,
                fill: true,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                tension: 0.3,
                pointBackgroundColor: winrates.map(w => w === null ? 'transparent' : (w < 40 ? '#e74c3c' : '#2ecc71')),
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const lvl = ctx.dataIndex + 1;
                            const d = data[lvl];
                            if (!d) return 'Keine Daten';
                            return `${ctx.raw.toFixed(1)}% (${d.wins} Siege / ${d.total - d.wins} Niederlagen)`;
                        }
                    }
                }
            }
        }
    });
}
