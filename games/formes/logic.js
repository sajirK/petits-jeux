// Les Formes : logique et niveaux
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FormesLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const SHAPES = {
    rond: '<circle cx="50" cy="50" r="45"/>',
    carré: '<rect x="8" y="8" width="84" height="84" rx="6"/>',
    triangle: '<polygon points="50,5 95,92 5,92"/>',
    étoile: '<polygon points="50,4 62,38 98,38 69,60 80,95 50,74 20,95 31,60 2,38 38,38"/>',
    cœur: '<path d="M50 90 C 10 60, 0 35, 20 18 C 35 6, 48 15, 50 26 C 52 15, 65 6, 80 18 C 100 35, 90 60, 50 90 Z"/>',
    losange: '<polygon points="50,3 95,50 50,97 5,50"/>',
    lune: '<path d="M70 8 A 45 45 0 1 0 92 70 A 36 36 0 1 1 70 8 Z"/>',
    rectangle: '<rect x="2" y="25" width="96" height="50" rx="6"/>',
    ovale: '<ellipse cx="50" cy="50" rx="46" ry="30"/>',
    hexagone: '<polygon points="27,8 73,8 96,50 73,92 27,92 4,50"/>',
  };
  const EASY = ["rond", "carré", "triangle", "étoile", "cœur"];
  const LEVELS = {
    1: { rounds: 3, pieces: 3, pool: EASY },                        // 3 formes très différentes
    2: { rounds: 4, pieces: 4, pool: Object.keys(SHAPES).slice(0, 8) },
    3: { rounds: 4, pieces: 5, pool: Object.keys(SHAPES) },          // + formes qui se ressemblent (ovale/rond, carré/rectangle…)
  };
  const ARTICLE = { rond: "le rond", carré: "le carré", triangle: "le triangle", étoile: "l'étoile", cœur: "le cœur", losange: "le losange", lune: "la lune", rectangle: "le rectangle", ovale: "l'ovale", hexagone: "l'hexagone" };
  // "l'ombre du rond", "l'ombre de l'étoile", "l'ombre de la lune"
  const DE = { rond: "du rond", carré: "du carré", triangle: "du triangle", étoile: "de l'étoile", cœur: "du cœur", losange: "du losange", lune: "de la lune", rectangle: "du rectangle", ovale: "de l'ovale", hexagone: "de l'hexagone" };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function board(level, rng = Math.random) {
    const cfg = LEVELS[level];
    let names = shuffle(cfg.pool, rng).slice(0, cfg.pieces);
    // au niveau 3, on s'assure qu'il y a au moins une paire de formes qui se ressemblent
    if (level === 3 && !(names.includes("rond") && names.includes("ovale")) && !(names.includes("carré") && names.includes("rectangle"))) {
      names = ["rond", "ovale", ...shuffle(cfg.pool.filter((n) => n !== "rond" && n !== "ovale"), rng).slice(0, cfg.pieces - 2)];
    }
    return { pieces: shuffle(names, rng), shadows: shuffle(names, rng) };
  }
  return { SHAPES, LEVELS, ARTICLE, DE, board };
});
