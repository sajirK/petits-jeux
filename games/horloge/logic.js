// Logique de "Quelle heure est-il ?" (testée dans tests/etape3.test.js).
// Horloge à aiguilles. La petite aiguille avance aussi un peu avec les minutes
// (à 3 h et demie, elle est entre le 3 et le 4), comme une vraie horloge.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HorlogeLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const HOURS = ["", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze"];

  // Niveaux : 1 heures pleines ; 2 + et demie ; 3 + et quart / moins le quart ; 4 je règle l'horloge
  const MINUTES_BY_LEVEL = { 1: [0], 2: [0, 30], 3: [0, 15, 30, 45], 4: [0, 15, 30, 45] };
  const MAX_LEVEL = 4;

  // Angles en degrés (0 = vers le haut, sens des aiguilles d'une montre)
  const minuteAngle = (m) => m * 6;
  const hourAngle = (h, m) => ((h % 12) * 30) + m * 0.5;

  // Heure en mots, de 1 h à 11 h 45 (on évite midi / minuit pour ne pas mélanger)
  function hourWord(h) { return h === 1 ? "une heure" : `${h} heures`; }
  function toWords(h, m) {
    if (m === 0) return hourWord(h);
    if (m === 30) return `${hourWord(h)} et demie`;
    if (m === 15) return `${hourWord(h)} et quart`;
    if (m === 45) return `${hourWord(h + 1)} moins le quart`;
    throw new Error("minutes non prévues : " + m);
  }
  const toDigits = (h, m) => `${h}:${String(m).padStart(2, "0")}`;

  const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function randomTime(level, rng) {
    const mins = MINUTES_BY_LEVEL[level];
    const m = mins[Math.floor(rng() * mins.length)];
    // heures de 1 à 11 ; pour "moins le quart", l'heure suivante doit rester ≤ 11
    const h = randInt(rng, 1, m === 45 ? 10 : 11);
    return { h, m };
  }

  function generate(level, rng = Math.random, avoid = null) {
    const lv = Math.min(MAX_LEVEL, Math.max(1, level));
    let t;
    do { t = randomTime(lv, rng); } while (avoid && t.h === avoid.h && t.m === avoid.m);
    if (lv === 4) return { mode: "set", ...t, words: toWords(t.h, t.m) };
    // choix : la bonne heure + des heures proches ou faciles à confondre
    const cands = [];
    const mins = MINUTES_BY_LEVEL[lv];
    // confusion classique : on inverse le rôle des aiguilles (3 h et demie <-> 6 h et quart)
    if (lv >= 2 && t.m === 30 && t.h !== 6) cands.push({ h: 6, m: (t.h * 5) % 60 });
    cands.push({ h: t.h === 11 ? 10 : t.h + 1, m: t.m === 45 ? 0 : t.m }, { h: t.h === 1 ? 2 : t.h - 1, m: t.m });
    for (const m of mins) if (m !== t.m) cands.push({ h: t.h === 11 && m === 45 ? 10 : t.h, m });
    const seen = new Set([toDigits(t.h, t.m)]);
    const others = [];
    for (const c of shuffle(cands, rng)) {
      if (!MINUTES_BY_LEVEL[3].includes(c.m) || c.h < 1 || c.h > 11 || (c.m === 45 && c.h > 10)) continue;
      const k = toDigits(c.h, c.m);
      if (seen.has(k)) continue;
      seen.add(k); others.push(c);
      if (others.length >= (lv === 1 ? 2 : 3)) break;
    }
    while (others.length < (lv === 1 ? 2 : 3)) {
      const c = randomTime(lv, rng);
      const k = toDigits(c.h, c.m);
      if (!seen.has(k)) { seen.add(k); others.push(c); }
    }
    const options = shuffle([t, ...others], rng).map((o) => ({ ...o, words: toWords(o.h, o.m), digits: toDigits(o.h, o.m) }));
    return { mode: "read", ...t, words: toWords(t.h, t.m), digits: toDigits(t.h, t.m), options };
  }

  // Niveau 4 : l'enfant tourne les aiguilles par crans (1 heure / 15 minutes)
  function isSet(q, h, m) { return h === q.h && m === q.m; }

  // V2 : 3 niveaux. On entend l'heure et on touche la bonne horloge.
  // Facile : heures pile, 3 horloges ; Moyen : + et demie, 4 horloges ;
  // Difficile : + et quart / moins le quart, et une manche sur deux on règle soi-même les aiguilles.
  const LEVELS = {
    1: { rounds: 5, internal: 1 },
    2: { rounds: 6, internal: 2 },
    3: { rounds: 6, internal: 3, setEvery: 2 },
    4: { rounds: 8, internal: 3, setAll: true }, // Expert : on règle toujours soi-même les aiguilles, quarts compris
  };
  function question(level, index, rng = Math.random, avoid = null) {
    const cfg = LEVELS[level];
    const set = cfg.setAll || (cfg.setEvery && index % cfg.setEvery === 1);
    return generate(set ? 4 : cfg.internal, rng, avoid);
  }
  // L'aide pour régler l'horloge : quel bouton toucher maintenant ? (d'abord les minutes)
  function nextSetMove(q, h, m) {
    if (m !== q.m) return "m+";
    if (h !== q.h) return "h+";
    return "ok";
  }

  return { LEVELS, question, nextSetMove, MAX_LEVEL, MINUTES_BY_LEVEL, minuteAngle, hourAngle, toWords, toDigits, generate, isSet };
});
