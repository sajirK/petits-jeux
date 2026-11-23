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
  for (const lv of [1, 2, 3, 4]) {
    const rng = rngFrom(lv);
    for (let i = 0; i < 2000; i++) {
      const q = CO.question(lv, rng);
      const cfg = CO.LEVELS[lv];
      assert.ok(q.n >= cfg.min && q.n <= cfg.max);
      assert.equal(q.options.filter((o) => o === q.n).length, 1);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(q.items.filter((e) => e === q.thing.e).length, q.n, "le bon nombre d'objets à compter");
      if (q.other) assert.notEqual(q.other.e, q.thing.e);
      assert.ok(q.options.every((o) => o >= 1 && o <= Math.max(10, cfg.max)));
    }
  }
  assert.equal(CO.countWord(1, CO.THINGS[0]), "une");
  assert.equal(CO.countWord(1, CO.THINGS[1]), "un");
});

test("Les Lettres : mots de la bonne longueur, lettres en trop jamais dans le mot", () => {
  for (const [w] of LT.WORDS) assert.match(w, /^[A-Z]+$/);
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
    const rng = rngFrom(lv * 5);
    for (let i = 0; i < 2000; i++) {
      const q = TO.question(lv, rng);
      assert.ok(q.target >= TO.LEVELS[lv].min && q.target <= TO.LEVELS[lv].max);
      assert.equal(q.fixed + q.toAdd, q.target);
      if (lv >= 3) assert.ok(q.fixed >= 1 && q.toAdd >= 1); else assert.equal(q.fixed, 0);
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) {
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
  for (const lv of [1, 2, 3, 4]) for (let k = 0; k < 30; k++) {
    const d = MO.deck(lv);
    assert.equal(d.length, MO.LEVELS[lv].rounds, `niveau ${lv}`);
    assert.equal(new Set(d.map((a) => a.e)).size, d.length);
    for (const a of d) assert.ok(MO.LEVELS[lv].continents.includes(a.c));
  }
  assert.ok(MO.LEVELS[1].continents.length < MO.LEVELS[2].continents.length);
});

test("Horloge V2 : bonnes heures par niveau, une seule bonne horloge, réglage au niveau 3", () => {
  for (const lv of [1, 2, 3, 4]) for (let i = 0; i < 6; i++) for (let k = 0; k < 20; k++) {
    const q = HO.question(lv, i);
    if (q.mode === "set") { assert.ok(lv === 4 || (lv === 3 && i % 2 === 1)); continue; }
    assert.notEqual(lv, 4, "Expert : on règle toujours soi-même");
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
  for (const lv of [1, 2, 3, 4]) {
    const p = SA.plan(lv);
    assert.equal(p.length, SA.LEVELS[lv].rounds);
    for (const r of p) if (r.kind !== "meteo") assert.ok(r.options.some((o) => o.id === r.answer));
    assert.equal(p.some((r) => r.kind === "after"), lv >= 3);
  }
});

test("Jardin V2 : en suivant l'aide, chaque plante pousse et se cueille", () => {
  for (const lv of [1, 2, 3, 4]) {
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

// ---------------------------------------------------------------- Lot 4 : jeux d'action
const TA = require("../games/taupe/logic.js");
const BU = require("../games/bulles/logic.js");
const RE = require("../games/reflexe/logic.js");

test("Taupe V2 : pas de chauve-souris en Facile, la chauve-souris est la seule erreur", () => {
  for (let k = 0; k < 500; k++) assert.notEqual(TA.nextType(TA.LEVELS[1]), "bat");
  assert.ok(Array.from({ length: 500 }, () => TA.nextType(TA.LEVELS[3])).includes("bat"));
  assert.equal(TA.points("normal"), 1); assert.equal(TA.points("bonus"), 2); assert.equal(TA.points("bat"), 0);
  assert.ok(TA.isMistake("bat") && !TA.isMistake("bonus"));
  assert.ok(TA.LEVELS[1].stay > TA.LEVELS[2].stay && TA.LEVELS[2].stay > TA.LEVELS[3].stay);
});

test("Bulles V2 : en Facile toutes les bulles sont bonnes ; ensuite, seulement la bonne couleur", () => {
  assert.ok(BU.isGood(BU.LEVELS[1], "roses", "bleues"));
  assert.ok(!BU.isGood(BU.LEVELS[2], "roses", "bleues"));
  assert.ok(BU.isGood(BU.LEVELS[3], "bleues", "bleues"));
  for (let k = 0; k < 50; k++) { const t = BU.nextTarget("bleues"); assert.notEqual(t, "bleues"); assert.ok(BU.COLORS[t]); }
  const n = Array.from({ length: 1000 }, () => BU.bubbleColor(BU.LEVELS[2], "vertes")).filter((c) => c === "vertes").length;
  assert.ok(n > 400, "assez de bulles de la bonne couleur");
});

test("Réflexe V2 : les règles de chaque niveau existent, et les objets sont du bon côté", () => {
  for (const lv of [1, 2, 3, 4]) for (let k = 0; k < 20; k++) {
    const r = RE.ruleFor(lv);
    assert.ok(RE.LEVELS[lv].rules.includes(r.id));
    for (let j = 0; j < 20; j++) { const it = RE.nextItem(r, Math.random, RE.LEVELS[lv].goRatio); assert.ok((it.go ? r.go : r.nogo).includes(it.value)); }
  }
  assert.notEqual(RE.ruleFor(3, () => 0, "grenouille").id, "grenouille");
});

const FR = require("../games/fruits/logic.js");
test("Fruits V2 : pas de piège en Facile, chaussette et bombe sont des erreurs, la coupe est bien détectée", () => {
  for (let k = 0; k < 500; k++) assert.ok(!FR.isMistake(FR.nextKind(FR.LEVELS[1])));
  const kinds = Array.from({ length: 2000 }, () => FR.nextKind(FR.LEVELS[3]));
  assert.ok(kinds.includes("sock") && kinds.includes("bomb"));
  assert.equal(FR.VALUE.fruit, 1); assert.equal(FR.VALUE.sock, 0);
  assert.equal(FR.segDist(5, 3, { x: 0, y: 0 }, { x: 10, y: 0 }), 3);
  assert.equal(FR.segDist(-4, 3, { x: 0, y: 0 }, { x: 10, y: 0 }), 5);
});

const DI = require("../games/dino/logic.js");
test("Dino V2 : parcours toujours franchissables, sans trou en Facile, escargots seulement en Difficile", () => {
  const maxJumpH = DI.PHYS.JUMP ** 2 / (2 * DI.PHYS.GRAV);
  assert.ok(maxJumpH > 3, "on peut sauter plus haut que les plateformes (3 cases)");
  for (const lv of [1, 2, 3, 4]) for (let k = 0; k < 200; k++) {
    const c = DI.buildCourse(lv);
    assert.ok(DI.isPassable(c, DI.LEVELS[lv].maxGap), `niveau ${lv}`);
    if (lv === 1) assert.ok(DI.isPassable(c, 0), "pas de trou en Facile");
    if (lv < 3) assert.equal(c.enemies.length, 0);
    for (const e of c.enemies) assert.ok(e.max - e.min >= 4);
    assert.ok(c.flag.x > DI.LEVELS[lv].length);
  }
  assert.ok(DI.stomps(5, 7.1, 7.2)); assert.ok(!DI.stomps(-3, 7.1, 7.2)); assert.ok(!DI.stomps(5, 7.9, 7.2));
});

const CRS = require("../games/course/logic.js");
test("Course V2 : passages toujours atteignables et assez grands pour le poisson", () => {
  for (const lv of [1, 2, 3, 4]) {
    const cfg = CRS.LEVELS[lv];
    for (let d = 0; d <= cfg.dist; d += 5) for (let k = 0; k < 30; k++) {
      const o = CRS.obstacle(cfg, d);
      assert.ok(o.top >= CRS.MIN_Y - 1e-9 && o.bottom <= CRS.MAX_Y + 1e-9, "passage dans la zone de nage");
      assert.ok(o.bottom - o.top >= 3.2 - 1e-9, "assez grand (le poisson fait 1,1)");
    }
    assert.ok(CRS.speedAt(cfg, 0) <= CRS.speedAt(cfg, cfg.dist));
  }
  assert.ok(CRS.gapAt(CRS.LEVELS[1], 0) > CRS.gapAt(CRS.LEVELS[3], 0));
});

const TR = require("../games/tresors/logic.js");
test("Château V2 : tout le labyrinthe est accessible, et le chemin mène aux trésors puis à la porte", () => {
  for (const lv of [1, 2, 3, 4]) for (let n = 1; n <= TR.LEVELS[lv].rounds; n++) for (let k = 0; k < 20; k++) {
    const c = TR.castle(lv, n);
    assert.equal(c.gems.length, TR.LEVELS[lv].gems(n));
    assert.ok(c.bats.length <= TR.LEVELS[lv].bats(n));
    // on suit le chemin : on ramasse tout, puis on arrive à la porte
    const hero = { x: 1, y: 1 }, gems = c.gems.slice();
    for (let s = 0; s < 500 && (gems.length || hero.x !== c.door.x || hero.y !== c.door.y); s++) {
      const dir = TR.nextStep(c.grid, hero, gems.length ? gems : [c.door]);
      assert.ok(dir, "un chemin existe");
      hero.x += TR.DIRS[dir][0]; hero.y += TR.DIRS[dir][1];
      const i = gems.findIndex((g) => g.x === hero.x && g.y === hero.y);
      if (i >= 0) gems.splice(i, 1);
    }
    assert.equal(gems.length, 0);
    assert.deepEqual([hero.x, hero.y], [c.door.x, c.door.y]);
  }
  assert.ok(TR.LEVELS[1].batSpeed > TR.LEVELS[3].batSpeed);
  assert.equal(TR.LEVELS[1].batCounts, false, "en Facile, la chauve-souris ne compte pas comme une erreur");
});

// ---------------------------------------------------------------- Lot 5
const RO = require("../games/robot/logic.js");
const MEL = require("../games/melodie/logic.js");
const TC = require("../games/tracer/logic.js");

test("Robot V2 : grilles par niveau, et l'aide mène toujours à la victoire", () => {
  for (const lv of [1, 2, 3, 4]) for (let i = 0; i < RO.LEVELS[lv].rounds; i++) for (let k = 0; k < 30; k++) {
    const g = RO.generate(RO.gridFor(lv, i));
    const prog = ["up"].filter(() => g.solution[0] !== "up"); // une flèche fausse au début
    for (let s = 0; s < 40; s++) {
      const m = RO.nextMove(g, prog);
      if (m === "go") break;
      if (m === "undo") prog.pop(); else prog.push(m);
    }
    assert.equal(RO.run(g, prog).result, "win");
  }
  assert.ok(RO.gridFor(1, 0) < RO.gridFor(3, 3));
});

test("Mélodie V2 : bonnes longueurs, jamais 3 notes pareilles de suite", () => {
  for (const lv of [1, 2, 3, 4]) {
    const cfg = MEL.LEVELS[lv];
    assert.equal(cfg.lengths.length, cfg.rounds);
    for (const len of cfg.lengths) for (let k = 0; k < 100; k++) {
      const m = MEL.melody(len, cfg.pads);
      assert.equal(m.length, len);
      assert.ok(m.every((n) => n >= 0 && n < cfg.pads));
      for (let i = 2; i < m.length; i++) assert.ok(!(m[i] === m[i - 1] && m[i] === m[i - 2]));
    }
  }
  assert.ok(MEL.speed(7) < MEL.speed(2) && MEL.speed(20) >= 380);
});

test("J'écris V2 : lettres du niveau, initiale du prénom en premier, tolérance qui se resserre", () => {
  for (const lv of [1, 2, 3, 4]) for (let k = 0; k < 30; k++) {
    const gl = TC.pickGlyphs(lv, "Éloïse");
    assert.equal(gl.length, TC.LEVELS[lv].rounds);
    assert.equal(new Set(gl).size, gl.length);
    for (const g of gl) { assert.ok(TC.LEVELS[lv].set.includes(g)); assert.ok(TC.glyph(g)); }
    assert.equal(gl[0], "E", "l'initiale (sans accent) d'abord");
  }
  assert.ok(TC.pickGlyphs(1, "Zoé")[0] !== "Z" || TC.EASY.includes("Z"));
  assert.ok(TC.LEVELS[1].tol > TC.LEVELS[2].tol && TC.LEVELS[2].tol > TC.LEVELS[3].tol);
  // en suivant le trait avec la tolérance du niveau, on le termine
  for (const lv of [1, 3]) {
    const tr = TC.newTrace(TC.glyph("B")[1]);
    TC.touchStart(tr);
    for (const [x, y] of tr.points) TC.feed(tr, x + 2, y, TC.LEVELS[lv].tol);
    assert.ok(tr.done);
  }
});

test("Jeux libres : dessin, piano, respire, météo n'ont pas de niveaux, et la météo parle juste", () => {
  for (const g of ["dessin", "piano", "respire", "meteo"]) assert.equal(require(`../games/${g}/logic.js`).FREE, true, g);
  const MT = require("../games/meteo/logic.js");
  const EM = require("../js/emotions.js");
  for (const k of MT.ORDER) {
    assert.ok(EM.EMOTIONS[k], k);
    const m = MT.message(k);
    assert.ok(!/ressent (le|la) /.test(m), `accord : ${m}`);
  }
  assert.ok(MT.needsAdult("peur", 2) && !MT.needsAdult("peur", 1) && !MT.needsAdult("joie", 2));
  const RS = require("../games/respire/logic.js");
  assert.ok(RS.OUT > RS.IN, "on expire plus longtemps qu'on inspire");
  assert.equal(RS.duration(), 5 * 10600);
});
