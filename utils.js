// Mischt ein Array zufällig (Fisher-Yates)
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Balanced Randomizer: Merkt sich die letzten 5 gezogenen Charaktere und schließt sie (wenn möglich) aus.
// Plus "Pity Timer" (Drought): Charaktere, die lange nicht kamen, erhalten erhöhte Wahrscheinlichkeit.
export function drawFromBag(pool, count, bagKey) {
    let recent = [], drought = {};
    
    try {
        const parsed = JSON.parse(localStorage.getItem(bagKey) || 'null');
        if (Array.isArray(parsed)) recent = parsed;
        else if (parsed) { recent = parsed.recent || []; drought = parsed.drought || {}; }
    } catch(e) {}

    const resultNames = [];
    
    for (let i = 0; i < count; i++) {
        let available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
        
        if (!available.length) {
            recent = recent.slice(Math.floor(recent.length / 2)); 
            available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
            if (!available.length) {
                recent = []; 
                available = pool.filter(c => !resultNames.includes(c.name));
            }
        }
        
        let totalWeight = 0;
        const weighted = available.map(c => {
            const weight = (c.tags?.includes('anime') || c.tags?.includes('meme')) ? 0.3 : 1.0 + ((drought[c.name] || 0) * 0.01);
            totalWeight += weight;
            return { char: c, weight };
        });

        let randomVal = Math.random() * totalWeight;
        let chosen = weighted.find(item => (randomVal -= item.weight) <= 0)?.char || weighted.at(-1)?.char;

        if (chosen) {
            resultNames.push(chosen.name);
            recent.push(chosen.name);
            drought[chosen.name] = 0;
        }
    }

    pool.forEach(c => {
        if (!resultNames.includes(c.name)) drought[c.name] = (drought[c.name] || 0) + 1;
    });

    localStorage.setItem(bagKey, JSON.stringify({ recent: recent.slice(-25), drought }));
    return resultNames.map(name => pool.find(c => c.name === name)).filter(Boolean);
}

// Lädt Bilder unsichtbar in den Cache des Browsers
export function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}
