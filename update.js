const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const factions = {
    'Mandalorianer': 'Silence: Deaktiviert für dieses Duell sofort sämtliche aktiven und passiven Fraktions-Effekte der gegnerischen Karte.&#10;&#10;• Ende: Gilt nur für diese eine Runde.&#10;• Limit: Exklusiv (Maximal 3 erlaubt)',
    'Grau': 'Ausgleich: Dreht in dieser Runde die Siegesbedingung komplett um. Die Karte mit dem NIEDRIGSTEN Score gewinnt.&#10;&#10;• Ende: Gilt nur für diese eine Runde.&#10;• Limit: Exklusiv (Maximal 3 erlaubt)',
    'Republik': 'Veto: Verhindert eine direkte Niederlage. Falls dein Gegner gewinnen würde, wird das Ergebnis auf ein Unentschieden (0:0) eingefroren.&#10;&#10;• Ende: Gilt nur für diese eine Runde.&#10;• Limit: Exklusiv (Maximal 3 erlaubt)',
    'Fahrzeuge': 'Überrollen: Gewinnt das Fahrzeug die Runde, greift es sofort in einer Extra-Runde nochmals an und behält seinen Score.&#10;&#10;• Ende: Endet sofort und das Fahrzeug wird zerstört, falls es eine Runde verliert.&#10;• Limit: Exklusiv (Maximal 3 erlaubt)',
    'Sith': 'Ausdünnung: Jede zweite (2.) gespielte Sith-Karte vernichtet sofort und dauerhaft eine zufällige Karte direkt von der feindlichen Hand.&#10;&#10;• Ende: Der Zähler ist während des gesamten Matches permanent aktiv.&#10;• Limit: Exklusiv (Maximal 4 erlaubt)',
    'Jedi': 'Gedankentrick: Spielst du einen Jedi, zwingt dieser den Bot dazu, in seiner NÄCHSTEN Runde garantiert seine schwächste Karte auszuspielen.&#10;&#10;• Ende: Der Effekt verbraucht sich automatisch beim Ausspielen der gegnerischen Karte.&#10;• Limit: Exklusiv (Maximal 3 erlaubt)',
    'Schurke': 'Falsches Spiel: Vor der Gewinn-Ermittlung stiehlt der Schurke heimlich den aktuellen Score des Gegners und tauscht ihn gegen seinen eigenen.&#10;&#10;• Ende: Die geklauten Werte gelten ausschließlich in dieser Runde.&#10;• Limit: Formation (Mindestens 3 benötigt)',
    'Imperium': 'Unterdrückung: Gewinnt das Imperium, baut es starken Druck auf. Die gegnerische Karte in der NÄCHSTEN Runde verliert pauschal 25% Basis-Score.&#10;&#10;• Ende: Verliert das Imperium, triggert der Effekt nicht. Der 25% Abzug verfällt nach 1 Runde.&#10;• Limit: Formation (Mindestens 4 benötigt)',
    'Rebell': 'Hoffnung: Rebellen kämpfen aus Verzweiflung stärker. Liegst du im aktuellen Gesamt-Match hinten (weniger Siege), verdoppelt der Rebell seinen Score.&#10;&#10;• Ende: Sobald du Gleichstand erreichst oder führst, entfällt die Verdopplung.&#10;• Limit: Formation (Mindestens 4 benötigt)',
    'Klon': 'Klon-Kette: Stirbt ein Klon, wird sein Score global gespeichert. Der nächste gespielte Klon erhält diesen Score als permanenten Boost oben drauf.&#10;&#10;• Ende: Die Kette reißt sofort ab (Bonus = 0), wenn zwischen zwei Klonen eine andere Fraktion gespielt wird.&#10;• Limit: Formation (Mindestens 4 benötigt)',
    'Nachtschwester': 'Nekromantie: Gewinnt die Nachtschwester, holt sie mit dunkler Magie die vom Gegner ZULETZT besiegte Karte aus dem feindlichen Friedhof in deine Hand.&#10;&#10;• Ende: Funktioniert nur bei einem aktiven Rundensieg.&#10;• Limit: Formation (Mindestens 3 benötigt)',
    'Droid': 'Verschmelzung: Spielst du diesen Droiden, verdoppelt sich durch Schwarm-Intelligenz automatisch der Score deines NÄCHSTEN Droiden.&#10;&#10;• Ende: Der Verdopplungs-Bonus wird direkt beim Einsatz des nächsten Droiden verbraucht.&#10;• Limit: Formation (Mindestens 5 benötigt)',
    'Kopfgeldjäger': 'Kopfgeld: Zu Beginn des Matches wird die häufigste feindliche Fraktion als Ziel markiert. Besiegst du dieses Ziel im Duell, erhältst du 2 Match-Punkte (statt 1).&#10;&#10;• Ende: Das Hauptziel bleibt das ganze Match über dauerhaft markiert.&#10;• Limit: Formation (Mindestens 3 benötigt)',
    'Erste Ordnung': 'Zwangsrekrutierung: Gewinnt die Erste Ordnung, wird die gerade besiegte feindliche Karte nicht zerstört, sondern sofort in deine eigene Hand rekrutiert.&#10;&#10;• Ende: Der Effekt ist nur während der exakten Runde des Sieges aktiv.&#10;• Limit: Formation (Mindestens 4 benötigt)',
    'Widerstand': 'Opfermut: Verliert ein Widerstandskämpfer, inspiriert sein Opfer das Team. Deine NÄCHSTE ausgespielte Karte erhält einen massiven Bonus von +4.0 Punkten.&#10;&#10;• Ende: Der Bonus verbraucht sich direkt in der Folgerunde.&#10;• Limit: Formation (Mindestens 4 benötigt)'
};

for (const [key, value] of Object.entries(factions)) {
    const regex = new RegExp(`(<div class="has-tooltip" data-tooltip=")[^"]*(" [^>]*>)${key}</div>`, 'ig');
    html = html.replace(regex, (match, p1, p2) => {
        const exactName = match.match(/>([^<]+)<\/div>/)[1];
        return `${p1}${value}${p2}${exactName}</div>`;
    });
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('done');
