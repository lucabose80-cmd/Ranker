// suggestions.js
import { db } from './firebase-config.js';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit, Timestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { trackRead, trackWrite } from './tracker.js';

let suggestionsCache = [];
let suggestionsUnsubscribe = null;
let isLoaded = false;
let isAdminContext = false;

let isFilterListenerAttached = false;

export function initSuggestions() {
    if (suggestionsUnsubscribe) return; // Bereits aktiv

    // Limit auf 200 erhöhen, damit wir clientseitig filtern können, sortiert ist es schon nach votes (Likes)!
    const q = query(collection(db, "suggestions"), orderBy("votes", "desc"), limit(200));
    
    suggestionsUnsubscribe = onSnapshot(q, (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        
        let newSuggestions = [];
        snapshot.forEach((doc) => {
            newSuggestions.push({ id: doc.id, ...doc.data() });
        });
        
        suggestionsCache = newSuggestions;
        isLoaded = true;
        
        renderSuggestions();
        if (isAdminContext) {
            renderAdminSuggestions();
        }
    }, (error) => {
        console.error("Fehler beim Laden der Vorschläge:", error);
    });

    const submitBtn = document.getElementById('suggestion-submit-btn');
    if (submitBtn && !submitBtn.dataset.listenerAttached) {
        submitBtn.addEventListener('click', async () => {
            const input = document.getElementById('suggestion-input');
            const typeFilter = document.getElementById('suggestion-type-filter');
            const type = typeFilter ? typeFilter.value : 'feature';
            const text = input.value.trim();
            if (!text) return;
            
            const user = getCurrentUser();
            if (!user) return;
            
            submitBtn.disabled = true;
            submitBtn.textContent = '...';
            
            try {
                // NEU: targetMode = aktuelles Universum, damit Character-Ideen nicht gemischt werden
                import('./mode-state.js').then(async ({ currentMode }) => {
                    await addDoc(collection(db, "suggestions"), {
                        text: text,
                        type: type, // 'feature' oder 'character'
                        targetMode: currentMode,
                        author: user.username,
                        authorDisplay: user.displayName || user.username,
                        timestamp: Timestamp.now(),
                        votes: 1,
                        votedBy: [user.username]
                    });
                    trackWrite(1);
                    input.value = '';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Einreichen';
                });
            } catch (e) {
                console.error("Fehler beim Senden des Vorschlags:", e);
                alert("Fehler beim Senden. Bitte versuche es später noch einmal.");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Einreichen';
            }
        });
        submitBtn.dataset.listenerAttached = 'true';
    }
}

