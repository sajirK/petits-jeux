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

const TO = require("../games/tours/logic.js");
test("La Tour des Nombres : nombres du niveau, additions justes", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 5);
    for (let i = 0; i < 2000; i++) {
      const q = TO.question(lv, rng);
      assert.ok(q.target >= TO.LEVELS[lv].min && q.target <= TO.LEVELS[lv].max);
      assert.equal(q.fixed + q.toAdd, q.target);
      if (lv === 3) assert.ok(q.fixed >= 1 && q.toAdd >= 1); else assert.equal(q.fixed, 0);
    }
  }
  assert.equal(TO.say({ fixed: 2, toAdd: 3, target: 5 }), "deux plus trois, ça fait combien ? Construis la tour !");
});

const BO = require("../games/boulangerie/logic.js");
const FO = require("../games/formes/logic.js");
const ME = require("../games/memoire/logic.js");
test("Boulangerie V2 : niveaux, et l'aide propose la bonne pièce", () => {
  assert.ok(KL.validateConfig(BO.LEVELS));
  assert.equal(BO.bestCoin(7, [1, 2, 5]), 5);
  assert.equal(BO.bestCoin(1, [1, 2]), 1);
  assert.equal(BO.bestCoin(3, [2, 5]), 2);
});
test("Les Formes : chaque forme a son ombre, et le niveau 3 a des formes qui se ressemblent", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 9);
    for (let i = 0; i < 1000; i++) {
      const b = FO.board(lv, rng);
      assert.equal(b.pieces.length, FO.LEVELS[lv].pieces);
      assert.deepEqual([...b.pieces].sort(), [...b.shadows].sort());
      assert.equal(new Set(b.pieces).size, b.pieces.length);
      for (const n of b.pieces) { assert.ok(FO.SHAPES[n]); assert.ok(FO.ARTICLE[n]); }
      if (lv === 3) assert.ok((b.pieces.includes("rond") && b.pieces.includes("ovale")) || (b.pieces.includes("carré") && b.pieces.includes("rectangle")));
    }
  }
});
test("Memory : paires complètes, et une erreur ne compte que si on avait déjà vu la bonne carte", () => {
  for (const lv of [1, 2, 3]) {
    const d = ME.deck(lv, rngFrom(lv));
    assert.equal(d.length, ME.LEVELS[lv].pairs * 2);
    for (const c of d) assert.equal(d.filter((x) => x.e === c.e).length, 2);
  }
  const cards = [{ id: 0, e: "🐶" }, { id: 1, e: "🐱" }, { id: 2, e: "🐶" }, { id: 3, e: "🐱" }];
  assert.equal(ME.isMemoryMistake(cards, new Set(), cards[0], cards[1]), false, "au début, on ne pouvait pas savoir");
  assert.equal(ME.isMemoryMistake(cards, new Set([2]), cards[0], cards[1]), true, "on avait vu l'autre chien");
  assert.equal(ME.isMemoryMistake(cards, new Set([2]), cards[0], cards[2]), false, "c'est une paire");
});
test("Les Formes : « l'ombre du / de la / de l' » pour chaque forme", () => {
  for (const n of Object.keys(FO.SHAPES)) assert.match(FO.DE[n], /^(du |de la |de l')/, n);
  assert.equal(FO.DE["étoile"], "de l'étoile");
  assert.equal(FO.DE.lune, "de la lune");
});

const PZ = require("../games/pizzeria/logic.js");
const GL = require("../games/glacier/logic.js");
test("Pizzeria : commandes du niveau, avis juste, aide cohérente", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 13);
    for (let i = 0; i < 1000; i++) {
      const o = PZ.order(lv, rng);
      const cfg = PZ.LEVELS[lv];
      const types = Object.keys(o.tops);
      assert.ok(types.length >= cfg.types[0] && types.length <= cfg.types[1]);
      for (const t of types) { assert.ok(o.tray.includes(t), "la garniture demandée est sur le plateau"); assert.ok(o.tops[t] >= 1 && o.tops[t] <= cfg.maxCount); }
      if (lv < 3) assert.ok(o.cheese);
      // une pizza parfaite
      const perfect = { sauce: 1, cheese: o.cheese ? 1 : 0, tops: { ...o.tops } };
      assert.ok(PZ.judge(o, perfect).perfect);
      assert.equal(PZ.nextNeed(o, perfect), "four");
      assert.doesNotMatch(PZ.sentence(o, "Léa"), /undefined/);
      // il manque une garniture
      const t = types[0];
      const missing = { ...perfect, tops: { ...o.tops, [t]: o.tops[t] - 1 } };
      assert.ok(!PZ.judge(o, missing).perfect);
      assert.deepEqual(PZ.nextNeed(o, missing), { add: t });
    }
  }
  assert.equal(PZ.nextNeed({ cheese: true, tops: {} }, { sauce: 0, cheese: 0, tops: {} }), "sauce");
  assert.match(PZ.judge({ cheese: false, tops: {} }, { sauce: 1, cheese: 0.5, tops: {} }).notes[0], /sans fromage/);
  assert.equal(PZ.named("🫒", 1), "une olive");
  assert.equal(PZ.named("🍄", 3), "trois champignons");
});
test("Glacier : commandes du niveau, parfums disponibles, avis juste", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 17);
    for (let i = 0; i < 1000; i++) {
      const o = GL.order(lv, rng);
      const cfg = GL.LEVELS[lv];
      assert.ok(o.scoops.length >= cfg.scoops[0] && o.scoops.length <= cfg.scoops[1]);
      for (const f of o.scoops) assert.ok(o.tubs.includes(f), "le parfum demandé est dans les bacs");
      assert.equal(new Set(o.tubs).size, o.tubs.length);
      assert.ok(o.decos.length >= cfg.decos[0] && o.decos.length <= cfg.decos[1]);
      if (lv === 1) assert.equal(o.sauce, null);
      assert.ok(GL.judge(o, { holder: o.holder, scoops: [...o.scoops], sauce: o.sauce, decos: [...o.decos] }).perfect);
      assert.ok(!GL.judge(o, { holder: o.holder === "pot" ? "cornet" : "pot", scoops: [...o.scoops], sauce: o.sauce, decos: [...o.decos] }).perfect);
      assert.doesNotMatch(GL.sentence(o, "Léa"), /undefined|du la|de le/);
    }
  }
});

