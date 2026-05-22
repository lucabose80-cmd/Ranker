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
export function drawFromBag(pool, count, bagKey) {
    let recent = [];
    try {
        const stored = localStorage.getItem(bagKey);
        if (stored) recent = JSON.parse(stored);
    } catch(e) {}

    const resultNames = [];
    
    // Wir versuchen aus dem Pool zu ziehen, der NICHT in 'recent' ist.
    for (let i = 0; i < count; i++) {
        // Filtere Charaktere, die aktuell in 'recent' oder schon in 'resultNames' sind
        let available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
        
        // Wenn der Pool zu klein ist, leeren wir 'recent' einfach zur Hälfte oder komplett
        if (available.length === 0) {
            recent = recent.slice(Math.floor(recent.length / 2)); 
            available = pool.filter(c => !recent.includes(c.name) && !resultNames.includes(c.name));
            if (available.length === 0) {
                recent = []; // Notfall: alles wieder erlauben
                available = pool.filter(c => !resultNames.includes(c.name));
            }
        }
        
        const chosen = available[Math.floor(Math.random() * available.length)];
        if (chosen) {
            resultNames.push(chosen.name);
            recent.push(chosen.name);
        }
    }

    // Behalte maximal die letzten 5 Charaktere im Gedächtnis
    if (recent.length > 5) {
        recent = recent.slice(recent.length - 5);
    }

    localStorage.setItem(bagKey, JSON.stringify(recent));
    return resultNames.map(name => pool.find(c => c.name === name)).filter(c => c !== undefined);
}

// Lädt Bilder unsichtbar in den Cache des Browsers
export function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}