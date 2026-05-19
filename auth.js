/// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';

export async function initAuth() {
    try {
        const adminRef = doc(db, "users", "admin");
        // Wir aktualisieren den Admin bei jedem Start, um sicherzugehen, dass das Passwort "123" ist!
        await setDoc(adminRef, { username: 'admin', password: '123', role: 'admin' }, { merge: true });
    } catch (error) {
        console.error("Firebase Init Fehler (Admin konnte nicht geprüft werden):", error);
        // Wir lassen die App trotzdem weiterlaufen!
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
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                return { success: true, user, message: 'Erfolgreich eingeloggt.' };
            } else {
                return { success: false, message: 'Falsches Passwort.' };
            }
        } else {
            const role = safeUsername === 'admin' ? 'admin' : 'player';
            const newUser = { username: safeUsername, password, role, stats: { gamesPlayed: 0 } };
            
            await setDoc(userRef, newUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
            
            return { success: true, user: newUser, message: 'Account neu erstellt und eingeloggt!' };
        }
    } catch (error) {
        console.error("Login Fehler:", error);
        // Gibt den echten Firebase-Fehler an die Benutzeroberfläche weiter!
        return { success: false, message: `Datenbank-Fehler: ${error.message}` };
    }
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}