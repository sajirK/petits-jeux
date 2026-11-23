# Règles pour chaque jeu (V2) — à respecter pour tous les jeux, existants et futurs

Ces règles sont **vérifiées automatiquement** par `tests/conformite.test.js` : `npm test` échoue si un jeu ne les respecte pas.

## 1. Structure

```
games/<id>/
  logic.js     ← OBLIGATOIRE : exporte LEVELS (4 niveaux) ou FREE = true, + la logique pure du jeu
  index.html   ← la page : utilise Kit.game({ id: "<id>", levels: XLogic.LEVELS, … })
tests/<id>.test.js ou un fichier de tests commun ← la logique qui décide "juste / faux" est testée
```

La page charge, dans cet ordre : `css/common.css`, `css/tokens.css`, `css/kit.css`, puis `js/common.js`, `js/kit/levels.js`, `js/kit/kit.js`, `logic.js`.
Elle n'utilise plus les anciens outils V1 (`Jeux.addHomeButton`, `Jeux.progress`, `Jeux.levelBadge`).

## 2. Quatre niveaux, toujours

| | 🟢 Facile ⭐ | 🟡 Moyen ⭐⭐ | 🔴 Difficile ⭐⭐⭐ | 🟣 Expert 👑 |
|---|---|---|---|---|
| Pour qui | 3-4 ans | 5 ans | 6-7 ans | 7-8 ans et les champions |
| Principe | peu de choix, grosses cibles, aides visibles, pas de temps | choix normaux, aide si on hésite | plus de choix, pièges, parfois du temps | le plus de choix, de vitesse et de longueur ; plus d'aide visible |

- `LEVELS = { 1: {rounds, …}, 2: {…}, 3: {…}, 4: {…} }` : chaque niveau a au moins `rounds` (≥ 1).
- La difficulté monte vraiment d'un niveau à l'autre (plus de choix, plus de défis, moins d'aide).
- Le niveau est choisi par l'enfant (Facile par défaut, mémorisé). Il ne change jamais tout seul :
  après une partie parfaite, Plume **propose** le niveau suivant.
- Seuls les jeux **libres** (dessin, musique…) peuvent ne pas avoir de niveaux : `FREE = true`.

## 3. Chaque jeu a une fin

- **Manches** (`mode: "rounds"`, par défaut) : `rounds` défis, puis l'écran de victoire.
- **Arcade** (`mode: "arcade"`) : une partie chronométrée ou un parcours ; le jeu appelle `round.end({ errors, text })`.
- **Libre** (`mode: "free"`) : bouton ✅ « J'ai fini » → écran de victoire.
- Étoiles : ⭐⭐⭐ sans erreur, ⭐⭐ 1-2 erreurs, ⭐ au-delà (on gagne toujours).

## 4. Zéro lecture nécessaire

- La consigne est **dite** (`instruction`), réécoutable avec 🔊, et redite si l'enfant ne fait rien (avec la main 👆 qui montre).
- La consigne est aussi **montrée** (image, couleur, objet qui brille…). Le texte à l'écran est court et secondaire.
- Une erreur n'est jamais punitive : petit son doux, l'objet bouge, un indice ; après 2 erreurs la main montre.

## 5. Toucher et robustesse

- Cibles tactiles ≥ **64 px** (`--tap-min`), même sur téléphone.
- Glisser-déposer quand c'est naturel (poser, ranger, assembler).
- Boucles, minuteries et animations passent par `round.loop / round.timeout / round.interval / round.onCleanup`
  pour s'arrêter proprement quand on change de niveau ou que la partie se termine.
- Aucune erreur JS, aucune page qui déborde (testé sur téléphone, iPad portrait et paysage, PC).

## 6. Testé de bout en bout par le robot

- Le jeu déclare son aide avec `round.setHintTarget(...)` : l'élément à toucher, `{ from, to }` pour un glisser,
  `{ swipe }` / `{ auto() }` pour les jeux d'action. C'est la main 👆 pour l'enfant, et le chemin du robot de test.
- `tests/e2e/robot.js` (dans le navigateur, depuis l'accueil) joue chaque jeu aux 4 niveaux en suivant cette aide :
  ```js
  const s = document.createElement("script"); s.src = "/tests/e2e/robot.js"; document.head.appendChild(s);
  robot(["mon-jeu"]).then(console.log)   // attendu : "fin ⭐3 … erreurs=0" pour chaque niveau
  ```
- Un jeu qui ne finit pas avec le robot a un bug (aide fausse, niveau impossible, fin qui ne vient jamais).

## 7. Contenu juste

- Ce que le jeu enseigne doit être vrai (faits, orthographe, calculs, sens des lettres…), et testé.
- Une réponse qui pourrait aussi être juste n'est jamais comptée fausse.
- Bon français, accords (garçon/fille), voix française.

## 8. Publication

- Travailler sur une branche, `npm test` doit passer, puis `npm run release -- x.y.z "note"` (version, journal, tag).
