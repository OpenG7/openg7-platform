# OpenG7 — Selectors Map (composants Angular)

Tous les composants sont **standalone**, **signal-first**, prêts i18n (`@ngx-translate`) et Tailwind.

## Sections cœur (Page d’accueil)

| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-site-header>` | src/app/components/layout/site-header.component.ts | En-tête sticky (logo, nav, recherche, CTA, langue) |
| `<og7-hero-section>` | src/app/components/hero/hero-section.component.ts | Héros 2 colonnes (mission + carte) |
| `<og7-trade-map>` | src/app/components/map/trade-map.component.ts | Carte Leaflet, viewport, intégration surcouches |
| `<og7-filters-toolbar>` | src/app/components/search/filters-toolbar.component.ts | Barre de filtres (province, secteur, import/export…) |
| `<og7-company-table>` | src/app/components/directory/company-table.component.ts | Tableau/bottin, tri, pagination |
| `<og7-company-drawer>` | src/app/components/directory/company-drawer.component.ts | Tiroir détails + Échanges |
| `<og7-insights-strip>` | src/app/components/insights/insights-strip.component.ts | KPIs et tendances |
| `<og7-onboarding-wizard>` | src/app/components/cta/onboarding-wizard.component.ts | Wizard inscription 3 étapes |

### Surcouches carte (Étape 2)

| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-map-legend>` | src/app/components/map/map-legend.component.ts | Légende secteurs cliquable |
| `<og7-map-sector-chips>` | src/app/components/map/map-sector-chips.component.ts | Chips secteurs sous la carte |
| `<og7-map-kpi-badges>` | src/app/components/map/map-kpi-badges.component.ts | Badges KPI overlay |
| `<og7-map-zoom-control>` | src/app/components/map/map-zoom-control.component.ts | Contrôles +/−, recentrage |
| `<og7-map-basemap-toggle>` | src/app/components/map/map-basemap-toggle.component.ts | Changement fond de carte |
| `<og7-map-flows-layer>` | src/app/components/map/map-flows-layer.component.ts | Filaments animés |
| `<og7-map-markers-layer>` | src/app/components/map/map-markers-layer.component.ts | Marqueurs/cluster |
| `<og7-map-highlight-layer>` | src/app/components/map/map-highlight-layer.component.ts | Surbrillance non bloquante |
| `<og7-map-tooltip>` | src/app/components/map/map-tooltip.component.ts | Infobulle accessible |
| `<og7-map-aria-live>` | src/app/components/map/map-aria-live.component.ts | Live region (lecteurs d’écran) |
| `<og7-map-layers-menu>` | src/app/components/map/map-layers-menu.component.ts | Sélecteur de calques |
| `<og7-map-share-link>` | src/app/components/map/map-share-link.component.ts | Lien partage état carte |
| `<og7-map-snapshot>` | src/app/components/map/map-snapshot.component.ts | Export PNG |

## Éléments transversaux

### Layout / nav / a11y
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-app-shell>` | src/app/components/layout/app-shell.component.ts | Conteneur racine (slots) |
| `<og7-quick-nav>` | src/app/components/layout/quick-nav.component.ts | Mini-barre d’ancres au scroll |
| `<og7-site-footer>` | src/app/components/layout/site-footer.component.ts | Pied de page riche |
| `<og7-skip-links>` | src/app/components/a11y/skip-links.component.ts | Liens “aller au contenu” |
| `<og7-breadcrumbs>` | src/app/components/navigation/breadcrumbs.component.ts | Fil d’Ariane (hors home) |
| `<og7-scroll-top>` | src/app/components/navigation/scroll-top.component.ts | Remonter en haut |

### Recherche & tri
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-search-box>` | src/app/components/search/search-box.component.ts | Omnibox (synchro filtres) |
| `<og7-search-suggestions>` | src/app/components/search/search-suggestions.component.ts | Suggestions Strapi |
| `<og7-sort-dropdown>` | src/app/components/search/sort-dropdown.component.ts | Tri (pertinence, A→Z, etc.) |
| `<og7-pagination>` | src/app/components/directory/pagination.component.ts | Pagination générique |
| `<og7-export-menu>` | src/app/components/directory/export-menu.component.ts | Export CSV/JSON |

### Feedback, overlays, états
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-loading-bar>` | src/app/components/feedback/loading-bar.component.ts | Progression données |
| `<og7-toast-center>` | src/app/components/feedback/toast-center.component.ts | Notifications |
| `<og7-modal-host>` | src/app/components/overlays/modal-host.component.ts | Hôte modales |
| `<og7-drawer-host>` | src/app/components/overlays/drawer-host.component.ts | Hôte tiroirs |
| `<og7-skeleton>` | src/app/components/placeholders/skeleton.component.ts | Squelettes UI |
| `<og7-empty-state>` | src/app/components/placeholders/empty-state.component.ts | Aucun résultat |
| `<og7-error-state>` | src/app/components/placeholders/error-state.component.ts | Erreur data |
| `<og7-offline-banner>` | src/app/components/feedback/offline-banner.component.ts | Hors-ligne (PWA) |

### Conformité & i18n
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-cookie-consent>` | src/app/components/compliance/cookie-consent.component.ts | Consentement cookies |
| `<og7-consent-settings>` | src/app/components/compliance/consent-settings.component.ts | Préférences consentement |
| `<og7-accessibility-menu>` | src/app/components/a11y/accessibility-menu.component.ts | Réglages accessibilité |
| `<og7-locale-banner>` | src/app/components/i18n/locale-banner.component.ts | Suggestion langue |

### Marketing / engagement
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-trust-strip>` | src/app/components/trust/trust-strip.component.ts | Confiance & conformité |
| `<og7-partner-logos>` | src/app/components/trust/partner-logos.component.ts | Logos partenaires |
| `<og7-press-logos>` | src/app/components/trust/press-logos.component.ts | Logos médias |
| `<og7-news-feed>` | src/app/components/news/news-feed.component.ts | Nouvelles & MAJ |
| `<og7-newsletter-form>` | src/app/components/forms/newsletter-form.component.ts | Formulaire infolettre |
| `<og7-contact-form>` | src/app/components/forms/contact-form.component.ts | Formulaire contact |
| `<og7-faq-accordion>` | src/app/components/content/faq-accordion.component.ts | FAQ pliable |

### Médias
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-image>` | src/app/components/media/image.component.ts | Wrapper image (lazy/LQIP) |
| `<og7-video-embed>` | src/app/components/media/video-embed.component.ts | Intégration vidéo |

### Pages système
| Selector | Fichier | Rôle |
|---|---|---|
| `<og7-not-found>` | src/app/components/system/not-found.component.ts | 404 |
| `<og7-server-error>` | src/app/components/system/server-error.component.ts | 500 |
| `<og7-maintenance>` | src/app/components/system/maintenance.component.ts | Maintenance |

---

## 1) Sélecteurs **HTML** (registre officiel)
> Liste **exhaustive** des sélecteurs stables à implémenter. Chaque entrée précise : le sélecteur, le composant Angular, le fichier, le rôle UX et les events.

