import { selectCatalogState, selectSectors, selectProvinces, selectCompanies, selectCompanyById, CatalogState, Sector, Province, Company } from './catalog.selectors';

describe('Catalog Selectors', () => {
  const sectors: Sector[] = [{ id: 's1', name: 'Oil' }];
  const provinces: Province[] = [{ id: 'p1', name: 'Alberta' }];
  const companies: Company[] = [{ id: 'c1', name: 'ACME' }];

  const state: { catalog: CatalogState } = {
    catalog: {
      sectors,
      provinces,
      companies,
    },
  };

  it('should select catalog state', () => {
    expect(selectCatalogState(state)).toEqual(state.catalog);
  });

  it('should select sectors', () => {
    expect(selectSectors(state)).toEqual(sectors);
  });

  it('should select provinces', () => {
    expect(selectProvinces(state)).toEqual(provinces);
  });

  it('should select companies', () => {
    expect(selectCompanies(state)).toEqual(companies);
  });

  it('should select company by id', () => {
    expect(selectCompanyById('c1')(state)).toEqual(companies[0]);
  });
});
