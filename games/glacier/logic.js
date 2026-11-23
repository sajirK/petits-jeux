// Le Glacier : commandes, niveaux et avis du client (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GlacierLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const FLAVORS = {
    vanille: { c: "#fff3c4", name: "vanille" }, chocolat: { c: "#8b5a3c", name: "chocolat" }, fraise: { c: "#ff9ebb", name: "fraise" },
    pistache: { c: "#b8e08f", name: "pistache" }, menthe: { c: "#a8f0dc", name: "menthe chocolat", chips: true }, citron: { c: "#fff27a", name: "citron" },
    myrtille: { c: "#a99cf5", name: "myrtille" }, mangue: { c: "#ffbb5c", name: "mangue" },
  };
  const SAUCES = { chocolat: { c: "#4a2511", name: "la sauce chocolat" }, caramel: { c: "#d98e04", name: "le caramel" }, fraise: { c: "#d62839", name: "le coulis de fraise" } };
  const DECOS = { "🍒": "une cerise", "🌈": "des vermicelles", "🍫": "un bâton de chocolat", "🍪": "un biscuit", "🍓": "une fraise" };
  const CLIENTS = ["🐻", "🐱", "🐸", "🦊", "🐼", "🐷", "🐵", "🦁", "🐰", "👽", "🐧", "🐨", "🦄"];
  const NUM_F = ["zéro", "une", "deux", "trois", "quatre"];
  const LEVELS = {
    1: { rounds: 3, scoops: [1, 1], sauce: 0, decos: [1, 1], tubs: 3 },   // 1 boule + 1 décoration
    2: { rounds: 3, scoops: [1, 2], sauce: 0.5, decos: [0, 1], tubs: 4 }, // 1-2 boules, parfois du nappage
    3: { rounds: 4, scoops: [2, 3], sauce: 0.7, decos: [1, 2], tubs: 6 }, // 2-3 boules, nappage, 2 décorations
    4: { rounds: 5, scoops: [3, 4], sauce: 0.85, decos: [2, 3], tubs: 8 }, // Expert : 3-4 boules, 3 décorations, tous les parfums
  };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const between = (rng, [a, b]) => a + Math.floor(rng() * (b - a + 1));
  function countBy(list) { const m = {}; list.forEach((x) => (m[x] = (m[x] || 0) + 1)); return m; }

  function order(level, rng = Math.random) {
    const cfg = LEVELS[level];
    const pool = shuffle(Object.keys(FLAVORS), rng);
    const scoops = Array.from({ length: between(rng, cfg.scoops) }, () => pool[Math.floor(rng() * Math.min(3, pool.length))]);
    const wanted = [...new Set(scoops)];
    const tubs = shuffle([...wanted, ...pool.filter((f) => !wanted.includes(f)).slice(0, cfg.tubs - wanted.length)], rng);
    return {
      holder: rng() < 0.6 ? "cornet" : "pot",
      scoops,
      sauce: rng() < cfg.sauce ? Object.keys(SAUCES)[Math.floor(rng() * 3)] : null,
      decos: shuffle(Object.keys(DECOS), rng).slice(0, between(rng, cfg.decos)),
      tubs,
    };
  }
  function sentence(o, name = "") {
    const parts = Object.entries(countBy(o.scoops)).map(([f, n]) => `${NUM_F[n]} boule${n > 1 ? "s" : ""} ${FLAVORS[f].name}`);
    let s = `Bonjour ${name} ! Je voudrais ${o.holder === "cornet" ? "un cornet" : "un pot"} avec ${parts.length > 1 ? parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1] : parts[0]}`;
    const extras = [];
    if (o.sauce) extras.push(SAUCES[o.sauce].name.replace(/^la /, "de la ").replace(/^le /, "du "));
    o.decos.forEach((d) => extras.push(DECOS[d]));
    if (extras.length) s += `, avec ${extras.length > 1 ? extras.slice(0, -1).join(", ") + " et " + extras[extras.length - 1] : extras[0]}`;
    return s + ", s'il te plaît !";
  }
  // ice = { holder, scoops: [...], sauce, decos: [...] }
  function judge(o, ice) {
    const notes = [];
    if (ice.holder !== o.holder) notes.push(`je voulais ${o.holder === "cornet" ? "un cornet" : "un pot"}`);
    const want = countBy(o.scoops), have = countBy(ice.scoops);
    for (const [f, n] of Object.entries(want)) if ((have[f] || 0) !== n) notes.push(`je voulais ${NUM_F[n]} boule${n > 1 ? "s" : ""} ${FLAVORS[f].name}`);
    const extra = Object.keys(have).find((f) => !(f in want));
    if (extra) notes.push(`il y a une boule ${FLAVORS[extra].name} en plus, rigolo`);
    if (o.sauce !== ice.sauce) notes.push(o.sauce ? `je voulais ${SAUCES[o.sauce].name}` : "je ne voulais pas de nappage");
    for (const d of o.decos) if (!ice.decos.includes(d)) notes.push(`il manque ${DECOS[d]}`);
    return { perfect: notes.length === 0, notes };
  }
  return { FLAVORS, SAUCES, DECOS, CLIENTS, LEVELS, order, sentence, judge, countBy };
});
