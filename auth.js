// auth.js
import { db } from './firebase-config.js';
import { doc, setDoc, getDocs, getDoc, collection, query, where, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
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

export async function updateUserProfile(newDisplayName, newPassword, newAvatarPath, newTitle, newTheme) {
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
        if (newAvatarPath !== undefined && newAvatarPath !== null) {
            if (currentMode === 'starwars') updates.avatarStarWars = newAvatarPath;
            else updates.avatarWaifu = newAvatarPath;
        }
        
        if (newTitle !== undefined && newTitle !== null) {
            if (currentMode === 'starwars') updates.activeTitle_starwars = newTitle;
            else updates.activeTitle_waifu = newTitle;
        }

        if (newTheme !== undefined && newTheme !== null) {
            if (currentMode === 'starwars') updates.activeTheme_starwars = newTheme;
            else updates.activeTheme_waifu = newTheme;
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

export async function markCharactersAsDiscovered(charNamesArray) {
    let user = getCurrentUser();
    if (!user || user.role === 'admin') return;
    if (!user.discovered) user.discovered = [];
    if (!user.newlyDiscovered) user.newlyDiscovered = [];

    // Prüfe ob ein Admin-Reset stattgefunden hat (discoveryResetAt ist neuer als lokaler Cache)
    try {
        const freshSnap = await getDoc(doc(db, "users", user.uid));
        if (freshSnap.exists()) {
            const freshData = freshSnap.data();
            const localResetAt = user.discoveryResetAt ? (user.discoveryResetAt.seconds || 0) : 0;
            const remoteResetAt = freshData.discoveryResetAt ? freshData.discoveryResetAt.seconds : 0;
            if (remoteResetAt > localResetAt) {
                // Admin hat discovery resetet – lokalen Cache invalidieren
                user.discovered = freshData.discovered || [];
                user.newlyDiscovered = freshData.newlyDiscovered || [];
                user.discoveryResetAt = freshData.discoveryResetAt;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            }
        }
    } catch (e) { /* Ignorieren wenn offline */ }

    // Alle Chars dieser Runde als "neu" markieren die lokal noch nicht bekannt sind
    const newDiscoveries = charNamesArray.filter(name => !user.discovered.includes(name));
    if (newDiscoveries.length === 0) return;

    user.discovered.push(...newDiscoveries);
    user.newlyDiscovered = [...new Set([...user.newlyDiscovered, ...newDiscoveries])];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    try { 
        // arrayUnion ist idempotent – auch nach Admin-Reset wird korrekt neu eingetragen
        await updateDoc(doc(db, "users", user.uid), { 
            discovered: arrayUnion(...newDiscoveries),
            newlyDiscovered: arrayUnion(...newDiscoveries)
        }); 
        trackWrite(1);
    } catch (e) { console.error("Fehler bei markCharactersAsDiscovered:", e); }
}

export async function clearNewlyDiscovered() {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return;
    if (!user.newlyDiscovered || user.newlyDiscovered.length === 0) return;

    user.newlyDiscovered = [];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    try { 
        await updateDoc(doc(db, "users", user.uid), { newlyDiscovered: [] }); 
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

export async function logout() {
    if(heartbeatInterval) clearInterval(heartbeatInterval);
    // Setzt lastActive auf einen weit vergangenen Timestamp, damit der Online-Tracker den User sofort entfernt
    const user = getCurrentUser();
    if (user) {
        try {
            await updateDoc(doc(db, "users", user.uid), {
                lastActive: new Timestamp(0, 0) // 1. Januar 1970 = definitiv offline
            });
        } catch(e) {}
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    location.reload();
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// Liest den User-State frisch aus Firebase und aktualisiert den lokalen Cache.
// Muss aufgerufen werden wenn der localStorage veraltet sein könnte (nach Admin-Reset, nach Spielende).
export async function refreshCurrentUser() {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return user;
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const freshData = snap.data();
            const updatedUser = { ...user, ...freshData, uid: user.uid };
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
            return updatedUser;
        }
    } catch (e) {
        console.warn("refreshCurrentUser fehlgeschlagen:", e);
    }
    return user;
}