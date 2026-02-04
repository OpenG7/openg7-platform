import { FeedItem } from '@app/domains/feed/feature/models/feed.models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { CatalogSource, CatalogSources, Company, Province, Sector } from './catalog.selectors';

export const CatalogActions = createActionGroup({
  source: 'Catalog',
  events: {
    'Catalog Hydrated': props<{
      sectors: Sector[];
      provinces: Province[];
      companies: Company[];
      feedItems?: FeedItem[];
      source?: CatalogSource;
      sources?: Partial<CatalogSources>;
    }>(),
    'Catalog Mock Loaded': props<{
      sectors: Sector[];
      provinces: Province[];
      companies: Company[];
      feedItems: FeedItem[];
    }>(),
    'Sectors Updated': props<{ sectors: Sector[] }>(),
    'Provinces Updated': props<{ provinces: Province[] }>(),
    'Companies Updated': props<{ companies: Company[] }>(),
    'Catalog Cleared': emptyProps(),
  },
});
