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
let selectedCharForUpdate = "";

export function stopSuggestions() {
    if(suggestionsUnsubscribe) suggestionsUnsubscribe();
    suggestionsUnsubscribe = null;
}

export function initSuggestions() {
    if (suggestionsUnsubscribe) return; // Bereits aktiv

    // Limit auf 100 setzen, damit nicht extrem viele Reads pro Page-Reload entstehen
    const q = query(collection(db, "suggestions"), orderBy("votes", "desc"), limit(100));
    
    suggestionsUnsubscribe = onSnapshot(q, (snapshot) => {
        trackRead(snapshot.docChanges().filter(c => c.type !== 'removed').length);
        
        suggestionsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        const handleNormalSubmit = async () => {
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
        };

        submitBtn.addEventListener('click', handleNormalSubmit);
        document.getElementById('suggestion-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleNormalSubmit();
        });
        
        submitBtn.dataset.listenerAttached = 'true';
    }

    const updateSubmitBtn = document.getElementById('suggestion-update-submit-btn');
    if (updateSubmitBtn && !updateSubmitBtn.dataset.listenerAttached) {
        const handleUpdateSubmit = async () => {
            const nameEl = document.getElementById('char-update-name');
            const imgEl = document.getElementById('char-update-image');
            const reasonEl = document.getElementById('char-update-reason');
            
            const charName = selectedCharForUpdate;
            const newName = nameEl.value.trim();
            const newImg = imgEl.value.trim();
            const reason = reasonEl.value.trim();
            
            if (!charName) {
                alert("Bitte wähle oben ein Bild aus.");
                return;
            }
            if (!newName && !newImg) {
                alert("Bitte gib einen neuen Namen oder einen Bildlink an.");
                return;
            }
            if (!reason) {
                alert("Bitte gib einen Grund für die Änderung an.");
                return;
            }
            
            const user = getCurrentUser();
            if (!user) return;
            
            let text = `Update für [${charName}]:`;
            if (newName) text += ` Neuer Name: "${newName}".`;
            if (newImg) text += ` Neues Bild: ${newImg}.`;
            text += ` Grund: ${reason}`;
            
            updateSubmitBtn.disabled = true;
            updateSubmitBtn.textContent = '...';
            
            try {
                Promise.all([
                    import('./mode-state.js'),
                    import('./theme.js')
                ]).then(async ([{ currentMode }, { activeCharacterDatabase }]) => {
                    const originalChar = activeCharacterDatabase.find(c => c.name === charName);
                    const charImage = originalChar ? originalChar.img : '';

                    await addDoc(collection(db, "suggestions"), {
                        text: text,
                        type: 'char_update',
                        targetMode: currentMode,
                        charImage: charImage,
                        author: user.username,
                        authorDisplay: user.displayName || user.username,
                        timestamp: Timestamp.now(),
                        votes: 1,
                        votedBy: [user.username]
                    });
                    trackWrite(1);
                    nameEl.value = '';
                    imgEl.value = '';
                    reasonEl.value = '';
                    selectedCharForUpdate = "";
                    document.getElementById('char-update-selected-info').textContent = "Nichts ausgewählt";
                    // Reset grid highlighting
                    document.querySelectorAll('.char-update-img').forEach(el => el.style.borderColor = 'transparent');
                    updateSubmitBtn.disabled = false;
                    updateSubmitBtn.textContent = 'Update Vorschlag Einreichen';
                });
            } catch (e) {
                console.error("Fehler beim Senden des Vorschlags:", e);
                alert("Fehler beim Senden.");
                updateSubmitBtn.disabled = false;
                updateSubmitBtn.textContent = 'Update Vorschlag Einreichen';
            }
        };

        updateSubmitBtn.addEventListener('click', handleUpdateSubmit);
        
        ['char-update-name', 'char-update-image', 'char-update-reason'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') handleUpdateSubmit();
                });
            }
        });

        updateSubmitBtn.dataset.listenerAttached = 'true';
    }
}

