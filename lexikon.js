// lexikon.js
import { activeCharacterDatabase } from './theme.js';

export function renderLexikon() {
    const grid = document.getElementById('lexikon-grid');
    grid.innerHTML = '';

    // Wir sortieren die Charaktere alphabetisch (A-Z) für eine bessere Übersicht
    const sortedChars = [...activeCharacterDatabase].sort((a, b) => a.name.localeCompare(b.name));

    sortedChars.forEach(char => {
        const card = document.createElement('div');
        card.className = 'lexikon-card';
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}" loading="lazy">
            <span>${char.name}</span>
        `;
        grid.appendChild(card);
    });
}