import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Company, Province, Sector } from './catalog.selectors';

export const CatalogActions = createActionGroup({
  source: 'Catalog',
  events: {
    'Catalog Hydrated': props<{ sectors: Sector[]; provinces: Province[]; companies: Company[] }>(),
    'Sectors Updated': props<{ sectors: Sector[] }>(),
    'Provinces Updated': props<{ provinces: Province[] }>(),
    'Companies Updated': props<{ companies: Company[] }>(),
    'Catalog Cleared': emptyProps(),
  },
});
