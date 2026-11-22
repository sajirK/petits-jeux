// La Pizzeria : commandes, niveaux et avis du client (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PizzeriaLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const TOPPINGS = {
    "🍄": ["champignon", "champignons"], "🫒": ["olive", "olives"], "🍅": ["tomate", "tomates"], "🌶️": ["piment", "piments"],
    "🍍": ["morceau d'ananas", "morceaux d'ananas"], "🧅": ["oignon", "oignons"], "🥓": ["tranche de jambon", "tranches de jambon"],
    "🌿": ["feuille de basilic", "feuilles de basilic"], "🦐": ["crevette", "crevettes"], "🥚": ["œuf", "œufs"],
  };
  const LABELS = { "🍄": "champi", "🫒": "olive", "🍅": "tomate", "🌶️": "piment", "🍍": "ananas", "🧅": "oignon", "🥓": "jambon", "🌿": "basilic", "🦐": "crevette", "🥚": "œuf" };
  const FEMININE = new Set(["🫒", "🍅", "🥓", "🌿", "🦐"]);
  const NUM = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six"];
  const NUM_F = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six"];
  const CLIENTS = ["🐻", "🐱", "🐸", "🦊", "🐼", "🐷", "🐵", "🦁", "🐰", "👽", "🐧", "🐮"];
  const SAUCE_OK = 0.5, CHEESE_OK = 0.4;
  const LEVELS = {
    1: { rounds: 2, types: [1, 1], maxCount: 3, noCheese: 0, tray: 4 },    // 1 garniture, jusqu'à 3
    2: { rounds: 3, types: [2, 2], maxCount: 4, noCheese: 0, tray: 6 },    // 2 garnitures
    3: { rounds: 3, types: [2, 3], maxCount: 5, noCheese: 0.3, tray: 8 },  // 2-3 garnitures, parfois sans fromage
  };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const nb = (e, n) => (FEMININE.has(e) ? NUM_F[n] : NUM[n]) || String(n);
  const named = (e, n) => `${nb(e, n)} ${n > 1 ? TOPPINGS[e][1] : TOPPINGS[e][0]}`;

  function order(level, rng = Math.random) {
    const cfg = LEVELS[level];
    const nTypes = cfg.types[0] + Math.floor(rng() * (cfg.types[1] - cfg.types[0] + 1));
    const types = shuffle(Object.keys(TOPPINGS), rng).slice(0, nTypes);
    const tops = Object.fromEntries(types.map((t) => [t, 1 + Math.floor(rng() * cfg.maxCount)]));
    const others = shuffle(Object.keys(TOPPINGS).filter((t) => !types.includes(t)), rng).slice(0, Math.max(0, cfg.tray - types.length));
    return { cheese: rng() >= cfg.noCheese, tops, tray: shuffle([...types, ...others], rng) };
  }
  function sentence(o, name = "") {
    const parts = ["de la sauce tomate"];
    if (o.cheese) parts.push("du fromage");
    for (const [e, n] of Object.entries(o.tops)) parts.push(named(e, n));
    const last = parts.pop();
    return `Bonjour ${name} ! Je voudrais une pizza avec ${parts.join(", ")} et ${last}${o.cheese ? "" : ", mais sans fromage"}, s'il te plaît !`;
  }
  // pizza = { sauce: couverture 0..1, cheese: couverture 0..1, tops: { "🍄": 3, … } }
  function judge(o, pizza) {
    const notes = [];
    if (pizza.sauce < SAUCE_OK) notes.push("il manque un peu de sauce");
    if (o.cheese && pizza.cheese < CHEESE_OK) notes.push("je voulais plus de fromage");
    if (!o.cheese && pizza.cheese > 0.05) notes.push("j'avais dit sans fromage");
    for (const [e, n] of Object.entries(o.tops)) {
      const have = pizza.tops[e] || 0;
      if (have !== n) notes.push(`je voulais ${named(e, n)}, et il y en a ${nb(e, have)}`);
    }
    const extra = Object.keys(pizza.tops).find((e) => pizza.tops[e] > 0 && !(e in o.tops));
    if (extra) notes.push(`il y a des ${TOPPINGS[extra][1]} en plus, rigolo`);
    return { perfect: notes.length === 0, notes };
  }
  // la prochaine chose à faire (pour l'aide)
  function nextNeed(o, pizza) {
    if (pizza.sauce < SAUCE_OK) return "sauce";
    if (o.cheese && pizza.cheese < CHEESE_OK) return "fromage";
    for (const [e, n] of Object.entries(o.tops)) { const have = pizza.tops[e] || 0; if (have < n) return { add: e }; if (have > n) return { remove: e }; }
    const extra = Object.keys(pizza.tops).find((e) => pizza.tops[e] > 0 && !(e in o.tops));
    if (extra) return { remove: extra };
    return "four";
  }
  return { TOPPINGS, LABELS, FEMININE, CLIENTS, LEVELS, SAUCE_OK, CHEESE_OK, order, sentence, judge, nextNeed, named };
});
