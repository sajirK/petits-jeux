// Tests de la logique V2 des jeux sans fichier de test dédié.
const test = require("node:test");
const assert = require("node:assert/strict");
const KL = require("../js/kit/levels.js");
const CO = require("../games/compter/logic.js");
const LT = require("../games/lettres/logic.js");
const QF = require("../games/que-faire/logic.js");
const CL = require("../games/couleurs/logic.js");

function rngFrom(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

test("Je compte : la bonne réponse est là, une fois ; les pièges ne sont pas de la même sorte", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv);
    for (let i = 0; i < 2000; i++) {
      const q = CO.question(lv, rng);
      const cfg = CO.LEVELS[lv];
      assert.ok(q.n >= cfg.min && q.n <= cfg.max);
      assert.equal(q.options.filter((o) => o === q.n).length, 1);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(q.items.filter((e) => e === q.thing.e).length, q.n, "le bon nombre d'objets à compter");
      if (q.other) assert.notEqual(q.other.e, q.thing.e);
      assert.ok(q.options.every((o) => o >= 1 && o <= 10));
    }
  }
  assert.equal(CO.countWord(1, CO.THINGS[0]), "une");
  assert.equal(CO.countWord(1, CO.THINGS[1]), "un");
});

test("Les Lettres : mots de la bonne longueur, lettres en trop jamais dans le mot", () => {
  for (const [w] of LT.WORDS) assert.match(w, /^[A-Z]+$/);
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 3);
    for (let i = 0; i < 300; i++) {
      const ws = LT.words(lv, rng);
      assert.equal(ws.length, LT.LEVELS[lv].rounds);
      assert.equal(new Set(ws.map((w) => w[0])).size, ws.length);
      for (const [w] of ws) {
        assert.ok(w.length >= LT.LEVELS[lv].minLen && w.length <= LT.LEVELS[lv].maxLen);
        const t = LT.tiles(w, lv, rng);
        assert.equal(t.length, w.length + LT.LEVELS[lv].extras);
        const extra = t.slice(); for (const l of w) extra.splice(extra.indexOf(l), 1);
        for (const l of extra) assert.ok(!w.includes(l));
      }
    }
  }
  assert.equal(LT.nameWord("Léa"), "LEA");
  assert.equal(LT.nameWord("Jean-Paul"), "JEANPAUL".length <= 7 ? "JEANPAUL" : null);
  assert.equal(LT.nameWord("A"), null);
});

test("Que ferais-tu ? : une seule bonne réaction, bon nombre de choix, histoires toutes différentes", () => {
  for (const lv of [1, 2, 3]) {
    const s = QF.stories(lv, rngFrom(lv));
    assert.equal(s.length, QF.LEVELS[lv].rounds);
    assert.equal(new Set(s.map((c) => c.text)).size, s.length);
    for (const c of s) {
      assert.equal(c.options.length, QF.LEVELS[lv].options);
      assert.equal(c.options.filter((o) => o.good).length, 1);
    }
  }
});

test("Les Couleurs : la couleur demandée est toujours parmi les ballons", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 7);
    for (let i = 0; i < 2000; i++) {
      const q = CL.question(lv, rng);
      assert.equal(q.set.length, CL.LEVELS[lv].balloons);
      assert.ok(q.set.includes(q.goal));
      assert.ok(q.set.every((c) => CL.COLORS[c]));
    }
  }
  assert.equal(CL.le("orange"), "l'orange");
  assert.equal(CL.le("rouge"), "le rouge");
});

test("Toutes les configurations de niveaux V2 sont valides", () => {
  for (const L of [CO.LEVELS, LT.LEVELS, QF.LEVELS, CL.LEVELS]) assert.ok(KL.validateConfig(L));
});
