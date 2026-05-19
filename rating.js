import { submitFinalRating } from './game.js';

export function initRatingSystem() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('selected')) return; // Bereits gewählt

            rateButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            ratingFeedback.textContent = `Liste mit ${btn.textContent}/10 bewertet. Gespeichert!`;
            ratingFeedback.classList.remove('hidden');

            // Speichern in Firebase
            submitFinalRating(parseInt(btn.textContent));
        });
    });
}

export function resetRatingUI() {
    document.querySelectorAll('.rate-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('rating-feedback').classList.add('hidden');
}