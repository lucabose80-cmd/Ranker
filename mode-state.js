export let currentMode = 'starwars';
export let currentGameType = 'classic'; // 'classic' oder 'advanced'
export let currentGameCategory = 'normal'; // 'normal' oder 'klon'

export function setCurrentMode(mode) {
    currentMode = mode;
}

export function setCurrentGameType(type) {
    currentGameType = type;
}

export function setCurrentGameCategory(cat) {
    currentGameCategory = cat;
}
