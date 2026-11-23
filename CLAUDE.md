# Les Petits Jeux

Site de jeux éducatifs pour enfants de 3 à 8 ans (surtout 5 ans, qui ne savent pas lire), en français,
sans dépendance (HTML/CSS/JS), publié sur GitHub Pages.

## Règles obligatoires pour tout jeu (nouveau ou modifié)

Lire et appliquer **docs/REGLES-JEUX.md** : kit V2 (`Kit.game`), 4 niveaux (Facile, Moyen, Difficile, Expert) dans `games/<id>/logic.js`,
une vraie fin, zéro lecture nécessaire, cibles ≥ 64 px, logique testée. `npm test` vérifie ces règles.

## Commandes

- `node server.js` : lance le site sur le réseau local
- `npm test` : tous les tests (logique, contenu, conformité des jeux)
- `npm run release -- x.y.z "note"` : nouvelle version (version.js, CHANGELOG, ?v= sur les fichiers, tag git)

## Repères

- `js/kit/kit.js` + `js/kit/levels.js` + `css/kit.css` + `css/tokens.css` : socle commun V2
- `js/common.js` : sons, voix, prénom, étoiles, autocollants
- `js/games.js` : liste des jeux (compétence + âges) ; `js/parcours.js` : aventure du jour, album
- Ne jamais écrire le prénom d'un enfant en dur : il est saisi sur l'accueil (`jeux.prenom`).
