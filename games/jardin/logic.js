// Logique de "Mon jardin" (testée dans tests/etape3.test.js).
// Une plante a besoin d'eau ET de lumière pour grandir. À chaque étape :
// un peu d'eau (pas trop !) + du soleil => elle passe à l'étape suivante.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.JardinLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // Étapes : 0 graine, 1 pousse, 2 plante, 3 fleur, 4 prête à récolter
  const STAGES = ["graine", "pousse", "plante", "fleur", "récolte"];
  const PLANTS = {
    tournesol: { name: "le tournesol", seed: "🌻", stages: ["🟤", "🌱", "🌿", "🌼", "🌻"], harvest: "🌻", count: 1, fact: "Quand il est jeune, le tournesol tourne sa tête pour suivre le soleil." },
    tomate: { name: "la tomate", seed: "🍅", stages: ["🟤", "🌱", "🌿", "🌼", "🍅"], harvest: "🍅", count: 3, fact: "La tomate pousse sur la plante, après la fleur : c'est un fruit !" },
    // on récolte la carotte avant qu'elle fleurisse : pas d'étape "fleur"
    carotte: { name: "la carotte", seed: "🥕", stages: ["🟤", "🌱", "🌿", "🌿", "🥕"], names: ["graine", "pousse", "plante", "grande plante", "récolte"], harvest: "🥕", count: 1, fact: "La carotte pousse sous la terre : on mange sa racine !", underground: true },
    fraise: { name: "la fraise", seed: "🍓", stages: ["🟤", "🌱", "🌿", "🌼", "🍓"], harvest: "🍓", count: 3, fact: "Les petites graines de la fraise sont dehors, sur sa peau !" },
  };
  const MAX_WATER = 2; // au-delà : trop d'eau

  function newPot(type) { return { type, stage: 0, water: 0, sun: false }; }

  // Arroser : 1 ou 2 fois, c'est bien ; plus, c'est trop
  function water(pot) {
    if (pot.stage >= 4) return { ok: false, msg: "Elle est prête : il faut la cueillir !" };
    if (pot.water >= MAX_WATER) return { ok: false, msg: "Stop ! Trop d'eau, ça noie les racines. Elle a assez bu." };
    pot.water++;
    return { ok: true, grew: tryGrow(pot), msg: "Glou glou, la plante boit !" };
  }
  // Soleil : on écarte le nuage
  function sun(pot) {
    if (pot.stage >= 4) return { ok: false, msg: "Elle est prête : il faut la cueillir !" };
    if (pot.sun) return { ok: false, msg: "Elle a déjà du soleil !" };
    pot.sun = true;
    return { ok: true, grew: tryGrow(pot), msg: "Le soleil réchauffe la plante !" };
  }
  // Elle grandit quand elle a eu de l'eau ET du soleil
  function tryGrow(pot) {
    if (pot.water >= 1 && pot.sun && pot.stage < 4) {
      pot.stage++;
      pot.water = 0;
      pot.sun = false;
      return true;
    }
    return false;
  }
  // Ce qu'il manque encore (pour guider l'enfant)
  function needs(pot) {
    if (pot.stage >= 4) return "récolter";
    if (pot.water < 1 && !pot.sun) return "eau et soleil";
    if (pot.water < 1) return "eau";
    if (!pot.sun) return "soleil";
    return null;
  }
  // Nom de l'étape pour cette plante (toutes les étapes sont au féminin : "une pousse", "une fleur")
  const stageName = (pot) => (PLANTS[pot.type].names || STAGES)[pot.stage];

  function harvest(pot) {
    if (pot.stage < 4) return null;
    const p = PLANTS[pot.type];
    pot.stage = 0; pot.water = 0; pot.sun = false;
    return { e: p.harvest, count: p.count };
  }

  return { STAGES, PLANTS, MAX_WATER, newPot, water, sun, tryGrow, needs, harvest, stageName };
});
