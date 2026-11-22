// Les Lettres (écrire des mots avec des lettres) : logique et niveaux
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LettresLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // [mot en capitales sans accent sur les tuiles, image, mot dit à voix haute]
  const WORDS = [
    ["CHAT", "🐱", "chat"], ["LION", "🦁", "lion"], ["LUNE", "🌙", "lune"], ["OURS", "🐻", "ours"], ["DINO", "🦖", "dino"],
    ["PAPA", "👨", "papa"], ["AUTO", "🚗", "auto"], ["BEBE", "👶", "bébé"], ["VELO", "🚲", "vélo"], ["MOTO", "🏍️", "moto"],
    ["MAMAN", "👩", "maman"], ["VACHE", "🐮", "vache"], ["ROBOT", "🤖", "robot"], ["POMME", "🍎", "pomme"], ["ARBRE", "🌳", "arbre"],
    ["LAPIN", "🐰", "lapin"], ["PANDA", "🐼", "panda"], ["TIGRE", "🐯", "tigre"], ["SAPIN", "🌲", "sapin"],
    ["SOLEIL", "☀️", "soleil"], ["BATEAU", "⛵", "bateau"], ["CANARD", "🦆", "canard"], ["FUSEE", "🚀", "fusée"], ["TORTUE", "🐢", "tortue"],
  ];
  const LEVELS = {
    1: { rounds: 4, minLen: 4, maxLen: 4, extras: 0 },  // mots de 4 lettres, sans lettre en trop
    2: { rounds: 5, minLen: 4, maxLen: 5, extras: 1 },  // une lettre en trop
    3: { rounds: 6, minLen: 5, maxLen: 6, extras: 2 },  // mots plus longs, deux lettres en trop
  };
  const LETTER_NAMES = { A: "a", B: "bé", C: "cé", D: "dé", E: "e", F: "effe", G: "gé", H: "hache", I: "i", J: "ji", K: "ka", L: "elle", M: "emme", N: "enne", O: "o", P: "pé", Q: "ku", R: "erre", S: "esse", T: "té", U: "u", V: "vé", W: "double vé", X: "ixe", Y: "i grec", Z: "zède" };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Une partie : des mots de la bonne longueur, tous différents
  function words(level, rng = Math.random) {
    const cfg = LEVELS[level];
    return shuffle(WORDS.filter((w) => w[0].length >= cfg.minLen && w[0].length <= cfg.maxLen), rng).slice(0, cfg.rounds);
  }
  // Les tuiles : les lettres du mot + des lettres en plus (jamais une lettre du mot)
  function tiles(word, level, rng = Math.random) {
    const extras = shuffle("ABCDEFGILMNOPRSTU".split("").filter((l) => !word.includes(l)), rng).slice(0, LEVELS[level].extras);
    return shuffle([...word.split(""), ...extras], rng);
  }
  // Prénom de l'enfant en capitales sans accent (null s'il ne convient pas)
  function nameWord(name) {
    const w = String(name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
    return w.length >= 2 && w.length <= 7 ? w : null;
  }
  return { WORDS, LEVELS, LETTER_NAMES, words, tiles, nameWord };
});
