// Logique des "Syllabes magiques" (testée dans tests/etape2.test.js).
// Chaque mot est découpé en syllabes qu'on entend (syllabes orales).
// Collées ensemble, elles redonnent exactement le mot écrit.
// Pour chaque syllabe, "say" est la façon de la prononcer seule
// (la voix de synthèse lit mal "LLON" ou "TEAU" : on lui donne "yon", "to").
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SyllabesLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // [mot, image, [[syllabe écrite, prononciation], ...]]
  const WORDS = [
    // 2 syllabes, simples
    ["LAPIN", "🐰", [["LA", "la"], ["PIN", "pin"]]],
    ["MOTO", "🏍️", [["MO", "mo"], ["TO", "to"]]],
    ["VÉLO", "🚲", [["VÉ", "vé"], ["LO", "lo"]]],
    ["ROBOT", "🤖", [["RO", "ro"], ["BOT", "bo"]]],
    ["PANDA", "🐼", [["PAN", "pan"], ["DA", "da"]]],
    ["KIWI", "🥝", [["KI", "ki"], ["WI", "oui"]]],
    ["MAMAN", "👩", [["MA", "ma"], ["MAN", "man"]]],
    ["PAPA", "👨", [["PA", "pa"], ["PA", "pa"]]],
    ["BÉBÉ", "👶", [["BÉ", "bé"], ["BÉ", "bé"]]],
    ["CAFÉ", "☕", [["CA", "ca"], ["FÉ", "fé"]]],
    ["JUDO", "🥋", [["JU", "ju"], ["DO", "do"]]],
    ["SAPIN", "🌲", [["SA", "sa"], ["PIN", "pin"]]],
    ["DODO", "😴", [["DO", "do"], ["DO", "do"]]],
    ["TORTUE", "🐢", [["TOR", "tor"], ["TUE", "tu"]]],
    ["MOUTON", "🐑", [["MOU", "mou"], ["TON", "ton"]]],
    ["CADEAU", "🎁", [["CA", "ca"], ["DEAU", "do"]]],
    ["BATEAU", "⛵", [["BA", "ba"], ["TEAU", "to"]]],
    ["GÂTEAU", "🎂", [["GÂ", "gâ"], ["TEAU", "to"]]],
    ["CHAPEAU", "🎩", [["CHA", "cha"], ["PEAU", "po"]]],
    ["BANANE", "🍌", [["BA", "ba"], ["NANE", "nane"]]],
    ["TOMATE", "🍅", [["TO", "to"], ["MATE", "mate"]]],
    ["GIRAFE", "🦒", [["GI", "ji"], ["RAFE", "rafe"]]],
    ["PIRATE", "🏴‍☠️", [["PI", "pi"], ["RATE", "rate"]]],
    ["LIMACE", "🐌", [["LI", "li"], ["MACE", "mace"]]],
    ["LUTIN", "🧝", [["LU", "lu"], ["TIN", "tin"]]],
    ["CAROTTE", "🥕", [["CA", "ca"], ["ROTTE", "rotte"]]],
    ["SALADE", "🥗", [["SA", "sa"], ["LADE", "lade"]]],
    ["POMPIER", "🧑‍🚒", [["POM", "pom"], ["PIER", "pié"]]],
    // 3 syllabes
    ["PAPILLON", "🦋", [["PA", "pa"], ["PI", "pi"], ["LLON", "yon"]]],
    ["CHOCOLAT", "🍫", [["CHO", "cho"], ["CO", "co"], ["LAT", "la"]]],
    ["DINOSAURE", "🦕", [["DI", "di"], ["NO", "no"], ["SAURE", "sor"]]],
    ["ÉLÉPHANT", "🐘", [["É", "é"], ["LÉ", "lé"], ["PHANT", "fan"]]],
    ["CANAPÉ", "🛋️", [["CA", "ca"], ["NA", "na"], ["PÉ", "pé"]]],
    ["TÉLÉPHONE", "☎️", [["TÉ", "té"], ["LÉ", "lé"], ["PHONE", "fone"]]],
    ["ANANAS", "🍍", [["A", "a"], ["NA", "na"], ["NAS", "na"]]],
    ["KANGOUROU", "🦘", [["KAN", "kan"], ["GOU", "gou"], ["ROU", "rou"]]],
    ["CROCODILE", "🐊", [["CRO", "cro"], ["CO", "co"], ["DILE", "dile"]]],
    ["PARAPLUIE", "☂️", [["PA", "pa"], ["RA", "ra"], ["PLUIE", "plui"]]],
    ["ÉCUREUIL", "🐿️", [["É", "é"], ["CU", "cu"], ["REUIL", "reuil"]]],
    ["ORDINATEUR", "💻", [["OR", "or"], ["DI", "di"], ["NA", "na"], ["TEUR", "teur"]]],
    ["HÉLICOPTÈRE", "🚁", [["HÉ", "é"], ["LI", "li"], ["COP", "cop"], ["TÈRE", "tère"]]],
    ["LOCOMOTIVE", "🚂", [["LO", "lo"], ["CO", "co"], ["MO", "mo"], ["TIVE", "tive"]]],
  ];

  // Syllabes en plus pour piéger un peu (faciles à prononcer)
  const EXTRA = [["MI", "mi"], ["LU", "lu"], ["RA", "ra"], ["BO", "bo"], ["FA", "fa"], ["NI", "ni"], ["SO", "so"], ["TA", "ta"], ["VI", "vi"], ["PO", "po"], ["DU", "du"], ["LO", "lo"]];

  const syllableCount = (w) => w[2].length;
  // niveau 1 : 2 syllabes ; 2 : 2-3 syllabes + 1 piège ; 3 : 3-4 syllabes + 2 pièges ; 4 : lire le mot et trouver l'image
  function wordsFor(level) {
    if (level <= 1) return WORDS.filter((w) => syllableCount(w) === 2);
    if (level === 2) return WORDS.filter((w) => syllableCount(w) <= 3);
    return WORDS.filter((w) => syllableCount(w) >= 3);
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generate(level, rng = Math.random, avoid = null) {
    const lv = Math.min(4, Math.max(1, level));
    if (lv === 4) return readQuestion(rng, avoid);
    const list = wordsFor(lv).filter((w) => w[0] !== avoid);
    const [word, emoji, syl] = list[Math.floor(rng() * list.length)];
    const nExtra = lv === 1 ? 0 : lv === 2 ? 1 : 2;
    const own = new Set(syl.map((s) => s[0]));
    const extras = shuffle(EXTRA.filter((e) => !own.has(e[0])), rng).slice(0, nExtra);
    // tuiles : chaque syllabe du mot (même en double, ex. PA PA) + les pièges
    const tiles = shuffle([...syl.map((s, i) => ({ text: s[0], say: s[1], part: i })), ...extras.map((e) => ({ text: e[0], say: e[1], part: -1 }))], rng);
    return { mode: "build", word, emoji, syllables: syl.map((s) => ({ text: s[0], say: s[1] })), tiles };
  }

  // Niveau 4 : on lit le mot (découpé en syllabes de couleur) et on choisit la bonne image
  function readQuestion(rng, avoid) {
    const list = WORDS.filter((w) => w[0] !== avoid);
    const [word, emoji, syl] = list[Math.floor(rng() * list.length)];
    const others = shuffle(WORDS.filter((w) => w[0] !== word && w[1] !== emoji), rng).slice(0, 2);
    return { mode: "read", word, emoji, syllables: syl.map((s) => ({ text: s[0], say: s[1] })), options: shuffle([{ emoji, word }, ...others.map((w) => ({ emoji: w[1], word: w[0] }))], rng) };
  }

  // La tuile touchée est-elle la bonne syllabe à placer maintenant ?
  // (si une syllabe existe en double, n'importe laquelle des deux convient)
  const isNext = (q, placedCount, tile) => tile.text === q.syllables[placedCount].text;

  // "pa... pi... yon... PAPILLON !"
  function blendSpeech(q) {
    return q.syllables.map((s) => s.say).join("... ") + "... " + q.word.toLowerCase() + " !";
  }

  // V2 : 3 niveaux (2 syllabes → 2-3 syllabes + piège → mots longs et lecture seule)
  const LEVELS = {
    1: { rounds: 5, internal: [1] },
    2: { rounds: 6, internal: [2] },
    3: { rounds: 7, internal: [3, 4] },
    4: { rounds: 8, internal: [4, 3, 4] }, // Expert : surtout lire seul les mots longs
  };

  return { LEVELS, WORDS, EXTRA, wordsFor, generate, isNext, blendSpeech };
});
