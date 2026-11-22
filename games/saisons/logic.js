// Logique de "Les saisons et la météo" (testée dans tests/etape3.test.js).
// Mode 1 : habiller un enfant selon le temps qu'il fait.
// Mode 2 : reconnaître les saisons (en France, hémisphère nord) et leur ordre.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SaisonsLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const CLOTHES = {
    manteau: { e: "🧥", name: "le manteau" },
    echarpe: { e: "🧣", name: "l'écharpe" },
    gants: { e: "🧤", name: "les gants" },
    bottes: { e: "👢", name: "les bottes" },
    parapluie: { e: "☂️", name: "le parapluie" },
    casquette: { e: "🧢", name: "la casquette" },
    lunettes: { e: "🕶️", name: "les lunettes de soleil" },
    tshirt: { e: "👕", name: "le tee-shirt" },
    short: { e: "🩳", name: "le short" },
    maillot: { e: "🩱", name: "le maillot de bain" },
  };

  // need : à mettre absolument ; no : pas adapté (on explique pourquoi)
  const WEATHERS = [
    {
      id: "neige", e: "❄️", sky: "#dbe4ff", scene: "⛄❄️🌲", text: "Il neige et il fait très froid !",
      need: ["manteau", "echarpe", "gants"], no: { short: "Brrr, en short on aurait trop froid !", maillot: "Un maillot de bain dans la neige ? On aurait trop froid !" },
    },
    {
      id: "pluie", e: "🌧️", sky: "#ced4da", scene: "🌧️💧🐌", text: "Il pleut beaucoup aujourd'hui !",
      need: ["parapluie", "bottes"], no: { lunettes: "Des lunettes de soleil sous la pluie ? Il n'y a pas de soleil !", maillot: "On ne va pas à la plage sous la pluie !" },
    },
    {
      id: "soleil", e: "☀️", sky: "#a5d8ff", scene: "☀️🌳🦋", text: "Il fait beau et très chaud !",
      need: ["casquette", "tshirt"], no: { manteau: "Avec un manteau, on aurait beaucoup trop chaud !", echarpe: "Une écharpe ? On aurait trop chaud !", gants: "Des gants quand il fait chaud ? Pas besoin !" },
    },
    {
      id: "plage", e: "🏖️", sky: "#99e9f2", scene: "🏖️🌊🐚", text: "On va à la plage, il fait très chaud !",
      need: ["maillot", "lunettes", "casquette"], no: { manteau: "Un manteau à la plage ? On aurait trop chaud !", bottes: "Des bottes dans le sable ? Pas pratique !", gants: "Des gants à la plage ? Pas besoin !", echarpe: "Une écharpe à la plage ? On aurait trop chaud !" },
    },
  ];

  // Vérifie la tenue : ce qui manque, ce qui ne va pas
  function checkOutfit(weather, worn) {
    const missing = weather.need.filter((k) => !worn.includes(k));
    const wrong = worn.filter((k) => weather.no[k]);
    return { ok: !missing.length && !wrong.length, missing, wrong };
  }
  function outfitMessage(weather, worn) {
    const r = checkOutfit(weather, worn);
    if (r.ok) return "Parfait ! C'est la bonne tenue pour ce temps-là !";
    if (r.wrong.length) return weather.no[r.wrong[0]];
    return `Il manque encore ${CLOTHES[r.missing[0]].name} !`;
  }

  // ---------- Les saisons (en France) ----------
  const SEASONS = [
    { id: "printemps", name: "le printemps", label: "Printemps", scene: "🌷🐣🌸", e: "🌸", hint: "les fleurs poussent et les oiseaux font leur nid" },
    { id: "ete", name: "l'été", label: "Été", scene: "🏖️☀️🍉", e: "☀️", hint: "il fait chaud et on va à la plage" },
    { id: "automne", name: "l'automne", label: "Automne", scene: "🍂🍄🌰", e: "🍂", hint: "les feuilles tombent des arbres" },
    { id: "hiver", name: "l'hiver", label: "Hiver", scene: "⛄❄️🧤", e: "⛄", hint: "il fait froid et il peut neiger" },
  ];
  const nextSeason = (id) => SEASONS[(SEASONS.findIndex((s) => s.id === id) + 1) % 4];

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Question : "Quelle saison ?" (image) ou "Qu'est-ce qui vient après ... ?"
  function seasonQuestion(rng = Math.random) {
    const s = SEASONS[Math.floor(rng() * 4)];
    if (rng() < 0.5) return { kind: "scene", season: s, answer: s.id, options: shuffle(SEASONS, rng), say: `Regarde l'image. Quelle saison est-ce ?` };
    const ans = nextSeason(s.id);
    return { kind: "after", season: s, answer: ans.id, options: shuffle(SEASONS.filter((x) => x.id !== s.id), rng), say: `Qu'est-ce qui vient après ${s.name} ?` };
  }

  return { CLOTHES, WEATHERS, SEASONS, checkOutfit, outfitMessage, nextSeason, seasonQuestion };
});
