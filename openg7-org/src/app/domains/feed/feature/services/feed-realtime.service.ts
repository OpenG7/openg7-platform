import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  NgZone,
  PLATFORM_ID,
  TransferState,
  computed,
  effect,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { API_URL } from '@app/core/config/environment.tokens';
import { injectNotificationStore } from '@app/core/observability/notification.store';
import {
  activeSectorsSig,
  feedSearchSig,
  feedSortSig,
  focusPostIdSig,
  needTypeSig,
  selectedCountrySig,
  selectedProvinceSig,
} from '@app/state/shared-feed-signals';
import { FeedActions } from '@app/store/feed/feed.actions';
import { toFeedSnapshot } from '@app/store/feed/feed.reducer';
import {
  selectFeedConnectionState,
  selectFeedDrawerPostId,
  selectFeedCursor,
  selectFeedError,
  selectFeedFilters,
  selectFeedHydrated,
  selectFeedLoading,
  selectFeedPosts,
  selectFeedState,
  selectFeedUnreadCount,
} from '@app/store/feed/feed.selectors';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { FeedComposerDraft, FeedComposerValidationResult, FeedFilterState, FeedPost, FeedRealtimeEnvelope, FeedSnapshot } from '../models/feed.models';

const STREAM_ENDPOINT = '/api/feed/stream';
const COLLECTION_ENDPOINT = '/api/feed';
const TRANSFER_STATE_KEY = makeStateKey<FeedSnapshot>('OG7_FEED_SNAPSHOT');
const MODERATION_TERMS = ['spam', 'fake', 'fraud'];

interface PostResponse {
  readonly data: FeedPost | FeedPost[];
  readonly cursor?: string | null;
}

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « domains/feed/feature/services ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Feed Realtime ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns FeedRealtimeService gérée par le framework.
 */
