// components.js

export function createCardHTML(charObj, rarity, isPlayed = false, customStyles = '') {
    const rarityColors = {
        'common': '#111',
        'rare': '#ff9f43',
        'epic': '#9b59b6',
        'legendary': '#ffd700'
    };
    
    const color = rarityColors[rarity] || '#111';
    let filter = isPlayed ? 'filter:grayscale(100%) opacity(0.3);' : '';
    let flicker = rarity === 'legendary' ? 'animation: legendary-flicker 1.5s infinite;' : '';
    
    return `<img src="${charObj.img}" loading="lazy" style="width:100%; height:100%; object-fit:cover; border-radius:5px; border:2px solid ${color}; ${filter} ${flicker} ${customStyles}">`;
}
