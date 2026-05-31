// This file contains the drafted logic for the new cardgame mechanics

// Helper: Count factions in a deck
function getFactionCounts(deck) {
    const counts = {};
    deck.forEach(c => {
        const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
        if(!dbC) return;
        dbC.tags.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        });
    });
    return counts;
}

// Global active effects (add to cardgame.js)
let pActiveVehicle = null;
let oActiveVehicle = null;
let pRebelSabotage = false; // If true, AI must play open next round
let pCloneChain = 0;
let oCloneChain = 0;
let pSithUsed = false;
let oSithUsed = false;
let pDroidsDead = 0;
let oDroidsDead = 0;
let pFirstOrderWins = 0;
let oFirstOrderWins = 0;
let pResistanceDead = 0;
let oResistanceDead = 0;
let pBountyTarget = null;
let oBountyTarget = null;

// Reset in startMatch
function resetMechanicsState() {
    pActiveVehicle = null;
    oActiveVehicle = null;
    pRebelSabotage = false;
    pCloneChain = 0;
    oCloneChain = 0;
    pSithUsed = false;
    oSithUsed = false;
    pDroidsDead = 0;
    oDroidsDead = 0;
    pFirstOrderWins = 0;
    oFirstOrderWins = 0;
    pResistanceDead = 0;
    oResistanceDead = 0;
    
    // Pick Bounty targets
    const pCounts = getFactionCounts(playerDeck);
    const oCounts = getFactionCounts(opponentDeck);
    
    if (pCounts['kopfgeldjäger'] >= 3) {
        // Mark a random opponent tag
        const allTags = opponentDeck.flatMap(c => {
            const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
            return dbC ? dbC.tags : [];
        });
        if (allTags.length > 0) pBountyTarget = allTags[Math.floor(Math.random() * allTags.length)];
    }
    
    if (oCounts['kopfgeldjäger'] >= 3) {
        const allTags = playerDeck.flatMap(c => {
            const dbC = activeCharacterDatabase.find(x => x.name === c.charName);
            return dbC ? dbC.tags : [];
        });
        if (allTags.length > 0) oBountyTarget = allTags[Math.floor(Math.random() * allTags.length)];
    }
}
