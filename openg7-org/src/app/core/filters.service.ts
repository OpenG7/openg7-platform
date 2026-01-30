import { Injectable, computed, signal } from '@angular/core';

import { ProvinceCode, SectorType } from './models/opportunity';
import {
  DEFAULT_OPPORTUNITY_MATCH_LAYOUT,
  OpportunityMatchLayout,
} from './models/opportunity-match-layout';

export type TradeModeFilter = 'all' | 'import' | 'export';
export type TradeProvinceFilter = ProvinceCode | 'all';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Filters ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FiltersService gérée par le framework.
 */
export class FiltersService {
  tradeMode = signal<TradeModeFilter>('all');
  activeSector = signal<SectorType | null>(null);
  tradePartner = signal<string>('canada-to-europe');
  matchProvince = signal<TradeProvinceFilter>('all');
  matchQuery = signal('');
  matchCardLayout = signal<OpportunityMatchLayout>(DEFAULT_OPPORTUNITY_MATCH_LAYOUT);
  private readonly matchCardLayoutLocked = signal(false);
  tradeFilters = computed(() => ({ mode: this.tradeMode(), sector: this.activeSector() }));
  opportunityFilters = computed(() => ({
    ...this.tradeFilters(),
    province: this.matchProvince(),
    query: this.matchQuery(),
  }));

  /**
   * Contexte : Triggered by match sections when telemetry suggests a better layout for the current viewport.
   * Raison d’être : Allows feature components to hint a layout without overriding explicit user choices.
   * @param layout Proposed layout to adopt when the user has not locked their preference.
   * @returns void
   */
  suggestMatchCardLayout(layout: OpportunityMatchLayout): void {
    if (this.matchCardLayoutLocked()) {
      return;
    }
    if (this.matchCardLayout() === layout) {
      return;
    }
    this.matchCardLayout.set(layout);
  }

  /**
   * Contexte : Called by UI controls when the user explicitly selects a layout option.
   * Raison d’être : Locks the layout so automatic suggestions stop overriding the user decision.
   * @param layout Layout chosen by the user via the UI control.
   * @returns void
   */
  overrideMatchCardLayout(layout: OpportunityMatchLayout): void {
    this.matchCardLayoutLocked.set(true);
    this.matchCardLayout.set(layout);
  }

  /**
   * Contexte : Used by reset actions to restore the default layout configuration.
   * Raison d’être : Clears the lock and returns to the standard layout so adaptive suggestions work again.
   * @returns void
   */
  resetMatchCardLayout(): void {
    this.matchCardLayoutLocked.set(false);
    this.matchCardLayout.set(DEFAULT_OPPORTUNITY_MATCH_LAYOUT);
  }
}
