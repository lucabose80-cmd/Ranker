// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDocs, collection, query, where, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const CURRENT_USER_KEY = 'ranking_game_active_user';
let heartbeatInterval;

export async function initAuth() {
    // Admin Check ignoriert die UID-Logik der Einfachheit halber fürs Testen
}

export async function loginOrRegister(usernameInput, password) {
    if (!usernameInput || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    try {
        const safeName = usernameInput.trim();
        // Suche, ob der Name schon existiert
        const q = query(collection(db, "users"), where("username", "==", safeName.toLowerCase()));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            // LOGIN
            const userDoc = snap.docs[0];
            const user = userDoc.data();
            user.uid = userDoc.id; // Die echte Datenbank-ID speichern
            
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                startPresenceHeartbeat(); 
                return { success: true, user, message: 'Erfolgreich eingeloggt.' };
            } else {
                return { success: false, message: 'Falsches Passwort.' };
            }
        } else {
            // REGISTRIEREN (Erstellt eine einzigartige ID)
            const newUid = "user_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
            const role = safeName.toLowerCase() === 'admin' ? 'admin' : 'player';
            
            const newUser = { 
                username: safeName.toLowerCase(), // Wird intern kleingeschrieben für die Suche
                displayName: safeName, // Zeigt Groß/Kleinschreibung
                password, 
                role, 
                stats: { gamesPlayed: 0 }, 
                discovered: [], 
                avatar: "",
                uid: newUid
            };
            
            await setDoc(doc(db, "users", newUid), newUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
            startPresenceHeartbeat();
            return { success: true, user: newUser, message: 'Account erstellt!' };
        }
    } catch (error) {
        return { success: false, message: `Fehler: ${error.message}` };
    }
}

export async function updateUserProfile(newDisplayName, newPassword, newAvatarPath) {
    const user = getCurrentUser();
    if(!user) return {success: false};
    
    try {
        const updates = {};
        
        // Prüfen, ob der neue Name schon jemand anderem gehört
        if (newDisplayName && newDisplayName.toLowerCase() !== user.username) {
            const q = query(collection(db, "users"), where("username", "==", newDisplayName.toLowerCase()));
            const snap = await getDocs(q);
            if (!snap.empty) return { success: false, message: "Dieser Name ist bereits vergeben!" };
            
            updates.displayName = newDisplayName;
            updates.username = newDisplayName.toLowerCase();
        }
        
        if (newPassword) updates.password = newPassword;
        if (newAvatarPath !== undefined) updates.avatar = newAvatarPath;
        
        await updateDoc(doc(db, "users", user.uid), updates);
        
        const updatedUser = { ...user, ...updates };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export function startPresenceHeartbeat() {
    const user = getCurrentUser();
    if (!user) return;
    
    const sendHeartbeat = async () => {
        try { await updateDoc(doc(db, "users", user.uid), { lastActive: Timestamp.now() }); } catch (e) {}
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
    try { await updateDoc(doc(db, "users", user.uid), { discovered: arrayUnion(charName) }); } catch (e) {}
}

export function logout() {
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}