// Les Couleurs : logique et niveaux (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CouleursLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const COLORS = {
    rouge: "#e63946", bleu: "#1d70f5", jaune: "#ffd60a", vert: "#2dc653", orange: "#ff8c1a",
    violet: "#8338ec", rose: "#ff70a6", marron: "#8d5524", noir: "#2b2b2b", blanc: "#fdfdfd",
  };
  const LEVELS = {
    // Facile : 3 ballons, les 4 couleurs de base
    1: { rounds: 5, balloons: 3, palette: ["rouge", "bleu", "jaune", "vert"] },
    // Moyen : 4 ballons, 8 couleurs
    2: { rounds: 6, balloons: 4, palette: ["rouge", "bleu", "jaune", "vert", "orange", "violet", "rose", "marron"] },
    // Difficile : 6 ballons qui se promènent, les 10 couleurs
    3: { rounds: 8, balloons: 6, palette: Object.keys(COLORS), drift: true },
  };
  // "le rouge", mais "l'orange"
  const le = (n) => (/^[aeiou]/.test(n) ? "l'" : "le ") + n;
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function question(level, rng = Math.random, avoid = null) {
    const cfg = LEVELS[level];
    const set = shuffle(cfg.palette, rng).slice(0, cfg.balloons);
    const choices = set.filter((c) => c !== avoid);
    const goal = choices[Math.floor(rng() * choices.length)];
    return { set, goal };
  }
  return { COLORS, LEVELS, le, question };
});
