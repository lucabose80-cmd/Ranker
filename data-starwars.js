// data-starwars.js
export const starWarsCharacters = [
  // Klone (501st, 212th, Bad Batch, Commander, ARC, Soldat)
  { name: "Captain Rex",             img: "starwars.bilder/Captain_Rex.jpg",        tags: ["klon", "501st", "captain"] },
  { name: "Commander Cody",          img: "starwars.bilder/cody.jpg",               tags: ["klon", "212th", "commander"] },
  { name: "Fives",                   img: "starwars.bilder/fives.jpg",              tags: ["klon", "501st", "arc"] },
  { name: "Echo",                    img: "starwars.bilder/echo.jpg",               tags: ["klon", "501st", "bad_batch", "arc"] },
  { name: "Jesse",                   img: "starwars.bilder/jesse.jpg",              tags: ["klon", "501st", "arc"] },
  { name: "Wolffe",                  img: "starwars.bilder/wolffe.jpg",             tags: ["klon", "104th", "commander"] },
  { name: "Gregor",                  img: "starwars.bilder/gregor.jpg",             tags: ["klon", "212th", "soldat"] },
  { name: "Commander Bly",           img: "starwars.bilder/bly.jpg",                tags: ["klon", "commander"] },
  { name: "Waxer",                   img: "starwars.bilder/waxer.jpg",              tags: ["klon", "212th", "soldat"] },
  { name: "Boil",                    img: "starwars.bilder/Boil.jpg",               tags: ["klon", "212th", "soldat"] },
  { name: "Commander Thorn",         img: "starwars.bilder/thorn.jpg",              tags: ["klon", "coruscant_guard", "commander"] },
  { name: "Commander Fox",           img: "starwars.bilder/fox.jpg",                tags: ["klon", "coruscant_guard", "commander"] },
  { name: "Kix",                     img: "starwars.bilder/kix.jpg",                tags: ["klon", "501st", "soldat"] },
  { name: "Cameron",                 img: "starwars.bilder/cameron.jpg",            tags: ["klon", "soldat"] },
  { name: "Commander Gree",          img: "starwars.bilder/gree.jpg",               tags: ["klon", "commander"] },
  { name: "Commander Doom",          img: "starwars.bilder/doom.jpg",               tags: ["klon", "commander"] },
  { name: "Commander Bacara",        img: "starwars.bilder/bacara.jpg",             tags: ["klon", "commander"] },
  { name: "Hevy",                    img: "starwars.bilder/hevy.jpg",               tags: ["klon", "soldat"] },
  { name: "Flash",                   img: "starwars.bilder/flash.jpg",              tags: ["klon", "soldat"] },
  { name: "Lucky",                   img: "starwars.bilder/lucky.jpg",              tags: ["klon", "soldat"] },
  { name: "Scorch",                  img: "starwars.bilder/scorch.jpg",             tags: ["klon", "soldat"] },
  { name: "Hunter",                  img: "starwars.bilder/hunter.jpg",             tags: ["klon", "bad_batch", "commander"] },
  { name: "Wrecker",                 img: "starwars.bilder/wrecker.jpg",            tags: ["klon", "bad_batch", "soldat"] },
  { name: "Tech",                    img: "starwars.bilder/tech.jpg",               tags: ["klon", "bad_batch", "soldat"] },
  { name: "Crosshair",               img: "starwars.bilder/crosshair.jpg",          tags: ["klon", "bad_batch", "imperium", "soldat"] },
  { name: "Omega",                   img: "starwars.bilder/omega.jpg",              tags: ["klon", "bad_batch"] },
  { name: "Commander Appo",          img: "starwars.bilder/appo.jpg",               tags: ["klon", "501st", "commander"] }, // NEU
  { name: "Tup",                     img: "starwars.bilder/tup.jpg",                tags: ["klon", "501st", "soldat"] }, // NEU
  { name: "Hardcase",                img: "starwars.bilder/hardcase.jpg",           tags: ["klon", "501st", "soldat"] }, // NEU
  { name: "Dogma",                   img: "starwars.bilder/dogma.jpg",              tags: ["klon", "501st", "soldat"] }, // NEU
  { name: "Havoc",                   img: "starwars.bilder/havoc.jpg",              tags: ["klon", "arc"] }, // NEU
  { name: "Colt",                    img: "starwars.bilder/colt.jpg",               tags: ["klon", "arc"] }, // NEU

  // Jedi
  { name: "Luke Skywalker",          img: "starwars.bilder/luke.jpg",               tags: ["jedi", "rebell", "meister"] },
  { name: "Obi-Wan Kenobi",          img: "starwars.bilder/obiwan.jpg",             tags: ["jedi", "meister", "212th"] },
  { name: "Yoda",                    img: "starwars.bilder/yoda.jpg",               tags: ["jedi", "meister"] },
  { name: "Anakin Skywalker",        img: "starwars.bilder/anakin.jpg",             tags: ["jedi", "padawan", "501st"] },
  { name: "Mace Windu",              img: "starwars.bilder/mace.jpg",               tags: ["jedi", "meister"] },
  { name: "Qui-Gon Jinn",            img: "starwars.bilder/quigon.jpg",             tags: ["jedi", "meister"] },
  { name: "Ahsoka Tano",             img: "starwars.bilder/ahsoka.jpg",             tags: ["jedi", "grau", "padawan", "501st", "heiss"] },
  { name: "Kit Fisto",               img: "starwars.bilder/kitfisto.jpg",           tags: ["jedi", "meister"] },
  { name: "Plo Koon",                img: "starwars.bilder/plokoon.jpg",            tags: ["jedi", "meister", "104th"] },
  { name: "Ki-Adi-Mundi",            img: "starwars.bilder/kiadimundi.jpg",         tags: ["jedi", "meister"] },
  { name: "Aayla Secura",            img: "starwars.bilder/aaylasecura.jpg",        tags: ["jedi", "meister", "heiss"] },
  { name: "Coleman Trebor",          img: "starwars.bilder/colemantrebor.jpg",      tags: ["jedi", "meister"] },
  { name: "Shaak Ti",                img: "starwars.bilder/shaakti.jpg",            tags: ["jedi", "meister"] },
  { name: "Luminara Unduli",         img: "starwars.bilder/luminara.jpg",           tags: ["jedi", "meister"] },
  { name: "Ezra Bridger",            img: "starwars.bilder/ezra.jpg",               tags: ["jedi", "rebell", "padawan"] },
  { name: "Kanan Jarrus",            img: "starwars.bilder/kanan.jpg",              tags: ["jedi", "rebell"] },
  { name: "Cal Kestis",              img: "starwars.bilder/cal.jpg",                tags: ["jedi", "padawan", "videospiel"] },
  { name: "Rey Skywalker",           img: "starwars.bilder/rey.jpg",                tags: ["jedi", "widerstand", "heiss"] },
  { name: "Cere Junda",              img: "starwars.bilder/cere.jpg",               tags: ["jedi", "meister", "videospiel"] }, // NEU
  { name: "Barriss Offee",           img: "starwars.bilder/barriss.jpg",            tags: ["jedi", "padawan"] }, // NEU
  { name: "Nahdar Vebb",             img: "starwars.bilder/nahdar.jpg",             tags: ["jedi", "padawan"] }, // NEU
  { name: "Zett Jukassa",            img: "starwars.bilder/zett.jpg",               tags: ["jedi", "padawan"] }, // NEU
  { name: "Gungi",                   img: "starwars.bilder/gungi.jpg",              tags: ["jedi", "padawan"] }, // NEU
  { name: "Katooni",                 img: "starwars.bilder/katooni.jpg",            tags: ["jedi", "padawan"] }, // NEU
  { name: "Petro",                   img: "starwars.bilder/petro.jpg",              tags: ["jedi", "padawan"] }, // NEU
  { name: "Yaddle",                  img: "starwars.bilder/yaddle.jpg",             tags: ["jedi", "meister"] }, // NEU
  { name: "Even Piell",              img: "starwars.bilder/evenpiell.jpg",          tags: ["jedi", "meister"] }, // NEU
  { name: "Saesee Tiin",             img: "starwars.bilder/saeseetiin.jpg",         tags: ["jedi", "meister"] }, // NEU

  // Sith
  { name: "Darth Vader",             img: "starwars.bilder/vader.jpg",              tags: ["sith", "imperium", "501st"] },
  { name: "Emperor Palpatine",       img: "starwars.bilder/palpatine.jpg",          tags: ["sith", "imperium", "senat"] },
  { name: "Darth Maul",              img: "starwars.bilder/maul.jpg",               tags: ["sith", "dathomir", "unterwelt"] },
  { name: "Count Dooku",             img: "starwars.bilder/dooku.jpg",              tags: ["sith", "separatist"] },
  { name: "Darth Plagueis",          img: "starwars.bilder/plagueis.jpg",           tags: ["sith"] },

  // Imperium & Erste Ordnung
  { name: "Kylo Ren",                img: "starwars.bilder/kyloren.jpg",            tags: ["erste_ordnung"] },
  { name: "Captain Phasma",          img: "starwars.bilder/phasma.jpg",             tags: ["erste_ordnung"] },
  { name: "Grand Admiral Thrawn",    img: "starwars.bilder/thrawn.jpg",             tags: ["imperium"] },
  { name: "Grand Inquisitor",        img: "starwars.bilder/grandinquisitor.jpg",    tags: ["imperium", "inquisitor"] },
  { name: "General Hux",             img: "starwars.bilder/hux.jpg",                tags: ["erste_ordnung"] }, // NEU
  { name: "Supreme Leader Snoke",    img: "starwars.bilder/snoke.jpg",              tags: ["erste_ordnung", "grau"] }, // NEU
  { name: "FN-2199",                 img: "starwars.bilder/fn2199.jpg",             tags: ["erste_ordnung"] }, // NEU
  { name: "Sith Trooper",            img: "starwars.bilder/sithtrooper.jpg",        tags: ["erste_ordnung"] }, // NEU
  { name: "Allegiant General Pryde", img: "starwars.bilder/pryde.jpg",              tags: ["erste_ordnung"] }, // NEU
  { name: "Captain Peavey",          img: "starwars.bilder/peavey.jpg",             tags: ["erste_ordnung"] }, // NEU
  { name: "Executioner Trooper",     img: "starwars.bilder/executioner.jpg",        tags: ["erste_ordnung"] }, // NEU
  { name: "Moff Gideon",             img: "starwars.bilder/gideon.jpg",             tags: ["imperium"] }, // NEU
  { name: "Director Krennic",        img: "starwars.bilder/krennic.jpg",            tags: ["imperium"] }, // NEU
  { name: "Admiral Piett",           img: "starwars.bilder/piett.jpg",              tags: ["imperium"] }, // NEU
  { name: "Grand Moff Tarkin",       img: "starwars.bilder/tarkin.jpg",             tags: ["imperium"] }, // NEU
  { name: "Imperial Royal Guard",    img: "starwars.bilder/royalguard.jpg",         tags: ["imperium"] }, // NEU
  { name: "Iden Versio",             img: "starwars.bilder/idenversio.jpg",         tags: ["imperium", "videospiel", "rebell", "heiss"] }, // NEU
  { name: "Second Sister",           img: "starwars.bilder/secondsister.jpg",       tags: ["inquisitor", "imperium", "videospiel"] }, // NEU
  { name: "Third Sister",            img: "starwars.bilder/thirdsister.jpg",        tags: ["inquisitor", "imperium"] }, // NEU
  { name: "Fifth Brother",           img: "starwars.bilder/fifthbrother.jpg",       tags: ["inquisitor", "imperium"] }, // NEU
  { name: "Seventh Sister",          img: "starwars.bilder/seventhsister.jpg",      tags: ["inquisitor", "imperium"] }, // NEU

  // Graue Machtnutzer & Dathomir
  { name: "Asajj Ventress",          img: "starwars.bilder/ventress.jpg",           tags: ["nachtschwester", "dathomir", "separatist"] },
  { name: "Savage Opress",           img: "starwars.bilder/savageopress.jpg",       tags: ["dathomir"] },
  { name: "Baylan Skoll",            img: "starwars.bilder/baylan.jpg",             tags: ["grau"] },
  { name: "Shin Hati",               img: "starwars.bilder/shin.jpg",               tags: ["grau", "heiss"] },
  { name: "Merrin",                  img: "starwars.bilder/merrin.jpg",             tags: ["nachtschwester", "dathomir", "videospiel", "heiss"] },
  { name: "Morgan Elsbeth",          img: "starwars.bilder/morgan.jpg",             tags: ["nachtschwester", "dathomir"] },
  { name: "Mother Talzin",           img: "starwars.bilder/talzin.jpg",             tags: ["nachtschwester", "dathomir"] }, // NEU
  { name: "Starkiller",              img: "starwars.bilder/starkiller.jpg",         tags: ["grau", "videospiel"] }, // NEU

  // Mandalorianer
  { name: "Din Djarin",              img: "starwars.bilder/mandalorian.jpg",        tags: ["mandalorian", "kopfgeldjäger"] },
  { name: "Bo-Katan Kryze",          img: "starwars.bilder/bokatan.jpg",            tags: ["mandalorian", "heiss"] },
  { name: "Boba Fett",               img: "starwars.bilder/boba.jpg",               tags: ["mandalorian", "kopfgeldjäger"] },
  { name: "Jango Fett",              img: "starwars.bilder/jangofett.jpg",          tags: ["mandalorian", "kopfgeldjäger"] },
  { name: "Duchess Satine",          img: "starwars.bilder/satine.jpg",             tags: ["mandalorian"] },
  { name: "Paz Vizsla",              img: "starwars.bilder/pazvizsla.jpg",          tags: ["mandalorian"] },
  { name: "The Armorer",             img: "starwars.bilder/armorer.jpg",            tags: ["mandalorian"] },
  { name: "Pre Vizsla",              img: "starwars.bilder/previzsla.jpg",          tags: ["mandalorian", "unterwelt", "death_watch"] },
  { name: "Ursa Wren",               img: "starwars.bilder/ursawren.jpg",           tags: ["mandalorian"] }, // NEU
  { name: "Koska Reeves",            img: "starwars.bilder/koskareeves.jpg",        tags: ["mandalorian"] }, // NEU
  { name: "Axe Woves",               img: "starwars.bilder/axewoves.jpg",           tags: ["mandalorian"] }, // NEU
  { name: "Fenn Rau",                img: "starwars.bilder/fennrau.jpg",            tags: ["mandalorian"] }, // NEU
  { name: "Gar Saxon",               img: "starwars.bilder/garsaxon.jpg",           tags: ["mandalorian", "death_watch", "imperium"] }, // NEU
  { name: "Tiber Saxon",             img: "starwars.bilder/tibersaxon.jpg",         tags: ["mandalorian", "death_watch", "imperium"] }, // NEU
  { name: "Rook Kast",               img: "starwars.bilder/rookkast.jpg",           tags: ["mandalorian", "death_watch"] }, // NEU
  { name: "Death Watch Warrior",     img: "starwars.bilder/deathwatchwarrior.jpg",  tags: ["mandalorian", "death_watch"] }, // NEU

  // Droiden
  { name: "R2-D2",                   img: "starwars.bilder/r2d2.jpg",               tags: ["droide", "rebell", "redet_nicht"] },
  { name: "C-3PO",                   img: "starwars.bilder/c3po.jpg",               tags: ["droide", "rebell"] },
  { name: "General Grievous",        img: "starwars.bilder/grievous.jpg",           tags: ["droide", "separatist"] },
  { name: "BB-8",                    img: "starwars.bilder/bb8.jpg",                tags: ["droide", "widerstand", "redet_nicht"] },
  { name: "K-2SO",                   img: "starwars.bilder/k2so.jpg",               tags: ["droide", "rebell"] },
  { name: "Chopper",                 img: "starwars.bilder/chopper.jpg",            tags: ["droide", "rebell", "redet_nicht"] },
  { name: "B1 Battle Droide",        img: "starwars.bilder/b1.jpg",                 tags: ["droide", "separatist"] }, // NEU
  { name: "Kommando Droide",         img: "starwars.bilder/kommandodroide.jpg",     tags: ["droide", "separatist"] }, // NEU
  { name: "HK-47",                   img: "starwars.bilder/hk47.jpg",               tags: ["droide", "videospiel", "kopfgeldjäger"] }, // NEU
  { name: "L3-37",                   img: "starwars.bilder/l337.jpg",               tags: ["droide", "schmuggel", "rebell"] }, // NEU
  { name: "D-O",                     img: "starwars.bilder/do.jpg",                 tags: ["droide", "widerstand", "redet_nicht"] }, // NEU
  { name: "IG-88",                   img: "starwars.bilder/ig88.jpg",               tags: ["droide", "kopfgeldjäger"] }, // NEU
  { name: "AZI-3",                   img: "starwars.bilder/azi3.jpg",               tags: ["droide", "klon"] }, // NEU
  { name: "B2 Super Battle Droide",  img: "starwars.bilder/b2.jpg",                 tags: ["droide", "separatist"] }, // NEU
  { name: "BB-9E",                   img: "starwars.bilder/bb9e.jpg",               tags: ["droide", "erste_ordnung", "redet_nicht"] }, // NEU

  // Rebellen
  { name: "Han Solo",                img: "starwars.bilder/han.jpg",                tags: ["rebell", "schmuggel", "unterwelt"] },
  { name: "Leia Organa",             img: "starwars.bilder/leia.jpg",               tags: ["rebell", "widerstand", "senat", "heiss"] },
  { name: "Chewbacca",               img: "starwars.bilder/chewbacca.jpg",          tags: ["rebell", "widerstand", "redet_nicht"] },
  { name: "Lando Calrissian",        img: "starwars.bilder/lando.jpg",              tags: ["rebell", "schmuggel", "unterwelt"] },
  { name: "Jyn Erso",                img: "starwars.bilder/jyn.jpg",                tags: ["rebell"] },
  { name: "Cassian Andor",           img: "starwars.bilder/cassian.jpg",            tags: ["rebell"] },
  { name: "Saw Gerrera",             img: "starwars.bilder/saw.jpg",                tags: ["rebell"] },
  { name: "Mon Mothma",              img: "starwars.bilder/monmothma.jpg",          tags: ["rebell", "senat"] },
  { name: "Admiral Ackbar",          img: "starwars.bilder/ackbar.jpg",             tags: ["rebell", "widerstand"] },
  { name: "Wedge Antilles",          img: "starwars.bilder/wedge.jpg",              tags: ["rebell"] },
  { name: "Hera Syndulla",           img: "starwars.bilder/hera.jpg",               tags: ["rebell"] },
  { name: "Sabine Wren",             img: "starwars.bilder/sabine.jpg",             tags: ["rebell", "mandalorian"] },
  { name: "Nien Nunb",               img: "starwars.bilder/niennunb.jpg",           tags: ["rebell", "redet_nicht"] },
  
  // Widerstand
  { name: "Poe Dameron",             img: "starwars.bilder/poe.jpg",                tags: ["widerstand"] },
  { name: "Finn",                    img: "starwars.bilder/finn.jpg",               tags: ["widerstand"] },
  { name: "Rose Tico",               img: "starwars.bilder/rose.jpg",               tags: ["widerstand"] },
  { name: "Vice Admiral Holdo",      img: "starwars.bilder/holdo.jpg",              tags: ["widerstand"] },
  { name: "Maz Kanata",              img: "starwars.bilder/maz.jpg",                tags: ["widerstand", "unterwelt"] }, // NEU

  // Separatisten
  { name: "Wat Tambor",              img: "starwars.bilder/wattambor.jpg",          tags: ["separatist"] },
  { name: "Poggle the Lesser",       img: "starwars.bilder/poggle.jpg",             tags: ["separatist", "redet_nicht"] },
  { name: "Nute Gunray",             img: "starwars.bilder/nutegunray.jpg",         tags: ["separatist"] },
  { name: "Admiral Trench",          img: "starwars.bilder/trench.jpg",             tags: ["separatist"] },
  { name: "San Hill",                img: "starwars.bilder/sanhill.jpg",            tags: ["separatist"] },
  { name: "Lux Bonteri",             img: "starwars.bilder/luxbonteri.jpg",         tags: ["separatist", "senat"] },
  { name: "General Kalani",          img: "starwars.bilder/kalani.jpg",             tags: ["separatist", "droide"] }, // NEU

  // Kopfgeldjäger & Unterwelt
  { name: "Cad Bane",                img: "starwars.bilder/cadbane.jpg",            tags: ["kopfgeldjäger", "unterwelt"] },
  { name: "Jabba the Hutt",          img: "starwars.bilder/jabba.jpg",              tags: ["unterwelt", "hutte"] },
  { name: "Hondo Ohnaka",            img: "starwars.bilder/hondo.jpg",              tags: ["unterwelt", "pirat"] },
  { name: "DJ",                      img: "starwars.bilder/dj.jpg",                 tags: ["unterwelt", "schmuggel"] },
  { name: "Enfys Nest",              img: "starwars.bilder/enfys.jpg",              tags: ["unterwelt", "pirat"] },
  { name: "Dryden Vos",              img: "starwars.bilder/dryden.jpg",             tags: ["unterwelt"] },
  { name: "Qi'ra",                   img: "starwars.bilder/qira.jpg",               tags: ["unterwelt", "heiss", "schmuggel"] },
  { name: "IG-11",                   img: "starwars.bilder/ig11.jpg",               tags: ["droide", "kopfgeldjäger"] },
  { name: "Dash Rendar",             img: "starwars.bilder/dash.jpg",               tags: ["schmuggel", "unterwelt", "videospiel"] }, // NEU
  { name: "Doctor Aphra",            img: "starwars.bilder/aphra.jpg",              tags: ["schmuggel", "unterwelt", "heiss"] }, // NEU
  { name: "Gorian Shard",            img: "starwars.bilder/gorianshard.jpg",        tags: ["pirat", "unterwelt"] }, // NEU
  { name: "Kragan Gorr",             img: "starwars.bilder/kragangorr.jpg",         tags: ["pirat", "unterwelt"] }, // NEU
  { name: "Vane",                    img: "starwars.bilder/vane.jpg",               tags: ["pirat", "unterwelt"] }, // NEU
  { name: "Rotta the Hutt",          img: "starwars.bilder/rotta.jpg",              tags: ["hutte", "unterwelt"] }, // NEU
  { name: "Ziro the Hutt",           img: "starwars.bilder/ziro.jpg",               tags: ["hutte", "unterwelt"] }, // NEU
  { name: "Gardulla the Hutt",       img: "starwars.bilder/gardulla.jpg",           tags: ["hutte", "unterwelt"] }, // NEU
  { name: "The Twins",               img: "starwars.bilder/twins.jpg",              tags: ["hutte", "unterwelt"] }, // NEU
  { name: "Gamorrean Guard",         img: "starwars.bilder/gamorrean.jpg",          tags: ["unterwelt", "monster", "redet_nicht"] }, // NEU
  { name: "Benthic Two Tubes",       img: "starwars.bilder/twotubes.jpg",           tags: ["unterwelt", "rebell"] }, // NEU
  { name: "Bib Fortuna",             img: "starwars.bilder/bibfortuna.jpg",         tags: ["unterwelt"] }, // NEU
  { name: "Zam Wesell",              img: "starwars.bilder/zam.jpg",                tags: ["unterwelt", "kopfgeldjäger"] }, // NEU
  { name: "Embo",                    img: "starwars.bilder/embo.jpg",               tags: ["kopfgeldjäger", "unterwelt"] }, // NEU
  { name: "Aurra Sing",              img: "starwars.bilder/aurrasing.jpg",          tags: ["kopfgeldjäger", "unterwelt"] }, // NEU
  { name: "Bossk",                   img: "starwars.bilder/bossk.jpg",              tags: ["kopfgeldjäger", "unterwelt"] }, // NEU
  { name: "Dengar",                  img: "starwars.bilder/dengar.jpg",             tags: ["kopfgeldjäger", "unterwelt"] }, // NEU
  { name: "Fennec Shand",            img: "starwars.bilder/fennec.jpg",             tags: ["kopfgeldjäger", "unterwelt", "heiss"] }, // NEU

  // Republik & Sonstige
  { name: "Padme Amidala",           img: "starwars.bilder/padme.jpg",              tags: ["senat", "heiss"] },
  { name: "Bail Organa",             img: "starwars.bilder/bailorgana.jpg",         tags: ["rebell", "senat"] },
  { name: "Grogu",                   img: "starwars.bilder/grogu.jpg",              tags: ["mandalorian", "redet_nicht"] },
  { name: "Mas Amedda",              img: "starwars.bilder/masamedda.jpg",          tags: ["senat"] }, // NEU
  { name: "Valorum",                 img: "starwars.bilder/valorum.jpg",            tags: ["senat"] }, // NEU
  { name: "Orn Free Taa",            img: "starwars.bilder/ornfreetaa.jpg",         tags: ["senat"] }, // NEU
  { name: "Riyo Chuchi",             img: "starwars.bilder/riyochuchi.jpg",         tags: ["senat", "heiss"] }, // NEU

  // Monster
  { name: "Rancor",                  img: "starwars.bilder/rancor.jpg",             tags: ["monster", "redet_nicht"] },
  { name: "Wampa",                   img: "starwars.bilder/wampa.jpg",              tags: ["monster", "redet_nicht"] },
  { name: "Sarlacc",                 img: "starwars.bilder/sarlacc.jpg",            tags: ["monster", "redet_nicht"] },
  { name: "Nexu",                    img: "starwars.bilder/nexu.jpg",               tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Acklay",                  img: "starwars.bilder/acklay.jpg",             tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Reek",                    img: "starwars.bilder/reek.jpg",               tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Rathtar",                 img: "starwars.bilder/rathtar.jpg",            tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Zillo Beast",             img: "starwars.bilder/zillobeast.jpg",         tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Gorog",                   img: "starwars.bilder/gorog.jpg",              tags: ["monster", "redet_nicht"] }, // NEU
  { name: "Mudhorn",                 img: "starwars.bilder/mudhorn.jpg",            tags: ["monster", "redet_nicht"] }, // NEU

  // Anime (Sonder-Charaktere)
  { name: "Fino Bloodstone",         img: "starwars.bilder/finobloodstone.jpg",     tags: ["anime"] },
  { name: "Monkey D. Ruffy",         img: "starwars.bilder/ruffy.jpg",              tags: ["anime"] }
];