### 1.1 — Layout & global

### Étape AGENTS
- ID: **AG-1.1**
- Portée: `front (Angular)`

### Description
Implémenter les composants et sélecteurs listés (app, site-header, announcement-bar, language-switch, search-box). Architecture signal-first, formulaires typés, i18n ngx-translate et Tailwind 4. Ajoutez les events déclarés et des tests E2E ciblant `[data-og7*]`.

- **App container**  
  - Selector : `[data-og7="app"]`  
  - Composant : `AppComponent`  
  - Fichier : `src/app/app.component.ts`  
  - Rôle : conteneur racine, shell SSR
- **En-tête (site-header)**  
  - Selector : `[data-og7="site-header"]`  
  - Composant : `SiteHeaderComponent` (standalone)  
  - Fichier : `src/app/components/layout/site-header.component.ts`  
  - Rôle : repères, langue, recherche, CTA “S’inscrire”
- **Barre d’annonce (announcement-bar)**  
  - Selector : `[data-og7="announcement-bar"]`  
  - Composant : `AnnouncementBarComponent`  
  - Fichier : `src/app/components/layout/announcement-bar.component.ts`
- **Sélecteur de langue**  
  - Selector : `[data-og7="language-switch"]`  
  - Composant : `LanguageSwitchComponent`  
  - Fichier : `src/app/components/i18n/language-switch.component.ts`
- **Boîte de recherche (omnibox)**  
  - Selector : `[data-og7="search-box"]`  
  - Composant : `SearchBoxComponent`  
  - Fichier : `src/app/components/search/search-box.component.ts`  
  - Events : `submit`, `input`

### 1.2 — Section Héros (Mission + Carte animée)

### Étape AGENTS
- ID: **AG-1.2**
- Portée: `front (Angular)`

### Description
Construire la section héros (hero, hero-copy, hero-ctas) avec les CTAs `[data-og7-id]` (view-sectors, pro-mode, register-company, preview). Respect SSR-safe et i18n.

- **Section héros**  
  - Selector : `[data-og7="hero"]`  
  - Composant : `HeroSectionComponent`  
  - Fichier : `src/app/components/hero/hero-section.component.ts`
- **Copie héros**  
  - Selector : `[data-og7="hero-copy"]`  
  - Composant : `HeroCopyComponent`  
  - Fichier : `src/app/components/hero/hero-copy.component.ts`
- **CTAs héros**  
  - Selector : `[data-og7="hero-ctas"]`  
  - Composant : `HeroCtasComponent`  
  - Fichier : `src/app/components/hero/hero-ctas.component.ts`  
  - Sous-actions (boutons) :  
    - Voir secteurs : `[data-og7="action"] [data-og7-id="view-sectors"]`  
    - Mode pro : `[data-og7="action"] [data-og7-id="pro-mode"]`  
    - Inscrire entreprise : `[data-og7="action"] [data-og7-id="register-company"]`  
    - Prévisualiser : `[data-og7="action"] [data-og7-id="preview"]`

### 1.3 — Carte (Leaflet / jsVectorMap bridge)

### Étape AGENTS
- ID: **AG-1.3**
- Portée: `front (Angular)`

### Description
Intégrer la carte (Leaflet) et ses contrôles (basemap-toggle, zoom-control, legend, kpi-badges, sector-chips, layers, tooltip, aria-live). Handlers clavier et performance de rendu visées.

- **Carte de commerce**  
  - Selector : `[data-og7="trade-map"]`  
  - Composant : `TradeMapComponent`  
  - Fichier : `src/app/components/map/trade-map.component.ts`
- **Basemap toggle**  
  - Selector : `[data-og7="map-basemap-toggle"]`  
  - Composant : `BasemapToggleComponent`  
  - Fichier : `src/app/components/map/controls/basemap-toggle.component.ts`
- **Zoom control**  
  - Selector : `[data-og7="map-zoom-control"]`  
  - Composant : `ZoomControlComponent`  
  - Fichier : `src/app/components/map/controls/zoom-control.component.ts`
- **Légende**  
  - Selector : `[data-og7="map-legend"]`  
  - Composant : `MapLegendComponent`  
  - Fichier : `src/app/components/map/legend/map-legend.component.ts`
- **KPI badges**  
  - Selector : `[data-og7="map-kpi-badges"]`  
  - Composant : `MapKpiBadgesComponent`  
  - Fichier : `src/app/components/map/kpi/map-kpi-badges.component.ts`
- **Chips secteurs**  
  - Selector : `[data-og7="map-sector-chips"]`  
  - Composant : `MapSectorChipsComponent`  
  - Fichier : `src/app/components/map/filters/map-sector-chips.component.ts`
- **Bouton “plus” (chips)**  
  - Selector : `[data-og7="map-sector-chips"] [data-og7-id="more"]`
- **Couches / Layers**  
  - Échanges : `[data-og7="map-layer"] [data-og7-id="flows"]`  
  - Marqueurs : `[data-og7="map-layer"] [data-og7-id="markers"]`  
  - Mise en évidence : `[data-og7="map-layer"] [data-og7-id="highlight"]`
- **Tooltip dynamique**  
  - Selector : `[data-og7="map-tooltip"]`
- **Zone ARIA live (a11y)**  
  - Selector : `[data-og7="map-aria-live"]`

### 1.4 — Filtres & résultats

### Étape AGENTS
- ID: **AG-1.4**
- Portée: `front (Angular)`

### Description
Implémenter la barre de filtres globaux, le mode Import/Export, le carousel de secteurs, la Mat-Table des entreprises et le drawer de détails. Synchroniser avec la carte et la recherche.

- **Filtres globaux**  
  - Selector : `[data-og7="filters"]`  
  - Composant : `GlobalFiltersComponent`  
  - Fichier : `src/app/components/filters/global-filters.component.ts`
- **Filtre Import/Export**  
  - Selector : `[data-og7="filters"] [data-og7-id="trade-mode"]`
- **Carousel secteurs**  
  - Selector : `[data-og7="sector-carousel"]`
- **Tableau entreprises (Mat-Table)**  
  - Selector : `[data-og7="company-table"]`  
  - Composant : `CompanyTableComponent`  
  - Fichier : `src/app/components/company/company-table.component.ts`
- **Détail entreprise (drawer)**  
  - Selector : `[data-og7="company-detail"]`  
  - Composant : `CompanyDetailComponent`  
  - Fichier : `src/app/components/company/company-detail.component.ts`

### 1.5 — Comptes & accès

### Étape AGENTS
- ID: **AG-1.5**
- Portée: `front (Angular)`

### Description
Prototyper login/register/profile/access-denied avec formulaires réactifs typés, i18n et sélecteurs `[data-og7]`.

- **Login** : `[data-og7="auth-login"]` (formulaire)  
- **Register** : `[data-og7="auth-register"]` (formulaire)  
- **Profil utilisateur** : `[data-og7="user-profile"]`  
- **Access denied** : `[data-og7="access-denied"]`

> ✅ **Règle** : Tout **nouveau widget/composant** doit ajouter son entrée au **registre des sélecteurs** ci‑dessus.

