// Devine l'émotion : niveaux (le contenu est dans js/emotions.js, testé)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../../js/emotions.js"));
  else root.EmotionVisageLogic = factory(root.Emotions);
})(typeof self !== "undefined" ? self : this, function (E) {
  // 4 émotions et 3 visages → 6 émotions et 4 visages → 8 émotions et 4 visages
  const LEVELS = { 1: { rounds: 5 }, 2: { rounds: 6 }, 3: { rounds: 8 } };
  const question = (level, rng = Math.random, avoid = null) => E.faceQuestion(level, rng, avoid);
  return { LEVELS, question };
});
