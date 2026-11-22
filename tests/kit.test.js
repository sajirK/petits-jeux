// Tests du kit V2 : niveaux standard, étoiles, version.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/kit/levels.js");
const V = require("../js/version.js");

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test("Niveaux : exactement 3, Facile / Moyen / Difficile, avec 1 à 3 étoiles", () => {
  assert.deepEqual(L.LEVELS.map((l) => l.label), ["Facile", "Moyen", "Difficile"]);
  assert.deepEqual(L.LEVELS.map((l) => l.stars), ["⭐", "⭐⭐", "⭐⭐⭐"]);
  assert.deepEqual(L.LEVELS.map((l) => l.dot), ["🟢", "🟡", "🔴"]);
});

test("Niveaux : Facile par défaut, mémorisé par jeu, valeurs invalides corrigées", () => {
  const s = memoryStorage();
  assert.equal(L.load(s, "couleurs"), 1, "Facile par défaut");
  L.save(s, "couleurs", 3);
  assert.equal(L.load(s, "couleurs"), 3);
  assert.equal(L.load(s, "memoire"), 1, "chaque jeu a son propre niveau");
  s.setItem("jeux.couleurs.niveau", "9");
  assert.equal(L.load(s, "couleurs"), 1, "valeur hors limites → Facile");
  s.setItem("jeux.couleurs.niveau", "abc");
  assert.equal(L.load(s, "couleurs"), 1);
  assert.equal(L.save(s, "x", 0), 1);
  assert.equal(L.save(s, "x", 7), 3);
});

test("Étoiles : 3 sans erreur, 2 avec 1-2 erreurs, toujours au moins 1", () => {
  assert.equal(L.starsFor(0), 3);
  assert.equal(L.starsFor(1), 2);
  assert.equal(L.starsFor(2), 2);
  assert.equal(L.starsFor(3), 1);
  assert.equal(L.starsFor(50), 1);
  assert.equal(L.suggestUp(1, 3), true);
  assert.equal(L.suggestUp(3, 3), false, "pas de niveau au-dessus de Difficile");
  assert.equal(L.suggestUp(1, 2), false, "on ne propose que si c'était parfait");
});

test("Meilleur score par niveau, et configuration des niveaux complète", () => {
  const s = memoryStorage();
  L.recordBest(s, "couleurs", 1, 2);
  L.recordBest(s, "couleurs", 1, 1);
  L.recordBest(s, "couleurs", 2, 3);
  assert.deepEqual(L.best(s, "couleurs"), { 1: 2, 2: 3 });
  assert.ok(L.validateConfig({ 1: { rounds: 5 }, 2: { rounds: 6 }, 3: { rounds: 8 } }));
  assert.ok(!L.validateConfig({ 1: { rounds: 5 }, 2: { rounds: 6 } }), "il faut les 3 niveaux");
  assert.ok(!L.validateConfig({ 1: { rounds: 0 }, 2: { rounds: 6 }, 3: { rounds: 8 } }));
  assert.ok(L.validateConfig(null), "jeu libre sans niveau");
});

test("Version : numéro sémantique et date", () => {
  assert.match(V.version, /^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/);
  assert.match(V.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(V.notes));
});
