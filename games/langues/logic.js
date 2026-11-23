// Logique de « Les langues » (testée dans tests/langues.test.js).
// Un cours par thème (les animaux, bonjour, les couleurs…), dans 3 langues : anglais, allemand, espagnol.
// Les 4 niveaux vont du plus simple au plus riche :
//   1 Facile    : on entend le mot en français puis dans la langue, on touche la bonne image (2 images)
//   2 Moyen     : on n'entend que la langue, 4 images
//   3 Difficile : on entend une petite phrase, on trouve l'image (ou un mot parmi 6 images)
//   4 Expert    : on entend la phrase et on la reconstruit, mot par mot
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./data.js"));
  else root.LanguesLogic = factory(root.LanguesData);
})(typeof self !== "undefined" ? self : this, function (D) {
  const LANGS = {
    en: { label: "Anglais", flag: "🇬🇧", locale: "en-GB", inLang: "en anglais" },
    de: { label: "Allemand", flag: "🇩🇪", locale: "de-DE", inLang: "en allemand" },
    es: { label: "Espagnol", flag: "🇪🇸", locale: "es-ES", inLang: "en espagnol" },
  };
  const LEVELS = {
    1: { rounds: 6, mode: "word", choices: 2, french: true },
    2: { rounds: 7, mode: "word", choices: 4, french: false },
    3: { rounds: 8, mode: "sentence", choices: 3, french: false },
    4: { rounds: 6, mode: "build", choices: 0, french: false },
  };

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const wordsOf = (unit) => D.WORDS.filter((w) => w.unit === unit);
  const sentencesOf = (unit) => D.SENTENCES.filter((s) => s.unit === unit);

  // Un mot à trouver parmi n images (jamais deux fois la même image, jamais le même mot deux manches de suite)
  function wordQuestion(unit, n, rng = Math.random, avoid = null) {
    const pool = wordsOf(unit);
    const target = shuffle(pool.filter((w) => w.id !== avoid), rng)[0];
    const others = shuffle(pool.filter((w) => w.id !== target.id && w.e !== target.e), rng).slice(0, n - 1);
    return { kind: "word", target, options: shuffle([target, ...others], rng) };
  }
  // Une phrase à comprendre : la bonne image parmi celles des autres phrases du thème
  function sentenceQuestion(unit, n, rng = Math.random, avoid = null) {
    const pool = sentencesOf(unit);
    if (pool.length < 2) return wordQuestion(unit, 6, rng, avoid);
    const target = shuffle(pool.filter((s) => s.id !== avoid), rng)[0];
    const others = shuffle(pool.filter((s) => s.id !== target.id && s.e !== target.e), rng).slice(0, n - 1);
    return { kind: "sentence", target, options: shuffle([target, ...others], rng) };
  }
  // Les mots d'une phrase, sans la ponctuation finale ; les tuiles sont mélangées (jamais déjà dans l'ordre)
  function words(text) { return text.replace(/[.!?¡¿]/g, "").trim().split(/\s+/); }
  function buildQuestion(unit, lang, rng = Math.random, avoid = null) {
    const pool = sentencesOf(unit);
    const target = shuffle(pool.filter((s) => s.id !== avoid), rng)[0];
    const parts = words(target[lang]);
    let tiles = shuffle(parts.map((t, i) => ({ t, i })), rng);
    for (let k = 0; k < 10 && tiles.every((x, j) => x.t === parts[j]); k++) tiles = shuffle(tiles, rng);
    return { kind: "build", target, parts, tiles };
  }
  function question(level, unit, lang, rng = Math.random, avoid = null) {
    const cfg = LEVELS[level];
    if (cfg.mode === "build") return buildQuestion(unit, lang, rng, avoid);
    if (cfg.mode === "sentence") return rng() < 0.7 ? sentenceQuestion(unit, cfg.choices, rng, avoid) : wordQuestion(unit, 6, rng, avoid);
    return wordQuestion(unit, cfg.choices, rng, avoid);
  }
  // Une tuile est bonne si c'est le mot attendu à cette place (si le mot existe 2 fois, l'un ou l'autre va)
  const isNext = (q, placed, tile) => tile.t === q.parts[placed];

  // Progression : un thème est ouvert quand le précédent a été réussi (au moins une partie finie)
  function unlocked(progress) {
    const out = [D.UNITS[0].id];
    for (let i = 1; i < D.UNITS.length; i++) if (progress[D.UNITS[i - 1].id]) out.push(D.UNITS[i].id); else break;
    return out;
  }

  return { LANGS, LEVELS, UNITS: D.UNITS, WORDS: D.WORDS, SENTENCES: D.SENTENCES, wordsOf, sentencesOf, wordQuestion, sentenceQuestion, buildQuestion, question, isNext, words, unlocked, shuffle };
});
