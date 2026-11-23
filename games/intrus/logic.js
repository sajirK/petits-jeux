// Logique de "Trouve l'intrus" (testée dans tests/intrus.test.js).
// Chaque catégorie est bien distincte : un objet n'appartient qu'à une seule.
// Les intrus ne sont tirés que de catégories "compatibles" (vraiment différentes),
// pour ne jamais apprendre quelque chose de faux à l'enfant.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.IntrusLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // name : avec article ; member : "c'est ..." ; plural : "les autres sont ..."
  const CATEGORIES = {
    fruits: {
      member: "un fruit", plural: "des fruits",
      items: [["🍎", "la pomme"], ["🍌", "la banane"], ["🍇", "le raisin"], ["🍓", "la fraise"], ["🍐", "la poire"],
        ["🍒", "les cerises"], ["🍉", "la pastèque"], ["🍊", "l'orange"], ["🍍", "l'ananas"], ["🥝", "le kiwi"]],
    },
    legumes: {
      member: "un légume", plural: "des légumes",
      items: [["🥕", "la carotte"], ["🥦", "le brocoli"], ["🥔", "la pomme de terre"], ["🧅", "l'oignon"], ["🥬", "la salade"], ["🧄", "l'ail"]],
    },
    ferme: {
      member: "un animal de la ferme", plural: "des animaux de la ferme",
      items: [["🐄", "la vache"], ["🐖", "le cochon"], ["🐑", "le mouton"], ["🐔", "la poule"], ["🐐", "la chèvre"], ["🐎", "le cheval"]],
    },
    mer: {
      member: "un animal de la mer", plural: "des animaux de la mer",
      items: [["🐙", "la pieuvre"], ["🦀", "le crabe"], ["🐬", "le dauphin"], ["🐳", "la baleine"], ["🦈", "le requin"], ["🐟", "le poisson"]],
    },
    savane: {
      member: "un animal de la savane", plural: "des animaux de la savane",
      items: [["🦁", "le lion"], ["🐘", "l'éléphant"], ["🦒", "la girafe"], ["🦓", "le zèbre"], ["🦛", "l'hippopotame"]],
    },
    vehicules: {
      member: "un véhicule", plural: "des véhicules",
      items: [["🚗", "la voiture"], ["🚌", "le bus"], ["🚲", "le vélo"], ["🚂", "le train"], ["🚜", "le tracteur"], ["🛴", "la trottinette"], ["🚑", "l'ambulance"]],
    },
    vetements: {
      member: "un vêtement", plural: "des vêtements",
      items: [["👕", "le tee-shirt"], ["👖", "le pantalon"], ["🧦", "les chaussettes"], ["🧢", "la casquette"], ["🧤", "les gants"], ["🧣", "l'écharpe"], ["👗", "la robe"], ["🧥", "le manteau"]],
    },
    musique: {
      member: "un instrument de musique", plural: "des instruments de musique",
      items: [["🎸", "la guitare"], ["🎹", "le piano"], ["🥁", "le tambour"], ["🎺", "la trompette"], ["🎻", "le violon"], ["🎷", "le saxophone"]],
    },
    // Niveau "règle" : ce qui vole / ne vole pas, chaud / froid
    vole: {
      member: "quelque chose qui vole", plural: "des choses qui volent", rule: "ça vole",
      items: [["🐦", "l'oiseau"], ["🦋", "le papillon"], ["🐝", "l'abeille"], ["🦉", "le hibou"], ["✈️", "l'avion"], ["🚁", "l'hélicoptère"], ["🪁", "le cerf-volant"]],
    },
    volePas: {
      member: "quelque chose qui ne vole pas", plural: "des choses qui ne volent pas", rule: "ça ne vole pas",
      items: [["🐢", "la tortue"], ["🐌", "l'escargot"], ["🐘", "l'éléphant"], ["🚗", "la voiture"], ["🐟", "le poisson"], ["🚂", "le train"]],
    },
    chaud: {
      member: "quelque chose de chaud", plural: "des choses chaudes", rule: "c'est chaud",
      items: [["☀️", "le soleil"], ["🔥", "le feu"], ["☕", "le chocolat chaud"], ["🌋", "le volcan"]],
    },
    froid: {
      member: "quelque chose de froid", plural: "des choses froides", rule: "c'est froid",
      items: [["❄️", "la neige"], ["🧊", "le glaçon"], ["⛄", "le bonhomme de neige"], ["🍦", "la glace"]],
    },
  };

  // Paires (groupe des 3, intrus) autorisées par niveau. Elles sont vraiment exclusives.
  const BASE = ["fruits", "legumes", "ferme", "mer", "savane", "vehicules", "vetements", "musique"];
  const EASY_PAIRS = [];
  for (const a of BASE) for (const b of BASE) {
    if (a === b) continue;
    // fruits/légumes et ferme/mer/savane sont proches : réservés au niveau 2
    const close = (x, y) => ["fruits", "legumes"].includes(x) && ["fruits", "legumes"].includes(y)
      || ["ferme", "mer", "savane"].includes(x) && ["ferme", "mer", "savane"].includes(y);
    if (!close(a, b)) EASY_PAIRS.push([a, b]);
  }
  const CLOSE_PAIRS = [["fruits", "legumes"], ["legumes", "fruits"], ["ferme", "mer"], ["mer", "ferme"], ["ferme", "savane"], ["savane", "ferme"], ["mer", "savane"], ["savane", "mer"]];
  const RULE_PAIRS = [["vole", "volePas"], ["volePas", "vole"], ["chaud", "froid"], ["froid", "chaud"]];

  function pairsFor(level) {
    if (level <= 1) return EASY_PAIRS;
    if (level === 2) return CLOSE_PAIRS.concat(EASY_PAIRS.slice(0, 10));
    return RULE_PAIRS.concat(CLOSE_PAIRS);
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generate(level, rng = Math.random) {
    const pairs = pairsFor(level);
    const [groupKey, oddKey] = pairs[Math.floor(rng() * pairs.length)];
    const group = CATEGORIES[groupKey], odd = CATEGORIES[oddKey];
    const n = level >= 4 ? 5 : level >= 3 ? 4 : 3; // nombre d'objets "normaux"
    const members = shuffle(group.items, rng).slice(0, n);
    const memberEmojis = new Set(members.map((m) => m[0]));
    const oddCandidates = odd.items.filter((i) => !memberEmojis.has(i[0]));
    const intrus = oddCandidates[Math.floor(rng() * oddCandidates.length)];
    const items = shuffle([...members, intrus], rng).map(([emoji, name]) => ({ emoji, name, odd: emoji === intrus[0] }));
    return { groupKey, oddKey, items, intrus: { emoji: intrus[0], name: intrus[1] }, explanation: explain(intrus[1], group, odd) };
  }

  // "Bravo ! La voiture n'est pas un fruit : c'est un véhicule. Les autres sont des fruits."
  // Pour les règles : "L'avion, ça vole ! Les autres, ça ne vole pas."
  function explain(name, group, odd) {
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    if (odd.rule && group.rule) return `${cap}, ${odd.rule} ! Les autres, ${group.rule}.`;
    const plural = name.startsWith("les ");
    const verb = plural ? "ne sont pas" : "n'est pas";
    const isVerb = plural ? "ce sont" : "c'est";
    const what = plural ? group.plural : group.member;
    const oddWhat = plural ? odd.plural : odd.member;
    return `${cap} ${verb} ${what} : ${isVerb} ${oddWhat}. Les autres sont ${group.plural}.`;
  }

  // Quand l'enfant touche un objet qui n'est PAS l'intrus :
  // "Non : la pomme, c'est bien un fruit, comme les autres."
  function whyNot(name, groupKey) {
    const g = CATEGORIES[groupKey];
    const plural = name.startsWith("les ");
    if (g.rule) return `Non : ${name}, ${g.rule}, comme les autres. Cherche encore !`;
    return `Non : ${name}, ${plural ? "ce sont bien" : "c'est bien"} ${plural ? g.plural : g.member}, comme les autres. Cherche encore !`;
  }

  // V2 : 3 niveaux (catégories éloignées → proches → règles "vole / chaud")
  const LEVELS = {
    1: { rounds: 6, internal: [1] },
    2: { rounds: 7, internal: [2] },
    3: { rounds: 8, internal: [3] },
    4: { rounds: 10, internal: [4] }, // Expert : 5 objets à comparer, catégories proches
  };

  return { LEVELS, CATEGORIES, generate, pairsFor, explain, whyNot, BASE };
});
