import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type SectionKey =
  | 'service'
  | 'access'
  | 'data'
  | 'conduct'
  | 'security'
  | 'continuity';

interface TermsSectionTranslation {
  anchor?: string;
  title: string;
  navLabel?: string;
  tag?: string;
  lede?: string;
  paragraphs?: string[];
  checklistTitle?: string;
  checklist?: string[];
  callout?: {
    title: string;
    body: string[];
    tone?: 'info' | 'warning';
  };
}

type TermsSectionView = TermsSectionTranslation & {
  key: SectionKey;
  anchor: string;
  paragraphs: string[];
  checklist: string[];
};

interface TermsHighlight {
  title: string;
  description: string;
}

interface TermsObligation {
  title: string;
  description: string;
}

interface TermsNavLink {
  anchor: string;
  label: string;
}

interface TermsTimelineEntry {
  date: string;
  label: string;
  description: string;
}

interface TermsSummary {
  title: string;
  description: string;
  points?: string[];
}

interface TermsSupport {
  title: string;
  description: string;
  details?: string[];
  ctaLabel: string;
  ctaEmail: string;
}

interface TermsToc {
  title: string;
}

@Component({
  standalone: true,
  selector: 'og7-terms-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './terms.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Terms » du dossier « domains/static/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns TermsPage gérée par le framework.
 */
export class TermsPage {
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sectionOrder: SectionKey[] = [
    'service',
    'access',
    'data',
    'conduct',
    'security',
    'continuity',
  ];

  protected sections: TermsSectionView[] = [];
  protected highlights: TermsHighlight[] = [];
  protected obligations: TermsObligation[] = [];
  protected navLinks: TermsNavLink[] = [];
  protected timeline: TermsTimelineEntry[] = [];
  protected summary: TermsSummary | null = null;
  protected support: TermsSupport | null = null;
  protected toc: TermsToc | null = null;

  constructor() {
    this.refreshContent();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContent());
  }

  private refreshContent(): void {
    this.sections = this.sectionOrder
      .map((key): TermsSectionView | null => {
        const translation = this.resolveObject<TermsSectionTranslation>(`pages.terms.sections.${key}`);
        if (!translation) {
          return null;
        }

        const callout = translation.callout
          ? {
              ...translation.callout,
              body: this.ensureArray(translation.callout.body),
            }
          : undefined;

        return {
          key,
          anchor: translation.anchor ?? key,
          title: translation.title,
          navLabel: translation.navLabel,
          tag: translation.tag,
          lede: translation.lede,
          paragraphs: this.ensureArray(translation.paragraphs),
          checklistTitle: translation.checklistTitle,
          checklist: this.ensureArray(translation.checklist),
          callout,
        };
      })
      .filter((section): section is TermsSectionView => section !== null);

    this.navLinks = this.sections.map((section) => ({
      anchor: section.anchor,
      label: section.navLabel ?? section.title,
    }));

    this.highlights = this.resolveArray<TermsHighlight>('pages.terms.highlights');
    this.obligations = this.resolveArray<TermsObligation>('pages.terms.obligations.items');
    this.timeline = this.resolveArray<TermsTimelineEntry>('pages.terms.timeline.items');
    this.summary = this.resolveObject<TermsSummary>('pages.terms.summary');
    this.support = this.resolveObject<TermsSupport>('pages.terms.support');
    this.toc = this.resolveObject<TermsToc>('pages.terms.toc');
  }

  private translateInstant<T>(key: string): T | null {
    const value = this.translate.instant(key);
    if (value === key || value === undefined || value === null) {
      return null;
    }
    return value as T;
  }

  private resolveArray<T>(key: string): T[] {
    const value = this.translateInstant<T | T[]>(key);
    if (!value) {
      return [];
    }
    return Array.isArray(value) ? (value as T[]) : [value as T];
  }

  private resolveObject<T>(key: string): T | null {
    const value = this.translateInstant<T>(key);
    if (!value || typeof value !== 'object') {
      return null;
    }
    return value;
  }

  private ensureArray<T>(value: T[] | T | undefined): T[] {
    if (!value) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}
