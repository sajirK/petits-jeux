// Logique du "Docteur des animaux" V2 (testée dans tests/docteur.test.js).
// L'enfant GLISSE les outils de la trousse sur l'animal.
//   type "rub"   : on frotte avec l'outil sur la zone (désinfectant, loupe, éponge…)
//   type "place" : on dépose l'outil sur la zone (pansement, glace, thermomètre…), "count" fois
//   type "pull"  : on attrape l'épine avec la pince et on tire
//   type "mud"   : on frotte chaque tache de boue
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DocteurLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const TOOLS = {
    desinfectant: { e: "🧴", name: "le désinfectant" },
    pansement: { e: "🩹", name: "le pansement" },
    thermometre: { e: "🌡️", name: "le thermomètre" },
    sirop: { e: "🥄", name: "le sirop" },
    glace: { e: "🧊", name: "la poche de glace" },
    loupe: { e: "🔍", name: "la loupe" },
    pince: { e: "🥢", name: "la pince" },
    stethoscope: { e: "🩺", name: "le stéthoscope" },
    eponge: { e: "🧽", name: "l'éponge" },
    radio: { e: "📷", name: "l'appareil de radio" },
    platre: { e: "🧻", name: "le plâtre" },
  };

  // Zones du corps (en % de la boîte du patient) : [x, y, rayon]
  const ZONES = {
    front: [50, 15, 11], bouche: [50, 36, 9], joue: [63, 28, 8],
    ventre: [50, 66, 15], patte: [22, 60, 9], jambe: [63, 88, 10],
  };

  // amount = quantité de frottement ; count = nombre de fois qu'on dépose l'outil
  const AILMENTS = {
    bobo: {
      intro: "Aïe ! Je suis tombé, j'ai un bobo sur la joue !", icon: "🤕", simple: true,
      steps: [
        { tool: "desinfectant", zone: "joue", type: "rub", amount: 2.2, say: "Frotte le bobo avec le désinfectant." },
        { tool: "pansement", zone: "joue", type: "place", count: 1, say: "Pose un pansement sur le bobo." },
      ],
    },
    boue: {
      intro: "J'ai sauté dans les flaques ! Je suis tout sale !", icon: "🟤", simple: true,
      steps: [{ tool: "eponge", zone: "mud", type: "mud", say: "Frotte les taches de boue avec l'éponge." }],
    },
    ventre: {
      intro: "Oh là là, j'ai mal au ventre !", icon: "🍬", simple: true,
      steps: [
        { tool: "stethoscope", zone: "ventre", type: "rub", amount: 2.4, say: "Écoute son ventre avec le stéthoscope." },
        { tool: "sirop", zone: "bouche", type: "place", count: 2, say: "Donne-lui du sirop dans la bouche." },
      ],
    },
    fievre: {
      intro: "J'ai chaud, j'ai froid… je suis malade !", icon: "🤒",
      steps: [
        { tool: "thermometre", zone: "bouche", type: "place", count: 1, say: "Mets le thermomètre dans sa bouche." },
        { tool: "sirop", zone: "bouche", type: "place", count: 3, say: "Il a de la fièvre ! Donne-lui du sirop." },
        { tool: "glace", zone: "front", type: "place", count: 1, say: "Pose la glace sur son front." },
      ],
    },
    epine: {
      intro: "Aïe aïe aïe ! J'ai marché sur quelque chose qui pique !", icon: "🌵",
      steps: [
        { tool: "loupe", zone: "patte", type: "rub", amount: 1.8, say: "Cherche sur sa patte avec la loupe." },
        { tool: "pince", zone: "patte", type: "pull", say: "Une épine ! Attrape-la avec la pince et tire !" },
        { tool: "pansement", zone: "patte", type: "place", count: 1, say: "Un petit pansement pour finir." },
      ],
    },
    jambe: {
      intro: "Je suis tombé de vélo, j'ai très mal à la jambe !", icon: "🦴",
      steps: [
        { tool: "radio", zone: "jambe", type: "rub", amount: 2.2, say: "Passe l'appareil de radio sur sa jambe." },
        { tool: "platre", zone: "jambe", type: "place", count: 3, say: "L'os est cassé ! Mets le plâtre sur sa jambe." },
      ],
    },
  };

  const ANIMALS = [
    ["🐶", "#c68b59", "#a0693f"], ["🐱", "#f4a259", "#d9822b"], ["🐰", "#e9ecef", "#ced4da"],
    ["🐻", "#8d5524", "#6f4518"], ["🐼", "#f8f9fa", "#343a40"], ["🐸", "#80c45a", "#5a9e3a"],
    ["🐷", "#ffb3c6", "#ff8fab"], ["🦊", "#f77f00", "#d45d00"], ["🐯", "#f9a03f", "#e07b00"],
    ["🐨", "#adb5bd", "#868e96"], ["🦁", "#f6bd60", "#d9a441"], ["🐵", "#a0693f", "#7f5539"],
  ];

  // ---------- Les 3 niveaux ----------
  const LEVELS = {
    // Facile : soins simples, petite trousse, le bon outil brille, quantités réduites
    1: { rounds: 3, ailments: ["bobo", "boue", "ventre"], tray: 4, glow: true, amountScale: 0.6, maxCount: 1 },
    // Moyen : tous les soins, trousse de 8 outils, aide seulement si on hésite
    2: { rounds: 4, ailments: Object.keys(AILMENTS), tray: 8, glow: false, amountScale: 0.85, maxCount: 2 },
    // Difficile : trousse complète, quantités normales, pas d'aide automatique
    3: { rounds: 5, ailments: Object.keys(AILMENTS), tray: Object.keys(TOOLS).length, glow: false, amountScale: 1, maxCount: 3 },
    // Expert : 6 patients, on frotte plus longtemps
    4: { rounds: 6, ailments: Object.keys(AILMENTS), tray: Object.keys(TOOLS).length, glow: false, amountScale: 1.2, maxCount: 3 },
  };

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Les étapes adaptées au niveau (frottement plus court, moins de cuillères en Facile)
  function stepsFor(ailmentId, level) {
    const cfg = LEVELS[level];
    return AILMENTS[ailmentId].steps.map((s) => ({
      ...s,
      amount: s.amount ? +(s.amount * cfg.amountScale).toFixed(2) : undefined,
      count: s.count ? Math.min(s.count, cfg.maxCount) : undefined,
    }));
  }

  // La trousse : tous les outils nécessaires + d'autres pour choisir, dans un ordre fixe pour la partie
  function trayFor(ailmentIds, level, rng = Math.random) {
    const cfg = LEVELS[level];
    const needed = [...new Set(ailmentIds.flatMap((a) => AILMENTS[a].steps.map((s) => s.tool)))];
    const others = shuffle(Object.keys(TOOLS).filter((t) => !needed.includes(t)), rng);
    const size = Math.max(cfg.tray, needed.length);
    return shuffle([...needed, ...others].slice(0, size), rng);
  }

  // Une partie : une suite de patients, chacun avec un soin différent (tant que possible)
  function session(level, rng = Math.random) {
    const cfg = LEVELS[level];
    const ailments = [];
    let pool = [];
    for (let i = 0; i < cfg.rounds; i++) {
      if (!pool.length) pool = shuffle(cfg.ailments, rng);
      ailments.push(pool.pop());
    }
    const animals = shuffle(ANIMALS, rng);
    const patients = ailments.map((a, i) => ({ ailment: a, animal: animals[i % animals.length], steps: stepsFor(a, level) }));
    // en Facile, la trousse change à chaque patient pour rester petite ; sinon une trousse pour toute la partie
    const tray = trayFor(level === 1 ? [] : ailments, level, rng);
    return { patients, tray };
  }

  const isRightTool = (step, tool) => step && step.tool === tool;
  const inZone = (pt, zoneId, extra = 1) => {
    const z = ZONES[zoneId];
    return Math.hypot(pt[0] - z[0], pt[1] - z[1]) < z[2] * 1.6 * extra;
  };

  return { TOOLS, ZONES, AILMENTS, ANIMALS, LEVELS, stepsFor, trayFor, session, isRightTool, inZone };
});
