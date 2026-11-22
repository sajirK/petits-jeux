// Le dessin : jeu libre (pas de niveaux), terminé par le bouton ✅
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DessinLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const FREE = true;
  const COLORS = [["#ef476f", "rose"], ["#ff9f1c", "orange"], ["#ffd166", "jaune"], ["#06d6a0", "vert"], ["#118ab2", "bleu"], ["#7b2cbf", "violet"], ["#8d5524", "marron"], ["#222222", "noir"]];
  const STAMPS = [["⭐", "étoile"], ["❤️", "cœur"], ["🌸", "fleur"], ["🐱", "chat"], ["🚗", "voiture"], ["🦖", "dinosaure"]];
  return { FREE, COLORS, STAMPS };
});
