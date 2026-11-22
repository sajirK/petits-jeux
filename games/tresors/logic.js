// Le Château Magique : labyrinthe, niveaux et chemin (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TresorsLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // Une partie = 3 châteaux de plus en plus grands (n = 1, 2, 3).
  // size(n) : largeur du labyrinthe en "salles" ; gems(n) : trésors ; bats(n) : chauves-souris ;
  // batSpeed : secondes entre deux pas d'une chauve-souris (plus grand = plus lent)
  // batCounts : se faire repousser par une chauve-souris compte comme une erreur (pas en Facile)
  const LEVELS = {
    1: { rounds: 3, size: (n) => Math.min(3 + Math.floor((n - 1) / 3), 4), gems: (n) => Math.min(6, 2 + Math.ceil(n / 2)), bats: () => 1, batSpeed: 1.5, batCounts: false },
    2: { rounds: 3, size: (n) => Math.min(2 + n, 6), gems: (n) => 3 + n, bats: (n) => Math.min(1 + Math.floor(n / 3), 3), batSpeed: 1.0, batCounts: true },
    3: { rounds: 3, size: (n) => Math.min(3 + n, 7), gems: (n) => 4 + n, bats: (n) => Math.min(2 + Math.floor(n / 3), 4), batSpeed: 0.7, batCounts: true },
  };
  const OLD_DIFFICULTY = { easy: 1, medium: 2, hard: 3 }; // ancien réglage (sélecteur de difficulté)
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Labyrinthe (1 = mur, 0 = couloir), avec des passages en plus pour éviter les culs-de-sac
  function makeMaze(cw, ch, rng = Math.random) {
    const W = cw * 2 + 1, H = ch * 2 + 1;
    const g = Array.from({ length: H }, () => Array(W).fill(1));
    const stack = [[0, 0]], seen = new Set(["0,0"]);
    g[1][1] = 0;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const n = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]], rng).find(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen.has(nx + "," + ny); });
      if (!n) { stack.pop(); continue; }
      const nx = x + n[0], ny = y + n[1];
      seen.add(nx + "," + ny);
      g[y * 2 + 1 + n[1]][x * 2 + 1 + n[0]] = 0;
      g[ny * 2 + 1][nx * 2 + 1] = 0;
      stack.push([nx, ny]);
    }
    for (let i = 0; i < cw * ch * 0.35; i++) {
      const x = 1 + Math.floor(rng() * (W - 2)), y = 1 + Math.floor(rng() * (H - 2));
      if ((x + y) % 2 === 1) g[y][x] = 0;
    }
    return g;
  }
  // Un château complet pour la manche n
  function castle(level, n, rng = Math.random) {
    const cfg = LEVELS[level], size = cfg.size(n);
    const grid = makeMaze(size + 1, size, rng);
    const rows = grid.length, cols = grid[0].length;
    const free = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!grid[y][x]) free.push([x, y]);
    const door = { x: cols - 2, y: rows - 2 };
    const picks = shuffle(free.filter(([x, y]) => x + y > 4 && !(x === door.x && y === door.y)), rng);
    const gemCount = cfg.gems(n);
    const gems = picks.slice(0, gemCount).map(([x, y]) => ({ x, y }));
    const torches = picks.slice(gemCount, gemCount + 3).map(([x, y]) => ({ x, y, lit: false }));
    const bats = [];
    for (const [x, y] of picks.slice(gemCount + 3)) {
      if (bats.length >= cfg.bats(n)) break;
      const horiz = !grid[y][x - 1] && !grid[y][x + 1], vert = !grid[y - 1]?.[x] && !grid[y + 1]?.[x];
      if (horiz || vert) bats.push({ x, y, dx: horiz ? 1 : 0, dy: horiz ? 0 : 1 });
    }
    return { grid, rows, cols, door, gems, torches, bats };
  }
  // Premier pas du plus court chemin de "from" vers la cible la plus proche (null si impossible)
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function nextStep(grid, from, targets, blocked = () => false) {
    const key = (x, y) => x + "," + y, goal = new Set(targets.map((t) => key(t.x, t.y)));
    const prev = new Map([[key(from.x, from.y), null]]), queue = [[from.x, from.y]];
    while (queue.length) {
      const [x, y] = queue.shift();
      if (goal.has(key(x, y)) && !(x === from.x && y === from.y)) {
        let k = key(x, y), p;
        while ((p = prev.get(k)) && p.k !== key(from.x, from.y)) k = p.k;
        return p ? p.dir : null;
      }
      for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (grid[ny]?.[nx] !== 0 || prev.has(k) || blocked(nx, ny)) continue;
        prev.set(k, { k: key(x, y), dir });
        queue.push([nx, ny]);
      }
    }
    return null;
  }
  return { LEVELS, OLD_DIFFICULTY, DIRS, makeMaze, castle, nextStep };
});
