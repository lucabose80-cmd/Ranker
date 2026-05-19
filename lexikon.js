// lexikon.js
import { activeCharacterDatabase } from './theme.js';
import { getCurrentUser } from './auth.js'; // NEU importiert

export function renderLexikon() {
    const grid = document.getElementById('lexikon-grid');
    grid.innerHTML = '';

    const user = getCurrentUser();
    const discoveredList = user && user.discovered ? user.discovered : [];

    const sortedChars = [...activeCharacterDatabase].sort((a, b) => a.name.localeCompare(b.name));

    sortedChars.forEach(char => {
        // Wenn der Charakter NICHT in der Liste ist, gilt er als "Neu / Unentdeckt"
        const isNew = user && user.role !== 'admin' && !discoveredList.includes(char.name);
        
        const card = document.createElement('div');
        // Wenn neu, bekommt die Karte die CSS-Klasse 'gold-glow'
        card.className = `lexikon-card ${isNew ? 'gold-glow' : ''}`;
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}" loading="lazy">
            <span>
                ${char.name} 
                ${isNew ? '<b style="color:#ffd700; margin-left:5px;" title="Brandneu!">✨</b>' : ''}
            </span>
        `;
        grid.appendChild(card);
    });
}