import { Component, DestroyRef, Input, computed, effect, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
        background: rgba(148, 163, 184, 0.22);
        border: 1px solid rgba(226, 232, 240, 0.24);
        border-radius: 9999px;
        color: #f8fafc;
        display: inline-flex;
        gap: 0.5rem;
        line-height: 1.6;
        padding: 0.35rem 0.85rem;
        transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
        backdrop-filter: blur(8px);
      }

      .chip:hover,
      .chip:focus-visible {
        background: rgba(148, 163, 184, 0.36);
        border-color: rgba(226, 232, 240, 0.45);
        transform: translateY(-1px);
      }

      .chip:focus-visible {
        outline: 2px solid rgba(244, 244, 245, 0.6);
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
  imports: [NgFor, NgIf, NgClass, TranslateModule, ChipComponent],
  templateUrl: './credits.page.html',
  styles: [
    `
      :host {
        background: radial-gradient(160% 140% at 10% 10%, rgba(56, 189, 248, 0.08), transparent 60%),
          radial-gradient(140% 120% at 80% 20%, rgba(249, 115, 22, 0.08), transparent 55%),
          #020617;
        color: #e2e8f0;
        display: block;
        font-family: 'Inter', 'Satoshi', 'Segoe UI', system-ui, -apple-system, sans-serif;
      }

      .hero-eyebrow {
        color: rgba(241, 245, 249, 0.88);
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .hero-title {
        color: #f8fafc;
        text-shadow: 0 1px 12px rgba(15, 23, 42, 0.35);
      }

      .hero-subtitle {
        color: rgba(226, 232, 240, 0.88);
        max-width: 46rem;
      }

      .surface-soft {
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 18px 40px -26px rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(18px);
      }

      .surface-strong {
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 22px 48px -24px rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(22px);
      }

      .text-muted {
        color: rgba(226, 232, 240, 0.82);
      }

      .text-subtle {
        color: rgba(203, 213, 225, 0.78);
      }

      .filter-chip {
        align-items: center;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.4);
        border-radius: 9999px;
        color: #f8fafc;
        display: inline-flex;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        padding: 0.4rem 0.95rem;
        transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease;
      }

      .filter-chip:hover,
      .filter-chip:focus-visible {
        background: rgba(148, 163, 184, 0.32);
        border-color: rgba(226, 232, 240, 0.52);
        transform: translateY(-1px);
      }

      .filter-chip:focus-visible {
        outline: 2px solid rgba(244, 244, 245, 0.65);
        outline-offset: 2px;
      }

      .filter-chip.is-active {
        background: rgba(148, 163, 184, 0.8);
        border-color: rgba(226, 232, 240, 0.85);
        color: #0f172a;
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
      }

      .glass-input {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.45);
        border-radius: 0.875rem;
        color: #f8fafc;
        padding: 0.55rem 1.1rem;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }

      .glass-input::placeholder {
        color: rgba(203, 213, 225, 0.72);
      }

      .glass-input:focus-visible {
        border-color: rgba(244, 244, 245, 0.9);
        box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.35);
        outline: none;
      }

      .contributors-card {
        transition: transform 200ms ease, box-shadow 200ms ease;
      }

      .contributors-card:hover,
      .contributors-card:focus-within {
        transform: translateY(-3px);
        box-shadow: 0 30px 65px -32px rgba(15, 23, 42, 0.88);
      }

      .contributors-badge {
        background: rgba(51, 65, 85, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.45);
        border-radius: 9999px;
        color: #f8fafc;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 0.2rem 0.5rem;
      }

      .contributors-avatar {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.45);
        border-radius: 0.9rem;
        overflow: hidden;
      }

      .contributors-initials {
        color: #f1f5f9;
      }

      .community-banner {
        background: linear-gradient(135deg, rgba(148, 163, 184, 0.32), rgba(226, 232, 240, 0.12));
        border: 1px solid rgba(148, 163, 184, 0.38);
        box-shadow: 0 18px 42px -28px rgba(148, 163, 184, 0.65);
      }

      .governance-card {
        border-radius: 1.75rem;
      }

      .governance-list {
        color: rgba(226, 232, 240, 0.86);
      }

      .governance-list li::marker {
        color: rgba(226, 232, 240, 0.56);
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
  private readonly baseKey = 'pages.credits';

  readonly contributors = signal<Contributor[]>([]);

  readonly pillars = signal<Pillar[]>([]);

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
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ contributors, pillars, governance }) => {
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