export class FeedRealtimeService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly zone = inject(NgZone);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiUrl = (inject(API_URL, { optional: true }) ?? '').replace(/\/$/, '');
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly notifications = injectNotificationStore();
  private readonly translate = inject(TranslateService);

  private eventSource: EventSource | null = null;
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly seenEventIds: string[] = [];
  private connectionNotifiedDown = false;

  private readonly filtersSig = this.store.selectSignal(selectFeedFilters);
  private readonly cursorSig = this.store.selectSignal(selectFeedCursor);
  private readonly hydratedSig = this.store.selectSignal(selectFeedHydrated);
  private readonly unreadSig = this.store.selectSignal(selectFeedUnreadCount);
  private readonly connectionSig = this.store.selectSignal(selectFeedConnectionState);
  private readonly postsSig = this.store.selectSignal(selectFeedPosts);
  private readonly loadingSig = this.store.selectSignal(selectFeedLoading);
  private readonly errorSig = this.store.selectSignal(selectFeedError);
  private readonly drawerSig = this.store.selectSignal(selectFeedDrawerPostId);
  private readonly stateSig = this.store.selectSignal(selectFeedState);

  private readonly onlyUnreadSig = signal(false);

  readonly posts = this.postsSig;
  readonly loading = this.loadingSig;
  readonly error = this.errorSig;

  readonly connectionState = {
    connected: computed(() => this.connectionSig().connected),
    reconnecting: computed(() => this.connectionSig().reconnecting),
    error: computed(() => this.connectionSig().error),
  };

  constructor() {
    const snapshot = this.transferState.get(TRANSFER_STATE_KEY, null);
    if (snapshot) {
      this.store.dispatch(FeedActions.hydrateSnapshot({ snapshot }));
      if (this.browser) {
        this.transferState.remove(TRANSFER_STATE_KEY);
      }
    }

    if (!this.browser) {
      effect(
        () => {
          const snapshot = toFeedSnapshot(this.stateSig());
          this.transferState.set(TRANSFER_STATE_KEY, snapshot);
        },
        { allowSignalWrites: true }
      );
    }

    effect(
      () => {
        const filters = this.filtersSig();
        this.updateSignalIfChanged(selectedCountrySig, filters.country);
        this.updateSignalIfChanged(selectedProvinceSig, filters.province);
        this.updateArraySignalIfChanged(activeSectorsSig, filters.sectors);
        this.updateArraySignalIfChanged(needTypeSig, filters.needTypes);
        this.updateSignalIfChanged(feedSearchSig, filters.search);
        this.updateSignalIfChanged(feedSortSig, filters.sort);
        this.updateSignalIfChanged(this.onlyUnreadSig, filters.onlyUnread);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const filters: FeedFilterState = {
          country: selectedCountrySig(),
          province: selectedProvinceSig(),
          sectors: [...activeSectorsSig()],
          needTypes: [...needTypeSig()],
          onlyUnread: this.onlyUnreadSig(),
          sort: feedSortSig(),
          search: feedSearchSig(),
        };
        const current = this.filtersSig();
        if (!this.equalFilters(current, filters)) {
          this.store.dispatch(FeedActions.applyFilters({ filters }));
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const postId = this.drawerSig();
        if (focusPostIdSig() !== postId) {
          focusPostIdSig.set(postId);
        }
      },
      { allowSignalWrites: true }
    );

    if (this.browser) {
      this.connect();
    }

    this.destroyRef.onDestroy(() => this.teardown());
  }

  hasHydrated(): boolean {
    return this.hydratedSig();
  }

  unreadCount(): number {
    return this.unreadSig();
  }

  connectionError(): string | null {
    return this.connectionSig().error;
  }

  loadInitial(): void {
    this.fetchPage({ replace: true });
  }

  loadMore(): void {
    const cursor = this.cursorSig();
    if (!cursor) {
      return;
    }
    this.fetchPage({ cursor, append: true });
  }

  reload(): void {
    this.fetchPage({ replace: true });
    this.refreshConnection();
  }

  openDrawer(postId: string | null): void {
    focusPostIdSig.set(postId);
    this.store.dispatch(FeedActions.openDrawer({ postId }));
  }

  markOnboardingSeen(): void {
    this.store.dispatch(FeedActions.markOnboardingSeen());
  }

  toggleUnreadOnly(next?: boolean): void {
    if (typeof next === 'boolean') {
      this.onlyUnreadSig.set(next);
    } else {
      this.onlyUnreadSig.update(value => !value);
    }
  }

  validateDraft(draft: FeedComposerDraft): FeedComposerValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const normalized = draft.content?.trim() ?? '';
    if (normalized.length < 3) {
      errors.push('feed.validation.tooShort');
    }
    if (normalized.length > 5000) {
      errors.push('feed.validation.tooLong');
    }
    for (const term of MODERATION_TERMS) {
      if (normalized.toLowerCase().includes(term)) {
        warnings.push('feed.validation.moderationFlag');
        break;
      }
    }
    if (!draft.channel) {
      errors.push('feed.validation.channelRequired');
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  publish(draft: FeedComposerDraft): FeedComposerValidationResult {
    const validation = this.validateDraft(draft);
    if (!validation.valid) {
      return validation;
    }
    const normalized = this.normalizeDraft(draft);
    const idempotencyKey = this.generateIdempotencyKey();
    const optimisticPost = this.buildOptimisticPost(normalized, idempotencyKey);
    this.store.dispatch(FeedActions.optimisticPublish({ draft: normalized, post: optimisticPost, idempotencyKey }));
    const url = this.composeUrl(COLLECTION_ENDPOINT);
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    this.http.post<PostResponse | FeedPost>(url, normalized, { headers }).subscribe({
      next: response => {
        const post = this.normalizePostResponse(response);
        this.store.dispatch(FeedActions.publishSuccess({ tempId: optimisticPost.id, post }));
        this.emitAnalytics('feed_post_publish', { postId: post.id, channel: post.channel });
        this.notifications.success(this.translate.instant('feed.notifications.publishSuccess'), {
          source: 'feed',
          metadata: { postId: post.id, channel: post.channel },
        });
      },
      error: error => {
        const message = this.extractError(error);
        this.store.dispatch(FeedActions.publishFailure({ tempId: optimisticPost.id, error: message }));
        this.emitAnalytics('feed_post_publish_failed', { reason: message });
        this.notifications.error(this.translate.instant('feed.notifications.publishFailure', { reason: message }), {
          source: 'feed',
          context: error,
          metadata: { reason: message },
          deliver: { email: true },
        });
      },
    });
    return validation;
  }

  refreshConnection(): void {
    if (!this.browser) {
      return;
    }
    this.scheduleReconnect(0);
  }

  private fetchPage(options: { cursor?: string | null; append?: boolean; replace?: boolean }): void {
    const { cursor, append, replace } = options;
    const filters = this.filtersSig();
    const params = this.buildParams({ ...filters, cursor });
    if (replace) {
      this.store.dispatch(FeedActions.loadInitial({ replace: true }));
    } else {
      this.store.dispatch(
        FeedActions.loadPage({ cursor: cursor ?? null, append: Boolean(append) })
      );
    }
    const url = this.composeUrl(COLLECTION_ENDPOINT);
    this.http
      .get<PostResponse>(url, { params })
      .subscribe({
        next: response => {
          const posts = this.normalizeArrayResponse(response?.data);
          const nextCursor = response?.cursor ?? null;
          this.store.dispatch(FeedActions.loadSuccess({ posts, cursor: nextCursor, append: Boolean(append) }));
          this.emitAnalytics('feed_page_loaded', { count: posts.length, cursor: nextCursor });
        },
        error: error => {
          const message = this.extractError(error);
          this.store.dispatch(FeedActions.loadFailure({ error: message }));
          this.notifications.error(this.translate.instant('feed.notifications.loadError', { reason: message }), {
            source: 'feed',
            context: error,
            metadata: { cursor, append },
            deliver: { email: true },
          });
        },
      });
  }

  private connect(): void {
    if (!this.browser || this.eventSource || this.socket) {
      return;
    }
    const url = this.composeUrl(STREAM_ENDPOINT);
    if (typeof EventSource !== 'undefined') {
      this.openEventSource(url);
    } else {
      this.openWebSocket(url.replace(/^http/, 'ws'));
    }
  }

  private openEventSource(url: string): void {
    try {
      this.eventSource = new EventSource(url, { withCredentials: true } as EventSourceInit);
    } catch (error) {
      this.eventSource = null;
      this.openWebSocket(url.replace(/^http/, 'ws'));
      return;
    }
    this.store.dispatch(FeedActions.setConnectionStatus({ connected: false, reconnecting: true }));
    this.eventSource.onopen = () =>
      this.zone.run(() => {
        this.store.dispatch(FeedActions.setConnectionStatus({ connected: true, reconnecting: false }));
        this.reconnectAttempts = 0;
        this.notifyConnectionRestored('sse');
      });
    this.eventSource.onerror = () =>
      this.zone.run(() => {
        this.store.dispatch(FeedActions.setConnectionStatus({ connected: false, reconnecting: true }));
        this.notifyConnectionLost('sse');
        this.scheduleReconnect();
      });
    this.eventSource.onmessage = event =>
      this.zone.run(() => {
        this.handleIncomingEvent(event.data, event.lastEventId ?? undefined);
      });
  }

  private openWebSocket(url: string): void {
    try {
      this.socket = new WebSocket(url);
    } catch (error) {
      this.socket = null;
      this.notifyConnectionLost('ws');
      this.scheduleReconnect();
      return;
    }
    this.store.dispatch(FeedActions.setConnectionStatus({ connected: false, reconnecting: true }));
    this.socket.onopen = () =>
      this.zone.run(() => {
        this.store.dispatch(FeedActions.setConnectionStatus({ connected: true, reconnecting: false }));
        this.reconnectAttempts = 0;
        this.notifyConnectionRestored('ws');
      });
    this.socket.onerror = () =>
      this.zone.run(() => {
        this.store.dispatch(FeedActions.setConnectionStatus({ connected: false, reconnecting: true }));
        this.notifyConnectionLost('ws');
      });
    this.socket.onclose = () =>
      this.zone.run(() => {
        this.store.dispatch(FeedActions.setConnectionStatus({ connected: false, reconnecting: true }));
        this.notifyConnectionLost('ws');
        this.scheduleReconnect();
      });
    this.socket.onmessage = event =>
      this.zone.run(() => {
        this.handleIncomingEvent(event.data);
      });
  }

  private handleIncomingEvent(raw: unknown, eventId?: string): void {
    if (!raw) {
      return;
    }
    if (eventId && this.hasSeenEvent(eventId)) {
      return;
    }
    let envelope: FeedRealtimeEnvelope | null = null;
    try {
      envelope = typeof raw === 'string' ? (JSON.parse(raw) as FeedRealtimeEnvelope) : (raw as FeedRealtimeEnvelope);
    } catch (error) {
      console.warn('[feed] Failed to parse realtime payload', error);
      return;
    }
    if (!envelope) {
      return;
    }
    if (eventId) {
      this.trackEventId(eventId);
    }
    this.store.dispatch(FeedActions.receiveRealtimeEnvelope({ envelope }));
    if (envelope.type === 'feed.post.created') {
      this.emitAnalytics('feed_post_received', { postId: (envelope.payload as FeedPost)?.id });
    }
  }

  private scheduleReconnect(delayMs?: number): void {
    if (!this.browser) {
      return;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    const delay =
      typeof delayMs === 'number'
        ? delayMs
        : Math.min(15000, [2000, 5000, 10000][this.reconnectAttempts] ?? 10000);
    const attempt = this.reconnectAttempts + 1;
    this.reconnectAttempts = attempt;
    this.reconnectTimer = setTimeout(() => {
      this.teardown();
      this.connect();
    }, delay);
    if (attempt === 1) {
      this.notifications.info(this.translate.instant('feed.notifications.reconnecting', { seconds: Math.round(delay / 1000) }), {
        source: 'feed',
        metadata: { attempt, delay },
      });
    }
  }

  private teardown(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private notifyConnectionLost(transport: 'sse' | 'ws'): void {
    if (this.connectionNotifiedDown) {
      return;
    }
    this.connectionNotifiedDown = true;
    this.notifications.error(this.translate.instant('feed.notifications.connectionLost'), {
      source: 'feed',
      metadata: { transport },
    });
  }

  private notifyConnectionRestored(transport: 'sse' | 'ws'): void {
    if (!this.connectionNotifiedDown) {
      return;
    }
    this.connectionNotifiedDown = false;
    this.notifications.success(this.translate.instant('feed.notifications.connectionRestored'), {
      source: 'feed',
      metadata: { transport },
    });
  }

  private buildParams(filters: FeedFilterState & { cursor?: string | null }): HttpParams {
    let params = new HttpParams();
    if (filters.cursor) {
      params = params.set('cursor', filters.cursor);
    }
    if (filters.country) {
      params = params.set('country', filters.country);
    }
    if (filters.province) {
      params = params.set('province', filters.province);
    }
    if (filters.sectors?.length) {
      params = params.set('sectors', filters.sectors.join(','));
    }
    if (filters.needTypes?.length) {
      params = params.set('needTypes', filters.needTypes.join(','));
    }
    if (filters.onlyUnread) {
      params = params.set('unread', 'true');
    }
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }
    if (filters.search) {
      params = params.set('q', filters.search);
    }
    return params;
  }

  private composeUrl(path: string): string {
    const base = this.apiUrl || '';
    return `${base}${path}`;
  }

  private normalizeArrayResponse(data: FeedPost | FeedPost[] | null | undefined): FeedPost[] {
    if (!data) {
      return [];
    }
    return Array.isArray(data) ? data.map(post => this.normalizePost(post)) : [this.normalizePost(data)];
  }

  private normalizePostResponse(response: PostResponse | FeedPost): FeedPost {
    if (!response) {
      throw new Error('Empty response');
    }
    if ('data' in response) {
      const data = response.data;
      if (Array.isArray(data)) {
        return data.length ? this.normalizePost(data[0]) : this.buildPlaceholderPost();
      }
      return this.normalizePost(data as FeedPost);
    }
    return this.normalizePost(response);
  }

  private normalizePost(post: FeedPost): FeedPost {
    return {
      ...post,
      attachments: Array.isArray(post.attachments) ? post.attachments : [],
      replies: Array.isArray(post.replies) ? post.replies : [],
      metrics: {
        likes: post.metrics?.likes ?? 0,
        replies: post.metrics?.replies ?? post.replies?.length ?? 0,
        shares: post.metrics?.shares ?? 0,
        impressions: post.metrics?.impressions ?? 0,
      },
      sectors: post.sectors ?? [],
      needTypes: post.needTypes ?? [],
      country: post.country ?? null,
      province: post.province ?? null,
    };
  }

  private buildOptimisticPost(draft: FeedComposerDraft, key: string): FeedPost {
    const now = new Date().toISOString();
    return {
      id: `optimistic-${key}`,
      optimisticIdempotencyKey: key,
      author: {
        id: 'me',
        displayName: 'You',
      },
      content: draft.content.trim(),
      createdAt: now,
      updatedAt: now,
      country: draft.country ?? null,
      province: draft.province ?? null,
      sectors: draft.sectors ?? [],
      needTypes: draft.needTypes ?? [],
      channel: draft.channel,
      attachments: draft.attachments ?? [],
      metrics: { likes: 0, replies: 0, shares: 0 },
      replies: [],
      status: 'pending' as const,
    };
  }

  private normalizeDraft(draft: FeedComposerDraft): FeedComposerDraft {
    return {
      ...draft,
      content: draft.content.trim(),
      sectors: draft.sectors?.filter(Boolean) ?? [],
      needTypes: draft.needTypes?.filter(Boolean) ?? [],
      attachments: draft.attachments?.map(attachment => ({ ...attachment })) ?? [],
    };
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim().length) {
        return error.error;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      return error.message;
    }
    if (error instanceof Error && typeof error.message === 'string') {
      return error.message;
    }
    if (typeof error === 'object' && error && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'feed.error.generic';
  }

  private generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private equalFilters(a: FeedFilterState, b: FeedFilterState): boolean {
    return (
      a.country === b.country &&
      a.province === b.province &&
      a.onlyUnread === b.onlyUnread &&
      a.sort === b.sort &&
      a.search === b.search &&
      this.equalArray(a.sectors, b.sectors) &&
      this.equalArray(a.needTypes, b.needTypes)
    );
  }

  private equalArray(a: readonly string[], b: readonly string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((value, index) => value === b[index]);
  }

  private hasSeenEvent(eventId: string): boolean {
    return this.seenEventIds.includes(eventId);
  }

  private trackEventId(eventId: string): void {
    this.seenEventIds.unshift(eventId);
    if (this.seenEventIds.length > 200) {
      this.seenEventIds.length = 200;
    }
  }

  private updateSignalIfChanged<T>(target: { set(value: T): void; (): T }, value: T): void {
    if (target() !== value) {
      target.set(value);
    }
  }

  private updateArraySignalIfChanged(target: { set(value: readonly string[]): void; (): readonly string[] }, value: readonly string[]): void {
    const prev = target();
    if (!this.equalArray(prev, value)) {
      target.set([...value]);
    }
  }

  private emitAnalytics(event: string, payload: Record<string, unknown>): void {
    if (!this.browser) {
      return;
    }
    const dataLayer = (globalThis as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event, ...payload });
      return;
    }
    const globalRef = globalThis as { dispatchEvent?: (event: Event) => boolean };
    if (typeof globalRef.dispatchEvent === 'function') {
      const customEvent = new CustomEvent('og7-analytics', { detail: { event, payload } });
      globalRef.dispatchEvent(customEvent);
    }
  }

  private buildPlaceholderPost(): FeedPost {
    return {
      id: 'placeholder',
      author: { id: 'placeholder', displayName: 'Unknown' },
      content: '',
      createdAt: new Date().toISOString(),
      channel: 'global',
      country: null,
      province: null,
      metrics: { likes: 0, replies: 0, shares: 0 },
    };
  }
}
