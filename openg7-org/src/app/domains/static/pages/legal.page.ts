import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type LegalHighlight = {
  label: string;
  value: string;
  description?: string;
};

type LegalContact = {
  label: string;
  value: string;
  href?: string;
  hint?: string;
};

type ContactContent = {
  title: string;
  description?: string;
  channels: LegalContact[];
};

@Component({
  standalone: true,
  selector: 'og7-legal-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './legal.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Legal » du dossier « domains/static/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns LegalPage gérée par le framework.
 */
export class LegalPage {
  private readonly translate = inject(TranslateService);

  protected readonly sections = ['operator', 'hosting', 'compliance', 'credits'] as const;

  protected get highlights(): LegalHighlight[] {
    const translated = this.translateDictionary<Record<string, LegalHighlight>>('pages.legal.highlights');
    if (!translated) {
      return [];
    }
    return Object.values(translated).filter((item): item is LegalHighlight => !!item?.label && !!item?.value);
  }

  protected get contact(): ContactContent | null {
    const translated = this.translateDictionary<{ title: string; description?: string; channels?: Record<string, LegalContact> }>(
      'pages.legal.contact'
    );
    if (!translated?.title) {
      return null;
    }

    const channels = Object.values(translated.channels ?? {}).filter(
      (channel): channel is LegalContact => !!channel?.label && !!channel?.value
    );

    return {
      title: translated.title,
      description: translated.description,
      channels,
    };
  }

  protected paragraphs(section: (typeof this.sections)[number]): string[] {
    const key = `pages.legal.sections.${section}.paragraphs`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  protected bullets(section: (typeof this.sections)[number]): string[] {
    const key = `pages.legal.sections.${section}.bullets`;
    const value = this.translate.instant(key);
    if (!value || value === key) {
      return [];
    }
    return Array.isArray(value) ? value : [value as string];
  }

  private translateDictionary<T extends Record<string, unknown>>(key: string): T | null {
    const value = this.translate.instant(key);
    if (!value || value === key || typeof value !== 'object') {
      return null;
    }
    return value as T;
  }
}
