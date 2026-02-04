import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FEATURE_FLAGS } from '@app/core/config/environment.tokens';
import { HttpClientService } from '@app/core/http/http-client.service';
import { FeedItem } from '@app/domains/feed/feature/models/feed.models';
import { AppState } from '@app/state/app.state';
import { selectCatalogFeedItems } from '@app/state/catalog/catalog.selectors';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export type HomeFeedScope = 'canada' | 'g7' | 'world';
export type HomeFeedFilter = 'all' | 'offer' | 'request' | 'labor' | 'transport';

export interface HomeFeedQuery {
  readonly scope: HomeFeedScope;
  readonly filter: HomeFeedFilter;
  readonly search: string;
  readonly limit?: number;
}

interface HomeFeedResponse {
  readonly data: FeedItem[];
}

const LABOR_TAGS = new Set([
  'labor',
  'workforce',
  'talent',
  'welding',
  'staffing',
  'crew',
  'skills',
]);

const TRANSPORT_TAGS = new Set([
  'transport',
  'logistics',
  'rail',
  'shipping',
  'freight',
  'cold-chain',
  'port',
  'aviation',
]);

@Injectable({ providedIn: 'root' })
export class HomeFeedService {
  private readonly http = inject(HttpClientService);
  private readonly store = inject(Store<AppState>);
  private readonly featureFlags = inject(FEATURE_FLAGS, { optional: true });
  private readonly catalogFeedItems = this.store.selectSignal(selectCatalogFeedItems);
  private readonly useMocks = this.featureFlags?.['homeFeedMocks'] ?? true;

  loadHighlights(query: HomeFeedQuery): Observable<FeedItem[]> {
    if (this.useMocks) {
      return of(this.filterMockItems(this.catalogFeedItems(), query));
    }
    const params = this.buildParams(query);
    return this.http
      .get<HomeFeedResponse | FeedItem[]>('/api/feed/highlights', { params })
      .pipe(map((response) => this.normalizeResponse(response)));
  }

  private buildParams(query: HomeFeedQuery): HttpParams {
    let params = new HttpParams().set('scope', query.scope);

    if (query.search) {
      params = params.set('q', query.search);
    }

    if (query.limit) {
      params = params.set('limit', String(query.limit));
    }

    if (query.filter && query.filter !== 'all') {
      const { type, tag } = this.mapFilterToApi(query.filter);
      if (type) {
        params = params.set('type', type);
      }
      if (tag) {
        params = params.set('tag', tag);
      }
      params = params.set('filter', query.filter);
    }

    return params;
  }

  private mapFilterToApi(filter: HomeFeedFilter): { type?: string; tag?: string } {
    switch (filter) {
      case 'offer':
        return { type: 'OFFER' };
      case 'request':
        return { type: 'REQUEST' };
      case 'labor':
        return { tag: 'labor' };
      case 'transport':
        return { tag: 'transport' };
      default:
        return {};
    }
  }

  private normalizeResponse(response: HomeFeedResponse | FeedItem[] | null | undefined): FeedItem[] {
    if (!response) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  private filterMockItems(items: FeedItem[], query: HomeFeedQuery): FeedItem[] {
    const search = query.search?.trim().toLowerCase() ?? '';
    const filtered = items.filter(
      (item) =>
        this.matchesScope(item, query.scope) &&
        this.matchesFilter(item, query.filter) &&
        this.matchesSearch(item, search)
    );

    const ordered = filtered
      .slice()
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

    if (!query.limit) {
      return ordered;
    }

    return ordered.slice(0, query.limit);
  }

  private matchesScope(item: FeedItem, scope: HomeFeedScope): boolean {
    const kind = item.source?.kind ?? 'COMPANY';
    if (scope === 'canada') {
      return true;
    }
    if (scope === 'g7') {
      return kind === 'GOV' || kind === 'PARTNER';
    }
    return kind !== 'GOV';
  }

  private matchesFilter(item: FeedItem, filter: HomeFeedFilter): boolean {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'offer') {
      return item.type === 'OFFER';
    }
    if (filter === 'request') {
      return item.type === 'REQUEST';
    }
    if (filter === 'labor') {
      return this.matchesTags(item, LABOR_TAGS);
    }
    if (filter === 'transport') {
      return this.matchesTags(item, TRANSPORT_TAGS);
    }
    return true;
  }

  private matchesSearch(item: FeedItem, search: string): boolean {
    if (!search) {
      return true;
    }
    const haystack = [
      item.title,
      item.summary,
      item.source?.label ?? '',
      item.sectorId ?? '',
      item.fromProvinceId ?? '',
      item.toProvinceId ?? '',
      ...(item.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(search);
  }

  private matchesTags(item: FeedItem, tags: Set<string>): boolean {
    const itemTags = item.tags ?? [];
    return itemTags.some((tag) => tags.has(tag.toLowerCase()));
  }
}
