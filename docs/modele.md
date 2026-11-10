# Modèle — Pile

Pile met en relation un étudiant au Togo avec des stages et des jobs vérifiés. En V1, les structures n’ont pas de compte : l’opérateur saisit les offres. Le hackathon existe dans le type d’opportunité et s’affiche plus tard, sur la même table.

Cinq objets : étudiant, structure, opportunité, intérêt, signalement.

## Étudiant — `profiles`

Une ligne par compte, dans Neon Postgres. Le mot de passe est un hash, jamais affiché. Le WhatsApp est le contact réel. La connexion se fait par e-mail, sans SMS.

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | uuid | Clé |
| `email` | texte | Unique, obligatoire |
| `password_hash` | texte | Hash du mot de passe. Jamais renvoyé au navigateur |
| `role` | texte | `etudiant` ou `operateur`. Défaut : `etudiant` |
| `first_name` | texte | Obligatoire pour voir les offres |
| `phone` | texte | Optionnel |
| `whatsapp` | texte | Obligatoire, numéro joignable |
| `city` | texte | Ville de l’étudiant. V1 : `Lome`, `Kara`, `Sokode`, `Atakpame`, `Kpalime`, `Dapaong`, `Tsevie`, `autre` |
| `school` | texte | École ou université, saisie libre |
| `level` | texte | `l2`, `l3`, `master`, `jeune_diplome` |
| `domains` | texte[] | Au moins une filière |
| `skills` | texte[] | Quelques compétences, peut être vide |
| `looking_for` | texte[] | Sous-ensemble de `stage`, `job`. Au moins une valeur |
| `availability` | texte | Note libre : dates, temps plein, temps partiel |
| `cv_name` | texte | Nom du PDF, optionnel |
| `cv_data` | texte | PDF encodé, dans la même base. Plafond 5 Mo. Jamais inclus dans les listes |
| `created_at` | timestamptz | Défaut : maintenant |

Filières V1, mêmes valeurs pour l’étudiant et l’offre : `informatique`, `gestion`, `logistique`, `droit`, `marketing`, `finance`, `communication`.

Le profil est complet quand prénom, WhatsApp, ville, école, niveau, au moins une filière et au moins un type recherché sont remplis. Tant qu’il ne l’est pas, l’accueil renvoie vers le profil.

## Structure — `organizations`

Fiche, pas un utilisateur. Le compte structure arrive en phase 2, avec un `owner_id` ajouté à ce moment-là.

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | uuid | Clé |
| `name` | texte | Obligatoire |
| `city` | texte | Même liste que l’étudiant, plus `tout_le_togo` |
| `sector` | texte | Optionnel |
| `website` | texte | Optionnel |
| `created_at` | timestamptz | Défaut : maintenant |

Deux offres de la même entreprise partagent la même structure. Avant d’en créer une nouvelle, l’opérateur cherche le nom.

## Opportunité — `opportunities`

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | uuid | Clé |
| `organization_id` | uuid | Obligatoire, vers `organizations` |
| `type` | texte | `stage`, `job`, ou `hackathon`. La V1 publie `stage` et `job` |
| `title` | texte | Obligatoire |
| `description` | texte | Missions, en français, quelques paragraphes |
| `city` | texte | Ville de l’offre, ou `tout_le_togo` |
| `remote` | booléen | Vrai si le lieu n’est pas imposé. Défaut : faux |
| `domains` | texte[] | Au moins une filière de la liste V1 |
| `levels` | texte[] | Niveaux acceptés : `l2`, `l3`, `master`, `jeune_diplome`, `etudiant`, `licence`, `fin_etudes`, `debutant` |
| `paid` | texte | `oui`, `non`, `inconnu` |
| `compensation_note` | texte | Montant ou précision, optionnel. Ex. « 25 000 F / mois » |
| `duration` | texte | Ex. « 3 mois », « 1 mois pendant les vacances » |
| `start_date` | date | Optionnel |
| `deadline` | date | Optionnel. Passée, l’offre sort de « Pile pour toi » |
| `apply_mode` | texte | `lien`, `email`, `interet` |
| `apply_target` | texte | URL ou e-mail. Vide si `apply_mode = interet` |
| `status` | texte | `brouillon`, `publiee`, `pourvue`, `expiree` |
| `source` | texte | D’où vient l’offre : page, personne, message |
| `verified_at` | timestamptz | Dernière vérification par l’opérateur. Vide tant que ce n’est pas fait |
| `created_at` | timestamptz | Défaut : maintenant |

