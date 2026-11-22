// Le Dino : construction des parcours et niveaux (testés dans tests/v2-jeux.test.js)
// Unités : une case. Le sol est à la case 8 (sur 10 de haut).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DinoLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const GROUND_Y = 8;
  // Physique du saut : hauteur max ≈ 3,1 cases, distance ≈ 5 cases en courant
  const PHYS = { GRAV: 38, JUMP: 15.5, SPEED: 6.5 };
  // length : longueur du parcours ; gap : probabilité et taille max des trous ; floats : plateformes avec des pommes
  // enemies : probabilité d'un petit escargot sur une partie de sol (on saute par-dessus ou dessus)
  const LEVELS = {
    1: { rounds: 1, length: 45, gapChance: 0, maxGap: 0, steps: 0.25, floats: 0.5, enemies: 0 },
    2: { rounds: 1, length: 75, gapChance: 0.45, maxGap: 2, steps: 0.3, floats: 0.7, enemies: 0 },
    3: { rounds: 1, length: 105, gapChance: 0.5, maxGap: 3, steps: 0.35, floats: 0.7, enemies: 0.4 },
  };
  function buildCourse(level, rng = Math.random) {
    const cfg = LEVELS[level];
    const platforms = [], apples = [], enemies = [];
    let x = -6, lastH = 0;
    platforms.push({ x, y: GROUND_Y, w: 16, h: 3, kind: "ground" });
    x += 16;
    while (x < cfg.length) {
      const gap = rng() < cfg.gapChance ? 1 + Math.floor(rng() * cfg.maxGap) : 0;
      x += gap;
      const w = 5 + Math.floor(rng() * 7);
      // marche de 1 case au plus (on change de hauteur seulement d'une case)
      const h = rng() < cfg.steps ? 1 : 0;
      platforms.push({ x, y: GROUND_Y - h, w, h: 3 + h, kind: "ground" });
      for (let i = 1; i < w - 1; i += 2) if (rng() < 0.5) apples.push({ x: x + i + 0.5, y: GROUND_Y - h - 0.7 });
      if (rng() < cfg.floats) {
        const py = GROUND_Y - h - (2 + Math.floor(rng() * 2));
        const pw = 3 + Math.floor(rng() * 2);
        const px = x + Math.floor(rng() * Math.max(1, w - pw));
        platforms.push({ x: px, y: py, w: pw, h: 0.6, kind: "float" });
        for (let i = 0; i < pw; i++) apples.push({ x: px + i + 0.5, y: py - 0.7 });
      }
      // un escargot qui se promène au milieu d'un sol assez long
      if (w >= 7 && rng() < cfg.enemies) enemies.push({ x: x + w / 2, y: GROUND_Y - h - 0.8, min: x + 1, max: x + w - 2, dir: rng() < 0.5 ? -1 : 1, speed: 1.1, alive: true });
      lastH = h;
      x += w;
    }
    platforms.push({ x, y: GROUND_Y, w: 14, h: 3, kind: "ground" });
    const flag = { x: x + 6, y: GROUND_Y - 1.6 };
    return { platforms, apples, enemies, flag, appleCount: apples.length };
  }
  // Vérifie qu'on peut toujours passer : trous assez petits, marches d'une case au plus
  function isPassable(course, maxGap = 3) {
    const g = course.platforms.filter((p) => p.kind === "ground").sort((a, b) => a.x - b.x);
    for (let i = 1; i < g.length; i++) {
      const hole = g[i].x - (g[i - 1].x + g[i - 1].w);
      if (hole > maxGap) return false;
      if (Math.abs(g[i].y - g[i - 1].y) > 1) return false;
    }
    return true;
  }
  // Sauter sur un escargot (en tombant, par le haut) le fait rentrer dans sa coquille ; le toucher de côté, c'est se cogner
  const stomps = (vy, playerBottom, enemyTop) => vy > 0 && playerBottom <= enemyTop + 0.45;
  return { GROUND_Y, PHYS, LEVELS, buildCourse, isPassable, stomps };
});
