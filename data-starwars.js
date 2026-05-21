// data-starwars.js
export const starWarsCharacters = [
  // Klone
  { name: "Captain Rex", img: "starwars.bilder/Captain_Rex.jpg", tags: ["klon"] },
  { name: "Commander Cody", img: "starwars.bilder/cody.jpg", tags: ["klon"] },
  { name: "Fives", img: "starwars.bilder/fives.jpg", tags: ["klon"] },
  { name: "Echo", img: "starwars.bilder/echo.jpg", tags: ["klon"] },
  { name: "Jesse", img: "starwars.bilder/jesse.jpg", tags: ["klon"] },
  { name: "Wolffe", img: "starwars.bilder/wolffe.jpg", tags: ["klon"] },
  { name: "Gregor", img: "starwars.bilder/gregor.jpg", tags: ["klon"] },
  { name: "Commander Bly", img: "starwars.bilder/bly.jpg", tags: ["klon"] },
  { name: "Waxer", img: "starwars.bilder/waxer.jpg", tags: ["klon"] },
  { name: "Boil", img: "starwars.bilder/Boil.jpg", tags: ["klon"] },
  { name: "Commander Thorn", img: "starwars.bilder/thorn.jpg", tags: ["klon"] },
  { name: "Commander Fox", img: "starwars.bilder/fox.jpg", tags: ["klon"] },
  { name: "Kix", img: "starwars.bilder/kix.jpg", tags: ["klon"] },
  { name: "Cameron", img: "starwars.bilder/cameron.jpg", tags: ["klon"] },
  { name: "Commander Gree", img: "starwars.bilder/gree.jpg", tags: ["klon"] },
  { name: "Commander Doom", img: "starwars.bilder/doom.jpg", tags: ["klon"] },
  { name: "Commander Bacara", img: "starwars.bilder/bacara.jpg", tags: ["klon"] },
  { name: "Hevy", img: "starwars.bilder/hevy.jpg", tags: ["klon"] },
  { name: "Flash", img: "starwars.bilder/flash.jpg", tags: ["klon"] },
  { name: "Lucky", img: "starwars.bilder/lucky.jpg", tags: ["klon"] },
  { name: "Scorch", img: "starwars.bilder/scorch.jpg", tags: ["klon"] },
  { name: "Hunter", img: "starwars.bilder/hunter.jpg", tags: ["klon"] }, // NEU
  { name: "Wrecker", img: "starwars.bilder/wrecker.jpg", tags: ["klon"] }, // NEU
  { name: "Tech", img: "starwars.bilder/tech.jpg", tags: ["klon"] }, // NEU
  { name: "Crosshair", img: "starwars.bilder/crosshair.jpg", tags: ["klon"] }, // NEU
  { name: "Omega", img: "starwars.bilder/omega.jpg", tags: ["klon"] }, // NEU

  // Jedi
  { name: "Luke Skywalker", img: "starwars.bilder/luke.jpg", tags: ["jedi", "rebell"] },
  { name: "Obi-Wan Kenobi", img: "starwars.bilder/obiwan.jpg", tags: ["jedi"] },
  { name: "Yoda", img: "starwars.bilder/yoda.jpg", tags: ["jedi"] },
  { name: "Anakin Skywalker", img: "starwars.bilder/anakin.jpg", tags: ["jedi", "sith"] },
  { name: "Mace Windu", img: "starwars.bilder/mace.jpg", tags: ["jedi"] },
  { name: "Qui-Gon Jinn", img: "starwars.bilder/quigon.jpg", tags: ["jedi"] },
  { name: "Ahsoka Tano", img: "starwars.bilder/ahsoka.jpg", tags: ["jedi"] },
  { name: "Kit Fisto", img: "starwars.bilder/kitfisto.jpg", tags: ["jedi"] },
  { name: "Plo Koon", img: "starwars.bilder/plokoon.jpg", tags: ["jedi"] },
  { name: "Ki-Adi-Mundi", img: "starwars.bilder/kiadimundi.jpg", tags: ["jedi"] },
  { name: "Aayla Secura", img: "starwars.bilder/aaylasecura.jpg", tags: ["jedi"] },
  { name: "Coleman Trebor", img: "starwars.bilder/colemantrebor.jpg", tags: ["jedi"] },
  { name: "Shaak Ti", img: "starwars.bilder/shaakti.jpg", tags: ["jedi"] },
  { name: "Luminara Unduli", img: "starwars.bilder/luminara.jpg", tags: ["jedi"] },
  { name: "Ezra Bridger", img: "starwars.bilder/ezra.jpg", tags: ["jedi"] },
  { name: "Kanan Jarrus", img: "starwars.bilder/kanan.jpg", tags: ["jedi"] },
  { name: "Cal Kestis", img: "starwars.bilder/cal.jpg", tags: ["jedi"] },
  { name: "Rey Skywalker", img: "starwars.bilder/rey.jpg", tags: ["jedi"] },

  // Sith / Dunkle Seite
  { name: "Darth Vader", img: "starwars.bilder/vader.jpg", tags: ["sith"] },
  { name: "Emperor Palpatine", img: "starwars.bilder/palpatine.jpg", tags: ["sith"] },
  { name: "Darth Maul", img: "starwars.bilder/maul.jpg", tags: ["sith"] },
  { name: "Count Dooku", img: "starwars.bilder/dooku.jpg", tags: ["sith", "separatist"] },
  { name: "Darth Plagueis", img: "starwars.bilder/plagueis.jpg", tags: ["sith"] },
  { name: "Savage Opress", img: "starwars.bilder/savageopress.jpg", tags: ["sith"] },
  { name: "Kylo Ren", img: "starwars.bilder/kyloren.jpg", tags: ["sith"] },
  { name: "Asajj Ventress", img: "starwars.bilder/ventress.jpg", tags: ["sith", "separatist"] },
  { name: "Grand Inquisitor", img: "starwars.bilder/grandinquisitor.jpg", tags: ["sith"] },
  { name: "Baylan Skoll", img: "starwars.bilder/baylan.jpg", tags: ["sith"] },
  { name: "Shin Hati", img: "starwars.bilder/shin.jpg", tags: ["sith"] },
  { name: "Morgan Elsbeth", img: "starwars.bilder/morgan.jpg", tags: ["sith"] },

  // Mandalorianer
  { name: "Din Djarin", img: "starwars.bilder/mandalorian.jpg", tags: ["mandalorian"] },
  { name: "Bo-Katan Kryze", img: "starwars.bilder/bokatan.jpg", tags: ["mandalorian"] },
  { name: "Boba Fett", img: "starwars.bilder/boba.jpg", tags: ["mandalorian", "schmuggel"] },
  { name: "Jango Fett", img: "starwars.bilder/jangofett.jpg", tags: ["mandalorian", "schmuggel"] },
  { name: "Duchess Satine", img: "starwars.bilder/satine.jpg", tags: ["mandalorian"] },
  { name: "Paz Vizsla", img: "starwars.bilder/pazvizsla.jpg", tags: ["mandalorian"] },
  { name: "The Armorer", img: "starwars.bilder/armorer.jpg", tags: ["mandalorian"] },

  // Droiden
  { name: "R2-D2", img: "starwars.bilder/r2d2.jpg", tags: ["droide"] },
  { name: "C-3PO", img: "starwars.bilder/c3po.jpg", tags: ["droide"] },
  { name: "General Grievous", img: "starwars.bilder/grievous.jpg", tags: ["droide", "separatist"] },
  { name: "BB-8", img: "starwars.bilder/bb8.jpg", tags: ["droide"] },
  { name: "K-2SO", img: "starwars.bilder/k2so.jpg", tags: ["droide", "rebell"] },
  { name: "Chopper", img: "starwars.bilder/chopper.jpg", tags: ["droide", "rebell"] },
  { name: "IG-11", img: "starwars.bilder/ig11.jpg", tags: ["droide", "schmuggel"] },

  // Rebellen / Republik
  { name: "Han Solo", img: "starwars.bilder/han.jpg", tags: ["rebell", "schmuggel"] },
  { name: "Leia Organa", img: "starwars.bilder/leia.jpg", tags: ["rebell"] },
  { name: "Chewbacca", img: "starwars.bilder/chewbacca.jpg", tags: ["rebell"] },
  { name: "Lando Calrissian", img: "starwars.bilder/lando.jpg", tags: ["rebell", "schmuggel"] },
  { name: "Jyn Erso", img: "starwars.bilder/jyn.jpg", tags: ["rebell"] },
  { name: "Cassian Andor", img: "starwars.bilder/cassian.jpg", tags: ["rebell"] },
  { name: "Saw Gerrera", img: "starwars.bilder/saw.jpg", tags: ["rebell"] },
  { name: "Mon Mothma", img: "starwars.bilder/monmothma.jpg", tags: ["rebell"] },
  { name: "Admiral Ackbar", img: "starwars.bilder/ackbar.jpg", tags: ["rebell"] },
  { name: "Wedge Antilles", img: "starwars.bilder/wedge.jpg", tags: ["rebell"] },
  { name: "Bail Organa", img: "starwars.bilder/bailorgana.jpg", tags: ["rebell"] },
  { name: "Poe Dameron", img: "starwars.bilder/poe.jpg", tags: ["rebell"] },
  { name: "Finn", img: "starwars.bilder/finn.jpg", tags: ["rebell"] },
  { name: "Rose Tico", img: "starwars.bilder/rose.jpg", tags: ["rebell"] },
  { name: "Vice Admiral Holdo", img: "starwars.bilder/holdo.jpg", tags: ["rebell"] },
  { name: "Hera Syndulla", img: "starwars.bilder/hera.jpg", tags: ["rebell"] },
  { name: "Sabine Wren", img: "starwars.bilder/sabine.jpg", tags: ["rebell", "mandalorian"] },

  // Separatisten
  { name: "Wat Tambor", img: "starwars.bilder/wattambor.jpg", tags: ["separatist"] },
  { name: "Poggle the Lesser", img: "starwars.bilder/poggle.jpg", tags: ["separatist"] },
  { name: "Nute Gunray", img: "starwars.bilder/nutegunray.jpg", tags: ["separatist"] },
  { name: "Admiral Trench", img: "starwars.bilder/trench.jpg", tags: ["separatist"] },
  { name: "San Hill", img: "starwars.bilder/sanhill.jpg", tags: ["separatist"] },

  // Sonstige & Kopfgeldjäger
  { name: "Padmé Amidala", img: "starwars.bilder/padme.jpg", tags: ["sonstige"] },
  { name: "Cad Bane", img: "starwars.bilder/cadbane.jpg", tags: ["sonstige", "schmuggel"] },
  { name: "Hondo Ohnaka", img: "starwars.bilder/hondo.jpg", tags: ["sonstige", "schmuggel"] },
  { name: "Jabba the Hutt", img: "starwars.bilder/jabba.jpg", tags: ["sonstige", "schmuggel"] },
  { name: "Merrin", img: "starwars.bilder/merrin.jpg", tags: ["sonstige"] },
  { name: "Grogu", img: "starwars.bilder/grogu.jpg", tags: ["sonstige"] },
  { name: "Grand Admiral Thrawn", img: "starwars.bilder/thrawn.jpg", tags: ["sonstige"] },
  { name: "Nien Nunb", img: "starwars.bilder/niennunb.jpg", tags: ["sonstige"] },
  { name: "DJ", img: "starwars.bilder/dj.jpg", tags: ["sonstige"] },
  { name: "Enfys Nest", img: "starwars.bilder/enfys.jpg", tags: ["sonstige"] },
  { name: "Dryden Vos", img: "starwars.bilder/dryden.jpg", tags: ["sonstige"] },
  { name: "Qi'ra", img: "starwars.bilder/qira.jpg", tags: ["sonstige"] },

  // Anime (Sonder-Charaktere)
  { name: "Fino Bloodstone", img: "starwars.bilder/finobloodstone.jpg", tags: ["anime"] },
  { name: "Monkey D. Ruffy", img: "starwars.bilder/ruffy.jpg", tags: ["anime"] }
];
