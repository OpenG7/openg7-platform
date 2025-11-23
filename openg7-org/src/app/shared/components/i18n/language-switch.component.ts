import { Component, signal, input, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface Og7LanguageSwitch {
  locales?: string[];
  displayMode?: 'code' | 'flag' | 'both';
}

const FLAG_EMOJI: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧' };

@Component({
  selector: 'og7-i18n-language-switch',
  standalone: true,
  imports: [NgFor, TranslateModule],
  templateUrl: './language-switch.component.html',
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/i18n » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Language Switch ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns LanguageSwitchComponent gérée par le framework.
 */
export class LanguageSwitchComponent {
  readonly config = input<Og7LanguageSwitch>({ locales: ['fr', 'en'], displayMode: 'code' });

  readonly locales = computed(() => this.config().locales ?? ['fr', 'en']);
  readonly displayMode = computed(() => this.config().displayMode ?? 'code');

  readonly lang = signal('fr');
  private storage: Storage | null;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private translate: TranslateService,
  ) {
    this.storage = isPlatformBrowser(platformId) ? window.localStorage : null;

    effect(
      () => {
        const available = this.locales();
        const stored = this.storage?.getItem('locale');
        const initial = stored && available.includes(stored) ? stored : available[0];
        this.lang.set(initial);
        this.translate.use(initial);
      },
      { allowSignalWrites: true },
    );
  }

  label(locale: string): string {
    const code = locale.toUpperCase();
    const flag = FLAG_EMOJI[locale] ?? '';
    switch (this.displayMode()) {
      case 'flag':
        return flag;
      case 'both':
        return `${flag} ${code}`.trim();
      default:
        return code;
    }
  }

  switchLang(locale: string) {
    this.lang.set(locale);
    this.translate.use(locale);
    this.storage?.setItem('locale', locale);
  }
}
