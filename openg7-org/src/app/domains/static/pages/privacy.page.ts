import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type SectionKey = 'collection' | 'usage' | 'sharing' | 'security' | 'rights' | 'contact';

type SectionConfig = {
  readonly key: SectionKey;
  readonly accent: string;
};

type Highlight = {
  readonly title: string;
  readonly description: string;
};

type SummaryItem = {
  readonly label: string;
  readonly description: string;
};

@Component({
  standalone: true,
  selector: 'og7-privacy-page',
  imports: [CommonModule, TranslateModule, NgClass],
  templateUrl: './privacy.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Privacy » du dossier « domains/static/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns PrivacyPage gérée par le framework.
 */
export class PrivacyPage {
  private readonly translate = inject(TranslateService);

  protected readonly sections: ReadonlyArray<SectionConfig> = [
    { key: 'collection', accent: 'from-cyan-500 to-blue-500' },
    { key: 'usage', accent: 'from-blue-500 to-indigo-500' },
    { key: 'sharing', accent: 'from-indigo-500 to-purple-500' },
    { key: 'security', accent: 'from-emerald-500 to-teal-500' },
    { key: 'rights', accent: 'from-amber-500 to-orange-500' },
    { key: 'contact', accent: 'from-rose-500 to-pink-500' },
  ];

  protected paragraphs(section: SectionKey): string[] {
    const key = `pages.privacy.sections.${section}.paragraphs`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  protected bullets(section: SectionKey): string[] {
    const key = `pages.privacy.sections.${section}.bullets`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  protected highlights(): Highlight[] {
    const value = this.translate.instant('pages.privacy.highlights');
    if (!Array.isArray(value)) {
      return [];
    }
    return value as Highlight[];
  }

  protected summaryItems(): SummaryItem[] {
    const value = this.translate.instant('pages.privacy.summaryCard.items');
    if (!Array.isArray(value)) {
      return [];
    }
    return value as SummaryItem[];
  }

  protected contactEmail(): string {
    const value = this.translate.instant('pages.privacy.contactEmail');
    if (typeof value === 'string' && value.trim().length) {
      return value;
    }
    return 'privacy@openg7.org';
  }

  protected sectionAnchor(section: SectionConfig): string {
    return `privacy-${section.key}`;
  }

  protected trackBySection = (_: number, section: SectionConfig) => section.key;
}
