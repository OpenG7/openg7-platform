# OpenG7

Plateforme open source pour explorer et analyser les échanges interprovinciaux (front Angular + CMS Strapi). Ce dépôt regroupe le front-end, le CMS et les contrats d’API.

## Pour commencer
1. Installez les dépendances : `yarn install`
2. Lancez Strapi : `yarn dev:cms` (API locale sur http://localhost:1337)
3. Lancez le front Angular : `yarn dev:web` (UI sur http://localhost:4200)
4. Besoin d'un compte admin Strapi ? Définissez `STRAPI_ADMIN_EMAIL` / `STRAPI_ADMIN_PASSWORD` dans votre `.env` local, puis créez-le via l'écran d'admin.

> Sous Windows, `Run-Installer-pwsh.cmd` exécute `install-dev-basics_robuste.ps1` pour préparer l'environnement (PowerShell 5 en mode administrateur, installation/validation de Node.js LTS, Yarn, Git, encodage UTF-8) puis propose un menu pour lancer les commandes `yarn` principales. 【F:install-dev-basics_robuste.ps1†L1-L194】【F:install-dev-basics_robuste.ps1†L400-L626】【F:install-dev-basics_robuste.ps1†L1043-L1122】

Les guides détaillés sont dans `docs/` :
- `docs/getting-started.md` : onboarding rapide et scripts utiles
- `docs/frontend/` : architecture Angular signal-first, sélecteurs `[data-og7]`
- `docs/strapi/` : conventions CMS et seeds idempotents
- `docs/first-contribution.md` : checklist pour une première PR
- `docs/roadmap.md` : feuille de route publique et priorités

## Contribuer
Lisez `CONTRIBUTING.md` pour connaître le flux de développement, les checks à exécuter avant une PR et la politique de gestion des secrets. Le code de conduite (`CODE_OF_CONDUCT.md`) s’applique à tous les espaces communautaires. Un guide "première contribution" est disponible dans `docs/first-contribution.md`.

### Canaux publics & support
- **Issues GitHub** : bugs, demandes de fonctionnalités, docs (modèles fournis, label `needs-triage` par défaut).
- **Discussions GitHub** : questions générales ou idées exploratoires.
- **Support & gouvernance** : consultez `SUPPORT.md` pour les temps de réponse, l'escalade et le processus de décision.

### Premiers pas communautaires
- Des modèles d'issues/PR sont fournis pour accélérer le tri et clarifier les attentes.
- Les labels `good first issue` et `help wanted` signalent des sujets adaptés aux nouveaux arrivants.
- Ajoutez des captures d'écran pour toute évolution UI perceptible ; documentez les impacts de configuration ou de sécurité.

## Licence et sécurité
- Licence : MIT (`LICENSE`)
- Divulgation responsable : voir `SECURITY.md` (contact : contact@openg7.org)