// ---------------------------------------------------------------- Lot 3 : Découvrir
const MO = require("../games/monde/logic.js");
const HO = require("../games/horloge/logic.js");
const SA = require("../games/saisons/logic.js");
const JA = require("../games/jardin/logic.js");

test("Monde V2 : les animaux d'une partie ont leur continent sur la carte", () => {
  for (const lv of [1, 2, 3]) for (let k = 0; k < 30; k++) {
    const d = MO.deck(lv);
    assert.equal(d.length, MO.LEVELS[lv].rounds, `niveau ${lv}`);
    assert.equal(new Set(d.map((a) => a.e)).size, d.length);
    for (const a of d) assert.ok(MO.LEVELS[lv].continents.includes(a.c));
  }
  assert.ok(MO.LEVELS[1].continents.length < MO.LEVELS[2].continents.length);
});

test("Horloge V2 : bonnes heures par niveau, une seule bonne horloge, réglage au niveau 3", () => {
  for (const lv of [1, 2, 3]) for (let i = 0; i < 6; i++) for (let k = 0; k < 20; k++) {
    const q = HO.question(lv, i);
    if (q.mode === "set") { assert.equal(lv, 3); assert.equal(i % 2, 1); continue; }
    assert.ok(HO.MINUTES_BY_LEVEL[HO.LEVELS[lv].internal].includes(q.m));
    assert.equal(q.options.filter((o) => o.h === q.h && o.m === q.m).length, 1);
    assert.equal(q.options.length, lv === 1 ? 3 : 4);
  }
  const q = { h: 4, m: 45 };
  assert.equal(HO.nextSetMove(q, 12, 0), "m+");
  assert.equal(HO.nextSetMove(q, 12, 45), "h+");
  assert.equal(HO.nextSetMove(q, 4, 45), "ok");
  assert.equal(HO.toWords(4, 45), "5 heures moins le quart");
});

test("Saisons V2 : la petite armoire contient toujours la bonne tenue et des pièges", () => {
  for (const w of SA.WEATHERS) for (let k = 0; k < 20; k++) {
    const wd = SA.wardrobeFor(w, true);
    for (const n of w.need) assert.ok(wd.includes(n));
    assert.equal(wd.filter((x) => w.no[x]).length, Math.min(2, Object.keys(w.no).length));
    assert.ok(SA.checkOutfit(w, w.need).ok);
  }
  for (const lv of [1, 2, 3]) {
    const p = SA.plan(lv);
    assert.equal(p.length, SA.LEVELS[lv].rounds);
    for (const r of p) if (r.kind !== "meteo") assert.ok(r.options.some((o) => o.id === r.answer));
    assert.equal(p.some((r) => r.kind === "after"), lv === 3);
  }
});

test("Jardin V2 : en suivant l'aide, chaque plante pousse et se cueille", () => {
  for (const lv of [1, 2, 3]) {
    const pots = JA.potsFor(lv);
    assert.equal(pots.length, JA.LEVELS[lv].pots);
    for (const p of pots) {
      let steps = 0;
      while (JA.nextAction(p) !== "cueillir") {
        const r = JA.nextAction(p) === "eau" ? JA.water(p) : JA.sun(p);
        assert.ok(r.ok); steps++;
        assert.ok(steps < 20);
      }
      assert.equal(p.stage, 4);
      assert.ok(JA.harvest(p));
    }
  }
});
