// data-starwars.js
export const starWarsCharacters = [
  // Jedi
  { name: "Luke Skywalker",       img: "starwars.bilder/luke.jpg",          tags: ["jedi", "rebell"] },
  { name: "Obi-Wan Kenobi",       img: "starwars.bilder/obiwan.jpg",        tags: ["jedi"] },
  { name: "Yoda",                 img: "starwars.bilder/yoda.jpg",          tags: ["jedi"] },
  { name: "Anakin Skywalker",     img: "starwars.bilder/anakin.jpg",        tags: ["jedi", "sith"] },
  { name: "Mace Windu",           img: "starwars.bilder/mace.jpg",          tags: ["jedi"] },
  { name: "Qui-Gon Jinn",         img: "starwars.bilder/quigon.jpg",        tags: ["jedi"] },
  { name: "Ahsoka Tano",          img: "starwars.bilder/ahsoka.jpg",        tags: ["jedi"] },
  { name: "Ezra Bridger",         img: "starwars.bilder/ezra.jpg",          tags: ["jedi"] },
  { name: "Kanan Jarrus",         img: "starwars.bilder/kanan.jpg",         tags: ["jedi"] },
  { name: "Cal Kestis",           img: "starwars.bilder/cal.jpg",           tags: ["jedi"] },
  { name: "Rey Skywalker",        img: "starwars.bilder/rey.jpg",           tags: ["jedi"] },

  // Sith
  { name: "Darth Vader",          img: "starwars.bilder/vader.jpg",         tags: ["sith"] },
  { name: "Emperor Palpatine",    img: "starwars.bilder/palpatine.jpg",     tags: ["sith"] },
  { name: "Darth Maul",           img: "starwars.bilder/maul.jpg",          tags: ["sith"] },
  { name: "Count Dooku",          img: "starwars.bilder/dooku.jpg",         tags: ["sith"] },
  { name: "Kylo Ren",             img: "starwars.bilder/kyloren.jpg",       tags: ["sith"] },
  { name: "Asajj Ventress",       img: "starwars.bilder/ventress.jpg",      tags: ["sith", "separatist"] },
  { name: "Baylan Skoll",         img: "starwars.bilder/baylan.jpg",        tags: ["sith"] },
  { name: "Shin Hati",            img: "starwars.bilder/shin.jpg",          tags: ["sith"] },
  { name: "Morgan Elsbeth",       img: "starwars.bilder/morgan.jpg",        tags: ["sith"] },

  // Klone
  { name: "Captain Rex",          img: "starwars.bilder/Captain_Rex.jpg",   tags: ["klon"] },
  { name: "Fives",                img: "starwars.bilder/fives.jpg",         tags: ["klon"] },
  { name: "Echo",                 img: "starwars.bilder/echo.jpg",          tags: ["klon"] },
  { name: "Jesse",                img: "starwars.bilder/jesse.jpg",         tags: ["klon"] },
  { name: "Wolffe",               img: "starwars.bilder/wolffe.jpg",        tags: ["klon"] },
  { name: "Gregor",               img: "starwars.bilder/gregor.jpg",        tags: ["klon"] },

  // Droiden
  { name: "R2-D2",                img: "starwars.bilder/r2d2.jpg",          tags: ["droide"] },
  { name: "C-3PO",                img: "starwars.bilder/c3po.jpg",          tags: ["droide"] },
  { name: "General Grievous",     img: "starwars.bilder/grievous.jpg",      tags: ["droide", "separatist"] },

  // Separatisten
  { name: "Wat Tambor",           img: "starwars.bilder/wattambor.jpg",     tags: ["separatist"] },
  { name: "Poggle the Lesser",    img: "starwars.bilder/poggle.jpg",        tags: ["separatist"] },
  { name: "Nute Gunray",          img: "starwars.bilder/nutegunray.jpg",    tags: ["separatist"] },

  // Rebellen
  { name: "Han Solo",             img: "starwars.bilder/han.jpg",           tags: ["rebell", "schmuggel"] },
  { name: "Leia Organa",          img: "starwars.bilder/leia.jpg",          tags: ["rebell"] },
  { name: "Chewbacca",            img: "starwars.bilder/chewbacca.jpg",     tags: ["rebell"] },
  { name: "Lando Calrissian",     img: "starwars.bilder/lando.jpg",         tags: ["rebell", "schmuggel"] },
  { name: "Jyn Erso",             img: "starwars.bilder/jyn.jpg",           tags: ["rebell"] },
  { name: "Cassian Andor",        img: "starwars.bilder/cassian.jpg",       tags: ["rebell"] },
  { name: "Saw Gerrera",          img: "starwars.bilder/saw.jpg",           tags: ["rebell"] },
  { name: "Mon Mothma",           img: "starwars.bilder/monmothma.jpg",     tags: ["rebell"] },
  { name: "Admiral Ackbar",       img: "starwars.bilder/ackbar.jpg",        tags: ["rebell"] },
  { name: "Poe Dameron",          img: "starwars.bilder/poe.jpg",           tags: ["rebell"] },
  { name: "Finn",                 img: "starwars.bilder/finn.jpg",          tags: ["rebell"] },
  { name: "Rose Tico",            img: "starwars.bilder/rose.jpg",          tags: ["rebell"] },
  { name: "Vice Admiral Holdo",   img: "starwars.bilder/holdo.jpg",         tags: ["rebell"] },
  { name: "Hera Syndulla",        img: "starwars.bilder/hera.jpg",          tags: ["rebell"] },
  { name: "Sabine Wren",          img: "starwars.bilder/sabine.jpg",        tags: ["rebell", "mandalorian"] },

  // Mandalorian
  { name: "Din Djarin",           img: "starwars.bilder/mandalorian.jpg",   tags: ["mandalorian"] },
  { name: "Bo-Katan Kryze",       img: "starwars.bilder/bokatan.jpg",       tags: ["mandalorian"] },
  { name: "Boba Fett",            img: "starwars.bilder/boba.jpg",          tags: ["mandalorian", "schmuggel"] },

  // Sonstige
  { name: "Padmé Amidala",        img: "starwars.bilder/padme.jpg",         tags: ["sonstige"] },
  { name: "Merrin",               img: "starwars.bilder/merrin.jpg",        tags: ["sonstige"] },
  { name: "Grogu",                img: "starwars.bilder/grogu.jpg",         tags: ["sonstige"] },
  { name: "Grand Admiral Thrawn", img: "starwars.bilder/thrawn.jpg",        tags: ["sonstige"] },
  { name: "Nien Nunb",            img: "starwars.bilder/niennunb.jpg",      tags: ["sonstige"] },
  { name: "DJ",                   img: "starwars.bilder/dj.jpg",            tags: ["sonstige"] },
  { name: "Enfys Nest",           img: "starwars.bilder/enfys.jpg",         tags: ["sonstige"] },
  { name: "Dryden Vos",           img: "starwars.bilder/dryden.jpg",        tags: ["sonstige"] },
  { name: "Qi'ra",                img: "starwars.bilder/qira.jpg",          tags: ["sonstige"] },
];
