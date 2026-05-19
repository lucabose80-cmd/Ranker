// Mischt ein Array zufällig (Fisher-Yates)
export function shuffleArray(array) {
    return [...array].sort(() => 0.5 - Math.random());
}

// Lädt Bilder unsichtbar in den Cache des Browsers
export function preloadImages(characters) {
    characters.forEach(char => {
        const img = new Image();
        img.src = char.img;
    });
}