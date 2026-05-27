import { submitFinalRating } from './game.js';
import { submitAdvancedFinalRating } from './game-advanced.js';
import { currentGameType } from './mode-state.js';

let hasRated = false;

export function initRatingSystem() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');
    const ratingContainer = document.querySelector('.rating-buttons');

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (hasRated || btn.classList.contains('selected') || btn.disabled) return;
            hasRated = true;

            rateButtons.forEach(b => {
                b.classList.remove('selected');
                b.disabled = true;
            });
            btn.classList.add('selected');
            
            ratingFeedback.textContent = `Liste mit ${btn.textContent}/10 bewertet. Gespeichert!`;
            ratingFeedback.classList.remove('hidden');
            
            // Verstecke die HTML-Buttons komplett, um DevTools-Manipulation zu erschweren
            if (ratingContainer) ratingContainer.classList.add('hidden');

            // Speichern in Firebase
            if (currentGameType === 'advanced') {
                submitAdvancedFinalRating(parseInt(btn.textContent));
            } else {
                submitFinalRating(parseInt(btn.textContent));
            }
            
            // Automatisch ein neues Spiel nach 1.5s starten
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('game:start-new'));
            }, 1500);
        });
    });
}

export function resetRatingUI() {
    hasRated = false;
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingContainer = document.querySelector('.rating-buttons');
    
    if (ratingContainer) ratingContainer.classList.remove('hidden');
    
    rateButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    document.getElementById('rating-feedback').classList.add('hidden');
}