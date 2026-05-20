import { submitFinalRating } from './game.js';
import { submitAdvancedFinalRating } from './game-advanced.js';
import { currentGameType } from './mode-state.js';

export function initRatingSystem() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('selected') || btn.disabled) return;

            rateButtons.forEach(b => {
                b.classList.remove('selected');
                b.disabled = true;
            });
            btn.classList.add('selected');
            
            ratingFeedback.textContent = `Liste mit ${btn.textContent}/10 bewertet. Gespeichert!`;
            ratingFeedback.classList.remove('hidden');

            // Speichern in Firebase
            if (currentGameType === 'advanced') {
                submitAdvancedFinalRating(parseInt(btn.textContent));
            } else {
                submitFinalRating(parseInt(btn.textContent));
            }
            
            // Neues Spiel Button freischalten
            const restartBtn = document.getElementById('restart-btn');
            restartBtn.disabled = false;
            restartBtn.title = "Starte ein neues Spiel";
        });
    });
}

export function resetRatingUI() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    rateButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    document.getElementById('rating-feedback').classList.add('hidden');
    
    // Neues Spiel Button sperren
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.disabled = true;
    restartBtn.title = "Bitte bewerte zuerst die Liste, um ein neues Spiel zu starten";
}