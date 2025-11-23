import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FinancingBanner } from '@app/core/models/partner-profile';

@Component({
  selector: 'og7-financing-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './og7-financing-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/financing » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Financing Banner ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FinancingBannerComponent gérée par le framework.
 */
export class Og7FinancingBannerComponent {
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly banner = input<FinancingBanner | null>(null);
  readonly ctaClicked = output<string>();

  private readonly locale = signal<'fr' | 'en'>(this.resolveLocale(this.translate.currentLang));

  protected readonly title = computed(() => {
    const entity = this.banner();
    if (!entity) {
      return '';
    }
    const lang = this.locale();
    return entity.title[lang] ?? entity.title.en;
  });

  protected readonly body = computed(() => {
    const entity = this.banner();
    if (!entity) {
      return '';
    }
    const lang = this.locale();
    return entity.body[lang] ?? entity.body.en;
  });

  protected readonly ctaLabel = computed(() => {
    const entity = this.banner();
    if (!entity) {
      return '';
    }
    const lang = this.locale();
    return entity.ctaLabel[lang] ?? entity.ctaLabel.en;
  });

  constructor() {
    const sub = this.translate.onLangChange.subscribe((event) => {
      this.locale.set(this.resolveLocale(event.lang));
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private resolveLocale(lang: string | null | undefined): 'fr' | 'en' {
    if (!lang) {
      return 'en';
    }
    const lower = lang.toLowerCase();
    return lower.startsWith('fr') ? 'fr' : 'en';
  }
}
