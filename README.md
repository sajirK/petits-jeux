# 🎈 Les Petits Jeux

👉 **Jouer en ligne : https://sajirk.github.io/petits-jeux/**

Des petits jeux pour les enfants de 3 à 8 ans : lire, compter, réfléchir, les émotions, découvrir et créer.
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

Les jeux sont rangés par **compétence** et par **âge** (3 à 8 ans). L’enfant choisit son âge dans « ✏️ Moi » ; chaque jour, **Plume la chouette** propose une *aventure du jour* de 3 jeux (une compétence différente pour chacun). Jouer gagne des étoiles, et les étoiles remplissent un **album de 48 autocollants**.

### 📖 Lire

| Jeu | Âge | Dossier |
|---|---|---|
| ✍️ J'écris | 3-7 ans | `games/tracer` |
| 🪄 Les syllabes magiques | 5 ans et + | `games/syllabes` |
| 🅰️ La Première Lettre | 4-7 ans | `games/premiere-lettre` |
| 🔤 Les Lettres | 4-7 ans | `games/lettres` |

### 🔢 Compter

| Jeu | Âge | Dossier |
|---|---|---|
| 🥐 La Boulangerie des nombres | 4 ans et + | `games/boulangerie` |
| 🔢 Je compte | 3-5 ans | `games/compter` |
| 🧱 La Tour des Nombres | 4-7 ans | `games/tours` |
| ➕ Les Calculs malins | 5 ans et + | `games/calcul` |
| 🍕 La Pizzeria | 4-7 ans | `games/pizzeria` |

### 🧩 Réfléchir

| Jeu | Âge | Dossier |
|---|---|---|
| 🐶 Memory des animaux | 3-7 ans | `games/memoire` |
| 🧩 Les Suites logiques | 4 ans et + | `games/suites` |
| 🔎 Trouve l'intrus | 4-7 ans | `games/intrus` |
| 🎵 La Mémoire Musicale | 4 ans et + | `games/melodie` |
| 🤖 Le Petit Robot | 5 ans et + | `games/robot` |
| 🍦 Le Glacier | 4-7 ans | `games/glacier` |

### 💛 Mes émotions

| Jeu | Âge | Dossier |
|---|---|---|
| 😊 Devine l'émotion | 3-6 ans | `games/emotion-visage` |
| 🎈 Respire avec moi | 3 ans et + | `games/respire` |
| 🌤️ Ma météo du jour | 3 ans et + | `games/meteo` |
| 🤔 Les histoires d'émotions | 4-7 ans | `games/emotion-situations` |
| 🤝 Que ferais-tu ? | 4 ans et + | `games/que-faire` |

### 🌍 Découvrir

| Jeu | Âge | Dossier |
|---|---|---|
| 🌈 Les Couleurs | 3-5 ans | `games/couleurs` |
| 🔺 Les Formes | 3-5 ans | `games/formes` |
| 🩺 Le Docteur des animaux | 3-7 ans | `games/docteur` |

### ⚡ Agilité

| Jeu | Âge | Dossier |
|---|---|---|
| 🫧 Les Bulles | 3-5 ans | `games/bulles` |
| 🐹 Tape la Taupe | 3-6 ans | `games/taupe` |
| 🍉 Tranche les Fruits | 4 ans et + | `games/fruits` |
| ⚡ Réflexe Éclair | 4 ans et + | `games/reflexe` |
| 🦕 Super Saut Dino | 4 ans et + | `games/dino` |
| 💎 Le Château Magique | 4 ans et + | `games/tresors` |
| 🚀 Course de Bulles | 4 ans et + | `games/course` |

### 🎨 Créer

| Jeu | Âge | Dossier |
|---|---|---|
| 🖍️ Je dessine | 3 ans et + | `games/dessin` |
| 🎹 Le Piano rigolo | 3 ans et + | `games/piano` |

## Tests

La logique des jeux « Je suis malin » et le contenu de « Mes émotions » (questions, bonnes réponses, phrases, aucune réponse ambiguë) sont testés automatiquement :

```bash
node --test tests/*.test.js
```

## Ajouter un jeu

1. Créer `games/<id>/index.html` (copier un jeu existant comme modèle).
2. Inclure `../../css/common.css` et `../../js/common.js`, puis appeler `Jeux.addHomeButton()`.
3. Ajouter une ligne dans `js/games.js` avec sa compétence (`skill`) et ses âges (`ages: [min, max]`). Les tests vérifient que la page existe.

Outils dispo dans `window.Jeux` : `sounds` (pop, success, wrong, win, tone), `say(texte)` (voix française),
`bravo(texte)` (félicite l'enfant par son prénom), `confetti()`, `addStars(n)` / `getStars()` (étoiles gardées sur l'appareil),
`shuffle()`, `pick()`.

## Héberger gratuitement

Le site est 100 % statique (HTML/CSS/JS). Il est publié avec GitHub Pages : chaque `git push` sur `main` met le site à jour en une ou deux minutes.
