// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';

export async function initAuth() {
    const adminRef = doc(db, "users", "admin");
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
        await setDoc(adminRef, { username: 'admin', password: '123', role: 'admin' });
    }
}

// NEU: Die kombinierte Login & Registrierungs-Funktion
export async function loginOrRegister(username, password) {
    if (!username || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    // Wir wandeln den Namen sofort in Kleinbuchstaben um (verhindert Bugs mit "Admin" vs "admin")
    const safeUsername = username.toLowerCase().trim();
    
    const userRef = doc(db, "users", safeUsername);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        // 1. Account existiert bereits -> Passwort prüfen!
        const user = userSnap.data();
        if (user.password === password) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return { success: true, user, message: 'Erfolgreich eingeloggt.' };
        } else {
            return { success: false, message: 'Falsches Passwort.' };
        }
    } else {
        // 2. Account existiert noch nicht -> Wir erstellen ihn direkt!
        // Extra Sicherheit: Falls "admin" gelöscht wurde, erstellen wir ihn hier mit Admin-Rechten neu
        const role = safeUsername === 'admin' ? 'admin' : 'player';
        const newUser = { username: safeUsername, password, role, stats: { gamesPlayed: 0 } };
        
        await setDoc(userRef, newUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        
        return { success: true, user: newUser, message: 'Account neu erstellt und eingeloggt!' };
    }
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}