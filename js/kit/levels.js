// V2 — système de niveaux standard : 4 niveaux pour tous les jeux (Facile, Moyen, Difficile, Expert).
// Logique pure (testée dans tests/kit.test.js), utilisable dans le navigateur et dans Node.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.KitLevels = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const LEVELS = [
    { n: 1, key: "facile", label: "Facile", dot: "🟢", stars: "⭐", color: "var(--lv1)", soft: "var(--lv1-soft)" },
    { n: 2, key: "moyen", label: "Moyen", dot: "🟡", stars: "⭐⭐", color: "var(--lv2)", soft: "var(--lv2-soft)" },
    { n: 3, key: "difficile", label: "Difficile", dot: "🔴", stars: "⭐⭐⭐", color: "var(--lv3)", soft: "var(--lv3-soft)" },
    { n: 4, key: "expert", label: "Expert", dot: "🟣", stars: "👑", color: "var(--lv4)", soft: "var(--lv4-soft)" },
  ];
  const DEFAULT = 1;
  const MAX = LEVELS.length;
  const key = (gameId) => `jeux.${gameId}.niveau`;

  // Niveau mémorisé pour ce jeu (Facile si rien ou valeur invalide)
  function load(storage, gameId) {
    const v = parseInt(storage.getItem(key(gameId)), 10);
    return v >= 1 && v <= MAX ? v : DEFAULT;
  }
  function save(storage, gameId, n) {
    const v = Math.min(MAX, Math.max(1, parseInt(n, 10) || DEFAULT));
    storage.setItem(key(gameId), String(v));
    return v;
  }

  // Étoiles d'une manche : on gagne toujours au moins une étoile
  function starsFor(errors) {
    if (errors <= 0) return 3;
    if (errors <= 2) return 2;
    return 1;
  }

  // Après une manche parfaite, on PROPOSE le niveau suivant (jamais imposé)
  const suggestUp = (level, stars) => stars === 3 && level < MAX;

  // Meilleur résultat par niveau : { "1": 3, "2": 1 }
  function best(storage, gameId) {
    try { return JSON.parse(storage.getItem(`jeux.${gameId}.meilleur`) || "{}"); } catch (e) { return {}; }
  }
  function recordBest(storage, gameId, level, stars) {
    const b = best(storage, gameId);
    if (!b[level] || stars > b[level]) b[level] = stars;
    storage.setItem(`jeux.${gameId}.meilleur`, JSON.stringify(b));
    return b;
  }

  // Le contenu d'un niveau : chaque jeu décrit ses 4 niveaux, on vérifie qu'ils sont complets
  function validateConfig(levels) {
    if (!levels) return true; // jeu libre (dessin, piano…)
    return [1, 2, 3, 4].every((n) => levels[n] && typeof levels[n] === "object" && levels[n].rounds >= 1);
  }

  return { LEVELS, DEFAULT, MAX, key, load, save, starsFor, suggestUp, best, recordBest, validateConfig };
});
