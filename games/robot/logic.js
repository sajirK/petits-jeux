// Logique du "Petit Robot" (testée dans tests/robot.test.js).
// Une grille avec des arbres, un robot, une pile à récupérer.
// Chaque niveau généré est TOUJOURS faisable (vérifié par une recherche du plus court chemin).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RobotLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  // taille, obstacles, longueur du plus court chemin [min, max], nb max d'instructions
  const GRIDS = {
    1: { w: 4, h: 4, walls: 0, path: [2, 3] },
    2: { w: 4, h: 4, walls: 2, path: [3, 4] },
    3: { w: 5, h: 5, walls: 4, path: [4, 6] },
    4: { w: 5, h: 5, walls: 6, path: [5, 7] },
    5: { w: 6, h: 6, walls: 8, path: [6, 9] },
    6: { w: 6, h: 6, walls: 11, path: [8, 11] },
  };
  const MAX_LEVEL = 6;
  // V2 : 3 niveaux, 4 manches chacun. Chaque niveau couvre 2 tailles de grille (la 2e à partir de la 3e manche).
  const LEVELS = {
    1: { rounds: 4, grids: [1, 2] },
    2: { rounds: 4, grids: [3, 4] },
    3: { rounds: 4, grids: [5, 6] },
  };
  const gridFor = (level, index) => LEVELS[level].grids[index < LEVELS[level].rounds / 2 ? 0 : 1];
  // L'aide : ce qu'il faut toucher maintenant ("undo" si une flèche est fausse, "go" si tout est prêt, sinon la flèche suivante)
  function nextMove(grid, program) {
    for (let i = 0; i < program.length; i++) if (program[i] !== grid.solution[i]) return "undo";
    if (program.length >= grid.solution.length) return "go";
    return grid.solution[program.length];
  }

  const key = (x, y) => x + "," + y;

  // Plus court chemin (liste de directions) ou null si impossible
  function shortestPath(grid) {
    const { w, h, walls, start, goal } = grid;
    const wallSet = new Set(walls.map(([x, y]) => key(x, y)));
    const prev = new Map([[key(...start), null]]);
    const queue = [start];
    while (queue.length) {
      const [x, y] = queue.shift();
      if (x === goal[0] && y === goal[1]) {
        const path = [];
        let k = key(x, y);
        while (prev.get(k)) { const [pk, dir] = prev.get(k); path.unshift(dir); k = pk; }
        return path;
      }
      for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
        const nx = x + dx, ny = y + dy, nk = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || wallSet.has(nk) || prev.has(nk)) continue;
        prev.set(nk, [key(x, y), dir]);
        queue.push([nx, ny]);
      }
    }
    return null;
  }

  function generate(level, rng = Math.random) {
    const cfg = GRIDS[Math.min(MAX_LEVEL, Math.max(1, level))];
    for (let attempt = 0; attempt < 2000; attempt++) {
      const cells = [];
      for (let y = 0; y < cfg.h; y++) for (let x = 0; x < cfg.w; x++) cells.push([x, y]);
      // mélange
      for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
      const start = cells[0], goal = cells[1];
      const walls = cells.slice(2, 2 + cfg.walls);
      const grid = { w: cfg.w, h: cfg.h, walls, start, goal };
      const path = shortestPath(grid);
      if (path && path.length >= cfg.path[0] && path.length <= cfg.path[1]) {
        grid.solution = path;
        grid.maxSteps = Math.max(path.length + 4, 8);
        return grid;
      }
    }
    throw new Error("Impossible de générer un niveau " + level);
  }

  // Exécute un programme. Renvoie la liste des positions et le résultat.
  // result : "win" (sur la pile), "wall" (arbre), "edge" (bord), "short" (pas arrivé)
  function run(grid, program) {
    const wallSet = new Set(grid.walls.map(([x, y]) => key(x, y)));
    let [x, y] = grid.start;
    const trace = [[x, y]];
    for (let i = 0; i < program.length; i++) {
      const [dx, dy] = DIRS[program[i]];
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= grid.w || ny >= grid.h) return { trace, result: "edge", at: i };
      if (wallSet.has(key(nx, ny))) return { trace, result: "wall", at: i };
      x = nx; y = ny;
      trace.push([x, y]);
      if (x === grid.goal[0] && y === grid.goal[1]) return { trace, result: "win", at: i };
    }
    return { trace, result: "short", at: program.length };
  }

  return { DIRS, GRIDS, LEVELS, MAX_LEVEL, gridFor, nextMove, generate, run, shortestPath };
});
