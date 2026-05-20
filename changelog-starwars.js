export const patchNotesStarWars = [
    {
        version: "v2.7",
        title: "The Community & Suggestions Update",
        changes: [
            "Neues Feature: Der Vorschläge-Tab wurde massiv erweitert! Du kannst nun gezielt zwischen 'Features', 'Neuen Charakteren' und 'Charakter-Updates (Name/Bild)' filtern.",
            "Visualisierung: Änderungsvorschläge für bestehende Charaktere werden nun in einem schicken, interaktiven Bilder-Raster präsentiert. Ein Klick auf ein Bild öffnet die Voting-Details.",
            "UI-Update: Das gesamte Voting-System nutzt nun dynamische Haken (✓), die beim Abstimmen kräftig grün aufleuchten.",
            "Neues Admin-Feature: Die Moderation kann hervorragende Community-Ideen mit einem Klick in echte Roadmap-Punkte verwandeln. Diese tauchen dann im Tab 'Roadmap' (unter Updates) direkt im Spiel auf!",
            "Bugfix: Ein Fehler wurde behoben, durch den Bilder bei Charakter-Updates nicht korrekt aus der Datenbank geladen wurden."
        ]
    },
    {
        version: "v2.6",
        title: "The Performance & Database Overhaul",
        changes: [
            "Neues Feature: Vorschläge-Tab (Suggestions) hinzugefügt! Reiche eigene Ideen für neue Features ein und stimme für die Ideen anderer Spieler ab.",
            "Performance: Massives Datenbank-Update – Scoreboard berechnet Punkte nun extrem ressourcenschonend im Hintergrund (kostet exakt 1 Read statt hunderten pro Klick).",
            "Performance: 'Resets' vom Admin werden nun im Hintergrund für 12 Stunden gepuffert, um extrem viele überflüssige Reads zu sparen.",
            "Performance: Online-Status-Tracker fragt nun alle 2 Minuten ab, anstatt eine konstante Live-Verbindung aufrechtzuerhalten.",
            "Performance: Lazy Loading integriert – Inhalte von Tabs (Historie, Scoreboard) werden erst aus der Cloud geladen, wenn der Tab angeklickt wird."
        ]
    },
    {
        version: "v2.5.1",
        title: "The Advanced Fix & History Grid Update",
        changes: [
            "Bugfix (Advanced Modus): Beim Zuschauen (Live-Spectating) eines Advanced-Spiels werden nun alle 10 Slots korrekt dargestellt.",
            "Bugfix (Historie): Die 10-Slot-Historienkarten wurden optimiert (Pool-Slots schrumpfen und brechen um), sodass das 3x3 Raster ohne horizontalen Scrollbalken sauber nach unten fließt."
        ]
    },
    {
        version: "v2.5",
        title: "The Advanced Mode & Joker Update",
        changes: [
            "Neues Feature: Advanced-Modus (10 Slots statt 5) spielbar für noch tieferes und komplexeres Ranking.",
            "Neues Feature: Joker-Phase am Ende des Advanced-Modus – tausche einmalig zwei beliebige Karten durch Anklicken, um dein Ranking zu perfektionieren.",
            "UI-Update: Scoreboard-Filter erweitert! Du kannst jetzt getrennt nach 'Klassisch (5er)' und 'Advanced (10er)' Scoreboards filtern.",
            "UI-Update: Historienkarten passen sich dynamisch an 10 Slots an und sind mit einem gelben 'ADV' Badge gekennzeichnet.",
            "QoL: Modus-Auswahl direkt im Spiel-Tab ermöglicht nahtloses Switchen per Klick."
        ]
    },
    {
        version: "v2.4",
        title: "The Instant Speed & QoL Update",
        changes: [
            "Performance: Extrem schnelles Umschalten zwischen Historie und Scoreboard (0ms Latenz) durch Shared-Realtime-Caching im RAM.",
            "Performance: Zirkelbezüge im Javascript vollständig entkoppelt für absolute Stabilität und reibungsfreie Anmeldung.",
            "UI-Update: Der Spielername oben links in der Navigationsleiste wird nun deutlich größer und edler dargestellt.",
            "UI-Update: In der Historie und dem Scoreboard-Filter werden jetzt die echten Anzeigenamen (korrekte Groß-/Kleinschreibung) angezeigt.",
            "Bugfix: Der Online-Tracker wurde stabilisiert (Verbindungsprobleme und Anzeigefehler der Spieleranzahl behoben)."
        ]
    },
    {
        version: "v2.3",
        title: "The Spectator & Quality of Life Update",
        changes: [
            "Neues Feature: Die Reihenfolge, in der die Charaktere erschienen sind, wird jetzt in der Historie übersichtlich dargestellt.",
            "Neues Feature: Beim Live-Zuschauen siehst du nun den kompletten Charakter-Auswahlpool der Person inklusive des aktuellen Status (platziert, aktuell, kommend).",
            "Optimierung: Live-Spiele werden nun ausschließlich während des eigentlichen Rankens übertragen und nach Abschluss oder Abbruch sofort bereinigt.",
            "UI-Update: Scrollbalken in allen Rastern (Historie, Scoreboard, Live-Spiele, Lexikon, Chat) wurden ausgeblendet, um das Interface noch edler wirken zu lassen."
        ]
    },
    { 
        version: "v2.2.1", 
        title: "Performance & Stabilitätsfixes", 
        changes: [
            "Bugfix: Globale Scoreboard- und Historien-Resets im Admin Panel funktionieren nun korrekt (Fehler durch falsche Dokument-ID behoben).",
            "Optimierung: Der Heartbeat-Interval wurde auf 60 Sekunden erhöht, um Schreibvorgänge zu halbieren.",
            "Optimierung: Die Online-Anzeige nutzt nun periodische Abfragen statt Echtzeit-Listener, was die Lesevorgänge drastisch reduziert.",
            "Optimierung: Live-Spectating lädt nur noch aktive Spiele der letzten 2 Minuten aus der Cloud.",
            "Optimierung: Abgeschlossene Spielrunden räumen ihr Live-Spiel-Dokument automatisch aus der Datenbank auf."
        ] 
    },
    { 
        version: "v2.2", 
        title: "The Admin Overhaul Update", 
        changes: [
            "Neues Feature: Das Admin Panel zeigt jetzt farblich an, ob Daten vorhanden sind (Rot = Aktion möglich, Grün = Clean).",
            "Neues Feature: Admin-Resets sind nun nach Universum getrennt – Star Wars und Anime können unabhängig voneinander zurückgesetzt werden.",
            "Neues Feature: Discovery-Reset entfernt nur Charaktere des aktuell gewählten Universums, der andere Modus bleibt unberührt.",
            "Neues Feature: Das Admin Panel zeigt oben immer an, für welchen Modus die Aktionen gelten.",
            "Neues Feature: Chat-Moderation mit Einzellöschung pro Nachricht und 'Alles löschen'-Funktion hinzugefügt.",
            "Neues Feature: Pro User können Discovery, Historie und Scoreboard nun getrennt voneinander zurückgesetzt werden."
        ] 
    },
    { 
        version: "v2.1.1", 
        title: "Quality of Life & Bugfixes", 
        changes: [
            "Bugfix: Behebung eines Fehlers, bei dem das Ranken und Bewerten blockiert wurde, falls die Cloud-Verbindung kurz hing.",
            "UI-Update: Bereits genutzte Rang- und Bewertungs-Buttons werden nun sichtbar ausgegraut.",
            "UI-Update: Leere Karten-Slots haben nun aufgeräumte, durchgezogene Ränder (gestrichelt entfernt).",
            "UI-Update: Wenn ein Charakter platziert wird, leuchtet der Rahmen des Slots nun passend zur Themenfarbe im Neon-Look auf."
        ] 
    },
	{ 
    version: "v2.1", 
    title: "The Expanded Galaxy Update", 
    changes: [
        "Inhalts-Erweiterung: Das Archiv wurde massiv aufgestockt! 20 neue Charaktere aus dem gesamten Star Wars Universum wurden hinzugefügt.",
        "Vielfalt: Von den Klonkriegen bis hin zum Outer Rim – entdecke neue Legenden und bereichere deine Rankings.",
        "Balancing: Die neuen Charaktere wurden vollständig in das Lexikon und das Achievement-System integriert."
    ] 
},
    { 
        version: "v2.0", 
        title: "The Social Hub Update", 
        changes: [
            "Neues Feature: Live-Spectating! Schau anderen Spielern in Echtzeit beim Ranken zu.",
            "Neues Feature: Globaler Chat als schwebendes Widget, um dich mit anderen Spielern auszutauschen.",
            "Neues Feature: Wer-ist-online-Sidebar hinzugefügt.",
            "Neues Feature: Profil-System überarbeitet. Es ist nun ein Overlay, in dem du deinen Anzeigenamen jederzeit ändern kannst.",
            "UI-Overhaul: Die Navigation bleibt nun beim Scrollen fest am oberen Bildschirmrand.",
            "UI-Overhaul: Historie und Scoreboard nutzen nun ein übersichtliches 3-Spalten-Raster.",
            "Quality of Life: Der Update-Knopf leuchtet nun golden auf, wenn es neue Patch Notes gibt!"
        ] 
    },
    { 
        version: "v1.9", 
        title: "The Discovery Update", 
        changes: [
            "Neues Feature: Charakter-Entdeckungen hinzugefügt (Achievements).",
            "Visualisierung: Brandneue Charaktere pulsieren im Spiel magisch gold, wenn du sie das erste Mal siehst.",
            "Lexikon-Glow: Im Lexikon siehst du anhand des goldenen Glanzes und eines ✨-Symbols, welche Charaktere noch unentdeckt sind."
        ] 
    },
    { 
        version: "v1.8", 
        title: "The Archives Expanded", 
        changes: [
            "Neues Feature: Lexikon-Tab hinzugefügt.",
            "Visualisierung: Eine Übersicht aller Charaktere des aktuellen Universums (Alphabetisch sortiert).",
            "Design: Lexikon passt sich nahtlos an das gewählte Theme an."
        ] 
    },
    { 
        version: "v1.7", 
        title: "The Leaderboard Update", 
        changes: [
            "Neues Feature: Das SCOREBOARD Tab wurde hinzugefügt.",
            "Ranking Meta: Charaktere sammeln nun Punkte basierend auf Platzierung und Endbewertung.",
            "Globale & Eigene Meta: Im Scoreboard kann zwischen allen Spielern und einzelnen Usern gefiltert werden."
        ] 
    },
    { 
        version: "v1.6", 
        title: "The Archive Update", 
        changes: [
            "Globales History-System: Jedes Spiel wird nun dauerhaft in der Cloud gespeichert.",
            "Neuer 'Historie' Tab: Siehe die Top-Rankings und Bewertungen aller Spieler live ein."
        ] 
    },
    { version: "v1.5", title: "The Multiverse Update", changes: ["Backend: Firebase-Datenbank implementiert."] },
    { version: "v1.4", title: "End-Screen & UI Overhaul", changes: ["Visuelles Upgrade für den End-Screen."] },
    { version: "v1.3", title: "The Reveal & Modularisierung", changes: ["Charakternamen werden am Ende enthüllt."] },
    { version: "v1.2", title: "Sci-Fi Blind Ranking", changes: ["Es wird nur ein Charakter gleichzeitig gezeigt."] },
    { version: "v1.1", title: "Star Wars Theme", changes: ["Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum."] },
    { version: "v1.0", title: "Initial Release", changes: ["Grundgerüst des Ranking-Spiels veröffentlicht."] }
];