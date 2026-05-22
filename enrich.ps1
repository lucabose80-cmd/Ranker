$lines = Get-Content "data-starwars.js" -Encoding utf8
$newLines = @()

foreach ($line in $lines) {
    if ($line -match '\{ name: "(.*?)", img: "(.*?)", tags: \[(.*?)\] \}(.*)') {
        $name = $matches[1]
        $img = $matches[2]
        $tagsRaw = $matches[3]
        $tail = $matches[4]
        
        $tags = $tagsRaw -replace '"', '' -split ', ' | ForEach-Object { $_.Trim() }
        
        $gender = "Männlich"
        if ("heiss" -in $tags -or $name -in @("Ahsoka Tano", "Leia Organa", "Shaak Ti", "Luminara Unduli", "Aayla Secura", "Bo-Katan Kryze", "Rey Skywalker", "Captain Phasma", "Asajj Ventress", "Merrin", "Morgan Elsbeth", "Mother Talzin", "Duchess Satine", "Ursa Wren", "Koska Reeves", "Jyn Erso", "Mon Mothma", "Hera Syndulla", "Sabine Wren", "Rose Tico", "Vice Admiral Holdo", "Maz Kanata", "Padme Amidala", "Riyo Chuchi", "Cere Junda", "Barriss Offee", "Katooni", "Second Sister", "Third Sister", "Seventh Sister", "Fennec Shand", "Zam Wesell", "Aurra Sing", "Qi'ra", "Oola", "Omega")) {
            $gender = "Weiblich"
        }
        if ("droide" -in $tags) { $gender = "Droide" }
        if ("monster" -in $tags -or $name -in @("Grogu", "Rancor", "Wampa", "Sarlacc", "Nexu", "Acklay", "Reek", "Rathtar", "Zillo Beast", "Mudhorn")) {
            $gender = "Unbekannt"
        }
        
        $force = ("jedi" -in $tags) -or ($name -in @("Grogu", "Emperor Palpatine")) -or ("sith" -in $tags) -or ("inquisitor" -in $tags) -or ("nachtschwester" -in $tags) -or ("grau" -in $tags)
        $forceStr = if ($force) { "true" } else { "false" }
        
        $species = "Mensch"
        if ("klon" -in $tags) { $species = "Mensch (Klon)" }
        if ("droide" -in $tags) { $species = "Droide" }
        if ($name -in @("Ahsoka Tano", "Shaak Ti")) { $species = "Togruta" }
        if ($name -in @("Yoda", "Grogu", "Yaddle")) { $species = "Yodas Spezies" }
        if ($name -in @("Darth Maul", "Savage Opress")) { $species = "Zabrak" }
        if ($name -in @("Chewbacca", "Gungi")) { $species = "Wookiee" }
        if ($name -in @("Jabba the Hutt", "Rotta the Hutt", "Ziro the Hutt", "Gardulla the Hutt", "The Twins") -or "hutte" -in $tags) { $species = "Hutt" }
        if ($name -in @("Plo Koon")) { $species = "Kel Dor" }
        if ($name -in @("Kit Fisto", "Nahdar Vebb")) { $species = "Nautolaner" }
        if ($name -in @("Ki-Adi-Mundi")) { $species = "Cereaner" }
        if ($name -in @("Aayla Secura", "Bib Fortuna", "Hera Syndulla", "Oola")) { $species = "Twi'lek" }
        if ($name -in @("Asajj Ventress", "Merrin")) { $species = "Dathomirianer" }
        if ("monster" -in $tags) { $species = "Monster" }
        if ($name -in @("Admiral Ackbar")) { $species = "Mon Calamari" }
        if ($name -in @("Cad Bane")) { $species = "Duros" }
        
        $faction = @()
        if ("jedi" -in $tags) { $faction += '"Jedi-Orden"' }
        if ("sith" -in $tags) { $faction += '"Sith"' }
        if ("imperium" -in $tags -or "inquisitor" -in $tags) { $faction += '"Imperium"' }
        if ("rebell" -in $tags -or $name -eq "Ahsoka Tano") { $faction += '"Rebellion"' }
        if ("klon" -in $tags -and "imperium" -notin $tags) { $faction += '"Republik"' }
        if ("separatist" -in $tags) { $faction += '"Separatisten"' }
        if ("mandalorian" -in $tags) { $faction += '"Mandalorianer"' }
        if ("kopfgeldjäger" -in $tags) { $faction += '"Kopfgeldjäger"' }
        if ("erste_ordnung" -in $tags) { $faction += '"Erste Ordnung"' }
        if ("widerstand" -in $tags) { $faction += '"Widerstand"' }
        if ("unterwelt" -in $tags -or "schmuggel" -in $tags -or "pirat" -in $tags -or "hutte" -in $tags) { $faction += '"Unterwelt"' }
        if ("nachtschwester" -in $tags -or $name -in @("Savage Opress", "Darth Maul")) { $faction += '"Nachtschwestern/Dathomir"' }
        if ("senat" -in $tags) { $faction += '"Senat"' }
        if ($faction.Count -eq 0) { $faction += '"Neutral"' }
        $factionStr = $faction -join ", "
        
        $era = @()
        if ("klon" -in $tags -or "separatist" -in $tags -or "jedi" -in $tags -or $name -in @("Anakin Skywalker", "Obi-Wan Kenobi", "Padme Amidala", "Darth Maul", "Emperor Palpatine")) {
            $era += '"Prequels/Clone Wars"'
        }
        if ("erste_ordnung" -in $tags -or "widerstand" -in $tags -or $name -in @("Rey Skywalker", "Kylo Ren", "Luke Skywalker", "Leia Organa", "Han Solo", "Chewbacca")) {
            $era += '"Sequels"'
        }
        if ($name -in @("Luke Skywalker", "Darth Vader", "Han Solo", "Leia Organa", "Emperor Palpatine", "Boba Fett", "Lando Calrissian") -or "imperium" -in $tags -or "rebell" -in $tags) {
            $era += '"Originals"'
        }
        if ("mandalorian" -in $tags -or $name -in @("Grogu", "Moff Gideon", "Ahsoka Tano", "Boba Fett", "Luke Skywalker")) {
            $era += '"Mandalorian/Ahsoka"'
        }
        if ($era.Count -eq 0) { $era += '"Unbekannt"' }
        $eraStr = $era -join ", "
        
        $newLine = '  { name: "' + $name + '", img: "' + $img + '", tags: [' + $tagsRaw + '], gender: "' + $gender + '", species: "' + $species + '", faction: [' + $factionStr + '], era: [' + $eraStr + '], force: ' + $forceStr + ' }' + $tail
        $newLines += $newLine
    } else {
        $newLines += $line
    }
}

[System.IO.File]::WriteAllLines("d:\Programmieren\Ranker\data-starwars.js", $newLines, (New-Object System.Text.UTF8Encoding($false)))
