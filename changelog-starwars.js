export const patchNotesStarWars = [
    {
        version: "v7.5.2",
        title: "Feature Update: Lexikon & UI Cleanup",
        isHotfix: false,
        changes: [
            "Feature: Die Suchleiste im Lexikon durchsucht jetzt auch Fraktionsnamen, nicht nur Charaktere.",
            "Feature: Im Lexikon gibt es nun eine globale Suchleiste (verfügbar in allen Reitern), um gezielt nach Charakteren zu suchen.",
            "Cleanup: Der 'Meme' Modus wurde vollständig aus dem Spiel entfernt. Meme-Charaktere sind nun Teil des regulären 'Expanded Universe'.",
            "UI: Der Tag 'Peak Modus' wurde aus der Fraktionsübersicht im Lexikon entfernt, da er einen eigenen dedizierten Reiter besitzt."
        ]
    },
    {
        version: "v7.5.1",
        title: "Content Update: 25 Neue Geheime Titel",
        isHotfix: false,
        changes: [
            "Content: 25 brandneue geheime Titel wurden hinzugefügt! Diese triggern, wenn bestimmte epische Charakter-Kombinationen (z.B. Rivalen, Fraktionen, Götter) in einer einzigen Ranking-Runde gezogen werden.",
            "Balancing: Die geheimen Titel decken nun auch Schiffe, Klon-Einheiten (wie das Bad Batch), die Mortis-Götter und Sith-Allianzen ab."
        ]
    },
    {
        version: "v7.5",
        title: "Content Update: Massive Charakter-Erweiterung",
        isHotfix: false,
        changes: [
            "Content: Über 20 neue Charaktere aus The Acolyte, Skeleton Crew, The Clone Wars und mehr wurden der Datenbank hinzugefügt (z.B. Qimir, Osha, Jod Na Nawood).",
            "Content: Die legendären Mortis-Götter (Der Vater, Der Sohn, Die Tochter) sowie Darth Malgus und Darth Jar Jar sind nun verfügbar.",
            "Content: Neue Droiden und Spezialeinheiten (z.B. Droideka, Suchdroide, Zwergspinnendroide) ergänzen das Roster.",
            "Balancing: Fehlerhafte Charakter-Einträge korrigiert (z.B. Cameron zu Denal umbenannt, Commander Appo zu Appo korrigiert)."
        ]
    },
    {
        version: "v7.4.1",
        title: "Cardgame Hotfixes",
        isHotfix: true,
        changes: [
            "Hotfix: Doppelte Deklaration der openCardgameResultModal-Funktion in history.js behoben (SyntaxError).",
            "Hotfix: Encoding-Fehler in history.js behoben, der das Laden der Seite verhinderte.",
            "Hotfix: Cardgame-Matches werden nun korrekt nur in der 'Cardgame Matches'-Sektion der Historie angezeigt und nicht mehr im Expanded Universe.",
            "Hotfix: Karten-Scores beziehen sich nun korrekt auf die globale Community-Datenbank statt auf einen Standardwert von 2.5.",
            "Hotfix: Profilbilder, Historien-Modals und alle Schliessen-Buttons zeigen nun ein korrektes X-Symbol statt einem Fragezeichen.",
            "Hotfix: Spielanleitung im Cardgame-Modus von Umlauten bereinigt."
        ]
    },
    {
        version: "v7.4",
        title: "Cardgame Major Update",
        isHotfix: false,
        changes: [
            "Feature: Cardgame-Matches werden jetzt in der Spielhistorie gespeichert und angezeigt (sowohl Bot- als auch Online-Matches).",
            "Feature: Deck-Viewer im Histor-Modal - klicke auf einen Cardgame-Eintrag, um die Decks beider Spieler anzusehen.",
            "Feature: ESC-Taste schliesst alle offenen Modals und Overlays seitenweite.",
            "Feature: Alle Schliessen-Buttons in Modals wurden durch kompakte X-Buttons oben rechts ersetzt.",
            "UI: Deckbuilder-Inventar nutzt jetzt ein 6-Spalten-Raster mit voller Breite und 60vh Hoehe fuer mehr Uebersicht.",
            "UI: Inventar-Karten im Deckbuilder sind groesser (100px statt 70px) und besser lesbar.",
            "UI: Fraktionsboni werden im Deckbuilder und im Spiel jetzt immer als Text angezeigt ('Jedi +20% vs Sith') statt als Symbol.",
            "UI: In-Game Layout umgebaut: gespielte Karten (Du links, Gegner rechts) gross nebeneinander in einem eigenen Panel.",
            "UI: Match-Info-Sidebar ist jetzt immer rechts neben der Hand (sticky), nie darunter.",
            "UI: Gegner-Deck-Tracker in der Sidebar nutzt jetzt ein Grid mit groesseren Karten (55px).",
            "UI: Runden-Ergebnis-Popup komplett neu gestaltet: Score-Balken, farbige Multiplikator-Boxen, grosses Ergebnis-Icon.",
            "Sound: Gewinn- und Verlier-Sounds sind jetzt unterschiedlich (aufsteigendes Dur-Arpeggio vs. abfallendes Moll-Motiv).",
            "Sound: Legendaere und Epische Karten-Fanfares werden beim Aufdecken des Kartenvergleichs abgespielt.",
            "Sound: Karten-Effekte (Holo-Gleam, Legendary-Flicker) werden jetzt beim Oeffnen des Ergebnis-Popups ausgeloest, nicht beim Ausspielen."
        ]
    },
    {
        version: "v7.3.1",
        title: "Bugfixes & Systemstabilität",
        isHotfix: true,
        changes: [
            "Hotfix: Ein kritischer Fehler wurde behoben, der das Abspielen von Sound-Effekten nach einigen Klicks global blockierte.",
            "Hotfix: Das 'Anpassen'-Menü für legendäre Karten speichert nun korrekt das Profil und übernimmt das Design der Karten sofort nach dem Klicken.",
            "Hotfix: Admins und Testaccounts können nun immer die Designs für legendäre Charaktere im 'Anpassen'-Menü wählen, sofern sie die Charaktere im Inventar besitzen.",
            "Update: Beim Login-Feld gibt es nun den Hinweis, dass man sich bei einem vergessenen Passwort an den Admin wenden soll."
        ]
    },
    {
        version: "v7.3",
        title: "Feature & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Neue geheime Titel (Commander, Rex & Cody) wurden hinzugefügt.",
            "Feature: Legendäre Avatar-Customization! Man kann im Profil nun die alternativen Spezial-Bilder von legendären Karten als Avatar ausrüsten.",
            "Feature: Drag & Drop! Album Karten können jetzt direkt in den Showcase-Bereich gezogen werden.",
            "Feature: Das Admin-Panel erlaubt es jetzt, vergessene Passwörter für Spieler neu zu setzen.",
            "Fix: Zwillingssuche! Der Zwillings-Algorithmus wurde komplett überarbeitet und vergleicht nun deine globalen Bewertungen mit allen anderen Spielern für ein faires Ergebnis.",
            "Fix: Meister & Schüler! Im Profil können nun nicht mehr dieselben Spieler für beide Kategorien angezeigt werden.",
            "Fix: Versus Modus Preispool! Bei einem Sieg kriegt der Gewinner nun den kompletten Preispool aus den Einsätzen, ein faires Aufteilen passiert nur noch bei Unentschieden.",
            "Fix: Fahrzeug-Modus! Der Fahrzeug-Modus funktioniert nun wieder reibungslos.",
            "Update: StarWarsdle gewährt nun Credits basierend auf den Versuchen (Unter 5 = 100c, Unter 10 = 50c, Unter 15 = 25c, Danach = 10c).",
            "Update: Limited-Time Booster Packs implementiert. Klon und Machtanwender sind für 2 Wochen günstiger und werden danach zu Legacy Packs für 150 Credits."
        ]
    },
    {
        version: "v7.2.1",
        title: "Onboarding & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Umfassende In-Game Anleitung (Tutorial) für neue Spieler hinzugefügt. (Oben rechts aufrufbar)",
            "Feature: Nach Erreichen des 20-Spiele-Limits (10 Credits) erhält man nun unbegrenzt 5 Credits für jedes weitere Spiel im klassischen Modus.",
            "Content: Neue Fahrzeug-Bilder wurden zur Fahrzeug-Kategorie hinzugefügt.",
            "Fix: Fehler behoben, bei dem die Info zur legendären Set-Belohnung im Shop nicht korrekt initialisiert wurde.",
            "Fix: v7.2 Patchnotes wurden im Changelog-Fenster nicht richtig als aktuellste Version erkannt."
        ]
    },
    {
        version: "v7.2",
        title: "Community & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Spielerprofil anderer Spieler jetzt im eleganten Buch-Layout mit zwei Seiten — links Identität & Aktionen, rechts Statistiken & Showcase.",
            "Feature: Booster-Packs zeigen nun den Sammlungsfortschritt an ('X von Y Charakteren').",
            "Feature: Wer ein komplettes Booster-Pack besitzt, kann einmalig eine zufällige Legendäre Karte aus diesem Pack beanspruchen.",
            "Feature: Beim Kartentausch kann man nun die gewünschte Seltenheit direkt im Vorschau-Bereich auswählen.",
            "Feature: Credits-Limit auf 20 Spiele pro Kategorie erhöht (vorher: 10). Bis zu 200 Credits pro Modus verdienbar.",
            "Feature: Neuer geheimer Titel 'Mandalorianer' — finde ihn in einem Spiel mit Din Djarin, Bo-Katan Kryze und Pre Vizsla.",
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
        title: "Tausch & Versus Wetten Update",
        isHotfix: false,
        changes: [
            "Feature: Versus-Wetten! Platziere vor dem Start eines Versus-Spiels im Warteraum Credits auf den vermuteten Gewinner (maximal 1/10 deines Guthabens).",
            "Auszahlung: Der Gewinner der Wette erhält den gesamten Preispool. Bei mehreren richtigen Wetten wird geteilt, bei falschem Tipp aller Spieler gibt es eine Rückerstattung.",
            "Visualisierung: Detaillierte Wett-Auswertungen direkt im Versus-Ergebnis-Modal und im Archiv der Historie einsehbar.",
            "Fix: Die Sichtbarkeit des Kartentausch-Buttons im Spielerprofil anderer Spieler wurde für Star Wars Modus korrigiert.",
            "QoL: Cache-Busting für Stylesheets und Skripte implementiert, damit alle neuen Features sofort geladen werden."
        ]
    },
    {
        version: "v7.0.7",
        title: "Hotfix: Shop Tracker & Fahrzeuge",
        isHotfix: true,
        changes: [
            "Neues Feature: Im Shop wird nun unter jedem Pack direkt angezeigt, wie oft du diesen spezifischen Pack-Typ bereits geöffnet hast.",
            "Balancing: Fahrzeuge wurden konsequent aus allen Modi verbannt und sind nun ausschließlich im speziellen 'Fahrzeuge'-Modus zu finden.",
            "Hotfix: StarWarsdle nutzt nun wieder den vollständigen Charakterpool inklusive Fahrzeuge."
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
            "Feature: Booster-Packs! Öffne verschiedene Packs (Galaktisches Standard-Pack, Klonkrieger Elite-Pack, Machtanwender-Pack) mit unterschiedlichen Karten-Pools.",
            "Feature: Seltenheitsstufen! Ziehe Karten von Gewöhnlich bis Legendär. Die 5. Karte eines jeden Packs hat eine garantierte Mindest-Seltenheit.",
            "Feature: Profil-Sammelalbum! Betrachte deine gesamte Kollektion, sortiere sie nach Seltenheit, Menge oder Pack und zeige sie anderen Spielern.",
            "Feature: Karten-Showcase! Stelle deine drei wertvollsten Lieblingskarten im Profil (Online-Tab) für die Community zur Schau.",
            "Feature: Atemberaubende Effekte! Epische Karten besitzen glänzende Holo-Effekte. Legendäre Karten flackern golden und spielen beim Auspacken exklusive Sound-Effekte ab (inklusive Artwork-Transformation).",
            "Anpassung: Admin Test-Accounts können nun beliebig viele Packs kostenlos ziehen und erhalten im passenden Pack garantierte Legendäre Karten zum Testen."
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
            "Feature: Neuer täglicher 'StarWarsdle' Modus, um dein Wissen zu testen. Mit täglichem Seed und eigenen Speicherständen.",
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
            "Feature: Klassischer Modus erweitert. Zusätzlich zum Expanded Universe gibt es nun den Peak-Ranking-Modus (nur die 'besten' Charaktere) sowie eine eigene Kategorie für Fahrzeuge.",
            "Feature: Anti-Cheat-Schutz. Ein verstecktes Sicherheitssystem erkennt und filtert auffällige Bewertungsmuster automatisch heraus, um die Integrität des Scoreboards zu schützen.",
            "Feature: Admin-Panel Reset-Buttons. Admins können jetzt gezielt einzelne Spielmodi (Expanded Universe, Peak, Fahrzeuge, Advanced, Versus usw.) zurücksetzen sowie einzelne Spieler aus einem bestimmten Modus entfernen.",
            "Feature: Neue Versus-Lobby – Spieler können aus der Community heraus direkt zum Versus-Duell herausgefordert werden.",
            "Feature: Privater Chat – Spieler können sich gegenseitig private Nachrichten schicken (sichtbar durch Klick auf das Avatar in der Online-Liste).",
            "Feature: Neue Titel & Achievements für besondere Ereignisse im Versus- und Expanded-Universe-Modus.",
            "Balancing: Der klassische Modus (Expanded Universe) bleibt der Standard für alle Bewertungen."
        ]
    },
    {
        version: "v5.0.4",

        title: "Code-Modernisierung & Performance-Update",
        isHotfix: false,
        changes: [
            "Performance: Massive Überarbeitung der gesamten Code-Basis unter der Haube. Alte Schleifenstrukturen wurden durch hochmoderne, schnelle Array-Funktionen (wie map, reduce und find) ausgetauscht.",
            "Performance: Das Laden von Statistiken, Scoreboards und der Chat-Verlauf ist dadurch jetzt noch schneller und ressourcenschonender.",
            "Aufräumarbeit: Zahlreiche alte, ungenutzte Skripte und redundante Code-Abschnitte (wie etwa veraltete Testdateien) wurden restlos gelöscht, um die App schlank zu halten."
        ]
    },
    {
        version: "v5.0.3",
        title: "Chat-Reaktionen & QoL-Features",
        isHotfix: true,
        changes: [
            "Feature: Emoji-Reaktionen im globalen Chat hinzugefügt. Spieler können Nachrichten mit 👍, 😂, ❤️, 😢, und 😡 versehen.",
            "Feature: Administratoren können Reaktionen im Admin-Panel separat löschen (ohne die Nachricht zu entfernen).",
            "Feature: Wochenend-Streak-Modus eingeführt. Am Wochenende (Sa/So) frieren Streaks mit einem Eis-Symbol (❄️) ein (sie verfallen nicht bei Inaktivität, steigen aber auch nicht an).",
            "Feature: StarWarsdle Streaks werden jetzt auch bei Offline-Spielern in der Online-Leiste angezeigt.",
            "Feature: Der Profil-Button zeigt einen kleinen gelben Punkt (🟡), wenn neue Avatare, Titel oder Farbschemen freigeschaltet/entdeckt wurden. Im Profil selbst markiert nun ein Punkt (●) auf dem jeweiligen Tab, in welchem Bereich sich ungesehene Neuerungen befinden, und die neuen Elemente sind mit einem 'NEU'-Badge markiert.",
            "QoL: Der Chat scrollt beim Öffnen jetzt automatisch ganz nach unten zu den neuesten Nachrichten.",
            "QoL: Die drei StarWarsdle Tipps erscheinen nun exakt nach 5, 10 und 15 Fehlversuchen.",
            "QoL: Responsive Neugestaltung der Sticky-Navigationsleiste am oberen Bildschirmrand. Das Layout wechselt bei kleineren Bildschirmen automatisch in einen zweizeiligen Modus und bietet horizontales Scrollen der Tabs, um Überlappungen von Profil, Tabs und Buttons zu verhindern.",
            "QoL: Die Lesbarkeit von Knöpfen und Elementen wurde verbessert: Bei sehr hellen Themen (Klon, Padawan, Droide, Senat, 212th) wird die Textfarbe automatisch dunkel gefärbt.",
            "Sicherheit: Der Bild-Tipp bei StarWarsdle wird nun über ein Canvas-Element gerendert – dadurch ist der Bildpfad in den DevTools nicht mehr sichtbar (Cheat-Schutz). Die Bildunschärfe wurde zudem auf 2px reduziert."
        ]
    },
    {
        version: "v5.0.2",
        title: "QoL & Bugfixes",
        isHotfix: true,
        changes: [
            "Bugfix: StarWarsdle-Fortschritt ist jetzt Account-gebunden. Beim Ausloggen wird der lokale Fortschritt gelöscht, sodass beim Account-Wechsel kein fremder Spielstand sichtbar ist.",
            "Bugfix: Der 'Neues Spiel'-Button ändert nun korrekt seine Hintergrundfarbe passend zum freigeschalteten Farbschema (vorher wurde nur die Schrift eingefärbt).",
            "Bugfix: Rang-Buttons (Plätze 1-5), der Charakter-Rahmen und die '???'-Anzeige im Spiel ändern sich nun komplett ans Farbthema.",
            "Bugfix: Chat-Toggle-Button und Bewertungs-Buttons zeigen jetzt in allen Themen korrekt ihre Farbe.",
            "Feature: Freigeschaltete Titel und Farbthemen erscheinen im Profil jetzt ganz oben, gesperrte dahinter.",
            "Feature: Enter-Taste im StarWarsdle-Eingabefeld löst jetzt den Rateversuch aus.",
            "Balancing: Fino & Ruffy erscheinen häufiger als zuvor (ca. 3x seltener statt 20x seltener als normale Charaktere).",
            "Daten-Fix: Savage Opress hat jetzt die korrekte Epoche (Clone Wars) und Macht-Status.",
            "Daten-Fix: Kategorie 'Mensch (Klon)' zu 'Klon' vereinfacht.",
            "Sicherheit: StarWarsdle-Tipp-Bild kann nicht mehr per Rechtsklick oder Drag &amp; Drop im Originalformat geöffnet werden."
        ]
    },
    {
        version: "v5.0.1",
        title: "Streak-System & Anpassungen",
        isHotfix: true,
        changes: [
            "Neues Feature: Streak-System (🔥) für StarWarsdle! Wenn du täglich spielst, steigt dein Streak. Ein verpasster Tag bricht ihn, aber Pausen am Wochenende (Sa/So) unterbrechen deinen Streak nicht.",
            "UI-Update: Dein aktiver Streak wird nun im Sieges-Bildschirm sowie für alle sichtbar in der Online-Spieler-Liste angezeigt.",
            "UI-Update: Das Farbschema deines Profils überträgt sich ab sofort auch auf deine Chat-Sprechblasen und den Chat-Button.",
            "UI-Update: Die End-Screen Buttons (Neues Spiel, Bewertung) und der Charakter-Rahmen passen sich nun dynamisch deinem freigeschalteten Farbschema an.",
            "Bugfix: Ein Admin-Reset für das StarWarsdle löscht nun auch den lokalen Fortschritt und Streak der Spieler korrekt.",
            "Daten-Fix: Poggle, Nute Gunray und ca. 25 weitere Charaktere wurden korrigiert und haben nun die exakten Spezies (Geonosianer, Neimoidianer, etc.) statt 'Mensch'."
        ]
    },
    {
        version: "v5.0",
        title: "Das STARWARSDLE Update",
        isHotfix: false,
        changes: [
            "Neuer Spielmodus: STARWARSDLE! Errate täglich einen galaktischen Charakter anhand spezifischer Hinweise (Geschlecht, Spezies, Planet, Fraktion, Epoche, Macht).",
            "Tägliche Herausforderung: Jeden Tag um Mitternacht gibt es einen neuen Charakter. Schaffst du es, die Identität vor allen anderen zu lüften?",
            "Visuelle Hinweise: Wie beim klassischen Wordle färben sich die Kästchen grün (exakt), gelb (teilweise) oder rot (falsch), um dir auf die Sprünge zu helfen.",
            "Tipps & Autocomplete: Nach 5 Fehlversuchen werden Charakter-Bilder als Tipp freigeschaltet. Zudem zeigt dir eine intelligente Suchleiste direkt an, welche Charaktere existieren.",
            "Neues Datenbank-Attribut 'Heimatplanet': Alle 191 Charaktere wurden um ihren Heimatplaneten (z.B. Tatooine, Kamino, Geonosis) erweitert.",
            "Scoreboard & Historie: Das Scoreboard wurde erweitert! Du kannst nun die All-Time-Wins sowie die schnellsten Rate-Versuche für das tägliche StarWarsdle einsehen."
        ]
    },
    {
        version: "v4.4.1",
        title: "System & UI Optimierungen",
        isHotfix: true,
        changes: [
            "Bugfix: Fehler behoben, bei dem gesperrte Titel im Community-Bereich fälschlicherweise als freigeschaltet angezeigt wurden.",
            "Bugfix: Die Abklingzeit für gezogene Charaktere (besonders im Klon-Modus) wurde auf echte 5 Runden (25 Ziehungen) ausgeweitet.",
            "Bugfix: Der Klon-Modus nutzt nun strikt seine eigene Ziehungshistorie.",
            "UI-Update: Admin-Panel Layout-Fehler behoben und für mobile Geräte responsiv gemacht.",
            "UI-Update: PC-Optimierungs-Info und Registrierungs-Hinweise zum Login-Bildschirm hinzugefügt."
        ]
    },
    {
        version: "v4.4",
        title: "Das Galaktische Farben Update",
        isHotfix: false,
        changes: [
            "Massive Anpassung: Es wurden über 20 komplett neue, exklusive Farb-Themes (Farbschemas) ins Spiel eingebaut!",
            "Freischalt-Bedingungen: Ranke bestimmte Fraktionen (z.B. 5 Mandalorianer, 5 Jedi Meister oder die Coruscant Wache) in einem einzigen Spiel, um deren einzigartige Farb-Themes für dein Profil freizuschalten.",
            "Neue Effekte: Einige besondere Fraktions-Themes kommen mit exklusiven animierten CSS-Glow-Effekten oder speziellen gestreiften Rändern!"
        ]
    },
    {
        version: "v4.3",
        title: "Geheimnisse der Galaxis Update",
        isHotfix: false,
        changes: [
            "Neue Herausforderung: Es wurden 15 brandneue geheime Titel in das Spiel eingefügt.",
            "Rätselhaft: Wie man diese Titel freischaltet, bleibt streng geheim. Ein kleiner Tipp: Manche berühmten Kombinationen von Verbündeten oder Erzfeinden im selben Spiel könnten etwas auslösen!"
        ]
    },

    {
        version: "v4.2",
        title: "System & Balancing Update",
        isHotfix: false,
        changes: [
            "Neuer Pity-Timer: Wenn du einen Charakter lange nicht ziehst, steigt seine Wahrscheinlichkeit nun sanft um 1% pro verpasster Runde.",
            "Easter Egg Balancing: Die Anime-Charaktere (Ruffy & Fino) sind nun extrem selten (3-mal seltener) und bekommen absichtlich keinen Pity-Bonus.",
            "Zufalls-Cooldown: Das System schließt die letzten 5 gezogenen Charaktere temporär aus, um nervige Dauerschleifen zu verhindern.",
            "Wartungsmodus: Administratoren können ab sofort das Einloggen für Spieler sperren, während Updates aufgespielt werden."
        ]
    },
    {
        version: "v4.1",
        title: "The Expanded Galaxy Part II",
        isHotfix: false,
        changes: [
            "Gigantische Erweiterung: Es wurden dutzende neue Charaktere hinzugefügt! Darunter 10 neue Monster (z.B. Nexu, Zillo Beast), 15 Droiden (z.B. B1 Battle Droide), zahlreiche Senatoren und eine neue Death Watch Fraktion (inkl. Pre Vizsla).",
            "Klon-Erweiterung: Commander Appo, Tup, Hardcase und weitere ARC-Trooper vergrößern die Klon-Datenbank massiv.",
            "Jedi-Erweiterung: Viele neue Meister, Padawane und Inquisitoren sowie Mutter Talzin von Dathomir sind nun im Lexikon zu finden."
        ]
    },
    {
        version: "v4.0",
        title: "Das Lexikon & Tag Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Das Lexikon kann nun nach allen neuen spezifischen Fraktionen (wie Kopfgeldjäger, Death Watch, 501st Legion, etc.) gefiltert werden.",
            "Neues Feature: Direkte Tag-Vorschläge im Lexikon! Klicke auf das Bild eines Charakters, um den Entwicklern ein fehlendes oder falsches Tag zu melden.",
            "Balancing: Nahezu alle alten Charaktere wurden in neue, präzisere Fraktionen einsortiert (z.B. Asajj Ventress ist nun korrekterweise bei Nachtschwestern und Separatisten statt Sith)."
        ]
    },
    {
        version: "v3.7",
        title: "Das Große Lexikon Update",
        isHotfix: false,
        changes: [
            "Massive Charakter-Erweiterung: Dutzende neue Helden, Schurken, Klone und Droiden wurden zum Spiel hinzugefügt! Die Fraktionen wurden ausbalanciert.",
            "Neuer geheimer Titel: Ein brandneuer geheimer Titel ('Weeb') wurde hinzugefügt, den man freischaltet, wenn man die neuen Sonder-Anime-Charaktere in sein Lexikon aufnimmt.",
            "Neues Freischaltungs-System: Wenn du einen neuen Titel oder ein neues Farbschema erhältst, wird dies ab sofort mit einem riesigen Popup und einem klassischen 8-Bit Retro-Sound gefeiert!",
            "Statistik-Fix: Die Wahrscheinlichkeiten für geheime Titel berechnen sich nun wieder zu 100% dynamisch basierend auf der aktuellen Größe der Datenbank."
        ]
    },
    {
        version: "v3.6",
        title: "Das Klon-Modus Update (Extra für Jonas)",
        isHotfix: false,
        changes: [
            "Neuer Spielmodus: 'Nur Klone' hinzugefügt! Teste dein Ranking-Wissen ausschließlich mit Klonsoldaten. Du findest die Auswahl im klassischen Modus.",
            "Isolierter Fortschritt: Der Klon-Modus verfügt über ein komplett eigenes, unabhängiges globales Scoreboard sowie eine eigene Historie, damit er nicht mit den normalen Rankings gemischt wird.",
            "Versus Klon-Lobby: Du kannst nun Lobbys im Versus-Modus erstellen, die nur Klon-Charaktere beinhalten. (Voraussetzung: Du hast mindestens 10 Runden im normalen Klon-Modus absolviert!)",
            "Fortschrittsspeicherung: Auch beim Wechsel zwischen dem normalen Modus und dem Klon-Modus bleibt dein jeweils letzter Fortschritt erhalten."
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
            "Geheimnisse: Ständig auf der Suche nach Herausforderungen? Eine Reihe streng geheimer Titel wurde implementiert, die besondere Charakter-Kombinationen in einer Runde erfordern.",
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
        version: "v2.9.6",
        title: "Public Profiles Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Klicke auf Spieler in der Online-Liste, um deren öffentliches Profil aufzurufen.",
            "Neues Feature: Das Spieler-Profil zeigt den Avatar, aktuellen Titel und alle freigeschalteten Themes und Titel für beide Modi an."
        ]
    },
    {
        version: "v2.9.5",
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
        version: "v2.9.3",
        title: "Hotfix: Progression & UI-Updates",
        isHotfix: true,
        changes: [
            "Hotfix: Das Sith-Theme lässt sich nun wieder korrekt auswählen und färbt das UI rot.",
            "Hotfix: Spieler-Titel werden nun im Online-Bereich zuverlässig bei allen Usern angezeigt.",
            "UI-Update: Panel-Überschriften passen sich nun dynamisch an das aktuell gewählte Farb-Theme an.",
            "Neues Feature: Strengere Discovery-Regeln – Profil-Avatare können erst ausgewählt werden, wenn der Charakter entdeckt wurde.",
            "Neues Feature: Unentdeckte Charaktere bleiben im Lexikon komplett verborgen (als '???').",
            "Neues Feature: Der goldene Leuchteffekt ('✨') im Lexikon verschwindet nun, sobald man ihn das erste Mal betrachtet hat.",
            "Neues Feature: Theme-Freischaltung überarbeitet – Farbschemas erhält man nun, wenn man 5 Charaktere derselben Fraktion (z.B. Sith) in einem einzigen klassischen Spiel zieht (selten!)."
        ]
    },
    {
        version: "v2.9.2",
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
        version: "v2.9",
        title: "The Themes & Factions Update",
        changes: [
            "Neues Feature: Farbschemas – Schalte durch besondere Leistungen exklusive Farbthemen frei: Sith (Rot), Klone (Weiß) und Rebellion (Grün).",
            "Neues Feature: Fraktions-Ansicht im Lexikon – Alle Charaktere sind jetzt mit Tags versehen (Jedi, Sith, Klon, etc.) und lassen sich im Lexikon nach Fraktion gefiltert anzeigen.",
            "Neues Feature: Farbschemas und Titel sind strikt nach Modus getrennt – Star Wars und Anime teilen sich keine Progression.",
            "Neues Feature: Automatische Abmeldung nach 5 Minuten Inaktivität mit Warnung 1 Minute vorher, um Datenbank-Reads durch offene Hintergrundtabs zu reduzieren.",
            "UI-Update: Das Updates-Fenster wurde komplett neu gestaltet mit Icon-basierter Änderungsliste und sauberem Kartendesign.",
            "UI-Update: Admin kann nun Titel und Farbschemas einzelner Spieler gezielt zurücksetzen."
        ]
    },
    {
        version: "v2.9.1",
        title: "Hotfix: Online-Tracker & Logout",
        isHotfix: true,
        changes: [
            "Hotfix: Logout setzt nun sofort ein Offline-Signal in der Datenbank – User verschwinden nicht mehr erst nach 7 Minuten aus der Online-Liste.",
            "Hotfix: Online-Zeitfenster von 7 auf 6 Minuten reduziert, um inaktive User schneller zu entfernen.",
            "Hotfix: Profil-Tabs (Avatare/Titel/Farbschemas) werden jetzt korrekt neu gerendert wenn der Modus gewechselt wird."
        ]
    },
    {
        version: "v2.8",
        title: "The Titles & Progression Update",
        changes: [
            "Neues Feature: Titel-System! Sammle abgeschlossene klassische Spiele und schalte automatisch prestigeträchtige Ränge frei (z.B. Jüngling, Padawan, Jedi-Ritter, Großmeister).",
            "UI-Update: Das Profilmenü wurde komplett modernisiert – drei Tabs (Avatare / Titel / Farbschemas) mit Grid-Ansicht.",
            "Visualisierung: Dein ausgewählter Titel wird für alle sichtbar in der Topbar, in Historien-Einträgen und live im Chat angezeigt."
        ]
    },
    {
        version: "v2.8.1",
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
        version: "v2.7.1",
        title: "Hotfix: Voting & Patch Notes",
        isHotfix: true,
        changes: [
            "Hotfix: Beim Abstimmen leuchten die Haken (✓) nun kräftig grün auf statt grau zu bleiben.",
            "Hotfix: Bilder bei Charakter-Update-Vorschlägen wurden nicht korrekt aus der Datenbank geladen."
        ]
    },
    {
        version: "v2.7",
        title: "The Community & Suggestions Update",
        changes: [
            "Neues Feature: Erweiterter Vorschläge-Tab – gezielt filtern nach 'Features', 'Neuen Charakteren' und 'Charakter-Updates (Name/Bild)'.",
            "Visualisierung: Charakter-Update-Vorschläge werden in einem interaktiven Bilder-Raster präsentiert – ein Klick öffnet die Voting-Details.",
            "Neues Admin-Feature: Community-Ideen mit genug Votes können direkt als Roadmap-Punkte eingetragen werden und erscheinen in-game."
        ]
    },
    {
        version: "v2.6",
        title: "The Performance & Database Overhaul",
        changes: [
            "Performance: Scoreboard berechnet Punkte nun im Hintergrund (1 Read statt hunderte pro Klick).",
            "Performance: Admin-Resets werden 12 Stunden gepuffert, um überflüssige Reads zu vermeiden.",
            "Performance: Online-Status fragt alle 2 Minuten ab statt einer konstanten Echtzeit-Verbindung.",
            "Performance: Lazy Loading – Historie und Scoreboard werden erst geladen, wenn der Tab geöffnet wird."
        ]
    },
    {
        version: "v2.5.1",
        title: "Hotfix: Advanced & History Grid",
        isHotfix: true,
        changes: [
            "Hotfix: Beim Zuschauen eines Advanced-Spiels werden nun alle 10 Slots korrekt dargestellt.",
            "Hotfix: Die 10-Slot-Historienkarten brechen sauber um, ohne horizontalen Scrollbalken."
        ]
    },
    {
        version: "v2.5",
        title: "The Advanced Mode & Joker Update",
        changes: [
            "Neues Feature: Advanced-Modus (10 Slots statt 5) für noch tieferes Ranking.",
            "Neues Feature: Joker-Phase – tausche einmalig zwei Karten per Klick am Ende des Advanced-Modus.",
            "UI-Update: Scoreboard- und Historienkarten unterscheiden zwischen Klassisch (5er) und Advanced (10er).",
            "QoL: Modus-Auswahl direkt im Spiel-Tab."
        ]
    },
    {
        version: "v2.4.1",
        title: "Hotfix: Tracker",
        isHotfix: true,
        changes: [
            "Hotfix: Online-Tracker stabilisiert (Verbindungsprobleme und Anzeigefehler der Spieleranzahl behoben)."
        ]
    },
    {
        version: "v2.4",
        title: "The Instant Speed & QoL Update",
        changes: [
            "Performance: Blitzschnelles Umschalten zwischen Historie und Scoreboard durch RAM-Caching.",
            "Performance: Zirkelbezüge im JavaScript vollständig entkoppelt für absolute Stabilität.",
            "UI-Update: Spielername in der Navigationsleiste deutlich größer und edler dargestellt.",
            "UI-Update: Echte Anzeigenamen (korrekte Groß-/Kleinschreibung) in Historie und Scoreboard-Filter."
        ]
    },
    {
        version: "v2.3",
        title: "The Spectator & Quality of Life Update",
        changes: [
            "Neues Feature: Erscheinungsreihenfolge der Charaktere wird in der Historie angezeigt.",
            "Neues Feature: Beim Live-Zuschauen siehst du den kompletten Charakter-Pool inklusive Status.",
            "Optimierung: Live-Spiele werden nach Abschluss automatisch aus der Datenbank gelöscht.",
            "UI-Update: Scrollbalken in allen Rastern ausgeblendet für ein edleres Interface."
        ]
    },
    {
        version: "v2.2.1",
        title: "Hotfix: Performance & Stabilität",
        isHotfix: true,
        changes: [
            "Hotfix: Globale Scoreboard- und Historien-Resets im Admin Panel korrigiert.",
            "Hotfix: Heartbeat-Interval auf 60 Sekunden erhöht, Online-Anzeige nutzt periodische Abfragen."
        ]
    },
    {
        version: "v2.2",
        title: "The Admin Overhaul Update",
        changes: [
            "Neues Feature: Admin Panel mit Farbindikator (Rot = Aktion möglich, Grün = Clean).",
            "Neues Feature: Resets sind nach Universum getrennt – Star Wars und Anime unabhängig zurücksetzbar.",
            "Neues Feature: Chat-Moderation mit Einzellöschung und 'Alles löschen'.",
            "Neues Feature: Discovery, Historie und Scoreboard per User getrennt zurücksetzbar."
        ]
    },
    {
        version: "v2.1.1",
        title: "Hotfix: Ranking & UI",
        isHotfix: true,
        changes: [
            "Hotfix: Ranken und Bewerten wurde blockiert falls die Cloud-Verbindung kurz hing.",
            "Hotfix: Leere Karten-Slots hatten gestrichelte statt saubere Ränder."
        ]
    },
    {
        version: "v2.1",
        title: "The Expanded Galaxy Update",
        changes: [
            "Inhalts-Erweiterung: 20 neue Charaktere aus dem gesamten Star Wars Universum hinzugefügt.",
            "Vielfalt: Von den Klonkriegen bis zum Outer Rim – neue Legenden für dein Ranking.",
            "Balancing: Alle neuen Charaktere ins Lexikon und Achievement-System integriert."
        ]
    },
    {
        version: "v2.0",
        title: "The Social Hub Update",
        changes: [
            "Neues Feature: Live-Spectating – schau anderen Spielern in Echtzeit beim Ranken zu.",
            "Neues Feature: Globaler Chat als schwebendes Widget.",
            "Neues Feature: Online-Sidebar und überarbeitetes Profil-Overlay.",
            "UI-Overhaul: Sticky Navigation, 3-Spalten-Raster für Historie und Scoreboard.",
            "QoL: Update-Knopf leuchtet golden auf wenn neue Patch Notes verfügbar sind."
        ]
    },
    { version: "v1.9", title: "The Discovery Update", changes: ["Neues Feature: Charakter-Entdeckungen (Achievements) – unentdeckte Charaktere pulsieren golden."] },
    { version: "v1.8", title: "The Archives Expanded", changes: ["Neues Feature: Lexikon-Tab mit alphabetischer Übersicht aller Charaktere."] },
    { version: "v1.7", title: "The Leaderboard Update", changes: ["Neues Feature: Scoreboard-Tab – Charaktere sammeln Punkte basierend auf Platzierung und Bewertung."] },
    { version: "v1.6", title: "The Archive Update", changes: ["Globales History-System: Jedes Spiel wird dauerhaft in der Cloud gespeichert."] },
    { version: "v1.5", title: "The Multiverse Update", changes: ["Backend: Firebase-Datenbank implementiert."] },
    { version: "v1.4", title: "End-Screen & UI Overhaul", changes: ["Visuelles Upgrade für den End-Screen."] },
    { version: "v1.3", title: "The Reveal & Modularisierung", changes: ["Charakternamen werden am Ende enthüllt."] },
    { version: "v1.2", title: "Sci-Fi Blind Ranking", changes: ["Es wird nur ein Charakter gleichzeitig gezeigt."] },
    { version: "v1.1", title: "Star Wars Theme", changes: ["Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum."] },
    { version: "v1.0", title: "Initial Release", changes: ["Grundgerüst des Ranking-Spiels veröffentlicht."] }
];


