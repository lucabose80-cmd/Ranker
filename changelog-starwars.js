// changelog-starwars.js
export const patchNotesStarWars = [
    { 
        version: "v1.6", 
        title: "The Archive Update", 
        changes: [
            "Globales History-System: Jedes Spiel wird nun dauerhaft in der Cloud gespeichert.",
            "Neuer 'Historie' Tab: Siehe die Top-Rankings und Bewertungen aller Spieler live ein.",
            "User Interface: Tab-Navigation eingeführt, um nahtlos zwischen Spiel und Archiv zu wechseln.",
            "Bugfix: Robuste Fehlerbehandlung (Try/Catch) für das Login-System eingeführt.",
            "Bugfix: Lade-Reihenfolge der UI optimiert, um 'tote' Buttons bei Netzwerkproblemen zu verhindern.",
            "Design: Login-Button zeigt nun 'Lädt...' während der Datenbank-Kommunikation an."
        ] 
    },
    { 
        version: "v1.5", 
        title: "The Multiverse Update", 
        changes: [
            "Geheimes Feature hinzugefügt: Mit der Pfeiltaste (Runter) kann in ein alternatives Anime-Universum gewechselt werden.",
            "Modulares Theme-System integriert, um zukünftig weitere Universen zu unterstützen.",
            "Performance: Bilder-Preload integriert, um Ruckler bei der Charakteranzeige zu beheben.",
            "Backend: Firebase-Datenbank für globale Logins und ein Live Admin-Panel eingeführt.",
            "Quality of Life: Intelligentes Login-System erstellt Accounts automatisch, wenn sie noch nicht existieren.",
            "Bugfix: Admin Login Probleme behoben (Passwort-Sync mit der Cloud).",
            "Design: Augen-Symbol für Passworteingabe ist nun ein sauberes, graues Icon statt eines Emojis."
        ] 
    },
    { 
        version: "v1.4", 
        title: "End-Screen & UI Overhaul", 
        changes: [
            "Großes visuelles Upgrade für den End-Screen.",
            "Das 1-10 Rating-System nutzt nun große, interaktive Buttons.",
            "Updates-Menü überarbeitet: Neues Pop-up mit Versions-Badges."
        ] 
    },
    { 
        version: "v1.3", 
        title: "The Reveal & Modularisierung", 
        changes: [
            "Überraschungseffekt: Charakternamen werden erst am Ende enthüllt.",
            "Code-Architektur verbessert und in eigene Module ausgelagert."
        ] 
    },
    { 
        version: "v1.2", 
        title: "Sci-Fi Blind Ranking", 
        changes: [
            "Echtes 'Blind Ranking': Es wird immer nur ein Charakter gleichzeitig gezeigt.",
            "Steuerung über 1-5 Buttons im unteren Bereich eingeführt."
        ] 
    },
    { 
        version: "v1.1", 
        title: "Star Wars Theme", 
        changes: [
            "Theme-Wechsel: Das Spiel nutzt nun das Star Wars Universum.",
            "Drag-and-Drop Mechanik entfernt und durch ein intuitiveres Klick-System ersetzt."
        ] 
    },
    { 
        version: "v1.0", 
        title: "Initial Release", 
        changes: [
            "Grundgerüst des Ranking-Spiels veröffentlicht.",
            "Lokales Drag-and-Drop System mit Basis-Charakteren."
        ] 
    }
];