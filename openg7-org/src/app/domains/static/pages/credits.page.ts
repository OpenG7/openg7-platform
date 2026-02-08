import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, Input, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
        transition:
          background-color 150ms ease,
          border-color 150ms ease,
          transform 150ms ease;
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
export class ChipComponent {
  @Input() label = '';
}

@Component({
  selector: 'og7-credits-page',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TranslateModule, ChipComponent],
  templateUrl: './credits.page.html',
  styles: [
    `
      :host {
        background: var(--og7-color-page);
        color: var(--og7-color-body);
        display: block;
      }

      .credits-shell {
        position: relative;
      }

      .credits-kpi-card {
        background: var(--og7-color-surface);
        border: 1px solid var(--og7-color-border);
        border-radius: 0.95rem;
        display: grid;
        gap: 0.15rem;
        padding: 0.8rem;
        text-align: center;
      }

      .credits-kpi-value {
        color: var(--og7-color-title);
        font-size: 1.45rem;
        font-weight: 700;
        line-height: 1.1;
      }

      .credits-kpi-label {
        color: var(--og7-color-subtle);
        font-size: 0.78rem;
        line-height: 1.35;
      }

      .credits-filter-chips {
        scrollbar-width: thin;
      }

      .credits-filter-chips::-webkit-scrollbar {
        height: 6px;
      }

      .credits-filter-chips::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--og7-color-border) 76%, transparent);
        border-radius: 9999px;
      }

      .credits-contributor-card {
        min-height: 14.5rem;
        transition:
          transform var(--og7-transition-base),
          box-shadow var(--og7-transition-base),
          border-color var(--og7-transition-base);
      }

      .credits-contributor-card:hover,
      .credits-contributor-card:focus-within {
        border-color: color-mix(in srgb, var(--og7-color-primary) 34%, var(--og7-color-border));
        box-shadow: var(--og7-shadow-card);
        transform: translateY(-2px);
      }

      .contributors-avatar {
        background: var(--og7-color-surface-muted);
        border: 1px solid var(--og7-color-border);
        border-radius: 0.85rem;
        overflow: hidden;
      }

      .contributors-initials {
        color: var(--og7-color-title);
      }

      .contributors-badge {
        background: color-mix(in srgb, var(--og7-color-primary-soft) 66%, var(--og7-color-surface));
        border: 1px solid color-mix(in srgb, var(--og7-color-primary) 26%, var(--og7-color-border));
        border-radius: 9999px;
        color: color-mix(in srgb, var(--og7-color-primary) 66%, var(--og7-color-title));
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        padding: 0.18rem 0.52rem;
      }

      .stack-marker {
        align-items: center;
        background: color-mix(in srgb, var(--og7-color-primary-soft) 84%, var(--og7-color-surface));
        border: 1px solid color-mix(in srgb, var(--og7-color-primary) 24%, var(--og7-color-border));
        border-radius: 0.7rem;
        color: var(--og7-color-primary);
        display: inline-flex;
        font-size: 0.72rem;
        font-weight: 700;
        height: 1.6rem;
        justify-content: center;
        letter-spacing: 0.03em;
        min-width: 1.6rem;
        padding-inline: 0.45rem;
      }

      .method-step-index {
        color: var(--og7-color-primary);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      .governance-list {
        color: var(--og7-color-body);
      }

      .governance-list li::marker {
        color: color-mix(in srgb, var(--og7-color-primary) 55%, var(--og7-color-subtle));
      }

      @media (max-width: 767px) {
        .credits-contributor-card {
          min-height: auto;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .credits-contributor-card {
          transition: none;
        }
      }
    `,
  ],
})
export class CreditsPage {
  private readonly i18n = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseKey = 'pages.credits';

  readonly searchFieldId = 'credits-search';
  readonly currentYear = new Date().getFullYear();

  readonly contributors = signal<Contributor[]>([]);
  readonly pillars = signal<Pillar[]>([]);
  readonly methodologySteps = signal<MethodologyStep[]>([]);
  readonly governancePoints = signal<string[]>([]);

  readonly provinceFilter = signal<string | null>(null);
  readonly search = signal<string>('');

  readonly provincesUnique = computed(() =>
    Array.from(new Set(this.contributors().map((c) => c.province))),
  );

  readonly filteredContributors = computed(() => {
    const query = this.search().trim().toLowerCase();
    const province = this.provinceFilter();

    return this.contributors().filter((contributor) => {
      const matchesProvince = !province || contributor.province === province;
      const haystack = [contributor.name, contributor.role, contributor.impact, ...contributor.skills]
        .join(' ')
        .toLowerCase();
      const matchesText = !query || haystack.includes(query);
      return matchesProvince && matchesText;
    });
  });

  constructor() {
    combineLatest({
      contributors: this.i18n.stream(`${this.baseKey}.contributors.items`),
      pillars: this.i18n.stream(`${this.baseKey}.pillars.items`),
      governance: this.i18n.stream(`${this.baseKey}.governance.points`),
      methodology: this.i18n.stream(`${this.baseKey}.methodology.steps`),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ contributors, pillars, governance, methodology }) => {
        const contributorItems = this.coerceArray<Contributor>(contributors).map((item) => ({
          ...item,
          skills: item.skills ?? [],
        }));
        this.contributors.set(contributorItems);

        const pillarItems = this.coerceArray<Pillar>(pillars).map((item) => ({
          ...item,
          tags: item.tags ?? [],
        }));
        this.pillars.set(pillarItems);

        const governanceMap = this.coerceRecord<string>(governance);
        this.governancePoints.set(governanceMap ? Object.values(governanceMap) : []);

        this.methodologySteps.set(this.coerceArray<MethodologyStep>(methodology));
      });

    effect(() => {
      const province = this.provinceFilter();
      const query = this.search();
      if (province || query) {
        // store.dispatch(logFiltersChanged({ province, query }));
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
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private coerceArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  private coerceRecord<T>(value: unknown): Record<string, T> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, T>)
      : null;
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
