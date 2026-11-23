// Contenu et logique de la section "Mes émotions" (testés dans tests/emotions.test.js).
// Principes : toutes les émotions sont normales ; on apprend à les reconnaître,
// à les nommer, et ce qui peut aider. On ne dit jamais "ne sois pas triste".
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Emotions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // m / f : "il est ..." / "elle est ..." ; label : bouton ; noun : "la joie"
  const EMOTIONS = {
    joie: {
      emoji: "😄", label: "Joie", m: "est joyeux", f: "est joyeuse", noun: "la joie", color: "#ffd166",
      body: "On sourit, on a envie de rire et de sauter !",
      tips: [["🗣️", "Partage ta joie : raconte-le à quelqu'un !"], ["🎨", "Fais un dessin de ce qui te rend content."], ["💃", "Danse sur une musique !"]],
    },
    tristesse: {
      emoji: "😢", label: "Tristesse", m: "est triste", f: "est triste", noun: "la tristesse", color: "#74c0fc",
      body: "On a envie de pleurer, on se sent tout mou.",
      tips: [["🤗", "Un câlin, ça fait du bien."], ["🗣️", "Parle à quelqu'un que tu aimes."], ["💧", "Tu as le droit de pleurer : ça soulage."]],
    },
    colere: {
      emoji: "😠", label: "Colère", m: "est en colère", f: "est en colère", noun: "la colère", color: "#ff6b6b",
      body: "On fronce les sourcils, on serre les poings, on a chaud.",
      tips: [["🎈", "Respire fort et lentement, comme un ballon."], ["🛋️", "Serre un coussin très fort."], ["🗣️", "Dis avec des mots : « Je suis en colère parce que… »"]],
    },
    peur: {
      emoji: "😨", label: "Peur", m: "a peur", f: "a peur", noun: "la peur", color: "#b197fc",
      body: "Le cœur bat vite, on a envie de se cacher.",
      tips: [["👨‍👩‍👧", "Dis-le à un adulte : il est là pour t'aider."], ["🧸", "Serre ton doudou contre toi."], ["🎈", "Respire doucement avec le ballon."]],
    },
    surprise: {
      emoji: "😲", label: "Surprise", m: "est surpris", f: "est surprise", noun: "la surprise", color: "#ffa94d",
      body: "On ouvre grand les yeux et la bouche : oh !",
      tips: [["👀", "Prends le temps de regarder ce qui se passe."], ["🗣️", "Raconte ce qui t'a surpris !"]],
    },
    degout: {
      emoji: "🤢", label: "Dégoût", m: "est dégoûté", f: "est dégoûtée", noun: "le dégoût", color: "#8ce99a",
      body: "On fronce le nez, on dit « beurk ! »",
      tips: [["🙅", "Tu as le droit de ne pas aimer quelque chose."], ["🗣️", "Dis-le gentiment : « Non merci, je n'aime pas. »"]],
    },
    calme: {
      emoji: "😌", label: "Calme", m: "est calme", f: "est calme", noun: "le calme", color: "#96f2d7",
      body: "On se sent tranquille, tout doux, bien.",
      tips: [["🌸", "Profite de ce moment tout doux."], ["📖", "C'est le bon moment pour lire une histoire."]],
    },
    fatigue: {
      emoji: "😴", label: "Fatigue", m: "est fatigué", f: "est fatiguée", noun: "la fatigue", color: "#a5d8ff",
      body: "On bâille, les yeux se ferment tout seuls.",
      tips: [["🛏️", "Repose-toi un peu."], ["📖", "Fais une activité calme, comme regarder un livre."], ["🤗", "Un câlin et au dodo !"]],
    },
  };

  // Émotions utilisées selon le niveau
  const LEVEL_EMOTIONS = {
    1: ["joie", "tristesse", "colere", "peur"],
    2: ["joie", "tristesse", "colere", "peur", "surprise", "degout"],
    3: ["joie", "tristesse", "colere", "peur", "surprise", "degout", "calme", "fatigue"],
    4: ["joie", "tristesse", "colere", "peur", "surprise", "degout", "calme", "fatigue"],
  };

  // Situations : une seule réponse attendue ; "alsoOk" = émotions aussi possibles,
  // qui ne seront JAMAIS proposées comme mauvaise réponse.
  const SITUATIONS = [
    { who: "Lina", g: "f", scene: "🎁🎂", text: "Lina reçoit un beau cadeau pour son anniversaire.", answer: "joie", alsoOk: ["surprise"], because: "elle reçoit un cadeau" },
    { who: "Tom", g: "m", scene: "🧸❓", text: "Tom a perdu son doudou.", answer: "tristesse", alsoOk: ["peur", "colere"], because: "il a perdu son doudou" },
    { who: "Sami", g: "m", scene: "🐕💥", text: "Un gros chien aboie très fort devant Sami.", answer: "peur", alsoOk: ["surprise"], because: "le gros chien aboie fort" },
    { who: "Noé", g: "m", scene: "🧱💢", text: "Quelqu'un fait tomber la tour de Noé exprès.", answer: "colere", alsoOk: ["tristesse", "surprise"], because: "on a cassé sa tour exprès" },
    { who: "Jade", g: "f", scene: "🥗🐛", text: "Jade trouve un ver de terre dans sa salade.", answer: "degout", alsoOk: ["surprise", "peur"], because: "il y a un ver dans sa salade" },
    { who: "Malo", g: "m", scene: "📦🤡", text: "Malo ouvre une boîte et un clown en sort d'un coup : boing !", answer: "surprise", alsoOk: ["peur", "joie"], because: "le clown sort d'un coup" },
    { who: "Léo", g: "m", scene: "⚽🚶", text: "Le copain de Léo ne veut plus jouer avec lui.", answer: "tristesse", alsoOk: ["colere"], because: "son copain ne veut plus jouer avec lui" },
    { who: "Mia", g: "f", scene: "🏖️🌞", text: "Mia joue à la plage avec ses amis.", answer: "joie", alsoOk: ["calme"], because: "elle joue avec ses amis à la plage" },
    { who: "Inès", g: "f", scene: "⛈️🌙", text: "La nuit, Inès entend le tonnerre faire BOUM très fort.", answer: "peur", alsoOk: ["surprise"], because: "le tonnerre fait un grand bruit" },
    { who: "Lucas", g: "m", scene: "🖍️😤", text: "Le petit frère de Lucas gribouille sur son beau dessin.", answer: "colere", alsoOk: ["tristesse", "surprise"], because: "son frère a gribouillé sur son dessin" },
    { who: "Nina", g: "f", scene: "🐟💔", text: "Le poisson rouge de Nina est mort.", answer: "tristesse", alsoOk: ["surprise"], because: "son poisson rouge est mort" },
    { who: "Adam", g: "m", scene: "🧦💨", text: "Adam sent une odeur de chaussettes très sales.", answer: "degout", alsoOk: [], because: "ça sent très mauvais" },
    { who: "Chloé", g: "f", scene: "🚲🎉", text: "Chloé réussit à faire du vélo toute seule !", answer: "joie", alsoOk: ["surprise"], because: "elle a réussi à faire du vélo" },
    { who: "Yanis", g: "m", scene: "🛁🎶", text: "Yanis est dans son bain chaud et écoute une douce musique.", answer: "calme", alsoOk: ["joie", "fatigue"], because: "il se repose dans son bain" },
    { who: "Emma", g: "f", scene: "🛋️🥱", text: "Il est très tard et Emma bâille sur le canapé.", answer: "fatigue", alsoOk: ["calme"], because: "il est très tard" },
    { who: "Rayan", g: "m", scene: "🎉🎈", text: "Tous ses amis crient « Surprise ! » quand Rayan entre dans la pièce.", answer: "surprise", alsoOk: ["joie"], because: "il ne savait pas qu'il y avait une fête" },
    { who: "Sara", g: "f", scene: "🍦⬇️", text: "La glace de Sara tombe par terre.", answer: "tristesse", alsoOk: ["colere", "surprise"], because: "sa glace est tombée" },
    { who: "Hugo", g: "m", scene: "🕷️😱", text: "Une grosse araignée descend juste devant le nez de Hugo.", answer: "peur", alsoOk: ["surprise", "degout"], because: "l'araignée est juste devant lui" },
    { who: "Zoé", g: "f", scene: "🎠🎡", text: "Zoé va à la fête foraine avec son papi.", answer: "joie", alsoOk: ["surprise"], because: "elle va à la fête foraine" },
    { who: "Paul", g: "m", scene: "🧃💦", text: "Sa sœur renverse du jus exprès sur les cartes de Paul.", answer: "colere", alsoOk: ["tristesse", "surprise"], because: "sa sœur a fait exprès d'abîmer ses cartes" },
  ];

  // "Que ferais-tu ?" : une seule bonne réaction, les autres sont clairement à éviter.
  const CHOICES = [
    {
      scene: "🤕😭", text: "Ton ami tombe dans la cour et se met à pleurer.",
      options: [
        { e: "🤗", t: "Je vais le voir et je lui demande s'il a mal.", good: true, why: "Oui ! Quand quelqu'un a mal, on va le voir, et si besoin on appelle un adulte." },
        { e: "😆", t: "Je me moque de lui.", why: "Ton ami serait encore plus triste. Que pourrais-tu faire pour l'aider ?" },
        { e: "🙈", t: "Je fais comme si je n'avais rien vu.", why: "Il a besoin d'aide. Que pourrais-tu faire pour lui ?" },
      ],
    },
    {
      scene: "🧸😠", text: "Tu es très en colère parce que ta sœur a pris ton jouet.",
      options: [
        { e: "🗣️", t: "Je respire fort, puis je lui dis : « Je suis en colère, rends-le-moi s'il te plaît. »", good: true, why: "Bravo ! Tu as le droit d'être en colère, et tu l'as dit avec des mots. C'est très fort !" },
        { e: "👊", t: "Je la tape.", why: "Taper fait mal. On a le droit d'être en colère, mais on le dit avec des mots." },
        { e: "💥", t: "Je casse son jouet à elle.", why: "Elle serait triste, et ton jouet ne reviendrait pas. Essaie autre chose." },
      ],
    },
    {
      scene: "🧒🌧️", text: "Un enfant est tout seul dans la cour. Il a l'air triste.",
      options: [
        { e: "🤝", t: "Je lui demande s'il veut jouer avec moi.", good: true, why: "Super ! Grâce à toi, il ne sera plus tout seul." },
        { e: "🚫", t: "Je dis aux autres de ne pas jouer avec lui.", why: "Il serait encore plus triste. Comment pourrais-tu l'aider ?" },
        { e: "😛", t: "Je lui tire la langue.", why: "Ce n'est pas gentil. Que pourrais-tu faire pour qu'il se sente mieux ?" },
      ],
    },
    {
      scene: "🏺💔", text: "Tu as cassé un vase sans faire exprès.",
      options: [
        { e: "🙋", t: "Je le dis à un adulte et je dis pardon.", good: true, why: "Bravo ! Dire la vérité, c'est courageux. Tout le monde fait des erreurs." },
        { e: "🙊", t: "Je cache les morceaux.", why: "Quelqu'un pourrait se couper. Mieux vaut le dire à un adulte." },
        { e: "🐱", t: "Je dis que c'est le chat.", why: "Ce n'est pas la vérité. On peut dire ce qui s'est passé, même si on a un peu peur." },
      ],
    },
    {
      scene: "🖼️✨", text: "Ton copain te montre son dessin. Il en est très fier.",
      options: [
        { e: "👏", t: "Je lui dis : « Il est trop beau, ton dessin ! »", good: true, why: "Oui ! Un compliment, ça rend tout le monde heureux." },
        { e: "👎", t: "Je lui dis qu'il est moche.", why: "Ça lui ferait de la peine. Que pourrais-tu lui dire de gentil ?" },
        { e: "🖍️", t: "Je gribouille dessus.", why: "Il serait très triste et en colère. Essaie autre chose." },
      ],
    },
    {
      scene: "🌙😨", text: "Le soir, dans ton lit, tu as peur du noir.",
      options: [
        { e: "👨‍👩‍👧", t: "J'appelle papa ou maman et je dis que j'ai peur.", good: true, why: "Oui ! Quand on a peur, on peut le dire : les adultes sont là pour nous aider." },
        { e: "🤐", t: "Je garde ma peur pour moi et je ne dis rien à personne.", why: "Ta peur, tu as le droit d'en parler. Ça aide beaucoup !" },
        { e: "🔊", t: "Je crie très fort sans rien expliquer.", why: "Les autres ne comprendraient pas ce qui se passe. Que pourrais-tu dire ?" },
      ],
    },
    {
      scene: "🧱👶", text: "Ton petit frère voudrait jouer avec tes Lego.",
      options: [
        { e: "🤝", t: "Je partage et on construit ensemble.", good: true, why: "Génial ! Jouer à deux, c'est encore plus rigolo." },
        { e: "✋", t: "Je lui arrache les Lego des mains.", why: "Il serait triste. Comment pourriez-vous jouer tous les deux ?" },
        { e: "💢", t: "Je le pousse.", why: "Pousser peut faire mal. Essaie autre chose." },
      ],
    },
    {
      scene: "🎲😕", text: "Tu as perdu à un jeu de société.",
      options: [
        { e: "👏", t: "Je dis « bravo » au gagnant, et on fait une autre partie.", good: true, why: "Bravo ! Perdre, ça arrive à tout le monde. Et on peut rejouer !" },
        { e: "🃏", t: "Je jette le jeu par terre.", why: "On peut être déçu, mais on ne casse pas le jeu. Que pourrais-tu faire ?" },
        { e: "😤", t: "Je dis que l'autre a triché.", why: "Ce n'est pas vrai, et ça lui ferait de la peine. Essaie autre chose." },
      ],
    },
    {
      scene: "🐈🤒", text: "Ton ami te dit qu'il est triste parce que son chat est malade.",
      options: [
        { e: "👂", t: "Je l'écoute et je lui fais un câlin.", good: true, why: "Oui ! Écouter quelqu'un qui est triste, c'est un beau cadeau." },
        { e: "🤷", t: "Je lui dis : « C'est pas grave, c'est juste un chat. »", why: "Pour lui, c'est important. Que pourrais-tu faire pour le consoler ?" },
        { e: "🚂", t: "Je parle de mes jouets à la place.", why: "Il a besoin que tu l'écoutes. Essaie autre chose." },
      ],
    },
    {
      scene: "🚶💥", text: "Un enfant te bouscule sans faire exprès, et il te dit pardon.",
      options: [
        { e: "👍", t: "Je lui dis : « D'accord, ce n'est pas grave. »", good: true, why: "Bravo ! Il ne l'a pas fait exprès et il s'est excusé." },
        { e: "💢", t: "Je le bouscule aussi.", why: "Il ne l'a pas fait exprès. Que pourrais-tu lui répondre ?" },
        { e: "😾", t: "Je boude toute la journée.", why: "Il a dit pardon : tu peux accepter ses excuses." },
      ],
    },
    {
      scene: "👩😩", text: "Maman a l'air très fatiguée ce soir.",
      options: [
        { e: "🧺", t: "Je range mes jouets et je lui fais un câlin.", good: true, why: "Oui ! Tu as vu qu'elle était fatiguée et tu l'as aidée. C'est très gentil." },
        { e: "📢", t: "Je fais plein de bruit dans la maison.", why: "Elle a besoin de calme. Comment pourrais-tu l'aider ?" },
        { e: "🛋️", t: "Je saute partout sur le canapé.", why: "Ce n'est pas le bon moment. Que pourrais-tu faire pour l'aider ?" },
      ],
    },
    {
      scene: "🗯️😞", text: "Tu as dit quelque chose de méchant à ton ami, et il est triste.",
      options: [
        { e: "💛", t: "Je lui dis pardon.", good: true, why: "Bravo ! Dire pardon, ça répare, et c'est courageux." },
        { e: "🔁", t: "Je recommence.", why: "Il serait encore plus triste. Que pourrais-tu lui dire ?" },
        { e: "🙈", t: "Je fais comme si de rien n'était.", why: "Il est toujours triste. Comment pourrais-tu réparer ?" },
      ],
    },
  ];

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Devine l'émotion (visages) ----------
  function faceQuestion(level, rng = Math.random, avoid = null) {
    const pool = LEVEL_EMOTIONS[Math.min(4, Math.max(1, level))];
    const choices = pool.filter((e) => e !== avoid);
    const answer = choices[Math.floor(rng() * choices.length)];
    const n = level <= 1 ? 3 : level >= 4 ? 6 : 4; // Expert : 6 visages
    const others = shuffle(pool.filter((e) => e !== answer), rng).slice(0, n - 1);
    return { answer, options: shuffle([answer, ...others], rng) };
  }

  // ---------- Comment se sent-il ? (situations) ----------
  function situationsFor(level) {
    const allowed = LEVEL_EMOTIONS[Math.min(3, Math.max(1, level))];
    return SITUATIONS.filter((s) => allowed.includes(s.answer));
  }
  function situationQuestion(level, rng = Math.random, avoidText = null) {
    const lv = Math.min(3, Math.max(1, level));
    const allowed = LEVEL_EMOTIONS[lv];
    let list = situationsFor(lv).filter((s) => s.text !== avoidText);
    const s = list[Math.floor(rng() * list.length)];
    const forbidden = new Set([s.answer, ...s.alsoOk]);
    const n = lv <= 1 ? 3 : 4;
    // s'il n'y a pas assez de mauvaises réponses sûres, on propose moins de choix
    const others = shuffle(allowed.filter((e) => !forbidden.has(e)), rng).slice(0, n - 1);
    return { situation: s, answer: s.answer, options: shuffle([s.answer, ...others], rng) };
  }

  // "Lina est joyeuse parce qu'elle reçoit un cadeau."
  function sentence(s, emotionKey) {
    const e = EMOTIONS[emotionKey];
    const verb = s.g === "f" ? e.f : e.m;
    const sep = /^[aeiouyéèêàh]/i.test(s.because) ? "parce qu'" : "parce que ";
    return `${s.who} ${verb} ${sep}${s.because}.`;
  }

  // "Est-ce que Lina est triste ?" / "Est-ce qu'Adam est triste ?"
  function isItQuestion(s, emotionKey) {
    const e = EMOTIONS[emotionKey];
    const que = /^[aeiouyéèêâîôh]/i.test(s.who) ? "est-ce qu'" : "est-ce que ";
    return `${que}${s.who} ${s.g === "f" ? e.f : e.m} ?`;
  }

  // ---------- Que ferais-tu ? ----------
  function choiceQuestion(rng = Math.random, avoidText = null) {
    const list = CHOICES.filter((c) => c.text !== avoidText);
    const c = list[Math.floor(rng() * list.length)];
    return { ...c, options: shuffle(c.options, rng) };
  }

  // ---------- Ma météo du jour : journal sur l'appareil ----------
  function todayKey(d = new Date()) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  // Les 7 derniers jours (du plus ancien au plus récent)
  function lastDays(journal, now = new Date()) {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const k = todayKey(d);
      out.push({ key: k, day: d.getDay(), entry: journal[k] || null });
    }
    return out;
  }

  return { EMOTIONS, LEVEL_EMOTIONS, SITUATIONS, CHOICES, faceQuestion, situationQuestion, situationsFor, sentence, isItQuestion, choiceQuestion, todayKey, lastDays };
});
