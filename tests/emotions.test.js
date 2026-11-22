// Tests du contenu "Mes émotions" : cohérence, aucune réponse ambiguë, bon français.
// Lancer :  npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../js/emotions.js");

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("Émotions : chaque émotion est complète", () => {
  const emojis = new Set(), labels = new Set();
  for (const [key, e] of Object.entries(E.EMOTIONS)) {
    for (const f of ["emoji", "label", "m", "f", "noun", "color", "body"]) assert.ok(e[f], `${key}.${f} manquant`);
    assert.ok(e.tips.length >= 2, `${key} : au moins 2 idées pour aider`);
    for (const [icon, txt] of e.tips) assert.ok(icon && txt.length > 8);
    assert.ok(!emojis.has(e.emoji) && !labels.has(e.label), `${key} en double`);
    emojis.add(e.emoji); labels.add(e.label);
    assert.match(e.m, /^(est|a) /); assert.match(e.f, /^(est|a) /);
    // jamais de message qui interdit une émotion
    for (const [, txt] of e.tips) assert.doesNotMatch(txt, /ne (sois|pleure) pas|arrête de/i);
  }
  for (const lv of [1, 2, 3]) for (const k of E.LEVEL_EMOTIONS[lv]) assert.ok(E.EMOTIONS[k], k);
  assert.ok(E.LEVEL_EMOTIONS[1].every((k) => E.LEVEL_EMOTIONS[2].includes(k)));
  assert.ok(E.LEVEL_EMOTIONS[2].every((k) => E.LEVEL_EMOTIONS[3].includes(k)));
});

test("Devine l'émotion : bonne réponse présente une seule fois, choix du bon niveau", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 9);
    for (let i = 0; i < 3000; i++) {
      const q = E.faceQuestion(lv, rng);
      assert.ok(E.LEVEL_EMOTIONS[lv].includes(q.answer));
      assert.equal(q.options.filter((o) => o === q.answer).length, 1);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(q.options.length, lv <= 1 ? 3 : 4);
      assert.ok(q.options.every((o) => E.LEVEL_EMOTIONS[lv].includes(o)));
    }
  }
});

test("Situations : données valides et le prénom apparaît dans l'histoire", () => {
  const texts = new Set();
  for (const s of E.SITUATIONS) {
    assert.ok(E.EMOTIONS[s.answer], s.text);
    for (const o of s.alsoOk) { assert.ok(E.EMOTIONS[o], o); assert.notEqual(o, s.answer); }
    assert.ok(["m", "f"].includes(s.g));
    assert.ok(s.text.includes(s.who), `le prénom ${s.who} doit être dans : ${s.text}`);
    assert.ok(!texts.has(s.text)); texts.add(s.text);
    assert.ok(s.scene && s.because);
  }
  // chaque niveau a assez de situations, et toutes les émotions du niveau 3 sont représentées
  assert.ok(E.situationsFor(1).length >= 10);
  for (const k of E.LEVEL_EMOTIONS[3]) assert.ok(E.SITUATIONS.some((s) => s.answer === k), `aucune situation pour ${k}`);
});

test("Situations : jamais une émotion plausible proposée comme mauvaise réponse", () => {
  for (const lv of [1, 2, 3]) {
    const rng = rngFrom(lv * 101);
    for (let i = 0; i < 4000; i++) {
      const q = E.situationQuestion(lv, rng);
      const s = q.situation;
      assert.ok(E.LEVEL_EMOTIONS[lv].includes(s.answer), "réponse du niveau");
      assert.equal(q.options.filter((o) => o === s.answer).length, 1);
      assert.ok(q.options.length >= 2, `au moins 2 choix (${s.text})`);
      assert.equal(new Set(q.options).size, q.options.length);
      for (const o of q.options) {
        if (o !== s.answer) assert.ok(!s.alsoOk.includes(o), `${o} est plausible pour « ${s.text} »`);
        assert.ok(E.LEVEL_EMOTIONS[lv].includes(o));
      }
    }
  }
});

test("Situations : phrases d'explication bien accordées", () => {
  const find = (who) => E.SITUATIONS.find((s) => s.who === who);
  assert.equal(E.sentence(find("Lina"), "joie"), "Lina est joyeuse parce qu'elle reçoit un cadeau.");
  assert.equal(E.sentence(find("Tom"), "tristesse"), "Tom est triste parce qu'il a perdu son doudou.");
  assert.equal(E.sentence(find("Sami"), "peur"), "Sami a peur parce que le gros chien aboie fort.");
  assert.equal(E.sentence(find("Jade"), "degout"), "Jade est dégoûtée parce qu'il y a un ver dans sa salade.");
  for (const s of E.SITUATIONS) {
    const txt = E.sentence(s, s.answer);
    assert.doesNotMatch(txt, /undefined|  /);
    assert.match(txt, /parce qu(e |')/);
  }
});

test("Situations : question quand l'enfant se trompe (élision devant une voyelle)", () => {
  const find = (who) => E.SITUATIONS.find((s) => s.who === who);
  assert.equal(E.isItQuestion(find("Adam"), "colere"), "est-ce qu'Adam est en colère ?");
  assert.equal(E.isItQuestion(find("Lina"), "tristesse"), "est-ce que Lina est triste ?");
  assert.equal(E.isItQuestion(find("Emma"), "peur"), "est-ce qu'Emma a peur ?");
  assert.equal(E.isItQuestion(find("Jade"), "surprise"), "est-ce que Jade est surprise ?");
});

test("Que ferais-tu ? : exactement une bonne réaction, chaque choix est expliqué", () => {
  const texts = new Set();
  for (const c of E.CHOICES) {
    assert.equal(c.options.filter((o) => o.good).length, 1, c.text);
    assert.equal(c.options.length, 3);
    assert.ok(!texts.has(c.text)); texts.add(c.text);
    for (const o of c.options) {
      assert.ok(o.e && o.t && o.why, c.text);
      if (!o.good) assert.match(o.why, /\?|Essaie|mieux|peux|peut|droit/i, `le message doit guider vers une autre idée : ${o.why}`);
    }
  }
  const rng = rngFrom(5);
  for (let i = 0; i < 500; i++) {
    const q = E.choiceQuestion(rng, "x");
    assert.equal(q.options.filter((o) => o.good).length, 1);
  }
});

test("Météo : les 7 derniers jours, dans l'ordre, avec la date du jour en dernier", () => {
  const now = new Date(2026, 0, 3); // 3 janvier 2026
  const journal = { "2026-01-03": { e: "joie" }, "2025-12-31": { e: "calme" } };
  const days = E.lastDays(journal, now);
  assert.equal(days.length, 7);
  assert.equal(days[6].key, "2026-01-03");
  assert.equal(days[0].key, "2025-12-28");
  assert.equal(days[6].entry.e, "joie");
  assert.equal(days[3].entry.e, "calme");
  assert.equal(days[1].entry, null);
  assert.equal(E.todayKey(new Date(2026, 10, 5)), "2026-11-05");
});
