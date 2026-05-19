export const patchNotesStarWars = [
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
            "Neuer 'Historie' Tab: Siehe die Top-Rankings und Bewertungen aller Spieler live ein.",
            "User Interface: Tab-Navigation eingeführt.",
            "Quality of Life: Die Historie filtert nun automatisch nach dem aktuell gespielten Modus.",
            "Design: Modus-Badges (Text) in der Historie entfernt für ein saubereres Layout.",
            "Bugfix: Ansichts-Fehler behoben (Anmelde-Panel verschwindet korrekt).",
            "Bugfix: Robuste Fehlerbehandlung (Try/Catch) für das Login-System eingeführt."
        ] 
    },
    { version: "v1.5", title: "The Multiverse Update", changes: ["Backend: Firebase-Datenbank implementiert."] },
    { version: "v1.4", title: "End-Screen & UI Overhaul", changes: ["Visuelles Upgrade für den End-Screen."] },
    { version: "v1.3", title: "The Reveal & Modularisierung", changes: ["Charakternamen werden am Ende enthüllt."] },
    { version: "v1.2", title: "Sci-Fi Blind Ranking", changes: ["Es wird nur ein Charakter gleichzeitig gezeigt."] },
    { version: "v1.1", title: "Star Wars Theme", changes: ["Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum."] },
    { version: "v1.0", title: "Initial Release", changes: ["Grundgerüst des Ranking-Spiels veröffentlicht."] }
];