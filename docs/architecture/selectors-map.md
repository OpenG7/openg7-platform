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
| `<og7-company-drawer>` | src/app/components/directory/company-drawer.component.ts | Tiroir détails + connexions |
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
| `<og7-map-connection-layer>` | src/app/components/map/map-connection-layer.component.ts | Filaments animés |
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

## Import rapide (exemple)

```ts
// Dans un composant ou une route Angular (standalone)
import {
  SiteHeaderComponent,
  HeroSectionComponent,
  TradeMapComponent,
  FiltersToolbarComponent,
  CompanyTableComponent,
  CompanyDrawerComponent,
  InsightsStripComponent,
  OnboardingWizardComponent,
  SiteFooterComponent
} from 'src/app/components';
