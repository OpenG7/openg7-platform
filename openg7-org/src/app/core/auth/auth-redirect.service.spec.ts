import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthRedirectService } from './auth-redirect.service';

describe('AuthRedirectService', () => {
  let service: AuthRedirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    service = TestBed.inject(AuthRedirectService);
  });

  it('ignores absolute URLs when setting redirect', () => {
    service.setRedirectUrl('https://evil.example/phish');

    expect(service.peekRedirectUrl('/safe')).toBe('/safe');
    expect(service.consumeRedirectUrl('/safe')).toBe('/safe');
  });

  it('normalises query-only redirects', () => {
    service.setRedirectUrl('?next=dashboard');

    expect(service.consumeRedirectUrl('/fallback')).toBe('/?next=dashboard');
  });

  it('normalises relative paths without a leading slash', () => {
    service.setRedirectUrl('reports/daily');

    expect(service.consumeRedirectUrl('/fallback')).toBe('/reports/daily');
  });

  it('sanitises fallback values before returning them', () => {
    expect(service.consumeRedirectUrl('?welcome')).toBe('/?welcome');
  });
});