---

## 2) Sélecteurs **NgRx** (store selectors) — nomenclature

### Étape AGENTS
- ID: **AG-2**
- Portée: `front (Angular)`

### Description
Exposer les sélecteurs NgRx globaux (auth, user, catalog, map) dans `src/app/state/**`. Typage strict, tests unitaires basiques.

> À exposer via `selectXxx` dans des fichiers `*.selectors.ts`. À utiliser seulement pour l’état **global** (auth, user, catalogue, carte).

- **Auth** (`src/app/state/auth/`)
  - `selectAuthState`, `selectIsAuthenticated`, `selectUser`, `selectUserRoles`, `selectJwtExp`
- **User** (`src/app/state/user/`)
  - `selectUserProfile`, `selectUserPermissions`
- **Catalogue** (`src/app/state/catalog/`)
  - `selectSectors`, `selectProvinces`, `selectCompanies`, `selectCompanyById(id)`
- **Carte** (`src/app/state/map/`)
  - `selectMapReady`, `selectFilteredFlows`, `selectActiveSector`, `selectMapKpis`

---

## 3) Arborescence **accès & sécurité** (front Angular)

### Étape AGENTS
- ID: **AG-3**
- Portée: `front (Angular)`

### Description
Créer l’arborescence `src/app/core/*` (auth, http, security, config). Fournir services et types partagés nécessaires aux Guards/Interceptors/Policies.

> Créer les fichiers et implémenter la logique de sécurité côté client.

```
src/app/
├─ app.config.ts
├─ app.routes.ts
├─ core/
│  ├─ auth/
│  │  ├─ auth.guard.ts
│  │  ├─ role.guard.ts
│  │  ├─ permissions.guard.ts
│  │  ├─ auth.service.ts
│  │  ├─ token-storage.service.ts
│  │  ├─ rbac.policy.ts
│  │  └─ auth.types.ts
│  ├─ http/
│  │  ├─ auth.interceptor.ts
│  │  ├─ csrf.interceptor.ts
│  │  ├─ error.interceptor.ts
│  │  └─ http-options.ts
│  ├─ security/
│  │  ├─ dom-sanitizer.service.ts
│  │  ├─ crypto.service.ts
│  │  └─ anti-xss.util.ts
│  └─ config/
│     ├─ environment.tokens.ts
│     └─ app.config.provider.ts
├─ components/
│  ├─ layout/
│  │  ├─ site-header.component.ts
│  │  └─ announcement-bar.component.ts
│  ├─ i18n/
│  │  └─ language-switch.component.ts
│  ├─ search/
│  │  └─ search-box.component.ts
│  ├─ hero/
│  │  ├─ hero-section.component.ts
│  │  ├─ hero-copy.component.ts
│  │  └─ hero-ctas.component.ts
│  ├─ map/
│  │  ├─ trade-map.component.ts
│  │  ├─ legend/map-legend.component.ts
│  │  ├─ kpi/map-kpi-badges.component.ts
│  │  ├─ filters/map-sector-chips.component.ts
│  │  └─ controls/
│  │     ├─ basemap-toggle.component.ts
│  │     └─ zoom-control.component.ts
│  └─ company/
│     ├─ company-table.component.ts
│     └─ company-detail.component.ts
├─ pages/
│  ├─ home.page.ts
│  ├─ login.page.ts
│  ├─ register.page.ts
│  ├─ profile.page.ts
│  └─ access-denied.page.ts
├─ state/
│  ├─ auth/
│  │  ├─ auth.actions.ts
│  │  ├─ auth.reducer.ts
│  │  ├─ auth.selectors.ts
│  │  └─ auth.effects.ts
│  ├─ user/
│  │  ├─ user.reducer.ts
│  │  ├─ user.selectors.ts
│  │  └─ user.effects.ts
│  ├─ catalog/
│  │  ├─ catalog.reducer.ts
│  │  ├─ catalog.selectors.ts
│  │  └─ catalog.effects.ts
│  └─ map/
│     ├─ map.reducer.ts
│     ├─ map.selectors.ts
│     └─ map.effects.ts
└─ assets/
   └─ i18n/
      ├─ fr.json
      └─ en.json
```

### 3.1 — Guards (exigences)

### Étape AGENTS
- ID: **AG-3.1**
- Portée: `front (Angular)`

### Description
Implémenter `auth.guard.ts`, `role.guard.ts`, `permissions.guard.ts` en `canMatch` + signals `isAllowedSig`/`reasonSig`. Démo route `/pro` protégée + tests.

- `auth.guard.ts` (**canMatch**) : bloque routes si non authentifié.
- `role.guard.ts` (**canMatch**) : exige un rôle (`Admin`, `Pro`, `Basic`).
- `permissions.guard.ts` (**canMatch**) : exige des permissions (`catalog:write`, etc.).
- Tous les guards exposent des **signals** `isAllowedSig`, `reasonSig` pour l’UI.

### 3.2 — Interceptors

### Étape AGENTS
- ID: **AG-3.2**
- Portée: `front (Angular)`

### Description
Ajouter `auth.interceptor.ts`, `csrf.interceptor.ts`, `error.interceptor.ts`. SSR-safe; logs d’erreurs vers toast/observabilité.

- `auth.interceptor.ts` : ajoute `Authorization: Bearer <jwt>` si présent (SSR-safe).  
- `csrf.interceptor.ts` : gère le header CSRF (lecture cookie, `XSRF-TOKEN`).
- `error.interceptor.ts` : normalise erreurs, déclenche toasts/i18n.

### 3.3 — Services sécurité

### Étape AGENTS
- ID: **AG-3.3**
- Portée: `front (Angular)`

### Description
Ajouter `token-storage.service.ts`, `rbac.policy.ts`, `crypto.service.ts`, `dom-sanitizer.service.ts`, `anti-xss.util.ts` (si requis). Codifier règles RBAC UI.

- `token-storage.service.ts` : stockage JWT (Web Crypto + `sessionStorage` par défaut, fallback `Memory`).  
- `rbac.policy.ts` : mappe rôles → permissions → composants (feature flags UI).  
- `crypto.service.ts` : `SubtleCrypto` (encrypt/decrypt clé dérivée).

---

## 4) Routage & SSR

### Étape AGENTS
- ID: **AG-4**
- Portée: `front (Angular)`

### Description
Configurer `app.routes.ts` (lazy routes + canMatch) et `app.config.ts` (HTTP_INTERCEPTORS, TranslateLoader, TransferState). Garantir l’absence d’accès DOM au module-load.

- `src/app/app.routes.ts` : routes lazy, `canMatch` sur segments protégés.  
- `src/app/app.config.ts` : providers globaux (HTTP_INTERCEPTORS, TranslateLoader, TransferState).  
- SSR : **aucune** API `window` au module load ; tester `isPlatformBrowser` dans les effets/constructeurs si besoin.

---

## 5) Strapi — Seeds (fichiers & rôles)

### Étape AGENTS
- ID: **AG-5**
- Portée: `cms (Strapi)`

