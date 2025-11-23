import { Directive, HostListener, Input, inject } from '@angular/core';
import { QuickSearchLauncherService } from '@app/domains/search/feature/quick-search-modal/quick-search-launcher.service';

@Directive({
  selector: '[og7CtrlK]',
  standalone: true,
})
/**
 * Context: Applied on buttons or links that must surface the global quick search when users press Ctrl+K or click.
 * Raison d’être: Centralizes the wiring to `QuickSearchLauncherService` so every shortcut-enabled entry point behaves consistently.
 * @returns {CtrlKDirective} Angular directive managing the quick search shortcut for its host element.
 */
/**
 * Contexte : Appliquée dans les templates du dossier « shared/directives » en tant que directive Angular.
 * Raison d’être : Factorise le comportement DOM lié à « Ctrl » pour le rendre réutilisable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns CtrlKDirective gérée par le framework.
 */
export class CtrlKDirective {
  private readonly launcher = inject(QuickSearchLauncherService);

  /** Disable the shortcut entirely when set to true. */
  @Input() og7CtrlKDisabled = false;
  /** Optional source metadata forwarded to analytics. */
  @Input() og7CtrlKSource = 'ctrlk';
  /** When true, clicking the host element opens the quick search modal. */
  @Input('og7CtrlK') clickToOpen = false;

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.og7CtrlKDisabled) {
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.launcher.open({ source: this.og7CtrlKSource });
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.clickToOpen || this.og7CtrlKDisabled) {
      return;
    }
    event.preventDefault();
    this.launcher.open({ source: this.og7CtrlKSource });
  }
}
