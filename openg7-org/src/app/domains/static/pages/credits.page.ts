import { NgClass, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, Input, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxStarrySkyComponent } from '@omnedia/ngx-starry-sky';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'og7-chip',
  standalone: true,
  imports: [NgIf],
  template: `
    <span class="chip" [attr.aria-label]="label || null">
      <ng-content />
      <span *ngIf="label" class="chip-label">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .chip {
        align-items: center;
        background: var(--og7-color-surface-muted);
        border: 1px solid var(--og7-color-border);
        border-radius: 9999px;
        color: var(--og7-color-body);
        display: inline-flex;
        gap: 0.5rem;
        line-height: 1.6;
        padding: 0.35rem 0.85rem;
        transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
        backdrop-filter: blur(8px);
      }

      .chip:hover,
      .chip:focus-visible {
        background: var(--og7-color-card-hover);
        border-color: var(--og7-color-border);
        transform: translateY(-1px);
      }

      .chip:focus-visible {
        outline: 2px solid var(--og7-ring-focus);
        outline-offset: 2px;
      }

      .chip-label {
        font-weight: 600;
        letter-spacing: 0.01em;
      }
    `,
  ],
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/static/pages » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Chip ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ChipComponent gérée par le framework.
 */
export class ChipComponent {
  @Input() label = '';
}