`levels` est une liste : une offre « L2 ou L3 » porte `l2` et `l3`. Les valeurs `etudiant`, `licence`, `fin_etudes` et `debutant` servent au matching, elles ne sont pas des niveaux de profil.

Statuts :

- `brouillon` — visible par l’opérateur seul.
- `publiee` — visible des étudiants, à condition que `verified_at` soit rempli.
- `pourvue` — retirée des listes, gardée pour l’historique.
- `expiree` — retirée des listes. Une `deadline` dépassée a le même effet sur l’accueil, même si le statut est encore `publiee`.

Une offre `publiee` sans `verified_at` ne s’affiche pas. Le badge « vérifiée le … » lit cette date.

Les colonnes propres au hackathon (thème, dates d’événement, lien d’inscription dédié) s’ajoutent en phase 3. Le type `hackathon` est déjà permis pour ne pas changer l’énumération plus tard.

## Intérêt — `interests`

Un étudiant et une opportunité, une seule fois.

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | uuid | Clé |
| `profile_id` | uuid | Vers `profiles` |
| `opportunity_id` | uuid | Vers `opportunities` |
| `status` | texte | `interesse`, puis `candidate` |
| `created_at` | timestamptz | Défaut : maintenant |
| `updated_at` | timestamptz | Mis à jour au changement de statut |

Contrainte unique sur (`profile_id`, `opportunity_id`).

`interesse` : il a ouvert le moyen de candidater, ou il veut que l’opérateur transmette son nom. `candidate` : il déclare avoir envoyé sa candidature. Pile ne voit pas la boîte mail de l’entreprise. Le passage à `candidate` est une déclaration de l’étudiant.

## Signalement et « pas pour moi » — `reports`

Une table, deux usages, distingués par `kind`.

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | uuid | Clé |
| `profile_id` | uuid | Vers `profiles` |
| `opportunity_id` | uuid | Vers `opportunities` |
| `kind` | texte | `pas_pour_moi` ou `signalement` |
| `reason` | texte | Voir les motifs ci-dessous |
| `note` | texte | Optionnel, une phrase |
| `created_at` | timestamptz | Défaut : maintenant |
| `resolved_at` | timestamptz | Rempli par l’opérateur quand c’est traité |

Motifs `pas_pour_moi` : `mauvaise_ville`, `mauvais_niveau`, `deja_pourvue`, `autre`. Ça sert à corriger le matching.

Motifs `signalement` : `demande_argent`, `offre_fausse`, `deja_pourvue`, `autre`. Ça sert à retirer une offre douteuse. Un signalement ouvert est un `signalement` dont `resolved_at` est vide.

## Fichiers

Le CV est un PDF d’au plus 5 Mo, stocké dans `profiles.cv_data`. L’étudiant lit et remplace le sien. L’opérateur peut le lire.

## Droits

L’étudiant connecté :

- lit et met à jour sa ligne `profiles`, sauf `role` et `password_hash` ;
- lit les opportunités `publiee` dont `verified_at` est rempli, et leur structure ;
- crée et met à jour ses `interests` et ses `reports`.

L’opérateur (`profiles.role = operateur`) écrit les structures, les opportunités et `resolved_at`. Les écrans `/admin` passent par le serveur Next.js, qui vérifie le rôle avant chaque écriture. La base Neon n’est pas exposée au navigateur.

Les offres `brouillon`, `pourvue` et `expiree` restent lisibles par l’opérateur et par l’étudiant qui a déjà un intérêt dessus (pour son suivi). Elles ne reviennent pas dans « Pile pour toi ».
