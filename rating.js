export function initRatingSystem() {
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');

    rateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Erstmal alle deselektieren
            rateButtons.forEach(b => b.classList.remove('selected'));
            // Gewählten Button markieren
            btn.classList.add('selected');
            
            // Feedback anzeigen
            ratingFeedback.textContent = `Du hast deine Liste mit ${btn.textContent}/10 bewertet. Danke!`;
            ratingFeedback.classList.remove('hidden');
        });
    });
}

export function resetRatingUI() {
    document.querySelectorAll('.rate-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('rating-feedback').classList.add('hidden');
}