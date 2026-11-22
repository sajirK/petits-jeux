// Logique de "La Première Lettre" (testée dans tests/premiere-lettre.test.js).
// Mots choisis pour que la PREMIÈRE LETTRE se reconnaisse bien à l'oreille :
// pas de "ch", "ph", "ou", "au", "qu", pas de "c" ou "g" doux (cerise, girafe),
// pas de "h" muet, pas d'accent sur la première lettre.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LettreLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const WORDS = [
    ["🍍", "ananas"], ["🌳", "arbre"], ["✈️", "avion"],
    ["🎈", "ballon"], ["🍌", "banane"], ["⛵", "bateau"], ["🚌", "bus"], ["🕯️", "bougie"],
    ["🎁", "cadeau"], ["🦆", "canard"], ["🥕", "carotte"], ["🦀", "crabe"],
    ["🎲", "dé"], ["🦕", "dinosaure"], ["🐬", "dauphin"],
    ["🔥", "feu"], ["🌸", "fleur"], ["🍓", "fraise"], ["🚀", "fusée"],
    ["🎂", "gâteau"], ["🦍", "gorille"],
    ["🧃", "jus"],
    ["🥝", "kiwi"], ["🐨", "koala"],
    ["🐰", "lapin"], ["🦁", "lion"], ["🌙", "lune"], ["📖", "livre"], ["🐺", "loup"],
    ["🏠", "maison"], ["🏍️", "moto"], ["🐑", "mouton"], ["🔨", "marteau"],
    ["☁️", "nuage"], ["👃", "nez"],
    ["🫒", "olive"], ["🍊", "orange"],
    ["🐼", "panda"], ["🍕", "pizza"], ["🍎", "pomme"], ["🐟", "poisson"], ["🦋", "papillon"],
    ["🤖", "robot"], ["🦊", "renard"], ["🌹", "rose"], ["🦈", "requin"],
    ["☀️", "soleil"], ["🐭", "souris"], ["🐍", "serpent"],
    ["🐢", "tortue"], ["🐯", "tigre"], ["🚂", "train"], ["🥁", "tambour"],
    ["🏭", "usine"],
    ["🐄", "vache"], ["🚲", "vélo"], ["🌋", "volcan"], ["🧳", "valise"],
    ["🦓", "zèbre"],
  ];

  const BAD_STARTS = ["ch", "ph", "ou", "au", "eu", "qu", "gn", "ce", "ci", "cé", "ge", "gi", "gé", "h", "oi", "ai", "ei", "an", "en", "in", "on", "un", "am", "em", "im", "om", "um"];
  // "ananas" et "olive", "orange", "usine" commencent par une voyelle bien claire.
  const ALLOWED_VOWEL_WORDS = new Set(["ananas", "arbre", "avion", "olive", "orange", "usine"]);

  // Lettres qui se ressemblent (en majuscules) : pour le niveau difficile
  const LOOK_ALIKE = { B: ["D", "P", "R"], D: ["B", "O", "P"], P: ["B", "R", "F"], R: ["P", "B", "K"], M: ["N", "W"], N: ["M", "H"], C: ["G", "O"], G: ["C", "O"], O: ["Q", "C", "D"], E: ["F", "L"], F: ["E", "P", "T"], T: ["F", "L", "I"], L: ["T", "I", "E"], V: ["U", "W", "Y"], U: ["V", "O"], K: ["R", "X"], S: ["Z", "C"], Z: ["S", "N"], A: ["H", "V"], J: ["I", "L"], I: ["J", "L", "T"] };
  const ALPHABET = "ABCDEFGIJKLMNOPRSTUVZ".split("");

  // Première lettre en majuscule, sans accent
  const firstLetter = (w) => w.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // niveau 1 : 2 lettres très différentes ; 2 : 3 lettres ; 3 : 4 lettres dont des sosies
  function generate(level, rng = Math.random, avoid = null) {
    let pool = WORDS;
    if (avoid) pool = WORDS.filter((w) => w[1] !== avoid);
    const [emoji, word] = pool[Math.floor(rng() * pool.length)];
    const answer = firstLetter(word);
    const n = level <= 1 ? 2 : level === 2 ? 3 : 4;
    const others = new Set();
    if (level >= 3) for (const l of shuffle(LOOK_ALIKE[answer] || [], rng)) if (others.size < 2 && l !== answer) others.add(l);
    const far = shuffle(ALPHABET.filter((l) => l !== answer && !(LOOK_ALIKE[answer] || []).includes(l)), rng);
    for (const l of far) { if (others.size >= n - 1) break; others.add(l); }
    const options = shuffle([answer, ...[...others].slice(0, n - 1)], rng);
    return { emoji, word, answer, options };
  }

  // V2 : 3 niveaux (2 lettres très différentes → 3 lettres → 4 lettres dont des sosies)
  const LEVELS = {
    1: { rounds: 6, internal: [1] },
    2: { rounds: 7, internal: [2] },
    3: { rounds: 8, internal: [3] },
  };

  return { LEVELS, WORDS, BAD_STARTS, ALLOWED_VOWEL_WORDS, ALPHABET, LOOK_ALIKE, firstLetter, generate };
});
