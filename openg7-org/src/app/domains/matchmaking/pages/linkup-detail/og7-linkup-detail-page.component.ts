import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LINKUP_STATUS_META,
  LINKUP_TRADE_MODE_OPTIONS,
  LinkupNoteEntry,
  LinkupStatus,
  LinkupStore,
  LinkupTimelineEntry,
  LinkupTradeMode,
} from '@app/domains/matchmaking/data-access/linkup.store';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'og7-linkup-detail-page',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './og7-linkup-detail-page.component.html',
  styleUrls: ['./og7-linkup-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Page de détail d’une mise en relation (`/linkups/:id`).
 * Raison d’être : Visualiser l’état courant, la timeline et les notes internes
 * associées à une relation d’affaires orchestrée via OpenG7.
 */
export class Og7LinkupDetailPageComponent {
  private readonly store = inject(LinkupStore);
  private readonly route = inject(ActivatedRoute);

  private readonly linkupId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly linkup = computed(() => {
    const id = this.linkupId();
    if (!id) {
      return null;
    }
    return this.store.getLinkupById(id);
  });

  protected readonly headerTitle = computed(() => {
    const linkup = this.linkup();
    if (!linkup) {
      return '';
    }
    return `${linkup.companyA.name} ↔ ${linkup.companyB.name}`;
  });

  protected readonly sortedTimeline = computed<readonly LinkupTimelineEntry[]>(() => {
    const linkup = this.linkup();
    if (!linkup) {
      return [];
    }
    return [...linkup.timeline].sort((a, b) => a.date.localeCompare(b.date));
  });

  protected readonly notes = computed<readonly LinkupNoteEntry[]>(() => {
    const linkup = this.linkup();
    if (!linkup) {
      return [];
    }
    return [...linkup.notes].sort((a, b) => b.date.localeCompare(a.date));
  });

  protected statusClass(status: LinkupStatus): string {
    return LINKUP_STATUS_META[status].chipClass;
  }

  protected statusLabel(status: LinkupStatus): string {
    return LINKUP_STATUS_META[status].labelKey;
  }

  protected tradeModeLabel(mode: LinkupTradeMode): string {
    return LINKUP_TRADE_MODE_OPTIONS[mode];
  }
}
