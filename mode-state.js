export let currentMode = 'starwars';
export let currentGameType = 'classic'; // 'classic' oder 'advanced'

export function setCurrentMode(mode) {
    currentMode = mode;
}

export function setCurrentGameType(type) {
    currentGameType = type;
}
