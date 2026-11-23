// Outils partagés : sons, voix, confettis, bouton maison.
// Utilisable dans chaque jeu via <script src="../../js/common.js"></script>
(function () {
  // Safari iOS : bloque le geste de pincement sans intercepter les gestes de jeu.
  window.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
  window.addEventListener("gesturechange", (event) => event.preventDefault(), { passive: false });

  // Reprise des sauvegardes d'une ancienne version (autre préfixe que "jeux.") :
  // on recopie nos propres clés connues, une seule fois, pour ne rien perdre.
  try {
    if (!localStorage.getItem("jeux.migrated")) {
      const OURS = /^(stars|coins|muted|pizzas|glaces|patients|robot\.wins|melodie\.best|reflexe\.[\w-]+|[\w-]+\.level)$/;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        const dot = k.indexOf(".");
        if (dot < 1 || k.startsWith("jeux.")) continue;
        const rest = k.slice(dot + 1);
        if (OURS.test(rest) && localStorage.getItem("jeux." + rest) === null) localStorage.setItem("jeux." + rest, localStorage.getItem(k));
      }
      localStorage.setItem("jeux.migrated", "1");
    }
  } catch (e) {}

  let ctx = null;
  let muted = localStorage.getItem("jeux.muted") === "1";

  // iOS n'autorise le son qu'après un premier toucher : on "déverrouille" l'audio.
  // Tous les sons passent par une petite chaîne "douce" :
  // filtre qui enlève les aigus agressifs + léger écho + compresseur (pas de son trop fort).
  let master = null;
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const soft = ctx.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 4200;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      const volume = ctx.createGain();
      volume.gain.value = 0.8;
      // écho léger pour arrondir le son
      const echo = ctx.createDelay();
      echo.delayTime.value = 0.11;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.22;
      const wet = ctx.createGain();
      wet.gain.value = 0.18;
      master = ctx.createGain();
      master.connect(soft);
      soft.connect(volume);
      soft.connect(echo);
      echo.connect(feedback).connect(echo);
      echo.connect(wet).connect(volume);
      volume.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  window.addEventListener("pointerdown", audio, { once: true });

  // Une note douce : attaque progressive (pas de "clic"), puis extinction naturelle.
  // Les types agressifs (square / sawtooth) sont adoucis en triangle.
  function tone(freq, duration = 0.15, type = "sine", volume = 0.25, delay = 0) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    if (type === "square" || type === "sawtooth") { type = "triangle"; volume *= 0.8; }
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.08, duration * 1.6));
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + duration * 1.6 + 0.05);
  }

  // Petite cloche / carillon : une note + une harmonique douce
  function bell(freq, delay = 0, volume = 0.22, length = 0.9) {
    tone(freq, length, "sine", volume, delay);
    tone(freq * 2, length * 0.5, "sine", volume * 0.25, delay);
    tone(freq * 3.01, length * 0.25, "sine", volume * 0.08, delay);
  }

  // Note qui glisse d'une fréquence à une autre (bulle, saut, boing...)
  function slide(from, to, duration, volume = 0.3, type = "sine", delay = 0, vibrato = 0) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + duration);
    if (vibrato) {
      const lfo = a.createOscillator();
      const lg = a.createGain();
      lfo.frequency.value = 9;
      lg.gain.value = vibrato;
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration + 0.1);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.05);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.1);
  }

  // Bruit filtré (souffle) : pour les "whoosh", "splash", grésillement du four...
  let noiseBuf = null;
  function noise(duration, { from = 800, to = 2500, q = 1.2, volume = 0.25, delay = 0, type = "bandpass" } = {}) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + delay;
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + duration);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(volume, t + duration * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(f).connect(g).connect(master);
    src.start(t, Math.random());
    src.stop(t + duration + 0.05);
  }

  // Notes de la gamme (do majeur) pour des mélodies jolies
  const DO = 523.25, MI = 659.25, SOL = 783.99, DO2 = 1046.5, MI2 = 1318.5, SOL2 = 1568;

  const sounds = {
    tone,
    bell,
    slide,
    noise,
    // coup de sabre dans l'air
    swoosh() {
      noise(0.16, { from: 600, to: 3000, q: 0.8, volume: 0.18 });
    },
    // fruit tranché : "tchak" juteux
    splat() {
      noise(0.12, { from: 2500, to: 500, q: 1, volume: 0.32 });
      slide(300, 120, 0.1, 0.18, "sine", 0.01);
    },
    // petit "miam"
    yum() {
      slide(300, 420, 0.12, 0.2);
      slide(420, 300, 0.14, 0.2, "sine", 0.14);
    },
    // ding du four / minuteur
    ding() {
      bell(1568, 0, 0.22, 1.2);
      bell(2093, 0.02, 0.08, 0.8);
    },
    // note n°i de la gamme (pour compter : 1, 2, 3... ça monte joliment)
    step(i) {
      const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];
      bell(392 * Math.pow(2, SCALE[Math.min(i, SCALE.length - 1)] / 12), 0, 0.2, 0.7);
    },
    // "bloup" de bulle : la note monte vite, très court
    pop() {
      const base = 380 + Math.random() * 220;
      slide(base, base * 2.6, 0.07, 0.35);
    },
    // petit "toc" doux
    click() {
      slide(900, 600, 0.05, 0.15);
    },
    // ramasser une pomme / une étoile / une gemme
    coin() {
      bell(MI2, 0, 0.16, 0.4);
      bell(SOL2, 0.07, 0.14, 0.6);
    },
    // saut : "houp" qui monte
    jump() {
      slide(260, 620, 0.16, 0.22, "sine");
    },
    // tape (taupe) : "boup" rond
    bonk() {
      slide(520, 180, 0.12, 0.35, "sine");
    },
    // bonne réponse : petit carillon
    success() {
      bell(DO2, 0, 0.18, 0.6);
      bell(MI2, 0.09, 0.16, 0.6);
      bell(SOL2, 0.18, 0.14, 0.9);
    },
    // erreur : "boing" gentil, pas un buzzer
    wrong() {
      slide(330, 200, 0.28, 0.28, "sine", 0, 18);
    },
    // victoire : petite boîte à musique
    win() {
      [DO, MI, SOL, DO2, SOL, DO2, MI2].forEach((f, i) => bell(f, i * 0.12, 0.17, 0.8));
    },
  };

  // Voix française (synthèse vocale de l'appareil)
  // On choisit une voix française de France, de bonne qualité. Jamais une voix anglaise :
  // sur Mac (surtout Chrome) la liste des voix arrive en retard, donc on l'attend avant de parler.
  const PREFERRED = ["audrey", "thomas", "marie", "aurélie", "google français", "denise", "henri", "julie", "hortense", "paul", "jacques", "amélie"];
  const NOVELTY = ["eddy", "flo", "grandma", "grandpa", "reed", "rocko", "sandy", "shelley", "mamie", "papi"];
  // on quitte l'onglet ou l'appli : la voix se tait tout de suite
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => { if (document.hidden && window.speechSynthesis) speechSynthesis.cancel(); });
    window.addEventListener("pagehide", () => { if (window.speechSynthesis) speechSynthesis.cancel(); });
  }
  const vLang = (v) => (v.lang || "").toLowerCase().replace("_", "-");
  const vName = (v) => v.name.toLowerCase();
  function voiceScore(v) {
    let sc = 100;
    const i = PREFERRED.findIndex((p) => vName(v).includes(p));
    if (i >= 0) sc = i;
    if (NOVELTY.some((n) => vName(v).startsWith(n))) sc = 1000;
    if (/premium|enhanced|amélioré|améliorée/.test(vName(v))) sc -= 0.5; // meilleure qualité
    if (vLang(v) !== "fr-fr") sc += 500; // français d'ailleurs (Canada, Belgique...) seulement en secours
    return sc;
  }
  // Toutes les voix françaises disponibles, la meilleure en premier
  function frenchVoices() {
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    return voices.filter((v) => vLang(v).startsWith("fr")).sort((a, b) => voiceScore(a) - voiceScore(b));
  }
  let frVoice = null;
  function pickVoice() {
    const list = frenchVoices();
    const wanted = localStorage.getItem("jeux.voix");
    frVoice = (wanted && list.find((v) => v.name === wanted)) || list[0] || null;
  }
  function setVoice(name) {
    if (name) localStorage.setItem("jeux.voix", name);
    else localStorage.removeItem("jeux.voix");
    pickVoice();
  }
  const voicesLoaded = () => window.speechSynthesis && speechSynthesis.getVoices().length > 0;
  if (window.speechSynthesis) {
    pickVoice();
    speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", pickVoice) : (speechSynthesis.onvoiceschanged = pickVoice);
  }

  let pendingSay = null;
  function speakNow(text, rate, pitch) {
    if (!frVoice) pickVoice();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = frVoice ? frVoice.lang : "fr-FR";
    if (frVoice) u.voice = frVoice;
    u.rate = rate;
    u.pitch = pitch;
    speechSynthesis.speak(u);
  }
  function say(text, { rate = 0.95, pitch = 1.05 } = {}) {
    text = String(text)
      .replace(/\s+/g, " ")
      .replace(/\s+([,!?.:])/g, "$1")
      .replace(/,([!?.])/g, "$1")
      .trim();
    if (!window.speechSynthesis || muted || document.hidden) return;
    if (voicesLoaded()) return speakNow(text, rate, pitch);
    // la liste des voix n'est pas encore prête : on attend (2 s maximum)
    const first = !pendingSay;
    pendingSay = { text, rate, pitch, until: Date.now() + 2000 };
    if (!first) return;
    const tick = () => {
      if (!pendingSay) return;
      if (voicesLoaded() || Date.now() > pendingSay.until) {
        const p = pendingSay;
        pendingSay = null;
        speakNow(p.text, p.rate, p.pitch);
      } else setTimeout(tick, 100);
    };
    setTimeout(tick, 100);
  }
  const currentVoice = () => frVoice;

  function confetti(count = 40, items = ["🎉", "⭐", "🎈", "✨", "🌟", "🍬"]) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.textContent = items[Math.floor(Math.random() * items.length)];
      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = 24 + Math.random() * 28 + "px";
      el.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      el.style.animationDelay = Math.random() * 0.6 + "s";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }
  }

  function addHomeButton(href = "../../index.html") {
    const a = document.createElement("a");
    a.href = href;
    a.className = "home-btn";
    a.setAttribute("aria-label", "Retour à l'accueil");
    a.textContent = "🏠";
    document.body.appendChild(a);
    document.body.classList.add("has-home");

    if (!document.querySelector(".game-help-btn")) {
      const help = document.createElement("button");
      help.className = "game-help-btn";
      help.type = "button";
      help.textContent = "💡";
      help.setAttribute("aria-label", "Montre-moi comment jouer");
      help.title = "Montre-moi comment jouer";
      help.addEventListener("click", () => {
        const selectors = ["#ask", "#question", "#mission", "#cue", "#wText", "#stepTitle", ".hint", "#tip", "#target", "#story"];
        const prompt = selectors.map((sel) => [...document.querySelectorAll(sel)].find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
        })).find(Boolean);
        let instruction = prompt && (prompt.getAttribute("aria-label") || prompt.innerText || prompt.textContent || "").replace(/\s+/g, " ").trim();
        if (!instruction || instruction.length < 4) instruction = `Regarde les images. ${document.querySelector("h1")?.textContent || ""}. Écoute la consigne et touche ou glisse les éléments pour jouer.`;
        instruction = instruction.slice(0, 180);
        say(instruction);
        toast(instruction);
        const targets = [...document.querySelectorAll("button, .opt, .tool, .arrow, .item, .card, .balloon, .piece")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
        }).slice(0, 8);
        targets.forEach((el) => el.classList.add("help-flash"));
        setTimeout(() => targets.forEach((el) => el.classList.remove("help-flash")), 1800);
      });
      document.body.appendChild(help);
    }
  }

  // --- Bouton son / muet, présent sur toutes les pages ---
  function isMuted() {
    return muted;
  }
  function setMuted(m) {
    muted = m;
    localStorage.setItem("jeux.muted", m ? "1" : "0");
    if (m && window.speechSynthesis) speechSynthesis.cancel();
    if (muteBtn) {
      muteBtn.textContent = m ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-label", m ? "Remettre le son" : "Couper le son");
      muteBtn.classList.toggle("off", m);
    }
  }
  const muteBtn = document.createElement("button");
  muteBtn.className = "mute-btn";
  muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMuted(!muted);
    if (!muted) tone(880, 0.08, "triangle", 0.2);
  });
  document.body.appendChild(muteBtn);
  setMuted(muted);

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // --- Espace perso ---
  // Prénom et avatar de l'enfant, choisis sur la page d'accueil et gardés sur l'appareil
  // on garde seulement les lettres (avec accents), espaces, tirets et apostrophes
  const cleanName = (n) => String(n || "").replace(/<[^>]*>/g, "").replace(/[^\p{L}\s'’-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  const NAME = cleanName(localStorage.getItem("jeux.prenom"));
  function getName() { return cleanName(localStorage.getItem("jeux.prenom")); }
  function setName(n) { localStorage.setItem("jeux.prenom", cleanName(n)); }
  function getAvatar() { return localStorage.getItem("jeux.avatar") || "🦁"; }
  function setAvatar(a) { localStorage.setItem("jeux.avatar", a); }
  function getCoins() { return parseInt(localStorage.getItem("jeux.coins") || "0", 10); }

  // Étoiles gagnées, gardées sur l'appareil (localStorage)
  function getStars() {
    return parseInt(localStorage.getItem("jeux.stars") || "0", 10);
  }
  // Toutes les 3 étoiles, un autocollant à découvrir dans l'album (dévoilé sur l'accueil)
  const STARS_PER_STICKER = 3;
  function addStars(n = 1) {
    const before = getStars();
    const v = before + n;
    localStorage.setItem("jeux.stars", String(v));
    const won = Math.floor(v / STARS_PER_STICKER) - Math.floor(before / STARS_PER_STICKER);
    if (won > 0) {
      addPendingStickers(won);
      toast("🎁 Un autocollant t'attend dans ton album !");
    }
    return v;
  }
  function addPendingStickers(n) {
    const p = parseInt(localStorage.getItem("jeux.stickers.pending") || "0", 10) + n;
    localStorage.setItem("jeux.stickers.pending", String(p));
  }

  // Petit message en bas de l'écran
  function toast(text, ms = 3200) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("bye"), ms - 400);
    setTimeout(() => t.remove(), ms);
  }

  const praises = ["Bravo", "Super", "Génial", "Trop fort", "Champion", "Bien joué", "Magnifique"];
  function bravo(extra = "") {
    say(`${pick(praises)} ${NAME} ! ${extra}`);
  }

  // --- Niveaux qui s'adaptent : 4 réussites d'affilée = niveau suivant,
  //     3 erreurs d'affilée = on redescend d'un niveau ---
  function progress(id, max, { upAfter = 4, downAfter = 3 } = {}) {
    const k = `jeux.${id}.level`;
    let level = Math.min(max, Math.max(1, parseInt(localStorage.getItem(k) || "1", 10)));
    let streak = 0, misses = 0;
    const save = () => localStorage.setItem(k, String(level));
    return {
      max,
      get level() { return level; },
      set(l) { level = Math.min(max, Math.max(1, l)); streak = misses = 0; save(); },
      success() {
        streak++; misses = 0;
        if (streak >= upAfter && level < max) { level++; streak = 0; save(); return "up"; }
        return null;
      },
      fail() {
        misses++; streak = 0;
        if (misses >= downAfter && level > 1) { level--; misses = 0; save(); return "down"; }
        return null;
      },
    };
  }

  // Petit sélecteur "◀ Niveau 2 ▶" (l'enfant ou un parent peut choisir)
  function levelBadge(prog, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "level-badge";
    const minus = document.createElement("button");
    const label = document.createElement("span");
    const plus = document.createElement("button");
    minus.textContent = "◀"; plus.textContent = "▶";
    minus.setAttribute("aria-label", "Niveau plus facile");
    plus.setAttribute("aria-label", "Niveau plus difficile");
    const render = () => {
      label.textContent = `Niveau ${prog.level}`;
      minus.disabled = prog.level <= 1;
      plus.disabled = prog.level >= prog.max;
    };
    minus.onclick = () => { prog.set(prog.level - 1); render(); tone(500, 0.06); onChange(); };
    plus.onclick = () => { prog.set(prog.level + 1); render(); tone(800, 0.06); onChange(); };
    wrap.append(minus, label, plus);
    render();
    wrap.update = render;
    return wrap;
  }

  window.Jeux = { toast, addPendingStickers, frenchVoices, setVoice, currentVoice, progress, levelBadge, NAME, getName, setName, getAvatar, setAvatar, getCoins, cleanName, isMuted, setMuted, audio, output: () => (audio(), master), sounds, say, bravo, confetti, addHomeButton, shuffle, pick, getStars, addStars };
})();
