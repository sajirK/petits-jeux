// Ma météo du jour : jeu bien-être (pas de niveaux), terminé par le bouton ✅
(function (root, factory) {
  const E = typeof module === "object" && module.exports ? require("../../js/emotions.js") : root.Emotions;
  if (typeof module === "object" && module.exports) module.exports = factory(E);
  else root.MeteoLogic = factory(E);
})(typeof self !== "undefined" ? self : this, function (Emotions) {
  const FREE = true;
  const ORDER = ["joie", "calme", "surprise", "fatigue", "tristesse", "colere", "peur", "degout"];
  const POSITIVE = new Set(["joie", "calme"]);
  const SIZES = [["un peu", 0.6], ["beaucoup", 0.85], ["énormément", 1.15]];
  // ce qu'on dit à l'enfant : on accueille l'émotion, sans jugement
  function message(key) {
    const e = Emotions.EMOTIONS[key];
    const noun = e.noun.charAt(0).toUpperCase() + e.noun.slice(1);
    return POSITIVE.has(key)
      ? `Merci de me l'avoir dit ! ${noun}, c'est bon à sentir. Profites-en !`
      : `Merci de me l'avoir dit. Tout le monde ressent ${e.noun.replace(/^le /, "du ").replace(/^la /, "de la ").replace(/^l'/, "de l'")}, parfois. C'est normal !`;
  }
  // très fort et pas agréable : on propose d'aller voir un adulte
  const needsAdult = (key, intensity) => !POSITIVE.has(key) && intensity === 2;
  return { FREE, ORDER, POSITIVE, SIZES, message, needsAdult };
});