### Description
Mettre en place les seeds idempotents (locales, rôles/permissions, taxonomies, contenus de démo, API tokens). `strapi/src/bootstrap.ts` appelle `runSeeds()` en dev.

> Côté Strapi (v5+), on fournit une arbo et des scripts pour initialiser : **locales, rôles/permissions, taxonomies, contenus initiaux, comptes**, tokens API.

```
strapi/
├─ src/
│  ├─ bootstrap.ts                # appelle runSeeds() en dev/intégration
│  ├─ seed/
│  │  ├─ 00-locales.ts            # fr, en
│  │  ├─ 01-roles-permissions.ts  # Public, Authenticated, Pro, Admin (rules)
│  │  ├─ 02-admin-user.ts         # création admin initial (env guarded)
│  │  ├─ 03-taxonomies.ts         # provinces, territoires, secteurs
│  │  ├─ 04-homepage.ts           # mission, bannières, CTAs (FR/EN)
│  │  ├─ 05-companies.ts          # entreprises de démo (liens secteurs/provinces)
│  │  ├─ 06-exchanges.ts        # échanges interprovinciaux (graph)
│  │  ├─ 07-feature-flags.ts      # flags UI (pro-mode etc.)
│  │  └─ 08-api-tokens.ts         # tokens lecture seule (front)
│  └─ utils/seed-helpers.ts       # helpers: upsert, ensureRole, ensureLocale, etc.
├─ config/
│  ├─ plugins.ts                  # i18n, users-permissions, graphql (optionnel)
│  └─ env/development/...
└─ package.json
```

### 5.1 — Principes de seed

### Étape AGENTS
- ID: **AG-5.1**
- Portée: `cms (Strapi)`

### Description
S’assurer de l’idempotence (upsert par clé), de la sécurité en prod (gated via env), et de la localisation FR/EN pour tout contenu.

- **Idempotent** : ré-exécuter sans doublons (utiliser `upsert` par clé).  
- **Sécurisé** : l’admin initial et les tokens ne s’écrivent **jamais** en prod sans variables d’environnement explicites (`SEED_ADMIN_ALLOWED="true"`).  
- **Localisable** : tout contenu textuel possède `fr` & `en`.

### 5.2 — Variables d’environnement Strapi (exigées)

### Étape AGENTS
- ID: **AG-5.2**
- Portée: `cms (Strapi)`

### Description
Définir `STRAPI_ADMIN_EMAIL/PASSWORD`, `STRAPI_SEED_ADMIN_ALLOWED`, `STRAPI_API_READONLY_TOKEN`. Ne jamais semer des secrets en prod par défaut.

```
STRAPI_ADMIN_EMAIL=admin@openg7.org
STRAPI_ADMIN_PASSWORD=<strong-password>
STRAPI_SEED_ADMIN_ALLOWED=true
STRAPI_API_READONLY_TOKEN=<generated-token>
```

### 5.3 — Commandes

### Étape AGENTS
- ID: **AG-5.3**
- Portée: `cms (Strapi)`

### Description
Documenter `yarn strapi develop` et `yarn seed:dev`. Préparer scripts node facultatifs pour relancer les seeds.

```
# depuis ./strapi
yarn strapi develop           # lance Strapi (bootstrap appelle les seeds)
yarn seed:dev                 # optionnel: script node pour forcer les seeds
```

---

## 6) Environnements Front

### Étape AGENTS
- ID: **AG-6**
- Portée: `front (Angular)`

### Description
Fournir `environment.tokens.ts` et `app.config.provider.ts` (lecture `window.__OG7_CONFIG__` côté browser, `process.env` côté SSR). Exposer `API_URL`, `I18N_PREFIX`, `FEATURE_FLAGS`.

`src/app/core/config/environment.tokens.ts` expose des **InjectionTokens** :  
- `API_URL` : URL de Strapi (ex.: `https://api.openg7.org`)  
- `I18N_PREFIX` : `/assets/i18n/`  
- `FEATURE_FLAGS` : dictionnaire typé (pro-mode, experimental-map, etc.)

`app.config.provider.ts` lit `window.__OG7_CONFIG__` quand en **browser**, et `process.env.*` côté **SSR**.

---

## 7) Checklist pour Codex (exécuter dans cet ordre)

### Étape AGENTS
- ID: **AG-7**
- Portée: `front (Angular)`

### Description
Standardiser l’ordre d’exécution (arbo sécurité → composants → signals → NgRx → i18n → interceptors → guards → SSR → seeds → tests). À cocher avant merge.

1. **Créer** l’arborescence d’accès & sécurité (section 3) sous `src/app/...`.
2. **Générer** les composants listés en 1) avec leurs **selectors HTML** respectifs.
3. **Implémenter** les **signals** locaux & formulaires typés dans chaque composant.
4. **Brancher** NgRx uniquement pour `auth`, `user`, `catalog`, `map` (selectors section 2).
5. **Configurer** i18n (loader HTTP, fichiers `fr.json` / `en.json`).
6. **Activer** les interceptors `auth`, `csrf`, `error`.
7. **Protéger** les routes (`canMatch` + RBAC UI).
8. **Configurer** SSR (TransferState, aucun accès direct à `window`).
9. **Côté Strapi** : créer les fichiers de **seed** (section 5), rendre les scripts **idempotents**.
10. **Écrire** des tests rapides (E2E/ciblage via `data-og7*`).

---

## 8) Exemples (snippets) — *indicatifs*

### 8.1 — Route protégée (canMatch)
```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.page').then(m => m.HomePage),
  },
  {
    path: 'pro',
    canMatch: [() => inject(AuthGuard).canMatchRole('Pro')],
    loadComponent: () => import('./pages/pro.page').then(m => m.ProPage),
  },
];
```

### 8.2 — Sélecteur HTML dans un composant
```ts
// src/app/components/map/controls/zoom-control.component.ts
@Component({
  selector: 'og7-map-zoom-control',
  standalone: true,
  template: `
    <div data-og7="map-zoom-control">
      <button type="button" data-og7="action" data-og7-id="zoom-in" (click)="zoomIn()">+</button>
      <button type="button" data-og7="action" data-og7-id="zoom-out" (click)="zoomOut()">-</button>
    </div>
  `
})
export class ZoomControlComponent {
  zoomLevelSig = signal(1);
  zoomIn = () => this.zoomLevelSig.update(v => Math.min(10, v + 1));
  zoomOut = () => this.zoomLevelSig.update(v => Math.max(1, v - 1));
}
```

### 8.3 — NgRx selector
```ts
// src/app/state/map/map.selectors.ts
export const selectMapState = createFeatureSelector<MapState>('map');
export const selectFilteredFlows = createSelector(
  selectMapState,
  s => s.filteredFlows
);
```

---

## 9) Foire aux décisions (rappels Codex)
- **Signal-first** : pas d’over-engineering NgRx ; prioriser des `signal()` locaux.
- **Selectors stables** : **pas** de classes Tailwind pour cibler ; toujours `data-og7*`.
- **Sécurité** : jamais stocker JWT en `localStorage` non chiffré ; préférer `sessionStorage` + Web Crypto.
- **i18n** : aucun texte en dur ; tout passe par `TranslateService`.
- **SSR** : toute dépendance navigateur doit être lazy/importée uniquement en browser.

