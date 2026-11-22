// Logique du "Tour du monde des animaux" (testée dans tests/etape3.test.js).
// On ne garde QUE des animaux qui viennent naturellement d'un seul continent,
// pour qu'une bonne réponse ne soit jamais comptée fausse.
// (Pas de lion : il en reste aussi en Inde. Pas d'éléphant : il y en a aussi en Asie.)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MondeLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // de : "vient d'Afrique" / "de l'Antarctique"
  const CONTINENTS = {
    amnord: { name: "l'Amérique du Nord", de: "d'Amérique du Nord", label: "Amérique du Nord", color: "#ffd8a8" },
    amsud: { name: "l'Amérique du Sud", de: "d'Amérique du Sud", label: "Amérique du Sud", color: "#b2f2bb" },
    europe: { name: "l'Europe", de: "d'Europe", label: "Europe", color: "#a5d8ff" },
    afrique: { name: "l'Afrique", de: "d'Afrique", label: "Afrique", color: "#ffe066" },
    asie: { name: "l'Asie", de: "d'Asie", label: "Asie", color: "#ffc9c9" },
    oceanie: { name: "l'Océanie", de: "d'Océanie", label: "Océanie", color: "#d0bfff" },
    antarctique: { name: "l'Antarctique", de: "de l'Antarctique", label: "Antarctique", color: "#e9ecef" },
  };

  // [emoji, nom avec article, continent, petite phrase vraie]
  const ANIMALS = [
    ["🦘", "le kangourou", "oceanie", "Le bébé kangourou grandit dans la poche de sa maman."],
    ["🐨", "le koala", "oceanie", "Il dort presque toute la journée et mange des feuilles d'eucalyptus."],
    ["🦒", "la girafe", "afrique", "C'est l'animal le plus grand du monde."],
    ["🦓", "le zèbre", "afrique", "Chaque zèbre a des rayures différentes."],
    ["🦛", "l'hippopotame", "afrique", "Il passe la journée dans l'eau pour rester au frais."],
    ["🦍", "le gorille", "afrique", "C'est le plus grand de tous les singes."],
    ["🐼", "le panda", "asie", "Il mange surtout du bambou."],
    ["🐯", "le tigre", "asie", "C'est le plus grand des félins, la famille des chats."],
    ["🦧", "l'orang-outan", "asie", "Il vit dans les arbres, dans les forêts de Bornéo et de Sumatra."],
    ["🦙", "le lama", "amsud", "Il vit dans les montagnes des Andes."],
    ["🦝", "le raton laveur", "amnord", "Il a comme un masque noir autour des yeux."],
    ["🐧", "le manchot empereur", "antarctique", "C'est le papa qui garde l'œuf au chaud sur ses pattes."],
  ];

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Une partie = tous les animaux dans un ordre au hasard
  const newRound = (rng = Math.random) => shuffle(ANIMALS, rng).map(([e, name, c, fact]) => ({ e, name, c, fact }));

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // "Le kangourou vient d'Océanie !"
  const rightText = (a) => `Oui ! ${cap(a.name)} vient ${CONTINENTS[a.c].de} ! ${a.fact}`;
  // "Non, ici c'est l'Europe. Le kangourou vient de plus loin…"
  const wrongText = (a, picked) => `Non, ici c'est ${CONTINENTS[picked].name}. Cherche encore où vit ${a.name} !`;

  // V2 : 3 niveaux
  // Facile : 4 continents seulement (les autres sont grisés), 6 animaux, noms écrits
  // Moyen : les 7 continents, 9 animaux ; Difficile : 12 animaux, sans les noms des continents
  const LEVELS = {
    1: { rounds: 6, continents: ["afrique", "asie", "oceanie", "antarctique"], labels: true },
    2: { rounds: 9, continents: Object.keys(CONTINENTS), labels: true },
    3: { rounds: 12, continents: Object.keys(CONTINENTS), labels: false },
  };
  // Les animaux d'une partie : seulement ceux dont le continent est sur la carte
  function deck(level, rng = Math.random) {
    const cfg = LEVELS[level];
    return newRound(rng).filter((a) => cfg.continents.includes(a.c)).slice(0, cfg.rounds);
  }

  return { CONTINENTS, ANIMALS, LEVELS, deck, newRound, rightText, wrongText };
});
