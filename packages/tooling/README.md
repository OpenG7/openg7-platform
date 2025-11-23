# @openg7/tooling

Workspace regroupant les utilitaires Node partagés entre les différents projets du monorepo.

## Scripts disponibles

- `validate-selectors` — vérifie que tous les sélecteurs déclarés dans `AGENTS.md` existent bien dans le code Angular (`openg7-org/src/app`). Peut être exécuté depuis la racine via `yarn workspace @openg7/tooling validate:selectors` ou directement avec la commande binaire `yarn validate-selectors`.

## Modules

- `check-server` — helper asynchrone utilisé par les tests Playwright pour attendre que le serveur Angular réponde avant de lancer la suite.

Ajoutez vos scripts et helpers transverses ici afin qu’ils partagent la même configuration et soient testables indépendamment des applications.
