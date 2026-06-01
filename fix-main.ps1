$js = Get-Content 'main.js' -Raw
$js = $js -replace "setupSubNav\('\.cardgame-sub-nav', \['cardgame-matchmaking', 'cardgame-deckbuilder', 'adventure-content', 'cardgame-bots'\]\);", "setupSubNav('.cardgame-sub-nav', ['cardgame-matchmaking', 'cardgame-deckbuilder', 'adventure-content', 'cardgame-bots'], { 'cardgame-deckbuilder': () => { document.getElementById('cardgame-btn-deck')?.click(); } });"
Set-Content -Path 'main.js' -Value $js
Write-Output "Main fixed"
