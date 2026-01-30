import { CatalogActions } from './catalog.actions';
import { catalogReducer, initialCatalogState } from './catalog.reducer';
import { Company, Province, Sector } from './catalog.selectors';

describe('catalogReducer', () => {
  const sectors: Sector[] = [{ id: 's1', name: 'Agri' }];
  const provinces: Province[] = [{ id: 'p1', name: 'Quebec' }];
  const companies: Company[] = [{ id: 'c1', name: 'Demo Inc' }];

  it('should hydrate the catalog', () => {
    const state = catalogReducer(
      initialCatalogState,
      CatalogActions.catalogHydrated({ sectors, provinces, companies })
    );

    expect(state).toEqual({ sectors, provinces, companies });
  });

  it('should update individual slices', () => {
    const hydrated = catalogReducer(
      initialCatalogState,
      CatalogActions.catalogHydrated({ sectors, provinces, companies })
    );

    const withSectors = catalogReducer(
      hydrated,
      CatalogActions.sectorsUpdated({ sectors: [] })
    );
    expect(withSectors.sectors).toEqual([]);

    const withProvinces = catalogReducer(
      hydrated,
      CatalogActions.provincesUpdated({ provinces: [] })
    );
    expect(withProvinces.provinces).toEqual([]);

    const withCompanies = catalogReducer(
      hydrated,
      CatalogActions.companiesUpdated({ companies: [] })
    );
    expect(withCompanies.companies).toEqual([]);
  });

  it('should clear the catalog', () => {
    const hydrated = catalogReducer(
      initialCatalogState,
      CatalogActions.catalogHydrated({ sectors, provinces, companies })
    );

    const cleared = catalogReducer(hydrated, CatalogActions.catalogCleared());

    expect(cleared).toEqual(initialCatalogState);
  });
});
