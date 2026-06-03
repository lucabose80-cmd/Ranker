# Implementierung: Soundtrack und Background System

- **`soundtracks.js` & `backgrounds.js`** wurden erstellt und enthalten die Soundtracks bzw. Hintergründe.
- **`index.html`** wurde erweitert, sodass im `<head>` (bzw. Topbar) das `<audio>`-Element und der Mute-Button zur Verfügung stehen. Das Profil-Overlay hat jetzt Auswahlfelder (Selects) für Hintergrund und Soundtrack.
- **`shop.js`** wurde aktualisiert: Cosmetics können in neuen Tabs gekauft und freigeschaltet werden (inklusive Credits Abzug / Speicherung über Firebase). Beim Öffnen von Packs pausiert der neue Soundtrack nun.
- **`profile.js`** wurde erweitert, sodass beim Speichern des Profils die neu ausgewählten `active_background` und `active_soundtrack` in das Firebase Profil (`updateUserProfile`) geschrieben werden.
- **`main.js`** lädt nach dem Login den ausgewählten Hintergrund und Soundtrack aus den Nutzereinstellungen (`window.applyActiveBackground` & `window.applyActiveSoundtrack`). Zudem stellt es globale Ducking/Mute-Methoden (`window.setAudioMuted`, `window.pauseBackgroundMusic`, `window.resumeBackgroundMusic`) für andere Skripte bereit.
- **`cardgame.js`** wurde erweitert, damit auch beim Spielen legendärer Karten (mit eigenen Soundeffekten) die Hintergrundmusik pausiert (ducking) und danach wieder startet, genau wie bei der Booster Pack Animation.

Alle Tasks aus dem Plan sind abgeschlossen! Du kannst die Umsetzung jetzt im Projekt testen.
