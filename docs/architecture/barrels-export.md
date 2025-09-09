// =============================
// OpenG7 — Barrel d’exports UI
// Angular 19 (standalone), signal-first, i18n-ready
// =============================

// A) Layout & structure
export * from './layout/app-shell.component';
export * from './layout/site-header.component';
export * from './layout/announcement-bar.component';
export * from './layout/quick-nav.component';
export * from './layout/site-footer.component';
export * from './layout/view-toggle.component';

// B) Navigation & a11y
export * from './a11y/skip-links.component';
export * from './navigation/breadcrumbs.component';
export * from './navigation/scroll-top.component';

// C) i18n & langue
export * from './layout/language-switcher.component';
export * from './i18n/locale-banner.component';

// D) Recherche & filtres
export * from './search/search-box.component';
export * from './search/search-suggestions.component';
export * from './search/filters-toolbar.component';
export * from './search/sort-dropdown.component';

// E) Carte & surcouches
export * from './map/trade-map.component';
export * from './map/map-legend.component';
export * from './map/map-sector-chips.component';
export * from './map/map-kpi-badges.component';
export * from './map/map-zoom-control.component';
export * from './map/map-basemap-toggle.component';
export * from './map/map-connection-layer.component';
export * from './map/map-markers-layer.component';
export * from './map/map-highlight-layer.component';
export * from './map/map-tooltip.component';
export * from './map/map-aria-live.component';
export * from './map/map-layers-menu.component';
export * from './map/map-share-link.component';
export * from './map/map-snapshot.component';

// F) Héros & CTA
export * from './hero/hero-section.component';
export * from './hero/hero-copy.component';
export * from './hero/hero-ctas.component';
export * from './cta/cta-button.component';

// G) Bottin & data
export * from './directory/company-table.component';
export * from './directory/company-drawer.component';
export * from './directory/pagination.component';
export * from './directory/export-menu.component';

// H) Insights
export * from './insights/insights-strip.component';
export * from './insights/mini-kpis.component';

// I) Auth (si activé)
export * from './auth/auth-menu.component';
export * from './auth/login-modal.component';
export * from './auth/user-avatar.component';
export * from './auth/signout-button.component';

// J) Overlays & feedback
export * from './overlays/modal-host.component';
export * from './overlays/drawer-host.component';
export * from './feedback/loading-bar.component';
export * from './feedback/toast-center.component';
export * from './feedback/offline-banner.component';

// K) Placeholders
export * from './placeholders/skeleton.component';
export * from './placeholders/empty-state.component';
export * from './placeholders/error-state.component';

// L) Conformité & accessibilité avancée
export * from './compliance/cookie-consent.component';
export * from './compliance/consent-settings.component';
export * from './a11y/accessibility-menu.component';

// M) Marketing / engagement
export * from './trust/trust-strip.component';
export * from './trust/partner-logos.component';
export * from './trust/press-logos.component';
export * from './news/news-feed.component';
export * from './forms/newsletter-form.component';
export * from './forms/contact-form.component';
export * from './content/faq-accordion.component';

// N) Médias
export * from './media/image.component';
export * from './media/video-embed.component';

// O) Pages système
export * from './system/not-found.component';
export * from './system/server-error.component';
export * from './system/maintenance.component';
