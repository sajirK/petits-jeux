// Logique des "Calculs malins" (testée dans tests/calcul.test.js).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CalculLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // Objets à compter, avec le genre pour bien dire "un" ou "une"
  const OBJECTS = [
    { e: "🍎", one: "pomme", many: "pommes", f: true },
    { e: "🐟", one: "poisson", many: "poissons", f: false },
    { e: "🎈", one: "ballon", many: "ballons", f: false },
    { e: "🐥", one: "poussin", many: "poussins", f: false },
    { e: "🍪", one: "biscuit", many: "biscuits", f: false },
    { e: "⭐", one: "étoile", many: "étoiles", f: true },
    { e: "🚗", one: "voiture", many: "voitures", f: true },
    { e: "🦋", one: "papillon", many: "papillons", f: false },
  ];
  // Pour les soustractions : objets qui peuvent "partir"
  const LEAVE = { "🐟": "s'en vont", "🎈": "s'envolent", "🐥": "partent", "🍪": "sont mangés", "🍎": "sont mangées", "⭐": "s'éteignent", "🚗": "partent", "🦋": "s'envolent" };
  const LEAVE_ONE = { "🐟": "s'en va", "🎈": "s'envole", "🐥": "part", "🍪": "est mangé", "🍎": "est mangée", "⭐": "s'éteint", "🚗": "part", "🦋": "s'envole" };

  // Niveaux :
  // 1 : addition, total ≤ 5, avec objets
  // 2 : addition, total ≤ 10, avec objets
  // 3 : soustraction ≤ 10, avec objets
  // 4 : addition ou soustraction ≤ 10, sans objets
  // 5 : compléments à 10 (7 + ? = 10) et doubles
  // 6 : addition ≤ 20 et soustraction ≤ 20
  const MAX_LEVEL = 8;

  const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const count = (n, o) => (n === 1 ? `${o.f ? "une" : "un"} ${o.one}` : `${n} ${o.many}`);

  function generate(level, rng = Math.random) {
    const lv = Math.min(MAX_LEVEL, Math.max(1, level));
    const o = OBJECTS[Math.floor(rng() * OBJECTS.length)];
    let q;
    if (lv === 1) q = add(rng, 2, 5);
    else if (lv === 2) q = add(rng, 2, 10);
    else if (lv === 3) q = sub(rng, 10);
    else if (lv === 4) q = rng() < 0.5 ? add(rng, 3, 10) : sub(rng, 10);
    else if (lv === 5) q = rng() < 0.5 ? complement(rng) : double(rng);
    else if (lv === 6) q = rng() < 0.5 ? add(rng, 8, 20) : sub(rng, 20);
    else if (lv === 7) q = rng() < 0.5 ? add(rng, 20, 50) : sub(rng, 50);
    else q = mult(rng);
    q.level = lv;
    q.withObjects = lv <= 3;
    q.object = o;
    q.options = options(q.answer, rng, lv >= 4 ? 4 : 3, lv >= 8 ? 100 : lv >= 7 ? 50 : lv >= 6 ? 20 : 10, q.op === "×" ? q.a : 0);
    q.speech = speech(q, o);
    return q;
  }

  function add(rng, minTotal, maxTotal) {
    const total = randInt(rng, minTotal, maxTotal);
    const a = randInt(rng, 1, total - 1 >= 1 ? total - 1 : 1);
    const b = total - a;
    if (b < 1) return add(rng, Math.max(2, minTotal), maxTotal);
    return { op: "+", a, b, answer: a + b, text: `${a} + ${b} = ?` };
  }
  function sub(rng, max) {
    const a = randInt(rng, 3, max);
    const b = randInt(rng, 1, a - 1);
    return { op: "-", a, b, answer: a - b, text: `${a} - ${b} = ?` };
  }
  // Expert : les tables de 2, 3, 4, 5 et 10
  function mult(rng) {
    const a = [2, 3, 4, 5, 10][Math.floor(rng() * 5)], b = randInt(rng, 1, 10);
    return { op: "×", a, b, answer: a * b, text: `${a} × ${b} = ?` };
  }
  function complement(rng) {
    const a = randInt(rng, 1, 9);
    return { op: "c10", a, b: 10 - a, answer: 10 - a, text: `${a} + ? = 10` };
  }
  function double(rng) {
    const a = randInt(rng, 1, 10);
    return { op: "+", a, b: a, answer: a * 2, text: `${a} + ${a} = ?`, double: true };
  }

  // Réponse + réponses proches (jamais négatives, toutes différentes)
  function options(answer, rng, n, max, table = 0) {
    const set = new Set([answer]);
    // pour les tables : les pièges sont les voisins dans la table (6 × 4 → 20, 28) et ±1
    const deltas = table ? shuffle([table, -table, 1, -1, 2 * table], rng) : shuffle([1, -1, 2, -2, 3, -3], rng);
    for (const d of deltas) {
      const v = answer + d;
      if (v >= 0 && v <= max + 3) set.add(v);
      if (set.size >= n) break;
    }
    return shuffle([...set], rng);
  }

  function speech(q, o) {
    if (q.op === "+" && q.withObjects !== false && q.level <= 3)
      return `Il y a ${count(q.a, o)}. On en ajoute ${q.b === 1 ? (o.f ? "une" : "un") : q.b}. Combien ça fait ?`;
    if (q.op === "-" && q.level <= 3) {
      const leave = q.b === 1 ? LEAVE_ONE[o.e] : LEAVE[o.e];
      return `Il y a ${count(q.a, o)}. ${q.b === 1 ? (o.f ? "Une" : "Un") : q.b} ${leave}. Combien en reste-t-il ?`;
    }
    if (q.op === "c10") return `${q.a} plus combien égale 10 ?`;
    if (q.op === "×") return `Combien font ${q.a} fois ${q.b} ?`;
    if (q.op === "+") return `Combien font ${q.a} plus ${q.b} ?`;
    return `Combien font ${q.a} moins ${q.b} ?`;
  }

  // Indice après une erreur : la stratégie la plus simple selon les nombres
  function hint(q) {
    if (q.withObjects) return "Pas tout à fait. Compte les objets avec ton doigt !";
    if (q.op === "×") return `Pas tout à fait. ${q.a} fois ${q.b}, c'est ${q.b} paquets de ${q.a}. Compte de ${q.a} en ${q.a} !`;
    if (q.op === "c10") return `Pas tout à fait. Combien il manque à ${q.a} pour aller jusqu'à 10 ?`;
    if (q.op === "-") {
      // si on enlève beaucoup, c'est plus facile de compter de ${b} jusqu'à ${a}
      if (q.b > q.a - q.b) return `Pas tout à fait. Compte de ${q.b} jusqu'à ${q.a} : combien de pas ?`;
      return `Pas tout à fait. Pars de ${q.a} et recule de ${q.b}.`;
    }
    if (q.double && q.a >= 5) return `Pas tout à fait. C'est le double de ${q.a} : ${q.a} et encore ${q.a}.`;
    // on part toujours du plus grand nombre
    const big = Math.max(q.a, q.b), small = Math.min(q.a, q.b);
    return `Pas tout à fait. Pars de ${big} et avance de ${small}.`;
  }

  // Vérifie une réponse
  const check = (q, value) => value === q.answer;

  // V2 : 3 niveaux
  const LEVELS = {
    1: { rounds: 6, internal: [1, 2] },   // additions jusqu'à 10, avec des objets
    2: { rounds: 7, internal: [3, 4] },   // soustractions, puis sans objets
    3: { rounds: 8, internal: [5, 6] },   // compléments à 10, doubles, jusqu'à 20
    4: { rounds: 10, internal: [6, 7, 8] }, // Expert : jusqu'à 50, puis les tables de multiplication
  };

  return { LEVELS, generate, check, hint, options, MAX_LEVEL, OBJECTS, LEAVE, LEAVE_ONE };
});
