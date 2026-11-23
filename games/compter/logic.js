// Je compte : logique et niveaux (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CompterLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // f = féminin, pour dire "une pomme" / "un poisson"
  const THINGS = [
    { e: "🍎", one: "pomme", many: "pommes", f: true }, { e: "🐟", one: "poisson", many: "poissons", f: false },
    { e: "🚗", one: "voiture", many: "voitures", f: true }, { e: "⭐", one: "étoile", many: "étoiles", f: true },
    { e: "🐞", one: "coccinelle", many: "coccinelles", f: true }, { e: "🎈", one: "ballon", many: "ballons", f: false },
    { e: "🍪", one: "biscuit", many: "biscuits", f: false }, { e: "🦆", one: "canard", many: "canards", f: false },
    { e: "🌸", one: "fleur", many: "fleurs", f: true }, { e: "🦖", one: "dinosaure", many: "dinosaures", f: false },
  ];
  const NUMBERS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"];
  const LEVELS = {
    1: { rounds: 6, min: 1, max: 5, options: 3, decoys: 0 },   // de 1 à 5
    2: { rounds: 7, min: 3, max: 10, options: 3, decoys: 0 },  // jusqu'à 10
    3: { rounds: 8, min: 4, max: 10, options: 4, decoys: 4 },  // jusqu'à 10, mélangés avec d'autres objets
    4: { rounds: 8, min: 8, max: 15, options: 4, decoys: 6 },  // Expert : jusqu'à 15, beaucoup de pièges
  };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function question(level, rng = Math.random, avoid = null) {
    const cfg = LEVELS[level];
    let n;
    do { n = cfg.min + Math.floor(rng() * (cfg.max - cfg.min + 1)); } while (n === avoid && cfg.max > cfg.min);
    const [thing, other] = shuffle(THINGS, rng);
    const opts = new Set([n]);
    for (const d of shuffle([1, -1, 2, -2, 3], rng)) { const v = n + d; if (v >= 1 && v <= Math.max(10, cfg.max)) opts.add(v); if (opts.size >= cfg.options) break; }
    // objets "pièges" (niveau 3) : d'une autre sorte, à ne pas compter
    const decoys = cfg.decoys ? Math.max(0, Math.min(cfg.decoys, 21 - n)) : 0;
    const items = shuffle([...Array(n).fill(thing.e), ...Array(decoys).fill(other.e)], rng);
    return { n, thing, other: decoys ? other : null, items, options: shuffle([...opts], rng) };
  }
  const say = (q) => `Combien de ${q.thing.many} ?`;
  const countWord = (n, t) => (n === 1 ? (t.f ? "une" : "un") : NUMBERS[n]);
  return { THINGS, NUMBERS, LEVELS, question, say, countWord };
});