@Component({
  selector: 'og7-credits-page',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TranslateModule, ChipComponent, NgxStarrySkyComponent],
  templateUrl: './credits.page.html',
  styles: [
    `
      :host {
        background: var(--og7-color-page);
        color: var(--og7-color-body);
        display: block;
        font-family: var(--og7-font-family-base);
      }

      .credits-shell {
        position: relative;
        overflow: hidden;
      }

      .credits-starry-sky {
        display: block;
        inset: 0;
        opacity: 0.45;
        pointer-events: none;
        position: absolute;
        z-index: 1;
      }

      .credits-content {
        position: relative;
        z-index: 2;
      }

      .hero-eyebrow {
        color: var(--og7-color-subtle);
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .hero-title {
        color: var(--og7-color-title);
        text-shadow: 0 1px 12px rgba(15, 23, 42, 0.15);
        font-family: var(--og7-font-family-display, var(--og7-font-family-base));
      }

      .hero-copy-surface {
        background: color-mix(in srgb, var(--og7-color-surface) 84%, transparent);
        border: 1px solid color-mix(in srgb, var(--og7-color-border) 82%, transparent);
        box-shadow: var(--og7-shadow-card);
        backdrop-filter: blur(10px);
      }

      .hero-subtitle {
        color: var(--og7-color-body);
        max-width: 38rem;
      }

      .hero-cta {
        transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, opacity 180ms ease;
      }

      .hero-cta:hover,
      .hero-cta:focus-visible {
        transform: translateY(-1px);
      }

      .hero-cta:focus-visible {
        outline: 2px solid var(--og7-ring-focus);
        outline-offset: 2px;
      }

      .hero-cta-primary {
        background: linear-gradient(135deg, var(--og7-color-primary), var(--og7-color-tertiary));
      }

      .hero-cta-primary:hover,
      .hero-cta-primary:focus-visible {
        box-shadow: 0 14px 24px -18px color-mix(in srgb, var(--og7-color-primary) 70%, transparent);
      }

      .hero-cta-secondary {
        background: color-mix(in srgb, var(--og7-color-surface) 88%, transparent);
        border: 1px solid var(--og7-color-border);
      }

      .hero-cta-secondary:hover,
      .hero-cta-secondary:focus-visible {
        background: var(--og7-color-card-hover);
      }

      .surface-soft {
        background: var(--og7-color-surface);
        border: 1px solid var(--og7-color-border);
        box-shadow: var(--og7-shadow-e1);
      }

      .filters-shell {
        box-shadow: var(--og7-shadow-e1);
      }

      .credits-filter-chips {
        scrollbar-width: thin;
      }

      .credits-filter-chips::-webkit-scrollbar {
        height: 6px;
      }

      .credits-filter-chips::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--og7-color-border) 72%, transparent);
        border-radius: 9999px;
      }

      .surface-strong {
        background: var(--og7-color-surface-muted);
        border: 1px solid var(--og7-color-border);
        box-shadow: var(--og7-shadow-card);
      }

      .text-muted {
        color: var(--og7-color-subtle);
      }

      .text-subtle {
        color: var(--og7-color-subtle);
      }

      .filter-chip {
        align-items: center;
        background: var(--og7-color-surface);
        border: 1px solid var(--og7-color-border);
        border-radius: 9999px;
        color: var(--og7-color-body);
        display: inline-flex;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        padding: 0.4rem 0.95rem;
        transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease;
      }

      .filter-chip:hover,
      .filter-chip:focus-visible {
        background: var(--og7-color-card-hover);
        border-color: var(--og7-color-border);
        transform: translateY(-1px);
      }

      .filter-chip:focus-visible {
        outline: 2px solid var(--og7-ring-focus);
        outline-offset: 2px;
      }

      .filter-chip.is-active {
        background: var(--og7-color-primary-soft);
        border-color: var(--og7-color-primary);
        color: var(--og7-color-primary);
        text-shadow: none;
      }

      .glass-input {
        background: var(--og7-color-surface);
        border: 1px solid var(--og7-color-border);
        border-radius: 0.875rem;
        color: var(--og7-color-title);
        padding: 0.55rem 1.1rem;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }

      .glass-input::placeholder {
        color: var(--og7-color-subtle);
      }

      .glass-input:focus-visible {
        border-color: var(--og7-color-primary);
        box-shadow: 0 0 0 3px var(--og7-ring-focus);
        outline: none;
      }

      .contributors-card {
        display: flex;
        flex-direction: column;
        min-height: 15.75rem;
        transition: transform 200ms ease, box-shadow 200ms ease;
      }

      .contributors-card:hover,
      .contributors-card:focus-within {
        transform: translateY(-3px);
        box-shadow: var(--og7-shadow-card);
      }

      .contributors-badge {
        background: var(--og7-color-primary-soft);
        border: 1px solid var(--og7-color-border);
        border-radius: 9999px;
        color: var(--og7-color-primary);
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 0.2rem 0.5rem;
      }

      .contributors-avatar {
        background: var(--og7-color-surface-muted);
        border: 1px solid var(--og7-color-border);
        border-radius: 0.9rem;
        overflow: hidden;
      }

      .contributors-initials {
        color: var(--og7-color-title);
      }

      .community-banner {
        background: linear-gradient(135deg, var(--og7-color-primary-soft), var(--og7-color-tertiary-soft));
        border: 1px solid var(--og7-color-border);
        box-shadow: var(--og7-shadow-e1);
      }

      .stack-card {
        transition: transform 180ms ease, box-shadow 180ms ease;
      }

      .stack-card:hover,
      .stack-card:focus-within {
        box-shadow: var(--og7-shadow-card);
        transform: translateY(-2px);
      }

      .methodology-shell {
        background: linear-gradient(
          130deg,
          color-mix(in srgb, var(--og7-color-surface) 88%, transparent),
          color-mix(in srgb, var(--og7-color-primary-soft) 58%, transparent)
        );
        border: 1px solid var(--og7-color-border);
        box-shadow: var(--og7-shadow-card);
      }

      .method-step {
        background: color-mix(in srgb, var(--og7-color-surface) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--og7-color-border) 88%, transparent);
        min-height: 9.5rem;
      }

      .method-step-index {
        color: var(--og7-color-primary);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.16em;
      }

      .governance-card {
        border-radius: 1.75rem;
      }

      .governance-list {
        color: var(--og7-color-body);
      }

      .governance-list li::marker {
        color: var(--og7-color-subtle);
      }

      .reveal-up {
        animation: credits-reveal-up 440ms ease both;
        animation-delay: calc(var(--reveal-order, 1) * 48ms);
      }

      @keyframes credits-reveal-up {
        0% {
          opacity: 0;
          transform: translateY(8px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 767px) {
        .filters-shell {
          top: 0.75rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .credits-starry-sky {
          opacity: 0.18;
        }

        .reveal-up {
          animation: none;
        }
      }
    `,
  ],
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Credits » du dossier « domains/static/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns CreditsPage gérée par le framework.
 */
export class CreditsPage {
  private readonly i18n = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseKey = 'pages.credits';

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly searchFieldId = 'credits-search';

  readonly starrySkyColor = 'transparent';
  readonly starsBackgroundConfig = {
    starDensity: 0.0022,
    allStarsTwinkle: true,
    twinkleProbability: 0.75,
    minTwinkleSpeed: 0.4,
    maxTwinkleSpeed: 0.9,
  };
  readonly shootingStarsConfig = {
    minSpeed: 16,
    maxSpeed: 32,
    minDelay: 1500,
    maxDelay: 5200,
    starColor: '#ffffff',
    trailColor: '#7dd3fc',
    starWidth: 12,
    starHeight: 1,
  };

  readonly contributors = signal<Contributor[]>([]);

  readonly pillars = signal<Pillar[]>([]);
  readonly methodologySteps = signal<MethodologyStep[]>([]);

  readonly provinceFilter = signal<string | null>(null);
  readonly search = signal<string>('');

  readonly provincesUnique = computed(() => Array.from(new Set(this.contributors().map(c => c.province))));

  readonly filteredContributors = computed(() => {
    const q = this.search().trim().toLowerCase();
    const pf = this.provinceFilter();
    return this.contributors().filter(c => {
      const matchesProvince = !pf || c.province === pf;
      const haystack = [c.name, c.role, c.impact, ...(c.skills ?? [])].join(' ').toLowerCase();
      const inText = !q || haystack.includes(q);
      return matchesProvince && inText;
    });
  });

  readonly governancePoints = signal<string[]>([]);

  readonly currentYear = new Date().getFullYear();

  constructor() {
    combineLatest({
      contributors: this.i18n.stream(`${this.baseKey}.contributors.items`),
      pillars: this.i18n.stream(`${this.baseKey}.pillars.items`),
      governance: this.i18n.stream(`${this.baseKey}.governance.points`),
      methodology: this.i18n.stream(`${this.baseKey}.methodology.steps`),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ contributors, pillars, governance, methodology }) => {
        const contributorItems = this.coerceArray<Contributor>(contributors).map(item => ({
          ...item,
          skills: item.skills ?? [],
        }));
        this.contributors.set(contributorItems);

        const pillarItems = this.coerceArray<Pillar>(pillars).map(item => ({
          ...item,
          tags: item.tags ?? [],
        }));
        this.pillars.set(pillarItems);

        const governancePoints = this.coerceRecord<string>(governance);
        this.governancePoints.set(governancePoints ? Object.values(governancePoints) : []);

        const methodologySteps = this.coerceArray<MethodologyStep>(methodology);
        this.methodologySteps.set(methodologySteps);
      });

    effect(() => {
      const pf = this.provinceFilter();
      const q = this.search();
      if (pf || q) {
        // store.dispatch(logFiltersChanged({ province: pf, q }));
      }
    });
  }

  resetFilters(): void {
    this.provinceFilter.set(null);
    this.search.set('');
  }

  toggleProvinceFilter(province: string): void {
    this.provinceFilter.set(this.provinceFilter() === province ? null : province);
  }

  isProvinceActive(province: string): boolean {
    return this.provinceFilter() === province;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private coerceArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  private coerceRecord<T>(value: unknown): Record<string, T> | null {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, T>) : null;
  }
}

export interface Contributor {
  id: string;
  name: string;
  role: string;
  province: string;
  impact: string;
  skills: string[];
  avatarUrl?: string;
}

export interface Pillar {
  title: string;
  summary: string;
  tags: string[];
}

export interface MethodologyStep {
  title: string;
  copy: string;
}
