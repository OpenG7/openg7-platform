import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import { CryptoService } from './crypto.service';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/security ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Token Storage ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns TokenStorageService gérée par le framework.
 */
export class TokenStorageService {
  private readonly storageKey = 'auth_token';
  private memoryToken: string | null = null;
  private readonly storage: Storage | null;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly crypto: CryptoService
  ) {
    this.storage = this.resolveStorage(platformId);
  }

  /**
   * Contexte : Called during bootstrap and HTTP interception to retrieve the persisted auth token.
   * Raison d’être : Decodes the encrypted session token while gracefully handling corrupted payloads.
   * @returns Promise resolving with the stored token or null when absent.
   */
  async getToken(): Promise<string | null> {
    if (this.canUsePersistentStorage()) {
      const raw = this.storage!.getItem(this.storageKey);
      if (!raw) {
        return null;
      }
      try {
        return await this.crypto.decrypt(raw);
      } catch {
        this.storage!.removeItem(this.storageKey);
        this.crypto.clearSessionKey();
        return null;
      }
    }
    return this.memoryToken;
  }

  /**
   * Contexte : Used after login flows to persist the freshly issued auth token.
   * Raison d’être : Encrypts and stores the token in sessionStorage when possible, falling back to memory otherwise.
   * @param token JWT or opaque token to persist.
   * @returns Promise resolved when the token has been stored.
   */
  async setToken(token: string): Promise<void> {
    if (this.canUsePersistentStorage()) {
      try {
        const encrypted = await this.crypto.encrypt(token);
        this.storage!.setItem(this.storageKey, encrypted);
        this.memoryToken = null;
        return;
      } catch {
        this.storage!.removeItem(this.storageKey);
        this.crypto.clearSessionKey();
      }
    }
    this.memoryToken = token;
  }

  /**
   * Contexte : Triggered on logout or session expiration handlers.
   * Raison d’être : Wipes both persisted and in-memory tokens while clearing the crypto session key.
   * @returns Promise resolved once the storage has been cleared.
   */
  async clear(): Promise<void> {
    if (this.storage) {
      this.storage.removeItem(this.storageKey);
    }
    this.crypto.clearSessionKey();
    this.memoryToken = null;
  }

  private canUsePersistentStorage(): boolean {
    return Boolean(this.storage) && this.crypto.isSupported;
  }

  private resolveStorage(platformId: object): Storage | null {
    if (!isPlatformBrowser(platformId)) {
      return null;
    }
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
}
