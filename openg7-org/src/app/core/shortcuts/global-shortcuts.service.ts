import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { QuickSearchLauncherService } from '@app/domains/search/feature/quick-search-modal/quick-search-launcher.service';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/shortcuts ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Global Shortcuts ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns GlobalShortcutsService gérée par le framework.
 */
export class GlobalShortcutsService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly quickSearchLauncher = inject(QuickSearchLauncherService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private removeListener: (() => void) | null = null;

  constructor() {
    if (!this.isBrowser || !this.document) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const handler = (event: KeyboardEvent) => this.onDocKeydown(event);
      this.document.addEventListener('keydown', handler, true);
      this.removeListener = () => this.document.removeEventListener('keydown', handler, true);
    });
  }

  /**
   * Contexte : Invoked when Angular destroys the singleton during app teardown.
   * Raison d’être : Cleans up the keydown listener to avoid memory leaks in tests or server renders.
   * @returns void
   */
  ngOnDestroy(): void {
    this.removeListener?.();
    this.removeListener = null;
  }

  private onDocKeydown(event: KeyboardEvent): void {
    if (!this.isBrowser || !this.document) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const defaultView = this.document.defaultView;
    if (!defaultView) {
      return;
    }

    const typing =
      target instanceof defaultView.HTMLInputElement ||
      target instanceof defaultView.HTMLTextAreaElement ||
      (target != null && target.isContentEditable);

    if (typing || event.defaultPrevented) {
      return;
    }

    const key = event.key;
    if ((key === 'k' || key === 'K') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.zone.run(() => this.quickSearchLauncher.open({ source: 'global-shortcut' }));
    }
  }
}
