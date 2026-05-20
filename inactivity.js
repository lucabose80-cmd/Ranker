// inactivity.js
// Meldet den User nach TIMEOUT_MS Inaktivität automatisch ab.
// Inaktivität = keine Mausbewegung, kein Klick, kein Tastendruck, kein Scrollen.

import { logout } from './auth.js';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 Minuten
const WARNING_MS = 60 * 1000;     // Warnung 1 Minute vorher

let inactivityTimer = null;
let warningTimer = null;
let warningBanner = null;

function resetTimer() {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);

    // Warnung-Banner verstecken, falls sichtbar
    if (warningBanner) {
        warningBanner.style.opacity = '0';
        warningBanner.style.transform = 'translateY(-100%)';
    }

    // Warnung 1 Minute vorher zeigen
    warningTimer = setTimeout(() => {
        if (warningBanner) {
            warningBanner.style.opacity = '1';
            warningBanner.style.transform = 'translateY(0)';
        }
    }, TIMEOUT_MS - WARNING_MS);

    // Automatisch abmelden
    inactivityTimer = setTimeout(() => {
        logout();
    }, TIMEOUT_MS);
}

export function initInactivityWatcher() {
    // Warning-Banner ins DOM einfügen
    warningBanner = document.createElement('div');
    warningBanner.id = 'inactivity-banner';
    warningBanner.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0;
        background: #b45309;
        color: white;
        text-align: center;
        padding: 10px 20px;
        font-size: 0.9rem;
        font-weight: bold;
        z-index: 99999;
        opacity: 0;
        transform: translateY(-100%);
        transition: opacity 0.4s ease, transform 0.4s ease;
    `;
    warningBanner.innerHTML = `
        ⚠️ Du wirst in <strong>1 Minute</strong> wegen Inaktivität abgemeldet.
        <button onclick="document.dispatchEvent(new Event('mousemove'))" style="
            margin-left: 15px; background: white; color: #b45309;
            border: none; padding: 4px 12px; border-radius: 4px;
            cursor: pointer; font-weight: bold; font-size: 0.85rem;
        ">Aktiv bleiben</button>
    `;
    document.body.appendChild(warningBanner);

    // Events die als "aktiv" gelten
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => document.addEventListener(evt, resetTimer, { passive: true }));

    // Starte den ersten Timer
    resetTimer();
}
