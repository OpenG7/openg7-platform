import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';


import { API_URL, API_WITH_CREDENTIALS } from '../config/environment.tokens';
import { RuntimeConfigService } from '../config/runtime-config.service';

import { HttpClientService } from './http-client.service';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpClientService,
        { provide: API_URL, useValue: '/api' },
        { provide: API_WITH_CREDENTIALS, useValue: true },
        {
          provide: RuntimeConfigService,
          useValue: {
            apiUrl: () => '/api',
            apiWithCredentials: () => true,
          },
        },
      ],
    });
    service = TestBed.inject(HttpClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('prefixes API_URL and sets withCredentials by default', () => {
    service.get('/test').subscribe();
    const req = http.expectOne('/api/test');
    expect(req.request.withCredentials).toBeTrue();
  });

  it('allows overriding default options', () => {
    service.post('/test', { a: 1 }, { withCredentials: false }).subscribe();
    const req = http.expectOne('/api/test');
    expect(req.request.withCredentials).toBeFalse();
  });

  it('falls back to runtime config when injection token is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpClientService,
        { provide: API_URL, useValue: '/api' },
        {
          provide: RuntimeConfigService,
          useValue: {
            apiUrl: () => '/api',
            apiWithCredentials: () => false,
          },
        },
      ],
    });

    const localService = TestBed.inject(HttpClientService);
    const localHttp = TestBed.inject(HttpTestingController);
    localService.get('/runtime').subscribe();
    const req = localHttp.expectOne('/api/runtime');
    expect(req.request.withCredentials).toBeFalse();
    localHttp.verify();
  });
});
