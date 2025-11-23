import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/security ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Crypto ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns CryptoService gérée par le framework.
 */
export class CryptoService {
  private readonly subtle = globalThis.crypto?.subtle ?? null;
  private readonly keyStorageKey = 'auth_crypto_key';
  private readonly ivLength = 12;
  private keyPromise: Promise<CryptoKey | null> | null = null;

  /**
   * Contexte : Checked by token storage before attempting to use browser crypto APIs.
   * Raison d’être : Quickly detects whether the environment can perform AES-GCM operations with persisted keys.
   * @returns True when SubtleCrypto and secure randomness are available.
   */
  get isSupported(): boolean {
    const crypto = globalThis.crypto;
    return !!this.subtle && !!crypto && typeof crypto.getRandomValues === 'function';
  }

  /**
   * Contexte : Used during PKCE and OIDC flows to hash verifiers before sending them to the identity provider.
   * Raison d’être : Provides a promise-based helper that wraps SubtleCrypto.digest with encoding safeguards.
   * @param message Arbitrary string to hash using SHA-256.
   * @returns Promise resolving with the digest bytes.
   */
  async digest(message: string): Promise<ArrayBuffer> {
    if (!this.subtle) {
      throw new Error('SubtleCrypto not available');
    }
    const data = new TextEncoder().encode(message);
    return this.subtle.digest('SHA-256', data);
  }

  /**
   * Contexte : Invoked by the token storage when persisting sensitive tokens client-side.
   * Raison d’être : Encrypts the token payload with AES-GCM before writing to sessionStorage.
   * @param value Plain text value to encrypt.
   * @returns Promise resolving with a base64-encoded cipher string.
   */
  async encrypt(value: string): Promise<string> {
    if (!this.isSupported) {
      throw new Error('SubtleCrypto not available');
    }
    const key = await this.ensureKey();
    if (!key) {
      throw new Error('Unable to initialise encryption key');
    }
    const crypto = globalThis.crypto as Crypto;
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    const encoded = new TextEncoder().encode(value);
    const cipher = await this.subtle!.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const cipherBytes = new Uint8Array(cipher);
    const payload = new Uint8Array(iv.length + cipherBytes.length);
    payload.set(iv, 0);
    payload.set(cipherBytes, iv.length);
    return this.toBase64(payload);
  }

  /**
   * Contexte : Called during app bootstrap when restoring encrypted tokens from sessionStorage.
   * Raison d’être : Decrypts AES-GCM payloads produced by {@link encrypt} to retrieve the original token.
   * @param payload Base64-encoded cipher containing IV and ciphertext.
   * @returns Promise resolving with the decrypted plain text.
   */
  async decrypt(payload: string): Promise<string> {
    if (!this.isSupported) {
      throw new Error('SubtleCrypto not available');
    }
    const key = await this.ensureKey();
    if (!key) {
      throw new Error('Unable to initialise encryption key');
    }
    const bytes = this.fromBase64(payload);
    const iv = bytes.slice(0, this.ivLength);
    const data = bytes.slice(this.ivLength);
    const plaintext = await this.subtle!.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plaintext);
  }

  /**
   * Contexte : Executed on logout flows to avoid leaking encryption material across sessions.
   * Raison d’être : Removes the persisted AES key and resets the in-memory cache so a fresh key is generated later.
   * @returns void
   */
  clearSessionKey(): void {
    const storage = this.getSessionStorage();
    storage?.removeItem(this.keyStorageKey);
    this.keyPromise = null;
  }

  private async ensureKey(): Promise<CryptoKey | null> {
    if (!this.keyPromise) {
      this.keyPromise = this.loadOrCreateKey();
    }
    const key = await this.keyPromise;
    if (!key) {
      this.keyPromise = null;
    }
    return key;
  }

  private async loadOrCreateKey(): Promise<CryptoKey | null> {
    const storage = this.getSessionStorage();
    if (!this.subtle) {
      return null;
    }

    if (storage) {
      const stored = storage.getItem(this.keyStorageKey);
      if (stored) {
        try {
          const raw = this.fromBase64(stored);
          return await this.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
        } catch {
          storage.removeItem(this.keyStorageKey);
        }
      }
    }

    try {
      const crypto = globalThis.crypto as Crypto;
      const material = crypto.getRandomValues(new Uint8Array(32));
      const key = await this.subtle.importKey('raw', material, 'AES-GCM', false, ['encrypt', 'decrypt']);
      if (storage) {
        storage.setItem(this.keyStorageKey, this.toBase64(material));
      }
      material.fill(0);
      return key;
    } catch {
      return null;
    }
  }

  private getSessionStorage(): Storage | null {
    const candidate = typeof window !== 'undefined' ? window.sessionStorage : (globalThis as any).sessionStorage;
    if (!candidate) {
      return null;
    }
    try {
      return candidate;
    } catch {
      return null;
    }
  }

  private toBase64(data: Uint8Array): string {
    return Buffer.from(data).toString('base64');
  }

  private fromBase64(value: string): Uint8Array {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }
}
