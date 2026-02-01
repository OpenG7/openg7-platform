import { Injectable, inject } from '@angular/core';
import { Og7ModalService } from '@app/core/ui/modal/og7-modal.service';
import { Og7ModalRef } from '@app/core/ui/modal/og7-modal.types';

import { QuickSearchModalComponent, QuickSearchModalData } from './quick-search-modal.component';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « domains/search/feature/quick-search-modal ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Quick Search Launcher ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns QuickSearchLauncherService gérée par le framework.
 */
export class QuickSearchLauncherService {
  private readonly modal = inject(Og7ModalService);

  open(data?: QuickSearchModalData): Og7ModalRef<void> {
    const state = this.modal.getCurrentState();
    if (state?.content === QuickSearchModalComponent) {
      return state.ref as Og7ModalRef<void>;
    }

    return this.modal.open(QuickSearchModalComponent, {
      data,
      width: 'full',
      panelClass: ['bg-surface', 'p-0', 'overflow-hidden'],
      backdropClass: 'bg-slate-900/70 backdrop-blur-sm',
      closeOnBackdrop: true,
      closeOnEsc: true,
      ariaLabel: 'Quick search modal',
    });
  }
}
