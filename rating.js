import { submitFinalRating } from './game.js';

export function initRatingSystem() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('selected') || btn.disabled) return; // Bereits gewählt oder deaktiviert

            rateButtons.forEach(b => {
                b.classList.remove('selected');
                b.disabled = true; // Alle Buttons deaktivieren, damit man nicht nochmal wählen kann
            });
            btn.classList.add('selected');
            
            ratingFeedback.textContent = `Liste mit ${btn.textContent}/10 bewertet. Gespeichert!`;
            ratingFeedback.classList.remove('hidden');

            // Speichern in Firebase
            submitFinalRating(parseInt(btn.textContent));
        });
    });
}

export function resetRatingUI() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    rateButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false; // Für die nächste Runde wieder freigeben
    });
    document.getElementById('rating-feedback').classList.add('hidden');
}