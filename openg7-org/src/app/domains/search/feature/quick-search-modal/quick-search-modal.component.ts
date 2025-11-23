import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { AnalyticsService } from '@app/core/observability/analytics.service';
import { Og7ModalRef } from '@app/core/ui/modal/og7-modal.types';
import { OG7_MODAL_DATA, OG7_MODAL_REF } from '@app/core/ui/modal/og7-modal.tokens';
import { SearchService } from '../search.service';
import { SearchHistoryStore } from '../search-history.store';
import { SearchContext, RecentSearch, SearchItem, SearchResult, SearchSection } from '@app/core/models/search';
import { QuickSearchResultItemComponent } from './quick-search-result-item.component';
import { QuickSearchSectionSkeletonComponent } from './quick-search-section-skeleton.component';
import { handleQuickSearchKeydown } from '../search-keyboard.manager';
import { RbacFacadeService } from '@app/core/security/rbac.facade';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export interface QuickSearchModalData {
  readonly initialQuery?: string;
  readonly source?: string;
  readonly context?: Partial<SearchContext>;
}

interface FlatResult {
  readonly section: SearchSection;
  readonly item: SearchItem;
}

const NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Tab']);
const HANDLED_KEYS = new Set([...NAVIGATION_KEYS, 'Enter', 'Escape']);

