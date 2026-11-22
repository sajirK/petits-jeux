// Tests du parcours : jeux par âge, aventure du jour, autocollants.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { SKILLS, GAMES, AGES } = require("../js/games.js");
const P = require("../js/parcours.js");

test("Jeux : chaque jeu a une compétence, des âges valides et une page qui existe", () => {
  const ids = new Set();
  for (const g of GAMES) {
    assert.ok(!ids.has(g.id), `id en double : ${g.id}`); ids.add(g.id);
    assert.ok(SKILLS[g.skill], `${g.id} : compétence inconnue ${g.skill}`);
    assert.ok(Array.isArray(g.ages) && g.ages.length === 2 && g.ages[0] <= g.ages[1], `${g.id} : âges invalides`);
    assert.ok(g.ages[0] >= 3 && g.ages[1] <= 8);
    assert.ok(g.title && g.emoji && g.color);
    assert.ok(fs.existsSync(path.join(__dirname, "..", "games", g.id, "index.html")), `page manquante : games/${g.id}`);
  }
  // tous les dossiers de jeux sont bien listés
  const dirs = fs.readdirSync(path.join(__dirname, "..", "games")).filter((d) => fs.existsSync(path.join(__dirname, "..", "games", d, "index.html")));
  for (const d of dirs) assert.ok(ids.has(d), `games/${d} n'est pas dans js/games.js`);
  // chaque compétence a au moins un jeu
  for (const k of Object.keys(SKILLS)) assert.ok(GAMES.some((g) => g.skill === k), `aucun jeu pour ${k}`);
});

test("Âge : chaque âge a assez de jeux, et au moins 3 compétences différentes", () => {
  for (const age of AGES) {
    const list = P.forAge(GAMES, age);
    assert.ok(list.length >= 8, `seulement ${list.length} jeux pour ${age} ans`);
    assert.ok(new Set(list.map((g) => g.skill)).size >= 3);
    assert.ok(list.every((g) => g.ages[0] <= age && age <= g.ages[1]));
  }
  assert.equal(P.forAge(GAMES, null).length, GAMES.length, "sans âge : tous les jeux");
  assert.equal(P.ageLabel({ ages: [4, 8] }), "4 ans et +");
  assert.equal(P.ageLabel({ ages: [3, 5] }), "3-5 ans");
});

test("Aventure du jour : 3 jeux différents, 3 compétences, adaptés à l'âge, stables dans la journée", () => {
  const start = new Date(2026, 0, 1);
  for (const age of [null, ...AGES]) {
    const seen = new Set();
    for (let d = 0; d < 120; d++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
      const date = day.toISOString().slice(0, 10);
      const picks = P.dailyPicks(GAMES, { age, date, name: "Léa" });
      assert.equal(picks.length, 3, `âge ${age}, ${date}`);
      assert.equal(new Set(picks.map((g) => g.id)).size, 3);
      assert.equal(new Set(picks.map((g) => g.skill)).size, 3, "3 compétences différentes");
      assert.ok(picks.every((g) => P.fitsAge(g, age)));
      // au moins un jeu "pour apprendre" (lire, compter, réfléchir)
      assert.ok(picks.some((g) => P.GROUPS[0].includes(g.skill)), "un jeu pour apprendre");
      // la même journée donne la même aventure
      assert.deepEqual(P.dailyPicks(GAMES, { age, date, name: "Léa" }).map((g) => g.id), picks.map((g) => g.id));
      picks.forEach((g) => seen.add(g.id));
    }
    // sur 4 mois, l'aventure fait découvrir beaucoup de jeux différents
    assert.ok(seen.size >= Math.min(12, P.forAge(GAMES, age).length - 2), `âge ${age} : seulement ${seen.size} jeux proposés`);
  }
});

test("Autocollants : 48 différents, jamais de doublon, album complet = plus rien à gagner", () => {
  assert.equal(P.ALL_STICKERS.length, 48);
  assert.equal(new Set(P.ALL_STICKERS).size, 48, "autocollant en double");
  const rng = P.rngFrom(42);
  const owned = [];
  for (let i = 0; i < 48; i++) {
    const s = P.unlockSticker(owned, rng);
    assert.ok(s && !owned.includes(s));
    owned.push(s);
  }
  assert.equal(P.unlockSticker(owned, rng), null);
  assert.equal(P.completedCollections(owned).length, P.COLLECTIONS.length);
  assert.deepEqual(P.completedCollections(["🐄"]), []);
  assert.deepEqual(P.completedCollections(P.COLLECTIONS[2].items), ["mer"]);
  assert.equal(P.stickersFromStars(0), 0);
  assert.equal(P.stickersFromStars(P.STARS_PER_STICKER * 4 + 1), 4);
});
