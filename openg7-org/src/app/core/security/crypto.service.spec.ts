import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';

function delay(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoService],
    });
    service = TestBed.inject(CryptoService);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    service.clearSessionKey();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('encrypts and decrypts payloads symmetrically', async () => {
    if (!service.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    const cipher = await service.encrypt('sensitive');
    expect(cipher).toBeTruthy();
    expect(cipher).not.toBe('sensitive');
    const plain = await service.decrypt(cipher);
    expect(plain).toBe('sensitive');
  });

  it('re-uses the same persisted key in local storage', async () => {
    if (!service.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    const first = await service.encrypt('one');
    await delay();
    const storedKey = localStorage.getItem('auth_crypto_key');
    expect(storedKey).toBeTruthy();

    service.clearSessionKey();
    localStorage.setItem('auth_crypto_key', storedKey as string);

    const decrypted = await service.decrypt(first);
    expect(decrypted).toBe('one');
  });

  it('migrates legacy keys from session storage to local storage', async () => {
    if (!service.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    const cipher = await service.encrypt('legacy');
    const storedKey = localStorage.getItem('auth_crypto_key');
    expect(storedKey).toBeTruthy();

    service.clearSessionKey();
    localStorage.removeItem('auth_crypto_key');
    sessionStorage.setItem('auth_crypto_key', storedKey as string);

    const decrypted = await service.decrypt(cipher);
    expect(decrypted).toBe('legacy');
    expect(localStorage.getItem('auth_crypto_key')).toBeTruthy();
    expect(sessionStorage.getItem('auth_crypto_key')).toBeNull();
  });
});
