# Architecture front OpenG7

Ce document synthétise les règles d'architecture à respecter dans `openg7-org/` pour préparer l'arrivée de nouvelles features par domaine.

## Structure par domaines

Le détail de l'arborescence et des conventions Angular est décrit dans le guide [docs/frontend/angular-domain-structure.md](../docs/frontend/angular-domain-structure.md).

- Chaque domaine possède son module de page (`src/app/domains/<domaine>/pages`), ses composants orientés use-cases (`components/`) et ses adaptateurs (`data-access/`).
- Les routes lazy et la configuration SSR suivent les recommandations listées dans `docs/frontend/README.md`.

## Modules obligatoires par domaine

Pour tout nouveau domaine ou refonte :

- **Signals Angular** pour le state local et les formulaires typés (`@angular/core` signals + `signalInputs`).
- **NgRx** (`@ngrx/signals` ou `@ngrx/store` selon le domaine) afin d'exposer les sélecteurs partagés (`auth`, `user`, `catalog`, `map`).
- **Internationalisation (i18n)** : charger les traductions via `TranslateLoader` et fournir les clés `fr`/`en` dans `assets/i18n`.

Ces briques sont requises avant toute revue : les lint custom et scripts d'intégration vérifieront leur présence.

## Checklist d'amorçage d'une feature

1. Créer (ou compléter) le module de domaine avec ses routes lazy et ses guards `canMatch`.
2. Générer les composants nécessaires et exposer les selectors HTML attendus.
3. Brancher les signals locaux, puis connecter NgRx pour les états partagés.
4. Ajouter les ressources i18n et vérifier le rendu SSR en utilisant `environment.tokens.ts` / `app.config.provider.ts`.
5. S'assurer que les interceptors (`auth`, `csrf`, `error`) et les services partagés sont importés via le module racine du domaine.

En cas de doute, synchroniser avec les mainteneurs du front ou ouvrir une discussion dans `#frontend-architecture` sur Slack.
