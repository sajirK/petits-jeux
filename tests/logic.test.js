// Tests automatiques de la section "Je suis malin".
// Lancer :  node --test tests/
// Chaque générateur est testé des milliers de fois avec un hasard "reproductible".
const test = require("node:test");
const assert = require("node:assert/strict");

const Suites = require("../games/suites/logic.js");
const Intrus = require("../games/intrus/logic.js");
const Calcul = require("../games/calcul/logic.js");
const Robot = require("../games/robot/logic.js");
const Lettre = require("../games/premiere-lettre/logic.js");
const Reflexe = require("../games/reflexe/logic.js");

// Générateur pseudo-aléatoire reproductible
function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const N = 3000;

// ---------------------------------------------------------------- Suites
test("Suites : la réponse est le bon élément suivant, sans ambiguïté", () => {
  for (let level = 1; level <= 6; level++) {
    const rng = rngFrom(level * 1000);
    for (let i = 0; i < N; i++) {
      const q = Suites.generate(level, rng);
      assert.ok(q.options.includes(q.answer), "la réponse est dans les choix");
      assert.equal(new Set(q.options).size, q.options.length, "choix tous différents");
      assert.ok(q.options.length >= 2);
      if (q.kind === "symbols") {
        const p = q.unit.length;
        assert.ok(q.shown.length >= 2 * p, "au moins 2 motifs complets");
        // la plus petite période de ce qui est montré = le motif → une seule règle possible
        assert.equal(Suites.minimalPeriod(q.shown), p, `période ambiguë pour ${q.unit} : ${q.shown.join("")}`);
        assert.equal(q.answer, q.shown[q.shown.length - p], "réponse = l'élément une période avant");
        // les lettres différentes du motif ont des symboles différents
        const letters = [...new Set(q.unit)];
        const symbolOf = {};
        q.shown.forEach((s, j) => { const l = q.unit[j % p]; symbolOf[l] = s; });
        assert.equal(new Set(letters.map((l) => symbolOf[l])).size, letters.length);
      } else {
        const d = q.shown[1] - q.shown[0];
        for (let j = 2; j < q.shown.length; j++) assert.equal(q.shown[j] - q.shown[j - 1], d, "écart constant");
        assert.equal(q.answer, q.shown[q.shown.length - 1] + d);
        assert.ok(q.answer >= 0 && q.shown.every((v) => v >= 0), "pas de nombres négatifs");
      }
    }
  }
});

