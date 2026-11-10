# Pile

Pile relie un étudiant au Togo à des stages et des jobs vérifiés. L’opérateur saisit les offres. L’étudiant complète son profil, lit celles qui correspondent à sa ville, son niveau et sa filière, ouvre le moyen de candidater, puis déclare s’il a envoyé.

La structure n’a pas de compte. La candidature part vers son lien ou son e-mail.

## Lancer

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sans `DATABASE_URL`, l’application s’ouvre en aperçu : offres d’exemple, pas de création de compte. Avec une base Neon, les comptes et les écritures sont réels.

## Variables

| Nom | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion Neon Postgres |
| `AUTH_SECRET` | Signature de la session |
| `OPERATOR_EMAILS` | E-mails qui deviennent opérateur à la connexion, séparés par des virgules |

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur local |
| `npm run migrate` | Crée le schéma dans Neon |
| `npm run seed` | Charge les offres d’exemple |
| `npm run check` | Vérifie le tri sur la feuille d’exemple |
| `npm run build` | Build de production |

## Documentation

- [Modèle](docs/modele.md) : étudiant, structure, offre, intérêt, signalement
- [Écrans](docs/ecrans.md) : parcours étudiant et back-office
- [Matching](docs/matching.md) : « Pour toi » et catalogue
- [Phase 0](docs/phase-0.md) : le test WhatsApp avant de compter sur l’application
