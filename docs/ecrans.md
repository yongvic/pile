# Écrans — Pile

Une application Next.js (App Router), TypeScript, Tailwind, sur Vercel. L’étudiant et l’opérateur sont dans le même projet. Le français est la seule langue. L’écran est pensé pour un téléphone : une colonne, actions en bas de la fiche, texte court.

Pas de messagerie, pas de paiement, pas de fil. La candidature part vers le lien ou l’e-mail de la structure.

## Compte

`/connexion` — e-mail, mot de passe, lien vers l’inscription. Erreur en une phrase si les identifiants ne passent pas.

`/inscription` — e-mail, mot de passe, confirmation. À la création du compte Auth, une ligne `profiles` est créée avec `role = etudiant`. Suite immédiate : `/profil`.

Mot de passe oublié : page `/connexion/nouveau-mot-de-passe`. L’envoi d’e-mail n’est pas branché en V1 : le compte se crée avec un mot de passe choisi à l’inscription.

Un profil incomplet qui ouvre `/` ou `/offres/[id]` est renvoyé vers `/profil`. La bannière dit : « Encore quelques infos pour voir les offres, pile pour toi. »

## Profil — `/profil`

Champs, dans cet ordre : prénom, WhatsApp, téléphone, ville, école, niveau, filières (plusieurs), compétences (texte libre, séparé par des virgules, stocké en liste), ce qu’il cherche (stage, job, ou les deux), disponibilité, CV.

Le CV est un PDF. On peut le remplacer. On peut enregistrer sans CV.

Bouton : « Voir les offres ». Il n’est actif que si le profil est complet.

## Accueil — `/`

Titre : « Pile pour toi. »

Bloc 1, **Pile pour toi.** Cartes des offres qui passent les filtres durs, dans l’ordre du score. Si la liste est vide : « Rien pile pour toi cette semaine. Tu peux parcourir le catalogue, ou élargir ce que tu cherches dans ton profil. » Lien vers `/profil` et vers le catalogue sur la même page.

Bloc 2, **Catalogue.** Filtres : ville, type, filière, rémunération. Cartes du reste des offres éligibles.

Chaque carte : titre, nom de la structure, phrase de matching, pastille de rémunération, date limite si elle existe. Toute la carte ouvre `/offres/[id]`.

En-tête : prénom, lien « Profil », lien « Mes intérêts ».

## Fiche — `/offres/[id]`

- Titre, structure, phrase de matching.
- Pastilles : rémunération (et la note si elle existe), durée, date de début, date limite.
- Badge « Vérifiée le {date} ».
- Description des missions.
- Source non affichée. Elle reste dans le back-office.

Action principale, selon `apply_mode` :

- `lien` — « Candidater ». Ouvre `apply_target` dans un nouvel onglet et crée ou met à jour l’intérêt en `interesse`.
- `email` — « Écrire ». Ouvre `mailto:` avec l’objet « Candidature — {titre} » et fait passer l’intérêt à `interesse`.
- `interet` — « Je suis intéressé ». Pas de lien externe. Crée l’intérêt en `interesse`. Texte : « Pile transmet ton intérêt. La structure n’a pas encore de compte ici. »

Action suivante, une fois `interesse` : « J’ai candidaté ». Passe le statut à `candidate`. Elle est absente quand `apply_mode = interet`, puisqu’il n’y a rien à envoyer soi-même.

« Pas pour moi » ouvre les motifs `mauvaise_ville`, `mauvais_niveau`, `deja_pourvue`, `autre`, puis revient à l’accueil. L’offre ne réapparaît pas pour lui.

« Signaler » ouvre les motifs `demande_argent`, `offre_fausse`, `deja_pourvue`, `autre`, plus une note optionnelle. Texte sous le bouton : « Pile ne demande jamais d’argent. »

Offre introuvable, pourvue, expirée ou plus publiée : « Cette offre n’est plus en ligne. » Lien vers l’accueil. Exception : s’il a déjà un intérêt, la fiche reste lisible, avec le statut « pourvue » ou « expirée », sans bouton candidater.

Partage : le lien de la fiche se copie. C’est le canal WhatsApp de la V1. Pas de bouton qui ouvre WhatsApp avec un texte imposé.

## Mes intérêts — `/interets`

Deux groupes : « À envoyer » (`interesse`) et « Envoyées » (`candidate`). Chaque ligne : titre, structure, phrase, statut de l’offre s’il n’est plus `publiee`. Lien vers la fiche.

Liste vide : « Tu n’as pas encore marqué d’offre. » Lien vers l’accueil.

## Back-office

Toutes les routes `/admin` vérifient `profiles.role = operateur` côté serveur. Un étudiant qui tape l’URL reçoit 404. Le premier opérateur est l’e-mail listé dans `OPERATOR_EMAILS` : à la connexion, son rôle passe à `operateur`. Il n’y a pas d’écran d’invitation en V1.

`/admin` — trois compteurs : offres `publiee`, intérêts créés depuis 7 jours, signalements dont `resolved_at` est vide. Listes courtes : signalements ouverts, offres dont la date limite est dans moins de 7 jours.

`/admin/offres` — tableau : titre, structure, type, statut, date de vérification, nombre d’intérêts. Filtres par statut. Bouton « Nouvelle offre ».

`/admin/offres/nouvelle` et `/admin/offres/[id]` — formulaire de tous les champs d’opportunité. La structure se choisit dans la liste ou se crée sur place (nom, ville, secteur, site). Boutons de statut : enregistrer en brouillon, publier, marquer pourvue, marquer expirée. Publier exige `verified_at`, une structure, un titre, une description, au moins une filière, au moins un niveau, un type, une ville ou remote, et un mode de candidature cohérent (`apply_target` rempli si lien ou e-mail). La publication écrit `verified_at` à l’instant présent si le champ est vide. « J’ai revérifié » remet `verified_at` à maintenant sans changer le reste.

`/admin/structures` — nom, ville, nombre d’offres. Création et édition. Pas de suppression s’il reste une offre rattachée.

`/admin/etudiants` — prénom, école, ville, niveau, filières, WhatsApp, profil complet ou non, nombre d’intérêts. Le CV s’ouvre si `cv_path` est rempli. Pas d’édition du profil par l’opérateur.

`/admin/interets` — filtre par offre. Colonnes : étudiant, WhatsApp, école, niveau, statut de l’intérêt, date. C’est la liste à montrer à une structure.

`/admin/signalements` — kind, motif, note, offre, étudiant, date. « Traiter » écrit `resolved_at`. Depuis cette ligne, lien vers l’offre pour la passer en `expiree` ou la corriger. Les `pas_pour_moi` apparaissent ici aussi, filtrables, pour voir si une règle dérape.

## États vides et erreurs

- Aucune offre publiée dans toute la base : l’accueil étudiant dit « Les premières offres arrivent. » Pas de fausse carte.
- Réseau coupé au moment d’un intérêt : le bouton reste, message « Pas enregistré. Réessaie. » On ne marque pas `candidate` sans réponse du serveur.
- Formulaire admin incomplet : les champs manquants sont nommés sous le bouton Publier.

## Hors V1

Récap e-mail des nouvelles offres, compte structure, fiche hackathon, application à installer. Le lien de fiche reste la seule alerte : l’opérateur peut coller ce lien dans WhatsApp.
