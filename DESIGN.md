# Design

## Register

product

## Scene

Téléphone tenu à bout de bras, en lumière du jour, une main. Le fond reste clair. Le vert n’existe que pour l’action principale et pour « rémunéré ». Le mot Pile, en serif, est la seule marque. Le reste est une sans-serif de travail.

## Color

Strategy: restrained. Existing brand kept.

- paper `#f3efe4` : fond, lumière du jour
- card `#fffdf8` : champs
- ink `#1c1915` : texte
- muted `#4a433a` : métadonnées, assombri pour le soleil (l’ancien `#6d6458` passait tout juste)
- line `#ddd4c4` : séparateurs de liste
- green `#0e6b52` : action principale, lien, rémunération connue positive
- green-soft `#e7f4ef` : fond de la pastille « rémunéré » seulement
- clay `#8d3b2c` : erreur, toujours avec une phrase
- sand `#efe6d4` : bandeau d’aperçu et squelette de chargement

Le vert ne colore pas « non rémunéré » ni « non précisée ». Ces états sont du texte.

## Typography

- Outfit pour tout le travail, y compris les titres d’écran.
- Fraunces uniquement pour le mot « Pile ».
- Titre d’écran : 1.875rem, semibold, sans.
- Titre de ligne : 1rem, medium.
- Corps : 1rem. Les champs restent à 1rem même dans un libellé plus petit, pour éviter le zoom au focus sur iPhone.
- Méta : 0.875rem, couleur muted.
- Chiffres de compteur : tabular-nums.

## Spacing and shape

Rythme 4 / 8 / 12 / 16 / 24. Page étudiante max 32rem, une colonne. Back-office max 64rem, formulaire max 40rem. Rayon 8px sur les champs, pilule sur les boutons. Les offres sont des lignes séparées, pas des cartes. Élévation : aucune ombre portée. La barre d’action et la navigation basse ont une bordure haute.

## Components

- `buttonClass` : action principale
- `quietButtonClass` : action secondaire
- `inputClass` : champ, 44px de haut
- `labelClass` : libellé au-dessus du champ
- `OfferCard` : une ligne d’offre
- `OfferList` : la même liste, avec recherche de titre à partir de 8 lignes
- `OfferPanel` : action de candidature, état, motifs
- `Header` / `AdminNav` : endroit courant souligné, pas seulement coloré
- `StructureReading` : liste couverte, sans chrome opérateur
- `CopyLink`, `OfflineNote`

## Motion

Appui : scale 0.98, 120ms, ease-out. Rien d’autre. `prefers-reduced-motion` retire transform et animation.

## Z-index

nav 20, barre d’action 30, lecture structure 40, lien d’évitement 50.
