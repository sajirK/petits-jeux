// Logique de "Réflexe Éclair" (testée dans tests/reflexe.test.js).
// Jeu "go / no-go" : toucher seulement ce que la règle demande.
// Ça entraîne les réflexes ET le contrôle de soi (ne pas toucher le reste).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ReflexeLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const RULES = [
    {
      id: "grenouille", say: "Touche les grenouilles ! Pas les abeilles, ça pique !", short: "Touche 🐸 pas 🐝",
      go: ["🐸"], nogo: ["🐝"],
    },
    {
      id: "rouge", say: "Touche seulement les ballons rouges !", short: "Touche les ballons rouges",
      go: ["red"], nogo: ["blue", "green", "yellow"], balloons: true,
    },
    {
      id: "fruits", say: "Touche les fruits ! Pas les chaussettes !", short: "Touche les fruits 🍎",
      go: ["🍎", "🍌", "🍓", "🍇", "🍊"], nogo: ["🧦", "👟", "🧢"],
    },
    {
      id: "cinq", say: "Touche seulement le chiffre 5 !", short: "Touche le 5",
      go: ["5"], nogo: ["2", "3", "6", "8", "S"], digits: true,
    },
    {
      id: "animaux-mer", say: "Touche les animaux de la mer !", short: "Touche les animaux de la mer 🐟",
      go: ["🐟", "🐙", "🦀", "🐬", "🐳"], nogo: ["🐄", "🐔", "🐶", "🦁"],
    },
  ];

  // Proportion de "bons" objets : 65 % (assez pour s'amuser, assez de pièges pour réfléchir)
  function nextItem(rule, rng = Math.random, goRatio = 0.65) {
    const go = rng() < goRatio;
    const list = go ? rule.go : rule.nogo;
    return { value: list[Math.floor(rng() * list.length)], go };
  }

  // Temps généreux : le jeu accélère peu pour laisser le temps de viser.
  function lifetime(hits) {
    return Math.max(1800, 2600 - hits * 8);
  }

  // Points : bonne touche +1, mauvaise touche -1 (jamais en dessous de 0)
  function score(current, wasGo) {
    return Math.max(0, current + (wasGo ? 1 : -1));
  }

  function average(times) {
    if (!times.length) return null;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  // V2 : 3 niveaux. goal : bonnes touches pour finir ; life : temps à l'écran ; gap : rythme
  // Facile : règles faciles (grenouilles, fruits), lent, beaucoup de bons objets
  // Moyen : toutes les règles sauf les chiffres ; Difficile : toutes, et la règle change à mi-parcours
  const LEVELS = {
    1: { rounds: 1, goal: 10, rules: ["grenouille", "fruits"], life: 3200, gap: 1100, goRatio: 0.75 },
    2: { rounds: 1, goal: 15, rules: ["grenouille", "rouge", "fruits", "animaux-mer"], life: 2500, gap: 900, goRatio: 0.65 },
    3: { rounds: 1, goal: 20, rules: RULES.map((r) => r.id), life: 2000, gap: 720, goRatio: 0.6, switchAt: 10 },
    4: { rounds: 1, goal: 30, rules: RULES.map((r) => r.id), life: 1600, gap: 600, goRatio: 0.55, switchAt: 8 }, // Expert : la règle change 3 fois
  };
  function ruleFor(level, rng = Math.random, avoid = null) {
    const ids = LEVELS[level].rules.filter((id) => id !== avoid);
    const id = ids[Math.floor(rng() * ids.length)];
    return RULES.find((r) => r.id === id);
  }

  return { LEVELS, ruleFor, RULES, nextItem, lifetime, score, average };
});
