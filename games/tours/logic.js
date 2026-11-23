// La Tour des Nombres : logique et niveaux (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ToursLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const NUMBERS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
  const LEVELS = {
    1: { rounds: 5, min: 1, max: 5 },              // construire une tour de 1 à 5
    2: { rounds: 6, min: 3, max: 10 },             // jusqu'à 10
    3: { rounds: 6, min: 3, max: 10, add: true },  // additions : une partie est déjà construite
    4: { rounds: 8, min: 6, max: 10, add: true },  // Expert : additions jusqu'à 10, toujours
  };
  function question(level, rng = Math.random, avoid = null) {
    const cfg = LEVELS[level];
    let target;
    do { target = cfg.min + Math.floor(rng() * (cfg.max - cfg.min + 1)); } while (target === avoid && cfg.max > cfg.min);
    const fixed = cfg.add ? 1 + Math.floor(rng() * (target - 1)) : 0;
    return { target, fixed, toAdd: target - fixed };
  }
  const say = (q) => (q.fixed ? `${NUMBERS[q.fixed]} plus ${NUMBERS[q.toAdd]}, ça fait combien ? Construis la tour !` : `Construis une tour de ${NUMBERS[q.target]} !`);
  const done = (q) => (q.fixed ? `${NUMBERS[q.fixed]} plus ${NUMBERS[q.toAdd]}, égale ${NUMBERS[q.target]} !` : `Une tour de ${NUMBERS[q.target]} !`);
  return { NUMBERS, LEVELS, question, say, done };
});
