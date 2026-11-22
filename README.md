# 🎈 Les Petits Jeux

👉 **Jouer en ligne : https://sajirk.github.io/petits-jeux/**

Des petits jeux pour les enfants (dès 4-5 ans) : réfléchir, apprendre, rire et créer.
Jouables sur tablette, téléphone et ordinateur, au doigt ou à la souris, avec une voix en français.

Au premier lancement, l'enfant écrit **son prénom** et choisit un animal : les jeux l'appellent ensuite par son prénom.
Tout reste sur l'appareil (aucun compte, aucune donnée envoyée).
Aucune dépendance : HTML/CSS/JS pur + un mini serveur Node.

## Lancer à la maison

Aucune installation : il faut juste [Node.js](https://nodejs.org).

```bash
node server.js
```

Le terminal affiche l'adresse à ouvrir sur la tablette ou le téléphone (même Wi-Fi).
Sur iPad / iPhone : Safari → Partager → **Sur l'écran d'accueil** pour l'avoir comme une appli en plein écran.

## Les jeux

| Jeu | Catégorie | Dossier |
|---|---|---|
| 😊 Devine l'émotion | Mes émotions (reconnaître) | `games/emotion-visage` |
| 🤔 Les histoires d'émotions | Mes émotions (comprendre) | `games/emotion-situations` |
| 🤝 Que ferais-tu ? | Mes émotions (empathie) | `games/que-faire` |
| 🎈 Respire avec moi | Mes émotions (se calmer) | `games/respire` |
| 🌤️ Ma météo du jour | Mes émotions (dire ce qu'on ressent) | `games/meteo` |
| 🤖 Le Petit Robot | Je suis malin (programmer) | `games/robot` |
| 🧩 Les Suites logiques | Je suis malin (logique) | `games/suites` |
| 🔎 Trouve l'intrus | Je suis malin (catégories) | `games/intrus` |
| ➕ Les Calculs malins | Je suis malin (calcul) | `games/calcul` |
| 🅰️ La Première Lettre | Je suis malin (lecture) | `games/premiere-lettre` |
| 🎵 La Mémoire Musicale | Je suis malin (mémoire) | `games/melodie` |
| ⚡ Réflexe Éclair | Je suis malin (réflexes) | `games/reflexe` |
| 🦕 Super Saut Dino | Aventure (plateforme) | `games/dino` |
| 💎 Le Château Magique | Aventure (labyrinthe) | `games/tresors` |
| 🚀 Course de Bulles | Aventure (course) | `games/course` |
| 🍉 Tranche les Fruits | Rigolo | `games/fruits` |
| 🍕 La Pizzeria | Cuisine | `games/pizzeria` |
| 🍦 Le Glacier | Cuisine | `games/glacier` |
| 🩺 Le Docteur des animaux | Aventure | `games/docteur` |
| 🫧 Les Bulles | Rigolo | `games/bulles` |
| 🐹 Tape la Taupe | Rigolo | `games/taupe` |
| 🐶 Memory des animaux | J'apprends | `games/memoire` |
| 🔢 Je compte | J'apprends | `games/compter` |
| 🌈 Les Couleurs | J'apprends | `games/couleurs` |
| 🔤 Les Lettres | J'apprends | `games/lettres` |
| 🧱 La Tour des Nombres | J'apprends | `games/tours` |
| 🔺 Les Formes | J'apprends | `games/formes` |
| 🖍️ Je dessine | Créatif | `games/dessin` |
| 🎹 Le Piano rigolo | Créatif | `games/piano` |

## Tests

La logique des jeux « Je suis malin » et le contenu de « Mes émotions » (questions, bonnes réponses, phrases, aucune réponse ambiguë) sont testés automatiquement :

```bash
node --test tests/*.test.js
```

## Ajouter un jeu

1. Créer `games/<id>/index.html` (copier un jeu existant comme modèle).
2. Inclure `../../css/common.css` et `../../js/common.js`, puis appeler `Jeux.addHomeButton()`.
3. Ajouter une ligne dans `js/games.js`.

Outils dispo dans `window.Jeux` : `sounds` (pop, success, wrong, win, tone), `say(texte)` (voix française),
`bravo(texte)` (félicite l'enfant par son prénom), `confetti()`, `addStars(n)` / `getStars()` (étoiles gardées sur l'appareil),
`shuffle()`, `pick()`.

## Héberger gratuitement

Le site est 100 % statique (HTML/CSS/JS). Il est publié avec GitHub Pages : chaque `git push` sur `main` met le site à jour en une ou deux minutes.
