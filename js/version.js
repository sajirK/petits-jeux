// Numéro de version de l'application (mis à jour par : npm run release -- <version> "<note>")
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.APP_VERSION = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    version: "2.1.0",
    date: "2026-11-23",
    notes: ["Niveau Expert 👑 dans tous les jeux, nouveau jeu « Les langues » (anglais, allemand, espagnol), voix plus calme"],
  };
});
