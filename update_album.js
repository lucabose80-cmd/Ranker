const fs = require('fs');
let content = fs.readFileSync('profile.js', 'utf8');
content = content.replace(
    /window\.renderCommunityAlbum = function\(user, containerId, filterPack = 'all', sortMode = 'rarity_desc'\) \{[\s\S]*?const rarVal = \{/m,
`window.renderCommunityAlbum = async function(user, containerId, filterPack = 'all', sortMode = 'rarity_desc') {
    const inventory = currentMode === 'starwars' ? (user.inventory_starwars || []) : (user.inventory_waifu || []);
    const albumGrid = document.getElementById(containerId);
    if (!albumGrid) return;
    
    albumGrid.innerHTML = '';
    albumGrid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:25px; max-height:400px; overflow-y:auto; padding: 10px;';
    
    const grouped = {};
    let isPackView = (filterPack && filterPack !== 'all');
    
    if (isPackView) {
        const { BOOSTERS } = await import('./shop.js');
        const booster = BOOSTERS.find(b => b.id === filterPack);
        if (booster) {
            const packPool = activeCharacterDatabase.filter(c => booster.filter(c));
            packPool.forEach(c => { grouped[c.name] = []; });
        }
    }
    
    inventory.forEach(c => {
        if (isPackView && c.boosterId !== filterPack) return;
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });

    if (!isPackView) {
        Object.keys(grouped).forEach(k => {
            if (grouped[k].length === 0) delete grouped[k];
        });
    }

    const charsToRender = Object.keys(grouped);
    
    if (charsToRender.length === 0) {
        albumGrid.innerHTML = '<div style="color:#666; grid-column: 1 / -1; text-align:center; padding: 20px;">Keine Karten gefunden.</div>';
        return;
    }

    const rarVal = {`
);

content = content.replace(
    /stackContainer\.appendChild\(card\);\s*\}\);\s*albumGrid\.appendChild\(stackContainer\);/m,
`stackContainer.appendChild(card);
        });
        }
        
        albumGrid.appendChild(stackContainer);`
);

fs.writeFileSync('profile.js', content);
console.log('Update successful');