export function renderSuggestions() {
    const container = document.getElementById('suggestions-list');
    const filterEl = document.getElementById('suggestion-type-filter');
    const selectedType = filterEl ? filterEl.value : 'feature';

    if (!isFilterListenerAttached && filterEl) {
        filterEl.addEventListener('change', () => {
            const val = filterEl.value;
            if (val === 'char_update') {
                document.getElementById('suggestion-normal-input-group').classList.add('hidden');
                document.getElementById('suggestion-update-input-group').classList.remove('hidden');
                
                import('./theme.js').then(({ activeCharacterDatabase }) => {
                    const gridEl = document.getElementById('char-update-grid');
                    gridEl.innerHTML = '';
                    const sorted = [...activeCharacterDatabase].sort((a,b) => a.name.localeCompare(b.name));
                    sorted.forEach(c => {
                        const img = document.createElement('img');
                        img.src = c.img;
                        img.className = 'char-update-img';
                        img.style.width = '100%';
                        img.style.aspectRatio = '1 / 1.3';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '4px';
                        img.style.cursor = 'pointer';
                        img.style.border = '2px solid transparent';
                        img.title = c.name;
                        
                        img.addEventListener('click', () => {
                            selectedCharForUpdate = c.name;
                            document.getElementById('char-update-selected-info').textContent = "Ausgewählt: " + c.name;
                            document.querySelectorAll('.char-update-img').forEach(el => el.style.borderColor = 'transparent');
                            img.style.borderColor = '#2ed573';
                        });
                        
                        gridEl.appendChild(img);
                    });
                });
            } else {
                document.getElementById('suggestion-normal-input-group').classList.remove('hidden');
                document.getElementById('suggestion-update-input-group').classList.add('hidden');
            }
            renderSuggestions();
        });
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
            if (selectedType === 'char_update') {
                return sType === 'char_update' && s.targetMode === currentMode;
            }
            return sType === 'feature';
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="prompt-text">Noch keine Vorschläge für diesen Filter. Mach den Anfang!</p>';
            return;
        }

        container.innerHTML = '';
        
        if (selectedType === 'char_update') {
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.flexWrap = 'wrap';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'flex-start';
            container.style.gap = '15px';
        } else {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.flexWrap = 'nowrap';
            container.style.justifyContent = 'flex-start';
            container.style.alignItems = 'stretch';
            container.style.gap = '10px';
        }

        filtered.forEach(sug => {
            const hasVoted = myUsername && sug.votedBy && sug.votedBy.includes(myUsername);
            
            const card = document.createElement('div');
            card.className = 'history-card classic-card';
            card.style.padding = '15px';
            
            if (sug.type === 'char_update' && sug.charImage) {
                card.style.width = '110px';
                card.style.cursor = 'pointer';
                card.style.padding = '10px';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.transition = 'width 0.2s ease';
                card.style.overflow = 'hidden';
                
                card.innerHTML = `
                    <div style="position: relative; width: 100%; display: flex; justify-content: center; flex-shrink: 0;">
                        <img src="${sug.charImage}" style="width: 100%; aspect-ratio: 1/1.3; object-fit: cover; border-radius: 4px;">
                        <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; color: #fff; border: 1px solid #444;">
                            ${hasVoted ? '<span style="color:#2ed573; font-weight:bold;">✓</span>' : '<span style="color:#aaa;">✓</span>'} ${sug.votes}
                        </div>
                    </div>
                    <div class="update-details hidden" style="flex: 1; flex-direction: column; gap: 10px; margin-left: 15px; display: none;">
                        <div class="history-header" style="margin-bottom: 5px;">
                            <strong>${sug.authorDisplay}</strong>:
                        </div>
                        <div style="font-size: 1rem; line-height: 1.4; flex: 1;">
                            ${sug.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                        </div>
                        <button class="rank-btn upvote-btn ${hasVoted ? 'voted' : ''}" data-id="${sug.id}" ${hasVoted ? 'disabled' : ''} style="width: 100%; padding: 8px; font-size: 1rem; background: ${hasVoted ? '#2a3142' : ''}; color: ${hasVoted ? '#fff' : ''}; border-color: ${hasVoted ? '#2a3142' : ''}; margin-top: auto;">
                            ${hasVoted ? '<span style="color:#2ed573; font-weight:bold;">✓</span> Gevotet' : '<span style="color:#aaa;">✓</span> Dafür abstimmen'} (${sug.votes})
                        </button>
                    </div>
                `;
                
                card.addEventListener('click', (e) => {
                    if(e.target.closest('.upvote-btn')) return;
                    const details = card.querySelector('.update-details');
                    if (details.classList.contains('hidden')) {
                        card.style.width = '100%';
                        card.style.flexDirection = 'row';
                        card.firstElementChild.style.width = '110px';
                        details.classList.remove('hidden');
                        details.style.display = 'flex';
                    } else {
                        card.style.width = '110px';
                        card.style.flexDirection = 'column';
                        card.firstElementChild.style.width = '100%';
                        details.classList.add('hidden');
                        details.style.display = 'none';
                    }
                });
            } else {
                card.style.flexDirection = 'row';
                card.style.alignItems = 'center';
                card.style.justifyContent = 'space-between';

                card.innerHTML = `
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                        <div class="history-header" style="display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;">
                            <strong style="color:#fff;">${sug.authorDisplay}</strong>
                            <span style="color:#888; font-size:0.85rem;">schlägt vor:</span>
                        </div>
                        <div style="font-size: 1rem; line-height: 1.5; color: #ccc; flex: 1;">
                            ${sug.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-left: 15px; flex-shrink: 0;">
                        <button class="rank-btn upvote-btn ${hasVoted ? 'voted' : ''}" data-id="${sug.id}" ${hasVoted ? 'disabled' : ''} style="width: auto; padding: 5px 15px; font-size: 1.2rem; background: ${hasVoted ? '#2a3142' : ''}; color: ${hasVoted ? '#fff' : ''}; border-color: ${hasVoted ? '#2a3142' : ''};">
                            ${hasVoted ? '<span style="color:#2ed573; font-weight:bold;">✓</span>' : '<span style="color:#aaa;">✓</span>'} ${sug.votes}
                        </button>
                    </div>
                `;
            }
            
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
                        upvoteBtn.innerHTML = `<span style="color:#aaa;">✓</span> ${sug.votes}`;
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
