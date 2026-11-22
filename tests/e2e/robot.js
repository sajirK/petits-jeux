// Robot de test de bout en bout (dans le navigateur, page d'accueil ouverte) :
//   const s = document.createElement("script"); s.src = "/tests/e2e/robot.js"; document.head.appendChild(s);
//   robot(["couleurs", "docteur"]).then(console.log)
// Chaque jeu est joué aux 3 niveaux, temps accéléré ×25, voix coupée, en suivant l'aide du kit
// (__kit.target()). Attendu : "fin ⭐3" et 0 erreur pour chaque jeu.
(function () {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function tapEl(w, el) {
    const r = el.getBoundingClientRect(), o = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, pointerId: 5 };
    el.dispatchEvent(new w.PointerEvent("pointerdown", o));
    el.dispatchEvent(new w.PointerEvent("pointerup", o));
    el.click();
  }
  function dragEl(w, from, to, paint) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const ev = (t, x, y) => from.dispatchEvent(new w.PointerEvent(t, { clientX: x, clientY: y, bubbles: true, pointerId: 6 }));
    ev("pointerdown", a.left + a.width / 2, a.top + a.height / 2);
    ev("pointermove", a.left + a.width / 2 + 20, a.top + a.height / 2 + 20);
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    if (paint) for (let y = -0.8; y <= 0.8; y += 0.06) for (let x = -0.8; x <= 0.8; x += 0.06) if (x * x + y * y < 0.64) ev("pointermove", cx + (x * b.width) / 2, cy + (y * b.height) / 2);
    ev("pointermove", cx, cy);
    ev("pointerup", cx, cy);
  }
  async function playOne(id, lv, opts = {}) {
    const f = document.createElement("iframe");
    f.style.cssText = `position:fixed;left:0;top:0;width:${opts.w || 900}px;height:${opts.h || 900}px;border:0;z-index:99999;background:#fff`;
    f.src = `/games/${id}/index.html?` + Math.random();
    document.body.appendChild(f);
    await new Promise((r) => (f.onload = r));
    const w = f.contentWindow, errs = [];
    w.addEventListener("error", (e) => errs.push(e.message));
    const st = w.setTimeout.bind(w), si = w.setInterval.bind(w);
    w.setTimeout = (fn, ms, ...a) => st(fn, (ms || 0) / 25, ...a);
    w.setInterval = (fn, ms, ...a) => si(fn, Math.max(4, (ms || 0) / 25), ...a);
    w.speechSynthesis.speak = () => {};
    if (!w.__kit) { f.remove(); return `${id} L${lv}: PAS DE KIT`; }
    w.__kit.setLevel(lv);
    let gestures = 0, res = "";
    for (let i = 0; i < (opts.steps || 1500); i++) {
      await wait(20);
      if (w.document.querySelector(".k-end")) { await wait(150); res = `fin ⭐${w.document.querySelectorAll(".k-end-star.lit").length} (${gestures} gestes)`; break; }
      let t = null;
      try { t = w.__kit.target(); } catch (e) { errs.push("target: " + e.message); }
      if (t && t.from) { dragEl(w, t.from, t.to, t.paint); gestures++; await wait(50); }
      else if (t && t.isConnected && !t.disabled && !t.classList.contains("used")) { tapEl(w, t); gestures++; await wait(50); }
    }
    const s = w.__kit.state();
    if (!opts.keep) f.remove();
    return `${id} L${lv}: ${res || "PAS FINI (manche " + s.index + "/" + s.rounds + ")"} erreurs=${s.errors}${errs.length ? " ERR " + errs[0] : ""}`;
  }
  window.robotLog = [];
  window.robot = async function (ids, levels = [1, 2, 3], opts) {
    const out = [];
    for (const id of ids) for (const lv of levels) { const r = await playOne(id, lv, opts); out.push(r); window.robotLog.push(r); }
    return out;
  };
  window.robotStart = (ids, levels, opts) => { window.robotLog = []; window.robotDone = false; window.robot(ids, levels, opts).then(() => (window.robotDone = true)); return "parti"; };
})();