// ---------------------------------------------------------------- Intrus
test("Intrus : catégories de base sans doublon (un objet = une seule catégorie)", () => {
  const seen = new Map();
  for (const key of Intrus.BASE) {
    for (const [emoji, name] of Intrus.CATEGORIES[key].items) {
      assert.ok(!seen.has(emoji), `${emoji} est dans ${seen.get(emoji)} et ${key}`);
      seen.set(emoji, key);
      assert.match(name, /^(le |la |les |l')/, `article manquant : ${name}`);
    }
  }
});

test("Intrus : les catégories de règle opposées n'ont aucun objet en commun", () => {
  const C = Intrus.CATEGORIES;
  for (const [a, b] of [["vole", "volePas"], ["chaud", "froid"]]) {
    const ea = new Set(C[a].items.map((i) => i[0]));
    for (const [e] of C[b].items) assert.ok(!ea.has(e), `${e} à la fois dans ${a} et ${b}`);
  }
});

test("Intrus : exactement un intrus, de la bonne catégorie, avec une explication correcte", () => {
  for (let level = 1; level <= 4; level++) {
    const rng = rngFrom(level * 77);
    for (let i = 0; i < N; i++) {
      const q = Intrus.generate(level, rng);
      const odds = q.items.filter((x) => x.odd);
      assert.equal(odds.length, 1, "un seul intrus");
      assert.equal(new Set(q.items.map((x) => x.emoji)).size, q.items.length, "pas de doublon affiché");
      const group = Intrus.CATEGORIES[q.groupKey].items.map((x) => x[0]);
      const odd = Intrus.CATEGORIES[q.oddKey].items.map((x) => x[0]);
      for (const it of q.items) {
        if (it.odd) {
          assert.ok(odd.includes(it.emoji));
          assert.ok(!group.includes(it.emoji), `l'intrus ${it.emoji} est aussi dans le groupe`);
        } else assert.ok(group.includes(it.emoji));
      }
      assert.ok(q.explanation.length > 10);
      assert.ok(q.explanation.toLowerCase().includes(q.intrus.name.toLowerCase()), q.explanation);
    }
  }
});

test("Intrus : phrases d'explication bien écrites", () => {
  const C = Intrus.CATEGORIES;
  assert.equal(Intrus.explain("la voiture", C.fruits, C.vehicules),
    "La voiture n'est pas un fruit : c'est un véhicule. Les autres sont des fruits.");
  assert.equal(Intrus.explain("les gants", C.fruits, C.vetements),
    "Les gants ne sont pas des fruits : ce sont des vêtements. Les autres sont des fruits.");
  assert.equal(Intrus.explain("l'avion", C.volePas, C.vole), "L'avion, ça vole ! Les autres, ça ne vole pas.");
  assert.equal(Intrus.explain("la neige", C.chaud, C.froid), "La neige, c'est froid ! Les autres, c'est chaud.");
});

test("Intrus : message quand on touche un objet qui n'est pas l'intrus", () => {
  assert.equal(Intrus.whyNot("la pomme", "fruits"), "Non : la pomme, c'est bien un fruit, comme les autres. Cherche encore !");
  assert.equal(Intrus.whyNot("les cerises", "fruits"), "Non : les cerises, ce sont bien des fruits, comme les autres. Cherche encore !");
  assert.equal(Intrus.whyNot("la tortue", "volePas"), "Non : la tortue, ça ne vole pas, comme les autres. Cherche encore !");
});

// ---------------------------------------------------------------- Calcul
test("Calcul : les résultats sont justes, dans les bornes, et les choix cohérents", () => {
  for (let level = 1; level <= Calcul.MAX_LEVEL; level++) {
    const rng = rngFrom(level * 31);
    for (let i = 0; i < N; i++) {
      const q = Calcul.generate(level, rng);
      if (q.op === "+") assert.equal(q.answer, q.a + q.b);
      else if (q.op === "-") assert.equal(q.answer, q.a - q.b);
      else if (q.op === "c10") { assert.equal(q.a + q.answer, 10); assert.ok(q.answer >= 1); }
      assert.ok(q.a >= 1 && q.b >= 1, `opérandes ≥ 1 (${q.text})`);
      assert.ok(q.answer >= 0, "jamais négatif");
      const max = { 1: 5, 2: 10, 3: 10, 4: 10, 5: 20, 6: 20 }[level];
      assert.ok(q.answer <= max && q.a <= max, `${q.text} dépasse ${max} au niveau ${level}`);
      if (level === 1 || level === 2) assert.equal(q.op, "+");
      if (level === 3) assert.equal(q.op, "-");
      assert.ok(q.options.includes(q.answer));
      assert.equal(new Set(q.options).size, q.options.length);
      assert.ok(q.options.every((v) => v >= 0));
      assert.ok(Calcul.check(q, q.answer));
      assert.ok(q.options.filter((v) => Calcul.check(q, v)).length === 1, "une seule bonne réponse");
      // la phrase dit les bons nombres
      if (q.op !== "c10" && q.a !== 1) assert.ok(q.speech.includes(String(q.a)), q.speech);
    }
  }
});

test("Calcul : phrases en bon français (un / une)", () => {
  const apple = Calcul.OBJECTS.find((o) => o.e === "🍎");
  const fish = Calcul.OBJECTS.find((o) => o.e === "🐟");
  const fixed = (vals) => { let k = 0; return () => vals[k++ % vals.length]; };
  // force : niveau 3, soustraction 1 - ... impossible ; on vérifie les formes d'accord
  for (let i = 0; i < 500; i++) {
    const q = Calcul.generate(3, rngFrom(i));
    if (q.b === 1) assert.match(q.speech, /\. (Un|Une) /);
    assert.doesNotMatch(q.speech, /undefined/);
  }
  for (let i = 0; i < 500; i++) {
    const q = Calcul.generate(1, rngFrom(i + 9999));
    if (q.a === 1) assert.match(q.speech, /Il y a (un|une) /);
    assert.doesNotMatch(q.speech, /undefined/);
  }
  assert.ok(apple.f && !fish.f);
  void fixed;
});

test("Calcul : indices utiles (on part du plus grand, on compte en avançant si on enlève beaucoup)", () => {
  const base = { withObjects: false };
  assert.equal(Calcul.hint({ ...base, op: "-", a: 17, b: 16 }), "Pas tout à fait. Compte de 16 jusqu'à 17 : combien de pas ?");
  assert.equal(Calcul.hint({ ...base, op: "-", a: 9, b: 2 }), "Pas tout à fait. Pars de 9 et recule de 2.");
  assert.equal(Calcul.hint({ ...base, op: "+", a: 2, b: 7 }), "Pas tout à fait. Pars de 7 et avance de 2.");
  assert.equal(Calcul.hint({ ...base, op: "c10", a: 7, b: 3 }), "Pas tout à fait. Combien il manque à 7 pour aller jusqu'à 10 ?");
  assert.equal(Calcul.hint({ withObjects: true, op: "+", a: 1, b: 2 }), "Pas tout à fait. Compte les objets avec ton doigt !");
  // "on en ajoute une" pour les mots féminins
  for (let i = 0; i < 2000; i++) {
    const q = Calcul.generate(1 + (i % 2), rngFrom(i + 123));
    if (q.b === 1) assert.ok(q.speech.includes(`On en ajoute ${q.object.f ? "une" : "un"}.`), q.speech);
    assert.ok(!/On en ajoute 1\b/.test(q.speech), q.speech);
  }
});

// ---------------------------------------------------------------- Robot
test("Robot : chaque niveau est faisable et la solution fonctionne", () => {
  for (let level = 1; level <= Robot.MAX_LEVEL; level++) {
    const rng = rngFrom(level * 4242);
    for (let i = 0; i < 400; i++) {
      const g = Robot.generate(level, rng);
      const cfg = Robot.GRIDS[level];
      assert.equal(g.walls.length, cfg.walls);
      assert.notDeepEqual(g.start, g.goal);
      const keys = g.walls.map(([x, y]) => x + "," + y);
      assert.ok(!keys.includes(g.start.join(",")) && !keys.includes(g.goal.join(",")));
      assert.ok(g.solution.length >= cfg.path[0] && g.solution.length <= cfg.path[1]);
      assert.ok(g.maxSteps >= g.solution.length);
      const r = Robot.run(g, g.solution);
      assert.equal(r.result, "win", "la solution trouvée gagne");
    }
  }
});

test("Robot : collisions avec le bord et les arbres", () => {
  const g = { w: 3, h: 3, walls: [[1, 0]], start: [0, 0], goal: [2, 2] };
  assert.equal(Robot.run(g, ["right"]).result, "wall");
  assert.equal(Robot.run(g, ["up"]).result, "edge");
  assert.equal(Robot.run(g, ["left"]).result, "edge");
  assert.equal(Robot.run(g, ["down"]).result, "short");
  assert.equal(Robot.run(g, ["down", "down", "right", "right"]).result, "win");
  assert.equal(Robot.shortestPath(g).length, 4);
  // bloqué
  assert.equal(Robot.shortestPath({ w: 2, h: 2, walls: [[1, 0], [0, 1]], start: [0, 0], goal: [1, 1] }), null);
});

// ---------------------------------------------------------------- Première lettre
test("Première lettre : liste de mots sûre (pas de son trompeur au début)", () => {
  const seenWord = new Set(), seenEmoji = new Set();
  for (const [emoji, word] of Lettre.WORDS) {
    assert.ok(!seenWord.has(word), `mot en double : ${word}`);
    assert.ok(!seenEmoji.has(emoji), `image en double : ${emoji}`);
    seenWord.add(word); seenEmoji.add(emoji);
    const w = word.toLowerCase();
    for (const bad of Lettre.BAD_STARTS) {
      if (w.startsWith(bad) && !Lettre.ALLOWED_VOWEL_WORDS.has(w)) assert.fail(`"${word}" commence par "${bad}"`);
    }
    assert.ok(Lettre.ALPHABET.includes(Lettre.firstLetter(word)), `lettre inattendue pour ${word}`);
    assert.match(word.charAt(0), /[a-z]/, `pas d'accent au début : ${word}`);
  }
});

test("Première lettre : la bonne réponse est toujours là, une seule fois", () => {
  for (let level = 1; level <= 3; level++) {
    const rng = rngFrom(level * 555);
    for (let i = 0; i < N; i++) {
      const q = Lettre.generate(level, rng);
      assert.equal(q.answer, q.word.charAt(0).toUpperCase().normalize("NFD").charAt(0));
      assert.equal(q.options.filter((o) => o === q.answer).length, 1);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(q.options.length, level <= 1 ? 2 : level === 2 ? 3 : 4);
    }
  }
  assert.equal(Lettre.firstLetter("dé"), "D");
  assert.equal(Lettre.firstLetter("zèbre"), "Z");
});

// ---------------------------------------------------------------- Réflexe
test("Réflexe : règles sans objet à la fois bon et piège", () => {
  for (const r of Reflexe.RULES) {
    const go = new Set(r.go);
    for (const v of r.nogo) assert.ok(!go.has(v), `${v} dans go et nogo (${r.id})`);
    assert.ok(r.go.length && r.nogo.length);
    assert.ok(r.say.length > 5);
  }
  const rng = rngFrom(3);
  let go = 0;
  for (let i = 0; i < 10000; i++) {
    const it = Reflexe.nextItem(Reflexe.RULES[0], rng);
    if (it.go) { go++; assert.ok(Reflexe.RULES[0].go.includes(it.value)); }
    else assert.ok(Reflexe.RULES[0].nogo.includes(it.value));
  }
  assert.ok(go > 6000 && go < 7000, "environ 65 % de bons objets");
  assert.equal(Reflexe.score(0, false), 0, "jamais en dessous de zéro");
  assert.equal(Reflexe.score(3, true), 4);
  assert.equal(Reflexe.average([300, 500]), 400);
  assert.equal(Reflexe.average([]), null);
  assert.ok(Reflexe.lifetime(0) > Reflexe.lifetime(20) && Reflexe.lifetime(1000) === 1800);
});
