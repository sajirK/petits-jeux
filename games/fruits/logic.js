// Tranche les fruits : niveaux et règles (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FruitsLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const FRUITS = [
    ["🍉", "#ff4d6d"], ["🍊", "#ff9f1c"], ["🍎", "#e63946"], ["🍋", "#ffd60a"],
    ["🍐", "#b5e48c"], ["🍑", "#ffb4a2"], ["🍍", "#ffd166"], ["🥝", "#80b918"],
    ["🍇", "#9d4edd"], ["🍓", "#ef233c"], ["🥥", "#f8f9fa"], ["🍌", "#ffe66d"],
  ];
  // goal : fruits à couper ; gravity : × hauteur de l'écran ; wave : fruits max lancés ensemble
  // sock / bomb : part de chaussettes et de bombes (à ne pas couper) ; spawn : [min, +aléa] en secondes
  const LEVELS = {
    1: { rounds: 1, goal: 15, gravity: 0.7, wave: 2, sock: 0, bomb: 0, spawn: [1.6, 1.0] },
    2: { rounds: 1, goal: 25, gravity: 0.85, wave: 3, sock: 0.08, bomb: 0, spawn: [1.3, 0.8] },
    3: { rounds: 1, goal: 35, gravity: 1.2, wave: 4, sock: 0.12, bomb: 0.04, spawn: [0.9, 0.7] },
  };
  // un objet lancé : fruit, chaussette, bombe, étoile dorée ou arc-en-ciel
  function nextKind(cfg, rng = Math.random) {
    const r = rng();
    if (r < cfg.sock) return "sock";
    if (r < cfg.sock + cfg.bomb) return "bomb";
    const r2 = rng();
    if (r2 < 0.04) return "rainbow";
    if (r2 < 0.09) return "golden";
    return "fruit";
  }
  // ce que rapporte une coupe (vers l'objectif), et si c'est une erreur
  const VALUE = { fruit: 1, golden: 2, rainbow: 3, sock: 0, bomb: 0 };
  const isMistake = (kind) => kind === "sock" || kind === "bomb";
  // distance d'un point au segment [a, b] (pour savoir si le doigt a touché le fruit)
  function segDist(px, py, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  }
  return { LEVELS, FRUITS, nextKind, VALUE, isMistake, segDist };
});
