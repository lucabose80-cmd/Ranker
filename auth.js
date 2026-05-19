// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';

// Prüft in der Cloud, ob der Admin existiert, falls nicht -> erstellen
export async function initAuth() {
    const adminRef = doc(db, "users", "admin");
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
        await setDoc(adminRef, { username: 'admin', password: '123', role: 'admin' });
    }
}

export async function register(username, password) {
    if (!username || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        return { success: false, message: 'Benutzername existiert bereits.' };
    }

    // Neuen Nutzer in Firestore anlegen
    await setDoc(userRef, { username, password, role: 'player', stats: { gamesPlayed: 0 } });
    return { success: true, message: 'Erfolgreich registriert! Bitte einloggen.' };
}

export async function login(username, password) {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        const user = userSnap.data();
        if (user.password === password) {
            // Sitzung lokal speichern
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return { success: true, user };
        }
    }
    return { success: false, message: 'Falscher Name oder Passwort.' };
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}