@Component({
  selector: 'og7-quick-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkTrapFocus,
    TranslateModule,
    QuickSearchResultItemComponent,
    QuickSearchSectionSkeletonComponent,
  ],
  templateUrl: './quick-search-modal.component.html',
  styleUrl: './quick-search-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/search/feature/quick-search-modal » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Quick Search Modal ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns QuickSearchModalComponent gérée par le framework.
 */
export class QuickSearchModalComponent implements AfterViewInit {
  private readonly modalRef = inject<Og7ModalRef<void>>(OG7_MODAL_REF);
  private readonly data = inject<QuickSearchModalData | null>(OG7_MODAL_DATA, { optional: true }) ?? {};
  private readonly searchService = inject(SearchService);
  private readonly history = inject(SearchHistoryStore);
  private readonly analytics = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly rbac = inject(RbacFacadeService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);

  // We keep a reference to the native input element to handle focus management and
  // IME composition/keyboard events. The reactive `queryControl` only manages the
  // value state and cannot expose the DOM element itself.
  @ViewChild('queryInput') queryInput?: ElementRef<HTMLInputElement>;

  readonly query = signal(this.data.initialQuery ?? '');
  readonly loading = signal(false);
  readonly errored = signal(false);
  readonly sections = signal<SearchSection[]>([]);
  readonly activeIndex = signal(0);
  private lastTyped = this.query();
  private readonly refreshTrigger = signal(0);
  private readonly composing = signal(false);

  private readonly langSig = signal(this.translate.currentLang || this.translate.defaultLang || 'en');

  readonly queryControl = new FormControl<string>(this.data.initialQuery ?? '', { nonNullable: true });

  readonly context = computed<SearchContext>(() => ({
    role: this.rbac.currentRole(),
    locale: this.langSig(),
    sectorId: this.data.context?.sectorId ?? null,
    isPremium: this.rbac.isPremium(),
  }));

  readonly historyEntries = this.history.entries;

  readonly visibleSections = computed(() => this.sections());
  readonly flatResults = computed<FlatResult[]>(() =>
    this.visibleSections().flatMap((section) => section.items.map((item) => ({ section, item }))),
  );
  readonly activeItem = computed(() => this.flatResults()[this.activeIndex()]?.item ?? null);
  readonly emptyStateVisible = computed(
    () => !this.loading() && this.query().length > 0 && this.flatResults().length === 0,
  );

  constructor() {
    this.queryControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.query.set(value);
        if (this.activeIndex() !== 0) {
          this.activeIndex.set(0);
        }
      });

    effect(() => {
      const value = this.query();
      if (this.queryControl.value !== value) {
        this.queryControl.setValue(value, { emitEvent: false });
      }
    });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.langSig.set(event.lang));

    effect(() => {
      const q = this.query();
      if (q !== this.lastTyped) {
        this.lastTyped = q;
        this.analytics.emit('search_typed', { query: q, length: q.length });
      }
    });

    effect(() => {
      const query = this.query();
      this.refreshTrigger();
      const context = this.context();
      this.loading.set(true);
      this.errored.set(false);
      const startedAt = this.now();
      this.searchService
        .search$(query, context)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => this.onResult(result, startedAt),
          error: () => this.onError(),
        });
    });

    this.analytics.emit('search_opened', {
      source: this.data.source ?? 'ctrlk',
      role: this.context().role,
      premium: this.context().isPremium ?? false,
    });
  }

  ngAfterViewInit(): void {
    this.focusInput();
    if (!this.isBrowser) {
      return;
    }
    const input = this.queryInput?.nativeElement;
    if (!input) {
      return;
    }

    fromEvent<CompositionEvent>(input, 'compositionstart')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.composing.set(true));

    fromEvent<CompositionEvent>(input, 'compositionend')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.composing.set(false));

    fromEvent<KeyboardEvent>(input, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.shouldHandleKeydown(event)) {
          this.handleKeydown(event);
        }
      });
  }

  private handleKeydown(event: KeyboardEvent): void {
    handleQuickSearchKeydown(event, {
      move: (delta) => this.moveActive(delta),
      select: () => this.selectActive(),
      close: () => this.close(),
      focusInput: () => this.focusInput(),
    });
  }

  private shouldHandleKeydown(event: KeyboardEvent): boolean {
    if (event.isComposing || this.composing()) {
      return false;
    }

    if (this.isPrintableKey(event)) {
      return false;
    }

    const isCtrlOrMetaK = (event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey);
    if (isCtrlOrMetaK) {
      return true;
    }

    if (!HANDLED_KEYS.has(event.key)) {
      return false;
    }

    if (!this.flatResults().length && NAVIGATION_KEYS.has(event.key)) {
      return false;
    }

    if (!this.activeItem() && event.key === 'Enter') {
      return false;
    }

    return true;
  }

  private isPrintableKey(event: KeyboardEvent): boolean {
    if (event.key === 'Unidentified' || event.key === 'Dead') {
      return false;
    }
    if (event.key === 'Spacebar') {
      return !event.ctrlKey && !event.metaKey && !event.altKey;
    }
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  retry(): void {
    this.refreshTrigger.update((value) => value + 1);
  }

  focusInput(): void {
    if (!this.isBrowser) {
      return;
    }
    const input = this.queryInput?.nativeElement;
    if (!input) {
      return;
    }
    const focus = () => input.focus();
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(focus);
    } else {
      setTimeout(focus, 0);
    }
  }

  moveActive(delta: number): void {
    const results = this.flatResults();
    if (!results.length) {
      return;
    }
    const next = (this.activeIndex() + delta + results.length) % results.length;
    this.activeIndex.set(next);
  }

  select(result: FlatResult): void {
    this.emitSelection(result.item);
    this.performAction(result.item);
  }

  selectActive(): void {
    const result = this.flatResults()[this.activeIndex()];
    if (!result) {
      return;
    }
    this.select(result);
  }

  onCloseClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  close(): void {
    this.modalRef.close();
  }

  onHistorySelect(entry: RecentSearch): void {
    this.history.add({ ...entry, visitedAt: new Date().toISOString() });
    this.analytics.emit('result_selected', {
      id: entry.id,
      query: this.query(),
      actionType: entry.action?.type ?? 'history',
      source: 'history',
    });
    if (entry.action) {
      this.performActionFromHistory(entry.action);
    }
    this.modalRef.close();
  }

  clearHistory(): void {
    this.history.clear();
  }

  trackSection(index: number, section: SearchSection): string {
    return section.id ?? `section-${index}`;
  }

  trackItem(index: number, item: SearchItem): string {
    return item.id ?? `item-${index}`;
  }

  optionId(index: number): string {
    return `quick-search-option-${index}`;
  }

  trackHistory(index: number, entry: RecentSearch): string {
    return entry.id ?? `history-${index}`;
  }

  resultIndex(item: SearchItem): number {
    const index = this.flatResults().findIndex((flat) => flat.item.id === item.id);
    return index >= 0 ? index : 0;
  }

  isActive(item: SearchItem): boolean {
    return this.activeIndex() === this.resultIndex(item);
  }

  private onResult(result: SearchResult, startedAt: number): void {
    this.sections.set(result.sections);
    this.loading.set(false);
    const flat = this.flatResults();
    this.analytics.emit('result_impression', {
      query: result.query,
      resultCount: flat.length,
      sections: result.sections.map((section) => section.id),
    });
    if (!flat.length && result.query) {
      this.analytics.emit('empty_state_seen', { query: result.query });
    }
    const duration = this.now() - startedAt;
    this.analytics.emit('search_time_to_first_result', {
      query: result.query,
      duration,
    });
  }

  private onError(): void {
    this.loading.set(false);
    this.errored.set(true);
  }

  private emitSelection(item: SearchItem): void {
    this.analytics.emit('result_selected', {
      id: item.id,
      query: this.query(),
      actionType: item.action?.type ?? 'none',
    });
    this.history.add({
      id: item.id,
      label: item.title,
      description: item.description,
      action: item.action,
      visitedAt: new Date().toISOString(),
    });
  }

  private performAction(item: SearchItem): void {
    const action = item.action;
    if (!action) {
      this.modalRef.close();
      return;
    }
    switch (action.type) {
      case 'route':
        this.navigate(action.commands, action.extras);
        break;
      case 'external':
        this.openExternal(action.url, action.target ?? '_blank');
        break;
      case 'callback':
        this.analytics.emit('search_callback_requested', {
          id: action.callbackId,
          query: this.query(),
        });
        break;
    }
    this.modalRef.close();
  }

  private performActionFromHistory(action: NonNullable<RecentSearch['action']>): void {
    switch (action.type) {
      case 'route':
        this.navigate(action.commands, action.extras);
        break;
      case 'external':
        this.openExternal(action.url, action.target ?? '_blank');
        break;
      case 'callback':
        this.analytics.emit('search_callback_requested', {
          id: action.callbackId,
          query: this.query(),
          source: 'history',
        });
        break;
    }
  }

  private navigate(commands: unknown[] | string, extras?: unknown): void {
    if (typeof commands === 'string') {
      void this.router.navigateByUrl(commands, extras as any);
    } else {
      void this.router.navigate(commands as any[], extras as any);
    }
  }

  private openExternal(url: string, target: '_self' | '_blank'): void {
    if (!this.isBrowser) {
      return;
    }
    window.open(url, target);
  }

  private now(): number {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }
}
