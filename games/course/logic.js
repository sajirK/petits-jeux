// Course de bulles : niveaux et passages (testés dans tests/v2-jeux.test.js)
// Unités : l'écran fait 10 de haut. Le poisson peut aller de 0,8 à 9,2.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CourseLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // dist : distance jusqu'au crabe ; speed : [départ, max] ; gap : taille du passage [départ, min]
  // spacing : distance entre deux obstacles ; boss : étoiles pour faire danser le crabe
  const LEVELS = {
    1: { rounds: 1, dist: 45, speed: [2.6, 3.4], gap: [5.4, 4.8], spacing: 8, boss: 3 },
    2: { rounds: 1, dist: 65, speed: [3.2, 5], gap: [4.6, 3.8], spacing: 6.5, boss: 5 },
    3: { rounds: 1, dist: 85, speed: [3.8, 6.2], gap: [3.9, 3.2], spacing: 5.5, boss: 5 },
  };
  const MIN_Y = 0.8, MAX_Y = 9.2;
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  // la course accélère et les passages rétrécissent doucement jusqu'au crabe
  const speedAt = (cfg, d) => lerp(cfg.speed[0], cfg.speed[1], d / cfg.dist);
  const gapAt = (cfg, d) => lerp(cfg.gap[0], cfg.gap[1], d / cfg.dist);
  // un obstacle : un passage de taille "gap", toujours entièrement dans la zone où le poisson peut nager
  function obstacle(cfg, d, rng = Math.random) {
    const gap = gapAt(cfg, d);
    const center = MIN_Y + gap / 2 + rng() * (MAX_Y - MIN_Y - gap);
    return { top: center - gap / 2, bottom: center + gap / 2, center };
  }
  return { LEVELS, MIN_Y, MAX_Y, speedAt, gapAt, obstacle };
});
