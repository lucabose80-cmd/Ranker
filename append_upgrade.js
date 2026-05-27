// Additional call added via script
window.openCardUpgradeModal = function(charName, cards, user) {
    let modal = document.getElementById('card-upgrade-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'card-upgrade-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);
    }

    const rarityCounts = { 'common': 0, 'rare': 0, 'epic': 0, 'legendary': 0 };
    cards.forEach(c => rarityCounts[c.rarity]++);
    
    let html = `
        <div class="modal-content" style="position:relative; max-width:500px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; text-align:center;">
            <span id="close-upgrade-modal" class="close-btn" style="position:absolute; right:15px; top:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
            <h2 style="color:#ffd700; margin-top:0;">${charName} - Upgrades</h2>
            <div style="display:flex; justify-content:space-around; margin:20px 0;">
                <div>
                    <div style="color:#888; font-weight:bold;">Gewöhnlich</div>
                    <div style="font-size:1.5rem;">${rarityCounts.common}x</div>
                </div>
                <div>
                    <div style="color:#ff9f43; font-weight:bold;">Selten</div>
                    <div style="font-size:1.5rem;">${rarityCounts.rare}x</div>
                </div>
                <div>
                    <div style="color:#9b59b6; font-weight:bold;">Episch</div>
                    <div style="font-size:1.5rem;">${rarityCounts.epic}x</div>
                </div>
            </div>
            
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
    `;

    if (rarityCounts.common >= 5) {
        html += `<button id="btn-upgrade-common" class="rank-btn" style="background:#ff9f43; color:#000;">5 Gewöhnlich ➔ 1 Selten</button>`;
    }
    
    if (rarityCounts.rare >= 5) {
        const hasEpic = rarityCounts.epic > 0;
        const btnText = hasEpic ? "5 Selten ➔ 20 Kyber Kristalle (Duplikat)" : "5 Selten ➔ 1 Episch";
        html += `<button id="btn-upgrade-rare" class="rank-btn" style="background:#9b59b6; color:#fff;">${btnText}</button>`;
    }
    
    html += `</div></div>`;
    modal.innerHTML = html;
    modal.classList.remove('hidden');

    document.getElementById('close-upgrade-modal').onclick = () => modal.classList.add('hidden');
    
    const btnCommon = document.getElementById('btn-upgrade-common');
    if (btnCommon) {
        btnCommon.onclick = () => window.processCardUpgrade(charName, 'common', user);
    }
    
    const btnRare = document.getElementById('btn-upgrade-rare');
    if (btnRare) {
        btnRare.onclick = () => window.processCardUpgrade(charName, 'rare', user);
    }
};

window.processCardUpgrade = async function(charName, fromRarity, user) {
    const field = currentMode === 'starwars' ? 'inventory_starwars' : 'inventory_waifu';
    const inventory = user[field] || [];
    
    let count = 0;
    const indicesToRemove = [];
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].charName === charName && inventory[i].rarity === fromRarity) {
            indicesToRemove.push(i);
            count++;
            if (count === 5) break;
        }
    }
    
    if (count < 5) return;
    
    indicesToRemove.sort((a,b) => b-a).forEach(idx => {
        inventory.splice(idx, 1);
    });
    
    let toRarity = fromRarity === 'common' ? 'rare' : 'epic';
    let addedKyber = 0;
    let notificationText = \`Karte auf \${toRarity.toUpperCase()} geupgradet!\`;
    
    if (toRarity === 'epic') {
        const hasEpic = inventory.some(c => c.charName === charName && c.rarity === 'epic');
        if (hasEpic) {
            addedKyber = 20;
            const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
            user[kyberField] = (user[kyberField] || 0) + addedKyber;
            notificationText = 'Duplikat aufgelöst! +20 Kyber Kristalle erhalten.';
        } else {
            inventory.push({ charName: charName, rarity: 'epic', timestamp: Date.now(), boosterId: 'starwars_all' });
        }
    } else {
        inventory.push({ charName: charName, rarity: 'rare', timestamp: Date.now(), boosterId: 'starwars_all' });
    }
    
    user[field] = inventory;
    
    try {
        const { doc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');
        
        const updates = { [field]: inventory };
        if (addedKyber > 0) {
            const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
            updates[kyberField] = increment(addedKyber);
        }
        
        await updateDoc(doc(db, "users", user.uid), updates);
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        
        alert(notificationText);
        
        document.getElementById('card-upgrade-modal').classList.add('hidden');
        window.renderCommunityAlbum(user, 'profile-album-grid-tab', document.getElementById('album-pack-filter')?.value || 'all');
    } catch(e) {
        console.error("Fehler beim Upgrade:", e);
        alert("Ein Fehler ist aufgetreten.");
    }
};
