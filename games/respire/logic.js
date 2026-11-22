// Respire avec moi : jeu bien-être (pas de niveaux). La séance se termine toute seule après 5 respirations.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RespireLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const FREE = true;
  // inspirer 4 s, garder 1 s, expirer 5 s : l'expiration plus longue aide à se calmer
  const CYCLES = 5, IN = 4000, HOLD = 1000, OUT = 5000, PAUSE = 600;
  const duration = () => CYCLES * (IN + HOLD + OUT + PAUSE);
  return { FREE, CYCLES, IN, HOLD, OUT, PAUSE, duration };
});