---

> **Fin du gabarit** — À compléter au fil des features : toute nouvelle zone UI **ajoute** ses selectors & fichiers au présent document.



---

# 🔀 Séparation Front (Angular) vs CMS (Strapi) — Contrat & responsabilités

### Étape AGENTS
- ID: **AG-9**
- Portée: `front/cms`

### Description
Formaliser le contrat Front/CMS (endpoints, CORS, tokens RO). Toute PR qui change un schéma ou un endpoint doit mettre à jour AGENTS.md et `@openg7/contracts`.


> **Pourquoi** : éviter toute ambiguïté entre le **front Angular** (`openg7-org`) et le **CMS/API Strapi** (`openg7-cms`).  
> **Règle d’or** : AGENTS.md est la **spec vivante** des deux projets ; un commit qui touche l’un doit respecter le **contrat** ci-dessous.

## 1) Monorepo & chemins
```
/openG7/
  ├─ openg7-org/   # Front Angular 19 (src/app/...)
  └─ openg7-cms/   # Strapi (strapi/src/...)
```
- Chemins **front** documentés ici commencent par `src/app/...` (Angular).
- Chemins **CMS** documentés ici commencent par `strapi/...` (Strapi).

## 2) Contrat d’API (read-only par défaut)
**Base URL** (dev) : `http://localhost:1337`  
**Auth** : *API Token* (Strapi **Read-Only**) → `Authorization: Bearer <token>`

| Ressource        | Endpoint (GET)                 | Query params conseillés           | Notes                               |
|------------------|--------------------------------|-----------------------------------|-------------------------------------|
| Secteurs         | `/api/sectors`                 | `?pagination[page]=1&pagination[pageSize]=100` | tri côté front si nécessaire         |
| Provinces        | `/api/provinces`               | idem                              |                                     |
| Entreprises      | `/api/companies`               | `?filters[sector][id][$in]=...`   | filtrage côté Strapi                 |
| Échanges       | `/api/exchanges`             | `?filters[sourceProvince][id]=...`| graph d’échanges                     |
| Homepage         | `/api/homepage`                | `?populate=deep`                  | *SingleType*                         |

**Shape de réponse (par défaut Strapi v4/v5)** :  
```json
{ "data": [ /* ou objet */ ], "meta": { "pagination": { /* ... */ } } }
```

## 3) Variables d’environnement (mapping)
**Front (Angular)** — `src/app/core/config/environment.tokens.ts` :  
- `API_URL` → ex. `http://localhost:1337`
- `API_TOKEN` → *Read-Only Token* (dev uniquement)

**CMS (Strapi)** — `openg7-cms/.env` :  
- `HOST=0.0.0.0`, `PORT=1337`  
- (auto-générées au 1er boot) `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`  
- En prod : configurez la base de données et les CORS.

## 4) CORS & sécurité
- **Strapi** `config/middlewares.ts` doit autoriser l’origine Angular dev : `http://localhost:4200`.
- **Front** : ne **stocke pas** de JWT long terme ; privilégier **API Token RO** ou endpoints *Public*.
- **RBAC** : règles UI (masquage) côté Angular **≠** permissions Strapi (serveur). Toujours restreindre côté Strapi.

## 5) Responsabilités (Do / Don’t)
| Sujet | Front (Angular) | CMS (Strapi) |
|---|---|---|
| i18n | Affichage & clés `fr/en` (`src/assets/i18n/*.json`) | Contenus éditoriaux multilingues |
| Filtrage simple | OK (client) | Recommandé si volumétrie (via `filters[...]`) |
| Auth UI (guards) | **canMatch**, masquage RBAC UI | **Rôles/permissions** & sécurité API |
| Graph / KPI | Calcul léger client | Agrégations lourdes (future extension) |
| Seeds | Mocks front pour dev offline | **`strapi/src/seed/*.ts`** (idempotents) |

## 6) Processus dev (local)
- **CMS** : `cd openg7-cms && yarn strapi develop` → admin `:1337/admin`
- **Front** : `cd openg7-org && yarn start` → app `:4200`  
- Docker : voir `docker-compose.dev.yml` à la racine.

## 7) Définition de prêt (Ready) / fini (Done)
- **Ready** : endpoints Strapi et schémas `schema.json` listés dans AGENTS.md **existent**, CORS OK, token RO généré.  
- **Done** (front) : composants signal-first + sélecteurs `[data-og7*]` présents, clés i18n créées, tests Playwright verts.  
- **Done** (CMS) : seeds rejouables, permissions définies, collections renseignées (au moins 3 enregistrements démo).

## 8) Check de cohérence (script)
Ajouter `tools/validate-api.mjs` pour vérifier la reachability des endpoints déclarés :
```js
// tools/validate-api.mjs
import fetch from 'node-fetch';
const base = process.env.OG7_API_URL || 'http://localhost:1337';
const token = process.env.OG7_API_TOKEN || '';
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const endpoints = ['/api/sectors','/api/provinces','/api/companies','/api/exchanges','/api/homepage'];
const errs = [];
for (const e of endpoints) { const r = await fetch(base+e, { headers }); if (!r.ok) errs.push(`${e} -> HTTP ${r.status}`); }
if (errs.length) { console.error('API KO:\n'+errs.join('\n')); process.exit(1); }
console.log('API OK');
```
`package.json` : `"validate:api": "node tools/validate-api.mjs"` (à brancher en CI).

---
_MAJ : 2025-09-10 02:39:17Z_


---

## 📚 Glossaire — Termes clés

### CSRF (Cross‑Site Request Forgery)
Attaque où un site tiers tente de **forcer** une requête authentifiée à votre insu.
- **Pertinent surtout si l’auth passe par cookies**. Avec **API Token** (Bearer) en front, le risque est fortement réduit.
- **Front (Angular)** : un `csrf.interceptor.ts` ajoute un header de jeton uniquement pour les méthodes **POST/PUT/PATCH/DELETE** et **même‑origine**.
  ```ts
  // src/app/core/http/csrf.interceptor.ts
  import {{ HttpInterceptorFn }} from '@angular/common/http';
  import {{ inject }} from '@angular/core';
  const READ = new Set(['GET','HEAD','OPTIONS']);
  function readCookie(name: string): string | null {{
    return document.cookie.split('; ').find(c => c.startsWith(name+'='))?.split('=')[1] ?? null;
  }}
  export const csrfInterceptor: HttpInterceptorFn = (req, next) => {{
    if (typeof window !== 'undefined' && !READ.has(req.method.toUpperCase()) && req.url.startsWith(location.origin)) {{
      const token = readCookie('XSRF-TOKEN');
      if (token) req = req.clone({{ setHeaders: {{ 'X-XSRF-TOKEN': token }} }});
    }}
    return next(req);
  }};
  ```
- **CMS (Strapi)** : API **stateless** (CORS + tokens). Si vous servez le **panel admin** sur le même domaine et utilisez des cookies,
  activez une protection CSRF au niveau reverse proxy (ou middleware dédié).

