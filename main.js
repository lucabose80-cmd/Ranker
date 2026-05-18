// main.js
import { characterPool } from './data.js';

// 1. 5 zufällige Charaktere auswählen
function getRandomCharacters(pool, count) {
    // Array mischen und die ersten 'count' Elemente nehmen
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const selectedCharacters = getRandomCharacters(characterPool, 5);
const poolContainer = document.getElementById('character-pool');
const slots = document.querySelectorAll('.rank-slot');

// 2. Charaktere auf dem Bildschirm rendern
selectedCharacters.forEach((charName, index) => {
    const charElement = document.createElement('div');
    charElement.classList.add('character');
    charElement.draggable = true; // Macht das Element ziehbar
    charElement.id = `char-${index}`;
    charElement.textContent = charName;

    // Drag Start: Wir merken uns, welches Element gezogen wird
    charElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        setTimeout(() => e.target.classList.add('dragging'), 0);
    });

    // Drag End: Visuelles Feedback zurücksetzen
    charElement.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });

    poolContainer.appendChild(charElement);
});

// 3. Drop-Logik für die Ranking-Slots
slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
        e.preventDefault(); // Zwingend notwendig, um 'drop' zu erlauben
    });

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedId);

        // Prüfen, ob der Slot schon belegt ist (enthält <span> und evtl. schon einen Charakter)
        if (slot.children.length < 2) {
            slot.appendChild(draggedElement);
        }
    });
});

// 4. Drop-Logik für den Pool (falls man es sich anders überlegt)
poolContainer.addEventListener('dragover', (e) => e.preventDefault());
poolContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);
    poolContainer.appendChild(draggedElement);
});

// 5. Überprüfen Button
document.getElementById('submit-btn').addEventListener('click', () => {
    const results = [];
    slots.forEach(slot => {
        // Wenn mehr als 1 Kind drin ist (<span> + Charakter)
        if (slot.children.length > 1) {
            results.push(slot.lastChild.textContent);
        }
    });

    if (results.length === 5) {
        alert(`Dein finales Ranking:\n1. ${results[0]}\n2. ${results[1]}\n3. ${results[2]}\n4. ${results[3]}\n5. ${results[4]}`);
    } else {
        alert("Bitte ranke alle 5 Charaktere, bevor du bestätigst!");
    }
});