import { getCurrentUser } from './auth.js';
import { db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const MAX_INTEREST = 200;
const INTEREST_RATE_PER_DAY = 0.01; // 1% per day
const MS_PER_DAY = 1000 * 60 * 60 * 24;

let bankUpdateInterval = null;

export function initBank() {
    // This will be called when the app starts, but the UI is initialized when opening the modal
    const bankBtn = document.getElementById('nav-bank-btn');
    if (bankBtn) {
        bankBtn.addEventListener('click', () => {
            const bankModal = document.getElementById('bank-modal');
            if (bankModal) bankModal.classList.remove('hidden');
            openBank();
        });
    }

    const closeBtn = document.getElementById('close-bank-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('bank-modal').classList.add('hidden');
            closeBank();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const bankModal = document.getElementById('bank-modal');
            if (bankModal && !bankModal.classList.contains('hidden')) {
                bankModal.classList.add('hidden');
                closeBank();
            }
        }
    });

    const bankModal = document.getElementById('bank-modal');
    if (bankModal) {
        bankModal.addEventListener('click', (e) => {
            if (e.target === bankModal) {
                bankModal.classList.add('hidden');
                closeBank();
            }
        });
    }

    const depositBtn = document.getElementById('bank-deposit-btn');
    if (depositBtn) depositBtn.addEventListener('click', handleDeposit);

    const withdrawBtn = document.getElementById('bank-withdraw-btn');
    if (withdrawBtn) withdrawBtn.addEventListener('click', handleWithdraw);

    const claimBtn = document.getElementById('bank-claim-btn');
    if (claimBtn) claimBtn.addEventListener('click', handleClaimInterest);
}

export function openBank() {
    updateBankUI();
    if (bankUpdateInterval) clearInterval(bankUpdateInterval);
    // Update the interest display every second
    bankUpdateInterval = setInterval(updateBankUI, 1000);
}

export function closeBank() {
    if (bankUpdateInterval) {
        clearInterval(bankUpdateInterval);
        bankUpdateInterval = null;
    }
}

function calculatePendingInterest(user) {
    const balance = user.bankBalance || 0;
    const pending = user.bankPendingInterest || 0;
    const lastUpdate = user.bankLastUpdate || Date.now();
    
    const now = Date.now();
    const msElapsed = Math.max(0, now - lastUpdate);
    const newInterest = balance * INTEREST_RATE_PER_DAY * (msElapsed / MS_PER_DAY);
    
    return Math.min(MAX_INTEREST, pending + newInterest);
}

function updateBankUI() {
    const user = getCurrentUser();
    if (!user) return;

    const balance = user.bankBalance || 0;
    const totalPending = calculatePendingInterest(user);

    const walletDisplay = document.getElementById('bank-wallet-display');
    const balanceDisplay = document.getElementById('bank-balance-display');
    const interestDisplay = document.getElementById('bank-interest-display');

    if (walletDisplay) walletDisplay.textContent = Math.floor(user.credits || 0);
    if (balanceDisplay) balanceDisplay.textContent = Math.floor(balance);
    if (interestDisplay) interestDisplay.textContent = totalPending.toFixed(4); // Show 4 decimals to see it tick up
}

async function handleDeposit() {
    const user = getCurrentUser();
    if (!user) return;

    const amountInput = document.getElementById('bank-amount-input');
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Bitte einen gültigen Betrag eingeben.");
        return;
    }

    if ((user.credits || 0) < amount) {
        alert("Nicht genügend Credits im Wallet!");
        return;
    }

    await performBankTransaction(user, amount, 0);
    amountInput.value = '';
}

async function handleWithdraw() {
    const user = getCurrentUser();
    if (!user) return;

    const amountInput = document.getElementById('bank-amount-input');
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Bitte einen gültigen Betrag eingeben.");
        return;
    }

    const currentBalance = user.bankBalance || 0;
    if (currentBalance < amount) {
        alert("Nicht genügend Credits auf der Bank!");
        return;
    }

    await performBankTransaction(user, -amount, 0);
    amountInput.value = '';
}

async function handleClaimInterest() {
    const user = getCurrentUser();
    if (!user) return;

    const totalPending = calculatePendingInterest(user);
    const claimable = Math.floor(totalPending);

    if (claimable <= 0) {
        alert("Keine vollen Credits zum Auszahlen vorhanden.");
        return;
    }

    await performBankTransaction(user, 0, claimable, totalPending);
}

// amountDiff: positive for deposit, negative for withdraw. 0 if just claiming interest.
// claimAmount: how much interest is claimed (added to wallet).
// currentTotalPending: passed when claiming to preserve the fractional part.
async function performBankTransaction(user, amountDiff, claimAmount, currentTotalPending = null) {
    const btnDeposit = document.getElementById('bank-deposit-btn');
    const btnWithdraw = document.getElementById('bank-withdraw-btn');
    const btnClaim = document.getElementById('bank-claim-btn');

    btnDeposit.disabled = true;
    btnWithdraw.disabled = true;
    btnClaim.disabled = true;

    try {
        let totalPending = currentTotalPending !== null ? currentTotalPending : calculatePendingInterest(user);
        
        let newPending = totalPending;
        if (claimAmount > 0) {
            newPending = totalPending - claimAmount;
        }

        const newBalance = (user.bankBalance || 0) + amountDiff;
        const newCredits = (user.credits || 0) - amountDiff + claimAmount;
        const now = Date.now();

        // Update local object
        user.bankBalance = newBalance;
        user.credits = newCredits;
        user.bankPendingInterest = newPending;
        user.bankLastUpdate = now;
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));

        // Update Firestore
        await updateDoc(doc(db, "users", user.uid), {
            bankBalance: newBalance,
            credits: newCredits,
            bankPendingInterest: newPending,
            bankLastUpdate: now
        });

        updateBankUI();
        
        // Also update the main top right credit display if shop is initialized or via main.js
        const globalCreditsDisplay = document.getElementById('current-credits');
        if (globalCreditsDisplay) globalCreditsDisplay.textContent = Math.floor(newCredits);

        if (claimAmount > 0) {
            if (window.showUnlockNotification) window.showUnlockNotification('success', `${claimAmount} Zins-Credits ausgezahlt!`);
            else alert(`${claimAmount} Zins-Credits ausgezahlt!`);
        } else if (amountDiff > 0) {
            if (window.showUnlockNotification) window.showUnlockNotification('success', `${amountDiff} Credits eingezahlt.`);
        } else if (amountDiff < 0) {
            if (window.showUnlockNotification) window.showUnlockNotification('success', `${-amountDiff} Credits abgehoben.`);
        }

    } catch (e) {
        console.error("Bank Transaction Error:", e);
        alert("Fehler bei der Transaktion: " + e.message);
    } finally {
        btnDeposit.disabled = false;
        btnWithdraw.disabled = false;
        btnClaim.disabled = false;
    }
}
