// Logique de "La Boulangerie des nombres" (testée dans tests/etape2.test.js).
// On comprend les nombres jusqu'à 20 avec des boîtes de 10 (comme à l'école :
// "13, c'est une dizaine et 3 unités"), puis on paie avec des pièces.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BoulangerieLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // f = féminin (pour dire "une baguette" / "un croissant")
  const PASTRIES = [
    { e: "🥐", one: "croissant", many: "croissants", f: false },
    { e: "🥖", one: "baguette", many: "baguettes", f: true },
    { e: "🧁", one: "petit gâteau", many: "petits gâteaux", f: false },
    { e: "🍩", one: "beignet", many: "beignets", f: false },
    { e: "🍪", one: "biscuit", many: "biscuits", f: false },
    { e: "🥧", one: "tarte", many: "tartes", f: true },
  ];
  const CLIENTS = ["🐻", "🐱", "🐰", "🦊", "🐼", "🐷", "🐵", "🐨", "🐸", "🦁", "🐧", "🐶"];
  const NUM = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"];
  const COINS = [1, 2, 5]; // pièces de 1 € et 2 €, billet de 5 €

  // Niveaux :
  // 1 : de 1 à 5        2 : de 1 à 10        3 : de 11 à 20 (boîte de 10 + unités)
  // 4 : payer un prix de 2 à 10 € avec des pièces de 1 € et 2 €
  // 5 : payer un prix de 5 à 20 € avec 1 €, 2 € et des billets de 5 €
  const MAX_LEVEL = 5;
  const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

  function count(n, p) {
    if (n === 1) return `${p.f ? "une" : "un"} ${p.one}`;
    return `${n} ${p.many}`;
  }

  function generate(level, rng = Math.random, avoid = null) {
    const lv = Math.min(MAX_LEVEL, Math.max(1, level));
    const pastry = PASTRIES[Math.floor(rng() * PASTRIES.length)];
    const client = CLIENTS[Math.floor(rng() * CLIENTS.length)];
    let n;
    do {
      if (lv === 1) n = randInt(rng, 1, 5);
      else if (lv === 2) n = randInt(rng, 1, 10);
      else if (lv === 3) n = randInt(rng, 11, 20);
      else if (lv === 4) n = randInt(rng, 2, 10);
      else n = randInt(rng, 5, 20);
    } while (n === avoid);
    if (lv >= 4) {
      return { mode: "pay", level: lv, price: n, pastry, client, coins: lv === 4 ? [1, 2] : COINS, speech: `Bonjour ! Ça fait ${n} euros, s'il te plaît.` };
    }
    return { mode: "count", level: lv, n, pastry, client, tens: lv >= 3, speech: `Bonjour ! Je voudrais ${count(n, pastry)}, s'il te plaît.` };
  }

  // "13, c'est une boîte de 10 et encore 3."
  function decompose(n) {
    const tens = Math.floor(n / 10), ones = n % 10;
    if (n < 10) return `${n}`;
    if (n === 10) return "10, c'est une boîte de 10 bien pleine.";
    if (n === 20) return "20, c'est deux boîtes de 10.";
    return `${n}, c'est une boîte de 10 et encore ${ones}.`;
  }

  // Ce que dit le client quand on lui donne "have" au lieu de "want"
  function feedback(want, have, p) {
    if (have === want) return { ok: true, text: `Merci ! Il y a bien ${count(want, p)}.` };
    if (have < want) {
      const miss = want - have;
      return { ok: false, text: `Tu as mis ${count(have, p)}. Il en manque ${miss === 1 ? (p.f ? "une" : "un") : miss}.` };
    }
    const extra = have - want;
    return { ok: false, text: `Tu as mis ${count(have, p)}. Il y en a ${extra === 1 ? (p.f ? "une" : "un") : extra} de trop.` };
  }

  const sum = (coins) => coins.reduce((a, b) => a + b, 0);
  function payFeedback(price, coins) {
    const s = sum(coins);
    if (s === price) return { ok: true, text: `Merci ! ${price} euros, c'est le bon compte !` };
    if (s < price) return { ok: false, text: `Tu as donné ${s} euro${s > 1 ? "s" : ""}. Il manque ${price - s} euro${price - s > 1 ? "s" : ""}.` };
    return { ok: false, text: `Tu as donné ${s} euros. C'est ${s - price} euro${s - price > 1 ? "s" : ""} de trop.` };
  }
  // Est-ce qu'on peut payer exactement avec ces pièces ? (toujours oui avec 1 €, mais on le vérifie)
  function canPay(price, coins) {
    const ok = new Array(price + 1).fill(false);
    ok[0] = true;
    for (let v = 1; v <= price; v++) ok[v] = coins.some((c) => c <= v && ok[v - c]);
    return ok[price];
  }

  // V2 : 3 niveaux (compter jusqu'à 10 → de 11 à 20 avec des boîtes de 10 → payer)
  const LEVELS = {
    1: { rounds: 5, internal: [1, 2] },
    2: { rounds: 5, internal: [3] },
    3: { rounds: 5, internal: [4, 5] },
  };
  // la pièce la plus utile à donner (pour l'aide) : la plus grosse qui ne dépasse pas
  function bestCoin(remaining, coins) { return coins.filter((c) => c <= remaining).sort((a, b) => b - a)[0] || null; }

  return { LEVELS, bestCoin, PASTRIES, CLIENTS, NUM, COINS, MAX_LEVEL, generate, decompose, feedback, payFeedback, sum, canPay, count };
});
