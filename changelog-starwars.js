export const patchNotesStarWars = [
    {
        version: "v9.2.2",
        title: "Hotfix: Balancing & Community Vorschläge",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Bug wurde behoben, durch den neu eingereichte Community Vorschläge nicht direkt angezeigt wurden.",
            "Balancing: Das Starter-Deck im Abenteuer-Modus wurde nochmal angepasst und besteht nun aus extrem schwachen Charakteren ohne Synergie (z.B. Pit Droide, Klaud, Watto). Es muss nun zwingend klug gedraftet werden, um zu gewinnen!",
            "Feature: In der Kampagnen-Übersicht haben Level mit aktiven Boss-Regeln nun einen roten [BOSS] Tag. Wenn du mit der Maus darüber gehst, siehst du genau, was der Boss-Effekt macht.",
            "Balancing: Der Unterdrückungs-Effekt (Imperium) des letzten Bosses in Level 20 wurde leicht abgeschwächt (zieht nun 35% statt 50% der Punkte ab)."
        ]
    },
    {
        version: "v9.2.1",
        title: "Hotfix: Abenteuer-Modus Blackscreen",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Bug wurde behoben, durch den nach einer abgeschlossenen Abenteuer-Runde fälschlicherweise ein schwarzer Bildschirm (Blackscreen) angezeigt wurde, anstatt zurück in die Kampagnen-Übersicht zu wechseln."
        ]
    },
    {
        version: "v9.2",
        title: "Update: Abenteuer-Modus Rework (15 Fraktionen)",
        isHotfix: false,
        changes: [
            "Feature: Der Abenteuer-Modus wurde komplett überarbeitet! Alle 20 Level nutzen nun die neuen 15 Fraktionen und bieten eine echte Herausforderung.",
            "Feature: Aktive Boss-Regeln! Die Modifikatoren der Gegner (z.B. Thrawn zieht dir 10% Stats ab, Palpatines Sith zerstören 2 Karten) greifen nun aktiv und fühlbar ins Spielgeschehen ein.",
            "Feature: Das Starter-Deck wurde durch ein neues, schwächeres Set ersetzt, das anfangs keine großen Fraktions-Fähigkeiten triggert. Strategisches Draften ist nun Pflicht!",
            "Feature: Das Rarity Scaling (die Seltenheit der Karten) für die späteren Abenteuer-Level wurde so balanciert, dass Gegner harte Decks spielen, du aber auch extrem starke Karten draften kannst."
        ]
    },
    {
        version: "v9.1",
        title: "Update: Legendäre Karte neu würfeln",
        isHotfix: false,
        changes: [
            "Feature: Neues System im Shop: 'Legendäre neu würfeln'! Opfere 2 Legendäre Karten aus demselben Pack und erhalte eine zufällige neue Legendäre aus diesem Pack – inklusive der vollen Pack-Opening-Animation und Sound!",
            "Feature: Im Neu-Würfeln-Menü wird jede Kopie einer Legendären einzeln angezeigt. Wenn du z.B. 3x Anakin hast, kannst du 2 davon auswählen und opfern.",
            "Feature: Das Ergebnis ist (wenn möglich) immer eine andere Legendäre als die geopferten Karten.",
            "Bugfix: Credits und Kyber Kristalle wurden im Shop manchmal als 0 angezeigt, obwohl man welche besaß. Behoben durch direkten Zugriff auf den frischen Spielstand."
        ]
    },
    {

        version: "v9.0.1",
        title: "Hotfix: Profil-Dot, Online-Klicks & Modus-Anzeige",
        isHotfix: true,
        changes: [
            "Hotfix: Titel-Tab im Profil zeigte falschen gelben Punkt, weil 'Bot-Defeat'-Titel (Tutorial-Siege) nicht korrekt als 'gesperrt' erkannt wurden. Behoben.",
            "Hotfix: Spieler in der Online-Liste konnten nach dem ersten Laden nicht mehr angeklickt werden. Der Event-Listener wurde nun korrekt bei jedem Re-Init neu gebunden.",
            "Feature: Online-Liste zeigt jetzt den aktiven Bereich jedes Spielers als farbiges Badge an (z.B. 🏆 Ranking, 🃏 Cardgame, 🔤 Starwarsdle).",
            "Hotfix: Der Bereich-Status wird nun bei jedem Seitenwechsel direkt in Firestore geschrieben, sodass andere Spieler ihn in Echtzeit sehen koennen."
        ]
    },
    {

        version: "v9.0",
        title: "Update: Massive UI Overhaul & Quality of Life",
        isHotfix: false,
        changes: [
            "UI-Update: Komplettes Redesign des Hauptmenüs! Das alte Seiten-Tab-System wurde durch ein modernes, dynamisches 'Dock'-System (unten am Bildschirmrand) und große zentrierte Spielmodus-Kacheln ersetzt.",
            "Feature: Neues Benachrichtigungssystem! Wichtige Neuerungen (z.B. neue Updates, tägliches Starwarsdle ungelöst, Shop-Aktualisierungen) werden nun mit einem gelben Punkt direkt am Button hervorgehoben.",
            "Feature: Die Home-Buttons passen sich ab sofort fließend an dein aktuell gewähltes Farb-Thema (z.B. Sith-Rot, Rebell-Grün) an.",
            "Bugfix: Der nervige gelbe Punkt am Profilfenster, der nicht mehr verschwinden wollte, wurde behoben. (Neue Karten lösen nun keinen Profil-Dot mehr aus).",
            "Bugfix: Das 'Multi-Fraktions'-Problem bei Karten wie Anakin Skywalker (Jedi + 501st) wurde behoben. Karten aktivieren nun alle passenden Synergien und Effekte gleichzeitig im Cardgame!",
            "Bugfix: Fehler in der Bot-Generierung (Tutorial Fights) gefixt. Der Droiden-Bot und andere Fraktions-Bots bauen nun wieder zu 100% korrekte Themen-Decks."
        ]
    },
    {
        version: "v8.6",
        title: "Update: 7 Neue Fraktionen & 22 Tutorial Fights",
        isHotfix: false,
        changes: [
            "Feature: 7 brandneue Unter-Fraktionen mit einzigartigen Mechaniken hinzugefÃ¼gt: Separatisten, Monster, Schmuggler, Hutten, 501st, 212th und Bad Batch.",
            "Feature: Der alte 'Bot Kampf' wurde komplett durch 22 'Tutorial Fights' ersetzt. Spiele gegen thematische Decks jeder einzelnen Fraktion (von Lvl 1 bis Lvl 22).",
            "Feature: 22 brandneue Titel (z.B. 'Sith Besieger') fÃ¼r den Abschluss der Tutorial Fights hinzugefÃ¼gt (Belohnung: 150 Credits).",
            "UI-Update: Z-Index Bug gefixt, bei dem Card-RÃ¤nge durch die Lexikon-Tooltips durchgeschimmert haben. Tooltips werden am Bildschirmrand nun sauber umgebrochen.",
            "QoL: 'Republik' wurde zur Vermeidung von Verwirrung in der UI und in den Tooltips wieder zu 'Senat' umbenannt."
        ]
    },
    {
        version: "v8.5.1",
        title: "Hotfix: Detaillierte Tooltips & Match-Berechnung",
        isHotfix: true,
        changes: [
            "UI-Update: Die Fraktions-Tooltips erklÃ¤ren nun exakt, wann ein Effekt endet und wie viele Karten man exakt benÃ¶tigt.",
            "UI-Update: Das Ergebnis-Fenster nach einem Duell zeigt nun eine detaillierte und Ã¼bersichtliche AufschlÃ¼sselung der Berechnung (Basiswert + Seltenheits-Multiplikator + Fraktions-Effekte = EndgÃ¼ltiger Score)."
        ]
    },
    {
        version: "v8.5",
        title: "Update: Cardgame Mechaniken Balance-Rework",
        isHotfix: false,
        changes: [
            "Balancing: Instant-Win-Mechaniken (9999 Punkte) wurden aus dem Spiel entfernt, um faire und taktischere Duelle zu gewÃ¤hrleisten.",
            "Feature: Imperium-UnterdrÃ¼ckung eingefÃ¼hrt. Anstelle eines Orbitalschlags zieht das Imperium nach einem Sieg der gegnerischen Karte in der Folgerunde nun 25% vom Score ab.",
            "Feature: Rebellen-Hoffnung eingefÃ¼hrt. Wenn du im Gesamt-Match zurÃ¼ckliegst, verdoppeln deine Rebellen in ihrer Kampfrunde ihren Score als Comeback-Mechanik.",
            "Feature: Jedi-Gedankentrick eingefÃ¼hrt. Das Ausspielen eines Jedi zwingt den Gegner nun dazu, in seiner nÃ¤chsten Runde garantiert seine schwÃ¤chste Karte auszuspielen.",
            "Feature: Widerstand-Opfermut eingefÃ¼hrt. Verliert ein WiderstandskÃ¤mpfer, motiviert er das Team und deine nÃ¤chste Karte erhÃ¤lt sofort +4.0 Punkte Bonus.",
            "Feature: KopfgeldjÃ¤ger angepasst. Besiegst du ein Fraktions-Ziel direkt, erhÃ¤ltst du fÃ¼r diese Runde 2 Match-Punkte anstatt nur 1.",
            "Balancing: Fahrzeuge (Ãœberrollen) triggern ihre Extra-Runde ab sofort nur noch, wenn sie die vorherige Runde aktiv gewonnen haben."
        ]
    },
    {
        version: "v8.4.1",
        title: "Hotfix: UI-Update & Tooltips",
        isHotfix: true,
        changes: [
            "UI-Update: Die Texte fÃ¼r 'Tech-Limits' und 'Synergie-Limits' wurden im Cardgame-Deckbuilder und im Match-Modus durch thematisch passendere Begriffe ('Spezial-EinsatzkrÃ¤fte' und 'Truppen-Formationen') ersetzt.",
            "QoL: Die Tooltips der Fraktionsboni erklÃ¤ren nun die spielerische Bedeutung der Limits deutlich anschaulicher."
        ]
    },
    {
        version: "v8.4",
        title: "MAJOR UPDATE: Cardgame 15-Fraktionen Rework",
        isHotfix: false,
        changes: [
            "Cardgame: Das komplette Cardgame-System wurde grundlegend Ã¼berarbeitet! Statt simplen +20% Fraktionsboni gibt es nun fÃ¼r jede der 15 Fraktionen einzigartige Synergie-Effekte und Thresholds.",
            "Cardgame: Dynamische Match-LÃ¤nge. Ein Spiel endet nun nicht mehr exakt nach 10 Runden, sondern erst dann, wenn beide Spieler keine Karten (und keine Fahrzeuge) mehr spielen kÃ¶nnen.",
            "Feature: 'Max-Limit' Mechaniken. Bestimmte Fraktionen erfordern exakte Anzahlen im Deck, wie Mandalorianer (Silence), Graue Machtnutzer (Lowest Wins) oder Sith (Karten-ZerstÃ¶rung).",
            "Feature: 'Min-Limit' Mechaniken. Andere Fraktionen benÃ¶tigen eine Mindestanzahl im Deck, wie Schurken (Wertetausch), Imperium (Orbitalschlag) oder Jedi (Machtgeister).",
            "Balancing: Der Cardgame-Bot wurde an die neuen Regeln angepasst. Zudem wurden die Score-Anzeigen fÃ¼r Spieler deutlich nachvollziehbarer gestaltet."
        ]
    },
    {
        version: "v8.3.1",
        title: "Hotfix: Online-Scoreboard Anzeige",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Bug wurde behoben, durch den Spieler fÃ¤lschlicherweise fehlerhafte Mode-Tags im Online-Scoreboard angezeigt bekamen."
        ]
    },
    {
        version: "v8.3.0",
        title: "Update: Codebase Refactoring & Cleanup",
        isHotfix: false,
        changes: [
            "Optimierung: Die gesamte Projektstruktur wurde aufgerÃ¤umt. Es wurden Ã¼ber 500 KB an Dateileichen und veralteten Skripten entfernt, was die Ladezeit der Anwendung verbessert.",
            "Performance: UI-Komponenten werden nun teilweise zentral Ã¼ber eine Komponenten-Logik geladen, um Code-Duplikate zu vermeiden.",
            "Wichtig: Aufgrund der Vanilla-JS-Architektur ohne Bundler wurden tiefergreifende Logik-Splits zurÃ¼ckgehalten, um die SpeicherstÃ¤nde und Live-Matches nicht zu gefÃ¤hrden."
        ]
    },
    {
        version: "v8.2.2",
        title: "Performance & Datenbank-Optimierung",
        isHotfix: false,
        changes: [
            "Optimierung: Die Datenbank-Zugriffe (Reads) wurden im gesamten Spiel um bis zu 70% reduziert.",
            "Performance: Hintergrund-Listener (Live-Modus & Historie) werden nun pausiert, wenn man den jeweiligen Tab verlÃ¤sst.",
            "Performance: Das Scoreboard und die Spielerlisten laden wesentlich effizienter und schonen das Datenvolumen extrem."
        ]
    },
    {
        version: "v8.2.1",
        title: "Hotfix: Historie Limit, Cardgame Sorting & Tab Bug",
        isHotfix: true,
        changes: [
            "Hotfix: Das History-Limit wurde wie gewÃ¼nscht auf 24 zurÃ¼ckgesetzt, um Datenvolumen zu sparen.",
            "Feature: Im Cardgame-Deckbuilder kann man die Karten jetzt nach 'Wertung' sortieren.",
            "Bugfix: Ein Fehler wurde behoben, bei dem sich Tabs Ã¼bereinander gelegt haben (z.B. Adventure Mode Ã¼ber Cardgame), weil alte Tabs beim Wechseln nicht immer korrekt ausgeblendet wurden."
        ]
    },
    {
        version: "v8.1",
        title: "Entwicklungs-Pause & Stabilisierung",
        isHotfix: false,
        changes: [
            "Info: In den nÃ¤chsten 5 Tagen werden keine neuen groÃŸen Features oder Inhalts-Updates mehr kommen.",
            "Wichtig: Wir lassen das Spiel jetzt erstmal in Ruhe, damit ihr den neuen Abenteuer-Modus ungestÃ¶rt spielen kÃ¶nnt. Lediglich super wichtige Bug-Fixes werden bei Bedarf noch eingespielt."
        ]
    },
    {
        version: "v8.0.1",
        title: "Hotfix: Abenteuer-Modus",
        isHotfix: true,
        changes: [
            "Hotfix: Behebt einen Fehler, durch den der Abenteuer-Modus wegen einer falschen Datei-VerknÃ¼pfung (stats.js statt tracker.js) nicht geladen werden konnte."
        ]
    },
    {
        version: "v8.0",
        title: "MAJOR UPDATE: Abenteuer-Modus (Kampagne)",
        isHotfix: false,
        changes: [
            "NEUER MODUS: Der Abenteuer-Modus ist da! KÃ¤mpfe dich durch eine 20-Level lange Kampagne (Original Trilogie).",
            "Deck-Building: Starte mit einem 10-Karten-Basis-Deck und tausche nach jedem Sieg eine Karte gegen eine Karte deines besiegten Gegners aus.",
            "Rogue-like: Wenn du verlierst, startest du wieder komplett von vorn bei Level 1!",
            "Belohnungen: Jeder Sieg bringt 5 Credits, Meilensteine bei Level 10 und 20 bringen 50 und 100 Credits (beim ersten Mal).",
            "Boss-Mechaniken: Jeder Gegner hat spezielle Modifikatoren (z.B. Rancor hat +100% StÃ¤rke, Imperium blockt Schaden)."
        ]
    },
    {
        version: "v7.9.7",
        title: "QoL: Geheime Titel aufdecken",
        isHotfix: false,
        changes: [
            "QoL: Wenn man einen geheimen Titel freigeschaltet hat, wird beim Hovern nun nicht mehr nur 'geheime Charaktere' angezeigt, sondern exakt aufgelistet, welche Charaktere (oder Kombinationen) man dafÃ¼r benÃ¶tigt hat."
        ]
    },
    {
        version: "v7.9.6",
        title: "QoL: Hover-Details fÃ¼r Titel & Themes",
        isHotfix: false,
        changes: [
            "QoL: Wenn man im Profil Ã¼ber bereits freigeschaltete Titel oder Farb-Themes mit der Maus fÃ¤hrt (hover), wird nun in einem Tooltip angezeigt, welche Bedingung ursprÃ¼nglich erfÃ¼llt werden musste, um sie freizuschalten."
        ]
    },
    {
        version: "v7.9.5",
        title: "Hotfix: Cardgame Bot Duplikate",
        isHotfix: true,
        changes: [
            "Hotfix: Ein Problem wurde behoben, bei dem Bots durch das AuffÃ¼llen mit legendÃ¤ren Karten versehentlich mehrmals denselben Charakter in ihr Deck aufnehmen konnten. Bot-Decks bestehen nun immer aus 10 einzigartigen Karten."
        ]
    },
    {
        version: "v7.9.4",
        title: "Update: Echte Cardgame Legendaries fÃ¼r Bots",
        isHotfix: false,
        changes: [
            "Feature: Bots kÃ¶nnen nun keine 'Fake-Legendaries' mehr generieren. Wenn ein Bot eine legendÃ¤re Karte in sein Deck wÃ¤hlt, greift er nun ausschlieÃŸlich auf den Pool echter legendÃ¤rer Charaktere zurÃ¼ck.",
            "QoL: LegendÃ¤re Animationen, Sounds und die 5-sekÃ¼ndige Wartezeit beim Aufdecken treten nun nur noch auf, wenn ein echter Spieler die Karte ausspielt. Bots spielen legendÃ¤re Karten ab sofort ohne VerzÃ¶gerung und groÃŸe Effekte."
        ]
    },
    {
        version: "v7.9.3",
        title: "Update: Cardgame Bot Intelligenz",
        isHotfix: false,
        changes: [
            "Feature: Die KI-Logik fÃ¼r Cardgame Bots wurde massiv Ã¼berarbeitet. Die Bots werfen nun nicht mehr einfach zufÃ¤llig Karten ab.",
            "Balancing: Die Intelligenz skaliert jetzt exakt mit der Stufe des Bots. Niedrige Bots spielen noch fehlerhaft und zufÃ¤llig. HÃ¶here Bots (Stufe 7+) kontern die ZÃ¼ge des Spielers taktisch perfekt aus und opfern bei garantierten Niederlagen gezielt ihre schwÃ¤chsten Karten."
        ]
    },
    {
        version: "v7.9.2",
        title: "Hotfix: Cardgame Bot Titel",
        isHotfix: true,
        changes: [
            "Hotfix: Es wurde ein Fehler behoben, bei dem die 10 geheimen Cardgame-Titel fÃ¤lschlicherweise durch das Spielen im 'Expanded Universe' freigeschaltet wurden.",
            "Sanitization: FÃ¤lschlicherweise erhaltene Bot-Titel wurden aus den Profilen der betroffenen Spieler entfernt."
        ]
    },
    {
        version: "v7.9.1",
        title: "Hotfix: Daily Reset",
        isHotfix: true,
        changes: [
            "Hotfix: Der Daily Reset fÃ¼r gespielte Runden im klassischen Modus wurde repariert. TÃ¤gliche Credits-Limits (20 Runden pro Tag) setzen sich nun um Mitternacht wieder korrekt zurÃ¼ck."
        ]
    },
    {
        version: "v7.9",
        title: "Hotfix: Booster Packs & Animationen",
        isHotfix: true,
        changes: [
            "Hotfix: Ein kritischer Fehler wurde behoben, durch den Karten aus Booster-Packs nicht im Inventar gespeichert wurden, wenn eine ungÃ¼ltige Variablenreferenz ausgelÃ¶st wurde.",
            "Hotfix: Die Logik fÃ¼r das 'VervollstÃ¤ndigen' eines Packs wurde stark verbessert. Gecraftete oder hochgestufte Karten zÃ¤hlen nun immer zu 100% als gesammelt fÃ¼r das jeweilige Pack. Dadurch kann die Legenden-Belohnung nicht mehr blockiert werden."
        ]
    },
    {
        version: "v7.8",
        title: "Update: Gacha Quality of Life & Admin Tools",
        isHotfix: false,
        changes: [
            "Hotfix: Das Filter-Verhalten im Album wurde verbessert. Gecraftete oder geupgradete Karten sind nun auch in den spezifischen Pack-Filtern korrekt sichtbar.",
            "Feature: Admin-Tool fÃ¼r den Test-Account 'test1' hinzugefÃ¼gt (Zieht ab sofort garantiert 4 epische und 1 legendÃ¤re Karte aus Boosterpacks).",
            "Hotfix: Die Ingame-Anleitung wurde aktualisiert und beinhaltet nun alle neuen Gacha-Mechaniken.",
            "Feature: Das Beanspruchen einer legendÃ¤ren Karte fÃ¼r ein abgeschlossenes Booster-Pack lÃ¶st nun eine spannende Pack-Ã–ffnungs-Animation aus!"
        ]
    },
    {
        version: "v7.7",
        title: "Update: Gacha Overhaul, Crafting & Trade-Up",
        isHotfix: false,
        changes: [
            "Feature: Gacha Trade-Up System eingefÃ¼hrt! Im Album kÃ¶nnen nun 5 GewÃ¶hnliche Karten zu 1 Seltenen, und 5 Seltene Karten zu 1 Epischen Karte kombiniert werden.",
            "Feature: Kyber Kristalle hinzugefÃ¼gt! Werden Duplikate von epischen Karten gezogen oder gecraftet, werden diese automatisch in 20 Kyber Kristalle umgewandelt.",
            "Feature: Crafting-Shop integriert! Im Shop kÃ¶nnen nun fÃ¼r 100 Kyber Kristalle gezielt Wunsch-Karten auf epischer Stufe hergestellt werden.",
            "Feature: Im Sammelalbum werden fehlende Karten aus spezifischen Booster-Packs nun transparent als ausgegraute 'Fehlt'-Karten angezeigt.",
            "Hotfix: Filter-Verhalten im Album optimiert, um leere Slots und Duplikate sauberer zu trennen."
        ]
    },
    {
        version: "v7.6",
        title: "Update: Cardgame Overhaul & UI Features",
        isHotfix: false,
        changes: [
            "Feature: Das Cardgame unterstÃ¼tzt nun echtes synchrones Live-PvP! Ãœber die neue 'Lobby erstellen'-Funktion kÃ¶nnen Spieler nun in Echtzeit online gegeneinander antreten.",
            "Feature: Das Bot-System im Cardgame wurde komplett neu programmiert. Es gibt nun 10 verschiedene, ansteigende Schwierigkeitsstufen (von Trainingsdroide bis Yoda).",
            "Feature: HÃ¶herstufige Bots generieren nun dynamisch Decks basierend auf Community-Beliebtheit (Ranking) und Fraktions-Synergien, statt nur zufÃ¤llige Karten zu ziehen.",
            "Feature: Bot-Belohnungssystem implementiert: Der erste Sieg gegen jede der 10 Bot-Stufen belohnt den Spieler nun mit Credits (gestaffelt von 5 bis 500 Credits).",
            "Feature: 10 neue geheime Titel fÃ¼r das Besiegen der Bots hinzugefÃ¼gt, welche im Profil (mit Schloss-Symbol) sichtbar sind, um den Fortschritt zu tracken.",
            "Feature: Im Deckbuilder wird nun fÃ¼r jede Karte der aktuelle Global-Score (Basiswert) als kleines goldenes Badge in der Ecke angezeigt.",
            "Feature: Im Cardgame-Match (Live/Bot) verschwinden gespielte Karten nicht mehr komplett aus der Hand, sondern bleiben als 'ausgegraut' sichtbar, analog zur Anzeige des Gegners.",
            "Feature: Das Scoreboard hat nun eine Live-Suchleiste (wie das Lexikon), um in der aktuellen Liste blitzschnell nach Charakteren zu suchen, ohne dass das Spiel laggt.",
            "Feature: Ab sofort flieÃŸen auch die Ergebnisse aller anderen 5er-Modi (Klon-Modus, Fahrzeuge, Peak, Hardcore Peak) automatisch in das Overall Scoreboard mit ein.",
            "Feature: Wrecker, Hunter, Tech und Luke Skywalker haben nun ebenfalls ihre eigenen Zitate im Hardcore Modus.",
            "Feature: Im Hardcore Modus werden die Zitate der Charaktere nun auch nach dem Aufdecken auf dem End-Screen unter dem Charakter-Namen angezeigt.",
            "Hotfix: Behebung eines Fehlers in der Cardgame-Scoreberechnung, durch den Bots ohne Seltenheits-Tags gespielt haben und somit das Match abstÃ¼rzen lieÃŸen.",
            "Hotfix: Cardgame-Bots ignorieren nicht lÃ¤nger das Beliebtheits-Ranking und bauen nun wieder konforme Decks.",
            "Hotfix: Machtverirrung und neue Cardgame-Basiswerte wurden auf das neue Punkte-basierte Scoreboard angepasst, wodurch neue Karten nicht lÃ¤nger unspielbar schlecht sind.",
            "Hotfix: Behebung eines Fehlers im Live-PvP, durch den man eine gespielte Karte theoretisch unendlich oft hintereinander spielen konnte (Objekt-Referenz-Fix).",
            "UI: Bot-UI aktualisiert: Sobald ein Bot besiegt wurde, verschwindet die 'Erster Sieg' Credit-Anzeige und wird durch einen grÃ¼nen Haken ersetzt.",
            "UI: Der Standard-Modus im Scoreboard wurde von 'Expanded Universe' zu 'Overall Scoreboard (Basis-Werte)' umbenannt, um klarzumachen, dass dies das Master-Ranking fÃ¼r alle Berechnungen ist."
        ]
    },
    {
        version: "v7.5.4",
        title: "Hotfix: LegendÃ¤re Effekte im Cardgame",
        isHotfix: true,
        changes: [
            "Hotfix: Wenn eine LegendÃ¤re Karte im Cardgame gespielt wird, ertÃ¶nt nun der charakterspezifische epische Sound statt der Standard-Fanfare.",
            "Hotfix: Das Spielfeld zeigt nun das alternative Artwork der legendÃ¤ren Karte inklusive dem goldenen Leucht-Effekt an.",
            "Hotfix: Das Runden-Ergebnis-Popup (Sieg/Niederlage) wird bei LegendÃ¤ren Karten um 5 Sekunden verzÃ¶gert, damit die epischen Animationen und Sounds ungestÃ¶rt wirken kÃ¶nnen."
        ]
    },
    {
        version: "v7.5.3",
        title: "Feature Update: Shop & LegendÃ¤re Klonkrieger",
        isHotfix: false,
        changes: [
            "Feature: Neuer dynamischer Hover-Tooltip im Shop! Wenn man Ã¼ber die LegendÃ¤r-Zeile eines Booster-Packs fÃ¤hrt, erscheint nun ein visuelles Info-Fenster, das exakt anzeigt, welche Charaktere in diesem Pack eine legendÃ¤re Karte besitzen.",
            "Content: 10 neue LegendÃ¤re Karten wurden in das Spiel integriert (inkl. individuelle epische Sounds & Animationen)!",
            "Balancing: Das 'Machtanwender Pack' kann nun legendÃ¤re Versionen von Obi-Wan Kenobi, General Grievous, Darth Maul und Ahsoka Tano droppen.",
            "Balancing: Das 'Klonkrieger Elite-Pack' wurde massiv aufgewertet und kann nun ebenfalls legendÃ¤re Karten droppen (Captain Rex, Commander Cody, Wolffe, Crosshair, Hunter und Wrecker)."
        ]
    },
    {
        version: "v7.5.2",
        title: "Feature Update: Lexikon & UI Cleanup",
        isHotfix: false,
        changes: [
            "Feature: Die Suchleiste im Lexikon durchsucht jetzt auch Fraktionsnamen, nicht nur Charaktere.",
            "Feature: Im Lexikon gibt es nun eine globale Suchleiste (verfÃ¼gbar in allen Reitern), um gezielt nach Charakteren zu suchen.",
            "Cleanup: Der 'Meme' Modus wurde vollstÃ¤ndig aus dem Spiel entfernt. Meme-Charaktere sind nun Teil des regulÃ¤ren 'Expanded Universe'.",
            "UI: Der Tag 'Peak Modus' wurde aus der FraktionsÃ¼bersicht im Lexikon entfernt, da er einen eigenen dedizierten Reiter besitzt."
        ]
    },
    {
        version: "v7.5.1",
        title: "Content Update: 25 Neue Geheime Titel",
        isHotfix: false,
        changes: [
            "Content: 25 brandneue geheime Titel wurden hinzugefÃ¼gt! Diese triggern, wenn bestimmte epische Charakter-Kombinationen (z.B. Rivalen, Fraktionen, GÃ¶tter) in einer einzigen Ranking-Runde gezogen werden.",
            "Balancing: Die geheimen Titel decken nun auch Schiffe, Klon-Einheiten (wie das Bad Batch), die Mortis-GÃ¶tter und Sith-Allianzen ab."
        ]
    },
    {
        version: "v7.5",
        title: "Content Update: Massive Charakter-Erweiterung",
        isHotfix: false,
        changes: [
            "Content: Ãœber 20 neue Charaktere aus The Acolyte, Skeleton Crew, The Clone Wars und mehr wurden der Datenbank hinzugefÃ¼gt (z.B. Qimir, Osha, Jod Na Nawood).",
            "Content: Die legendÃ¤ren Mortis-GÃ¶tter (Der Vater, Der Sohn, Die Tochter) sowie Darth Malgus und Darth Jar Jar sind nun verfÃ¼gbar.",
            "Content: Neue Droiden und Spezialeinheiten (z.B. Droideka, Suchdroide, Zwergspinnendroide) ergÃ¤nzen das Roster.",
            "Balancing: Fehlerhafte Charakter-EintrÃ¤ge korrigiert (z.B. Cameron zu Denal umbenannt, Commander Appo zu Appo korrigiert)."
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
        title: "Bugfixes & SystemstabilitÃ¤t",
        isHotfix: true,
        changes: [
            "Hotfix: Ein kritischer Fehler wurde behoben, der das Abspielen von Sound-Effekten nach einigen Klicks global blockierte.",
            "Hotfix: Das 'Anpassen'-MenÃ¼ fÃ¼r legendÃ¤re Karten speichert nun korrekt das Profil und Ã¼bernimmt das Design der Karten sofort nach dem Klicken.",
            "Hotfix: Admins und Testaccounts kÃ¶nnen nun immer die Designs fÃ¼r legendÃ¤re Charaktere im 'Anpassen'-MenÃ¼ wÃ¤hlen, sofern sie die Charaktere im Inventar besitzen.",
            "Update: Beim Login-Feld gibt es nun den Hinweis, dass man sich bei einem vergessenen Passwort an den Admin wenden soll."
        ]
    },
    {
        version: "v7.3",
        title: "Feature & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Neue geheime Titel (Commander, Rex & Cody) wurden hinzugefÃ¼gt.",
            "Feature: LegendÃ¤re Avatar-Customization! Man kann im Profil nun die alternativen Spezial-Bilder von legendÃ¤ren Karten als Avatar ausrÃ¼sten.",
            "Feature: Drag & Drop! Album Karten kÃ¶nnen jetzt direkt in den Showcase-Bereich gezogen werden.",
            "Feature: Das Admin-Panel erlaubt es jetzt, vergessene PasswÃ¶rter fÃ¼r Spieler neu zu setzen.",
            "Fix: Zwillingssuche! Der Zwillings-Algorithmus wurde komplett Ã¼berarbeitet und vergleicht nun deine globalen Bewertungen mit allen anderen Spielern fÃ¼r ein faires Ergebnis.",
            "Fix: Meister & SchÃ¼ler! Im Profil kÃ¶nnen nun nicht mehr dieselben Spieler fÃ¼r beide Kategorien angezeigt werden.",
            "Fix: Versus Modus Preispool! Bei einem Sieg kriegt der Gewinner nun den kompletten Preispool aus den EinsÃ¤tzen, ein faires Aufteilen passiert nur noch bei Unentschieden.",
            "Fix: Fahrzeug-Modus! Der Fahrzeug-Modus funktioniert nun wieder reibungslos.",
            "Update: StarWarsdle gewÃ¤hrt nun Credits basierend auf den Versuchen (Unter 5 = 100c, Unter 10 = 50c, Unter 15 = 25c, Danach = 10c).",
            "Update: Limited-Time Booster Packs implementiert. Klon und Machtanwender sind fÃ¼r 2 Wochen gÃ¼nstiger und werden danach zu Legacy Packs fÃ¼r 150 Credits."
        ]
    },
    {
        version: "v7.2.1",
        title: "Onboarding & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Umfassende In-Game Anleitung (Tutorial) fÃ¼r neue Spieler hinzugefÃ¼gt. (Oben rechts aufrufbar)",
            "Feature: Nach Erreichen des 20-Spiele-Limits (10 Credits) erhÃ¤lt man nun unbegrenzt 5 Credits fÃ¼r jedes weitere Spiel im klassischen Modus.",
            "Content: Neue Fahrzeug-Bilder wurden zur Fahrzeug-Kategorie hinzugefÃ¼gt.",
            "Fix: Fehler behoben, bei dem die Info zur legendÃ¤ren Set-Belohnung im Shop nicht korrekt initialisiert wurde.",
            "Fix: v7.2 Patchnotes wurden im Changelog-Fenster nicht richtig als aktuellste Version erkannt."
        ]
    },
    {
        version: "v7.2",
        title: "Community & Progression Update",
        isHotfix: false,
        changes: [
            "Feature: Spielerprofil anderer Spieler jetzt im eleganten Buch-Layout mit zwei Seiten â€” links IdentitÃ¤t & Aktionen, rechts Statistiken & Showcase.",
            "Feature: Booster-Packs zeigen nun den Sammlungsfortschritt an ('X von Y Charakteren').",
            "Feature: Wer ein komplettes Booster-Pack besitzt, kann einmalig eine zufÃ¤llige LegendÃ¤re Karte aus diesem Pack beanspruchen.",
            "Feature: Beim Kartentausch kann man nun die gewÃ¼nschte Seltenheit direkt im Vorschau-Bereich auswÃ¤hlen.",
            "Feature: Credits-Limit auf 20 Spiele pro Kategorie erhÃ¶ht (vorher: 10). Bis zu 200 Credits pro Modus verdienbar.",
            "Feature: Neuer geheimer Titel 'Mandalorianer' â€” finde ihn in einem Spiel mit Din Djarin, Bo-Katan Kryze und Pre Vizsla.",
            "Feature: Korrekturen/VorschlÃ¤ge: Charaktere kÃ¶nnen nun nach Namen durchsucht werden.",
            "Fix: Nach einer Versus-Runde wird der Wett-Status zurÃ¼ckgesetzt, sodass in der nÃ¤chsten Runde neu gewettet werden kann.",
            "QoL: Das eigene Profil-Panel ist jetzt breiter, um alle Features ohne Ãœberlappungen darzustellen."
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
            "StabilitÃ¤t: ErhÃ¶hte Robustheit bei unvollstÃ¤ndigen Tipps und Schutz vor blockierten Auswertungs-Lobbies.",
            "QoL: Virtuelle Credits fÃ¼r Test- und Admin-Accounts zur direkten Wett-Simulation im Warteraum."
        ]
    },
    {
        version: "v7.1",
        title: "Tausch & Versus Wetten Update",
        isHotfix: false,
        changes: [
            "Feature: Versus-Wetten! Platziere vor dem Start eines Versus-Spiels im Warteraum Credits auf den vermuteten Gewinner (maximal 1/10 deines Guthabens).",
            "Auszahlung: Der Gewinner der Wette erhÃ¤lt den gesamten Preispool. Bei mehreren richtigen Wetten wird geteilt, bei falschem Tipp aller Spieler gibt es eine RÃ¼ckerstattung.",
            "Visualisierung: Detaillierte Wett-Auswertungen direkt im Versus-Ergebnis-Modal und im Archiv der Historie einsehbar.",
            "Fix: Die Sichtbarkeit des Kartentausch-Buttons im Spielerprofil anderer Spieler wurde fÃ¼r Star Wars Modus korrigiert.",
            "QoL: Cache-Busting fÃ¼r Stylesheets und Skripte implementiert, damit alle neuen Features sofort geladen werden."
        ]
    },
    {
        version: "v7.0.7",
        title: "Hotfix: Shop Tracker & Fahrzeuge",
        isHotfix: true,
        changes: [
            "Neues Feature: Im Shop wird nun unter jedem Pack direkt angezeigt, wie oft du diesen spezifischen Pack-Typ bereits geÃ¶ffnet hast.",
            "Balancing: Fahrzeuge wurden konsequent aus allen Modi verbannt und sind nun ausschlieÃŸlich im speziellen 'Fahrzeuge'-Modus zu finden.",
            "Hotfix: StarWarsdle nutzt nun wieder den vollstÃ¤ndigen Charakterpool inklusive Fahrzeuge."
        ]
    },
    {
        version: "v7.0.6",
        title: "Hotfix: Versus Perfektion & PrÃ¤ferenzen",
        isHotfix: true,
        changes: [
            "Neues Feature: 'Perfektion' (Versus-Achievement). Verdiene dir den exklusiven Titel, indem du absolut keine Abweichung hast (Score: 0).",
            "QoL: Das Spiel merkt sich nun Ã¼ber alle Sessions hinweg, welches Universum, welchen Modus und welche Kategorie du als Letztes gespielt hast."
        ]
    },
    {
        version: "v7.0.5",
        title: "Hotfix: UI & Wartungsmodus",
        isHotfix: true,
        changes: [
            "UI-Update: Das Spielerprofil wurde fÃ¼r Desktop-Nutzer auf ein elegantes horizontales Layout umgebaut.",
            "Feature: Neuer gezielter Admin-Wartungsmodus fÃ¼r einzelne Modi oder spezifische Kategorien."
        ]
    },
    {
        version: "v7.0.4",
        title: "Hotfix: Anti-Cheat & Shop-Visuals",
        isHotfix: true,
        changes: [
            "Anti-Cheat & IntegritÃ¤t: Ein Seiten-Reload im aktiven Spiel bricht das Spiel nicht mehr ab. Man muss das Ranking zwingend beenden.",
            "Visualisierung: Wenn du beim Booster-Kauf nicht genug Credits hast, erhÃ¤ltst du nun eine rote Benachrichtigung anstatt eines Alerts.",
            "Hotfix: Neue Spieler oder Resets werden ab sofort ohne VerzÃ¶gerung direkt beim Aufruf des Scoreboards angezeigt."
        ]
    },
    {
        version: "v7.0",
        title: "GACHA & SAMMELALBUM UPDATE",
        isHotfix: false,
        changes: [
            "Feature: Gacha-System! Verdiene Credits im klassischen Modus (bis zu 10x pro Kategorie) und kaufe damit Booster-Packs im neuen Shop.",
            "Feature: Booster-Packs! Ã–ffne verschiedene Packs (Galaktisches Standard-Pack, Klonkrieger Elite-Pack, Machtanwender-Pack) mit unterschiedlichen Karten-Pools.",
            "Feature: Seltenheitsstufen! Ziehe Karten von GewÃ¶hnlich bis LegendÃ¤r. Die 5. Karte eines jeden Packs hat eine garantierte Mindest-Seltenheit.",
            "Feature: Profil-Sammelalbum! Betrachte deine gesamte Kollektion, sortiere sie nach Seltenheit, Menge oder Pack und zeige sie anderen Spielern.",
            "Feature: Karten-Showcase! Stelle deine drei wertvollsten Lieblingskarten im Profil (Online-Tab) fÃ¼r die Community zur Schau.",
            "Feature: Atemberaubende Effekte! Epische Karten besitzen glÃ¤nzende Holo-Effekte. LegendÃ¤re Karten flackern golden und spielen beim Auspacken exklusive Sound-Effekte ab (inklusive Artwork-Transformation).",
            "Anpassung: Admin Test-Accounts kÃ¶nnen nun beliebig viele Packs kostenlos ziehen und erhalten im passenden Pack garantierte LegendÃ¤re Karten zum Testen."
        ]
    },
    {
        version: "v6.4",
        title: "WICHTIGE ANKÃœNDIGUNG",
        isHotfix: false,
        changes: [
            "<div style='font-size: 1.2rem; font-weight: bold; color: #ff4757; text-align: center; margin: 15px 0; line-height: 1.4; text-transform: uppercase;'>Alle Scoreboards mussten aufgrund der vielen neuen Features zurÃ¼ckgesetzt werden!</div>"
        ]
    },
    {
        version: "v6.3.1",
        title: "Hotfix: Analytics & Profil",
        isHotfix: true,
        changes: [
            "Hotfix: Der TrophÃ¤enschrank im Online-Tab aktualisiert sich nun sofort live in den Spieler-Visitenkarten ohne Neuladen.",
            "Hotfix: Das automatische Speichern der Tier-List funktioniert nun absolut zuverlÃ¤ssig (und Ã¼berspringt leere Bilder ohne Absturz).",
            "Hotfix: Komplexe Analytics (Machtverirrung und Tier-List) binden nun verlÃ¤sslich all deine historischen SpielstÃ¤nde aus alten Datenbanken mit ein und sichern fehlende Community-Rankings elegant ab."
        ]
    },
    {
        version: "v6.3",
        title: "Analytics & Showcase Update",
        isHotfix: false,
        changes: [
            "Feature: Tiefergehende Statistiken (Personal Analytics). Ein Button in deinem Profil generiert ab sofort vollautomatisch eine persÃ¶nliche Tier-List aus all deinen Spielen.",
            "Feature: Dynamische Tier-List-Generierung. Deine bewerteten Charaktere werden differenziert in Tiers von S bis F eingeordnet. Die generierte Grafik kann mit einem Klick gespeichert werden.",
            "Feature: Die neue 'Machtverirrung'-Statistik analysiert, bei welchem Charakter du am extremsten vom globalen Community-Durchschnitt abweichst.",
            "Feature: Versus-RivalitÃ¤ten & Match-History. Dein Profil zeigt jetzt deinen 'Meister' (gegen den du am Ã¶ftesten verloren hast) und deinen 'SchÃ¼ler' (gegen den du am meisten gewonnen hast) an.",
            "Feature: TrophÃ¤enschrank (Showcase). In deinem Profil gibt es nun 3 Slots, in denen du stolz deine hart verdienten Titel und seltensten Themes ausstellen kannst. Diese sind auch im Online-Tab fÃ¼r die Community sichtbar."
        ]
    },
    {
        version: "v6.2",
        title: "Gamification Update",
        isHotfix: false,
        changes: [
            "Feature: Neuer tÃ¤glicher 'StarWarsdle' Modus, um dein Wissen zu testen. Mit tÃ¤glichem Seed und eigenen SpeicherstÃ¤nden.",
            "Feature: Im Hardcore-Modus werden Charaktere nun komplett versteckt und nur als schwarze Silhouetten angezeigt, ergÃ¤nzt durch ikonische Zitate als kleine Hilfe.",
            "Feature: Erweiterte persÃ¶nliche Analytics in deinem Profil und im Community-Tab. Dein absoluter Lieblingscharakter (und Nemesis) wird nun historienÃ¼bergreifend berechnet und angezeigt.",
            "Visualisierung: Getrennte Scoreboards fÃ¼r Hardcore-Rankings eingefÃ¼hrt, damit die regulÃ¤ren Statistiken nicht verfÃ¤lscht werden."
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
            "Feature: Neues smartes Autocomplete-Feld auf dem Login-Bildschirm. Beim Eintippen des Benutzernamens werden passende bekannte Accounts vorgeschlagen â€“ so passieren keine Tippfehler mehr. Das Dropdown erscheint erst ab dem ersten Buchstaben und zeigt nur passende Treffer.",
            "Feature: Im Profil anderer Spieler (Community-Tab) gibt es jetzt einen ðŸ’¬ NACHRICHT SENDEN-Button. Nachrichten kÃ¶nnen auch an Spieler geschrieben werden, die gerade offline sind.",
            "Feature: VorschlÃ¤ge-Kategorien Ã¼berarbeitet: Es gibt jetzt VorschlÃ¤ge (Allgemein), Charakter VorschlÃ¤ge, Tags VorschlÃ¤ge, Korrekturen und Peak Modus VorschlÃ¤ge. Jede Kategorie zeigt nur die dazugehÃ¶rigen VorschlÃ¤ge.",
            "Bugfix: Das Online-Panel konnte beim Einklappen den Reload-Button und den Pfeil-Button Ã¼bereinanderlegen. Die Buttons sind jetzt korrekt im Header-Flex-Layout angeordnet.",
            "Bugfix: Das Reload-Symbol â†» war beim Einklappen der Sidebar nach links versetzt. Es ist jetzt zentriert und wird korrekt Ã¼ber dem Pfeil-Button gestapelt."
        ]
    },
    {
        version: "v6.0",
        title: "Das GroÃŸe Community-Update",
        isHotfix: false,
        changes: [
            "Feature: Online-Panel einklappbar! Die Sidebar lÃ¤sst sich auf ein schmales Icon-Panel reduzieren. Im eingeklappten Zustand sieht man nur noch die Profilbilder mit dem Online-Punkt und ein Reload-Symbol. Per Klick auf den Pfeil wird sie wieder vollstÃ¤ndig aufgeklappt.",
            "Feature: Scoreboard-Gewichtung. Charaktere, die nur selten bewertet wurden, werden nicht mehr automatisch ganz oben angezeigt. Die Punktzahl wird als Durchschnitt (Gesamtpunkte Ã· Anzahl Rankings) berechnet. Bei gleichem Schnitt gewinnt der Charakter mit mehr Rankings. Im Hover-Tooltip sieht man die genaue Berechnung.",
            "Feature: VorschlÃ¤ge nach Kategorien getrennt. Im Community-VorschlÃ¤ge-Tab kann man jetzt zwischen den Kategorien filtern. Im Admin-Panel gibt es denselben Filter.",
            "Feature: Klassischer Modus erweitert. ZusÃ¤tzlich zum Expanded Universe gibt es nun den Peak-Ranking-Modus (nur die 'besten' Charaktere) sowie eine eigene Kategorie fÃ¼r Fahrzeuge.",
            "Feature: Anti-Cheat-Schutz. Ein verstecktes Sicherheitssystem erkennt und filtert auffÃ¤llige Bewertungsmuster automatisch heraus, um die IntegritÃ¤t des Scoreboards zu schÃ¼tzen.",
            "Feature: Admin-Panel Reset-Buttons. Admins kÃ¶nnen jetzt gezielt einzelne Spielmodi (Expanded Universe, Peak, Fahrzeuge, Advanced, Versus usw.) zurÃ¼cksetzen sowie einzelne Spieler aus einem bestimmten Modus entfernen.",
            "Feature: Neue Versus-Lobby â€“ Spieler kÃ¶nnen aus der Community heraus direkt zum Versus-Duell herausgefordert werden.",
            "Feature: Privater Chat â€“ Spieler kÃ¶nnen sich gegenseitig private Nachrichten schicken (sichtbar durch Klick auf das Avatar in der Online-Liste).",
            "Feature: Neue Titel & Achievements fÃ¼r besondere Ereignisse im Versus- und Expanded-Universe-Modus.",
            "Balancing: Der klassische Modus (Expanded Universe) bleibt der Standard fÃ¼r alle Bewertungen."
        ]
    },
    {
        version: "v5.0.4",

        title: "Code-Modernisierung & Performance-Update",
        isHotfix: false,
        changes: [
            "Performance: Massive Ãœberarbeitung der gesamten Code-Basis unter der Haube. Alte Schleifenstrukturen wurden durch hochmoderne, schnelle Array-Funktionen (wie map, reduce und find) ausgetauscht.",
            "Performance: Das Laden von Statistiken, Scoreboards und der Chat-Verlauf ist dadurch jetzt noch schneller und ressourcenschonender.",
            "AufrÃ¤umarbeit: Zahlreiche alte, ungenutzte Skripte und redundante Code-Abschnitte (wie etwa veraltete Testdateien) wurden restlos gelÃ¶scht, um die App schlank zu halten."
        ]
    },
    {
        version: "v5.0.3",
        title: "Chat-Reaktionen & QoL-Features",
        isHotfix: true,
        changes: [
            "Feature: Emoji-Reaktionen im globalen Chat hinzugefÃ¼gt. Spieler kÃ¶nnen Nachrichten mit ðŸ‘�, ðŸ˜‚, â�¤ï¸�, ðŸ˜¢, und ðŸ˜¡ versehen.",
            "Feature: Administratoren kÃ¶nnen Reaktionen im Admin-Panel separat lÃ¶schen (ohne die Nachricht zu entfernen).",
            "Feature: Wochenend-Streak-Modus eingefÃ¼hrt. Am Wochenende (Sa/So) frieren Streaks mit einem Eis-Symbol (â�„ï¸�) ein (sie verfallen nicht bei InaktivitÃ¤t, steigen aber auch nicht an).",
            "Feature: StarWarsdle Streaks werden jetzt auch bei Offline-Spielern in der Online-Leiste angezeigt.",
            "Feature: Der Profil-Button zeigt einen kleinen gelben Punkt (ðŸŸ¡), wenn neue Avatare, Titel oder Farbschemen freigeschaltet/entdeckt wurden. Im Profil selbst markiert nun ein Punkt (â—�) auf dem jeweiligen Tab, in welchem Bereich sich ungesehene Neuerungen befinden, und die neuen Elemente sind mit einem 'NEU'-Badge markiert.",
            "QoL: Der Chat scrollt beim Ã–ffnen jetzt automatisch ganz nach unten zu den neuesten Nachrichten.",
            "QoL: Die drei StarWarsdle Tipps erscheinen nun exakt nach 5, 10 und 15 Fehlversuchen.",
            "QoL: Responsive Neugestaltung der Sticky-Navigationsleiste am oberen Bildschirmrand. Das Layout wechselt bei kleineren Bildschirmen automatisch in einen zweizeiligen Modus und bietet horizontales Scrollen der Tabs, um Ãœberlappungen von Profil, Tabs und Buttons zu verhindern.",
            "QoL: Die Lesbarkeit von KnÃ¶pfen und Elementen wurde verbessert: Bei sehr hellen Themen (Klon, Padawan, Droide, Senat, 212th) wird die Textfarbe automatisch dunkel gefÃ¤rbt.",
            "Sicherheit: Der Bild-Tipp bei StarWarsdle wird nun Ã¼ber ein Canvas-Element gerendert â€“ dadurch ist der Bildpfad in den DevTools nicht mehr sichtbar (Cheat-Schutz). Die BildunschÃ¤rfe wurde zudem auf 2px reduziert."
        ]
    },
    {
        version: "v5.0.2",
        title: "QoL & Bugfixes",
        isHotfix: true,
        changes: [
            "Bugfix: StarWarsdle-Fortschritt ist jetzt Account-gebunden. Beim Ausloggen wird der lokale Fortschritt gelÃ¶scht, sodass beim Account-Wechsel kein fremder Spielstand sichtbar ist.",
            "Bugfix: Der 'Neues Spiel'-Button Ã¤ndert nun korrekt seine Hintergrundfarbe passend zum freigeschalteten Farbschema (vorher wurde nur die Schrift eingefÃ¤rbt).",
            "Bugfix: Rang-Buttons (PlÃ¤tze 1-5), der Charakter-Rahmen und die '???'-Anzeige im Spiel Ã¤ndern sich nun komplett ans Farbthema.",
            "Bugfix: Chat-Toggle-Button und Bewertungs-Buttons zeigen jetzt in allen Themen korrekt ihre Farbe.",
            "Feature: Freigeschaltete Titel und Farbthemen erscheinen im Profil jetzt ganz oben, gesperrte dahinter.",
            "Feature: Enter-Taste im StarWarsdle-Eingabefeld lÃ¶st jetzt den Rateversuch aus.",
            "Balancing: Fino & Ruffy erscheinen hÃ¤ufiger als zuvor (ca. 3x seltener statt 20x seltener als normale Charaktere).",
            "Daten-Fix: Savage Opress hat jetzt die korrekte Epoche (Clone Wars) und Macht-Status.",
            "Daten-Fix: Kategorie 'Mensch (Klon)' zu 'Klon' vereinfacht.",
            "Sicherheit: StarWarsdle-Tipp-Bild kann nicht mehr per Rechtsklick oder Drag &amp; Drop im Originalformat geÃ¶ffnet werden."
        ]
    },
    {
        version: "v5.0.1",
        title: "Streak-System & Anpassungen",
        isHotfix: true,
        changes: [
            "Neues Feature: Streak-System (ðŸ”¥) fÃ¼r StarWarsdle! Wenn du tÃ¤glich spielst, steigt dein Streak. Ein verpasster Tag bricht ihn, aber Pausen am Wochenende (Sa/So) unterbrechen deinen Streak nicht.",
            "UI-Update: Dein aktiver Streak wird nun im Sieges-Bildschirm sowie fÃ¼r alle sichtbar in der Online-Spieler-Liste angezeigt.",
            "UI-Update: Das Farbschema deines Profils Ã¼bertrÃ¤gt sich ab sofort auch auf deine Chat-Sprechblasen und den Chat-Button.",
            "UI-Update: Die End-Screen Buttons (Neues Spiel, Bewertung) und der Charakter-Rahmen passen sich nun dynamisch deinem freigeschalteten Farbschema an.",
            "Bugfix: Ein Admin-Reset fÃ¼r das StarWarsdle lÃ¶scht nun auch den lokalen Fortschritt und Streak der Spieler korrekt.",
            "Daten-Fix: Poggle, Nute Gunray und ca. 25 weitere Charaktere wurden korrigiert und haben nun die exakten Spezies (Geonosianer, Neimoidianer, etc.) statt 'Mensch'."
        ]
    },
    {
        version: "v5.0",
        title: "Das STARWARSDLE Update",
        isHotfix: false,
        changes: [
            "Neuer Spielmodus: STARWARSDLE! Errate tÃ¤glich einen galaktischen Charakter anhand spezifischer Hinweise (Geschlecht, Spezies, Planet, Fraktion, Epoche, Macht).",
            "TÃ¤gliche Herausforderung: Jeden Tag um Mitternacht gibt es einen neuen Charakter. Schaffst du es, die IdentitÃ¤t vor allen anderen zu lÃ¼ften?",
            "Visuelle Hinweise: Wie beim klassischen Wordle fÃ¤rben sich die KÃ¤stchen grÃ¼n (exakt), gelb (teilweise) oder rot (falsch), um dir auf die SprÃ¼nge zu helfen.",
            "Tipps & Autocomplete: Nach 5 Fehlversuchen werden Charakter-Bilder als Tipp freigeschaltet. Zudem zeigt dir eine intelligente Suchleiste direkt an, welche Charaktere existieren.",
            "Neues Datenbank-Attribut 'Heimatplanet': Alle 191 Charaktere wurden um ihren Heimatplaneten (z.B. Tatooine, Kamino, Geonosis) erweitert.",
            "Scoreboard & Historie: Das Scoreboard wurde erweitert! Du kannst nun die All-Time-Wins sowie die schnellsten Rate-Versuche fÃ¼r das tÃ¤gliche StarWarsdle einsehen."
        ]
    },
    {
        version: "v4.4.1",
        title: "System & UI Optimierungen",
        isHotfix: true,
        changes: [
            "Bugfix: Fehler behoben, bei dem gesperrte Titel im Community-Bereich fÃ¤lschlicherweise als freigeschaltet angezeigt wurden.",
            "Bugfix: Die Abklingzeit fÃ¼r gezogene Charaktere (besonders im Klon-Modus) wurde auf echte 5 Runden (25 Ziehungen) ausgeweitet.",
            "Bugfix: Der Klon-Modus nutzt nun strikt seine eigene Ziehungshistorie.",
            "UI-Update: Admin-Panel Layout-Fehler behoben und fÃ¼r mobile GerÃ¤te responsiv gemacht.",
            "UI-Update: PC-Optimierungs-Info und Registrierungs-Hinweise zum Login-Bildschirm hinzugefÃ¼gt."
        ]
    },
    {
        version: "v4.4",
        title: "Das Galaktische Farben Update",
        isHotfix: false,
        changes: [
            "Massive Anpassung: Es wurden Ã¼ber 20 komplett neue, exklusive Farb-Themes (Farbschemas) ins Spiel eingebaut!",
            "Freischalt-Bedingungen: Ranke bestimmte Fraktionen (z.B. 5 Mandalorianer, 5 Jedi Meister oder die Coruscant Wache) in einem einzigen Spiel, um deren einzigartige Farb-Themes fÃ¼r dein Profil freizuschalten.",
            "Neue Effekte: Einige besondere Fraktions-Themes kommen mit exklusiven animierten CSS-Glow-Effekten oder speziellen gestreiften RÃ¤ndern!"
        ]
    },
    {
        version: "v4.3",
        title: "Geheimnisse der Galaxis Update",
        isHotfix: false,
        changes: [
            "Neue Herausforderung: Es wurden 15 brandneue geheime Titel in das Spiel eingefÃ¼gt.",
            "RÃ¤tselhaft: Wie man diese Titel freischaltet, bleibt streng geheim. Ein kleiner Tipp: Manche berÃ¼hmten Kombinationen von VerbÃ¼ndeten oder Erzfeinden im selben Spiel kÃ¶nnten etwas auslÃ¶sen!"
        ]
    },

    {
        version: "v4.2",
        title: "System & Balancing Update",
        isHotfix: false,
        changes: [
            "Neuer Pity-Timer: Wenn du einen Charakter lange nicht ziehst, steigt seine Wahrscheinlichkeit nun sanft um 1% pro verpasster Runde.",
            "Easter Egg Balancing: Die Anime-Charaktere (Ruffy & Fino) sind nun extrem selten (3-mal seltener) und bekommen absichtlich keinen Pity-Bonus.",
            "Zufalls-Cooldown: Das System schlieÃŸt die letzten 5 gezogenen Charaktere temporÃ¤r aus, um nervige Dauerschleifen zu verhindern.",
            "Wartungsmodus: Administratoren kÃ¶nnen ab sofort das Einloggen fÃ¼r Spieler sperren, wÃ¤hrend Updates aufgespielt werden."
        ]
    },
    {
        version: "v4.1",
        title: "The Expanded Galaxy Part II",
        isHotfix: false,
        changes: [
            "Gigantische Erweiterung: Es wurden dutzende neue Charaktere hinzugefÃ¼gt! Darunter 10 neue Monster (z.B. Nexu, Zillo Beast), 15 Droiden (z.B. B1 Battle Droide), zahlreiche Senatoren und eine neue Death Watch Fraktion (inkl. Pre Vizsla).",
            "Klon-Erweiterung: Commander Appo, Tup, Hardcase und weitere ARC-Trooper vergrÃ¶ÃŸern die Klon-Datenbank massiv.",
            "Jedi-Erweiterung: Viele neue Meister, Padawane und Inquisitoren sowie Mutter Talzin von Dathomir sind nun im Lexikon zu finden."
        ]
    },
    {
        version: "v4.0",
        title: "Das Lexikon & Tag Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Das Lexikon kann nun nach allen neuen spezifischen Fraktionen (wie KopfgeldjÃ¤ger, Death Watch, 501st Legion, etc.) gefiltert werden.",
            "Neues Feature: Direkte Tag-VorschlÃ¤ge im Lexikon! Klicke auf das Bild eines Charakters, um den Entwicklern ein fehlendes oder falsches Tag zu melden.",
            "Balancing: Nahezu alle alten Charaktere wurden in neue, prÃ¤zisere Fraktionen einsortiert (z.B. Asajj Ventress ist nun korrekterweise bei Nachtschwestern und Separatisten statt Sith)."
        ]
    },
    {
        version: "v3.7",
        title: "Das GroÃŸe Lexikon Update",
        isHotfix: false,
        changes: [
            "Massive Charakter-Erweiterung: Dutzende neue Helden, Schurken, Klone und Droiden wurden zum Spiel hinzugefÃ¼gt! Die Fraktionen wurden ausbalanciert.",
            "Neuer geheimer Titel: Ein brandneuer geheimer Titel ('Weeb') wurde hinzugefÃ¼gt, den man freischaltet, wenn man die neuen Sonder-Anime-Charaktere in sein Lexikon aufnimmt.",
            "Neues Freischaltungs-System: Wenn du einen neuen Titel oder ein neues Farbschema erhÃ¤ltst, wird dies ab sofort mit einem riesigen Popup und einem klassischen 8-Bit Retro-Sound gefeiert!",
            "Statistik-Fix: Die Wahrscheinlichkeiten fÃ¼r geheime Titel berechnen sich nun wieder zu 100% dynamisch basierend auf der aktuellen GrÃ¶ÃŸe der Datenbank."
        ]
    },
    {
        version: "v3.6",
        title: "Das Klon-Modus Update (Extra fÃ¼r Jonas)",
        isHotfix: false,
        changes: [
            "Neuer Spielmodus: 'Nur Klone' hinzugefÃ¼gt! Teste dein Ranking-Wissen ausschlieÃŸlich mit Klonsoldaten. Du findest die Auswahl im klassischen Modus.",
            "Isolierter Fortschritt: Der Klon-Modus verfÃ¼gt Ã¼ber ein komplett eigenes, unabhÃ¤ngiges globales Scoreboard sowie eine eigene Historie, damit er nicht mit den normalen Rankings gemischt wird.",
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
            "Visualisierung: Alle Fenster-Ãœberschriften passen sich nun farblich absolut synchron deinem gewÃ¤hlten Theme an.",
            "Statistik: Bei Farbschemas und geheimen Titeln wird nun dauerhaft die mathematisch exakte, prozentuale Chance angezeigt, diese in einer Ranking-Runde zu ziehen.",
            "Geheimnisse: StÃ¤ndig auf der Suche nach Herausforderungen? Eine Reihe streng geheimer Titel wurde implementiert, die besondere Charakter-Kombinationen in einer Runde erfordern.",
            "UI-Update: Sobald du neue Updates verpasst hast, leuchtet der Update-Button nun durchgehend golden. Alle neuen Versionen erhalten im Fenster ein stark sichtbares 'NEU' Abzeichen."
        ]
    },
    {
        version: "v3.4",
        title: "Das groÃŸe Versus & QoL Update",
        isHotfix: false,
        changes: [
            "Versus Rematch: Nach Abschluss eines Versus-Spiels kann die Lobby nun Ã¼ber den Button 'Noch eine Runde' sofort neu gestartet werden, ohne sich neu einladen zu mÃ¼ssen.",
            "Versus Live-Spectating: Zuschauer kÃ¶nnen nun Live bei Versus-Matches zusehen. Ein neuer Umschalter im Zuschauermodus erlaubt das nahtlose Wechseln zwischen allen Spielern desselben Matches.",
            "Versus Fortschritt: Abgeschlossene Versus-Matches zÃ¤hlen nun offiziell als absolvierte Spiele und schalten Titel und Themes frei.",
            "Anti-Botting: Ein neuer Makro-Schutz (Hardware-PrÃ¼fung) blockiert automatisierte Klick-Bots in allen Spielmodi.",
            "Admin-Panel: Administratoren kÃ¶nnen ihr Passwort nun direkt und sicher Ã¼ber das Admin-Panel Ã¤ndern.",
            "Quality of Life: Der Aktualisieren-Button im Online-Tab lÃ¤dt nun sÃ¤mtliche Titel und Statistiken aller Spieler komplett neu (Full Refresh).",
            "Bugfix: Abgebrochene Live-Spiele verschwinden nun fÃ¼r Zuschauer sofort (Behebung einer Race Condition).",
            "Bugfix: Der '(Du)' Indikator bei sehr langen Namen im Chat/Online-Tab wird nicht mehr fehlerhaft abgeschnitten."
        ]
    },
    {
        version: "v3.3",
        title: "Das groÃŸe Anti-Cheat & Security Update",
        isHotfix: false,
        changes: [
            "Anti-Cheat: Ein strenges Signatur-System blockiert ab sofort das doppelte Speichern einer Runde durch Skripte oder Klick-Spamming.",
            "Anti-Cheat: Wer im Spiel die Seite neu lÃ¤dt, erhÃ¤lt nun exakt denselben Pool zurÃ¼ck UND alle gesetzten Charaktere bleiben auf dem Board. Ein 'Scouten' oder NeuauswÃ¼rfeln durch F5 ist physisch unmÃ¶glich geworden.",
            "Anti-Cheat: Hacker, die mit DevTools die HTML-Struktur der Bewertungs-Buttons manipulieren, prallen nun an serverseitigen JavaScript-Sperren ab.",
            "Sicherheit: PasswÃ¶rter werden ab sofort kryptographisch stark verschlÃ¼sselt (SHA-256) in der Datenbank abgelegt und sind nicht mehr auslesbar.",
            "Live-Modus: Zuschauer sehen nun nur noch die Charaktere, die der spielenden Person auch schon angezeigt wurden. ZukÃ¼nftige Charaktere bleiben als Fragezeichen getarnt, um Vorsagen ('Ghosting') zu verhindern.",
            "Bugfix: Fehler behoben, durch den einige Admins fÃ¤lschlicherweise aus der Online-Liste und dem Moderations-Werkzeug versteckt wurden."
        ]
    },
    {
        version: "v3.2.1",
        title: "Hotfix: Live-Spectating & Scoreboard",
        isHotfix: true,
        changes: [
            "Performance: Der Live-Modus wurde radikal optimiert. Eine permanente Hintergrundabfrage wurde durch einen manuellen 'Live-Spiele suchen'-Button ersetzt.",
            "Performance: Das sekundengenaue Live-Update lÃ¤uft nun wirklich nur noch fÃ¼r den einzelnen Spieler, dem man aktiv zuschaut, was die Datenbankkosten extrem verringert.",
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
            "Performance: Der Versus-Warteraum nutzt nun einen manuellen 'Aktualisieren'-Button, was stÃ¤ndige Hintergrundabfragen stoppt und die StabilitÃ¤t massiv verbessert.",
            "Neues Feature: Unsichtbare Admin-Testaccounts wurden ins System integriert. Diese Geister-Accounts haben alles freigeschaltet, tauchen aber weder in der Historie noch im Scoreboard auf, um die echten Spieler-Rankings beim Testen nicht zu verfÃ¤lschen."
        ]
    },
    {
        version: "v3.1",
        title: "Anti-Luca Spachmann Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Anti-Reload System. Wenn man die Seite neu lÃ¤dt, um den unliebsamen ersten Charakter loszuwerden, wird dieser nun gespeichert und taucht beim nÃ¤chsten Versuch unausweichlich wieder an Position 1 auf. Kein Schummeln mehr am Start!"
        ]
    },
    {
        version: "v3.0.1",
        title: "Hotfix: Versus Modus StabilitÃ¤t",
        isHotfix: true,
        changes: [
            "Hotfix: Eine schwere Race-Condition beim Senden von Multi-User-Daten wurde via Firebase-Transactions gelÃ¶st, damit nie wieder Spiele asynchron hÃ¤ngen bleiben.",
            "Hotfix: Das automatische UI-Lock im Versus-Warteraum bricht nun das Rendering rechtzeitig ab, bevor sich Datenbanken Ã¼berschreiben kÃ¶nnen.",
            "Hotfix: Das Resultat-Modal wurde robuster gegen kaputte alte Lobbys und fehlende Datenstrukturen gemacht.",
            "Hotfix: Spiele ohne globale Wertungen enden nun fair im Unentschieden.",
            "Hotfix: Spieler-Avatare in der Lobby sind dank modernem Image-Scaling nicht mehr verzerrt.",
            "Admin-Panel: Das ZurÃ¼cksetzen des Profils sperrt nun auch wieder korrekt den Zugang zum Versus-Modus."
        ]
    },
    {
        version: "v3.0",
        title: "Multiplayer Update: Versus Modus",
        isHotfix: false,
        changes: [
            "MEGA-FEATURE: Versus-Modus hinzugefÃ¼gt! Tretet gegen bis zu 8 Spieler gleichzeitig an und findet heraus, wer den perfekten Konsens trifft.",
            "Neues Feature: Lobbysystem â€“ Spieler kÃ¶nnen eigene Multiplayer-Lobbys hosten oder offenen Spielen beitreten.",
            "Neues Feature: 'Perfektes Ranking' â€“ Der Versus-Modus bewertet eure Entscheidungen im Abgleich mit dem globalen Scoreboard.",
            "Neues Feature: Versus-Historie â€“ Abgeschlossene Matches werden detailliert in der Historie festgehalten. Ein komplett neues, interaktives Resultat-Fenster zeigt die direkten Abweichungen eurer Gegner.",
            "Neues Feature: Eigener Scoreboard-Filter fÃ¼r Versus â€“ Messt euch daran, wer die meisten Versus-Runden gewonnen hat.",
            "Balancing: Der Versus-Modus ist nun erst freigeschaltet, nachdem 10 klassische Runden gespielt wurden, um neuen Spielern eine EingewÃ¶hnung zu ermÃ¶glichen."
        ]
    },
    {
        version: "v2.9.6",
        title: "Public Profiles Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Klicke auf Spieler in der Online-Liste, um deren Ã¶ffentliches Profil aufzurufen.",
            "Neues Feature: Das Spieler-Profil zeigt den Avatar, aktuellen Titel und alle freigeschalteten Themes und Titel fÃ¼r beide Modi an."
        ]
    },
    {
        version: "v2.9.5",
        title: "Manual Refresh & Performance Update",
        isHotfix: false,
        changes: [
            "Neues Feature: Online-Liste kann jetzt manuell Ã¼ber einen Button im Online-Panel aktualisiert werden.",
            "Performance: Automatisches Polling wurde deaktiviert, um Firestore-Reads deutlich zu reduzieren.",
            "Fix: Der eigene Benutzer erscheint nicht mehr doppelt in der Online-Liste.",
            "Fix: Online-ZÃ¤hler aktualisiert sich jetzt korrekt nach manueller Neuladung.",
            "QoL: Der Refresh-Button ist direkt neben der Online-Ãœberschrift verfÃ¼gbar.",
            "Chat Feature: Wenn der Chat geschlossen ist und eine neue Nachricht eingeht, leuchtet am Chat-Icon nun ein roter Punkt.",
            "QoL: Eingaben in der Anmeldemaske, im Profil und in Vorschlagsfeldern kÃ¶nnen nun bequem mit der Enter-Taste bestÃ¤tigt werden.",
            "Fix: Vorschlagskarten-Header, Lexikon-GitterhÃ¶he und das Zusammenbrechen des Lexikon-Rasters bei leerem Zustand wurden behoben."
        ]
    },
    {
        version: "v2.9.3",
        title: "Hotfix: Progression & UI-Updates",
        isHotfix: true,
        changes: [
            "Hotfix: Das Sith-Theme lÃ¤sst sich nun wieder korrekt auswÃ¤hlen und fÃ¤rbt das UI rot.",
            "Hotfix: Spieler-Titel werden nun im Online-Bereich zuverlÃ¤ssig bei allen Usern angezeigt.",
            "UI-Update: Panel-Ãœberschriften passen sich nun dynamisch an das aktuell gewÃ¤hlte Farb-Theme an.",
            "Neues Feature: Strengere Discovery-Regeln â€“ Profil-Avatare kÃ¶nnen erst ausgewÃ¤hlt werden, wenn der Charakter entdeckt wurde.",
            "Neues Feature: Unentdeckte Charaktere bleiben im Lexikon komplett verborgen (als '???').",
            "Neues Feature: Der goldene Leuchteffekt ('âœ¨') im Lexikon verschwindet nun, sobald man ihn das erste Mal betrachtet hat.",
            "Neues Feature: Theme-Freischaltung Ã¼berarbeitet â€“ Farbschemas erhÃ¤lt man nun, wenn man 5 Charaktere derselben Fraktion (z.B. Sith) in einem einzigen klassischen Spiel zieht (selten!)."
        ]
    },
    {
        version: "v2.9.2",
        title: "Hotfix: Firebase Optimierungen",
        isHotfix: true,
        changes: [
            "Hotfix: Globale History-Reset funktioniert nun korrekt â€“ localStorage Cache wird beim Reset geleert.",
            "Hotfix: Alle Firebase Listener werden beim Seitenwechsel ordnungsgemÃ¤ÃŸ abgemeldet, um Read-Spikes zu verhindern.",
            "Hotfix: Online-Tracker Query begrenzt auf 50 User â€“ verhindert massive Reads bei vielen Usern.",
            "Hotfix: Admin Chat Listener auf 100 Nachrichten begrenzt.",
            "Hotfix: Admin History Query auf 1.000 EintrÃ¤ge begrenzt â€“ verhindert tausende Reads beim Admin-Panel."
        ]
    },
    {
        version: "v2.9",
        title: "The Themes & Factions Update",
        changes: [
            "Neues Feature: Farbschemas â€“ Schalte durch besondere Leistungen exklusive Farbthemen frei: Sith (Rot), Klone (WeiÃŸ) und Rebellion (GrÃ¼n).",
            "Neues Feature: Fraktions-Ansicht im Lexikon â€“ Alle Charaktere sind jetzt mit Tags versehen (Jedi, Sith, Klon, etc.) und lassen sich im Lexikon nach Fraktion gefiltert anzeigen.",
            "Neues Feature: Farbschemas und Titel sind strikt nach Modus getrennt â€“ Star Wars und Anime teilen sich keine Progression.",
            "Neues Feature: Automatische Abmeldung nach 5 Minuten InaktivitÃ¤t mit Warnung 1 Minute vorher, um Datenbank-Reads durch offene Hintergrundtabs zu reduzieren.",
            "UI-Update: Das Updates-Fenster wurde komplett neu gestaltet mit Icon-basierter Ã„nderungsliste und sauberem Kartendesign.",
            "UI-Update: Admin kann nun Titel und Farbschemas einzelner Spieler gezielt zurÃ¼cksetzen."
        ]
    },
    {
        version: "v2.9.1",
        title: "Hotfix: Online-Tracker & Logout",
        isHotfix: true,
        changes: [
            "Hotfix: Logout setzt nun sofort ein Offline-Signal in der Datenbank â€“ User verschwinden nicht mehr erst nach 7 Minuten aus der Online-Liste.",
            "Hotfix: Online-Zeitfenster von 7 auf 6 Minuten reduziert, um inaktive User schneller zu entfernen.",
            "Hotfix: Profil-Tabs (Avatare/Titel/Farbschemas) werden jetzt korrekt neu gerendert wenn der Modus gewechselt wird."
        ]
    },
    {
        version: "v2.8",
        title: "The Titles & Progression Update",
        changes: [
            "Neues Feature: Titel-System! Sammle abgeschlossene klassische Spiele und schalte automatisch prestigetrÃ¤chtige RÃ¤nge frei (z.B. JÃ¼ngling, Padawan, Jedi-Ritter, GroÃŸmeister).",
            "UI-Update: Das ProfilmenÃ¼ wurde komplett modernisiert â€“ drei Tabs (Avatare / Titel / Farbschemas) mit Grid-Ansicht.",
            "Visualisierung: Dein ausgewÃ¤hlter Titel wird fÃ¼r alle sichtbar in der Topbar, in Historien-EintrÃ¤gen und live im Chat angezeigt."
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
            "Hotfix: Farbschema-Fortschritt zÃ¤hlt ausschlieÃŸlich im klassischen Modus â€“ Advanced-Spiele werden nicht gewertet."
        ]
    },
    {
        version: "v2.7.1",
        title: "Hotfix: Voting & Patch Notes",
        isHotfix: true,
        changes: [
            "Hotfix: Beim Abstimmen leuchten die Haken (âœ“) nun krÃ¤ftig grÃ¼n auf statt grau zu bleiben.",
            "Hotfix: Bilder bei Charakter-Update-VorschlÃ¤gen wurden nicht korrekt aus der Datenbank geladen."
        ]
    },
    {
        version: "v2.7",
        title: "The Community & Suggestions Update",
        changes: [
            "Neues Feature: Erweiterter VorschlÃ¤ge-Tab â€“ gezielt filtern nach 'Features', 'Neuen Charakteren' und 'Charakter-Updates (Name/Bild)'.",
            "Visualisierung: Charakter-Update-VorschlÃ¤ge werden in einem interaktiven Bilder-Raster prÃ¤sentiert â€“ ein Klick Ã¶ffnet die Voting-Details.",
            "Neues Admin-Feature: Community-Ideen mit genug Votes kÃ¶nnen direkt als Roadmap-Punkte eingetragen werden und erscheinen in-game."
        ]
    },
    {
        version: "v2.6",
        title: "The Performance & Database Overhaul",
        changes: [
            "Performance: Scoreboard berechnet Punkte nun im Hintergrund (1 Read statt hunderte pro Klick).",
            "Performance: Admin-Resets werden 12 Stunden gepuffert, um Ã¼berflÃ¼ssige Reads zu vermeiden.",
            "Performance: Online-Status fragt alle 2 Minuten ab statt einer konstanten Echtzeit-Verbindung.",
            "Performance: Lazy Loading â€“ Historie und Scoreboard werden erst geladen, wenn der Tab geÃ¶ffnet wird."
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
            "Neues Feature: Advanced-Modus (10 Slots statt 5) fÃ¼r noch tieferes Ranking.",
            "Neues Feature: Joker-Phase â€“ tausche einmalig zwei Karten per Klick am Ende des Advanced-Modus.",
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
            "Performance: ZirkelbezÃ¼ge im JavaScript vollstÃ¤ndig entkoppelt fÃ¼r absolute StabilitÃ¤t.",
            "UI-Update: Spielername in der Navigationsleiste deutlich grÃ¶ÃŸer und edler dargestellt.",
            "UI-Update: Echte Anzeigenamen (korrekte GroÃŸ-/Kleinschreibung) in Historie und Scoreboard-Filter."
        ]
    },
    {
        version: "v2.3",
        title: "The Spectator & Quality of Life Update",
        changes: [
            "Neues Feature: Erscheinungsreihenfolge der Charaktere wird in der Historie angezeigt.",
            "Neues Feature: Beim Live-Zuschauen siehst du den kompletten Charakter-Pool inklusive Status.",
            "Optimierung: Live-Spiele werden nach Abschluss automatisch aus der Datenbank gelÃ¶scht.",
            "UI-Update: Scrollbalken in allen Rastern ausgeblendet fÃ¼r ein edleres Interface."
        ]
    },
    {
        version: "v2.2.1",
        title: "Hotfix: Performance & StabilitÃ¤t",
        isHotfix: true,
        changes: [
            "Hotfix: Globale Scoreboard- und Historien-Resets im Admin Panel korrigiert.",
            "Hotfix: Heartbeat-Interval auf 60 Sekunden erhÃ¶ht, Online-Anzeige nutzt periodische Abfragen."
        ]
    },
    {
        version: "v2.2",
        title: "The Admin Overhaul Update",
        changes: [
            "Neues Feature: Admin Panel mit Farbindikator (Rot = Aktion mÃ¶glich, GrÃ¼n = Clean).",
            "Neues Feature: Resets sind nach Universum getrennt â€“ Star Wars und Anime unabhÃ¤ngig zurÃ¼cksetzbar.",
            "Neues Feature: Chat-Moderation mit EinzellÃ¶schung und 'Alles lÃ¶schen'.",
            "Neues Feature: Discovery, Historie und Scoreboard per User getrennt zurÃ¼cksetzbar."
        ]
    },
    {
        version: "v2.1.1",
        title: "Hotfix: Ranking & UI",
        isHotfix: true,
        changes: [
            "Hotfix: Ranken und Bewerten wurde blockiert falls die Cloud-Verbindung kurz hing.",
            "Hotfix: Leere Karten-Slots hatten gestrichelte statt saubere RÃ¤nder."
        ]
    },
    {
        version: "v2.1",
        title: "The Expanded Galaxy Update",
        changes: [
            "Inhalts-Erweiterung: 20 neue Charaktere aus dem gesamten Star Wars Universum hinzugefÃ¼gt.",
            "Vielfalt: Von den Klonkriegen bis zum Outer Rim â€“ neue Legenden fÃ¼r dein Ranking.",
            "Balancing: Alle neuen Charaktere ins Lexikon und Achievement-System integriert."
        ]
    },
    {
        version: "v2.0",
        title: "The Social Hub Update",
        changes: [
            "Neues Feature: Live-Spectating â€“ schau anderen Spielern in Echtzeit beim Ranken zu.",
            "Neues Feature: Globaler Chat als schwebendes Widget.",
            "Neues Feature: Online-Sidebar und Ã¼berarbeitetes Profil-Overlay.",
            "UI-Overhaul: Sticky Navigation, 3-Spalten-Raster fÃ¼r Historie und Scoreboard.",
            "QoL: Update-Knopf leuchtet golden auf wenn neue Patch Notes verfÃ¼gbar sind."
        ]
    },
    { version: "v1.9", title: "The Discovery Update", changes: ["Neues Feature: Charakter-Entdeckungen (Achievements) â€“ unentdeckte Charaktere pulsieren golden."] },
    { version: "v1.8", title: "The Archives Expanded", changes: ["Neues Feature: Lexikon-Tab mit alphabetischer Ãœbersicht aller Charaktere."] },
    { version: "v1.7", title: "The Leaderboard Update", changes: ["Neues Feature: Scoreboard-Tab â€“ Charaktere sammeln Punkte basierend auf Platzierung und Bewertung."] },
    { version: "v1.6", title: "The Archive Update", changes: ["Globales History-System: Jedes Spiel wird dauerhaft in der Cloud gespeichert."] },
    { version: "v1.5", title: "The Multiverse Update", changes: ["Backend: Firebase-Datenbank implementiert."] },
    { version: "v1.4", title: "End-Screen & UI Overhaul", changes: ["Visuelles Upgrade fÃ¼r den End-Screen."] },
    { version: "v1.3", title: "The Reveal & Modularisierung", changes: ["Charakternamen werden am Ende enthÃ¼llt."] },
    { version: "v1.2", title: "Sci-Fi Blind Ranking", changes: ["Es wird nur ein Charakter gleichzeitig gezeigt."] },
    { version: "v1.1", title: "Star Wars Theme", changes: ["Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum."] },
    { version: "v1.0", title: "Initial Release", changes: ["GrundgerÃ¼st des Ranking-Spiels verÃ¶ffentlicht."] }
];



