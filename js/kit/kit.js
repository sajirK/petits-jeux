// Les Petits Jeux V2 — le "kit" partagé par tous les jeux.
// Dépend de : js/common.js (Jeux : sons, voix, prénom, étoiles) et js/kit/levels.js (KitLevels).
//
//   Kit.game({
//     id, title, icon, bg,                       // identité du jeu
//     instruction: (cfg, level) => "…",          // consigne dite à l'ouverture et sur 🔊
//     levels: { 1: {rounds, …}, 2: {…}, 3: {…} },// ce qui change selon le niveau (null = jeu libre)
//     start(round) { … },                        // construit un défi dans round.stage
//   });
//
//   Dans start(round) : round.cfg, round.level, round.index, round.stage,
//     round.win(el, phrase?)   → réussite (son, particules, voix, étoile, défi suivant)
//     round.miss(el, hint?)    → erreur douce (boing, secousse, indice), compte pour les étoiles
//     round.say(text)          → parle
//     round.hint(el)           → montre la main 👆 sur un élément (aide)
//     round.setHintTarget(fn)  → élément à montrer si l'enfant ne fait rien pendant un moment
//     round.end({errors, text}) → terminer la partie (jeux "arcade" et "libre")
//     round.meter(icon, total)  → jauge d'objectif d'un jeu d'action ; .set(n)
//     round.loop(fn) / round.timeout / round.interval / round.onCleanup → arrêtés automatiquement
//
//   Modes : "rounds" (manches, par défaut), "arcade" (une partie qui se termine par round.end),
//           "free" (jeu libre sans niveaux, bouton ✅ "J'ai fini").
(function () {
  const J = window.Jeux;
  const L = window.KitLevels;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ======================================================================
  // Robustesse : anti-zoom, anti appui long, anti rebond, retour du cache
  // ======================================================================
  function lockViewport() {
    document.documentElement.classList.add("kit");
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
    // iOS ignore parfois user-scalable=no : on bloque les gestes de zoom et le double-tap
    ["gesturestart", "gesturechange", "gestureend"].forEach((t) => document.addEventListener(t, (e) => e.preventDefault(), { passive: false }));
    let lastTouch = 0;
    document.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTouch < 320 && e.target.closest(".kit-no-dbl, .k-stage, .k-bar")) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
    document.addEventListener("dblclick", (e) => e.preventDefault());
    document.addEventListener("contextmenu", (e) => e.preventDefault()); // appui long = pas de menu
  }

  // ======================================================================
  // Voix : consignes, encouragements, félicitations (phrases variées)
  // ======================================================================
  const PRAISE = ["Bravo !", "Super !", "Oui !", "Génial !", "Bien joué !", "Trop fort !", "Parfait !", "C'est ça !"];
  const ENCOURAGE = ["Presque !", "Essaie encore !", "Pas tout à fait…", "Tu vas y arriver !", "Oups, encore une fois !"];
  const END = {
    3: ["Incroyable, tout est juste !", "Parfait, zéro erreur !", "Tu es un champion !"],
    2: ["Très bien joué !", "Super partie !", "Bravo, c'est presque parfait !"],
    1: ["Bravo, tu as fini !", "Bien joué, tu as tout terminé !", "Tu progresses, continue !"],
  };
  const Voice = {
    last: "",
    say(text, opts) { if (text) J.say(text, opts); },
    instruct(text) { this.last = text; this.say(text); },
    repeat() { this.say(this.last); },
    praise(extra = "") {
      const name = J.NAME && Math.random() < 0.35 ? ` ${J.NAME}` : "";
      this.say(`${pick(PRAISE).replace(" !", `${name} !`)} ${extra}`);
    },
    encourage(hint = "") { this.say(hint || pick(ENCOURAGE)); },
    end(stars) { return pick(END[stars]); },
  };

  // ======================================================================
  // Particules (étincelles au point touché)
  // ======================================================================
  const Particles = (() => {
    let canvas, ctx, parts = [], running = false;
    function ensure() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.className = "k-particles";
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      const fit = () => { const d = devicePixelRatio || 1; canvas.width = innerWidth * d; canvas.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
      fit(); addEventListener("resize", fit);
    }
    function star(x, y, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
    }
    function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.018;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
        if (p.emoji) { ctx.font = `${p.r * 2}px serif`; ctx.textAlign = "center"; ctx.fillText(p.emoji, p.x, p.y); }
        else { ctx.fillStyle = p.c; star(p.x, p.y, p.r, p.rot); }
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(loop); else running = false;
    }
    return {
      burst(x, y, { colors = ["#ffd43b", "#ff922b", "#f06595", "#51cf66", "#4dabf7", "#cc5de8"], emojis = null, count = 26, power = 1 } = {}) {
        ensure();
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 6) * power;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, r: 5 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 1, c: pick(colors), emoji: emojis ? pick(emojis) : null });
        }
        if (!running) { running = true; requestAnimationFrame(loop); }
      },
      at(el, opts) {
        const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
        this.burst(r.left + r.width / 2, r.top + r.height / 2, opts);
      },
    };
  })();

  // ======================================================================
  // Main qui montre (aide quand l'enfant hésite)
  // ======================================================================
  // el : un élément (la main tapote dessus) ou { from, to } (la main fait le geste de glisser)
  function showHand(el) {
    if (!el || (!el.from && typeof el.getBoundingClientRect !== "function")) return; // ex. { swipe } : seulement pour le robot
    document.querySelectorAll(".k-hand").forEach((h) => h.remove());
    const isDrag = el.from && el.to;
    const a = (isDrag ? el.from : el).getBoundingClientRect();
    const h = document.createElement("div");
    h.className = "k-hand" + (isDrag ? " k-hand-drag" : "");
    h.textContent = "👆";
    h.style.left = a.left + a.width / 2 + "px";
    h.style.top = a.top + a.height / 2 + "px";
    document.body.appendChild(h);
    if (isDrag) {
      const b = el.to.getBoundingClientRect();
      const go = () => { h.style.left = b.left + b.width / 2 + "px"; h.style.top = b.top + b.height / 2 + "px"; };
      const back = () => { h.style.transition = "none"; h.style.left = a.left + a.width / 2 + "px"; h.style.top = a.top + a.height / 2 + "px"; void h.offsetWidth; h.style.transition = ""; };
      setTimeout(go, 350);
      setTimeout(back, 1500);
      setTimeout(go, 1800);
    }
    setTimeout(() => h.remove(), isDrag ? 3000 : 2900);
  }

  // ======================================================================
  // Le jeu
  // ======================================================================
  function game(def) {
    lockViewport();
    if (def.bg) document.documentElement.style.setProperty("--game-bg", def.bg);
    const mode = def.mode || (def.levels ? "rounds" : "free"); // "rounds" | "arcade" | "free"
    const hasLevels = !!def.levels;
    if (!L.validateConfig(def.levels)) console.warn(`[Kit] ${def.id} : les 3 niveaux doivent avoir "rounds"`);
    let level = hasLevels ? L.load(localStorage, def.id) : 1;
    document.body.dataset.kitMode = mode;

    // ---------- squelette ----------
    const bar = document.createElement("header");
    bar.className = "k-bar";
    const home = document.createElement("a");
    home.className = "k-round-btn";
    home.href = def.home || "../../index.html";
    home.setAttribute("aria-label", "Retour à l'accueil");
    home.textContent = "🏠";
    // on remplace la page au lieu d'empiler : le bouton "retour" du navigateur ne ramène pas dans le jeu
    home.addEventListener("click", (e) => { e.preventDefault(); location.replace(home.href); });
    const title = document.createElement("div");
    title.className = "k-title";
    title.innerHTML = `<span class="k-icon"></span><span class="k-name"></span>`;
    title.querySelector(".k-icon").textContent = def.icon || "🎈";
    title.querySelector(".k-name").textContent = def.title || "";
    const levelsEl = document.createElement("div");
    levelsEl.className = "k-levels";
    levelsEl.setAttribute("role", "group");
    levelsEl.setAttribute("aria-label", "Niveau");
    const replay = document.createElement("button");
    replay.className = "k-round-btn";
    replay.setAttribute("aria-label", "Réécouter la consigne");
    replay.textContent = "🔊";
    bar.append(home, title);
    if (hasLevels) bar.append(levelsEl);
    // jeux libres : un bouton "J'ai fini" pour avoir aussi une fin
    let doneBtn = null;
    if (mode === "free" && def.doneButton !== false) {
      doneBtn = document.createElement("button");
      doneBtn.className = "k-round-btn k-done";
      doneBtn.setAttribute("aria-label", "J'ai fini");
      doneBtn.textContent = "✅";
      bar.append(doneBtn);
    }
    bar.append(replay);
    const mute = document.querySelector(".mute-btn");
    if (mute) bar.append(mute); // le bouton son de common.js rejoint la barre
    const progress = document.createElement("div");
    progress.className = "k-progress";
    const stage = document.createElement("main");
    stage.className = "k-stage";
    [...document.body.children].forEach((c) => { if (c.tagName !== "SCRIPT" && !c.classList.contains("mute-btn")) stage.appendChild(c); });
    document.body.prepend(bar, progress, stage);

    // ---------- niveaux ----------
    function renderLevels() {
      levelsEl.innerHTML = "";
      L.LEVELS.forEach((lv) => {
        const b = document.createElement("button");
        b.className = "k-level" + (lv.n === level ? " on" : "");
        b.style.setProperty("--col", lv.color);
        b.style.setProperty("--soft", lv.soft);
        b.setAttribute("aria-pressed", lv.n === level);
        b.setAttribute("aria-label", `Niveau ${lv.label}`);
        b.innerHTML = `<span class="k-lv-stars">${lv.stars}</span><span class="k-lv-name">${lv.label}</span>`;
        b.onclick = () => {
          J.sounds.click();
          if (lv.n === level && !ended) { Voice.say(lv.label); return; }
          setLevel(lv.n);
          Voice.say(lv.label);
          startSession();
        };
        levelsEl.appendChild(b);
      });
    }
    function setLevel(n) { level = L.save(localStorage, def.id, n); renderLevels(); }

    // ---------- nettoyage (boucles, minuteries) entre deux manches / parties ----------
    let cleanups = [];
    function cleanup() { const c = cleanups; cleanups = []; c.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

    // ---------- inactivité : on redit la consigne et on montre ----------
    let idleTimer = null, hintTarget = null, ended = false;
    const idleMs = def.idleMs === undefined ? (mode === "rounds" ? 12000 : false) : def.idleMs;
    function armIdle() {
      clearTimeout(idleTimer);
      if (!idleMs) return;
      idleTimer = setTimeout(() => {
        if (ended) return;
        replay.classList.add("k-pulse");
        Voice.repeat();
        const t = typeof hintTarget === "function" ? hintTarget() : hintTarget;
        if (t) showHand(t);
        armIdle();
      }, idleMs);
    }
    document.addEventListener("pointerdown", () => { replay.classList.remove("k-pulse"); if (!ended) armIdle(); }, true);
    replay.onclick = () => { replay.classList.remove("k-pulse"); Voice.repeat(); };
    if (doneBtn) doneBtn.onclick = () => { J.sounds.click(); finish({ errors: 0, text: def.doneText }); };

    // ---------- manche ----------
    let cfg, rounds, index, errors, roundErrors, busy;
    function renderProgress() {
      progress.innerHTML = "";
      if (mode !== "rounds" || !rounds || rounds <= 1) return;
      for (let i = 0; i < rounds; i++) {
        const d = document.createElement("span");
        d.className = "k-dot" + (i < index ? " ok" : i === index ? " now" : "");
        progress.appendChild(d);
      }
    }
    function startSession() {
      cleanup();
      document.querySelectorAll(".k-end").forEach((e) => e.remove());
      cfg = hasLevels ? def.levels[level] : (def.config || {});
      rounds = mode === "rounds" ? (cfg.rounds || def.rounds || 1) : 1;
      index = 0; errors = 0; ended = false;
      renderLevels();
      const text = typeof def.instruction === "function" ? def.instruction(cfg, level) : def.instruction;
      Voice.instruct(text);
      runRound(false);
    }
    function runRound(animate = true) {
      cleanup();
      busy = false; roundErrors = 0; hintTarget = null;
      renderProgress();
      const build = () => {
        stage.innerHTML = "";
        try { def.start(api()); }
        catch (e) { console.error(`[Kit] ${def.id}`, e); }
        if (animate) { stage.classList.add("k-swap-in"); setTimeout(() => stage.classList.remove("k-swap-in"), 520); }
      };
      if (animate) { stage.classList.add("k-swap-out"); setTimeout(() => { stage.classList.remove("k-swap-out"); build(); }, 240); }
      else build();
      armIdle();
    }
    function api() {
      return {
        cfg, level, index, stage, rounds, mode,
        get ended() { return ended; },
        say: (t, o) => Voice.say(t, o),
        instruct: (t) => Voice.instruct(t),
        hint: showHand,
        setHintTarget: (t) => { hintTarget = t; },
        burst: (el, o) => Particles.at(el, o),
        burstAt: (x, y, o) => Particles.burst(x, y, o),
        praise: (extra) => Voice.praise(extra),
        // fonction appelée quand la manche/partie s'arrête (stopper une boucle, une minuterie…)
        onCleanup: (fn) => { cleanups.push(fn); },
        // une minuterie qui s'arrête toute seule au changement de niveau ou à la fin
        timeout: (fn, ms) => { const t = setTimeout(() => { if (!ended) fn(); }, ms); cleanups.push(() => clearTimeout(t)); return t; },
        interval: (fn, ms) => { const t = setInterval(() => { if (!ended) fn(); }, ms); cleanups.push(() => clearInterval(t)); return t; },
        loop(fn) { // boucle d'animation (dt en secondes), arrêtée automatiquement
          let alive = true, last = performance.now();
          const step = (now) => { if (!alive) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!ended) fn(dt, now); requestAnimationFrame(step); };
          requestAnimationFrame(step);
          cleanups.push(() => { alive = false; });
        },
        win(el, phrase = "", { delay = 1500, praise = true } = {}) {
          if (busy || ended) return;
          busy = true;
          if (el) { el.classList.remove("k-good"); void el.offsetWidth; el.classList.add("k-good"); Particles.at(el); }
          J.sounds.success();
          if (praise) Voice.praise(phrase); else if (phrase) Voice.say(phrase);
          index++;
          renderProgress();
          clearTimeout(idleTimer);
          setTimeout(() => { if (ended) return; index >= rounds ? finish() : runRound(); }, delay);
        },
        miss(el, hint = "") {
          if (busy || ended) return;
          errors++; roundErrors++;
          if (el) { el.classList.remove("k-miss"); void el.offsetWidth; el.classList.add("k-miss"); }
          J.sounds.wrong();
          Voice.encourage(hint);
          if (roundErrors >= 2) { const t = typeof hintTarget === "function" ? hintTarget() : hintTarget; if (t) setTimeout(() => showHand(t), 900); }
        },
        // jauge d'objectif des jeux d'action (dans la barre de progression) : const g = round.meter("🐹", 12); g.set(3)
        meter(icon, total) {
          progress.innerHTML = `<div class="k-meter"><span class="k-meter-icon">${icon}</span><span class="k-meter-track"><span class="k-meter-fill"></span></span><span class="k-meter-count">0/${total}</span></div>`;
          const fill = progress.querySelector(".k-meter-fill"), count = progress.querySelector(".k-meter-count"), box = progress.querySelector(".k-meter");
          return {
            set(n) {
              n = Math.max(0, Math.min(total, n));
              fill.style.width = (n / total) * 100 + "%";
              count.textContent = `${n}/${total}`;
              box.classList.remove("k-meter-bump"); void box.offsetWidth; box.classList.add("k-meter-bump");
            },
          };
        },
        // erreur qui compte pour les étoiles, sans son ni voix (jeux d'action)
        oops() { if (!ended) errors++; },
        // terminer la partie maintenant (arcade, libre) : { errors, text, stars }
        end: (opts = {}) => finish(opts),
        finish: (extraErrors = 0) => finish({ errors: errors + extraErrors }),
      };
    }

    // ---------- écran de fin ----------
    function finish(opts = {}) {
      if (ended) return;
      ended = true;
      clearTimeout(idleTimer);
      cleanup();
      const totalErrors = opts.errors !== undefined ? opts.errors : errors;
      const stars = opts.stars || L.starsFor(totalErrors);
      if (hasLevels) L.recordBest(localStorage, def.id, level, stars);
      J.addStars(stars);
      try { sessionStorage.setItem("jeux.finished", JSON.stringify({ id: def.id, t: Date.now() })); } catch (e) {}
      const next = L.LEVELS[level];
      const canUp = hasLevels && L.suggestUp(level, stars) && next;
      const end = document.createElement("div");
      end.className = "k-end";
      end.innerHTML = `
        <div class="k-end-card" role="dialog" aria-label="Bravo">
          <div class="k-end-plume">🦉</div>
          <div class="k-end-stars">${[1, 2, 3].map(() => '<span class="k-end-star">⭐</span>').join("")}</div>
          <p class="k-end-title"></p>
          <p class="k-end-sub"></p>
          <div class="k-end-actions"></div>
        </div>`;
      const phrase = opts.text || Voice.end(stars);
      end.querySelector(".k-end-title").textContent = J.NAME ? `Bravo ${J.NAME} !` : "Bravo !";
      end.querySelector(".k-end-sub").textContent = phrase;
      const actions = end.querySelector(".k-end-actions");
      const again = document.createElement("button");
      again.className = "k-btn";
      again.innerHTML = mode === "free" ? "🔁 <span>Encore</span>" : "🔁 <span>Rejouer</span>";
      again.onclick = () => { J.sounds.click(); startSession(); };
      actions.append(again);
      if (canUp) {
        const up = document.createElement("button");
        up.className = "k-btn up";
        up.style.setProperty("--lv-next", next.color);
        up.innerHTML = `${next.stars} <span>${next.label}</span>`;
        up.onclick = () => { J.sounds.click(); setLevel(next.n); Voice.say(next.label); startSession(); };
        actions.append(up);
      }
      const homeBtn = document.createElement("a");
      homeBtn.className = "k-btn";
      homeBtn.href = home.href;
      homeBtn.textContent = "🏠";
      homeBtn.setAttribute("aria-label", "Accueil");
      homeBtn.addEventListener("click", (e) => { e.preventDefault(); location.replace(home.href); });
      actions.append(homeBtn);
      document.body.appendChild(end);
      const starEls = end.querySelectorAll(".k-end-star");
      J.sounds.win();
      for (let i = 0; i < stars; i++) {
        setTimeout(() => {
          starEls[i].classList.add("lit");
          J.sounds.bell([784, 988, 1175][i], 0, 0.2, 0.9);
          Particles.at(starEls[i], { count: 18, power: 0.8 });
        }, 500 + i * 420);
      }
      setTimeout(() => {
        J.confetti(stars * 15, ["⭐", "🎉", "✨", def.icon || "🎈"]);
        const tail = canUp ? ` Tu veux essayer le niveau ${next.label} ?` : "";
        Voice.say(`${end.querySelector(".k-end-title").textContent} ${phrase}${tail}`);
      }, 500 + stars * 420);
    }

    addEventListener("pageshow", (e) => { if (e.persisted) startSession(); });
    // accès pour les tests automatiques : la bonne réponse attendue et l'état de la partie
    window.__kit = {
      target: () => (typeof hintTarget === "function" ? hintTarget() : hintTarget),
      state: () => ({ index, rounds, errors, ended, level, mode }),
      setLevel: (n) => { setLevel(n); startSession(); },
    };
    startSession();
    return { restart: startSession, get level() { return level; } };
  }

  // ======================================================================
  // Petits composants d'interface réutilisables
  // ======================================================================
  const UI = {
    el(tag, cls = "", text) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text !== undefined) e.textContent = text;
      return e;
    },
    // Carte de consigne : un grand visuel + 👂 pour réécouter (aucune lecture nécessaire)
    prompt(parent, { visual = "", html = "", caption = "", onTap } = {}) {
      const card = UI.el("button", "k-prompt");
      card.innerHTML = `<span class="k-prompt-visual"></span><span class="k-prompt-ear">👂</span>`;
      const v = card.querySelector(".k-prompt-visual");
      if (html) v.innerHTML = html; else v.textContent = visual;
      if (caption) { const c = UI.el("span", "k-prompt-caption", caption); card.appendChild(c); }
      if (onTap) card.onclick = onTap;
      parent.appendChild(card);
      return card;
    },
    // Grille de gros boutons de réponse
    choices(parent, items, { cls = "", render, onPick } = {}) {
      const wrap = UI.el("div", "k-choices");
      const buttons = items.map((it, i) => {
        const b = UI.el("button", "k-choice " + cls);
        b.style.animationDelay = i * 60 + "ms";
        if (render) render(it, b); else b.textContent = String(it);
        b.onclick = () => onPick && onPick(it, b);
        wrap.appendChild(b);
        return b;
      });
      parent.appendChild(wrap);
      return buttons;
    },
  };

  // ======================================================================
  // Glisser-déposer standard
  //   Kit.drag(source, {
  //     ghost: "🍓" | (el) => contenu,       // ce qui suit le doigt
  //     onMove(pt, e)                        // pendant le geste (pt = {x, y} écran)
  //     onDrop(pt, e) → true si déposé        // sinon l'objet revient à sa place
  //     onTap()                               // simple toucher sans glisser (optionnel)
  //   })
  //   Kit.over(el, pt, marge) → le point est-il sur l'élément ?
  // ======================================================================
  function over(el, pt, margin = 0) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return pt.x >= r.left - margin && pt.x <= r.right + margin && pt.y >= r.top - margin && pt.y <= r.bottom + margin;
  }
  function drag(source, opts = {}) {
    source.style.touchAction = "none";
    source.addEventListener("pointerdown", (e) => {
      if (opts.enabled && !opts.enabled()) return;
      e.preventDefault();
      try { source.setPointerCapture(e.pointerId); } catch (err) {}
      const start = { x: e.clientX, y: e.clientY };
      let ghost = null, moved = false;
      const makeGhost = () => {
        ghost = document.createElement("div");
        ghost.className = "k-ghost";
        const g = typeof opts.ghost === "function" ? opts.ghost(source) : opts.ghost;
        if (g instanceof Node) ghost.appendChild(g); else ghost.textContent = g || source.textContent;
        document.body.appendChild(ghost);
        source.classList.add("k-lifted");
        J.sounds.click();
      };
      const move = (ev) => {
        const pt = { x: ev.clientX, y: ev.clientY };
        if (!moved && Math.hypot(pt.x - start.x, pt.y - start.y) > 8) { moved = true; makeGhost(); }
        if (!moved) return;
        ghost.style.left = pt.x + "px"; ghost.style.top = pt.y + "px";
        if (opts.onMove) opts.onMove(pt, ev);
      };
      const up = (ev) => {
        source.removeEventListener("pointermove", move);
        source.removeEventListener("pointerup", up);
        source.removeEventListener("pointercancel", up);
        source.classList.remove("k-lifted");
        const pt = { x: ev.clientX, y: ev.clientY };
        if (!moved) { if (opts.onTap) opts.onTap(); return; }
        const ok = ev.type === "pointerup" && opts.onDrop ? opts.onDrop(pt, ev) : false;
        if (ok) { ghost.classList.add("k-drop"); setTimeout(() => ghost.remove(), 220); }
        else {
          const r = source.getBoundingClientRect();
          ghost.classList.add("k-back");
          ghost.style.left = r.left + r.width / 2 + "px"; ghost.style.top = r.top + r.height / 2 + "px";
          setTimeout(() => ghost.remove(), 320);
        }
      };
      source.addEventListener("pointermove", move);
      source.addEventListener("pointerup", up);
      source.addEventListener("pointercancel", up);
    });
  }

  window.Kit = { game, Voice, Particles, showHand, lockViewport, levels: L, ui: UI, drag, over };
})();
