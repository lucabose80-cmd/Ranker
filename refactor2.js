const fs = require('fs');

let content = fs.readFileSync('cardgame.js', 'utf8');

const oldGetMainFaction = /function getMainFaction\(tags\) \{[\s\S]*?return 'neutral';\n\}/;

const newGetFactions = unction getFactions(tags) {
    if(!tags) return ['neutral'];
    const tg = tags.map(t => t.toLowerCase());
    let facs = [];
    if(tg.includes('501st')) facs.push('501st');
    if(tg.includes('212th')) facs.push('212th');
    if(tg.includes('bad_batch')) facs.push('bad_batch');
    if(tg.includes('hutte')) facs.push('hutte');
    if(tg.includes('schmuggel')) facs.push('schmuggel');
    
    if(tg.includes('jedi')) facs.push('jedi');
    if(tg.includes('sith')) facs.push('sith');
    if(tg.includes('rebell') || tg.includes('rebellen')) facs.push('rebell');
    if(tg.includes('imperium')) facs.push('imperium');
    if(tg.includes('klon') || tg.includes('clone')) facs.push('klon');
    if(tg.includes('mandalorianer') || tg.includes('mandalorian')) facs.push('mandalorianer');
    if(tg.includes('kopfgeldjger') || tg.includes('kopfgeldjaeger') || tg.includes('kopfgeldjger') || tg.includes('kopfgeldjäger')) facs.push('kopfgeldjger');
    if(tg.includes('droid') || tg.includes('droide')) facs.push('droid');
    if(tg.includes('schurke') || tg.includes('unterwelt') || tg.includes('pirat')) facs.push('schurke');
    if(tg.includes('nachtschwester') || tg.includes('dathomir')) facs.push('nachtschwester');
    if(tg.includes('erste ordnung')) facs.push('erste ordnung');
    if(tg.includes('widerstand')) facs.push('widerstand');
    if(tg.includes('senat') || tg.includes('republik')) facs.push('senat');
    if(tg.includes('graue machtnutzer') || tg.includes('grau')) facs.push('graue machtnutzer');
    if(tg.includes('fahrzeug')) facs.push('fahrzeug');
    if(tg.includes('separatist')) facs.push('separatist');
    if(tg.includes('monster') || tg.includes('kreatur')) facs.push('monster');
    if(facs.length === 0) return ['neutral'];
    return facs;
};

content = content.replace(oldGetMainFaction, newGetFactions);

content = content.replace(
    /const f = getMainFaction\(dbC \? dbC\.tags : \[\]\);\s*if\(f !== 'neutral'\) \{ counts\[f\] = \(counts\[f\] \|\| 0\) \+ 1; \}/g,
    \const facs = getFactions(dbC ? dbC.tags : []);
        facs.forEach(f => { if(f !== 'neutral') { counts[f] = (counts[f] || 0) + 1; } });\
);

content = content.replace(
    /const fA = getMainFaction\(dbA \? dbA\.tags : \[\]\);\s*const fB = getMainFaction\(dbB \? dbB\.tags : \[\]\);/g,
    \const fA = getFactions(dbA ? dbA.tags : [])[0];
            const fB = getFactions(dbB ? dbB.tags : [])[0];\
);

content = content.replace(
    /let synChars = candidates\.filter\(c => \{\s*if\(!c\.tags\) return false;\s*let tags = c\.tags\.map\(t => t\.toLowerCase\(\)\);\s*if \(bot\.factionFocus === 'senat' && \(tags\.includes\('senat'\) \|\| tags\.includes\('republik'\)\)\) return true;\s*return tags\.includes\(bot\.factionFocus\);\s*\}\)\.sort\(\(\) => 0\.5 - Math\.random\(\)\);/g,
    \let synChars = candidates.filter(c => {
            if(!c.tags) return false;
            return getFactions(c.tags).includes(bot.factionFocus);
        }).sort(() => 0.5 - Math.random());\
);

content = content.replace(
    /let pFac = pDb \? getMainFaction\(pDb\.tags\) : 'neutral';\s*let oFac = oDb \? getMainFaction\(oDb\.tags\) : 'neutral';/g,
    \let pFacs = pDb ? getFactions(pDb.tags) : ['neutral'];
    let oFacs = oDb ? getFactions(oDb.tags) : ['neutral'];\
);

content = content.replace(
    /let pFacCheat = pDbCheat \? getMainFaction\(pDbCheat\.tags\) : 'neutral';/g,
    \let pFacsCheat = pDbCheat ? getFactions(pDbCheat.tags) : ['neutral'];\
);

content = content.replace(
    /if \(pEffects\.klon && pFacCheat === 'klon'\) pSimScore \+= pEffects\.lastCloneDead;\s*if \(pEffects\.droid && pFacCheat === 'droid'\) pSimScore \*= 2;/g,
    \if (pEffects.klon && pFacsCheat.includes('klon')) pSimScore += pEffects.lastCloneDead;
                if (pEffects.droid && pFacsCheat.includes('droid')) pSimScore *= 2;\
);

content = content.replace(
    /let fac = db \? getMainFaction\(db\.tags\) : 'neutral';\s*let baseScore = getCardScore\(card\.charName\) \* \(RARITY_MULT\[card\.rarity\] \|\| 1\.0\);\s*let simulatedScore = baseScore;\s*if \(oEffects\.klon && fac === 'klon'\) simulatedScore \+= oEffects\.lastCloneDead;\s*if \(oEffects\.droid && fac === 'droid'\) simulatedScore \*= 2;/g,
    \let facs = db ? getFactions(db.tags) : ['neutral'];
                    let baseScore = getCardScore(card.charName) * (RARITY_MULT[card.rarity] || 1.0);
                    
                    let simulatedScore = baseScore;
                    if (oEffects.klon && facs.includes('klon')) simulatedScore += oEffects.lastCloneDead;
                    if (oEffects.droid && facs.includes('droid')) simulatedScore *= 2;\
);

content = content.replace(/pFac === /g, 'pFacs.includes(');
content = content.replace(/oFac === /g, 'oFacs.includes(');
content = content.replace(/pFacs\.includes\((.*?)\)/g, "pFacs.includes()");
// Need to add closing paren because the replace was pFac === 'jedi' -> pFacs.includes('jedi' (missing ')')
// Ah wait, it's easier to just do:
content = content.replace(/pFacs\.includes\('([^']+)'/g, "pFacs.includes('')");
content = content.replace(/oFacs\.includes\('([^']+)'/g, "oFacs.includes('')");

fs.writeFileSync('cardgame.js', content, 'utf8');

// Also fix main.js
let mainContent = fs.readFileSync('main.js', 'utf8');
if (!mainContent.includes('window.openShop')) {
    mainContent = mainContent.replace(
        "import { initShop } from './shop.js';",
        "import { initShop } from './shop.js';\nwindow.openShop = function() { document.getElementById('shop-modal').classList.remove('hidden'); initShop(); };"
    );
    fs.writeFileSync('main.js', mainContent, 'utf8');
}

// And index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');
htmlContent = htmlContent.replace(
    /onclick="document\.getElementById\('shop-modal'\)\.classList\.remove\('hidden'\)" title="Shop"/g,
    'onclick="openShop()" title="Shop"'
);
fs.writeFileSync('index.html', htmlContent, 'utf8');

console.log('Done');
