# Matching — Pile

L’accueil a deux listes.

**Pile pour toi** ne contient que les offres qui passent les filtres durs, triées par le score. **Le catalogue** contient les autres offres publiées et vérifiées, avec des filtres manuels : ville, type, filière, rémunération.

Le score ne s’affiche pas. Il ne sert qu’à l’ordre. La carte et la fiche montrent une phrase.

## Offre éligible

Une offre entre dans le calcul si :

- `status = publiee` ;
- `verified_at` est rempli ;
- `type` vaut `stage` ou `job` ;
- `deadline` est vide ou encore à venir.

Le profil doit être complet (voir `docs/modele.md`). Sinon il n’y a pas de liste, l’étudiant finit son profil.

## Filtres durs de « Pile pour toi »

Les quatre conditions sont obligatoires.

1. **Lieu.** `opportunities.city` est la ville de l’étudiant, ou `tout_le_togo`, ou `remote` est vrai.
2. **Type.** `opportunities.type` est dans `profiles.looking_for`.
3. **Filière.** L’intersection de `opportunities.domains` et `profiles.domains` n’est pas vide.
4. **Niveau.** Au moins une valeur de `opportunities.levels` est compatible avec `profiles.level`, selon le tableau ci-dessous.

| Niveau du profil | Valeurs d’offre compatibles |
| --- | --- |
| `l2` | `l2`, `etudiant` |
| `l3` | `l2`, `l3`, `licence`, `etudiant` |
| `master` | `l3`, `master`, `fin_etudes`, `licence` |
| `jeune_diplome` | `jeune_diplome`, `master`, `fin_etudes`, `debutant` |

Une offre « exactement L3 » pour un étudiant en L2 ne passe pas. Une offre « L2 ou L3 » (`levels` contient les deux) passe pour les deux profils.

## Score

On additionne, puis on trie du plus haut au plus bas.

| Condition | Points |
| --- | --- |
| Ville exacte | 3 |
| Remote ou `tout_le_togo` | 2 |
| Au moins une filière en commun | 3 |
| Le niveau du profil est cité tel quel dans `levels` | 2 |
| Le niveau est seulement compatible, pas cité tel quel | 1 |
| `paid` vaut `oui` ou `non` | 1 |
| `verified_at` date de moins de 14 jours | 1 |

À score égal, l’offre vérifiée le plus récemment vient en premier. Si c’est encore égal, celle dont la date limite est la plus proche vient en premier. Une offre sans date limite passe après celles qui en ont une.

Le maximum est 10. Personne ne le voit.

## Phrase affichée

Une ligne, dans cet ordre, séparée par « · » :

1. Ville lisible, ou « Remote », ou « Tout le Togo ».
2. « stage » ou « job ».
3. Niveau lisible. S’il y en a plusieurs : « licence 2 ou licence 3 », « licence », « fin d’études », « jeune diplômé », « débutant ».
4. Filières en commun avec le profil, libellés en français. S’il n’y en a pas (catalogue seulement) : les filières de l’offre.
5. « vérifiée le {jour mois} », à partir de `verified_at`.

Exemple : « Lomé · stage · licence 3 · informatique · vérifiée le 12 mars ».

Libellés de ville : Lomé, Kara, Sokodé, Atakpamé, Kpalimé, Dapaong, Tsévié. La valeur stockée reste sans accent (`Lome`, `Sokode`, …).

Rémunération, à part sur la carte, en une pastille : « rémunéré », « non rémunéré », « rémunération non précisée ». Ce n’est pas dans la phrase de matching.

## Catalogue

Le catalogue reprend les offres éligibles qui ne sont pas dans « Pile pour toi ». Les filtres manuels réduisent cette liste. Ils ne réparent pas un profil incomplet.

Filtre ville : la ville choisie, plus les offres `tout_le_togo` et remote. Filtre type : `stage` ou `job`. Filtre filière : intersection non vide. Filtre rémunération : `oui`, `non`, ou les deux.

L’ordre du catalogue est la date de vérification, la plus récente d’abord.

## Pas pour moi

Le bouton enregistre un `reports` de kind `pas_pour_moi`. L’offre disparaît de « Pile pour toi » et du catalogue pour cet étudiant. Elle reste comptée côté opérateur.

Motifs : `mauvaise_ville`, `mauvais_niveau`, `deja_pourvue`, `autre`.

Si plusieurs étudiants d’un même niveau écartent la même offre pour `mauvais_niveau`, la liste `levels` de l’offre est trop large. Si le motif dominant est `deja_pourvue`, l’opérateur passe l’offre en `pourvue`. On ne change pas la formule tant qu’une filière n’a pas au moins vingt retours.

## Exemples

**Awa, Lomé, L3, informatique, cherche un stage.**

- Stage informatique à Lomé pour L3, vérifié il y a 3 jours, rémunéré : dans « Pile pour toi ». Ville 3 + filière 3 + niveau exact 2 + rémunération 1 + fraîcheur 1 = 10.
- Stage informatique remote pour « étudiant », non rémunéré, vérifié il y a 3 jours : dans « Pile pour toi ». Remote 2 + filière 3 + niveau compatible 1 + rémunération 1 + fraîcheur 1 = 8. Il passe après le premier.
- Stage gestion à Lomé pour L3 : filière vide, catalogue seulement.
- Job informatique à Lomé pour débutant : elle cherche un stage, pas un job. Catalogue seulement.
- Stage informatique à Kara pour L3 : ville incompatible et pas remote. Catalogue seulement.

**Kodjo, Kara, jeune diplômé, gestion, cherche un job.**

- Job gestion « tout le Togo » pour jeune diplômé : dans « Pile pour toi ». Tout le Togo 2 + filière 3 + niveau exact 2.
- Stage gestion à Kara pour Master : il ne cherche pas de stage. Catalogue seulement.

## Où ça vit

Une fonction Postgres, appelée par le serveur Next.js avec l’identifiant de l’étudiant, retourne les deux listes déjà triées et la phrase. L’écran n’additionne pas les points. Les offres écartées par « pas pour moi » sont exclues dans cette fonction.
