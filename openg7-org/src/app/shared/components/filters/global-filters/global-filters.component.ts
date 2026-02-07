import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FiltersService, TradeModeFilter } from '@app/core/filters.service';
import { MODE_OPTIONS, SECTOR_OPTIONS } from '@app/core/models/opportunity';
import { TranslateModule } from '@ngx-translate/core';

import { SectorCarouselComponent, Sector } from '../sector-carousel/sector-carousel.component';

const SECTOR_CAROUSEL_OPTIONS: Sector[] = SECTOR_OPTIONS.map((option) => ({
  id: option.value,
  labelKey: option.labelKey,
}));

const TRADE_MODE_SELECT_OPTIONS = MODE_OPTIONS.map((option) => ({
  value: option.value,
  labelKey: `map.filters.tradeMode.${option.value}`,
}));

@Component({
  selector: '[data-og7="filters"]',
  standalone: true,
  imports: [NgFor, SectorCarouselComponent, TranslateModule],
  templateUrl: './global-filters.component.html',
  host: { style: 'display:block' },
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/filters » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Global Filters ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns GlobalFiltersComponent gérée par le framework.
 */
export class GlobalFiltersComponent {
  private static nextId = 0;

  private readonly instanceId = ++GlobalFiltersComponent.nextId;

  protected readonly tradeModeSelectId = `og7TradeMode${this.instanceId}`;
  protected readonly tradeModeLabelId = `og7TradeModeLabel${this.instanceId}`;
  protected readonly groupDescriptionId = `og7TradeModeDescription${this.instanceId}`;
  protected readonly sectorLabelId = `og7SectorLabel${this.instanceId}`;
  protected readonly sectorDescriptionId = `og7SectorDescription${this.instanceId}`;

  readonly filters = inject(FiltersService);
  readonly sectors: Sector[] = SECTOR_CAROUSEL_OPTIONS;
  readonly tradeModeOptions = TRADE_MODE_SELECT_OPTIONS;

  onMode(e: Event) {
    const value = (e.target as HTMLSelectElement).value as TradeModeFilter;
    this.filters.tradeMode.set(value);
  }
}
