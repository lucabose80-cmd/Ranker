const fs = require('fs');
let code = fs.readFileSync('profile.js', 'utf8');

const target = `    let filtered = inventory;
    if (filterPack && filterPack !== 'all') {
        filtered = inventory.filter(c => c.boosterId === filterPack);
    }

    if (filtered.length === 0) {
        albumGrid.innerHTML = '<div style="color:#666; grid-column: 1 / -1; text-align:center; padding: 20px;">Keine Karten gefunden.</div>';
        return;
    }
    
    const grouped = {};
    filtered.forEach(c => {
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });`;

const replacement = `    const grouped = {};
    let isPackView = (filterPack && filterPack !== 'all');
    
    if (isPackView) {
        // wir können window.BOOSTERS aus shop.js nutzen oder den umweg
    }
    
    // WORKAROUND: Da await import manchmal nervig in powershell ist
    // Wir rufen die boosters einfach nochmal manuell ab
    const LEGENDARY_POOL = {
        'Boba Fett': { specialImg: 'Boosterpack.Bilder/BoBafett.png', sound: 'Sounds/boba-fett.mp3', soundLoops: 1 },
        'Yoda': { specialImg: 'Boosterpack.Bilder/YodaLegend.png', sound: 'Sounds/yoda.mp3', soundLoops: 1 },
        'Darth Vader': { specialImg: 'Boosterpack.Bilder/darth-vader.png', sound: 'Sounds/darth-vader.mp3', soundLoops: 1 },
        'Luke Skywalker': { specialImg: 'Boosterpack.Bilder/luke.png', sound: 'Sounds/luke.mp3', soundLoops: 1 },
        'Din Djarin (The Mandalorian)': { specialImg: 'Boosterpack.Bilder/mando.png', sound: 'Sounds/mando.mp3', soundLoops: 1 },
        'Obi-Wan Kenobi': { specialImg: 'Boosterpack.Bilder/Kenobi.png', sound: 'Sounds/Kenobi.mp3', soundLoops: 1 },
        'General Grievous': { specialImg: 'Boosterpack.Bilder/Grievous.png', sound: 'Sounds/grievous.mp3', soundLoops: 1 },
        'Darth Maul': { specialImg: 'Boosterpack.Bilder/Maul.png', sound: 'Sounds/Maul.mp3', soundLoops: 1 },
        'Ahsoka Tano': { specialImg: 'Boosterpack.Bilder/Ahsoka.png', sound: 'Sounds/Ahsoka.mp3', soundLoops: 1 },
        'Captain Rex': { specialImg: 'Boosterpack.Bilder/rex.png', sound: 'Sounds/rex.mp3', soundLoops: 1 },
        'Commander Cody': { specialImg: 'Boosterpack.Bilder/cody.png', sound: 'Sounds/cody.mp3', soundLoops: 1 },
        'Wolffe': { specialImg: 'Boosterpack.Bilder/wolffe.png', sound: 'Sounds/wolffe.mp3', soundLoops: 1 },
        'Crosshair': { specialImg: 'Boosterpack.Bilder/crosshair.png', sound: 'Sounds/crosshair.mp3', soundLoops: 1 },
        'Hunter': { specialImg: 'Boosterpack.Bilder/hunter.png', sound: 'Sounds/hunter.mp3', soundLoops: 1 },
        'Wrecker': { specialImg: 'Boosterpack.Bilder/wrecker.png', sound: 'Sounds/wrecker.mp3', soundLoops: 1 }
    };
    const localBoosters = [
        {
            id: 'starwars_all',
            filter: (char) => true
        },
        {
            id: 'starwars_klon',
            filter: (char) => char.tags && char.tags.includes('klon') && (!char.tags || !char.tags.includes('vehicle'))
        },
        {
            id: 'starwars_jedi_sith',
            filter: (char) => {
                if (char.tags && char.tags.includes('vehicle')) return false;
                if (char.tags && (char.tags.includes('jedi') || char.tags.includes('sith'))) return true;
                if (char.name === 'General Grievous' || char.name === 'Asajj Ventress') return true;
                return false;
            }
        }
    ];

    if (isPackView) {
        const booster = localBoosters.find(b => b.id === filterPack);
        if (booster) {
            const packPool = activeCharacterDatabase.filter(c => booster.filter(c));
            packPool.forEach(c => { grouped[c.name] = []; });
        }
    }
    
    inventory.forEach(c => {
        if (isPackView && c.boosterId !== filterPack) return;
        if (!grouped[c.charName]) grouped[c.charName] = [];
        grouped[c.charName].push(c);
    });

    if (!isPackView) {
        Object.keys(grouped).forEach(k => {
            if (grouped[k].length === 0) delete grouped[k];
        });
    }

    const charsToRender = Object.keys(grouped);
    if (charsToRender.length === 0) {
        albumGrid.innerHTML = '<div style="color:#666; grid-column: 1 / -1; text-align:center; padding: 20px;">Keine Karten gefunden.</div>';
        return;
    }`;

code = code.replace(target, replacement);

const target2 = `const sortedChars = Object.keys(grouped).sort((a,b) => {`;
const replacement2 = `const charsToRenderKeys = Object.keys(grouped);
    const sortedChars = charsToRenderKeys.sort((a,b) => {`;
    
code = code.replace(target2, replacement2);

fs.writeFileSync('profile.js', code);
