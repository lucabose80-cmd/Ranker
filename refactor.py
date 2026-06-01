import re

with open('cardgame.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace getMainFaction with getFactions
old_getMainFaction = '''function getMainFaction(tags) {
    if(!tags) return 'neutral';
    const tg = tags.map(t => t.toLowerCase());
    if(tg.includes('501st')) return '501st';
    if(tg.includes('212th')) return '212th';
    if(tg.includes('bad_batch')) return 'bad_batch';
    if(tg.includes('hutte')) return 'hutte';
    if(tg.includes('schmuggel')) return 'schmuggel';
    
    if(tg.includes('jedi')) return 'jedi';
    if(tg.includes('sith')) return 'sith';
    if(tg.includes('rebell') || tg.includes('rebellen')) return 'rebell';
    if(tg.includes('imperium')) return 'imperium';
    if(tg.includes('klon') || tg.includes('clone')) return 'klon';
    if(tg.includes('mandalorianer') || tg.includes('mandalorian')) return 'mandalorianer';
    if(tg.includes('kopfgeldj\ufffdger') || tg.includes('kopfgeldjaeger') || tg.includes('kopfgeldjger') || tg.includes('kopfgeldjäger')) return 'kopfgeldj\ufffdger';
    if(tg.includes('droid') || tg.includes('droide')) return 'droid';
    if(tg.includes('schurke') || tg.includes('unterwelt') || tg.includes('pirat')) return 'schurke';
    if(tg.includes('nachtschwester') || tg.includes('dathomir')) return 'nachtschwester';
    if(tg.includes('erste ordnung')) return 'erste ordnung';
    if(tg.includes('widerstand')) return 'widerstand';
    if(tg.includes('senat') || tg.includes('republik')) return 'senat';
    if(tg.includes('graue machtnutzer') || tg.includes('grau')) return 'graue machtnutzer';
    if(tg.includes('fahrzeug')) return 'fahrzeug';
    if(tg.includes('separatist')) return 'separatist';
    if(tg.includes('monster') || tg.includes('kreatur')) return 'monster';
    return 'neutral';
}'''

new_getFactions = '''function getFactions(tags) {
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
    if(tg.includes('kopfgeldjäger') || tg.includes('kopfgeldjaeger') || tg.includes('kopfgeldjger') || tg.includes('kopfgeldj\ufffdger')) facs.push('kopfgeldj\ufffdger');
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
}'''

# Replace the function definition using regex to handle potential character encoding weirdness in kopfgeldjäger
content = re.sub(r'function getMainFaction\(tags\) \{.*?\n\}', new_getFactions, content, flags=re.DOTALL)

# 2. calculateSynergy
content = re.sub(
    r'const f = getMainFaction\(dbC \? dbC\.tags : \[\]\);\s*if\(f !== \'neutral\'\) \{ counts\[f\] = \(counts\[f\] \|\| 0\) \+ 1; \}',
    '''const facs = getFactions(dbC ? dbC.tags : []);
        facs.forEach(f => { if(f !== 'neutral') { counts[f] = (counts[f] || 0) + 1; } });''',
    content
)

# 3. sorting in collection / deck builder (fA.localeCompare) -> use first faction
content = re.sub(
    r'const fA = getMainFaction\(dbA \? dbA\.tags : \[\]\);\s*const fB = getMainFaction\(dbB \? dbB\.tags : \[\]\);',
    '''const fA = getFactions(dbA ? dbA.tags : [])[0];
            const fB = getFactions(dbB ? dbB.tags : [])[0];''',
    content
)

# 4. startBotMatch filter
old_filter = '''let synChars = candidates.filter(c => {
            if(!c.tags) return false;
            let tags = c.tags.map(t => t.toLowerCase());
            if (bot.factionFocus === 'senat' && (tags.includes('senat') || tags.includes('republik'))) return true;
            return tags.includes(bot.factionFocus);
        }).sort(() => 0.5 - Math.random());'''
new_filter = '''let synChars = candidates.filter(c => {
            if(!c.tags) return false;
            return getFactions(c.tags).includes(bot.factionFocus);
        }).sort(() => 0.5 - Math.random());'''
content = content.replace(old_filter, new_filter)

# 5. playRound pFac / oFac
content = content.replace(
    '''let pFac = pDb ? getMainFaction(pDb.tags) : 'neutral';
    let oFac = oDb ? getMainFaction(oDb.tags) : 'neutral';''',
    '''let pFacs = pDb ? getFactions(pDb.tags) : ['neutral'];
    let oFacs = oDb ? getFactions(oDb.tags) : ['neutral'];'''
)
# Cheat factions
content = content.replace(
    '''let pFacCheat = pDbCheat ? getMainFaction(pDbCheat.tags) : 'neutral';''',
    '''let pFacsCheat = pDbCheat ? getFactions(pDbCheat.tags) : ['neutral'];'''
)
content = content.replace(
    '''if (pEffects.klon && pFacCheat === 'klon') pSimScore += pEffects.lastCloneDead;
                if (pEffects.droid && pFacCheat === 'droid') pSimScore *= 2;''',
    '''if (pEffects.klon && pFacsCheat.includes('klon')) pSimScore += pEffects.lastCloneDead;
                if (pEffects.droid && pFacsCheat.includes('droid')) pSimScore *= 2;'''
)
content = content.replace(
    '''let fac = db ? getMainFaction(db.tags) : 'neutral';
                    let baseScore = getCardScore(card.charName) * (RARITY_MULT[card.rarity] || 1.0);
                    
                    let simulatedScore = baseScore;
                    if (oEffects.klon && fac === 'klon') simulatedScore += oEffects.lastCloneDead;
                    if (oEffects.droid && fac === 'droid') simulatedScore *= 2;''',
    '''let facs = db ? getFactions(db.tags) : ['neutral'];
                    let baseScore = getCardScore(card.charName) * (RARITY_MULT[card.rarity] || 1.0);
                    
                    let simulatedScore = baseScore;
                    if (oEffects.klon && facs.includes('klon')) simulatedScore += oEffects.lastCloneDead;
                    if (oEffects.droid && facs.includes('droid')) simulatedScore *= 2;'''
)

# 6. Replace all pFac === and oFac ===
import re
content = re.sub(r'pFac === ([\'"].*?[\'"])', r'pFacs.includes(\1)', content)
content = re.sub(r'oFac === ([\'"].*?[\'"])', r'oFacs.includes(\1)', content)

# 7. Add initShop to window in main.js
with open('main.js', 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'window.openShop' not in main_content:
    main_content = main_content.replace(
        "import { initShop } from './shop.js';",
        "import { initShop } from './shop.js';\nwindow.openShop = function() { document.getElementById('shop-modal').classList.remove('hidden'); initShop(); };"
    )
    with open('main.js', 'w', encoding='utf-8') as f:
        f.write(main_content)

# 8. Update index.html shop button onclick
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace(
    "onclick=\"document.getElementById('shop-modal').classList.remove('hidden')\" title=\"Shop\"",
    "onclick=\"openShop()\" title=\"Shop\""
)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with open('cardgame.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
