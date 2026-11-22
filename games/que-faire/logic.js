// Que ferais-tu ? : niveaux (le contenu est dans js/emotions.js, testé)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../../js/emotions.js"));
  else root.QueFaireLogic = factory(root.Emotions);
})(typeof self !== "undefined" ? self : this, function (E) {
  const LEVELS = {
    1: { rounds: 4, options: 2 },  // la bonne réaction + une seule autre
    2: { rounds: 5, options: 3 },
    3: { rounds: 6, options: 3 },
  };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Une partie : des histoires toutes différentes, avec le bon nombre de choix
  function stories(level, rng = Math.random) {
    const n = LEVELS[level].options;
    return shuffle(E.CHOICES, rng).slice(0, LEVELS[level].rounds).map((c) => {
      const good = c.options.find((o) => o.good);
      const bad = shuffle(c.options.filter((o) => !o.good), rng).slice(0, n - 1);
      return { ...c, options: shuffle([good, ...bad], rng) };
    });
  }
  return { LEVELS, stories };
});
