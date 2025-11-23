import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { API_URL } from '../config/environment.tokens';
import { NotificationStore, NotificationStoreApi } from '../observability/notification.store';
import { OpportunityMatch } from '../models/opportunity';
import { OpportunityService } from './opportunity.service';

describe('OpportunityService', () => {
  let service: OpportunityService;
  let translate: jasmine.SpyObj<TranslateService>;
  let notifications: jasmine.SpyObj<NotificationStoreApi>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    translate = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translate.instant.and.returnValue('demo-translation');

    notifications = jasmine.createSpyObj<NotificationStoreApi>('NotificationStore', ['info', 'error', 'success']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OpportunityService,
        TransferState,
        { provide: API_URL, useValue: 'https://cms.local' },
        { provide: TranslateService, useValue: translate },
        { provide: NotificationStore, useValue: notifications },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(OpportunityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('hydrates with demo matches, cloning entries and clearing previous state', () => {
    const demoMatches: OpportunityMatch[] = [
      {
        id: 1,
        commodity: 'Hydrogen',
        mode: 'export',
        confidence: 0.82,
        distanceKm: 1250,
        co2Estimate: 18,
        buyer: {
          id: 10,
          name: 'Buyer Corp',
          province: 'QC',
          sector: 'energy',
          capability: 'import',
        },
        seller: {
          id: 11,
          name: 'Seller Inc',
          province: 'AB',
          sector: 'energy',
          capability: 'export',
        },
      },
    ];

    service.hydrateWithDemo(demoMatches);

    const items = service.items();
    expect(items().length).toBe(1);
    expect(items()[0]).not.toBe(demoMatches[0]);
    expect(items()[0].buyer).not.toBe(demoMatches[0].buyer);
    expect(items()[0].seller).not.toBe(demoMatches[0].seller);

    (demoMatches[0].buyer as any).name = 'Mutated Name';
    (demoMatches[0].seller as any).name = 'Other Mutation';

    expect(service.items()()[0].buyer.name).toBe('Buyer Corp');
    expect(service.items()()[0].seller.name).toBe('Seller Inc');
    expect(service.items()()[0].co2Estimate).toBe(18);

    expect(service.error()()).toBeNull();
    expect(service.loading()()).toBeFalse();

    expect(translate.instant).toHaveBeenCalledWith('opportunities.notifications.demo', { count: 1 });
    expect(notifications.info).toHaveBeenCalledWith('demo-translation', {
      source: 'matches',
      metadata: { count: 1, mode: 'demo' },
    });
  });

  it('ignores stale responses from previous requests when a newer one completes', () => {
    service.loadMatches({ q: 'first' });
    const firstRequest = httpMock.expectOne((req) => req.url === 'https://cms.local/api/opportunity-matches' && req.params.get('q') === 'first');

    service.loadMatches({ q: 'second' });
    const secondRequest = httpMock.expectOne((req) => req.url === 'https://cms.local/api/opportunity-matches' && req.params.get('q') === 'second');

    const latestResponse = {
      data: [
        {
          id: 42,
          attributes: {
            commodity: 'Lithium Hydroxide',
            mode: 'export',
            confidence: 0.7,
            distanceKm: 240,
            co2Estimate: 12,
            buyer: {
              data: {
                id: 200,
                attributes: {
                  name: 'Latest Buyer',
                  province: 'QC',
                  sector: 'energy',
                  capability: 'import',
                },
              },
            },
            seller: {
              data: {
                id: 201,
                attributes: {
                  name: 'Latest Seller',
                  province: 'AB',
                  sector: 'energy',
                  capability: 'export',
                },
              },
            },
          },
        },
      ],
    };

    secondRequest.flush(latestResponse);

    expect(service.items()().length).toBe(1);
    expect(service.items()()[0].commodity).toBe('Lithium Hydroxide');
    expect(service.items()()[0].buyer.name).toBe('Latest Buyer');
    expect(service.items()()[0].seller.name).toBe('Latest Seller');
    expect(service.loading()()).toBeFalse();
    expect(service.error()()).toBeNull();
    expect(notifications.info).toHaveBeenCalledWith('demo-translation', {
      source: 'matches',
      metadata: { count: 1 },
    });

    const infoCallCount = notifications.info.calls.count();
    const translateCallCount = translate.instant.calls.count();

    const staleResponse = {
      data: [
        {
          id: 1,
          attributes: {
            commodity: 'Outdated Commodity',
            mode: 'export',
            confidence: 0.4,
            distanceKm: 500,
            buyer: {
              data: {
                id: 101,
                attributes: {
                  name: 'Stale Buyer',
                  province: 'QC',
                  sector: 'energy',
                  capability: 'import',
                },
              },
            },
            seller: {
              data: {
                id: 102,
                attributes: {
                  name: 'Stale Seller',
                  province: 'AB',
                  sector: 'energy',
                  capability: 'export',
                },
              },
            },
          },
        },
      ],
    };

    firstRequest.flush(staleResponse);

    expect(notifications.info.calls.count()).toBe(infoCallCount);
    expect(translate.instant.calls.count()).toBe(translateCallCount);
    expect(service.items()()[0].commodity).toBe('Lithium Hydroxide');
    expect(service.loading()()).toBeFalse();
    expect(service.error()()).toBeNull();
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('loads a specific match by id when it is not already cached', (done) => {
    const response = {
      data: {
        id: 77,
        attributes: {
          commodity: 'Clean Ammonia',
          mode: 'export',
          confidence: 0.91,
          distanceKm: 480,
          co2Estimate: 22,
          buyer: {
            data: {
              id: 301,
              attributes: {
                name: 'Target Buyer',
                province: 'QC',
                sector: 'energy',
                capability: 'import',
              },
            },
          },
          seller: {
            data: {
              id: 302,
              attributes: {
                name: 'Target Seller',
                province: 'AB',
                sector: 'energy',
                capability: 'export',
              },
            },
          },
        },
      },
    };

    service.loadMatchById(77).subscribe((match) => {
      expect(match?.id).toBe(77);
      expect(service.items()().some((item) => item.id === 77)).toBeTrue();
      expect(notifications.error).not.toHaveBeenCalled();
      done();
    });

    const request = httpMock.expectOne(
      (req) => req.url === 'https://cms.local/api/opportunity-matches/77' && req.params.get('populate') === 'buyer,seller'
    );

    request.flush(response);
  });

  it('returns a cached match without issuing a network request when it already exists', () => {
    service.hydrateWithDemo([
      {
        id: 55,
        commodity: 'Hydrogen',
        mode: 'export',
        confidence: 0.6,
        buyer: {
          id: 1000,
          name: 'Cached Buyer',
          province: 'QC',
          sector: 'energy',
          capability: 'import',
        },
        seller: {
          id: 1001,
          name: 'Cached Seller',
          province: 'AB',
          sector: 'energy',
          capability: 'export',
        },
      },
    ]);

    let result: OpportunityMatch | null | undefined;
    service.loadMatchById(55).subscribe((match) => {
      result = match;
    });

    httpMock.expectNone('https://cms.local/api/opportunity-matches/55');
    expect(result?.id).toBe(55);
  });
});
