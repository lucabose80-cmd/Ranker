
window.openCraftingModal = function(user) {
    let modal = document.getElementById('crafting-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'crafting-modal';
        modal.className = 'modal hidden';
        document.body.appendChild(modal);
    }
    
    const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
    const kyber = user[kyberField] || 0;
    
    let html = `
        <div class="modal-content" style="position:relative; max-width:800px; background:#1e293b; color:#fff; padding:20px; border-radius:12px; text-align:center; max-height:80vh; overflow-y:auto;">
            <span id="close-crafting-modal" class="close-btn" style="position:absolute; right:15px; top:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
            <h2 style="color:#ffd700; margin-top:0;">🛠️ Epische Karte herstellen</h2>
            <p style="color:#94a3b8;">Wähle einen Charakter, um seine epische Karte für <strong style="color:#ffd700;">100 Kyber Kristalle</strong> herzustellen.</p>
            <div style="font-size:1.2rem; margin-bottom:20px; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                Aktuelle Kristalle: <strong style="color:#ffd700;">${kyber}</strong>
            </div>
            
            <input type="text" id="crafting-search" placeholder="Charakter suchen..." style="width:100%; padding:10px; border-radius:6px; background:rgba(0,0,0,0.5); border:1px solid #444; color:#fff; margin-bottom:20px;">
            
            <div id="crafting-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:15px;"></div>
        </div>
    `;
    modal.innerHTML = html;
    modal.classList.remove('hidden');
    
    document.getElementById('close-crafting-modal').onclick = () => modal.classList.add('hidden');
    
    const grid = document.getElementById('crafting-grid');
    const searchInput = document.getElementById('crafting-search');
    
    const renderGrid = (query = '') => {
        grid.innerHTML = '';
        activeCharacterDatabase.forEach(char => {
            if (query && !char.name.toLowerCase().includes(query.toLowerCase())) return;
            
            const card = document.createElement('div');
            card.style.cssText = `position:relative; border-radius:8px; border:3px solid #9b59b6; cursor:pointer; overflow:hidden; aspect-ratio:2/3; background-image:url('${char.img}'); background-size:cover; background-position:center; transition:transform 0.2s;`;
            card.onmouseenter = () => card.style.transform = 'scale(1.05)';
            card.onmouseleave = () => card.style.transform = 'scale(1)';
            
            const btn = document.createElement('div');
            btn.style.cssText = `position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); color:#fff; padding:8px 5px; font-size:0.75rem; text-align:center; display:flex; flex-direction:column; gap:3px;`;
            btn.innerHTML = `<span style="font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${char.name}</span><span style="color:${kyber >= 100 ? '#2ed573' : '#ff4757'};">100 Kristalle</span>`;
            card.appendChild(btn);
            
            card.onclick = () => {
                if (kyber < 100) {
                    alert('Nicht genügend Kyber Kristalle!');
                    return;
                }
                if (confirm(`Möchtest du die epische Karte von ${char.name} für 100 Kyber Kristalle herstellen?`)) {
                    window.processCrafting(char.name, user);
                }
            };
            
            grid.appendChild(card);
        });
    };
    
    renderGrid();
    searchInput.oninput = (e) => renderGrid(e.target.value);
};

window.processCrafting = async function(charName, user) {
    const kyberField = currentMode === 'starwars' ? 'kyber_crystals_starwars' : 'kyber_crystals_waifu';
    if ((user[kyberField] || 0) < 100) return;
    
    const invField = currentMode === 'starwars' ? 'inventory_starwars' : 'inventory_waifu';
    const inventory = user[invField] || [];
    
    // Check if user already has this Epic
    const hasEpic = inventory.some(c => c.charName === charName && c.rarity === 'epic');
    if (hasEpic) {
        alert('Du besitzt bereits die epische Karte dieses Charakters!');
        return;
    }
    
    user[kyberField] -= 100;
    inventory.push({ charName: charName, rarity: 'epic', timestamp: Date.now(), boosterId: 'crafted' });
    user[invField] = inventory;
    
    try {
        const { doc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        const { db } = await import('./firebase-config.js');
        
        await updateDoc(doc(db, "users", user.uid), {
            [kyberField]: increment(-100),
            [invField]: inventory
        });
        
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        alert(`Epische Karte von ${charName} erfolgreich hergestellt!`);
        document.getElementById('crafting-modal').classList.add('hidden');
        
        // Update display
        const kyberDisplay = document.getElementById('shop-kyber-display');
        if (kyberDisplay) kyberDisplay.textContent = user[kyberField];
        
    } catch(e) {
        console.error("Fehler beim Crafting:", e);
        alert("Ein Fehler ist aufgetreten.");
    }
};
