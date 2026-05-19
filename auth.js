// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';

export async function initAuth() {
    try {
        const adminRef = doc(db, "users", "admin");
        await setDoc(adminRef, { username: 'admin', password: '123', role: 'admin' }, { merge: true });
    } catch (error) {
        console.error("Firebase Init Fehler:", error);
    }
}

export async function loginOrRegister(username, password) {
    if (!username || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    try {
        const safeUsername = username.toLowerCase().trim();
        const userRef = doc(db, "users", safeUsername);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const user = userSnap.data();
            // Fallback: Falls ein alter Account noch keine Entdeckungen-Liste hat
            if (!user.discovered) user.discovered = [];
            
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                return { success: true, user, message: 'Erfolgreich eingeloggt.' };
            } else {
                return { success: false, message: 'Falsches Passwort.' };
            }
        } else {
            const role = safeUsername === 'admin' ? 'admin' : 'player';
            // Neue Accounts starten mit einem leeren Entdeckt-Array []
            const newUser = { username: safeUsername, password, role, stats: { gamesPlayed: 0 }, discovered: [] };
            
            await setDoc(userRef, newUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
            
            return { success: true, user: newUser, message: 'Account neu erstellt und eingeloggt!' };
        }
    } catch (error) {
        console.error("Login Fehler:", error);
        return { success: false, message: `Datenbank-Fehler: ${error.message}` };
    }
}

// NEU: Markiert einen Charakter live in der Cloud und lokal als "entdeckt"
export async function markCharacterAsDiscovered(charName) {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return;

    if (!user.discovered) user.discovered = [];
    if (user.discovered.includes(charName)) return; // Bereits entdeckt, nichts tun

    // 1. Lokal im Browser speichern (für sofortiges Feedback ohne Ladezeit)
    user.discovered.push(charName);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    // 2. Live in die Firebase Cloud spiegeln
    try {
        const userRef = doc(db, "users", user.username);
        await updateDoc(userRef, {
            discovered: arrayUnion(charName) // Fügt das Element ohne Duplikate hinzu
        });
    } catch (e) {
        console.error("Fehler beim Cloud-Speichern der Entdeckung:", e);
    }
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}