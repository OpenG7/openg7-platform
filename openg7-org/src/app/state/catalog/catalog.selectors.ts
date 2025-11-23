import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface Sector {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface CatalogState {
  sectors: Sector[];
  provinces: Province[];
  companies: Company[];
}

export const selectCatalogState = createFeatureSelector<CatalogState>('catalog');

export const selectSectors = createSelector(
  selectCatalogState,
  (state) => state.sectors
);

export const selectProvinces = createSelector(
  selectCatalogState,
  (state) => state.provinces
);

export const selectCompanies = createSelector(
  selectCatalogState,
  (state) => state.companies
);

export const selectCompanyById = (id: string) =>
  createSelector(selectCompanies, (companies) =>
    companies.find((c) => c.id === id) ?? null
  );
