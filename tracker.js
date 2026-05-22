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
    if (document.getElementById('db-tracker-widget')) return;
    
    const collapsed = localStorage.getItem('db_tracker_collapsed') !== 'false';
    
    const widget = document.createElement('div');
    widget.id = 'db-tracker-widget';
    widget.className = 'panel db-tracker-panel';
    widget.style.cssText = 'padding: 6px 10px; min-width: 0; width: auto; cursor: pointer;';
    widget.innerHTML = `
        <div id="db-tracker-header" style="display:flex; align-items:center; gap:6px; font-size:0.75rem; font-weight:bold; color:#7fd1ff; white-space:nowrap; user-select:none;">
            <span>🗄️ DB</span>
            <span id="db-tracker-summary" style="color:#aaa; font-weight:normal;"></span>
            <span id="db-tracker-chevron" style="font-size:0.65rem; margin-left:2px;">${collapsed ? '▲' : '▼'}</span>
        </div>
        <div id="db-tracker-body" style="display:${collapsed ? 'none' : 'block'}; margin-top:6px;">
            <div class="db-stat-row"><span>Reads:</span><strong id="db-tracker-reads">${sessionReads}</strong></div>
            <div class="db-stat-row"><span>Writes:</span><strong id="db-tracker-writes">${sessionWrites}</strong></div>
            <button id="db-tracker-reset" class="text-btn" style="margin-top:6px; font-size:0.7rem; color:#ff6b6b; display:block; width:100%; text-align:center;">Reset</button>
        </div>
    `;
    document.body.appendChild(widget);
    updateTrackerUI();

    document.getElementById('db-tracker-header').addEventListener('click', () => {
        const body = document.getElementById('db-tracker-body');
        const chevron = document.getElementById('db-tracker-chevron');
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        chevron.textContent = isHidden ? '▼' : '▲';
        localStorage.setItem('db_tracker_collapsed', isHidden ? 'false' : 'true');
    });

    document.getElementById('db-tracker-reset').addEventListener('click', (e) => {
        e.stopPropagation();
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
    const summaryEl = document.getElementById('db-tracker-summary');
    if (readsEl) readsEl.textContent = sessionReads;
    if (writesEl) writesEl.textContent = sessionWrites;
    if (summaryEl) summaryEl.textContent = `R:${sessionReads} W:${sessionWrites}`;
}
