import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { StatisticsActions } from '@app/store/statistics/statistics.actions';
import {
  selectStatisticsAvailableCountries,
  selectStatisticsAvailablePeriods,
  selectStatisticsAvailableProvinces,
  selectStatisticsFilters,
  selectStatisticsHeroSnapshot,
  selectStatisticsInsights,
  selectStatisticsSummaries,
} from '@app/store/statistics/statistics.selectors';
import { StatisticsIntrant, StatisticsScope } from '@app/core/models/statistics';
import { CountryCode, G7_COUNTRY_CODES } from '@app/core/models/country';

@Component({
  standalone: true,
  selector: 'og7-statistics-page',
  imports: [CommonModule, RouterModule, TranslateModule],
  styleUrls: ['./statistics.page.scss'],
  templateUrl: './statistics.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Statistics » du dossier « domains/statistics/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns StatisticsPage gérée par le framework.
 */
export class StatisticsPage {
  private readonly store = inject(Store);

  readonly filtersSig = toSignal(this.store.select(selectStatisticsFilters), {
    initialValue: { scope: 'interprovincial', intrant: 'all', period: null, province: null, country: null },
  });
  readonly summariesSig = toSignal(this.store.select(selectStatisticsSummaries), { initialValue: [] });
  readonly insightsSig = toSignal(this.store.select(selectStatisticsInsights), { initialValue: [] });
  readonly snapshotSig = toSignal(this.store.select(selectStatisticsHeroSnapshot), { initialValue: null });
  protected readonly guidanceAsideId = 'statistics-guidance-heading';
  protected readonly alertAsideId = 'statistics-alert-heading';
  readonly intrantFilters = [
    { id: 'all' as StatisticsIntrant, label: 'pages.statistics.filters.all' },
    { id: 'energy' as StatisticsIntrant, label: 'pages.statistics.filters.energy' },
    { id: 'agriculture' as StatisticsIntrant, label: 'pages.statistics.filters.agriculture' },
    { id: 'manufacturing' as StatisticsIntrant, label: 'pages.statistics.filters.manufacturing' },
    { id: 'services' as StatisticsIntrant, label: 'pages.statistics.filters.services' },
  ];

  private readonly periodsSig = toSignal(this.store.select(selectStatisticsAvailablePeriods), { initialValue: [] as string[] });
  private readonly provincesSig = toSignal(this.store.select(selectStatisticsAvailableProvinces), {
    initialValue: [] as string[],
  });
  private readonly countriesSig = toSignal(this.store.select(selectStatisticsAvailableCountries), {
    initialValue: [] as CountryCode[],
  });

  constructor() {
    this.store.dispatch(StatisticsActions.initialize());
  }

  formatNumber(value: number | null | undefined): string {
    if (typeof value === 'number') {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return '—';
  }

  setScope(scope: StatisticsScope) {
    const filters = this.filtersSig();
    if (filters.scope === scope) {
      return;
    }
    this.store.dispatch(StatisticsActions.changeScope({ scope }));
  }

  setIntrant(intrant: StatisticsIntrant) {
    const filters = this.filtersSig();
    if (filters.intrant === intrant) {
      return;
    }
    this.store.dispatch(StatisticsActions.changeIntrant({ intrant }));
  }

  onPeriodChange(value: string) {
    const next = value?.trim() ? value : null;
    const filters = this.filtersSig();
    if (filters.period === next) {
      return;
    }
    this.store.dispatch(StatisticsActions.changePeriod({ period: next }));
  }

  onProvinceChange(value: string) {
    const next = value?.trim() ? value : null;
    const filters = this.filtersSig();
    if (filters.province === next) {
      return;
    }
    this.store.dispatch(StatisticsActions.changeProvince({ province: next }));
  }

  onCountryChange(value: string) {
    const trimmed = value?.trim().toUpperCase();
    const next = trimmed && (G7_COUNTRY_CODES as readonly string[]).includes(trimmed)
      ? (trimmed as CountryCode)
      : null;
    const filters = this.filtersSig();
    if (filters.country === next) {
      return;
    }
    this.store.dispatch(StatisticsActions.changeCountry({ country: next }));
  }

  periodOptions(): readonly string[] {
    return this.periodsSig();
  }

  provinceOptions(): readonly string[] {
    return this.provincesSig();
  }

  countryOptions(): readonly CountryCode[] {
    return this.countriesSig();
  }

  trackSummary = (_: number, summary: { id: number }) => summary.id;
  trackInsight = (_: number, insight: { id: number }) => insight.id;
}
