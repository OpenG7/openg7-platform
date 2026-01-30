import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let cryptoService: CryptoService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        CryptoService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    cryptoService = TestBed.inject(CryptoService);
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(async () => {
    await service.clear();
    sessionStorage.clear();
  });

  it('encrypts tokens in sessionStorage', async () => {
    if (!cryptoService.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }
    await service.setToken('secret');
    const raw = sessionStorage.getItem('auth_token');
    expect(raw).toBeTruthy();
    expect(raw).not.toBe('secret');
    await expectAsync(service.getToken()).toBeResolvedTo('secret');
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
      clearSessionKey: () => {}
    } as unknown as CryptoService;

    const memoryService = new TokenStorageService('browser' as any, unsupportedCrypto);
    await memoryService.setToken('token');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    await expectAsync(memoryService.getToken()).toBeResolvedTo('token');
  });

  it('uses in-memory storage on server platforms', async () => {
    const ssrService = new TokenStorageService('server' as any, cryptoService);
    await ssrService.setToken('token');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    await expectAsync(ssrService.getToken()).toBeResolvedTo('token');
  });
});
