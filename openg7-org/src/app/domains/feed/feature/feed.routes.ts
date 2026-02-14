import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Routes,
  UrlMatchResult,
  UrlSegment,
} from '@angular/router';
import { FeedActions } from '@app/store/feed/feed.actions';
import { selectFeedError, selectFeedHydrated } from '@app/store/feed/feed.selectors';
import { Store } from '@ngrx/store';
import { firstValueFrom, merge, timer } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { FeedFilterState, FeedItemType, FeedSort, FlowMode } from './models/feed.models';
import { FeedRealtimeService } from './services/feed-realtime.service';

type MaybeString = string | null | undefined;

const SORT_OPTIONS = new Set<FeedSort>(['NEWEST', 'URGENCY', 'VOLUME', 'CREDIBILITY']);
const TYPE_OPTIONS = new Set<FeedItemType>([
  'OFFER',
  'REQUEST',
  'ALERT',
  'TENDER',
  'CAPACITY',
  'INDICATOR',
]);
const MODE_OPTIONS = new Set<FlowMode>(['EXPORT', 'IMPORT', 'BOTH']);
const LEGACY_ALERT_PREFIXES = ['alert-', 'alerte-'] as const;
const LEGACY_INDICATOR_PREFIXES = ['indicator-', 'indicateur-'] as const;

const setupFeedResolver: ResolveFn<boolean> = async route => {
  const store = inject(Store);
  const feed = inject(FeedRealtimeService);
  const filters = parseFilters(route);
  store.dispatch(FeedActions.applyFilters({ filters }));
  if (!feed.hasHydrated()) {
    feed.loadInitial();
  }
  await firstValueFrom(
    merge(
      store.select(selectFeedHydrated).pipe(
        filter((hydrated): hydrated is true => hydrated === true),
        take(1),
        map(() => true)
      ),
      store.select(selectFeedError).pipe(
        filter((error): error is string => Boolean(error)),
        take(1),
        map(() => false)
      ),
      timer(4000).pipe(
        take(1),
        map(() => false)
      )
    )
  );
  return true;
};

export const routes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    resolve: { setup: setupFeedResolver },
    children: [
      {
        path: '',
        loadComponent: () => import('./feed.page').then(m => m.FeedPage),
      },
      {
        path: 'opportunities/:itemId',
        loadComponent: () =>
          import('./pages/feed-opportunity-detail.page').then(m => m.FeedOpportunityDetailPage),
      },
      {
        path: 'opportunity/:itemId',
        loadComponent: () =>
          import('./pages/feed-opportunity-detail.page').then(m => m.FeedOpportunityDetailPage),
      },
      {
        path: 'alerts/:itemId',
        loadComponent: () =>
          import('./pages/feed-alert-detail.page').then(m => m.FeedAlertDetailPage),
      },
      {
        matcher: createLegacyPrefixedItemMatcher(LEGACY_ALERT_PREFIXES),
        loadComponent: () =>
          import('./pages/feed-alert-detail.page').then(m => m.FeedAlertDetailPage),
      },
      {
        path: 'indicators/:itemId',
        loadComponent: () =>
          import('./pages/feed-indicator-detail.page').then(m => m.FeedIndicatorDetailPage),
      },
      {
        matcher: createLegacyPrefixedItemMatcher(LEGACY_INDICATOR_PREFIXES),
        loadComponent: () =>
          import('./pages/feed-indicator-detail.page').then(m => m.FeedIndicatorDetailPage),
      },
      {
        path: 'indicator/:itemId',
        loadComponent: () =>
          import('./pages/feed-indicator-detail.page').then(m => m.FeedIndicatorDetailPage),
      },
      {
        path: ':itemId',
        loadComponent: () =>
          import('./pages/feed-opportunity-detail.page').then(m => m.FeedOpportunityDetailPage),
      },
    ],
  },
];

export default routes;

function parseFilters(route: ActivatedRouteSnapshot): FeedFilterState {
  const query = route.queryParamMap;
  const sortParam = normalizeString(query.get('sort'))?.toUpperCase();
  const sort = SORT_OPTIONS.has(sortParam as FeedSort) ? (sortParam as FeedSort) : 'NEWEST';
  const typeParam = normalizeString(query.get('type'))?.toUpperCase();
  const type = TYPE_OPTIONS.has(typeParam as FeedItemType) ? (typeParam as FeedItemType) : null;
  const modeParam = normalizeString(query.get('mode'))?.toUpperCase();
  const mode = MODE_OPTIONS.has(modeParam as FlowMode) ? (modeParam as FlowMode) : 'BOTH';
  const sectorId =
    normalizeString(query.get('sector')) ??
    normalizeString(query.get('sectorId')) ??
    null;
  const fromProvinceId =
    normalizeString(query.get('fromProvince')) ??
    normalizeString(query.get('fromProvinceId')) ??
    null;
  const toProvinceId =
    normalizeString(query.get('toProvince')) ??
    normalizeString(query.get('toProvinceId')) ??
    null;
  const search = normalizeString(query.get('q')) ?? '';

  return {
    fromProvinceId,
    toProvinceId,
    sectorId,
    type,
    mode,
    sort,
    search,
  };
}

function normalizeString(value: MaybeString): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function createLegacyPrefixedItemMatcher(prefixes: readonly string[]) {
  return (segments: UrlSegment[]): UrlMatchResult | null => {
    if (segments.length !== 1) {
      return null;
    }

    const [segment] = segments;
    const path = segment.path.toLowerCase();
    if (!prefixes.some(prefix => path.startsWith(prefix))) {
      return null;
    }

    return {
      consumed: [segment],
      posParams: {
        itemId: segment,
      },
    };
  };
}