### RBAC (Role‑Based Access Control)
Contrôle d’accès basé sur les **rôles**.
- **Front (Angular)** : `rbac.policy.ts` mappe **rôles → permissions → composants/routes**.  
  Les **guards** `canMatch` bloquent les routes ; l’UI masque les CTA non autorisés (feature flags).
- **CMS (Strapi)** : définir les **rôles** et **permissions** (plugin *users-permissions*) et limiter les **API tokens** (read‑only par défaut).
- **Rappel** : le RBAC **UI** ne remplace **jamais** la restriction côté **API**.

---

## 🔁 Notes de migration “connexions → (UI) Échanges / (code) flows”
- **Composant** : `<og7-map-connection-layer>` → `<og7-map-flows-layer>` ; fichier `src/app/components/map/map-flows-layer.component.ts`.
- **Sélecteurs HTML** : `[data-og7-id="connections"]` → `[data-og7-id="flows"]`.
- **NgRx** : `selectFilteredConnections` → `selectFilteredFlows` ; `filteredConnections` → `filteredFlows`.
- **Seeds Strapi** : `06-exchanges.ts` (remplace l’ancien `06-connections.ts`).
- **API** : `/api/exchanges` devient la route de référence (alias `/api/connections` toléré le temps de migrer).

_MAJ automatique : 2025-09-10 13:45:21Z_

---

## Strapi — Fichiers JSON chargés (schémas & composants)

### Étape AGENTS
- ID: **AG-10**
- Portée: `cms (Strapi)`

### Description
Créer/valider les schémas `schema.json` (province, sector, company, exchange, homepage) et composants JSON. Commiter la structure source.


```txt
strapi/
└─ src/
   ├─ api/
   │  ├─ province/
   │  │  └─ content-types/province/schema.json
   │  ├─ sector/
   │  │  └─ content-types/sector/schema.json
   │  ├─ company/
   │  │  └─ content-types/company/schema.json
   │  ├─ exchange/
   │  │  └─ content-types/exchange/schema.json
   │  └─ homepage/
   │     └─ content-types/homepage/schema.json   # SingleType
   └─ components/
      ├─ navigation/
      │  ├─ header.json
      │  ├─ menu-link.json
      │  ├─ cta-button.json
      │  ├─ announcement-bar.json
      │  ├─ search-config.json
      │  └─ search-suggestion.json
      ├─ i18n/
      │  └─ language.json
      ├─ sections/
      │  ├─ hero.json
      │  ├─ filters.json
      │  ├─ directory.json
      │  ├─ insights.json
      │  ├─ onboarding.json
      │  ├─ news.json
      │  └─ trust.json
      ├─ map/
      │  ├─ map-theme.json
      │  └─ legend-item.json
      ├─ insights/
      │  └─ kpi-config.json
      ├─ directory/
      │  ├─ table-config.json
      │  └─ drawer-config.json
      ├─ branding/
      │  └─ logo.json
      └─ seo/
         └─ seo.json
```

---

## Sécurité front — CSP & Trusted Types (prod)

### Étape AGENTS
- ID: **AG-11**
- Portée: `front (Angular)`

### Description
Définir CSP minimale et activer Trusted Types en prod. Vérifier SSR-safe et `DomSanitizer` pour HTML dynamique.


**Objectif :** Mitiger les XSS/CSRF côté front, formaliser une politique **CSP** minimale et activer **Trusted Types**.

**CSP (exemple minimal à adapter par environnement)** :
```
default-src 'self';
script-src 'self' 'report-sample';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.openg7.org http://localhost:1337;
base-uri 'self';
frame-ancestors 'none';
report-uri /csp-report;
```

**Trusted Types** (idéalement via en-tête HTTP) :
```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types angular angular#bundler;
```

**Rappels Angular** :
- Aucune API DOM au module-load (SSR-safe) ; utiliser `isPlatformBrowser`.
- Pour l’HTML dynamique : `DomSanitizer` + pipes/`[innerHTML]` strictement encadrés.
- Ne pas utiliser les classes Tailwind comme hooks de test (uniquement `[data-og7*]`).

---

## Validation automatique des sélecteurs `[data-og7*]`

### Étape AGENTS
- ID: **AG-12**
- Portée: `front (Angular)`

### Description
Ajouter `tools/validate-selectors.mjs` et workflow CI pour vérifier la présence de tous les sélecteurs `[data-og7*]` déclarés dans AGENTS.md.


Ajoutez le script suivant et branchez-le en CI pour garantir que **tous** les sélecteurs déclarés dans `AGENTS.md` existent réellement dans le code.

**Fichier** : `tools/validate-selectors.mjs`
```js
// tools/validate-selectors.mjs
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const md = readFileSync('AGENTS.md', 'utf8');

// Récupère tous les [data-og7="..."] et [data-og7-id="..."]
const selMain = [...md.matchAll(/\[data-og7="([^"]+)"\]/g)].map(m => m[1]);
const selIds  = [...md.matchAll(/\[data-og7-id="([^"]+)"\]/g)].map(m => m[1]);

function readAll(dir) {
  const items = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) items.push(...readAll(p));
    else if (['.ts','.html','.json'].includes(extname(p))) {
      items.push([p, readFileSync(p, 'utf8')]);
    }
  }
  return items;
}

const files = readAll('src/app');
const missing = [];

function existsAttr(attr, val) {
  const needle = attr + '="' + val + '"';
  return files.some(([_, c]) => c.includes(needle));
}

for (const s of selMain) if (!existsAttr('data-og7', s)) missing.push(`data-og7="${s}"`);
for (const s of selIds)  if (!existsAttr('data-og7-id', s)) missing.push(`data-og7-id="${s}"`);

if (missing.length) {
  console.error('Sélecteurs manquants dans src/app:\n- ' + missing.join('\n- '));
  process.exit(1);
} else {
  console.log('OK: tous les sélecteurs d’AGENTS.md existent dans le code.');
}
```

**CI GitHub** : `.github/workflows/ci-validate.yml`
```yaml
name: Validate Agents

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  validate-selectors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci || yarn install --frozen-lockfile
      - run: node tools/validate-selectors.mjs

  validate-api:
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'pull_request' }} # facultatif
    env:
      OG7_API_URL: http://localhost:1337
      OG7_API_TOKEN: ${{ secrets.OG7_API_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci || yarn install --frozen-lockfile
      - run: node tools/validate-api.mjs
```

---

## 📦 Paquet partagé — `@openg7/contracts` (workspaces)

### Étape AGENTS
- ID: **AG-13**
- Portée: `shared (workspaces)`

### Description
Initialiser `packages/contracts` avec génération de types via OpenAPI. Publier localement en workspace et consommer côté Angular/Strapi.


> Objectif : centraliser **les types TypeScript** Strapi (et éventuellement un petit **catalogue d’endpoints**) dans un **package workspace** partagé entre **openg7-cms** et **openg7-org**.

### Arbo monorepo (workspaces)
```
/openG7/
  ├─ openg7-org/            # Front Angular 19 (src/app/...)
  ├─ openg7-cms/            # Strapi (strapi/src/...)
  └─ packages/
     └─ contracts/          # <= @openg7/contracts
```

