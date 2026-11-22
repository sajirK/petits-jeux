// Numéro de version de l'application (mis à jour par : npm run release -- <version> "<note>")
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.APP_VERSION = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    version: "2.0.0-dev",
    date: "2026-11-22",
    notes: ["V2 en préparation : niveaux standard, voix, écrans de victoire"],
  };
});
