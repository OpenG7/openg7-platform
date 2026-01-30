import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { FeedActions } from '@app/store/feed/feed.actions';
import { selectFeedHydrated } from '@app/store/feed/feed.selectors';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FeedFilterState } from './models/feed.models';
import { FeedRealtimeService } from './services/feed-realtime.service';

type MaybeString = string | null | undefined;

const SORT_OPTIONS = new Set<FeedFilterState['sort']>(['latest', 'trending', 'recommended']);

const setupFeedResolver: ResolveFn<boolean> = async route => {
  const store = inject(Store);
  const feed = inject(FeedRealtimeService);
  const filters = parseFilters(route);
  store.dispatch(FeedActions.applyFilters({ filters }));
  if (!feed.hasHydrated()) {
    feed.loadInitial();
  }
  await firstValueFrom(
    store.select(selectFeedHydrated).pipe(filter((hydrated): hydrated is true => hydrated === true))
  );
  return true;
};

const drawerResolver: ResolveFn<string | null> = route => {
  const feed = inject(FeedRealtimeService);
  const postId = route.paramMap.get('postId');
  feed.openDrawer(postId);
  return postId;
};

export const routes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    resolve: { setup: setupFeedResolver },
    children: [
      {
        path: '',
        resolve: { drawer: drawerResolver },
        loadComponent: () => import('./feed.page').then(m => m.FeedPage),
      },
      {
        path: ':postId',
        resolve: { drawer: drawerResolver },
        loadComponent: () => import('./feed.page').then(m => m.FeedPage),
      },
    ],
  },
];

export default routes;

function parseFilters(route: ActivatedRouteSnapshot): FeedFilterState {
  const query = route.queryParamMap;
  const sectors = normalizeList(query.get('sectors'));
  const needTypes = normalizeList(query.get('needTypes'));
  const sortParam = normalizeString(query.get('sort'));
  const sort = SORT_OPTIONS.has(sortParam as FeedFilterState['sort'])
    ? (sortParam as FeedFilterState['sort'])
    : 'latest';
  const onlyUnread = normalizeBoolean(query.get('unread'));
  const country = normalizeString(query.get('country')) ?? null;
  const province = normalizeString(query.get('province')) ?? null;
  const search = normalizeString(query.get('q')) ?? '';

  return {
    country,
    province,
    sectors,
    needTypes,
    onlyUnread,
    sort,
    search,
  };
}

function normalizeList(value: MaybeString): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);
}

function normalizeString(value: MaybeString): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeBoolean(value: MaybeString): boolean {
  if (!value) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}
