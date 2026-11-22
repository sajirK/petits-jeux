// Logique du jeu "Les Suites" (testée dans tests/suites.test.js).
// Une suite est construite à partir d'un motif (ex : "AAB") répété.
// On montre au moins 2 motifs complets pour que la règle soit sans ambiguïté.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SuitesLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const THEMES = [
    ["🍎", "🍌", "🍇", "🍊", "🍓"],
    ["🐶", "🐱", "🐰", "🐸", "🐵"],
    ["⭐", "❤️", "🌙", "☀️", "☁️"],
    ["🚗", "🚌", "🚲", "✈️", "🚀"],
  ];

  // Motifs par niveau (du plus facile au plus difficile)
  const UNITS = {
    1: ["AB"],
    2: ["AB", "ABC", "AAB", "ABB"],
    3: ["ABC", "AAB", "ABB", "AABB", "ABAC"],
    4: ["AABB", "ABCD", "ABAC", "AABC", "ABCC", "ABBC"],
  };

  // Suites de nombres (niveau 5+)
  const NUMBER_RULES = [
    { start: [1, 3], step: 1, label: "+1" },
    { start: [2, 6], step: 1, label: "+1" },
    { start: [10, 15], step: -1, label: "-1" },
    { start: [2, 2], step: 2, label: "+2" },
    { start: [1, 1], step: 2, label: "+2" },
    { start: [5, 5], step: 5, label: "+5" },
    { start: [10, 10], step: 10, label: "+10" },
    { start: [20, 20], step: -2, label: "-2" },
  ];

  const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Plus petite période d'une liste (ex : [a,b,a,b,a] -> 2)
  function minimalPeriod(seq) {
    for (let p = 1; p <= seq.length; p++) {
      let ok = true;
      for (let i = p; i < seq.length; i++) if (seq[i] !== seq[i - p]) { ok = false; break; }
      if (ok) return p;
    }
    return seq.length;
  }

  function generate(level, rng = Math.random) {
    if (level >= 5 && rng() < 0.6) return generateNumbers(rng);
    const lv = Math.min(4, Math.max(1, level));
    const unit = UNITS[lv][Math.floor(rng() * UNITS[lv].length)];
    const letters = [...new Set(unit)];
    const theme = THEMES[Math.floor(rng() * THEMES.length)];
    const symbols = shuffle(theme, rng).slice(0, letters.length);
    const map = Object.fromEntries(letters.map((l, i) => [l, symbols[i]]));
    const full = (n) => Array.from({ length: n }, (_, i) => map[unit[i % unit.length]]);

    // longueur montrée : au moins 2 motifs complets, parfois un bout en plus
    const shownLen = unit.length * 2 + randInt(rng, 0, unit.length - 1);
    const all = full(shownLen + 1);
    const shown = all.slice(0, shownLen);
    const answer = all[shownLen];

    // choix : la bonne réponse + les autres symboles du motif + 1 symbole du thème
    const others = theme.filter((s) => s !== answer);
    const distractors = shuffle([...new Set([...symbols.filter((s) => s !== answer), ...shuffle(others, rng)])], rng)
      .filter((s) => s !== answer)
      .slice(0, Math.min(3, 1 + lv));
    const options = shuffle([answer, ...distractors], rng);
    return { kind: "symbols", unit, shown, answer, options };
  }

  function generateNumbers(rng) {
    const rule = NUMBER_RULES[Math.floor(rng() * NUMBER_RULES.length)];
    const start = randInt(rng, rule.start[0], rule.start[1]);
    const shown = [0, 1, 2, 3].map((i) => start + i * rule.step);
    const answer = start + 4 * rule.step;
    const cands = new Set([answer]);
    for (const d of shuffle([1, -1, 2, -2, rule.step * 2, rule.step + 1], rng)) {
      const v = answer + d;
      if (v >= 0 && v !== answer && !shown.includes(v)) cands.add(v);
      if (cands.size >= 4) break;
    }
    return { kind: "numbers", rule: rule.label, shown, answer, options: shuffle([...cands], rng) };
  }

  return { generate, minimalPeriod, UNITS, THEMES };
});
