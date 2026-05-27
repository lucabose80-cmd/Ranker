$path = "d:\Programmieren\Ranker\shop.js"
$content = Get-Content -Path $path -Raw
$content = $content.Replace(
    "const ownedNames = new Set(inv.filter(c => c.boosterId === booster.id).map(c => c.charName));",
    "const poolNames = new Set(pool.map(c => c.name));`n        const ownedNames = new Set(inv.filter(c => poolNames.has(c.charName)).map(c => c.charName));"
)
$content = $content.Replace(
    "const packComplete = ownedCount === totalCount;",
    "const packComplete = ownedCount >= totalCount;"
)
Set-Content -Path $path -Value $content
