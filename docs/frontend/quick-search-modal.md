# Analyse d'intégration — Recherche rapide (CTRL+K)

Cette note synthétise les principaux enjeux d'intégration du modal de recherche rapide décrit dans le cahier des charges UX/UI. Elle met l'accent sur la réutilisabilité des briques existantes de l'application Angular « signal-first » et sur les points d'attention structurants pour garantir une expérience homogène.

## 1. Architecture du composant

- **Découpage** : créer (ou étendre) le dossier `src/app/domains/search/feature/` qui regroupe le composant `quick-search-modal` (TS/HTML/SCSS), les stores locaux (historique), et les services de données (`search.service.ts`).
- **Signal-first** : exploiter les `signal()` pour `query`, `activeIndex`, `open`, `sections`, conformément aux conventions existantes dans `src/app/domains`. Prévoir des `computed` pour :
  - Dériver les sections filtrées (par exemple, masquer les sections vides tout en conservant la navigation par `Tab`).
  - Exposer l'élément actif (`activeItem = computed(() => flatResults()[activeIndex()])`).
- **Réutilisation** :
  - Les styles Tailwind et design tokens sont déjà fournis via `theme` ; utiliser les classes existantes (`bg-surface/overlay`, `ring-primary`) pour assurer la cohérence.
  - Les utilitaires d'accessibilité (`focus-trap`, directives ARIA) présents dans `src/app/core/ui` peuvent être réutilisés pour le focus initial et la gestion `aria-activedescendant`.
- **Lazy loading** : déclarer le composant dans un `Standalone Component`. Coupler avec la directive `CtrlKDirective` (désormais dans `src/app/shared/directives`) pour limiter l'empreinte initiale.

## 2. Flux de données & services

- **Service de recherche (`SearchService`)** :
  - Exposer une méthode `search$(query: string, context: SearchContext): Observable<SearchResult>` qui agrège les résultats `entreprises`, `secteurs`, `statistiques`, `actions`, `aide`.
  - Reposer sur les clients HTTP centralisés (`src/app/core/api`) afin de bénéficier automatiquement des interceptors (CSRF, erreurs, auth).
  - Implémenter un `debounceTime(350)` + `switchMap` pour annuler les requêtes obsolètes ; exploiter `takeUntilDestroyed()` pour libérer les subscriptions dans l'effet du composant.
  - Précacher les listes « top » via `AppInitializer` (`src/app/app.config.ts`) ou via un service `WarmupService` existant.
- **Historique local (`SearchHistoryStore`)** : utiliser `signal<RecentSearch[]>` et persister via `localStorage`/`sessionStorage` à l'aide de `inject(PLATFORM_ID)` pour gérer SSR. Le module `src/app/core/services/storage` contient déjà des helpers (à vérifier) ; sinon, factoriser dans `core` pour réutilisation.
- **Contexte** : déduire `SearchContext` depuis les stores globaux (`src/app/state` ou `store`). Par exemple, récupérer le secteur actif depuis `FiltersService` pour enrichir les suggestions.

## 3. Navigation & interactions clavier

- **Gestion centralisée** : extraire les handlers clavier dans un utilitaire (`search-keyboard.manager.ts`) afin de faciliter les tests unitaires et la réutilisabilité pour d'autres surfaces (ex. palette de commandes future).
- **Focus management** :
  - Reposer sur la directive `Autofocus` (si présente) ou ajouter une directive réutilisable dans `src/app/shared/directives/focus` (à introduire). Garder les focus rings Tailwind (`focus-visible:outline`).
  - Utiliser `cdkTrapFocus` (Angular CDK) si déjà embarqué. Sinon, implémenter un trap minimal réutilisable placé dans `core/ui`.
- **Scroll into view** : mutualiser avec un helper existant (`scrollIntoViewIfNeeded`) ou ajouter un utilitaire dans `core/ui/dom.utils.ts`.

## 4. États & rendu conditionnel

- **Chargement** : définir des sous-composants `QuickSearchSectionSkeletonComponent` et `QuickSearchResultItemComponent` pour isoler la logique de style et réutiliser les animations existantes (cf. `src/app/domains/search/feature/quick-search-section-skeleton.component.ts`).
- **Erreur / Offline** : intégrer `NetworkStatusService` (dans `core/observability` ou `core/services`) pour détecter l'état offline. Prévoir un fallback sur l'historique local et les caches mémoire.
- **Virtual scroll** : s'appuyer sur `@angular/cdk/scrolling` déjà utilisé dans les composants de listes (`src/app/shared/components`) pour un comportement uniforme.

