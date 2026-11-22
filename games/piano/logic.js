// Le piano rigolo : jeu libre (pas de niveaux), terminé par le bouton ✅
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PianoLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const FREE = true;
  // gamme de do majeur, une couleur et un animal par note
  const NOTES = [
    { f: 262, n: "do", c: "#ef476f", a: "🐶" }, { f: 294, n: "ré", c: "#ff9f1c", a: "🐱" },
    { f: 330, n: "mi", c: "#ffd166", a: "🐥" }, { f: 349, n: "fa", c: "#06d6a0", a: "🐸" },
    { f: 392, n: "sol", c: "#118ab2", a: "🐮" }, { f: 440, n: "la", c: "#7b2cbf", a: "🐷" },
    { f: 494, n: "si", c: "#f15bb5", a: "🦁" }, { f: 523, n: "do", c: "#00bbf9", a: "🐵" },
  ];
  const INSTRUMENTS = [
    { e: "🎹", name: "le piano", type: "triangle", vibrato: 0 },
    { e: "🤖", name: "le robot", type: "square", vibrato: 0 },
    { e: "👻", name: "le fantôme", type: "sine", vibrato: 12 },
    { e: "🐝", name: "l'abeille", type: "sawtooth", vibrato: 30 },
  ];
  return { FREE, NOTES, INSTRUMENTS };
});
