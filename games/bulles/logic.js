// Les bulles : niveaux et règles (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BullesLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const COLORS = {
    bleues: "#4dabf7", roses: "#f783ac", vertes: "#69db7c", jaunes: "#ffd43b",
  };
  // goal : bulles à éclater ; color : seulement celles de la couleur demandée (change toutes les "every")
  // speed : vitesse de montée ; size : [min, max] en px ; max : bulles à l'écran
  const LEVELS = {
    1: { rounds: 1, goal: 12, color: false, speed: 0.55, size: [110, 160], max: 8 },
    2: { rounds: 1, goal: 18, color: true, every: 6, speed: 0.85, size: [90, 140], max: 10 },
    3: { rounds: 1, goal: 24, color: true, every: 4, speed: 1.25, size: [72, 120], max: 12 },
  };
  const SURPRISES = ["🐟", "🐙", "🦆", "🐸", "🦄", "🐱", "🐶", "🐥", "🦋", "🐢", "🐳", "🍓", "🍭", "⭐"];
  const isGood = (cfg, color, target) => !cfg.color || color === target;
  // une nouvelle couleur à chercher (jamais la même deux fois de suite)
  function nextTarget(prev, rng = Math.random) {
    const list = Object.keys(COLORS).filter((c) => c !== prev);
    return list[Math.floor(rng() * list.length)];
  }
  // la couleur d'une nouvelle bulle : au moins 1 sur 3 est de la bonne couleur, pour ne jamais attendre
  function bubbleColor(cfg, target, rng = Math.random) {
    if (cfg.color && rng() < 0.35) return target;
    const all = Object.keys(COLORS);
    return all[Math.floor(rng() * all.length)];
  }
  return { LEVELS, COLORS, SURPRISES, isGood, nextTarget, bubbleColor };
});
