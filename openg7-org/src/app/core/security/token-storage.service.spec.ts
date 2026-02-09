import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';
import { TokenStorageService } from './token-storage.service';

function createJwt(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${payload}.signature`;
}

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let cryptoService: CryptoService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        CryptoService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    cryptoService = TestBed.inject(CryptoService);
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(async () => {
    await service.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('encrypts tokens in persistent browser storage', async () => {
    if (!cryptoService.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    await service.setToken('secret');

    const raw = localStorage.getItem('auth_token');
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('secret');
    expect(raw).toContain('"cipher"');
    await expectAsync(service.getToken()).toBeResolvedTo('secret');
  });

  it('invalidates expired JWT payloads', async () => {
    if (!cryptoService.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    const expiredToken = createJwt(Math.floor(Date.now() / 1000) - 10);
    await service.setToken(expiredToken);

    await expectAsync(service.getToken()).toBeResolvedTo(null);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('migrates legacy encrypted session payloads to persistent storage', async () => {
    if (!cryptoService.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    await service.setToken('legacy-token');
    const persisted = localStorage.getItem('auth_token');
    expect(persisted).toBeTruthy();
    const cipher = JSON.parse(persisted as string) as { cipher: string };

    localStorage.removeItem('auth_token');
    sessionStorage.setItem('auth_token', cipher.cipher);

    await expectAsync(service.getToken()).toBeResolvedTo('legacy-token');
    expect(localStorage.getItem('auth_token')).toContain('"cipher"');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('falls back to memory storage when crypto is unavailable', async () => {
    const unsupportedCrypto = {
      isSupported: false,
      encrypt: async () => {
        throw new Error('unsupported');
      },
      decrypt: async () => {
        throw new Error('unsupported');
      },
      clearSessionKey: () => {},
    } as unknown as CryptoService;

    const memoryService = new TokenStorageService('browser' as any, unsupportedCrypto);
    await memoryService.setToken('token');

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    await expectAsync(memoryService.getToken()).toBeResolvedTo('token');
  });

  it('uses in-memory storage on server platforms', async () => {
    const ssrService = new TokenStorageService('server' as any, cryptoService);
    await ssrService.setToken('token');

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    await expectAsync(ssrService.getToken()).toBeResolvedTo('token');
  });
});