### `package.json` (racine)
```json
{
  "name": "openg7",
  "private": true,
  "workspaces": ["openg7-org", "openg7-cms", "packages/*"],
  "scripts": {
    "dev:web": "yarn --cwd openg7-org start",
    "dev:cms": "yarn --cwd openg7-cms strapi develop",
    "dev:all": "concurrently \"yarn dev:cms\" \"yarn dev:web\"",
    "codegen": "yarn --cwd packages/contracts run codegen"
  }
}
```

### `packages/contracts/package.json`
```json
{
  "name": "@openg7/contracts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "codegen:rest": "openapi-typescript spec/openapi.json -o src/strapi.rest.d.ts",
    "codegen": "yarn codegen:rest",
    "prepublishOnly": "yarn clean && yarn codegen && yarn build"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "rimraf": "^6.0.1",
    "openapi-typescript": "^7.0.0"
  }
}
```

### `packages/contracts/tsconfig.json`
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "emitDeclarationOnly": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `packages/contracts/src/index.ts`
```ts
// Types générés par openapi-typescript
import type { paths, components } from './strapi.rest';

// Types de haut niveau (facultatif)
export type Province = components['schemas']['Province'];
export type Sector   = components['schemas']['Sector'];
export type Company  = components['schemas']['Company'];
export type Exchange = components['schemas']['Exchange'];

// Réponses Strapi usuelles
export type StrapiList<T>   = { data: T[]; meta: { pagination?: unknown } };
export type StrapiSingle<T> = { data: T;  meta?: unknown };

// Endpoints documentés
export const endpoints = {
  sectors:   '/api/sectors',
  provinces: '/api/provinces',
  companies: '/api/companies',
  exchanges: '/api/exchanges',
  homepage:  '/api/homepage'
} as const;
```

### Génération des types
1. Exporter le **OpenAPI JSON** de Strapi (plugin docs) ➜ `packages/contracts/spec/openapi.json`  
2. Lancer : `yarn workspace @openg7/contracts codegen && yarn workspace @openg7/contracts build`

### Consommation côté Angular (`openg7-org`)
**openg7-org/package.json**
```json
{
  "dependencies": {
    "@openg7/contracts": "workspace:*"
  }
}
```

**src/app/core/api/strapi-client.ts**
```ts
import { inject, Injectable, signal } from '@angular/core';
import { API_URL, API_TOKEN } from 'src/app/core/config/environment.tokens';
import type { StrapiList, Province, Sector, Company, Exchange } from '@openg7/contracts';
import { endpoints } from '@openg7/contracts';

@Injectable({ providedIn: 'root' })
export class StrapiClient {
  private readonly api = inject(API_URL);
  private readonly token = inject(API_TOKEN);
  readonly loading = signal(false);

  private headers(): HeadersInit {
    const h: HeadersInit = {};
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async get<T>(path: string): Promise<T> {
    this.loading.set(true);
    try {
      const res = await fetch(`${this.api}${path}`, { headers: this.headers() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<T>;
    } finally { this.loading.set(false); }
  }

  sectors()   { return this.get<StrapiList<Sector>>(endpoints.sectors); }
  provinces() { return this.get<StrapiList<Province>>(endpoints.provinces); }
  companies() { return this.get<StrapiList<Company>>(endpoints.companies); }
  exchanges() { return this.get<StrapiList<Exchange>>(endpoints.exchanges); }
}
```

> **CI** : ajouter une étape “contracts” avant le build front :  
> `yarn workspace @openg7/contracts codegen && yarn workspace @openg7/contracts build`

_MAJ (sections workspaces & contracts) : 2025-09-10 20:26:33Z_


---

# ✅ NFR — Budgets & critères d’acceptation (OpenG7)

| Domaine | Cible / Règle | Comment vérifier |
|---|---|---|
| **Perf (Web Vitals)** | LCP ≤ **2.5s**, CLS ≤ **0.1**, INP ≤ **200ms** | Lighthouse CI, Web Vitals (`src/app/core/observability/metrics.service.ts`) |
| **Carte (flows)** | ≥ **40 fps** desktop, filtrage local ≤ **200ms**, rendu initial ≤ **1.5s** | Profiler navigateur, logs perf personnalisés |
| **Accessibilité** | WCAG 2.1 AA : focus visible, aria-live carte, **focus trap** drawer | Playwright + axe (tests E2E) |
| **Sécurité** | **CSP** + **Trusted Types** activés en prod ; **CSRF** côté même-origine ; **RBAC** API strict | En-têtes HTTP, tests d’intégration API |
| **Qualité données** | Slugs **uniques**, enums validés, relations cardinalité définie | Validation Strapi + scripts seed |
| **Observabilité** | Sentry front+cms, Web Vitals échantillonnés | Dashboards Sentry + logs |

---

# SSR & accès DOM (Angular — `openg7-org`)

- **Règle** : *Aucun accès DOM* (window/document) **au module-load**. Toujours vérifier l’environnement.

**src/app/core/utils/is-browser.ts**
```ts
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
```

Utiliser `isBrowser()` dans les services/composants qui manipulent le DOM ou `localStorage`.

---

# StrapiClient — cache TTL + retry/backoff (signal-first)

**src/app/core/api/strapi-client.ts** (ajouts proposés)
```ts
// ...imports existants
@Injectable({ providedIn: 'root' })
export class StrapiClient {
  // ...propriétés existantes
  private cache = new Map<string, { t: number; v: unknown }>();
  private ttlMs = 60_000; // 60s

  async get<T>(path: string): Promise<T> {
    const key = path;
    const now = Date.now();
    const hit = this.cache.get(key);
    if (hit && now - hit.t < this.ttlMs) return hit.v as T;

    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${this.api}${path}`, { headers: this.headers() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        this.cache.set(key, { t: now, v: json });
        return json;
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('Network error');
  }
}
```

---

# Feature Flags front (cache local + invalidation)

**src/app/core/feature-flags/feature-flags.service.ts**
```ts
import { inject, Injectable, signal } from '@angular/core';
import { API_URL } from 'src/app/core/config/environment.tokens';
import { isBrowser } from 'src/app/core/utils/is-browser';

type Flags = Record<string, boolean>;
const KEY = 'og7:flags:v1'; // bump version pour invalider

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly api = inject(API_URL);
  readonly flags = signal<Flags>({});

  async load(): Promise<void> {
    if (isBrowser()) {
      const cached = localStorage.getItem(KEY);
      if (cached) { this.flags.set(JSON.parse(cached)); return; }
    }
    const res = await fetch(`${this.api}/api/feature-flags`);
    if (!res.ok) return;
    const data = await res.json() as { data: { key: string; enabled: boolean }[] };
    const f = Object.fromEntries(data.data.map(d => [d.key, d.enabled]));
    this.flags.set(f);
    if (isBrowser()) localStorage.setItem(KEY, JSON.stringify(f));
  }

  isOn(k: string): boolean { return !!this.flags()[k]; }
}
```

---

# A11y — Carte & Drawer (clavier, aria-live, focus)

- **Carte** : les contrôles doivent êtres focusables (tabindex), **flèches** = zoom, `Enter` = activer.  
- **Drawer** : trap focus + retour focus à l’élément déclencheur.

**src/app/components/company/company-detail.component.ts** (extrait focus)
```ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';

