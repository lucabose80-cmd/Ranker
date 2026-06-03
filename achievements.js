import { db } from './firebase-config.js';
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';

export async function checkAndUnlockTitle(titleId) {
    const user = getCurrentUser();
    if (!user) return false;
    const mode = window.currentMode || 'starwars';
    const titlesField = `unlocked_titles_${mode}`;
    if (!user[titlesField]) user[titlesField] = [];
    
    if (!user[titlesField].includes(titleId)) {
        user[titlesField].push(titleId);
        
        if (window.showUnlockNotification) {
            import('./titles.js').then(({ TITLES }) => {
                const tObj = (TITLES[mode] || []).find(t => t.id === titleId);
                window.showUnlockNotification('title', tObj ? tObj.name : titleId);
            });
        }
        
        localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
        try {
            await updateDoc(doc(db, "users", user.uid), {
                [titlesField]: user[titlesField]
            });
        } catch (e) { console.error(e); }
        return true;
    }
    return false;
}

export async function incrementUserStat(statKey, incrementAmount = 1) {
    const user = getCurrentUser();
    if (!user) return;
    if (!user.stats) user.stats = {};
    user.stats[statKey] = (user.stats[statKey] || 0) + incrementAmount;
    
    localStorage.setItem('ranking_game_active_user', JSON.stringify(user));
    
    try {
        await updateDoc(doc(db, "users", user.uid), {
            [`stats.${statKey}`]: increment(incrementAmount)
        });
    } catch(e) { console.error(e); }
}
