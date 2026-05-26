export let currentMode = localStorage.getItem('last_played_mode') || 'starwars';
export let currentGameType = localStorage.getItem('last_played_type') || 'classic'; // 'classic' oder 'advanced'
export let currentGameCategory = localStorage.getItem('last_played_category') || 'normal'; // 'normal' oder 'klon'

export function setCurrentMode(mode) {
    currentMode = mode;
    localStorage.setItem('last_played_mode', mode);
}

export function setCurrentGameType(type) {
    currentGameType = type;
    localStorage.setItem('last_played_type', type);
}

export function setCurrentGameCategory(cat) {
    currentGameCategory = cat;
    localStorage.setItem('last_played_category', cat);
}
