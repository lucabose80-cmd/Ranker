// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDocs, collection, query, where, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { currentMode } from './mode-state.js';
import { trackRead, trackWrite } from './tracker.js';

const CURRENT_USER_KEY = 'ranking_game_active_user';
let heartbeatInterval;

export async function initAuth() {}

export async function loginOrRegister(usernameInput, password) {
    if (!usernameInput || !password) return { success: false, message: 'Bitte alles ausfüllen.' };
    
    try {
        const safeName = usernameInput.trim();
        const q = query(collection(db, "users"), where("username", "==", safeName.toLowerCase()));
        const snap = await getDocs(q);
        trackRead(snap.size);
        
        if (!snap.empty) {
            const userDoc = snap.docs[0];
            const user = userDoc.data();
            user.uid = userDoc.id;
            
            if (!user.avatarStarWars) user.avatarStarWars = user.avatar || "";
            if (!user.avatarWaifu) user.avatarWaifu = "";
            
            // NEU: Update-Tracker für bestehende User initialisieren
            if (user.lastReadVersionStarWars === undefined) user.lastReadVersionStarWars = "";
            if (user.lastReadVersionWaifu === undefined) user.lastReadVersionWaifu = "";
            
            if (user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                startPresenceHeartbeat(); 
                return { success: true, user, message: 'Erfolgreich eingeloggt.' };
            } else {
                return { success: false, message: 'Falsches Passwort.' };
            }
        } else {
            const newUid = "user_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
            const role = safeName.toLowerCase() === 'admin' ? 'admin' : 'player';
            
            const newUser = { 
                username: safeName.toLowerCase(),
                displayName: safeName,
                password, 
                role, 
                stats: { gamesPlayed: 0 }, 
                discovered: [], 
                avatarStarWars: "",
                avatarWaifu: "",
                lastReadVersionStarWars: "", // NEU
                lastReadVersionWaifu: "",    // NEU
                uid: newUid
            };
            
            await setDoc(doc(db, "users", newUid), newUser);
            trackWrite(1);
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
        
        if (newDisplayName && newDisplayName.toLowerCase() !== user.username) {
            const q = query(collection(db, "users"), where("username", "==", newDisplayName.toLowerCase()));
            const snap = await getDocs(q);
            trackRead(snap.size);
            if (!snap.empty) return { success: false, message: "Dieser Name ist bereits vergeben!" };
            
            updates.displayName = newDisplayName;
            updates.username = newDisplayName.toLowerCase();
        }
        
        if (newPassword) updates.password = newPassword;
        if (newAvatarPath !== undefined) {
            if (currentMode === 'starwars') updates.avatarStarWars = newAvatarPath;
            else updates.avatarWaifu = newAvatarPath;
        }
        
        await updateDoc(doc(db, "users", user.uid), updates);
        trackWrite(1);
        
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
        try { 
            await updateDoc(doc(db, "users", user.uid), { 
                lastActive: Timestamp.now(),
                activeMode: currentMode 
            }); 
            trackWrite(1); 
        } catch (e) {}
    };
    sendHeartbeat();
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(sendHeartbeat, 180000); // Nur noch alle 3 Minuten pingen (spart 66% der Writes)
}

export async function markCharacterAsDiscovered(charName) {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return;
    if (!user.discovered) user.discovered = [];
    if (user.discovered.includes(charName)) return;

    user.discovered.push(charName);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    try { 
        await updateDoc(doc(db, "users", user.uid), { discovered: arrayUnion(charName) }); 
        trackWrite(1);
    } catch (e) {}
}

// NEU: Markiert Updates als gelesen
export async function markUpdatesAsRead(mode, version) {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return;

    const field = mode === 'starwars' ? 'lastReadVersionStarWars' : 'lastReadVersionWaifu';
    if (user[field] === version) return; // Bereits gelesen

    user[field] = version;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    try {
        const updateObj = {};
        updateObj[field] = version;
        await updateDoc(doc(db, "users", user.uid), updateObj);
        trackWrite(1);
    } catch (e) {}
}

export function logout() {
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload(); 
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}