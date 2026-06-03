import re

with open('cardgame.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Base Score Multipliers (Rebell, Sith, Widerstand, Fahrzeug, Monster)
base_score_logic = """
        let pBaseMult = 1.0;
        let oBaseMult = 1.0;
        
        if (isAdventureMatch && pEffects.buffs) {
            // Rebell: Behind at start of round -> +20%
            if (pEffects.buffs.includes('buff_rebell') && playerScore < opponentScore) pBaseMult += 0.2;
            
            // Sith: Sith-Zorn (Lost by 50 last round)
            if (pEffects.buffs.includes('buff_sith') && pEffects.sithZornActive) {
                pBaseMult += 0.5;
                pEffects.sithZornActive = false;
            }
            
            // Widerstand: Last card +100%
            if (pEffects.buffs.includes('buff_widerstand') && playerHandRemaining.length === 1 && !pEffects.vehicles) {
                pBaseMult += 1.0;
            }
            
            // Fahrzeug: +30%
            if (pEffects.buffs.includes('buff_fahrzeug') && pTags.includes('vehicle')) {
                pBaseMult += 0.3;
            }
            
            // Monster: 50/50 Chance
            if (pEffects.buffs.includes('buff_monster')) {
                if (Math.random() < 0.5) pBaseScore += 30; else pBaseScore -= 15;
            }
            
            // Bad Batch: +50
            if (pEffects.buffs.includes('buff_badbatch') && pTags.includes('bad_batch')) {
                pBaseScore += 50;
            }
        }
        
        pBaseScore = Math.floor(pBaseScore * pBaseMult);
"""

content = re.sub(
    r'(let pBaseScore = Math\.floor\(getCardScore\(pName\)\s*\*\s*pRarMult\);)',
    r'\1' + base_score_logic,
    content
)

# 2. Add oEffects.senatBurokratie to startMatch
start_match_logic = """
            if (pEffects.buffs.includes('buff_senat')) oEffects.senatBurokratie = true;
"""
content = re.sub(
    r'(if \(pEffects\.buffs\.includes\(\'buff_schmuggel\'\)\) \{)',
    start_match_logic + r'\1',
    content
)

# 3. Senat Buff (Enemy card = 0)
senat_logic = """
        if (isAdventureMatch && oEffects.senatBurokratie && !oEffects.vehicles) {
            oBaseScore = 0;
            oEffects.senatBurokratie = false;
            oLog.push("Bürokratie: Score annulliert");
        }
"""
content = re.sub(
    r'(let oBaseScore = Math\.floor\(getCardScore\(oName\)\s*\*\s*oRarMult\);)',
    r'\1' + senat_logic,
    content
)

# 4. Klon Disziplin & 212th & 501st
klon_logic = """
        if (isAdventureMatch && pEffects.buffs) {
            if (pEffects.buffs.includes('buff_klon') && pTags.includes('klon')) {
                if (pEffects.lastWasKlon) { pBaseScore += 20; pLog.push("Klon-Disziplin: +20"); }
                pEffects.lastWasKlon = true;
            } else {
                pEffects.lastWasKlon = false;
            }
            
            if (pEffects.buffs.includes('buff_501st') && pTags.includes('501st')) {
                opponentScore -= 10;
                pLog.push("Vaders Faust: Gegner -10");
            }
            
            if (pEffects.buffs.includes('buff_212th') && pTags.includes('212th')) {
                pEffects.copyOpponentMult = true;
            }
        }
"""
content = re.sub(
    r'(let pFac = pData\.faction\?\[0\]\.toLowerCase\(\) \|\| \'\';)',
    r'\1' + klon_logic,
    content
)

# 5. End of round logic (Droid, Erste Ordnung, Bounty, Sith Zorn, Grey, Separatist)
end_round_logic = """
        if (isAdventureMatch && pEffects.buffs) {
            // Erste Ordnung Diktatur
            if (pEffects.buffs.includes('buff_ersteordnung')) {
                if (pEffects.diktaturActive) { pTurnScore += 15; pEffects.diktaturActive = false; }
                if (pTurnScore > oTurnScore) oEffects.diktaturActive = true; // Wait, actually just opponentScore -= 15 next round? Let's just deduct it immediately:
                if (pTurnScore > oTurnScore) { opponentScore -= 15; pLog.push("Diktatur: Gegner verliert 15 Punkte"); }
            }
            
            // Droiden Netzwerk
            if (pEffects.buffs.includes('buff_droid')) {
                let droids = playerHandRemaining.filter(c => c.char.tags && c.char.tags.includes('droide')).length;
                if (droids > 0) { playerScore += (droids * 5); pLog.push(`Netzwerk: +${droids*5}`); }
            }
            
            // Bounty (Kopfgeld)
            if (pEffects.buffs.includes('buff_bounty') && pTurnScore > oTurnScore && (opponentCard.rarity === 'epic' || opponentCard.rarity === 'legendary')) {
                playerScore += 30; pLog.push("Kopfgeld: +30");
            }
            
            // Sith Zorn
            if (pEffects.buffs.includes('buff_sith') && oTurnScore - pTurnScore >= 50) {
                pEffects.sithZornActive = true; pLog.push("Sith-Zorn aktiviert");
            }
            
            // Grey (Balance)
            if (pEffects.buffs.includes('buff_grey') && Math.abs(playerScore - opponentScore) < 20) {
                playerScore += 40; pLog.push("Balance: +40");
            }
            
            // Separatist (Übermacht)
            if (pEffects.buffs.includes('buff_separatist') && playerHandRemaining.length > opponentHandRemaining.length) {
                playerScore += 10; pLog.push("Übermacht: +10");
            }
            
            // Nekromantie
            if (pEffects.buffs.includes('buff_nachtschwester') && playerHandRemaining.length === 0 && playerGraveyard.length > 0 && !pEffects.nekromantieUsed) {
                const rIdx = Math.floor(Math.random() * playerGraveyard.length);
                playerHandRemaining.push(playerGraveyard[rIdx]);
                playerGraveyard.splice(rIdx, 1);
                pEffects.nekromantieUsed = true;
                pLog.push("Nekromantie: Karte wiederbelebt!");
            }
        }
"""
content = re.sub(
    r'(playerScore \+= Math\.floor\(pTurnScore\);\s*opponentScore \+= Math\.floor\(oTurnScore\);)',
    r'\1' + end_round_logic,
    content
)

# 6. Beskar (Block negative effects)
# Actually, the quickest way is to just ignore oSilence if buff_mandalorian is active
beskar_logic = """
    if (isAdventureMatch && pEffects.buffs && pEffects.buffs.includes('buff_mandalorian')) {
        oSilence = false;
        // Block other things if needed
    }
"""
content = re.sub(
    r'(if \(isAdventureMatch && adventureRule === \'adv_rule_5\'\) oSilence = true;)',
    r'\1' + beskar_logic,
    content
)

with open('cardgame.js', 'w', encoding='utf-8') as f:
    f.write(content)
