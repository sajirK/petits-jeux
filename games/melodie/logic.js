// La Mémoire Musicale : niveaux et mélodies (testés dans tests/v2-jeux.test.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MelodieLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // 4 notes qui sonnent bien ensemble (do, mi, sol, do aigu)
  const PADS = [
    { c: "#ef476f", e: "🐶", f: 523.25 },
    { c: "#118ab2", e: "🐱", f: 659.25 },
    { c: "#ffd166", e: "🐥", f: 783.99 },
    { c: "#06d6a0", e: "🐸", f: 1046.5 },
  ];
  // lengths : longueur de la mélodie à chaque manche ; pads : nombre d'animaux musiciens
  const LEVELS = {
    1: { rounds: 4, lengths: [2, 2, 3, 3], pads: 3 },
    2: { rounds: 4, lengths: [3, 4, 4, 5], pads: 4 },
    3: { rounds: 4, lengths: [4, 5, 6, 7], pads: 4 },
  };
  // une mélodie : jamais 3 fois la même note de suite (trop difficile à compter)
  function melody(len, pads, rng = Math.random) {
    const out = [];
    while (out.length < len) {
      const n = Math.floor(rng() * pads);
      if (out.length >= 2 && out[out.length - 1] === n && out[out.length - 2] === n) continue;
      out.push(n);
    }
    return out;
  }
  // plus la mélodie est longue, plus elle va vite (mais jamais trop)
  const speed = (len) => Math.max(380, 700 - len * 30);
  return { PADS, LEVELS, melody, speed };
});
