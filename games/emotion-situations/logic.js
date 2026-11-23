// Les histoires d'émotions : niveaux (le contenu est dans js/emotions.js, testé)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../../js/emotions.js"));
  else root.EmotionSituationsLogic = factory(root.Emotions);
})(typeof self !== "undefined" ? self : this, function (E) {
  const LEVELS = { 1: { rounds: 4 }, 2: { rounds: 5 }, 3: { rounds: 6 }, 4: { rounds: 10 } };
  const question = (level, rng = Math.random, avoidText = null) => E.situationQuestion(level, rng, avoidText);
  return { LEVELS, question };
});
