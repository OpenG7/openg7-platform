import { isPlatformBrowser } from '@angular/common';
import { Directive, DestroyRef, ElementRef, PLATFORM_ID, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[og7SparksBackground]',
  standalone: true,
})
/**
 * Context: Used on hero or marketing containers that display the animated sparks background on landing pages.
 * Raison d’être: Provides a reusable parallax effect bound to pointer movements so branded surfaces stay consistent across the app.
 * @returns {Og7SparksBackgroundDirective} Angular directive adding the sparks visual effect to its host element.
 */
/**
 * Contexte : Appliquée dans les templates du dossier « shared/directives » en tant que directive Angular.
 * Raison d’être : Factorise le comportement DOM lié à « Og7 Sparks Background » pour le rendre réutilisable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7SparksBackgroundDirective gérée par le framework.
 */
export class Og7SparksBackgroundDirective {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  constructor() {
    const el = this.element.nativeElement;
    this.renderer.addClass(el, 'og7-sparks-surface');
    this.renderer.setStyle(el, '--spark-parallax-x', '0');
    this.renderer.setStyle(el, '--spark-parallax-y', '0');
    if (this.browser) {
      this.bindParallax(el);
    }
  }

  private bindParallax(el: HTMLElement): void {
    const handler = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
      const relY = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
      const offsetX = (relX - 0.5) * 20;
      const offsetY = (relY - 0.5) * 12;
      this.renderer.setStyle(el, '--spark-parallax-x', `${offsetX.toFixed(2)}px`);
      this.renderer.setStyle(el, '--spark-parallax-y', `${offsetY.toFixed(2)}px`);
    };

    el.addEventListener('pointermove', handler, { passive: true });
    this.destroyRef.onDestroy(() => {
      el.removeEventListener('pointermove', handler);
    });
  }
}
