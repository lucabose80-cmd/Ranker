// Mischt ein Array zufällig (Fisher-Yates)
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// "Ziehen ohne Zurücklegen" Bag-System für faire Verteilung
export function drawFromBag(pool, count, bagKey) {
    let bag = [];
    try {
        const stored = localStorage.getItem(bagKey);
        if (stored) bag = JSON.parse(stored);
    } catch(e) {}

    // Filtere invalide Charaktere raus (falls DB Update)
    bag = bag.filter(name => pool.some(c => c.name === name));

    const resultNames = [];
    while (resultNames.length < count) {
        if (bag.length === 0) {
            bag = shuffleArray(pool).map(c => c.name);
        }
        const nextChar = bag.shift();
        if (!resultNames.includes(nextChar)) {
            resultNames.push(nextChar);
        }
    }

    localStorage.setItem(bagKey, JSON.stringify(bag));
    // Charaktere anhand Namen aus dem Pool fischen
    return resultNames.map(name => pool.find(c => c.name === name)).filter(c => c !== undefined);
}

// Lädt Bilder unsichtbar in den Cache des Browsers
export function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}