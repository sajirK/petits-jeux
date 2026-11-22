// Parcours : jeux selon l'âge, "aventure du jour", album d'autocollants.
// Testé dans tests/parcours.test.js.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Parcours = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // Temps minimum (en secondes) dans un jeu de l'aventure pour qu'il compte comme fait
  const MIN_PLAY_SECONDS = 45;
  // Une étoile gagnée sur 3 donne un autocollant
  const STARS_PER_STICKER = 3;

  // Groupes pour varier l'aventure du jour : 1 jeu pour apprendre,
  // 1 pour les émotions ou la découverte, 1 pour bouger ou créer.
  const GROUPS = [["lire", "compter", "logique"], ["emotions", "decouvrir"], ["agilite", "creer"]];

  // ---------- Hasard reproductible (même aventure toute la journée) ----------
  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rngFrom(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Âge ----------
  const fitsAge = (g, age) => !age || (age >= g.ages[0] && age <= g.ages[1]);
  function forAge(games, age) { return games.filter((g) => fitsAge(g, age)); }
  function ageLabel(g) { return g.ages[1] >= 8 ? `${g.ages[0]} ans et +` : `${g.ages[0]}-${g.ages[1]} ans`; }

  // ---------- Aventure du jour : 3 jeux, 3 compétences différentes ----------
  function dailyPicks(games, { age = null, date = "2026-01-01", name = "" } = {}) {
    const rng = rngFrom(hashString(date + "|" + name + "|" + (age || "")));
    const pool = forAge(games, age);
    const picks = [];
    const usedSkills = new Set();
    for (const group of GROUPS) {
      const candidates = shuffle(pool.filter((g) => group.includes(g.skill) && !usedSkills.has(g.skill)), rng);
      if (candidates.length) { picks.push(candidates[0]); usedSkills.add(candidates[0].skill); }
    }
    // s'il manque des jeux (âge très jeune...), on complète avec d'autres compétences
    for (const g of shuffle(pool, rng)) {
      if (picks.length >= 3) break;
      if (!picks.includes(g) && !usedSkills.has(g.skill)) { picks.push(g); usedSkills.add(g.skill); }
    }
    return picks;
  }

  // ---------- Album d'autocollants ----------
  const COLLECTIONS = [
    { id: "ferme", label: "La ferme", items: ["🐄", "🐖", "🐑", "🐔", "🐐", "🐎", "🦆", "🐇"] },
    { id: "jungle", label: "La jungle", items: ["🦁", "🐘", "🦒", "🦓", "🦛", "🐊", "🐒", "🦜"] },
    { id: "mer", label: "La mer", items: ["🐙", "🦀", "🐬", "🐳", "🦈", "🐠", "🐢", "🦑"] },
    { id: "dinos", label: "Les dinos", items: ["🦕", "🦖", "🐉", "🥚", "🌋", "🦴", "🐲", "🌴"] },
    { id: "espace", label: "L'espace", items: ["🚀", "🪐", "🌙", "⭐", "☄️", "👽", "🛸", "🌍"] },
    { id: "vehicules", label: "Les véhicules", items: ["🚗", "🚒", "🚓", "🚜", "🚂", "✈️", "🚁", "⛵"] },
  ];
  const ALL_STICKERS = COLLECTIONS.flatMap((c) => c.items);

  // Donne un nouvel autocollant au hasard parmi ceux qui manquent (null si l'album est complet)
  function unlockSticker(owned, rng = Math.random) {
    const missing = ALL_STICKERS.filter((s) => !owned.includes(s));
    if (!missing.length) return null;
    return missing[Math.floor(rng() * missing.length)];
  }
  function completedCollections(owned) {
    return COLLECTIONS.filter((c) => c.items.every((s) => owned.includes(s))).map((c) => c.id);
  }

  // Nombre d'autocollants mérités grâce aux étoiles
  function stickersFromStars(stars) { return Math.floor(stars / STARS_PER_STICKER); }

  return {
    MIN_PLAY_SECONDS, STARS_PER_STICKER, GROUPS, COLLECTIONS, ALL_STICKERS,
    hashString, rngFrom, forAge, fitsAge, ageLabel, dailyPicks, unlockSticker, completedCollections, stickersFromStars,
  };
});
