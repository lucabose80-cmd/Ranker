export const patchNotesWaifu = [
    {
        version: "v9.4",
        title: "Major Update: Abenteuer Boss Buffs & Schwarzmarkt",
        isHotfix: false,
        changes: [
            "Feature: Der 'Schwarzmarkt' wurde im Shop hinzugefügt! Jeden Tag werden dort 3 rotierende, seltene Karten angeboten.",
            "Feature: Karten auf dem Schwarzmarkt kosten 200 Credits und können nur einmal pro Tag gekauft werden.",
            "Feature: Nach dem Besiegen eines Bosses im Abenteuer darfst du nun einen von 3 zufälligen Buffs wählen!",
            "Gameplay: Die neuen Buffs geben dir immense Spielvorteile und sind auf verschiedene Fraktionen abgestimmt."
        ]
    },
    {
        version: "v9.2.4",
        title: "Hotfix & UI Polishing",
        isHotfix: true,
        changes: [
            "Hotfix: Der globale Chat war durch das neue Dock-Menü teilweise verdeckt und wird nun wieder korrekt im Vordergrund angezeigt.",
            "Hotfix: Ein Fehler wurde behoben, durch den sich beim Scrollen im Cardgame (z.B. Deckbuilder) die Menüs überlappen konnten.",
            "Hotfix: Legendäre und Epische Karten mit Holo-Effekt werfen nun keine Grafikfragmente mehr über den Kartenrand hinaus.",
            "Hotfix: Das Advanced Ranking zeigt das Board nun wieder im korrekten Layout an.",
            "Design: Das Spiel nutzt nun anstelle der Standard-Browser-Scrollbars dezentere und passendere Custom-Scrollbars.",
            "QoL: Fehlermeldungen (z.B. fehlende Credits beim Booster-Kauf) und Belohnungen erscheinen nun als moderne Toast-Benachrichtigungen in Rot bzw. Grün anstatt den ganzen Bildschirm zu blockieren."
        ]
    },
    {
        version: "v9.2.3",
        title: "Briefkasten & Community System Update",
        isHotfix: false,
        changes: [
            "Feature: Neues Briefkasten-System! Unten im Menü-Dock gibt es nun einen Post-Button. Über diesen könnt ihr direkt Nachrichten und Credits vom System oder den Admins erhalten.",
            "Feature: Der Admin kann nun Ankündigungen und Belohnungen bequem an die gesamte Spielerschaft senden.",
            "QoL: Eingesammelte oder gelesene Nachrichten werden nun direkt aus dem Briefkasten gelöscht, um alles übersichtlich zu halten."
        ]
    },
    {
        version: "v8.3.1",
        title: "Hotfix: Online-Scoreboard Anzeige",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Bug wurde behoben, durch den Spieler fälschlicherweise fehlerhafte Mode-Tags im Online-Scoreboard angezeigt bekamen."
        ]
    },
    {
        version: "v8.0.1",
        title: "Hotfix: Abenteuer-Modus",
        isHotfix: true,
        changes: [
            "Hotfix: Behebt einen Fehler, durch den der Abenteuer-Modus wegen einer falschen Datei-Verknüpfung (stats.js statt tracker.js) nicht geladen werden konnte."
        ]
    },
    {
        version: "v8.0.0",
        title: "MAJOR UPDATE: Abenteuer-Modus (Kampagne)",
        isHotfix: false,
        changes: [
            "NEUER MODUS: Der Abenteuer-Modus ist da! Kämpfe dich durch eine 20-Level lange Kampagne (Original Trilogie).",
            "Deck-Building: Starte mit einem 10-Karten-Basis-Deck und tausche nach jedem Sieg eine Karte gegen eine Karte deines besiegten Gegners aus.",
            "Rogue-like: Wenn du verlierst, startest du wieder komplett von vorn bei Level 1!",
            "Belohnungen: Jeder Sieg bringt 5 Credits, Meilensteine bei Level 10 und 20 bringen 50 und 100 Credits (beim ersten Mal).",
            "Boss-Mechaniken: Jeder Gegner hat spezielle Modifikatoren (z.B. Rancor hat +100% Stärke, Imperium blockt Schaden)."
        ]
    },
    {
        version: "v7.9.7",
        title: "QoL: Geheime Titel aufdecken",
        isHotfix: false,
        changes: [
            "QoL: Wenn man einen geheimen Titel freigeschaltet hat, wird beim Hovern nun nicht mehr nur 'geheime Charaktere' angezeigt, sondern exakt aufgelistet, welche Charaktere (oder Kombinationen) man dafür benötigt hat."
        ]
    },
    {
        version: "v7.9.6",
        title: "QoL: Hover-Details für Titel & Themes",
        isHotfix: false,
        changes: [
            "QoL: Wenn man im Profil über bereits freigeschaltete Titel oder Farb-Themes mit der Maus fährt (hover), wird nun in einem Tooltip angezeigt, welche Bedingung ursprünglich erfüllt werden musste, um sie freizuschalten."
        ]
    },
    {
        version: "v7.9.5",
        title: "Hotfix: Cardgame Bot Duplikate",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Problem wurde behoben, bei dem Bots durch das Auffüllen mit legendären Karten versehentlich mehrmals denselben Charakter in ihr Deck aufnehmen konnten. Bot-Decks bestehen nun immer aus 10 einzigartigen Karten."
        ]
    },
    {
        version: "v7.9.4",
        title: "Update: Echte Cardgame Legendaries für Bots",
        isHotfix: false,
        changes: [
            "Feature: Bots können nun keine 'Fake-Legendaries' mehr generieren. Wenn ein Bot eine legendäre Karte in sein Deck wählt, greift er nun ausschließlich auf den Pool echter legendärer Charaktere zurück.",
            "QoL: Legendäre Animationen, Sounds und die 5-sekündige Wartezeit beim Aufdecken treten nun nur noch auf, wenn ein echter Spieler die Karte ausspielt. Bots spielen legendäre Karten ab sofort ohne Verzögerung und große Effekte."
        ]
    },
    {
        version: "v7.9.3",
        title: "Update: Cardgame Bot Intelligenz",
        isHotfix: false,
        changes: [
            "Feature: Die KI-Logik für Cardgame Bots wurde massiv überarbeitet. Die Bots werfen nun nicht mehr einfach zufällig Karten ab.",
            "Balancing: Die Intelligenz skaliert jetzt exakt mit der Stufe des Bots. Niedrige Bots spielen noch fehlerhaft und zufällig. Höhere Bots (Stufe 7+) kontern die Züge des Spielers taktisch perfekt aus und opfern bei garantierten Niederlagen gezielt ihre schwächsten Karten."
        ]
    },
    {
        version: "v7.9.2",
        title: "Hotfix: Cardgame Bot Titel",
        isHotfix: true,
        changes: [
            "Hotfix: Es wurde ein Fehler behoben, bei dem die 10 geheimen Cardgame-Titel fälschlicherweise durch das Spielen im 'Expanded Universe' freigeschaltet wurden.",
            "Sanitization: Fälschlicherweise erhaltene Bot-Titel wurden aus den Profilen der betroffenen Spieler entfernt."
        ]
    },
    {
        version: "v7.9.1",
        title: "Hotfix: Daily Reset",
        isHotfix: true,
        changes: [
            "Hotfix: Der Daily Reset für gespielte Runden im klassischen Modus wurde repariert. Tägliche Credits-Limits (20 Runden pro Tag) setzen sich nun um Mitternacht wieder korrekt zurück."
        ]
    },
    {
        version: "v7.8",
        title: "Hotfix: Booster Packs & Animationen",
        isHotfix: true,
        changes: [
            "Hotfix: Ein kritischer Fehler wurde behoben, durch den Karten aus Booster-Packs nicht im Inventar gespeichert wurden, wenn eine ungültige Variablenreferenz ausgelöst wurde.",
            "Hotfix: Die Logik für das 'Vervollständigen' eines Packs wurde stark verbessert. Gecraftete oder hochgestufte Karten zählen nun immer zu 100% als gesammelt für das jeweilige Pack. Dadurch kann die Legenden-Belohnung nicht mehr blockiert werden."
        ]
    },
    {
        version: "v7.7",
        title: "Update: Gacha Quality of Life & Admin Tools",
        isHotfix: false,
        changes: [
            "Hotfix: Das Filter-Verhalten im Album wurde verbessert. Gecraftete oder geupgradete Karten sind nun auch in den spezifischen Pack-Filtern korrekt sichtbar.",
            "Feature: Admin-Tool für den Test-Account 'test1' hinzugefügt (Zieht ab sofort garantiert 4 epische und 1 legendäre Karte aus Boosterpacks).",
            "Hotfix: Die Ingame-Anleitung wurde aktualisiert und beinhaltet nun alle neuen Gacha-Mechaniken.",
            "Feature: Das Beanspruchen einer legendären Karte für ein abgeschlossenes Booster-Pack löst nun eine spannende Pack-Öffnungs-Animation aus!"
        ]
    },
    {
        version: "v7.6",
        title: "Update: Gacha Overhaul, Crafting & Trade-Up",
        isHotfix: false,
        changes: [
            "Feature: Gacha Trade-Up System eingeführt! Im Album können nun 5 Gewöhnliche Karten zu 1 Seltenen, und 5 Seltene Karten zu 1 Epischen Karte kombiniert werden.",
            "Feature: Kyber Kristalle hinzugefügt! Werden Duplikate von epischen Karten gezogen oder gecraftet, werden diese automatisch in 20 Kyber Kristalle umgewandelt.",
            "Feature: Crafting-Shop integriert! Im Shop können nun für 100 Kyber Kristalle gezielt Wunsch-Karten auf epischer Stufe hergestellt werden.",
            "Feature: Im Sammelalbum werden fehlende Karten aus spezifischen Booster-Packs nun transparent als ausgegraute 'Fehlt'-Karten angezeigt.",
            "Hotfix: Filter-Verhalten im Album optimiert, um leere Slots und Duplikate sauberer zu trennen."
        ]
    },
    {
        version: "v7.5",
        title: "Update: Cardgame Overhaul & UI Features",
        isHotfix: false,
        changes: [
            "Feature: Das Cardgame unterstützt nun echtes synchrones Live-PvP! Über die neue 'Lobby erstellen'-Funktion können Spieler nun in Echtzeit online gegeneinander antreten.",
            "Feature: Das Bot-System im Cardgame wurde komplett neu programmiert. Es gibt nun 10 verschiedene, ansteigende Schwierigkeitsstufen (von Lvl 1 bis Lvl 10).",
            "Feature: Höherstufige Bots generieren nun dynamisch Decks basierend auf Community-Beliebtheit (Ranking) und Fraktions-Synergien, statt nur zufällige Karten zu ziehen.",
            "Feature: Bot-Belohnungssystem implementiert: Der erste Sieg gegen jede der 10 Bot-Stufen belohnt den Spieler nun mit Credits (gestaffelt von 5 bis 500 Credits).",
            "Feature: Im Deckbuilder wird nun für jede Karte der aktuelle Global-Score (Basiswert) als kleines goldenes Badge in der Ecke angezeigt.",
            "Feature: Im Cardgame-Match (Live/Bot) verschwinden gespielte Karten nicht mehr komplett aus der Hand, sondern bleiben als 'ausgegraut' sichtbar, analog zur Anzeige des Gegners.",
            "Feature: Das Scoreboard hat nun eine Live-Suchleiste (wie das Lexikon), um in der aktuellen Liste blitzschnell nach Charakteren zu suchen, ohne dass das Spiel laggt.",
            "Feature: Ab sofort fließen auch die Ergebnisse aller anderen 5er-Modi (Klon-Modus, Fahrzeuge, Peak, Hardcore Peak) automatisch in das Overall Scoreboard mit ein.",
            "Feature: Wrecker, Hunter, Tech und Luke Skywalker haben nun ebenfalls ihre eigenen Zitate im Hardcore Modus.",
            "Feature: Im Hardcore Modus werden die Zitate der Charaktere nun auch nach dem Aufdecken auf dem End-Screen unter dem Charakter-Namen angezeigt.",
            "Hotfix: Behebung eines Fehlers in der Cardgame-Scoreberechnung, durch den Bots ohne Seltenheits-Tags gespielt haben und somit das Match abstürzen ließen.",
            "Hotfix: Cardgame-Bots ignorieren nicht länger das Beliebtheits-Ranking und bauen nun wieder konforme Decks.",
            "Hotfix: Machtverirrung und neue Cardgame-Basiswerte wurden auf das neue Punkte-basierte Scoreboard angepasst, wodurch neue Karten nicht länger unspielbar schlecht sind.",
            "Hotfix: Behebung eines Fehlers im Live-PvP, durch den man eine gespielte Karte theoretisch unendlich oft hintereinander spielen konnte (Objekt-Referenz-Fix).",
            "UI: Bot-UI aktualisiert: Sobald ein Bot besiegt wurde, verschwindet die 'Erster Sieg' Credit-Anzeige und wird durch einen grünen Haken ersetzt.",
            "UI: Der Standard-Modus im Scoreboard wurde von 'Expanded Universe' zu 'Overall Scoreboard (Basis-Werte)' umbenannt, um klarzumachen, dass dies das Master-Ranking für alle Berechnungen ist."
        ]
    },
    {
        version: "v7.4.2",
        title: "Hotfix: Cardgame Effekte",
        isHotfix: true,
        changes: [
            "Hotfix: Das Runden-Ergebnis-Popup (Sieg/Niederlage) wird bei Legendären Karten um 5 Sekunden verzögert, damit epische Animationen und Sounds ungestört wirken können."
        ]
    },
    {
        version: "v7.4.1",
        title: "Feature Update: Shop Tooltip",
        isHotfix: false,
        changes: [
            "Feature: Neuer dynamischer Hover-Tooltip im Shop! Wenn man über die Legendär-Zeile eines Booster-Packs fährt, erscheint nun ein visuelles Info-Fenster, das exakt anzeigt, welche Charaktere in diesem Pack eine legendäre Karte besitzen."
        ]
    },
    {
        version: "v7.4",
        title: "Feature Update: Lexikon Suche",
        isHotfix: false,
        changes: [
            "Feature: Im Lexikon gibt es nun eine globale Suchleiste (verfügbar in allen Reitern), um gezielt nach Charakteren zu suchen."
        ]
    },
    {
        version: "v7.3.1",
        title: "Bugfixes & Systemstabilität",
        isHotfix: true,
        changes: [
            "Hotfix: Ein kritischer Fehler wurde behoben, der das Abspielen von Sound-Effekten nach einigen Klicks global blockierte.",
            "Update: Beim Login-Feld gibt es nun den Hinweis, dass man sich bei einem vergessenen Passwort an den Admin wenden soll."
        ]
    },
    {
        version: "v7.3",
        title: "Feature & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Drag & Drop! Album Karten können jetzt direkt in den Showcase-Bereich gezogen werden.",
            "Feature: Das Admin-Panel erlaubt es jetzt, vergessene Passwörter für Spieler neu zu setzen.",
            "Fix: Zwillingssuche! Der Zwillings-Algorithmus wurde komplett überarbeitet und vergleicht nun deine globalen Bewertungen mit allen anderen Spielern für ein faires Ergebnis.",
            "Fix: Meister & Schüler! Im Profil können nun nicht mehr dieselben Spieler für beide Kategorien angezeigt werden.",
            "Fix: Versus Modus Preispool! Bei einem Sieg kriegt der Gewinner nun den kompletten Preispool aus den Einsätzen, ein faires Aufteilen passiert nur noch bei Unentschieden."
        ]
    },
    {
        version: "v7.2.1",
        title: "Onboarding & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Umfassende In-Game Anleitung (Tutorial) für neue Spieler hinzugefügt. (Oben rechts aufrufbar)",
            "Feature: Nach Erreichen des 20-Spiele-Limits (10 Credits) erhält man nun unbegrenzt 5 Credits für jedes weitere Spiel im klassischen Modus.",
            "Fix: v7.2 Patchnotes wurden im Changelog-Fenster nicht richtig als aktuellste Version erkannt."
        ]
    },
    {
        version: "v7.2",
        title: "Community & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Spielerprofil anderer Spieler jetzt im eleganten Buch-Layout mit zwei Seiten — links Identität & Aktionen, rechts Statistiken & Showcase.",
            "Feature: Credits-Limit auf 20 Spiele pro Kategorie erhöht (vorher: 10). Bis zu 200 Credits pro Modus verdienbar.",
            "Feature: Korrekturen/Vorschläge: Charaktere können nun nach Namen durchsucht werden.",
            "Fix: Nach einer Versus-Runde wird der Wett-Status zurückgesetzt, sodass in der nächsten Runde neu gewettet werden kann.",
            "QoL: Das eigene Profil-Panel ist jetzt breiter, um alle Features ohne Überlappungen darzustellen."
        ]
    },
    {
        version: "v7.1.1",
        title: "Hotfix: Wett-Pool & Auswertungs-Sichtbarkeit",
        isHotfix: true,
        changes: [
            "Hotfix: Der Wett-Pool im Warteraum und der Spielphase wird nun immer angezeigt (auch bei 0 Credits).",
            "Hotfix: Die Wett-Auswertung im Ergebnis-Modal wird nun immer angezeigt (auch wenn keine Wetten platziert wurden).",
            "Visualisierung: Detaillierte Darstellung von richtigen/falschen Wetten und Auszahlungs- oder Erstattungsdetails im Endscreen.",
            "Stabilität: Erhöhte Robustheit bei unvollständigen Tipps und Schutz vor blockierten Auswertungs-Lobbies.",
            "QoL: Virtuelle Credits für Test- und Admin-Accounts zur direkten Wett-Simulation im Warteraum."
        ]
    },
    {
        version: "v7.1",
        title: "Versus Wetten Update",
        isHotfix: false,
        changes: [
            "Feature: Versus-Wetten! Platziere vor dem Start eines Versus-Spiels im Warteraum Credits auf den vermuteten Gewinner (maximal 1/10 deines Guthabens).",
            "Auszahlung: Der Gewinner der Wette erhält den gesamten Preispool. Bei mehreren richtigen Wetten wird geteilt, bei falschem Tipp aller Spieler gibt es eine Rückerstattung.",
            "Visualisierung: Detaillierte Wett-Auswertungen direkt im Versus-Ergebnis-Modal und im Archiv der Historie einsehbar.",
            "QoL: Cache-Busting für Stylesheets und Skripte implementiert, damit alle neuen Features sofort geladen werden."
        ]
    },
    {
        version: "v7.0.7",
        title: "Hotfix: Shop Tracker",
        isHotfix: true,
        changes: [
            "Neues Feature: Im Shop wird nun unter jedem Pack direkt angezeigt, wie oft du diesen spezifischen Pack-Typ bereits geöffnet hast."
        ]
    },
    {
        version: "v7.0.6",
        title: "Hotfix: Versus Perfektion & Präferenzen",
        isHotfix: true,
        changes: [
            "Neues Feature: 'Perfektion' (Versus-Achievement). Verdiene dir den exklusiven Titel, indem du absolut keine Abweichung hast (Score: 0).",
            "QoL: Das Spiel merkt sich nun über alle Sessions hinweg, welches Universum, welchen Modus und welche Kategorie du als Letztes gespielt hast."
        ]
    },
    {
        version: "v7.0.5",
        title: "Hotfix: UI & Wartungsmodus",
        isHotfix: true,
        changes: [
            "UI-Update: Das Spielerprofil wurde für Desktop-Nutzer auf ein elegantes horizontales Layout umgebaut.",
            "Feature: Neuer gezielter Admin-Wartungsmodus für einzelne Modi oder spezifische Kategorien."
        ]
    },
    {
        version: "v7.0.4",
        title: "Hotfix: Anti-Cheat & Shop-Visuals",
        isHotfix: true,
        changes: [
            "Anti-Cheat & Integrität: Ein Seiten-Reload im aktiven Spiel bricht das Spiel nicht mehr ab. Man muss das Ranking zwingend beenden.",
            "Visualisierung: Wenn du beim Booster-Kauf nicht genug Credits hast, erhältst du nun eine rote Benachrichtigung anstatt eines Alerts.",
            "Hotfix: Neue Spieler oder Resets werden ab sofort ohne Verzögerung direkt beim Aufruf des Scoreboards angezeigt."
        ]
    },
    {
        version: "v7.0",
        title: "GACHA & SAMMELALBUM UPDATE",
        isHotfix: false,
        changes: [
            "Feature: Gacha-System! Verdiene Credits im klassischen Modus (bis zu 10x pro Kategorie) und kaufe damit Booster-Packs im neuen Shop.",
            "Feature: Booster-Packs! Öffne Packs und erweitere deine Sammlung stetig.",
            "Feature: Seltenheitsstufen! Ziehe Karten von Gewöhnlich bis Legendär. Die 5. Karte eines jeden Packs hat eine garantierte Mindest-Seltenheit.",
            "Feature: Profil-Sammelalbum! Betrachte deine gesamte Kollektion, sortiere sie nach Seltenheit, Menge oder Pack und zeige sie anderen Spielern.",
            "Feature: Karten-Showcase! Stelle deine drei wertvollsten Lieblingskarten im Profil (Online-Tab) für die Community zur Schau.",
            "Feature: Atemberaubende Effekte! Epische Karten besitzen glänzende Holo-Effekte. Legendäre Karten flackern golden und spielen beim Auspacken exklusive Sound-Effekte ab (inklusive Artwork-Transformation)."
        ]
    },
    {
        version: "v6.4",
        title: "WICHTIGE ANKÜNDIGUNG",
        isHotfix: false,
        changes: [
            "<div style='font-size: 1.2rem; font-weight: bold; color: #ff4757; text-align: center; margin: 15px 0; line-height: 1.4; text-transform: uppercase;'>Alle Scoreboards mussten aufgrund der vielen neuen Features zurückgesetzt werden!</div>"
        ]
    },
    {
        version: "v6.3.1",
        title: "Hotfix: Analytics & Profil",
        isHotfix: true,
        changes: [
            "Hotfix: Der Trophäenschrank im Online-Tab aktualisiert sich nun sofort live in den Spieler-Visitenkarten ohne Neuladen.",
            "Hotfix: Das automatische Speichern der Tier-List funktioniert nun absolut zuverlässig (und überspringt leere Bilder ohne Absturz).",
            "Hotfix: Komplexe Analytics (Machtverirrung und Tier-List) binden nun verlässlich all deine historischen Spielstände aus alten Datenbanken mit ein und sichern fehlende Community-Rankings elegant ab."
        ]
    },
    {
        version: "v6.3",
        title: "Analytics & Showcase Update",
        isHotfix: false,
        changes: [
            "Feature: Tiefergehende Statistiken (Personal Analytics). Ein Button in deinem Profil generiert ab sofort vollautomatisch eine persönliche Tier-List aus all deinen Spielen.",
            "Feature: Dynamische Tier-List-Generierung. Deine bewerteten Charaktere werden differenziert in Tiers von S bis F eingeordnet. Die generierte Grafik kann mit einem Klick gespeichert werden.",
            "Feature: Die neue 'Machtverirrung'-Statistik analysiert, bei welchem Charakter du am extremsten vom globalen Community-Durchschnitt abweichst.",
            "Feature: Versus-Rivalitäten & Match-History. Dein Profil zeigt jetzt deinen 'Meister' (gegen den du am öftesten verloren hast) und deinen 'Schüler' (gegen den du am meisten gewonnen hast) an.",
            "Feature: Trophäenschrank (Showcase). In deinem Profil gibt es nun 3 Slots, in denen du stolz deine hart verdienten Titel und seltensten Themes ausstellen kannst. Diese sind auch im Online-Tab für die Community sichtbar."
        ]
    },
    {
        version: "v6.2",
        title: "Gamification Update",
        isHotfix: false,
        changes: [
            "Feature: Neuer täglicher 'Animedle' Modus, um dein Wissen zu testen. Mit täglichem Seed und eigenen Speicherständen.",
            "Feature: Im Hardcore-Modus werden Charaktere nun komplett versteckt und nur als schwarze Silhouetten angezeigt, ergänzt durch ikonische Zitate als kleine Hilfe.",
            "Feature: Erweiterte persönliche Analytics in deinem Profil und im Community-Tab. Dein absoluter Lieblingscharakter (und Nemesis) wird nun historienübergreifend berechnet und angezeigt.",
            "Visualisierung: Getrennte Scoreboards für Hardcore-Rankings eingeführt, damit die regulären Statistiken nicht verfälscht werden."
        ]
    },
    {
        version: "v6.1.1",
        title: "Hotfix: Spieler-Profil",
        isHotfix: true,
        changes: [
            "Bugfix: Ein JavaScript-Fehler verhinderte, dass Spieler im Online-Tab angeklickt werden konnten. Das Profil-Modal und alle Stats, Titel und Spielstatistiken werden wieder korrekt angezeigt."
        ]
    },
    {
        version: "v6.1",
        title: "Community & Login Update",
        isHotfix: true,
        changes: [
            "Feature: Neues smartes Autocomplete-Feld auf dem Login-Bildschirm. Beim Eintippen des Benutzernamens werden passende bekannte Accounts vorgeschlagen – so passieren keine Tippfehler mehr. Das Dropdown erscheint erst ab dem ersten Buchstaben und zeigt nur passende Treffer.",
            "Feature: Im Profil anderer Spieler (Community-Tab) gibt es jetzt einen 💬 NACHRICHT SENDEN-Button. Nachrichten können auch an Spieler geschrieben werden, die gerade offline sind.",
            "Feature: Vorschläge-Kategorien überarbeitet: Es gibt jetzt Vorschläge (Allgemein), Charakter Vorschläge, Tags Vorschläge, Korrekturen und Peak Modus Vorschläge. Jede Kategorie zeigt nur die dazugehörigen Vorschläge.",
            "Bugfix: Das Online-Panel konnte beim Einklappen den Reload-Button und den Pfeil-Button übereinanderlegen. Die Buttons sind jetzt korrekt im Header-Flex-Layout angeordnet.",
            "Bugfix: Das Reload-Symbol ↻ war beim Einklappen der Sidebar nach links versetzt. Es ist jetzt zentriert und wird korrekt über dem Pfeil-Button gestapelt."
        ]
    },
    {
        version: "v6.0",
        title: "Das Große Community-Update",
        isHotfix: false,
        changes: [
            "Feature: Online-Panel einklappbar! Die Sidebar lässt sich auf ein schmales Icon-Panel reduzieren. Im eingeklappten Zustand sieht man nur noch die Profilbilder mit dem Online-Punkt und ein Reload-Symbol. Per Klick auf den Pfeil wird sie wieder vollständig aufgeklappt.",
            "Feature: Scoreboard-Gewichtung. Charaktere, die nur selten bewertet wurden, werden nicht mehr automatisch ganz oben angezeigt. Die Punktzahl wird als Durchschnitt (Gesamtpunkte ÷ Anzahl Rankings) berechnet. Bei gleichem Schnitt gewinnt der Charakter mit mehr Rankings. Im Hover-Tooltip sieht man die genaue Berechnung.",
            "Feature: Vorschläge nach Kategorien getrennt. Im Community-Vorschläge-Tab kann man jetzt zwischen den Kategorien filtern. Im Admin-Panel gibt es denselben Filter.",
            "Feature: Anime-Modus Modi erweitert. Zusätzlich zum Expanded Universe gibt es nun auch hier den Peak-Ranking-Modus sowie eine eigene Kategorie für besondere Charaktere.",
            "Feature: Anti-Cheat-Schutz. Ein verstecktes Sicherheitssystem erkennt und filtert auffällige Bewertungsmuster automatisch heraus, um die Integrität des Scoreboards zu schützen.",
            "Feature: Admin-Panel Reset-Buttons. Admins können jetzt gezielt einzelne Spielmodi zurücksetzen sowie einzelne Spieler aus einem bestimmten Modus entfernen.",
            "Feature: Neue Versus-Lobby – Spieler können aus der Community heraus direkt zum Versus-Duell herausgefordert werden.",
            "Feature: Privater Chat – Spieler können sich gegenseitig private Nachrichten schicken.",
            "Feature: Neue Titel & Achievements für besondere Ereignisse im Versus- und Expanded-Universe-Modus."
        ]
    },
    {
        version: "v5.0.4",
        title: "Code-Modernisierung & Performance-Update",
        isHotfix: false,
        changes: [
            "Performance: Massive Überarbeitung der gesamten Code-Basis unter der Haube. Alte Schleifenstrukturen wurden durch hochmoderne, schnelle Array-Funktionen ausgetauscht.",
            "Sicherheit: Verdeckte Optimierungen wurden vorgenommen, um die Code-Struktur besser vor dem Auslesen durch Browser-Entwicklertools zu schützen.",
            "Aufräumarbeit: Zahlreiche alte, ungenutzte Skripte und redundante Code-Abschnitte wurden restlos gelöscht, um die Dateigrößen zu minimieren."
        ]
    },
    {
        version: "v4.4.1",
        title: "System & UI Optimierungen",
        isHotfix: true,
        changes: [
            "Bugfix: Fehler behoben, bei dem gesperrte Titel im Community-Bereich fälschlicherweise als freigeschaltet angezeigt wurden.",
            "Bugfix: Die Abklingzeit für gezogene Charaktere wurde auf echte 5 Runden (25 Ziehungen) ausgeweitet.",
            "UI-Update: Admin-Panel Layout-Fehler behoben und für mobile Geräte responsiv gemacht.",
            "UI-Update: PC-Optimierungs-Info und Registrierungs-Hinweise zum Login-Bildschirm hinzugefügt."
        ]
    },
    {
        version: "v4.4",
        title: "Das Galaktische Farben Update",
        isHotfix: false,
        changes: [
            "Globale Erweiterung: Die Engine unterstützt nun über 20 neue animierte Farbschemas und CSS-Glow-Effekte für das Profil-System.",
            "Ausblick: Diese Features werden aktuell im Star Wars Modus getestet und bald auch im Waifu-Modus verfügbar sein."
        ]
    },
    {
        version: "v4.3",
        title: "Geheimnisse der Galaxis Update",
        isHotfix: false,
        changes: [
            "Globale Erweiterung: Die Engine für dynamische, kombinierte Charakter-Titel (z.B. Verbündete oder Erzfeinde im selben Spiel) wurde erfolgreich in das Spiel implementiert."
        ]
    },

    {
        version: "v4.2",
        title: "System & Balancing Update",
        isHotfix: false,
        changes: [
            "Neuer Pity-Timer: Wenn du einen Charakter lange nicht ziehst, steigt seine Wahrscheinlichkeit nun sanft um 1% pro verpasster Runde.",
            "Zufalls-Cooldown: Das System schließt die letzten 5 gezogenen Charaktere temporär aus, um nervige Dauerschleifen zu verhindern.",
            "Wartungsmodus: Administratoren können ab sofort das Einloggen für Spieler sperren, während globale Updates aufgespielt werden."
        ]
    },
    {
        version: "v3.7",
        title: "Das Große Lexikon Update",
        isHotfix: false,
        changes: [
            "Charakter-Erweiterung (Star Wars): Dutzende neue Helden, Schurken, Klone und Droiden wurden zum Spiel hinzugefügt! Die Fraktionen wurden ausbalanciert.",
            "Neuer geheimer Titel: Ein brandneuer geheimer Titel ('Weeb') wurde hinzugefügt.",
            "Neues Freischaltungs-System: Wenn du einen neuen Titel oder ein neues Farbschema erhältst, wird dies ab sofort mit einem riesigen Popup und einem klassischen 8-Bit Retro-Sound gefeiert!",
            "Statistik-Fix: Die Wahrscheinlichkeiten für geheime Titel berechnen sich nun wieder zu 100% dynamisch basierend auf der aktuellen Größe der Datenbank."
        ]
    },
    {
        version: "v3.6",
        title: "Das Klon-Modus Update (Extra für Jonas)",
        isHotfix: false,
        changes: [
            "Neuer Spielmodus (Star Wars): 'Nur Klone' hinzugefügt! Das Ranking-Wissen kann dort ausschließlich mit Klonsoldaten getestet werden.",
            "Isolierter Fortschritt (Star Wars): Der Klon-Modus verfügt über ein komplett eigenes, unabhängiges globales Scoreboard sowie eine eigene Historie.",
            "Versus Klon-Lobby (Star Wars): Es können nun Lobbys im Versus-Modus erstellt werden, die nur Klon-Charaktere beinhalten. (Voraussetzung: 10 gespielte Runden im Klon-Modus)"
        ]
    },
    {
        version: "v3.5",
        title: "Das Gamification & Quality of Life Update",
        isHotfix: false,
        changes: [
            "Gamification: Bei Freischaltung eines neuen Titels oder Farbschemas erscheint nun eine dynamische On-Screen-Benachrichtigung (Toast) inklusive Sound-Effekt.",
            "Visualisierung: Alle Fenster-Überschriften passen sich nun farblich absolut synchron deinem gewählten Theme an.",
            "Statistik: Bei Farbschemas und geheimen Titeln wird nun dauerhaft die mathematisch exakte, prozentuale Chance angezeigt, diese in einer Ranking-Runde zu ziehen.",
            "Geheimnisse: Eine Reihe streng geheimer Titel wurde implementiert, die ganz besondere Charakter-Kombinationen erfordern.",
            "UI-Update: Sobald du neue Updates verpasst hast, leuchtet der Update-Button nun durchgehend golden. Alle neuen Versionen erhalten im Fenster ein stark sichtbares 'NEU' Abzeichen."
        ]
    },
    {
        version: "v3.4",
        title: "Das große Versus & QoL Update",
        isHotfix: false,
        changes: [
            "Versus Rematch: Nach Abschluss eines Versus-Spiels kann die Lobby nun über den Button 'Noch eine Runde' sofort neu gestartet werden, ohne sich neu einladen zu müssen.",
            "Versus Live-Spectating: Zuschauer können nun Live bei Versus-Matches zusehen. Ein neuer Umschalter im Zuschauermodus erlaubt das nahtlose Wechseln zwischen allen Spielern desselben Matches.",
            "Versus Fortschritt: Abgeschlossene Versus-Matches zählen nun offiziell als absolvierte Spiele und schalten Titel und Themes frei.",
            "Anti-Botting: Ein neuer Makro-Schutz (Hardware-Prüfung) blockiert automatisierte Klick-Bots in allen Spielmodi.",
            "Admin-Panel: Administratoren können ihr Passwort nun direkt und sicher über das Admin-Panel ändern.",
            "Quality of Life: Der Aktualisieren-Button im Online-Tab lädt nun sämtliche Titel und Statistiken aller Spieler komplett neu (Full Refresh).",
            "Bugfix: Abgebrochene Live-Spiele verschwinden nun für Zuschauer sofort (Behebung einer Race Condition).",
            "Bugfix: Der '(Du)' Indikator bei sehr langen Namen im Chat/Online-Tab wird nicht mehr fehlerhaft abgeschnitten."
        ]
    },
    {
        version: "v3.3",
        title: "Das große Anti-Cheat & Security Update",
        isHotfix: false,
        changes: [
            "Anti-Cheat: Ein strenges Signatur-System blockiert ab sofort das doppelte Speichern einer Runde durch Skripte oder Klick-Spamming.",
            "Anti-Cheat: Wer im Spiel die Seite neu lädt, erhält nun exakt denselben Pool zurück UND alle gesetzten Charaktere bleiben auf dem Board. Ein 'Scouten' oder Neuauswürfeln durch F5 ist physisch unmöglich geworden.",
            "Anti-Cheat: Hacker, die mit DevTools die HTML-Struktur der Bewertungs-Buttons manipulieren, prallen nun an serverseitigen JavaScript-Sperren ab.",
            "Sicherheit: Passwörter werden ab sofort kryptographisch stark verschlüsselt (SHA-256) in der Datenbank abgelegt und sind nicht mehr auslesbar.",
            "Live-Modus: Zuschauer sehen nun nur noch die Charaktere, die der spielenden Person auch schon angezeigt wurden. Zukünftige Charaktere bleiben als Fragezeichen getarnt, um Vorsagen ('Ghosting') zu verhindern.",
            "Bugfix: Fehler behoben, durch den einige Admins fälschlicherweise aus der Online-Liste und dem Moderations-Werkzeug versteckt wurden."
        ]
    },
    {
        version: "v3.2.1",
        title: "Hotfix: Live-Spectating & Scoreboard",
        isHotfix: true,
        changes: [
            "Performance: Der Live-Modus wurde radikal optimiert. Eine permanente Hintergrundabfrage wurde durch einen manuellen 'Live-Spiele suchen'-Button ersetzt.",
            "Performance: Das sekundengenaue Live-Update läuft nun wirklich nur noch für den einzelnen Spieler, dem man aktiv zuschaut, was die Datenbankkosten extrem verringert.",
            "Hotfix: Test-Accounts verstecken sich nun auch korrekt aus der Online-Liste der Community.",
            "Hotfix: Ein kritischer Speicherfehler wurde behoben, durch den absolvierte Runden zeitweise nicht mehr in die Historie und das Scoreboard geschrieben wurden.",
            "Hotfix: Das Design des neuen Live-Buttons wurde an den restlichen Stil der App angepasst und UI-Crashes behoben."
        ]
    },
    {
        version: "v3.2",
        title: "Test-Umgebung & Performance Update",
        isHotfix: false,
        changes: [
            "Performance: Der Versus-Warteraum nutzt nun einen manuellen 'Aktualisieren'-Button, was ständige Hintergrundabfragen stoppt und die Stabilität massiv verbessert.",
            "Neues Feature: Unsichtbare Admin-Testaccounts wurden ins System integriert. Diese Geister-Accounts haben alles freigeschaltet, tauchen aber weder in der Historie noch im Scoreboard auf, um die echten Spieler-Rankings beim Testen nicht zu verfälschen."
        ]
    },
    {
        version: "v3.1",
        title: "Anti-Luca Spachmann Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Anti-Reload System. Wenn man die Seite neu lädt, um den unliebsamen ersten Charakter loszuwerden, wird dieser nun gespeichert und taucht beim nächsten Versuch unausweichlich wieder an Position 1 auf. Kein Schummeln mehr am Start!"
        ]
    },
    {
        version: "v3.0.1",
        title: "Hotfix: Versus Modus Stabilität",
        isHotfix: true,
        changes: [
            "Hotfix: Eine schwere Race-Condition beim Senden von Multi-User-Daten wurde via Firebase-Transactions gelöst, damit nie wieder Spiele asynchron hängen bleiben.",
            "Hotfix: Das automatische UI-Lock im Versus-Warteraum bricht nun das Rendering rechtzeitig ab, bevor sich Datenbanken überschreiben können.",
            "Hotfix: Das Resultat-Modal wurde robuster gegen kaputte alte Lobbys und fehlende Datenstrukturen gemacht.",
            "Hotfix: Spiele ohne globale Wertungen enden nun fair im Unentschieden.",
            "Hotfix: Spieler-Avatare in der Lobby sind dank modernem Image-Scaling nicht mehr verzerrt.",
            "Admin-Panel: Das Zurücksetzen des Profils sperrt nun auch wieder korrekt den Zugang zum Versus-Modus."
        ]
    },
    {
        version: "v3.0",
        title: "Multiplayer Update: Versus Modus",
        isHotfix: false,
        changes: [
            "MEGA-FEATURE: Versus-Modus hinzugefügt! Tretet gegen bis zu 8 Spieler gleichzeitig an und findet heraus, wer den perfekten Konsens trifft.",
            "Neues Feature: Lobbysystem – Spieler können eigene Multiplayer-Lobbys hosten oder offenen Spielen beitreten.",
            "Neues Feature: 'Perfektes Ranking' – Der Versus-Modus bewertet eure Entscheidungen im Abgleich mit dem globalen Scoreboard.",
            "Neues Feature: Versus-Historie – Abgeschlossene Matches werden detailliert in der Historie festgehalten. Ein komplett neues, interaktives Resultat-Fenster zeigt die direkten Abweichungen eurer Gegner.",
            "Neues Feature: Eigener Scoreboard-Filter für Versus – Messt euch daran, wer die meisten Versus-Runden gewonnen hat.",
            "Balancing: Der Versus-Modus ist nun erst freigeschaltet, nachdem 10 klassische Runden gespielt wurden, um neuen Spielern eine Eingewöhnung zu ermöglichen."
        ]
    },
    {
        version: "v2.7.6",
        title: "Public Profiles Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Klicke auf Spieler in der Online-Liste, um deren öffentliches Profil aufzurufen.",
            "Neues Feature: Das Spieler-Profil zeigt den Avatar, aktuellen Titel und alle freigeschalteten Themes und Titel für beide Modi an."
        ]
    },
    {
        version: "v2.7.5",
        title: "Manual Refresh & Performance Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Online-Liste kann jetzt manuell über einen Button im Online-Panel aktualisiert werden.",
            "Performance: Automatisches Polling wurde deaktiviert, um Firestore-Reads deutlich zu reduzieren.",
            "Fix: Der eigene Benutzer erscheint nicht mehr doppelt in der Online-Liste.",
            "Fix: Online-Zähler aktualisiert sich jetzt korrekt nach manueller Neuladung.",
            "QoL: Der Refresh-Button ist direkt neben der Online-Überschrift verfügbar.",
            "Chat Feature: Wenn der Chat geschlossen ist und eine neue Nachricht eingeht, leuchtet am Chat-Icon nun ein roter Punkt.",
            "QoL: Eingaben in der Anmeldemaske, im Profil und in Vorschlagsfeldern können nun bequem mit der Enter-Taste bestätigt werden.",
            "Fix: Vorschlagskarten-Header, Lexikon-Gitterhöhe und das Zusammenbrechen des Lexikon-Rasters bei leerem Zustand wurden behoben."
        ]
    },
    {
        version: "v2.7.3",
        title: "Hotfix: Progression & UI-Updates",
        isHotfix: true,
        changes: [
            "Hotfix: Spieler-Titel werden nun im Online-Bereich zuverlässig bei allen Usern angezeigt.",
            "UI-Update: Panel-Überschriften passen sich nun dynamisch an das aktuell gewählte Farb-Theme an.",
            "Neues Feature: Strengere Discovery-Regeln – Profil-Avatare können erst ausgewählt werden, wenn der Charakter entdeckt wurde.",
            "Neues Feature: Unentdeckte Charaktere bleiben im Lexikon komplett verborgen (als '???').",
            "Neues Feature: Der goldene Leuchteffekt ('✨') im Lexikon verschwindet nun, sobald man ihn das erste Mal betrachtet hat."
        ]
    },
    {
        version: "v2.7.2",
        title: "Hotfix: Firebase Optimierungen",
        isHotfix: true,
        changes: [
            "Hotfix: Globale History-Reset funktioniert nun korrekt – localStorage Cache wird beim Reset geleert.",
            "Hotfix: Alle Firebase Listener werden beim Seitenwechsel ordnungsgemäß abgemeldet, um Read-Spikes zu verhindern.",
            "Hotfix: Online-Tracker Query begrenzt auf 50 User – verhindert massive Reads bei vielen Usern.",
            "Hotfix: Admin Chat Listener auf 100 Nachrichten begrenzt.",
            "Hotfix: Admin History Query auf 1.000 Einträge begrenzt – verhindert tausende Reads beim Admin-Panel."
        ]
    },
    {
        version: "v2.7",
        title: "The Themes & Factions Update",
        changes: [
            "Neues Feature: Farbschemas – Schalte durch besondere Leistungen exklusive Farbthemen für den Anime-Modus frei.",
            "Neues Feature: Fraktions-Ansicht im Lexikon – Waifus sind jetzt mit Tags versehen und lassen sich nach Kategorie gefiltert anzeigen.",
            "Neues Feature: Farbschemas, Titel und der Spielezähler sind nun strikt zwischen den Modi getrennt – deine Anime-Progression gehört dir allein.",
            "Neues Feature: Automatische Abmeldung nach 5 Minuten Inaktivität mit Warnung 1 Minute vorher.",
            "UI-Update: Das Updates-Fenster wurde komplett neu gestaltet mit Icon-basierter Änderungsliste und sauberem Kartendesign.",
            "UI-Update: Admin kann nun Titel und Farbschemas einzelner Spieler gezielt zurücksetzen."
        ]
    },
    {
        version: "v2.7.1",
        title: "Hotfix: Online-Tracker & Logout",
        isHotfix: true,
        changes: [
            "Hotfix: Logout setzt nun sofort ein Offline-Signal in der Datenbank – User verschwinden nicht mehr erst nach 7 Minuten aus der Online-Liste.",
            "Hotfix: Online-Zeitfenster von 7 auf 6 Minuten reduziert, um inaktive User schneller zu entfernen.",
            "Hotfix: Profil-Tabs (Avatare/Titel/Farbschemas) werden jetzt korrekt neu gerendert wenn der Modus gewechselt wird."
        ]
    },
    {
        version: "v2.6",
        title: "The Titles & Progression Update",
        changes: [
            "Neues Feature: Titel-System! Sammle abgeschlossene klassische Spiele und schalte automatisch exklusive Titel frei (z.B. Kouhai, Senpai, Waifu-Master).",
            "UI-Update: Das Profilmenü wurde komplett modernisiert – drei Tabs (Avatare / Titel / Farbschemas) mit Grid-Ansicht.",
            "Visualisierung: Dein ausgewählter Titel wird für alle sichtbar in der Topbar, in Historien-Einträgen und live im Chat angezeigt."
        ]
    },
    {
        version: "v2.6.1",
        title: "Hotfix: Performance & UI",
        isHotfix: true,
        changes: [
            "Hotfix: Massive Performance-Verbesserung durch 12-Stunden-Caching von Profil- und Status-Abfragen.",
            "Hotfix: CSS-Kodierungsfehler behoben, der die Titel-Karten im Profil ohne Rahmen anzeigte.",
            "Hotfix: Ausrichtungsfehler im Profil-Overlay zwischen linker Spalte und Tab-Buttons behoben.",
            "Hotfix: Farbschema-Fortschritt zählt ausschließlich im klassischen Modus – Advanced-Spiele werden nicht gewertet."
        ]
    },
    {
        version: "v2.5.1",
        title: "Hotfix: Voting & Patch Notes",
        isHotfix: true,
        changes: [
            "Hotfix: Beim Abstimmen leuchten die Haken (✓) nun kräftig grün auf statt grau zu bleiben.",
            "Hotfix: Bilder bei Charakter-Update-Vorschlägen wurden nicht korrekt aus der Datenbank geladen."
        ]
    },
    {
        version: "v2.5",
        title: "The Community & Suggestions Update",
        changes: [
            "Neues Feature: Erweiterter Vorschläge-Tab – gezielt filtern nach 'Features', 'Neuen Charakteren' und 'Charakter-Updates (Name/Bild)'.",
            "Visualisierung: Charakter-Update-Vorschläge werden in einem interaktiven Bilder-Raster präsentiert – ein Klick öffnet die Voting-Details.",
            "Neues Admin-Feature: Community-Ideen mit genug Votes können direkt als Roadmap-Punkte eingetragen werden und erscheinen in-game."
        ]
    },
    {
        version: "v2.4",
        title: "The Performance & Database Overhaul",
        changes: [
            "Performance: Scoreboard berechnet Punkte nun im Hintergrund (1 Read statt hunderte pro Klick).",
            "Performance: Admin-Resets werden 12 Stunden gepuffert, um überflüssige Reads zu vermeiden.",
            "Performance: Online-Status fragt alle 2 Minuten ab statt einer konstanten Echtzeit-Verbindung.",
            "Performance: Lazy Loading – Historie und Scoreboard werden erst geladen, wenn der Tab geöffnet wird."
        ]
    },
    {
        version: "v2.3.1",
        title: "Hotfix: Advanced & History Grid",
        isHotfix: true,
        changes: [
            "Hotfix: Beim Zuschauen eines Advanced-Spiels werden nun alle 10 Slots korrekt dargestellt.",
            "Hotfix: Die 10-Slot-Historienkarten brechen sauber um, ohne horizontalen Scrollbalken."
        ]
    },
    {
        version: "v2.3",
        title: "The Advanced Mode & Joker Update",
        changes: [
            "Neues Feature: Advanced-Modus (10 Slots statt 5) für noch tieferes Waifu-Ranking.",
            "Neues Feature: Joker-Phase – tausche einmalig zwei Karten per Klick am Ende des Advanced-Modus.",
            "UI-Update: Scoreboard- und Historienkarten unterscheiden zwischen Klassisch (5er) und Advanced (10er).",
            "QoL: Modus-Auswahl direkt im Spiel-Tab."
        ]
    },
    {
        version: "v2.2.1",
        title: "Hotfix: Tracker",
        isHotfix: true,
        changes: [
            "Hotfix: Online-Tracker stabilisiert (Verbindungsprobleme und Anzeigefehler der Spieleranzahl behoben)."
        ]
    },
    {
        version: "v2.2",
        title: "The Instant Speed & QoL Update",
        changes: [
            "Performance: Blitzschnelles Umschalten zwischen Historie und Scoreboard durch RAM-Caching.",
            "Performance: Zirkelbezüge im JavaScript vollständig entkoppelt für absolute Stabilität.",
            "UI-Update: Spielername in der Navigationsleiste deutlich größer und edler dargestellt.",
            "UI-Update: Echte Anzeigenamen (korrekte Groß-/Kleinschreibung) in Historie und Scoreboard-Filter."
        ]
    },
    {
        version: "v2.1",
        title: "The Spectator & Quality of Life Update",
        changes: [
            "Neues Feature: Erscheinungsreihenfolge der Waifus wird in der Historie angezeigt.",
            "Neues Feature: Beim Live-Zuschauen siehst du den kompletten Waifu-Pool inklusive Status.",
            "Optimierung: Live-Spiele werden nach Abschluss automatisch aus der Datenbank gelöscht.",
            "UI-Update: Scrollbalken in allen Rastern ausgeblendet für ein edleres Interface."
        ]
    },
    {
        version: "v2.0.1",
        title: "Hotfix: Performance & Stabilität",
        isHotfix: true,
        changes: [
            "Hotfix: Globale Scoreboard- und Historien-Resets im Admin Panel korrigiert.",
            "Hotfix: Heartbeat-Interval auf 60 Sekunden erhöht, Online-Anzeige nutzt periodische Abfragen."
        ]
    },
    {
        version: "v2.0",
        title: "The Admin Overhaul Update",
        changes: [
            "Neues Feature: Admin Panel mit Farbindikator (Rot = Aktion möglich, Grün = Clean).",
            "Neues Feature: Resets sind nach Universum getrennt – Anime und Star Wars unabhängig zurücksetzbar.",
            "Neues Feature: Chat-Moderation mit Einzellöschung und 'Alles löschen'.",
            "Neues Feature: Discovery, Historie und Scoreboard pro User getrennt zurücksetzbar."
        ]
    },
    {
        version: "v1.9.1",
        title: "Hotfix: Ranking & UI",
        isHotfix: true,
        changes: [
            "Hotfix: Ranken und Bewerten wurde blockiert falls die Cloud-Verbindung kurz hing.",
            "Hotfix: Leere Karten-Slots hatten gestrichelte statt saubere Ränder."
        ]
    },
    {
        version: "v1.9",
        title: "The Community Update",
        changes: [
            "Neues Feature: Live-Spectating – schau anderen Spielern in Echtzeit beim Ranken zu.",
            "Neues Feature: Globaler Chat als schwebendes Widget (mit Cross-Universe Tags).",
            "Neues Feature: Online-Sidebar und überarbeitetes Profil-Overlay.",
            "UI-Overhaul: Sticky Navigation, 3-Spalten-Raster für Historie und Scoreboard.",
            "QoL: Update-Knopf leuchtet golden auf wenn neue Patch Notes verfügbar sind."
        ]
    },
    { version: "v1.5", title: "New Encounters", changes: ["Neues Feature: Charakter-Entdeckungen (Achievements) – unentdeckte Waifus pulsieren golden."] },
    { version: "v1.4", title: "The Encyclopedia", changes: ["Neues Feature: Lexikon-Tab mit alphabetischer Übersicht aller Waifus."] },
    { version: "v1.3", title: "The Ranking Meta", changes: ["Neues Feature: Scoreboard-Tab – Waifus sammeln Punkte basierend auf Platzierung und Bewertung."] },
    { version: "v1.2", title: "Archive & Memories", changes: ["Globales History-System: Waifu-Rankings werden dauerhaft gespeichert."] },
    { version: "v1.1", title: "Visual Overhaul & Engine Upgrade", changes: ["Farbschema aktualisiert: Sattes Neon-Pink (#ff2a9d)."] },
    { version: "v1.0", title: "Anime Modus Release", changes: ["Neuer Waifu-Modus integriert."] }
];