// Tests de l'étape 2 : J'écris, Les syllabes magiques, La Boulangerie des nombres.
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../games/tracer/logic.js");
const S = require("../games/syllabes/logic.js");
const B = require("../games/boulangerie/logic.js");

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- J'écris
test("J'écris : toutes les majuscules et tous les chiffres, traits valides et dans la boîte", () => {
  assert.equal(Object.keys(T.LETTERS).join(""), "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  assert.equal(Object.keys(T.DIGITS).sort().join(""), "0123456789");
  for (const [ch, strokes] of Object.entries({ ...T.LETTERS, ...T.DIGITS })) {
    assert.ok(strokes.length >= 1 && strokes.length <= 4, `${ch} : nombre de traits`);
    for (const pts of strokes) {
      assert.ok(pts.length >= 3, `${ch} : trait trop court`);
      for (const [x, y] of pts) assert.ok(x >= 0 && x <= T.W && y >= 0 && y <= T.H, `${ch} : point hors de la boîte (${x}, ${y})`);
      // pas de "saut" dans un trait : les points se suivent
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        assert.ok(d <= 6, `${ch} : saut de ${d.toFixed(1)} dans un trait`);
      }
    }
  }
  for (const ch of Object.keys(T.LETTERS)) {
    const [word] = T.WORDS[ch];
    assert.equal(word.normalize("NFD").charAt(0).toUpperCase(), ch, `${ch} comme ${word}`);
  }
});

test("J'écris : on écrit de haut en bas (le premier trait commence en haut)", () => {
  for (const [ch, strokes] of Object.entries({ ...T.LETTERS, ...T.DIGITS })) {
    const [x, y] = strokes[0][0];
    assert.ok(y <= 40, `${ch} : le premier trait commence trop bas (y=${y.toFixed(0)})`);
  }
  // les traits verticaux et les barres vont dans le bon sens
  const first = (ch, i = 0) => T.LETTERS[ch][i];
  assert.ok(first("I")[0][1] < first("I").at(-1)[1], "I : de haut en bas");
  assert.ok(first("E", 1)[0][0] < first("E", 1).at(-1)[0], "E : barre de gauche à droite");
  // les ronds partent du haut et tournent vers la gauche
  for (const ch of ["O", "C"]) {
    const pts = first(ch);
    const k = Math.floor(pts.length / 8);
    assert.ok(pts[k][0] < pts[0][0], `${ch} : doit tourner vers la gauche`);
  }
});

function traceAlong(points, trace, jitter = 0, rng = Math.random) {
  for (const [x, y] of points) T.feed(trace, x + (rng() - 0.5) * jitter, y + (rng() - 0.5) * jitter);
}

test("J'écris : un tracé bien fait valide chaque trait, même en tremblant un peu", () => {
  const rng = rngFrom(7);
  for (const [ch, strokes] of Object.entries({ ...T.LETTERS, ...T.DIGITS })) {
    for (const pts of strokes) {
      const tr = T.newTrace(pts);
      assert.ok(T.canStartAt(tr, pts[0][0] + 3, pts[0][1] - 2), `${ch} : départ refusé`);
      traceAlong(pts, tr, 8, rng);
      assert.ok(tr.done, `${ch} : tracé correct non validé`);
    }
  }
});

test("J'écris : à l'envers, en raccourci ou en gribouillant, ça ne valide pas", () => {
  for (const [ch, strokes] of Object.entries({ ...T.LETTERS, ...T.DIGITS })) {
    for (const pts of strokes) {
      // à l'envers
      const rev = T.newTrace(pts);
      traceAlong(pts.slice().reverse(), rev);
      assert.ok(!rev.done, `${ch} : validé à l'envers`);
      assert.ok(rev.progress < pts.length / 3, `${ch} : trop avancé à l'envers`);
      // saut direct du début à la fin
      const jump = T.newTrace(pts);
      T.feed(jump, pts[0][0], pts[0][1]);
      T.feed(jump, pts.at(-1)[0], pts.at(-1)[1]);
      if (pts.length > 10) assert.ok(!jump.done, `${ch} : raccourci accepté`);
    }
  }
  // gribouillage loin du trait
  const tr = T.newTrace(T.LETTERS.L[0]);
  for (let i = 0; i < 200; i++) T.feed(tr, 90, 10 + (i % 50));
  assert.equal(tr.progress, 0);
  assert.ok(!T.canStartAt(T.newTrace(T.LETTERS.L[0]), 80, 110), "départ à la fin refusé");
});

test("J'écris : lever le doigt et reprendre là où on s'est arrêté, ça marche ; reprendre plus loin, non", () => {
  const pts = T.LETTERS.L[0];
  const half = Math.floor(pts.length / 2);
  const tr = T.newTrace(pts);
  T.touchStart(tr);
  for (const [x, y] of pts.slice(0, half)) T.feed(tr, x, y);
  const mid = tr.progress;
  assert.ok(mid >= half - 3 && !tr.done);
  // nouveau toucher beaucoup plus loin : rien ne bouge
  T.touchStart(tr);
  for (const [x, y] of pts.slice(half + 10)) T.feed(tr, x, y);
  assert.equal(tr.progress, mid);
  // nouveau toucher au bon endroit : on finit le trait
  T.touchStart(tr);
  for (const [x, y] of pts.slice(mid)) T.feed(tr, x, y);
  assert.ok(tr.done);
});

