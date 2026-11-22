// Tests de l'étape 3 : le tour du monde, l'horloge, les saisons, le jardin.
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../games/monde/logic.js");
const H = require("../games/horloge/logic.js");
const S = require("../games/saisons/logic.js");
const J = require("../games/jardin/logic.js");

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- Tour du monde
test("Monde : chaque animal a un seul continent connu, une anecdote, pas de doublon", () => {
  const emojis = new Set();
  for (const [e, name, c, fact] of M.ANIMALS) {
    assert.ok(M.CONTINENTS[c], `${name} : continent inconnu ${c}`);
    assert.match(name, /^(le |la |les |l')/);
    assert.ok(fact.length > 15 && /[.!]$/.test(fact));
    assert.ok(!emojis.has(e)); emojis.add(e);
  }
  // animaux volontairement exclus car ils vivent sur plusieurs continents
  for (const banned of ["🦁", "🐘", "🐻", "🦊", "🐺", "🦌", "🐻‍❄️", "🐪"]) assert.ok(!emojis.has(banned), `${banned} vit sur plusieurs continents`);
  // presque tous les continents ont au moins un animal (l'Europe sert de repère : "ici, c'est chez nous")
  const used = new Set(M.ANIMALS.map((a) => a[2]));
  for (const c of Object.keys(M.CONTINENTS)) if (c !== "europe") assert.ok(used.has(c), `aucun animal pour ${c}`);
});

test("Monde : phrases correctes", () => {
  const round = M.newRound(rngFrom(1));
  assert.equal(round.length, M.ANIMALS.length);
  const k = round.find((a) => a.e === "🦘");
  assert.equal(M.rightText(k), "Oui ! Le kangourou vient d'Océanie ! Le bébé kangourou grandit dans la poche de sa maman.");
  const p = round.find((a) => a.e === "🐧");
  assert.match(M.rightText(p), /^Oui ! Le manchot empereur vient de l'Antarctique !/);
  assert.equal(M.wrongText(k, "europe"), "Non, ici c'est l'Europe. Cherche encore où vit le kangourou !");
});

// ---------------------------------------------------------------- Horloge
test("Horloge : l'heure en mots est juste", () => {
  assert.equal(H.toWords(1, 0), "une heure");
  assert.equal(H.toWords(3, 0), "3 heures");
  assert.equal(H.toWords(3, 30), "3 heures et demie");
  assert.equal(H.toWords(1, 30), "une heure et demie");
  assert.equal(H.toWords(7, 15), "7 heures et quart");
  assert.equal(H.toWords(3, 45), "4 heures moins le quart");
  assert.equal(H.toWords(10, 45), "11 heures moins le quart");
  assert.equal(H.toDigits(7, 5), "7:05");
});

test("Horloge : les aiguilles sont au bon endroit (la petite avance avec les minutes)", () => {
  assert.equal(H.minuteAngle(0), 0);
  assert.equal(H.minuteAngle(15), 90);
  assert.equal(H.minuteAngle(30), 180);
  assert.equal(H.hourAngle(3, 0), 90);
  assert.equal(H.hourAngle(3, 30), 105, "à 3 h et demie, la petite aiguille est entre le 3 et le 4");
  assert.equal(H.hourAngle(12, 0), 0);
  assert.equal(H.hourAngle(9, 45), 292.5);
});

test("Horloge : questions du bon niveau, une seule bonne réponse, jamais midi/minuit", () => {
  for (let lv = 1; lv <= H.MAX_LEVEL; lv++) {
    const rng = rngFrom(lv * 17);
    for (let i = 0; i < 3000; i++) {
      const q = H.generate(lv, rng);
      assert.ok(H.MINUTES_BY_LEVEL[lv].includes(q.m), `niveau ${lv} : ${q.m} minutes`);
      assert.ok(q.h >= 1 && q.h <= 11);
      if (q.m === 45) assert.ok(q.h <= 10, "moins le quart : l'heure suivante reste ≤ 11");
      assert.doesNotMatch(q.words, /12|midi|minuit|undefined/);
      if (q.mode === "read") {
        assert.equal(q.options.filter((o) => o.h === q.h && o.m === q.m).length, 1);
        assert.equal(new Set(q.options.map((o) => o.digits)).size, q.options.length);
        assert.equal(new Set(q.options.map((o) => o.words)).size, q.options.length, "deux choix disent la même chose");
        assert.equal(q.options.length, lv === 1 ? 3 : 4);
        for (const o of q.options) assert.ok(o.h >= 1 && o.h <= 11 && [0, 15, 30, 45].includes(o.m));
      } else assert.ok(H.isSet(q, q.h, q.m));
    }
  }
});

// ---------------------------------------------------------------- Saisons
test("Saisons : chaque météo a une tenue possible, et rien n'est à la fois demandé et interdit", () => {
  for (const w of S.WEATHERS) {
    for (const k of w.need) assert.ok(S.CLOTHES[k], k);
    for (const k of Object.keys(w.no)) { assert.ok(S.CLOTHES[k], k); assert.ok(!w.need.includes(k), `${w.id} : ${k} demandé ET interdit`); }
    assert.ok(S.checkOutfit(w, w.need).ok, `${w.id} : la tenue demandée doit suffire`);
    const bad = Object.keys(w.no)[0];
    assert.ok(!S.checkOutfit(w, [...w.need, bad]).ok);
    assert.equal(S.outfitMessage(w, [...w.need, bad]), w.no[bad]);
    assert.match(S.outfitMessage(w, w.need.slice(1)), /^Il manque encore (le|la|les|l')/);
  }
  const neige = S.WEATHERS.find((w) => w.id === "neige");
  assert.ok(neige.no.short && neige.need.includes("manteau"));
  const soleil = S.WEATHERS.find((w) => w.id === "soleil");
  assert.ok(soleil.no.manteau);
});

test("Saisons : l'ordre printemps → été → automne → hiver, et les questions", () => {
  assert.deepEqual(S.SEASONS.map((s) => s.id), ["printemps", "ete", "automne", "hiver"]);
  assert.equal(S.nextSeason("hiver").id, "printemps");
  assert.equal(S.nextSeason("ete").id, "automne");
  const rng = rngFrom(4);
  for (let i = 0; i < 2000; i++) {
    const q = S.seasonQuestion(rng);
    assert.equal(q.options.filter((o) => o.id === q.answer).length, 1);
    if (q.kind === "after") {
      assert.equal(q.answer, S.nextSeason(q.season.id).id);
      assert.ok(!q.options.some((o) => o.id === q.season.id), "on ne propose pas la saison de la question");
    } else assert.equal(q.answer, q.season.id);
  }
});

// ---------------------------------------------------------------- Jardin
test("Jardin : il faut de l'eau ET du soleil, pas trop d'eau, et on récolte au bout de 4 étapes", () => {
  for (const type of Object.keys(J.PLANTS)) {
    const p = J.PLANTS[type];
    assert.equal(p.stages.length, 5);
    assert.ok(p.fact.length > 15);
    const pot = J.newPot(type);
    // de l'eau seule ne suffit pas
    assert.equal(J.water(pot).grew, false);
    assert.equal(pot.stage, 0);
    assert.equal(J.needs(pot), "soleil");
    // trop d'eau
    J.water(pot);
    const tooMuch = J.water(pot);
    assert.equal(tooMuch.ok, false);
    assert.match(tooMuch.msg, /Trop d'eau/);
    // le soleil fait pousser
    assert.equal(J.sun(pot).grew, true);
    assert.equal(pot.stage, 1);
    assert.equal(J.needs(pot), "eau et soleil");
    // soleil seul ne suffit pas non plus
    assert.equal(J.sun(pot).grew, false);
    assert.equal(J.sun(pot).ok, false, "déjà du soleil");
    assert.equal(J.harvest(pot), null, "pas encore prête");
    for (let s = 1; s < 4; s++) { J.water(pot); J.sun(pot); }
    assert.equal(pot.stage, 4);
    assert.equal(J.needs(pot), "récolter");
    assert.equal(J.water(pot).ok, false);
    const h = J.harvest(pot);
    assert.equal(h.e, p.harvest);
    assert.equal(pot.stage, 0, "on peut replanter");
  }
  assert.ok(J.PLANTS.carotte.underground, "la carotte pousse sous la terre");
  // pas d'étape "fleur" pour la carotte (on la récolte avant)
  const c = J.newPot("carotte"); c.stage = 3;
  assert.equal(J.stageName(c), "grande plante");
  const t = J.newPot("tomate"); t.stage = 3;
  assert.equal(J.stageName(t), "fleur", "la tomate fleurit avant de donner ses fruits");
});
