import { FeedItem } from '@app/domains/feed/feature/models/feed.models';
import {
  selectCatalogState,
  selectSectors,
  selectProvinces,
  selectCompanies,
  selectCompanyById,
  selectCatalogFeedItems,
  selectCatalogFeedItemsByType,
  selectCatalogFeedSource,
  CatalogState,
  CatalogSources,
  Sector,
  Province,
  Company,
} from './catalog.selectors';

describe('Catalog Selectors', () => {
  const sectors: Sector[] = [{ id: 's1', name: 'Oil' }];
  const provinces: Province[] = [{ id: 'p1', name: 'Alberta' }];
  const companies: Company[] = [{ id: 'c1', name: 'ACME' }];
  const feedItems: FeedItem[] = [
    {
      id: 'feed-1',
      createdAt: '2026-02-01T00:00:00Z',
      type: 'ALERT',
      sectorId: 'energy',
      title: 'Test alert',
      summary: 'Alert summary',
      mode: 'BOTH',
      source: { kind: 'GOV', label: 'Test' },
    },
  ];
  const sources: CatalogSources = {
    sectors: 'real',
    provinces: 'real',
    companies: 'real',
    feedItems: 'mock',
  };

  const state: { catalog: CatalogState } = {
    catalog: {
      sectors,
      provinces,
      companies,
      feedItems,
      sources,
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

  it('should select feed items', () => {
    expect(selectCatalogFeedItems(state)).toEqual(feedItems);
  });

  it('should select feed items by type', () => {
    expect(selectCatalogFeedItemsByType('ALERT')(state)).toEqual(feedItems);
  });

  it('should select feed source', () => {
    expect(selectCatalogFeedSource(state)).toBe('mock');
  });
});
