const fs = require('fs');
let content = fs.readFileSync('d:/Programmieren/Ranker/data-starwars.js', 'utf8');

const newChars = [
  '  /* NEU */ { name: "Darth Jar Jar", img: "starwars.bilder/darthjarjar.jpg", tags: ["sith", "meme"], gender: "Männlich", species: "Gungan", faction: ["Sith"], era: ["Prequels/Clone Wars"], force: true, planet: \\'Naboo\\' }',
  '  /* NEU */ { name: "Jod Na Nawood", img: "starwars.bilder/jodnanawood.jpg", tags: ["grau", "schmuggel"], gender: "Männlich", species: "Mensch", faction: ["Unterwelt"], era: ["Mandalorian/Ahsoka"], force: true, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Osha Aniseya", img: "starwars.bilder/osha.jpg", tags: ["sith"], gender: "Weiblich", species: "Mensch", faction: ["Sith"], era: ["High Republic"], force: true, planet: \\'Brendok\\' }',
  '  /* NEU */ { name: "Mae Aniseya", img: "starwars.bilder/mae.jpg", tags: ["sith"], gender: "Weiblich", species: "Mensch", faction: ["Sith"], era: ["High Republic"], force: true, planet: \\'Brendok\\' }',
  '  /* NEU */ { name: "Qimir (Der Fremde)", img: "starwars.bilder/qimir.jpg", tags: ["sith"], gender: "Männlich", species: "Mensch", faction: ["Sith"], era: ["High Republic"], force: true, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Jecki Lon", img: "starwars.bilder/jecki.jpg", tags: ["jedi", "padawan"], gender: "Weiblich", species: "Theelin/Mensch", faction: ["Jedi-Orden"], era: ["High Republic"], force: true, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Rush Clovis", img: "starwars.bilder/clovis.jpg", tags: ["republik", "separatist", "senat"], gender: "Männlich", species: "Mensch", faction: ["Republik", "Separatisten"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Scipio\\' }',
  '  /* NEU */ { name: "Suchdroide", img: "starwars.bilder/suchdroide.jpg", tags: ["imperium", "droide"], gender: "Droide", species: "Droide", faction: ["Imperium"], era: ["Originals"], force: false, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Zwergspinnendroide", img: "starwars.bilder/zwergspinnendroide.jpg", tags: ["separatist", "droide"], gender: "Droide", species: "Droide", faction: ["Separatisten"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Geonosis\\' }',
  '  /* NEU */ { name: "Jar Jar Binks", img: "starwars.bilder/jarjar.jpg", tags: ["republik", "senat"], gender: "Männlich", species: "Gungan", faction: ["Republik"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Naboo\\' }',
  '  /* NEU */ { name: "Die Tochter", img: "starwars.bilder/tochter.jpg", tags: ["jedi"], gender: "Weiblich", species: "Machtwesen", faction: ["Jedi-Orden"], era: ["Prequels/Clone Wars"], force: true, planet: \\'Mortis\\' }',
  '  /* NEU */ { name: "Der Vater", img: "starwars.bilder/vater.jpg", tags: ["grau"], gender: "Männlich", species: "Machtwesen", faction: ["Unbekannt"], era: ["Prequels/Clone Wars"], force: true, planet: \\'Mortis\\' }',
  '  /* NEU */ { name: "Der Sohn", img: "starwars.bilder/sohn.jpg", tags: ["sith"], gender: "Männlich", species: "Machtwesen", faction: ["Sith"], era: ["Prequels/Clone Wars"], force: true, planet: \\'Mortis\\' }',
  '  /* NEU */ { name: "Darth Malgus", img: "starwars.bilder/malgus.jpg", tags: ["sith", "videospiel"], gender: "Männlich", species: "Mensch", faction: ["Sith"], era: ["Old Republic"], force: true, planet: \\'Dromund Kaas\\' }',
  '  /* NEU */ { name: "Droideka", img: "starwars.bilder/droideka.jpg", tags: ["separatist", "droide"], gender: "Droide", species: "Droide", faction: ["Separatisten"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Colla IV\\' }',
  '  /* NEU */ { name: "Neel", img: "starwars.bilder/neel.jpg", tags: ["republik"], gender: "Männlich", species: "Ortolaner", faction: ["Republik"], era: ["Mandalorian/Ahsoka"], force: false, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Trace Martez", img: "starwars.bilder/trace.jpg", tags: ["schmuggel", "unterwelt"], gender: "Weiblich", species: "Mensch", faction: ["Unterwelt"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Coruscant\\' }',
  '  /* NEU */ { name: "Rafa Martez", img: "starwars.bilder/rafa.jpg", tags: ["schmuggel", "unterwelt"], gender: "Weiblich", species: "Mensch", faction: ["Unterwelt"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Coruscant\\' }',
  '  /* NEU */ { name: "Spybot", img: "starwars.bilder/spybot.jpg", tags: ["sith", "droide"], gender: "Droide", species: "Droide", faction: ["Sith"], era: ["Prequels/Clone Wars"], force: false, planet: \\'Unbekannt\\' }',
  '  /* NEU */ { name: "Jonas", img: "starwars.bilder/jonas.jpg", tags: ["meme"], gender: "Männlich", species: "Mensch", faction: ["Unbekannt"], era: ["Unbekannt"], force: false, planet: \\'Erde\\' }'
];

for (let c of newChars) {
  content = content.replace(c + ',', '');
  content = content.replace(c + '\\n', '');
  content = content.replace(c + '\\r\\n', '');
  content = content.replace(c, '');
}

const inserts = {
  '// Sith': [newChars[0], newChars[2], newChars[3], newChars[4], newChars[12], newChars[13]],
  '// Graue Machtnutzer & Dathomir': [newChars[1], newChars[11]],
  '// Jedi': [newChars[5], newChars[10]],
  '// Republik & Sonstige': [newChars[6], newChars[9], newChars[15]],
  '// Droiden': [newChars[7], newChars[8], newChars[14], newChars[18]],
  '// Kopfgeldjäger & Unterwelt': [newChars[16], newChars[17]],
  '// Anime (Sonder-Charaktere)': [newChars[19]]
};

for (let [cat, chars] of Object.entries(inserts)) {
  let idx = content.indexOf(cat);
  if (idx !== -1) {
    let eol = content.indexOf('\\n', idx);
    let strToInsert = '\\n' + chars.join(',\\n') + ',';
    content = content.slice(0, eol) + strToInsert + content.slice(eol);
  }
}

fs.writeFileSync('d:/Programmieren/Ranker/data-starwars.js', content, 'utf8');
