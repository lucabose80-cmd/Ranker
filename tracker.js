// tracker.js

let sessionReads = parseInt(localStorage.getItem('db_reads') || '0');
let sessionWrites = parseInt(localStorage.getItem('db_writes') || '0');

export function trackRead(count = 1) {
    if (isNaN(count) || count <= 0) return;
    sessionReads += count;
    localStorage.setItem('db_reads', sessionReads);
    updateTrackerUI();
}

export function trackWrite(count = 1) {
    if (isNaN(count) || count <= 0) return;
    sessionWrites += count;
    localStorage.setItem('db_writes', sessionWrites);
    updateTrackerUI();
}

export function initTrackerUI() {
    // Erstellt das Widget auf der rechten Seite, falls noch nicht vorhanden
    if (document.getElementById('db-tracker-widget')) return;
    
    const widget = document.createElement('div');
    widget.id = 'db-tracker-widget';
    widget.className = 'panel db-tracker-panel';
    widget.innerHTML = `
        <h3>DATABASE STATS</h3>
        <div class="db-stat-row">
            <span>Reads:</span>
            <strong id="db-tracker-reads">${sessionReads}</strong>
        </div>
        <div class="db-stat-row">
            <span>Writes:</span>
            <strong id="db-tracker-writes">${sessionWrites}</strong>
        </div>
        <button id="db-tracker-reset" class="text-btn" style="margin-top: 8px; font-size: 0.72rem; color: #ff6b6b; display: block; width: 100%; text-align: center; cursor: pointer;">Reset Stats</button>
    `;
    document.body.appendChild(widget);
    
    document.getElementById('db-tracker-reset').addEventListener('click', () => {
        sessionReads = 0;
        sessionWrites = 0;
        localStorage.setItem('db_reads', 0);
        localStorage.setItem('db_writes', 0);
        updateTrackerUI();
    });
}

function updateTrackerUI() {
    const readsEl = document.getElementById('db-tracker-reads');
    const writesEl = document.getElementById('db-tracker-writes');
    if (readsEl) readsEl.textContent = sessionReads;
    if (writesEl) writesEl.textContent = sessionWrites;
}
