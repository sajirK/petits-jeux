// Memory des animaux : logique et niveaux
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MemoireLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const ANIMALS = [
    ["🐶", "le chien"], ["🐱", "le chat"], ["🐰", "le lapin"], ["🦁", "le lion"], ["🐸", "la grenouille"], ["🐷", "le cochon"],
    ["🐮", "la vache"], ["🐵", "le singe"], ["🐔", "la poule"], ["🐘", "l'éléphant"], ["🦒", "la girafe"], ["🐧", "le pingouin"],
  ];
  const LEVELS = {
    1: { rounds: 2, pairs: 3, cols: 3 },
    2: { rounds: 2, pairs: 6, cols: 4 },
    3: { rounds: 2, pairs: 8, cols: 4 },
  };
  function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function deck(level, rng = Math.random) {
    const chosen = shuffle(ANIMALS, rng).slice(0, LEVELS[level].pairs);
    return shuffle([...chosen, ...chosen], rng).map(([e, name], i) => ({ id: i, e, name }));
  }
  // Une erreur de mémoire = se tromper alors qu'on avait DÉJÀ vu la bonne carte.
  // (Retourner deux cartes différentes quand on ne pouvait pas savoir, ce n'est pas une erreur.)
  //   seen = cartes déjà vues AVANT ce tour ; a = première carte retournée, b = deuxième (différente)
  function isMemoryMistake(cards, seen, a, b) {
    if (a.e === b.e) return false;
    const partner = cards.find((x) => x.e === a.e && x.id !== a.id);
    return seen.has(partner.id);
  }
  return { ANIMALS, LEVELS, deck, isMemoryMistake };
});
