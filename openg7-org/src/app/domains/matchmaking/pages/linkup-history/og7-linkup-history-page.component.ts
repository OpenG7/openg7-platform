import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  LINKUP_STATUS_META,
  LINKUP_TRADE_MODE_OPTIONS,
  LinkupRecord,
  LinkupStatus,
  LinkupStore,
  LinkupTradeMode,
} from '@app/domains/matchmaking/data-access/linkup.store';
import { Og7SearchFieldComponent } from '@app/shared/components/search/og7-search-field.component';
import { TranslateModule } from '@ngx-translate/core';

interface StatusFilterOption {
  readonly id: LinkupStatus | 'all';
  readonly labelKey: string;
}

interface TradeModeFilterOption {
  readonly id: LinkupTradeMode | 'all';
  readonly labelKey: string;
}

@Component({
  standalone: true,
  selector: 'og7-linkup-history-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    Og7SearchFieldComponent,
  ],
  templateUrl: './og7-linkup-history-page.component.html',
  styleUrls: ['./og7-linkup-history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Page d’historique des mises en relation (
 * route `/linkups`).
 * Raison d’être : Offrir un tableau filtrable des
 * mises en relation traitées via OpenG7.
 */
export class Og7LinkupHistoryPageComponent {
  private readonly store = inject(LinkupStore);

  protected readonly statuses: readonly StatusFilterOption[] = [
    { id: 'all', labelKey: 'pages.linkups.filters.status.all' },
    { id: 'pending', labelKey: LINKUP_STATUS_META.pending.labelKey },
    { id: 'inDiscussion', labelKey: LINKUP_STATUS_META.inDiscussion.labelKey },
    { id: 'completed', labelKey: LINKUP_STATUS_META.completed.labelKey },
    { id: 'closed', labelKey: LINKUP_STATUS_META.closed.labelKey },
  ];

  protected readonly tradeModes: readonly TradeModeFilterOption[] = [
    { id: 'all', labelKey: 'pages.linkups.filters.tradeMode.all' },
    { id: 'import', labelKey: LINKUP_TRADE_MODE_OPTIONS.import },
    { id: 'export', labelKey: LINKUP_TRADE_MODE_OPTIONS.export },
    { id: 'both', labelKey: LINKUP_TRADE_MODE_OPTIONS.both },
  ];

  protected readonly filterStatus = this.store.filterStatus.asReadonly();
  protected readonly filterMode = this.store.filterMode.asReadonly();
  protected readonly searchTerm = this.store.searchTerm.asReadonly();
  protected readonly filteredLinkups = this.store.filteredLinkups;
  protected readonly hasActiveFilters = this.store.hasActiveFilters;

  protected readonly statusCounts = computed(() => this.store.statusCounts());
  protected readonly totalLinkups = computed(() => this.store.items().length);

  protected statusClass(status: LinkupStatus): string {
    return LINKUP_STATUS_META[status].chipClass;
  }

  protected statusLabel(status: LinkupStatus): string {
    return LINKUP_STATUS_META[status].labelKey;
  }

  protected tradeModeLabel(mode: LinkupTradeMode): string {
    return LINKUP_TRADE_MODE_OPTIONS[mode];
  }

  protected onStatusSelected(status: LinkupStatus | 'all'): void {
    this.store.setStatusFilter(status);
  }

  protected onTradeModeSelected(mode: LinkupTradeMode | 'all'): void {
    this.store.setTradeModeFilter(mode);
  }

  protected onSearchChanged(term: string): void {
    this.store.setSearchTerm(term);
  }

  protected onResetFilters(): void {
    this.store.resetFilters();
  }

  protected trackByLinkupId(_: number, item: LinkupRecord): string {
    return item.id;
  }
}
