import { createReducer, on } from '@ngrx/store';

import { CatalogActions } from './catalog.actions';
import { CatalogState } from './catalog.selectors';

export const initialCatalogState: CatalogState = {
  sectors: [],
  provinces: [],
  companies: [],
};

export const catalogReducer = createReducer(
  initialCatalogState,
  on(CatalogActions.catalogHydrated, (state, { sectors, provinces, companies }) => ({
    ...state,
    sectors,
    provinces,
    companies,
  })),
  on(CatalogActions.sectorsUpdated, (state, { sectors }) => ({
    ...state,
    sectors,
  })),
  on(CatalogActions.provincesUpdated, (state, { provinces }) => ({
    ...state,
    provinces,
  })),
  on(CatalogActions.companiesUpdated, (state, { companies }) => ({
    ...state,
    companies,
  })),
  on(CatalogActions.catalogCleared, () => ({ ...initialCatalogState }))
);
