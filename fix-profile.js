const fs = require('fs');

let content = fs.readFileSync('profile.js', 'utf8');

const oldFunc = export function clearProfileUnlockDot(user) {
    if (!user) return;
    const currentIds = [
        ...(user.unlocked_themes_starwars || []),
        ...(user.unlocked_themes_waifu || []),
        ...(user.unlocked_titles_starwars || []),
        ...(user.unlocked_titles_waifu || [])
    ];
    localStorage.setItem('seen_unlock_ids', JSON.stringify(currentIds));
    const dot = document.getElementById('profile-unlock-dot');
    if (dot) dot.style.display = 'none';
};

const newFunc = export function clearProfileUnlockDot(user) {
    if (!user) return;
    const currentIds = [
        ...(user.unlocked_themes_starwars || []),
        ...(user.unlocked_themes_waifu || []),
        ...(user.unlocked_titles_starwars || []),
        ...(user.unlocked_titles_waifu || [])
    ];
    const seenIds = getSeenIds();
    currentIds.forEach(id => {
        if (!seenIds.includes(id)) seenIds.push(id);
    });
    // Also, um den User nicht zu nerven, markieren wir einfach alle bisher entdeckten Karten als gelesen, 
    // falls sie durch den Bug gelscht wurden. (Nur um es angenehmer zu machen)
    if (user.discovered) {
        user.discovered.forEach(id => {
            if (!seenIds.includes(id)) seenIds.push(id);
        });
    }
    localStorage.setItem('seen_unlock_ids', JSON.stringify(seenIds));
    const dot = document.getElementById('profile-unlock-dot');
    if (dot) dot.style.display = 'none';
};

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('profile.js', content, 'utf8');
console.log('Fixed profile.js');
