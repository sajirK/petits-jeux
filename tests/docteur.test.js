// Tests du Docteur V2 : outils, soins et 3 niveaux.
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../games/docteur/logic.js");
const KL = require("../js/kit/levels.js");

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("Docteur : chaque soin utilise des outils et des zones qui existent", () => {
  for (const [id, a] of Object.entries(D.AILMENTS)) {
    assert.ok(a.intro && a.icon && a.steps.length >= 1, id);
    for (const s of a.steps) {
      assert.ok(D.TOOLS[s.tool], `${id} : outil ${s.tool}`);
      assert.ok(s.zone === "mud" || D.ZONES[s.zone], `${id} : zone ${s.zone}`);
      assert.ok(["rub", "place", "pull", "mud"].includes(s.type));
      if (s.type === "rub") assert.ok(s.amount > 0);
      if (s.type === "place") assert.ok(s.count >= 1);
      assert.ok(s.say.length > 10);
    }
  }
});

test("Docteur : 3 niveaux complets, du plus facile au plus difficile", () => {
  assert.ok(KL.validateConfig(D.LEVELS));
  const [l1, l2, l3] = [1, 2, 3].map((n) => D.LEVELS[n]);
  assert.ok(l1.rounds <= l2.rounds && l2.rounds <= l3.rounds);
  assert.ok(l1.tray < l2.tray && l2.tray <= l3.tray);
  assert.ok(l1.glow && !l2.glow && !l3.glow, "seul le Facile fait briller le bon outil");
  assert.ok(l1.amountScale < l2.amountScale && l2.amountScale <= l3.amountScale);
  for (const a of l1.ailments) assert.ok(D.AILMENTS[a].simple, `${a} n'est pas un soin simple`);
  assert.equal(l3.tray, Object.keys(D.TOOLS).length, "Difficile : trousse complète");
});

test("Docteur : quantités adaptées au niveau", () => {
  const f1 = D.stepsFor("fievre", 1), f3 = D.stepsFor("fievre", 3);
  assert.equal(f1.find((s) => s.tool === "sirop").count, 1, "Facile : une seule cuillère");
  assert.equal(f3.find((s) => s.tool === "sirop").count, 3);
  assert.ok(D.stepsFor("bobo", 1)[0].amount < D.stepsFor("bobo", 3)[0].amount, "Facile : on frotte moins longtemps");
});

test("Docteur : une partie a le bon nombre de patients, et la trousse contient toujours les bons outils", () => {
  for (const level of [1, 2, 3, 4]) {
    const rng = rngFrom(level * 11);
    for (let i = 0; i < 400; i++) {
      const s = D.session(level, rng);
      assert.equal(s.patients.length, D.LEVELS[level].rounds);
      for (const p of s.patients) {
        assert.ok(D.LEVELS[level].ailments.includes(p.ailment));
        const tray = level === 1 ? D.trayFor([p.ailment], level, rng) : s.tray;
        for (const st of p.steps) assert.ok(tray.includes(st.tool), `niveau ${level} : ${st.tool} absent de la trousse`);
        assert.equal(new Set(tray).size, tray.length, "pas d'outil en double");
        if (level === 1) assert.equal(tray.length, D.LEVELS[1].tray);
      }
      // pas deux fois le même soin d'affilée
      for (let k = 1; k < s.patients.length; k++) assert.notEqual(s.patients[k].ailment, s.patients[k - 1].ailment);
      // les animaux changent
      assert.equal(new Set(s.patients.map((p) => p.animal[0])).size, s.patients.length);
    }
  }
});

test("Docteur : bon outil et zones", () => {
  const step = D.AILMENTS.bobo.steps[0];
  assert.ok(D.isRightTool(step, "desinfectant"));
  assert.ok(!D.isRightTool(step, "pansement"));
  assert.ok(D.inZone([63, 28], "joue"));
  assert.ok(!D.inZone([20, 90], "joue"));
});