// ---------------------------------------------------------------- Syllabes
test("Syllabes : chaque mot = ses syllabes collées, prononciation fournie, pas de doublon", () => {
  const words = new Set(), emojis = new Set();
  for (const [word, emoji, syl] of S.WORDS) {
    assert.equal(syl.map((s) => s[0]).join(""), word, `${word} : syllabes ≠ mot`);
    assert.ok(syl.length >= 2 && syl.length <= 4);
    for (const [t, say] of syl) { assert.match(t, /^[A-ZÀ-Ü]+$/); assert.match(say, /^[a-zà-ü]+$/); }
    assert.ok(!words.has(word) && !emojis.has(emoji), `${word} en double`);
    words.add(word); emojis.add(emoji);
  }
  for (const [t, say] of S.EXTRA) { assert.match(t, /^[A-Z]+$/); assert.ok(say); }
  assert.ok(S.wordsFor(1).length >= 15 && S.wordsFor(3).length >= 10);
});

test("Syllabes : les pièges ne font jamais partie du mot, et on peut toujours finir", () => {
  for (const lv of [1, 2, 3]) { // crans « construire » du générateur (le cran 4 = lire seul)
    const rng = rngFrom(lv * 13);
    for (let i = 0; i < 2000; i++) {
      const q = S.generate(lv, rng);
      assert.equal(q.mode, "build");
      const own = q.syllables.map((s) => s.text);
      const traps = q.tiles.filter((t) => t.part === -1);
      assert.equal(traps.length, lv === 1 ? 0 : lv === 2 ? 1 : 2);
      for (const t of traps) assert.ok(!own.includes(t.text), `piège ${t.text} dans ${q.word}`);
      assert.equal(q.tiles.length, own.length + traps.length);
      // on simule un enfant qui touche les bonnes tuiles dans l'ordre
      const left = q.tiles.slice();
      for (let k = 0; k < own.length; k++) {
        const idx = left.findIndex((t) => S.isNext(q, k, t));
        assert.ok(idx >= 0, `${q.word} : syllabe ${k} introuvable`);
        left.splice(idx, 1);
      }
      assert.ok(left.every((t) => t.part === -1));
      if (lv === 1) assert.equal(own.length, 2);
      if (lv === 3) assert.ok(own.length >= 3);
    }
  }
  const q4 = S.generate(4, rngFrom(1));
  assert.equal(q4.mode, "read");
  assert.equal(q4.options.filter((o) => o.word === q4.word).length, 1);
  assert.equal(new Set(q4.options.map((o) => o.emoji)).size, 3);
  assert.equal(S.blendSpeech({ word: "PAPILLON", syllables: [{ say: "pa" }, { say: "pi" }, { say: "yon" }] }), "pa... pi... yon... papillon !");
});

// ---------------------------------------------------------------- Boulangerie
test("Boulangerie : les nombres demandés respectent le niveau, phrases bien accordées", () => {
  const ranges = { 1: [1, 5], 2: [1, 10], 3: [11, 20], 4: [2, 10], 5: [5, 20], 6: [15, 50] };
  for (let lv = 1; lv <= B.MAX_LEVEL; lv++) {
    const rng = rngFrom(lv * 3);
    for (let i = 0; i < 2000; i++) {
      const q = B.generate(lv, rng);
      const v = q.mode === "pay" ? q.price : q.n;
      assert.ok(v >= ranges[lv][0] && v <= ranges[lv][1], `niveau ${lv} : ${v}`);
      assert.equal(q.mode, lv >= 4 ? "pay" : "count");
      assert.doesNotMatch(q.speech, /undefined|NaN/);
      if (q.mode === "pay") assert.ok(B.canPay(q.price, q.coins));
      if (q.mode === "count" && q.n === 1) assert.match(q.speech, /Je voudrais (un|une) /);
    }
  }
  const baguette = B.PASTRIES.find((p) => p.e === "🥖");
  const croissant = B.PASTRIES.find((p) => p.e === "🥐");
  assert.equal(B.count(1, baguette), "une baguette");
  assert.equal(B.count(1, croissant), "un croissant");
  assert.equal(B.count(3, croissant), "3 croissants");
});

test("Boulangerie : dizaines et unités, réponses du client, monnaie", () => {
  assert.equal(B.decompose(13), "13, c'est une boîte de 10 et encore 3.");
  assert.equal(B.decompose(10), "10, c'est une boîte de 10 bien pleine.");
  assert.equal(B.decompose(20), "20, c'est deux boîtes de 10.");
  const p = B.PASTRIES[0];
  assert.deepEqual(B.feedback(7, 7, p).ok, true);
  assert.equal(B.feedback(7, 6, p).text, "Tu as mis 6 croissants. Il en manque un.");
  assert.equal(B.feedback(7, 9, p).text, "Tu as mis 9 croissants. Il y en a 2 de trop.");
  const tarte = B.PASTRIES.find((x) => x.e === "🥧");
  assert.equal(B.feedback(3, 2, tarte).text, "Tu as mis 2 tartes. Il en manque une.");
  assert.equal(B.sum([2, 2, 1]), 5);
  assert.equal(B.payFeedback(5, [2, 2, 1]).ok, true);
  assert.equal(B.payFeedback(5, [2, 2]).text, "Tu as donné 4 euros. Il manque 1 euro.");
  assert.equal(B.payFeedback(5, [5, 2]).text, "Tu as donné 7 euros. C'est 2 euros de trop.");
  assert.equal(B.payFeedback(3, [1]).text, "Tu as donné 1 euro. Il manque 2 euros.");
  assert.ok(B.canPay(7, [2, 5]) && !B.canPay(3, [2]));
});
