// resets.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let cacheAdminResets = null;
let cacheUserResets = null;
let cacheTimestamp = 0;

// Holt alle Resets (global und persönlich) mit einem 12-Stunden-Cache, um massive Reads zu verhindern
export async function getResets(force = false) {
    const now = Date.now();
    // 12 Stunden Cache (43200000 ms) statt 60 Sekunden, um die Reads pro Ladevorgang zu fixen
    if (!force && cacheAdminResets && cacheUserResets && (now - cacheTimestamp < 43200000)) {
        return { adminResets: cacheAdminResets, userResets: cacheUserResets };
    }

    if (!force) {
        try {
            const localCacheStr = localStorage.getItem('ranker_resets_cache');
            if (localCacheStr) {
                const localCache = JSON.parse(localCacheStr);
                if (now - localCache.timestamp < 43200000) {
                    cacheAdminResets = localCache.adminResets;
                    cacheUserResets = localCache.userResets;
                    cacheTimestamp = localCache.timestamp;
                    return { adminResets: cacheAdminResets, userResets: cacheUserResets };
                }
            }
        } catch (e) {
            console.warn("Fehler beim Lesen des localStorage Caches", e);
        }
    }

    const adminResets = {
        globalHistoryReset_starwars: 0,
        globalHistoryReset_waifu: 0,
        globalScoreboardReset_starwars: 0,
        globalScoreboardReset_waifu: 0
    };
    const userResets = {};

    try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(d => {
            const u = d.data();
            if (u.role === 'admin') {
                if (u.globalHistoryReset_starwars) adminResets.globalHistoryReset_starwars = u.globalHistoryReset_starwars.seconds;
                if (u.globalHistoryReset_waifu) adminResets.globalHistoryReset_waifu = u.globalHistoryReset_waifu.seconds;
                if (u.globalScoreboardReset_starwars) adminResets.globalScoreboardReset_starwars = u.globalScoreboardReset_starwars.seconds;
                if (u.globalScoreboardReset_waifu) adminResets.globalScoreboardReset_waifu = u.globalScoreboardReset_waifu.seconds;
            }
            
            userResets[u.username] = {
                displayName: u.displayName || u.username,
                historyResetAt_starwars: u.historyResetAt_starwars?.seconds || 0,
                historyResetAt_waifu: u.historyResetAt_waifu?.seconds || 0,
                scoreboardResetAt_starwars: u.scoreboardResetAt_starwars?.seconds || 0,
                scoreboardResetAt_waifu: u.scoreboardResetAt_waifu?.seconds || 0
            };
        });

        cacheAdminResets = adminResets;
        cacheUserResets = userResets;
        cacheTimestamp = now;

        try {
            localStorage.setItem('ranker_resets_cache', JSON.stringify({
                adminResets: adminResets,
                userResets: userResets,
                timestamp: now
            }));
        } catch (e) {}
    } catch (e) {
        console.error("Fehler beim Laden der Resets:", e);
        // Falls der Cache bereits existiert, nutzen wir ihn als Fallback
        if (cacheAdminResets && cacheUserResets) {
            return { adminResets: cacheAdminResets, userResets: cacheUserResets };
        }
    }

    return { adminResets, userResets };
}

// Ermöglicht es, den Cache nach admin-Aktionen gezielt zu invalidieren
export function invalidateResetsCache() {
    cacheAdminResets = null;
    cacheUserResets = null;
    cacheTimestamp = 0;
    localStorage.removeItem('ranker_resets_cache'); // Auch localStorage leeren!
}
