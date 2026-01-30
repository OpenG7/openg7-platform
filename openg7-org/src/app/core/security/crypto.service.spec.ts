import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';

function delay(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoService]
    });
    service = TestBed.inject(CryptoService);
    sessionStorage.clear();
  });

  afterEach(() => {
    service.clearSessionKey();
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

  it('re-uses the same key within the session', async () => {
    if (!service.isSupported) {
      pending('SubtleCrypto not available in this environment');
      return;
    }

    const first = await service.encrypt('one');
    await delay();
    const storedKey = sessionStorage.getItem('auth_crypto_key');
    expect(storedKey).toBeTruthy();
    service.clearSessionKey();
    sessionStorage.setItem('auth_crypto_key', storedKey!);
    const decrypted = await service.decrypt(first);
    expect(decrypted).toBe('one');
  });
});
