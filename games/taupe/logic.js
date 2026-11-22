// Tape la Taupe : niveaux et règles (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TaupeLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // goal : taupes à attraper ; holes : trous ; stay : temps hors du trou (ms) ; gap : temps entre deux taupes
  // bats : part de chauves-souris farceuses (à ne pas toucher) ; bonus : part de taupes étoilées (comptent 2)
  const LEVELS = {
    1: { rounds: 1, goal: 10, holes: 6, stay: 2400, gap: 1200, bats: 0, bonus: 0.1 },
    2: { rounds: 1, goal: 15, holes: 9, stay: 1700, gap: 900, bats: 0.15, bonus: 0.1 },
    3: { rounds: 1, goal: 20, holes: 9, stay: 1200, gap: 700, bats: 0.25, bonus: 0.1 },
  };
  const CRITTERS = ["🐹", "🐹", "🐹", "🐰", "🐭", "🦔", "🐻"];
  function nextType(cfg, rng = Math.random) {
    const r = rng();
    if (r < cfg.bats) return "bat";
    if (r < cfg.bats + cfg.bonus) return "bonus";
    return "normal";
  }
  // ce que rapporte une touche : la chauve-souris ne rapporte rien et compte comme une erreur
  const points = (type) => (type === "bonus" ? 2 : type === "bat" ? 0 : 1);
  const isMistake = (type) => type === "bat";
  return { LEVELS, CRITTERS, nextType, points, isMistake };
});
