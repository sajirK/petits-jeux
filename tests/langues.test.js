// Tests de « Les langues » : contenu complet, questions justes, phrases reconstructibles, progression.
const test = require("node:test");
const assert = require("node:assert");
const LG = require("../games/langues/logic.js");

function rngFrom(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
const LANGS = Object.keys(LG.LANGS);

test("Langues : 12 thèmes, chaque mot et chaque phrase existe en français, anglais, allemand et espagnol", () => {
  assert.equal(LG.UNITS.length, 12);
  assert.equal(LG.UNITS[0].id, "animaux", "on commence par les animaux (pas les couleurs)");
  for (const w of LG.WORDS) for (const l of ["fr", ...LANGS]) assert.ok(w[l] && w[l].length > 0, `${w.id} ${l}`);
  for (const s of LG.SENTENCES) for (const l of ["fr", ...LANGS]) assert.ok(/[.!?]$/.test(s[l]), `${s.id} ${l}`);
  for (const u of LG.UNITS) {
    assert.ok(LG.wordsOf(u.id).length >= 6, `${u.id} : assez de mots pour 6 images`);
    assert.ok(LG.sentencesOf(u.id).length >= 2, `${u.id} : au moins 2 phrases`);
  }
});

test("Langues : une seule bonne image, jamais deux images identiques, pas deux fois le même mot de suite", () => {
  const rng = rngFrom(7);
  for (const u of LG.UNITS) for (const level of [1, 2, 3]) {
    let avoid = null;
    for (let i = 0; i < 200; i++) {
      const q = LG.question(level, u.id, "en", rng, avoid);
      assert.notEqual(q.target.id, avoid);
      avoid = q.target.id;
      assert.equal(q.options.filter((o) => o.id === q.target.id).length, 1);
      assert.equal(new Set(q.options.map((o) => o.e)).size, q.options.length, `${u.id} : images en double`);
      if (level === 1) assert.equal(q.options.length, 2);
      if (level === 2) assert.equal(q.options.length, 4);
    }
  }
});

test("Langues (Expert) : chaque phrase se reconstruit avec ses tuiles, mélangées", () => {
  const rng = rngFrom(3);
  for (const u of LG.UNITS) for (const l of LANGS) for (let i = 0; i < 30; i++) {
    const q = LG.buildQuestion(u.id, l, rng);
    assert.deepEqual(q.tiles.map((t) => t.t).sort(), q.parts.slice().sort());
    // en suivant l'aide, on arrive au bout
    const left = q.tiles.slice();
    for (let placed = 0; placed < q.parts.length; placed++) {
      const k = left.findIndex((t) => LG.isNext(q, placed, t));
      assert.ok(k >= 0, `${q.target.id} ${l}`);
      left.splice(k, 1);
    }
  }
});

test("Langues : les thèmes s'ouvrent l'un après l'autre", () => {
  assert.deepEqual(LG.unlocked({}), ["animaux"]);
  assert.deepEqual(LG.unlocked({ animaux: 1 }), ["animaux", "bonjour"]);
  assert.equal(LG.unlocked(Object.fromEntries(LG.UNITS.map((u) => [u.id, 4]))).length, 12);
});