export function renderSuggestions() {
    const container = document.getElementById('suggestions-list');
    const filterEl = document.getElementById('suggestion-type-filter');
    const selectedType = filterEl ? filterEl.value : 'feature';

    if (!isFilterListenerAttached && filterEl) {
        filterEl.addEventListener('change', renderSuggestions);
        isFilterListenerAttached = true;
    }

    if (!container || document.getElementById('suggestions-content').classList.contains('hidden')) return;

    if (!isLoaded) {
        container.innerHTML = '<p class="prompt-text">Lade Vorschläge...</p>';
        return;
    }

    const user = getCurrentUser();
    const myUsername = user ? user.username : null;

    // Nur Clientseitig filtern (Firebase hat das Limit 200 und sortiert schon perfekt nach Votes!)
    import('./mode-state.js').then(({ currentMode }) => {
        let filtered = suggestionsCache.filter(s => {
            const sType = s.type || 'feature';
            // Features sind universumsübergreifend, Charaktere sind an den targetMode gebunden!
            if (selectedType === 'character') {
                return sType === 'character' && s.targetMode === currentMode;
            }
            return sType === 'feature';
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Vorschläge für diesen Filter. Mach den Anfang!</p>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach(sug => {
            const hasVoted = myUsername && sug.votedBy && sug.votedBy.includes(myUsername);
            
            const card = document.createElement('div');
            card.className = 'history-card classic-card';
            card.style.flexDirection = 'row';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.padding = '15px';
            
            card.innerHTML = `
                <div style="flex: 1;">
                    <div class="history-header" style="margin-bottom: 5px;">
                        <strong>${sug.authorDisplay}</strong> schlägt vor:
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.4;">
                        ${sug.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-left: 15px;">
                    <button class="rank-btn upvote-btn ${hasVoted ? 'voted' : ''}" data-id="${sug.id}" ${hasVoted ? 'disabled' : ''} style="width: auto; padding: 5px 15px; font-size: 1.2rem; background: ${hasVoted ? '#2a3142' : ''}; color: ${hasVoted ? '#fff' : ''}; border-color: ${hasVoted ? '#2a3142' : ''};">
                        ${hasVoted ? '✓' : '▲'} ${sug.votes}
                    </button>
                </div>
            `;
            
            const upvoteBtn = card.querySelector('.upvote-btn');
            if (upvoteBtn && !hasVoted) {
                upvoteBtn.addEventListener('click', async () => {
                    if (!myUsername) return;
                    upvoteBtn.disabled = true;
                    upvoteBtn.innerHTML = '...';
                    
                    try {
                        const docRef = doc(db, "suggestions", sug.id);
                        await updateDoc(docRef, {
                            votes: sug.votes + 1,
                            votedBy: arrayUnion(myUsername)
                        });
                        trackWrite(1);
                    } catch (e) {
                        console.error("Fehler beim Voten:", e);
                        upvoteBtn.disabled = false;
                        upvoteBtn.innerHTML = `▲ ${sug.votes}`;
                    }
                });
            }
            
            container.appendChild(card);
        });
    });
}

// --- Admin Logik ---
export function initAdminSuggestions() {
    isAdminContext = true;
    initSuggestions(); // Stellt sicher, dass die Liste geladen wird
}

export function renderAdminSuggestions() {
    const adminContainer = document.getElementById('admin-suggestions-list');
    if (!adminContainer || document.getElementById('admin-view').classList.contains('hidden')) return;

    adminContainer.innerHTML = '';
    
    if (suggestionsCache.length === 0) {
        adminContainer.innerHTML = '<p class="prompt-text">Keine offenen Vorschläge.</p>';
        return;
    }

    suggestionsCache.forEach(sug => {
        const item = document.createElement('div');
        item.className = 'user-list-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <div>
                <strong>[${sug.votes} Votes] ${sug.authorDisplay}:</strong>
                <div style="font-size: 0.9rem; color: #ccc;">${sug.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="rank-btn convert-btn" data-id="${sug.id}" style="width: auto; padding: 5px 15px; font-size: 0.8rem; background: #2ed573; color: white; border-color: #2ed573;">In Roadmap</button>
                <button class="rank-btn del-btn" data-id="${sug.id}" style="width: auto; padding: 5px 15px; font-size: 0.8rem; background: #ff4757; color: white; border-color: #ff4757;">Löschen</button>
            </div>
        `;
        
        item.querySelector('.convert-btn').addEventListener('click', async () => {
            const title = prompt("Titel für den Roadmap-Eintrag:", `Feature Wunsch (${sug.votes} Votes)`);
            if (!title) return;
            try {
                await addDoc(collection(db, "roadmap"), {
                    title: title,
                    desc: sug.text,
                    mode: sug.targetMode || 'starwars',
                    votes: sug.votes
                });
                await deleteDoc(doc(db, "suggestions", sug.id));
                trackWrite(2);
            } catch(e) {
                console.error("Fehler beim Übertragen in Roadmap:", e);
            }
        });

        item.querySelector('.del-btn').addEventListener('click', async () => {
            if (confirm(`Vorschlag von ${sug.authorDisplay} wirklich als erledigt löschen?`)) {
                try {
                    await deleteDoc(doc(db, "suggestions", sug.id));
                    trackWrite(1);
                } catch(e) {
                    console.error("Fehler beim Löschen:", e);
                }
            }
        });
        
        adminContainer.appendChild(item);
    });
}
