import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { selectProvinces, selectSectors } from '@app/state/catalog/catalog.selectors';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { OpportunityContextAsideComponent } from '../components/opportunity-context-aside.component';
import { OpportunityDetailBodyComponent } from '../components/opportunity-detail-body.component';
import { OpportunityDetailHeaderComponent } from '../components/opportunity-detail-header.component';
import {
  OpportunityAlertItem,
  OpportunityDetailVm,
  OpportunityOfferPayload,
  OpportunityQnaMessage,
  OpportunityQnaTab,
  OpportunitySyncState,
} from '../components/opportunity-detail.models';
import { OpportunityOfferDrawerComponent } from '../components/opportunity-offer-drawer.component';
import { FeedItem } from '../models/feed.models';
import { FeedRealtimeService } from '../services/feed-realtime.service';

@Component({
  selector: 'og7-feed-opportunity-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    OpportunityDetailHeaderComponent,
    OpportunityDetailBodyComponent,
    OpportunityContextAsideComponent,
    OpportunityOfferDrawerComponent,
  ],
  templateUrl: './feed-opportunity-detail.page.html',
  styleUrl: './feed-opportunity-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedOpportunityDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly feed = inject(FeedRealtimeService);
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly itemId = toSignal(this.route.paramMap.pipe(map(params => params.get('itemId'))), {
    initialValue: this.route.snapshot.paramMap.get('itemId'),
  });

  private readonly localMessages = signal<readonly OpportunityQnaMessage[]>([]);
  private readonly syncTimers: ReturnType<typeof setTimeout>[] = [];

  protected readonly loading = this.feed.loading;
  protected readonly error = this.feed.error;

  protected readonly headerCompact = signal(false);
  protected readonly offerDrawerOpen = signal(false);
  protected readonly saved = signal(false);
  protected readonly qnaTab = signal<OpportunityQnaTab>('questions');
  protected readonly syncState = signal<OpportunitySyncState>('synced');

  protected readonly provinces = this.store.selectSignal(selectProvinces);
  protected readonly sectors = this.store.selectSignal(selectSectors);

  protected readonly provinceNameMap = computed(() => {
    const map = new Map<string, string>();
    for (const province of this.provinces()) {
      map.set(province.id, province.name);
    }
    return map;
  });

  protected readonly sectorNameMap = computed(() => {
    const map = new Map<string, string>();
    for (const sector of this.sectors()) {
      map.set(sector.id, sector.name);
    }
    return map;
  });

  protected readonly selectedItem = computed(() => {
    const id = this.itemId();
    if (!id) {
      return null;
    }
    return this.feed.items().find(item => item.id === id) ?? null;
  });

  protected readonly detailVm = computed(() => {
    const item = this.selectedItem();
    if (!item) {
      return null;
    }
    return this.buildDetailVm(item);
  });

  protected readonly qnaMessages = computed(() => {
    const detail = this.detailVm();
    if (!detail) {
      return this.localMessages();
    }
    return [...detail.qnaMessages, ...this.localMessages()];
  });

  protected readonly isConnected = computed(() => this.feed.connectionState.connected());

  protected readonly lastUpdatedLabel = computed(() => {
    const detail = this.detailVm();
    if (!detail) {
      return this.translate.instant('feed.opportunity.detail.justNow');
    }
    return this.relativeTime(detail.updatedAtIso);
  });

  protected readonly ownerMode = computed(() => this.detailVm()?.item.source.kind === 'USER');

  constructor() {
    effect(() => {
      if (!this.feed.hasHydrated()) {
        this.feed.loadInitial();
      }
    });

    effect(
      () => {
        this.itemId();
        this.localMessages.set([]);
        this.qnaTab.set('questions');
        this.offerDrawerOpen.set(false);
        this.saved.set(false);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        if (!this.isConnected()) {
          this.syncState.set('offline');
          return;
        }
        if (this.syncState() === 'offline') {
          this.syncState.set('synced');
        }
      },
      { allowSignalWrites: true }
    );

    this.destroyRef.onDestroy(() => this.clearSyncTimers());
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.headerCompact.set(window.scrollY > 56);
  }

  @HostListener('document:keydown', ['$event'])
  protected onShortcuts(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    const target = event.target;
    const editing =
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

    if (key === 'escape' && this.offerDrawerOpen()) {
      event.preventDefault();
      this.offerDrawerOpen.set(false);
      return;
    }

    if (editing) {
      return;
    }

    if (key === 's') {
      event.preventDefault();
      this.handleSaveToggle();
    }
  }

  protected openOfferDrawer(): void {
    this.offerDrawerOpen.set(true);
  }

  protected closeOfferDrawer(): void {
    this.offerDrawerOpen.set(false);
  }

  protected handleSaveToggle(): void {
    this.saved.update(value => !value);
    this.simulateSync();
  }

  protected async handleShare(): Promise<void> {
    const detail = this.detailVm();
    const url = this.getShareUrl();
    if (!detail) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: detail.title, text: detail.summaryHeadline, url });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Intentionally ignored: user cancellation is not an error state.
    }
  }

  protected handleTagFilter(tag: string): void {
    const normalized = tag.trim().toLowerCase();
    const detail = this.detailVm();
    const queryParams: Params = {};

    if (normalized.includes('import')) {
      queryParams['mode'] = 'IMPORT';
    }

    if (normalized.includes('energy') && detail?.item.sectorId) {
      queryParams['sector'] = detail.item.sectorId;
    }

    if (normalized.includes('winter') || normalized.includes('hiver')) {
      queryParams['q'] = 'winter';
    }

    void this.router.navigate(['/feed'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  protected handleReport(): void {
    this.syncState.set('saved-local');
  }

  protected handleDuplicate(): void {
    this.simulateSync();
  }

  protected handleArchive(): void {
    this.syncState.set('saved-local');
  }

  protected openAlerts(): void {
    void this.router.navigate(['/alerts']);
  }

  protected handleOfferSubmitted(payload: OpportunityOfferPayload): void {
    const message = `${payload.capacityMw} MW · ${payload.pricingModel} · ${payload.startDate} -> ${payload.endDate}`;
    this.localMessages.update(entries => [
      {
        id: `offer-${Date.now()}`,
        tab: 'offers',
        author: this.translate.instant('feed.sourceYou'),
        content: message,
        createdAt: this.translate.instant('feed.opportunity.detail.justNow'),
      },
      ...entries,
    ]);
    this.qnaTab.set('offers');
    this.offerDrawerOpen.set(false);
    this.simulateSync();
  }

  protected handleQnaSubmit(content: string): void {
    const tab = this.qnaTab();
    this.localMessages.update(entries => [
      {
        id: `qna-${Date.now()}`,
        tab,
        author: this.translate.instant('feed.sourceYou'),
        content,
        createdAt: this.translate.instant('feed.opportunity.detail.justNow'),
      },
      ...entries,
    ]);
    this.simulateSync();
  }

  protected setQnaTab(tab: OpportunityQnaTab): void {
    this.qnaTab.set(tab);
  }

  private buildDetailVm(item: FeedItem): OpportunityDetailVm {
    const fromLabel = this.resolveProvinceLabel(item.fromProvinceId) ?? 'Quebec';
    const toLabel = this.resolveProvinceLabel(item.toProvinceId) ?? 'Ontario';
    const sectorLabel = this.resolveSectorLabel(item.sectorId) ?? this.translate.instant('feed.opportunity.detail.energy');
    const routeLabel = `${fromLabel} -> ${toLabel}`;
    const capacityMw =
      item.quantity && item.quantity.unit === 'MW' && Number.isFinite(item.quantity.value)
        ? Math.round(item.quantity.value)
        : 300;

    const visibilityLabel = item.source.kind === 'PARTNER'
      ? this.translate.instant('feed.opportunity.detail.visibilityNetwork')
      : this.translate.instant('feed.opportunity.detail.visibilityPublic');

    const urgencyLabel =
      (item.urgency ?? 0) >= 3
        ? this.translate.instant('feed.opportunity.detail.urgencyWinterPeak')
        : null;

    const tags = this.buildTags(item, sectorLabel);

    const docs = [
      {
        id: 'doc-term-sheet',
        label: this.translate.instant('feed.opportunity.detail.doc.termSheet'),
        href: 'https://www.ieso.ca',
        kind: 'pdf' as const,
      },
      {
        id: 'doc-operator-link',
        label: this.translate.instant('feed.opportunity.detail.doc.operator'),
        href: 'https://www.hydroquebec.com',
        kind: 'link' as const,
      },
      {
        id: 'doc-connection',
        label: this.translate.instant('feed.opportunity.detail.doc.connectionDiagram'),
        href: 'https://www.hydroone.com',
        kind: 'pdf' as const,
      },
    ];

    const messages: OpportunityQnaMessage[] = [
      {
        id: `${item.id}-q1`,
        tab: 'questions',
        author: 'Grid Ops',
        content: this.translate.instant('feed.opportunity.detail.demo.question1'),
        createdAt: '2m',
      },
      {
        id: `${item.id}-q2`,
        tab: 'offers',
        author: 'NorthWind Energy',
        content: this.translate.instant('feed.opportunity.detail.demo.offer1'),
        createdAt: '5m',
      },
      {
        id: `${item.id}-q3`,
        tab: 'history',
        author: 'OpenG7 Bot',
        content: this.translate.instant('feed.opportunity.detail.demo.history1'),
        createdAt: '10m',
      },
    ];

    const alerts: OpportunityAlertItem[] = [
      {
        id: `${item.id}-a1`,
        title: this.translate.instant('feed.opportunity.detail.demo.alertIceStormTitle'),
        detail: this.translate.instant('feed.opportunity.detail.demo.alertIceStormDetail'),
        severity: 'warning',
      },
      {
        id: `${item.id}-a2`,
        title: this.translate.instant('feed.opportunity.detail.demo.alertSmokeTitle'),
        detail: this.translate.instant('feed.opportunity.detail.demo.alertSmokeDetail'),
        severity: 'info',
      },
    ];

    return {
      item,
      title: item.title,
      routeLabel,
      subtitle: `${sectorLabel} · ${this.translate.instant('feed.mode.import')} · ${this.translate.instant('feed.opportunity.detail.shortWindow')}`,
      statusLabel: this.translate.instant('feed.opportunity.detail.statusOpen'),
      urgencyLabel,
      visibilityLabel,
      tags,
      summaryHeadline: item.summary,
      periodLabel: this.translate.instant('feed.opportunity.detail.demo.period'),
      deliveryPoint: this.translate.instant('feed.opportunity.detail.demo.deliveryPoint'),
      pricingType: this.translate.instant('feed.opportunity.detail.demo.pricingType'),
      specs: [
        {
          labelKey: 'feed.opportunity.detail.spec.capacity',
          value: `${capacityMw} MW`,
        },
        {
          labelKey: 'feed.opportunity.detail.spec.duration',
          value: this.translate.instant('feed.opportunity.detail.demo.duration'),
        },
        {
          labelKey: 'feed.opportunity.detail.spec.ramp',
          value: this.translate.instant('feed.opportunity.detail.demo.ramp'),
        },
        {
          labelKey: 'feed.opportunity.detail.spec.reliability',
          value: this.translate.instant('feed.opportunity.detail.demo.reliability'),
        },
        {
          labelKey: 'feed.opportunity.detail.spec.energy',
          value: this.translate.instant('feed.opportunity.detail.demo.energyMix'),
        },
        {
          labelKey: 'feed.opportunity.detail.spec.constraints',
          value: this.translate.instant('feed.opportunity.detail.demo.constraints'),
        },
      ],
      terms: [
        {
          labelKey: 'feed.opportunity.detail.term.contract',
          value: this.translate.instant('feed.opportunity.detail.demo.contract'),
        },
        {
          labelKey: 'feed.opportunity.detail.term.currency',
          value: 'CAD',
        },
        {
          labelKey: 'feed.opportunity.detail.term.conditions',
          value: this.translate.instant('feed.opportunity.detail.demo.conditions'),
        },
      ],
      documents: docs,
      qnaMessages: messages,
      capacityMw,
      updatedAtIso: item.updatedAt ?? item.createdAt,
      fromLabel,
      toLabel,
      indicators: [
        {
          id: `${item.id}-i1`,
          label: this.translate.instant('feed.opportunity.detail.demo.indicatorSpotPrice'),
          context: 'Ontario',
          delta: '+12%',
          trend: 'up',
        },
        {
          id: `${item.id}-i2`,
          label: this.translate.instant('feed.opportunity.detail.demo.indicatorReserveMargin'),
          context: 'ON reserve',
          delta: '6%',
          trend: 'steady',
        },
        {
          id: `${item.id}-i3`,
          label: this.translate.instant('feed.opportunity.detail.demo.indicatorCongestion'),
          context: 'Outaouais',
          delta: '~70%',
          trend: 'down',
        },
      ],
      alerts,
    };
  }

  private buildTags(item: FeedItem, sectorLabel: string): readonly string[] {
    const tags = new Set<string>();
    tags.add(sectorLabel);
    tags.add(item.mode === 'EXPORT' ? 'Export' : 'Import');
    tags.add('Winter');
    for (const tag of item.tags ?? []) {
      if (tag && tag.trim().length) {
        tags.add(this.toTitleCase(tag.trim()));
      }
    }
    return Array.from(tags).slice(0, 5);
  }

  private resolveProvinceLabel(id: string | null | undefined): string | null {
    if (!id) {
      return null;
    }
    return this.provinceNameMap().get(id) ?? id;
  }

  private resolveSectorLabel(id: string | null | undefined): string | null {
    if (!id) {
      return null;
    }
    return this.sectorNameMap().get(id) ?? id;
  }

  private relativeTime(value: string): string {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) {
      return this.translate.instant('feed.opportunity.detail.justNow');
    }

    const diffMs = Date.now() - timestamp;
    if (diffMs <= 30 * 1000) {
      return this.translate.instant('feed.opportunity.detail.justNow');
    }

    const minutes = Math.round(diffMs / 60000);
    if (minutes < 60) {
      return this.translate.instant('feed.opportunity.detail.minutesAgo', { count: minutes });
    }

    const hours = Math.round(minutes / 60);
    return this.translate.instant('feed.opportunity.detail.hoursAgo', { count: hours });
  }

  private toTitleCase(value: string): string {
    return value
      .split(/\s+/)
      .map(part => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private simulateSync(): void {
    this.clearSyncTimers();

    if (!this.isConnected()) {
      this.syncState.set('offline');
      return;
    }

    this.syncState.set('saved-local');
    this.syncTimers.push(
      setTimeout(() => this.syncState.set('syncing'), 260),
      setTimeout(() => this.syncState.set('synced'), 950)
    );
  }

  private clearSyncTimers(): void {
    while (this.syncTimers.length) {
      const timer = this.syncTimers.pop();
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  private getShareUrl(): string {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href;
    }
    const id = this.itemId() ?? 'unknown';
    return `/feed/opportunities/${id}`;
  }
}
