// cardgame-state.js

export const state = {
    playerDecks: { deck0: [], deck1: [], deck2: [] },
    activeDeckIndex: 0,
    playerDeck: [],
    opponentDeck: [],
    opponentData: null,
    currentRound: 1,
    playerScore: 0,
    opponentScore: 0,
    playedPlayerCards: [],
    playedOpponentCards: [],
    globalScoresCache: {},
    isBotMatch: false,
    liveMatchActive: false,
    isAdventureMatch: false,
    adventureLevelIndex: 0,
    
    // Live PVP
    currentCardgameLobbyId: null,
    cardgameLobbyUnsubscribe: null,
    cardgameListUnsubscribe: null,
    isHost: false,
    isLivePvP: false,
    livePvPRoundProcessed: false
};
