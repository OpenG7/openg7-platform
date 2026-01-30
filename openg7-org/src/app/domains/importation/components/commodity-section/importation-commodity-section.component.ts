import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  ImportationCommodityRowViewModel,
  ImportationCommoditySectionViewModel,
  ImportationCommodityTab,
  ImportationRiskFlag,
} from '../../models/importation.models';

@Component({
  standalone: true,
  selector: 'og7-importation-commodity-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './importation-commodity-section.component.html',
  styleUrls: ['./importation-commodity-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Présente les tableaux d’analyse produits (Top, émergents, risques).
 * Raison d’être : Permet de sélectionner une marchandise pour consultation et de déclencher des exports.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ImportationCommoditySectionComponent géré par le framework.
 */
export class ImportationCommoditySectionComponent {
  @Input({ required: true }) viewModel!: ImportationCommoditySectionViewModel;

  @Output() tabChange = new EventEmitter<ImportationCommodityTab>();
  @Output() commoditySelect = new EventEmitter<string | null>();
  @Output() exportRequest = new EventEmitter<'csv' | 'json' | 'look'>();

  trackTab = (_: number, item: { id: ImportationCommodityTab }) => item.id;
  trackRow = (_: number, row: ImportationCommodityRowViewModel) => row.id;
  trackFlag = (_: number, flag: ImportationRiskFlag) => flag.id;

  onTabChange(tab: ImportationCommodityTab): void {
    this.tabChange.emit(tab);
  }

  onRowSelect(row: ImportationCommodityRowViewModel): void {
    const selected = this.viewModel.selectedCommodityId === row.id ? null : row.id;
    this.commoditySelect.emit(selected);
  }

  onExport(type: 'csv' | 'json' | 'look'): void {
    this.exportRequest.emit(type);
  }

  formatDelta(value: number | null | undefined): string {
    if (typeof value !== 'number') {
      return '—';
    }
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  }
}
