const fs = require('fs');

let content = fs.readFileSync('profile.js', 'utf8');

const oldCheck = const hasUnseenTitle = (TITLES[currentMode] || []).some(t => {
        const isUnlocked = t.secret ? unlockedTitles.includes(t.id) : gamesPlayed >= t.required;
        return isUnlocked && !seenIds.includes(t.id);
    });;

const newCheck = const hasUnseenTitle = (TITLES[currentMode] || []).some(t => {
        let isUnlocked = t.secret ? unlockedTitles.includes(t.id) : gamesPlayed >= t.required;
        if (t.condition && (t.condition.type === 'bot_defeat' || t.condition.type === 'custom')) isUnlocked = unlockedTitles.includes(t.id);
        return isUnlocked && !seenIds.includes(t.id);
    });;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('profile.js', content, 'utf8');
console.log('Fixed profile.js title logic');