## 5. Internationalisation

- **@ngx-translate/core** : toutes les chaînes (titres de sections, labels de statut, messages d'état) doivent être définies dans `src/assets/i18n/{fr,en}.json`. Préfixe recommandé `search.quick`.
- **Raccourcis** : formatés via un pipe dédié (`ShortcutPipe` dans `core/ui` ?) ou créer `formatShortcut(keystroke, locale)` dans un helper partagé pour réutilisation dans d'autres modals.

## 6. Télémétrie & instrumentation

- **Service Analytics** : il existe un `ObservabilityModule` dans `src/app/core/observability`; intégrer les événements `search_opened`, `search_typed`, `result_impression`, `result_selected`, `empty_state_seen` via ce service.
- **Time-to-first-result** : mesurer côté composant avec `performance.now()` (browser safe) mais encapsuler via un utilitaire `PerfTimer` dans `core/observability` pour réutilisation.
- **Feature flags** : respecter les règles RBAC ; les événements doivent inclure les métadonnées de rôle pour faciliter l'analyse.

## 7. Sécurité & permissions

- **Filtrage côté client** : demander au backend des résultats déjà filtrés par rôle ; néanmoins, re-filtrer côté front via `SecurityService` (`src/app/core/security`) avant l'affichage pour éviter les fuites visuelles.
- **Actions sensibles** :
  - Réutiliser le composant `ConfirmPopoverComponent` (si disponible dans `core/ui`) pour la confirmation inline.
  - Documenter dans le service comment injecter `MatDialog` ou le composant maison pour confirmation.

## 8. Deep-link & partage

- **Génération d'URL** : utiliser `Router.createUrlTree` + `serializer.serialize` pour générer les liens partageables. Exposer un helper `buildSearchDeepLink(item, context)` dans le service afin qu'il serve potentiellement à d'autres surfaces (ex. suggestions sur page d'accueil).
- **Copie** : mutualiser avec une directive `ClipboardCopyDirective` déjà disponible dans `core/ui` ou utiliser l'API `navigator.clipboard` via un service `ClipboardService` (vérifier `core/services`).

## 9. Tests & validation

- **Unit tests** :
  - Composant : tester les flux clavier (utiliser `Harness` Angular pour navigation). Les tests existants dans `src/app/shared/components` peuvent servir de modèle.
  - Service : mocker le client HTTP via `HttpTestingController` et vérifier le debounce/annulation.
- **E2E** : ajouter un scénario Playwright (`e2e/src/search.spec.ts`) pour couvrir l'ouverture via `Ctrl+K`, la navigation clavier et la sélection.

## 10. Maintenance & extensibilité

- **Réutilisabilité** :
  - Structurer les types `SearchSection`, `SearchItem`, `SearchActionVariant` dans `src/app/core/models/search.ts` afin qu'ils soient consommables par d'autres modules (ex. future recherche contextuelle).
  - Prévoir un mécanisme de plug-in : `SearchRegistryService` qui permet d'enregistrer dynamiquement des fournisseurs de résultats (ex. « Documents », « Bilans énergétiques »). Chaque fournisseur expose `resolve(query, context)` et `getDefaultItems(context)`.
- **Styling** : placer les tokens spécifiques (couleurs badges, animations) dans `src/app/theme/tokens/search.tokens.scss` pour éviter les hardcodes.
- **Documentation** : ajouter ce document au dossier `docs/frontend/` et référencer-le dans `README` si nécessaire pour que l'équipe produit puisse suivre l'intégration.

## 11. Roadmap d'intégration

1. **Scaffold technique** : création des dossiers `domains/search/feature`, `core/models/search.ts`, `core/services/search-registry.service.ts` (optionnel).
2. **Implémentation UI** : composant modal, navigation clavier, styles, focus.
3. **Connexion données** : service de recherche, historique, contexte, permissions.
4. **Instrumentation & télémétrie** : brancher analytics et timers.
5. **Tests & QA** : unitaires + e2e, vérification i18n, accessibilité (axe tests).
6. **Optimisations** : préfetch, cache mémoire, virtual scroll.

---

En suivant ces orientations, le modal de recherche rapide s'insèrera de façon cohérente dans l'architecture Angular existante, tout en restant suffisamment modulaire pour être réutilisé ou enrichi par la suite (ex. palette de commandes, recherche contextuelle par page).
