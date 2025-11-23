import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const FAQ_ITEM_KEYS = ['platform', 'data', 'pricing', 'support', 'partners'] as const;
type FaqItemKey = (typeof FAQ_ITEM_KEYS)[number];

@Component({
  standalone: true,
  selector: 'og7-faq-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './faq.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Faq » du dossier « domains/static/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FaqPage gérée par le framework.
 */
export class FaqPage {
  private readonly translate = inject(TranslateService);

  protected readonly items = FAQ_ITEM_KEYS;
  protected readonly supportEmail = 'support@openg7.org';
  protected readonly supportPhone = '+1 (613) 555-0187';
  protected readonly supportPhoneHref = '+16135550187';
  protected readonly searchFieldId = 'faq-search';
  protected query = '';

  protected get filteredItems(): readonly FaqItemKey[] {
    const normalizedQuery = this.normalizeForSearch(this.query);
    if (!normalizedQuery.length) {
      return this.items;
    }
    return this.items.filter(item => this.matchesQuery(item, normalizedQuery));
  }

  protected onQueryChange(value: string): void {
    this.query = value ?? '';
  }

  protected answers(item: FaqItemKey): string[] {
    const key = `pages.faq.items.${item}.answers`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  protected bullets(item: FaqItemKey): string[] {
    const key = `pages.faq.items.${item}.bullets`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  private matchesQuery(item: FaqItemKey, normalizedQuery: string): boolean {
    const questionKey = `pages.faq.items.${item}.question`;
    const question = this.translate.instant(questionKey);
    const segments = [question, ...this.answers(item), ...this.bullets(item)];
    return segments.some(segment => this.normalizeForSearch(segment).includes(normalizedQuery));
  }

  private normalizeForSearch(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }
    const stringValue = value.toString();
    if (!stringValue.trim().length) {
      return '';
    }
    return stringValue
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
