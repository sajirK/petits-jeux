// Liste des jeux, rangés par compétence et par âge.
// Pour ajouter un jeu : créer games/<id>/index.html puis ajouter une ligne ici
// (skill = compétence principale, ages = [âge minimum, âge maximum]).
(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else { root.SKILLS = data.SKILLS; root.GAMES = data.GAMES; root.AGES = data.AGES; }
})(typeof self !== "undefined" ? self : this, function () {
  const SKILLS = {
    lire: { label: "Lire", emoji: "📖", desc: "Les lettres, les sons et les mots" },
    compter: { label: "Compter", emoji: "🔢", desc: "Les nombres, compter et calculer" },
    logique: { label: "Réfléchir", emoji: "🧩", desc: "Logique, mémoire et programmation" },
    emotions: { label: "Mes émotions", emoji: "💛", desc: "Reconnaître, comprendre et apaiser ce qu'on ressent" },
    decouvrir: { label: "Découvrir", emoji: "🌍", desc: "Les couleurs, les formes, les animaux, soigner" },
    agilite: { label: "Agilité", emoji: "⚡", desc: "Réflexes, adresse et aventures" },
    creer: { label: "Créer", emoji: "🎨", desc: "Dessiner et faire de la musique" },
  };

  // Âges proposés dans le profil
  const AGES = [3, 4, 5, 6, 7, 8];

  const GAMES = [
    // Lire
    { id: "tracer", isNew: true, title: "J'écris", emoji: "✍️", skill: "lire", ages: [3, 7], color: "#d0ebff" },
    { id: "syllabes", isNew: true, title: "Les syllabes magiques", emoji: "🪄", skill: "lire", ages: [5, 8], color: "#eebefa" },
    { id: "premiere-lettre", title: "La Première Lettre", emoji: "🅰️", skill: "lire", ages: [4, 7], color: "#ffadad" },
    { id: "lettres", title: "Les Lettres", titleWithName: "Les lettres de {prenom}", emoji: "🔤", skill: "lire", ages: [4, 7], color: "#a0c4ff" },
    // Compter
    { id: "boulangerie", isNew: true, title: "La Boulangerie des nombres", emoji: "🥐", skill: "compter", ages: [4, 8], color: "#ffe8cc" },
    { id: "compter", title: "Je compte", emoji: "🔢", skill: "compter", ages: [3, 5], color: "#ffd166" },
    { id: "tours", title: "La Tour des Nombres", emoji: "🧱", skill: "compter", ages: [4, 7], color: "#ffb4a2" },
    { id: "calcul", title: "Les Calculs malins", emoji: "➕", skill: "compter", ages: [5, 8], color: "#9bf6ff" },
    { id: "pizzeria", title: "La Pizzeria", titleWithName: "La Pizzeria de {prenom}", emoji: "🍕", skill: "compter", ages: [4, 7], color: "#ffbf69" },
    // Réfléchir
    { id: "memoire", title: "Memory des animaux", emoji: "🐶", skill: "logique", ages: [3, 7], color: "#b5e48c" },
    { id: "suites", title: "Les Suites logiques", emoji: "🧩", skill: "logique", ages: [4, 8], color: "#cdb4db" },
    { id: "intrus", title: "Trouve l'intrus", emoji: "🔎", skill: "logique", ages: [4, 7], color: "#fed9b7" },
    { id: "melodie", title: "La Mémoire Musicale", emoji: "🎵", skill: "logique", ages: [4, 8], color: "#b8c0ff" },
    { id: "robot", title: "Le Petit Robot", emoji: "🤖", skill: "logique", ages: [5, 8], color: "#b8f2e6" },
    { id: "glacier", title: "Le Glacier", emoji: "🍦", skill: "logique", ages: [4, 7], color: "#ffc8dd" },
    // Émotions
    { id: "emotion-visage", title: "Devine l'émotion", emoji: "😊", skill: "emotions", ages: [3, 6], color: "#ffe066" },
    { id: "respire", title: "Respire avec moi", emoji: "🎈", skill: "emotions", ages: [3, 8], color: "#a5d8ff" },
    { id: "meteo", title: "Ma météo du jour", emoji: "🌤️", skill: "emotions", ages: [3, 8], color: "#fff3bf" },
    { id: "emotion-situations", title: "Les histoires d'émotions", emoji: "🤔", skill: "emotions", ages: [4, 7], color: "#d0bfff" },
    { id: "que-faire", title: "Que ferais-tu ?", emoji: "🤝", skill: "emotions", ages: [4, 8], color: "#b2f2bb" },
    // Découvrir
    { id: "couleurs", title: "Les Couleurs", emoji: "🌈", skill: "decouvrir", ages: [3, 5], color: "#ffadad" },
    { id: "formes", title: "Les Formes", emoji: "🔺", skill: "decouvrir", ages: [3, 5], color: "#fdffb6" },
    { id: "docteur", title: "Le Docteur des animaux", emoji: "🩺", skill: "decouvrir", ages: [3, 7], color: "#a8dadc" },
    // Agilité
    { id: "bulles", title: "Les Bulles", emoji: "🫧", skill: "agilite", ages: [3, 5], color: "#7fd3ff" },
    { id: "taupe", title: "Tape la Taupe", emoji: "🐹", skill: "agilite", ages: [3, 6], color: "#f6bd60" },
    { id: "fruits", title: "Tranche les Fruits", emoji: "🍉", skill: "agilite", ages: [4, 8], color: "#ff8fa3" },
    { id: "reflexe", title: "Réflexe Éclair", emoji: "⚡", skill: "agilite", ages: [4, 8], color: "#ffe066" },
    { id: "dino", title: "Super Saut Dino", emoji: "🦕", skill: "agilite", ages: [4, 8], color: "#9be7a0" },
    { id: "tresors", title: "Le Château Magique", emoji: "💎", skill: "agilite", ages: [4, 8], color: "#c3a6ff" },
    { id: "course", title: "Course de Bulles", emoji: "🚀", skill: "agilite", ages: [4, 8], color: "#8ecdf8" },
    // Créer
    { id: "dessin", title: "Je dessine", emoji: "🖍️", skill: "creer", ages: [3, 8], color: "#f4a3d8" },
    { id: "piano", title: "Le Piano rigolo", emoji: "🎹", skill: "creer", ages: [3, 8], color: "#ffc6ff" },
  ];

  return { SKILLS, GAMES, AGES };
});
