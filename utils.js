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
    let recent = [];
    let drought = {};
    
    try {
        const stored = localStorage.getItem(bagKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                recent = parsed; // Migration von altem Array-Format
            } else {
                recent = parsed.recent || [];
                drought = parsed.drought || {};
            }
        }
    } catch(e) {}

    const resultNames = [];
    
    for (let i = 0; i < count; i++) {
        let available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
        
        if (available.length === 0) {
            recent = recent.slice(Math.floor(recent.length / 2)); 
            available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
            if (available.length === 0) {
                recent = []; 
                available = pool.filter(c => !resultNames.includes(c.name));
            }
        }
        
        let totalWeight = 0;
        const weightedAvailable = available.map(c => {
            const isEasterEgg = c.tags && c.tags.includes('anime');
            // Anime Easter Eggs bekommen keinen Pity-Bonus, fix auf 0.05
            if (isEasterEgg) {
                totalWeight += 0.05;
                return { char: c, weight: 0.05 };
            }
            
            const droughtCount = drought[c.name] || 0;
            // Basis-Gewicht 1.0 + 10% mehr für jede Runde ohne Ziehung
            const weight = 1.0 + (droughtCount * 0.1);
            totalWeight += weight;
            return { char: c, weight: weight };
        });

        let randomVal = Math.random() * totalWeight;
        let chosen = null;
        for (const item of weightedAvailable) {
            randomVal -= item.weight;
            if (randomVal <= 0) {
                chosen = item.char;
                break;
            }
        }
        if (!chosen && weightedAvailable.length > 0) {
            chosen = weightedAvailable[weightedAvailable.length - 1].char;
        }

        if (chosen) {
            resultNames.push(chosen.name);
            recent.push(chosen.name);
            drought[chosen.name] = 0; // Pity Timer für diesen Charakter zurücksetzen
        }
    }

    // Pity Timer für alle nicht gezogenen Charaktere erhöhen
    pool.forEach(c => {
        if (!resultNames.includes(c.name)) {
            drought[c.name] = (drought[c.name] || 0) + 1;
        }
    });

    if (recent.length > 5) {
        recent = recent.slice(recent.length - 5);
    }

    localStorage.setItem(bagKey, JSON.stringify({ recent, drought }));
    return resultNames.map(name => pool.find(c => c.name === name)).filter(c => c !== undefined);
}

// Lädt Bilder unsichtbar in den Cache des Browsers
export function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}