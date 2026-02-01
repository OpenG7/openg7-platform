import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  ImportationKpiTile,
  ImportationOverviewViewModel,
  ImportationOriginScope,
  ImportationPeriodGranularity,
} from '../../models/importation.models';

@Component({
  standalone: true,
  selector: 'og7-importation-overview-header',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './importation-overview-header.component.html',
  styleUrls: ['./importation-overview-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Composant de présentation du bandeau d’introduction et des filtres rapides.
 * Raison d’être : Offre les contrôles de période, d’origine et de sections HS ainsi que l’affichage des KPI.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ImportationOverviewHeaderComponent géré par le framework.
 */
export class ImportationOverviewHeaderComponent {
  @Input({ required: true }) viewModel!: ImportationOverviewViewModel;

  @Output() periodGranularityChange = new EventEmitter<ImportationPeriodGranularity>();
  @Output() periodValueChange = new EventEmitter<string | null>();
  @Output() originScopeChange = new EventEmitter<ImportationOriginScope>();
  @Output() originCodesChange = new EventEmitter<readonly string[]>();
  @Output() hsSectionToggle = new EventEmitter<string>();
  @Output() compareModeToggle = new EventEmitter<void>();
  @Output() compareWithChange = new EventEmitter<string | null>();

  sparklineHeight(tile: ImportationKpiTile, index: number): number {
    if (!tile.sparkline.length) {
      return 0;
    }
    const max = Math.max(...tile.sparkline);
    if (max === 0) {
      return 0;
    }
    const value = tile.sparkline[index] ?? 0;
    return Math.max(6, Math.round((value / max) * 100));
  }

  trackKpi = (_: number, item: ImportationKpiTile) => item.id;
  trackOption = (_: number, item: { id: string }) => item.id;

  onGranularitySelect(option: ImportationPeriodGranularity): void {
    this.periodGranularityChange.emit(option);
  }

  onOriginScopeSelect(scope: ImportationOriginScope): void {
    this.originScopeChange.emit(scope);
  }

  onOriginCodesBlur(value: string): void {
    const codes = value
      .split(',')
      .map((code) => code.trim())
      .filter((code) => Boolean(code));
    this.originCodesChange.emit(codes);
  }

  onHsSectionToggle(section: string): void {
    this.hsSectionToggle.emit(section);
  }

  onCompareToggle(): void {
    this.compareModeToggle.emit();
  }

  onCompareWithChange(value: string): void {
    const trimmed = value?.trim() ?? '';
    this.compareWithChange.emit(trimmed.length ? trimmed : null);
  }
}