@Component({ standalone: true, selector: 'og7-company-detail', templateUrl: './company-detail.component.html' })
export class CompanyDetailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('closeBtn', { static: true }) closeBtn!: ElementRef<HTMLButtonElement>;
  private opener: HTMLElement | null = null;

  openFrom(el: HTMLElement) { this.opener = el; /* ...ouvrir... */ }

  ngAfterViewInit() { queueMicrotask(() => this.closeBtn.nativeElement.focus()); }
  ngOnDestroy() { this.opener?.focus(); }
}
```

**src/app/components/map/controls/zoom-control.component.ts** (handlers clavier)
```ts
onKey(e: KeyboardEvent, dir: 'in'|'out') {
  if (e.key === 'Enter' || e.key === ' ') this.zoom(dir);
  if (e.key === 'ArrowUp') this.zoom('in');
  if (e.key === 'ArrowDown') this.zoom('out');
}
```

---

# Strapi — Schémas : contraintes & index

**strapi/src/api/exchange/content-types/exchange/schema.json** (exemple)
```json
{
  "kind": "collectionType",
  "collectionName": "exchanges",
  "info": { "singularName": "exchange", "pluralName": "exchanges", "displayName": "Exchange" },
  "options": { "draftAndPublish": true },
  "attributes": {
    "slug": { "type": "uid", "targetField": "title", "required": true, "unique": true },
    "title": { "type": "string", "minLength": 3, "required": true },
    "sourceProvince": { "type": "relation", "relation": "oneToOne", "target": "api::province.province" },
    "targetProvince": { "type": "relation", "relation": "oneToOne", "target": "api::province.province" },
    "sector": { "type": "relation", "relation": "manyToOne", "target": "api::sector.sector" },
    "value": { "type": "decimal", "min": 0 },
    "unit": { "type": "enumeration", "enum": ["bbl", "MWh", "CAD", "people"], "default": "CAD" },
    "privateNote": { "type": "text", "private": true }
  }
}
```

---

# Seeds Strapi — helpers idempotents & locales

**strapi/src/utils/seed-helpers.ts**
```ts
export async function upsertByUID<T extends { slug?: string }>(uid: string, data: T): Promise<void> {
  const svc = strapi.entityService;
  const where = data.slug ? { slug: data.slug } : { title: (data as any)['title'] };
  const existing = await svc.findMany(uid, { filters: where });
  if (existing?.length) await svc.update(uid, existing[0].id, { data });
  else await svc.create(uid, { data });
}

export async function ensureLocale(code: 'fr'|'en') {
  const list = await strapi.plugin('i18n').service('locales').list();
  if (!list.find((l: any) => l.code === code)) {
    await strapi.plugin('i18n').service('locales').create({ code, name: code.toUpperCase() });
  }
}
```

**strapi/src/seed/06-exchanges.ts** (usage)
```ts
import { upsertByUID, ensureLocale } from '../utils/seed-helpers';
export default async () => {
  await ensureLocale('fr');
  await upsertByUID('api::exchange.exchange', { slug: 'ab-to-bc-oil', title: 'AB → BC Oil', value: 100, unit: 'bbl' });
};
```

---

# Preview drafts (Strapi → Angular)

**Route custom**  
- **CMS** : `GET /api/homepage/preview?secret=<token>` (Settings → API Tokens “Preview”).  
- **Front** : page `/preview/homepage` qui appelle l’endpoint avec le token.

**strapi/src/api/homepage/routes/homepage.ts**
```ts
export default {
  routes: [
    { method: 'GET', path: '/homepage/preview', handler: 'homepage.preview', config: { auth: false } }
  ]
};
```

**strapi/src/api/homepage/controllers/homepage.ts**
```ts
export default ({ strapi }) => ({
  async preview(ctx) {
    const secret = ctx.request.query.secret;
    if (secret !== process.env.PREVIEW_TOKEN) return ctx.unauthorized();
    const data = await strapi.entityService.findMany('api::homepage.homepage', { publicationState: 'preview', populate: 'deep' });
    ctx.body = { data };
  }
});
```

**src/app/pages/preview.page.ts** (front)
```ts
// Appel fetch sur /api/homepage/preview avec token (via API_URL), affichage sections sans cache
```

---

# Recherche (option Meilisearch/OpenSearch)

- Ajouter un index **companies** et **exchanges**, synchro via **lifecycles**.

**strapi/src/api/company/content-types/company/lifecycles.ts**
```ts
export default {
  async afterCreate(event) { await indexCompany(event.result); },
  async afterUpdate(event) { await indexCompany(event.result); },
  async afterDelete(event) { await deleteCompany(event.result); }
};
```

---

# Contrat versionné — `@openg7/contracts`

- **Snapshot** : commiter `packages/contracts/spec/openapi.json` à chaque changement de schéma.  
- **CI** : étape `codegen && build` avant le build front.  
- **Semver** : bump mineur en ajout, majeur si breaking (champs supprimés/renommés).

---

# Tests de contrat (front)

**src/app/core/api/strapi-client.spec.ts**
```ts
import { StrapiClient } from './strapi-client';

it('exchanges shape minimal', async () => {
  const api = new StrapiClient();
  const res = await api.exchanges();
  const item = res.data[0];
  expect(item).toHaveProperty('sourceProvince');
  expect(item).toHaveProperty('targetProvince');
  expect(item).toHaveProperty('value');
});
```

---

# RBAC — mapping UI / API

| Rôle (UI) | Permissions Strapi (API) | Visibilité UI (exemples) |
|---|---|---|
| **Visiteur** | Public: GET `/api/sectors`, `/api/provinces`, `/api/companies`, `/api/exchanges`, `/api/homepage` | Voir la carte, filtres, table (read-only) |
| **Éditeur** | Authenticated: POST/PUT/PATCH sur `company`, `homepage` | Boutons “Éditer” visibles ; gardés par `canMatchRole('editor')` |
| **Admin** | Tous droits + settings | Accès admin-only (flags, seeds manuels) |

**Rappel** : le **RBAC UI** ne remplace pas les **permissions Strapi**. Toujours restreindre côté CMS.

---

# CSP report (prod)

- Activer `report-uri /csp-report` côté reverse-proxy.  
- En dev, *mock* possible : endpoint SSR qui logge les rapports.

---

# Carte — lignes directrices performance (flows)

- ≤ **10k** arêtes : rendu Canvas/GL direct OK ; > **10k** : tuiles **MVT** (vector tiles).  
- Simplifier les géométries au-delà d’un zoom donné ; paginer les “companies” visibles.  
- AC : 40 fps desktop, 30 fps laptop milieu de gamme ; filtrage ≤ 200 ms.  

_MAJ (enhanced) : 2025-09-10 20:47:57Z_
