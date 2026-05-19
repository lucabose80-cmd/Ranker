// changelog-waifu.js
export const patchNotesWaifu = [
    { 
        version: "v1.2", 
        title: "Archive & Memories", 
        changes: [
            "Globales History-System: Deine Waifu-Rankings werden nun für die Nachwelt gespeichert.",
            "Neuer 'Historie' Tab: Vergleiche deinen Geschmack mit dem Rest der Welt.",
            "Design: Das Tab-System passt sich dem Pink-Neon Theme an.",
            "Bugfix: Robuste Fehlerbehandlung (Try/Catch) für das Login-System eingeführt.",
            "Bugfix: Lade-Reihenfolge der UI optimiert, um 'tote' Buttons bei Netzwerkproblemen zu verhindern.",
            "Design: Login-Button zeigt nun 'Lädt...' während der Datenbank-Kommunikation an."
        ] 
    },
    { 
        version: "v1.1", 
        title: "Visual Overhaul & Engine Upgrade", 
        changes: [
            "Farbschema aktualisiert: Das Theme nutzt nun ein sattes Neon-Pink (#ff2a9d).",
            "Architektur: Spiellogik in kleine, wartbare Module aufgeteilt.",
            "Performance: Bilder-Preload integriert, um Ruckler bei der Charakteranzeige zu beheben.",
            "Backend: Firebase-Datenbank für globale Logins und ein Live Admin-Panel eingeführt.",
            "Quality of Life: Intelligentes Login-System erstellt Accounts automatisch, wenn sie noch nicht existieren.",
            "Bugfix: Admin Login Probleme behoben (Passwort-Sync mit der Cloud).",
            "Design: Augen-Symbol für Passworteingabe ist nun ein sauberes, graues Icon statt eines Emojis."
        ] 
    },
    { 
        version: "v1.0", 
        title: "Anime Modus Release", 
        changes: [
            "Neuer versteckter Waifu-Modus integriert (erreichbar über Pfeiltaste nach unten).", 
            "Eigenes Pink-Neon Theme hinzugefügt.", 
            "16 neue Anime-Charaktere importiert."
        ] 
    }
];