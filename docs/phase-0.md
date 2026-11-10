# Phase 0 — prouver Pile avant de coder

Pile ne s’écrit pas tant que des étudiants, à Lomé, n’ouvrent pas de vraies offres et ne disent pas avoir candidaté. Cette phase se fait dans un tableur et sur WhatsApp. Il n’y a pas de compte, pas de base Neon, pas de déploiement.

Coin : Lomé, une seule filière, les stages d’abord. La filière est **informatique**. On ne la change pas au milieu des 20 envois.

La feuille de travail est [docs/phase-0/offres.csv](phase-0/offres.csv) : 30 offres au format du modèle, toutes en `informatique`. Les structures, les liens et les e-mails sont inventés (`source` = `simulation`). Cette feuille sert à répéter les colonnes, les statuts et le tri. Elle ne compte pas dans les seuils, et elle ne s’envoie pas aux étudiants. Les 30 offres qui déclenchent le code sont de vraies offres, avec une vraie source et une vraie date de vérification.

## Deux feuilles

**Offres.** Une ligne par stage ou job. Colonnes, dans l’ordre du modèle :

`titre`, `structure`, `ville_structure`, `secteur`, `type` (`stage` ou `job`), `description`, `ville` (ou `tout_le_togo`), `remote` (`oui` / `non`), `filieres`, `niveaux`, `remunere` (`oui` / `non` / `inconnu`), `note_remuneration`, `duree`, `date_debut`, `date_limite`, `mode` (`lien` / `email` / `interet`), `cible`, `source`, `verifie_le`, `statut` (`brouillon` / `publiee` / `pourvue` / `expiree`).

Une offre passe à `publiee` seulement si `verifie_le` est rempli et si tu sais dire d’où elle vient. Vérifier, c’est l’un de ces trois gestes : la lire sur une page officielle de la structure ou de l’école, l’obtenir d’une personne de la structure, ou confirmer par message qu’elle est encore ouverte. Une capture WhatsApp sans date et sans nom de structure reste en `brouillon`.

Vise environ 30 offres `publiee`, dont une majorité de stages dans la filière choisie, à Lomé ou remote. Une offre dont la date limite est passée passe en `expiree` et ne part pas aux étudiants.

**Etudiants.** Une ligne par personne. Colonnes : `prenom`, `whatsapp`, `ecole`, `niveau` (`l2`, `l3`, `master`, `jeune_diplome`), `filiere`, `cherche` (`stage`, `job`, ou les deux), `ville`.

Vingt étudiants, la même filière, recrutés par ton réseau d’amphi ou un groupe de promo. Tu leur dis le cadre en une phrase : tu leur envoies des stages vérifiés, c’est gratuit, tu leur demandes ensuite s’ils ont ouvert et candidaté. Tu ne leur promets pas que la structure va répondre.

## L’envoi

Pour chaque étudiant, applique les filtres de `docs/matching.md` à la main sur les offres `publiee` :

- ville Lomé, ou remote, ou tout le Togo ;
- le type est dans ce qu’il cherche ;
- la filière se chevauche ;
- le niveau est compatible.

Tu lui envoies au plus 5 offres, les plus fraîches d’abord (vérifiées depuis moins de 14 jours, rémunération connue de préférence). S’il n’y en a pas 5, tu envoies ce qu’il y a. Tu ne complètes pas avec des offres hors filtre pour « faire un message plein ».

Message type :

> Salut {prénom}. Je teste Pile : des stages vérifiés, pile pour ton niveau. Voici {n} offre(s) pour toi ({filière}, {niveau}, Lomé). C’est gratuit, personne ne doit te demander d’argent. Dis-moi pour chacune : ouvert / pas ouvert, et si tu as candidaté.

Sous le texte, une offre = quatre lignes : titre, structure, « Lomé · stage · {niveau} · {filière} · vérifiée le {date} », rémunération, puis le lien ou l’adresse où candidater.

Tu notes l’envoi : date, nombre d’offres, quels identifiants de lignes.

## Ce que tu notes au retour

Une troisième feuille, **Retours**. Une ligne par étudiant et par offre envoyée :

`etudiant`, `offre`, `envoye_le`, `ouvert` (`oui` / `non` / `sans_reponse`), `candidate` (`oui` / `non` / `sans_reponse`), `pas_pour_moi` (vide, ou `mauvaise_ville`, `mauvais_niveau`, `deja_pourvue`, `autre`).

Relance une fois, au bout de trois jours, ceux qui n’ont pas répondu. `sans_reponse` après cette relance compte comme non ouvert et non candidaté. Tu ne relances pas une deuxième fois.

## Seuils

On code la phase 1 seulement si les deux chiffres sont atteints, sur les 20 étudiants :

- au moins 8 ont ouvert au moins une offre ;
- au moins 4 disent avoir candidaté à au moins une offre.

En dessous, on ne change pas la stack et on n’ouvre pas le dépôt applicatif. On regarde les motifs. Beaucoup de `deja_pourvue` : les offres ne sont pas assez fraîches, on en vérifie d’autres. Beaucoup de `mauvais_niveau` ou de silence sur une filière : on recommence les 20 sur l’autre filière du coin de départ. Moins de 30 offres publiées au moment des envois : le test ne compte pas, on finit la feuille Offres d’abord.

Au-dessus des seuils, la matière de la phase 2 est déjà là : les offres qui ont au moins deux `candidate` sont celles avec lesquelles tu peux aller voir la structure (« voici N étudiants intéressés »). On ne crée pas le compte structure pour autant. Ça reste une conversation, pas un écran.

## Ce que cette phase ne fait pas

Pas de page web, pas de nom de domaine, pas de formulaire public, pas de groupe WhatsApp ouvert où n’importe qui poste une annonce. Les 20 messages partent de toi, un par un. Le nom Pile peut être dit à l’oral. `pile.tg`, Instagram et le nom d’affichage WhatsApp se vérifient avant qu’un lien public existe, pas avant ce test.
