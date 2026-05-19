// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';
let heartbeatInterval;

export async function initAuth() {
    try {
        await setDoc(doc(db, "users", "admin"), { username: 'admin', password: '123', role: 'admin' }, { merge: true });
    } catch (e) {}
}

export async function loginOrRegister(username, password) {
    if (!username || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    try {
        const safeUsername = username.toLowerCase().trim();
        const userRef = doc(db, "users", safeUsername);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const user = userSnap.data();
            if (!user.discovered) user.discovered = [];
            if (!user.displayName) user.displayName = user.username;
            if (!user.avatar) user.avatar = "";
            
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                startPresenceHeartbeat(); // Online markieren
                return { success: true, user, message: 'Erfolgreich eingeloggt.' };
            } else {
                return { success: false, message: 'Falsches Passwort.' };
            }
        } else {
            const role = safeUsername === 'admin' ? 'admin' : 'player';
            const newUser = { username: safeUsername, displayName: safeUsername, password, role, stats: { gamesPlayed: 0 }, discovered: [], avatar: "" };
            
            await setDoc(userRef, newUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
            startPresenceHeartbeat();
            return { success: true, user: newUser, message: 'Account erstellt!' };
        }
    } catch (error) {
        return { success: false, message: `Fehler: ${error.message}` };
    }
}

// NEU: Profil-Daten aktualisieren
export async function updateUserProfile(newDisplayName, newPassword, newAvatarPath) {
    const user = getCurrentUser();
    if(!user) return {success: false};
    
    try {
        const updates = {};
        if (newDisplayName) updates.displayName = newDisplayName;
        if (newPassword) updates.password = newPassword;
        if (newAvatarPath !== undefined) updates.avatar = newAvatarPath;
        
        await updateDoc(doc(db, "users", user.username), updates);
        
        const updatedUser = { ...user, ...updates };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// NEU: Sagt der Cloud alle 30 Sekunden "Ich bin noch da!"
export function startPresenceHeartbeat() {
    const user = getCurrentUser();
    if (!user) return;
    
    const sendHeartbeat = async () => {
        try { await updateDoc(doc(db, "users", user.username), { lastActive: Timestamp.now() }); } catch (e) {}
    };
    sendHeartbeat();
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(sendHeartbeat, 30000);
}

export async function markCharacterAsDiscovered(charName) {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return;
    if (!user.discovered) user.discovered = [];
    if (user.discovered.includes(charName)) return;

    user.discovered.push(charName);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    try { await updateDoc(doc(db, "users", user.username), { discovered: arrayUnion(charName) }); } catch (e) {}
}

export function logout() {
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}