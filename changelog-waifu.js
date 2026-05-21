export const patchNotesWaifu = [
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