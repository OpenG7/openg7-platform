import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RuntimeConfigService } from './runtime-config.service';

describe('RuntimeConfigService', () => {
  const originalWindow = globalThis.window;
  const originalEnv = process.env;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = originalWindow;
    }

    process.env = originalEnv;
  });

  it('prefers the browser runtime manifest when available', () => {
    (globalThis as { window?: { __OG7_CONFIG__?: unknown } }).window = {
      __OG7_CONFIG__: {
        API_URL: 'https://browser.example/api',
        I18N_PREFIX: '/browser/i18n/',
        FEATURE_FLAGS: {
          experimentalMap: true,
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        RuntimeConfigService,
      ],
    });

    const service = TestBed.inject(RuntimeConfigService);

    expect(service.apiUrl()).toBe('https://browser.example/api');
    expect(service.i18nPrefix()).toBe('/browser/i18n/');
    expect(service.featureFlags()).toEqual({ experimentalMap: true });
  });

  it('falls back to process.env on the server', () => {
    (globalThis as { window?: unknown }).window = undefined;
    process.env = {
      ...originalEnv,
      API_URL: 'https://ssr.example/api',
      I18N_PREFIX: '/ssr/i18n/',
      FEATURE_FLAGS: '{"ssrOnly":true}',
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        RuntimeConfigService,
      ],
    });

    const service = TestBed.inject(RuntimeConfigService);

    expect(service.apiUrl()).toBe('https://ssr.example/api');
    expect(service.i18nPrefix()).toBe('/ssr/i18n/');
    expect(service.featureFlags()).toEqual({ ssrOnly: true });
  });
});
