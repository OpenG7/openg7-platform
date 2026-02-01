import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'og7:auth:redirect';
const DEFAULT_REDIRECT = '/profile';

/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/auth ».
 * Raison d’être : Centralise la gestion du lien de redirection post-authentification.
 * @returns AuthRedirectService gérée par le framework.
 */
@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  private readonly storage: Storage | null;
  private readonly memoryValue = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.storage = this.resolveStorage(platformId);

    const stored = this.readFromStorage();
    if (stored) {
      this.memoryValue.set(stored);
    }
  }

  /**
   * Contexte : Appelé par les guards avant de rediriger vers le login.
   * Raison d’être : Mémorise l’URL que l’utilisateur souhaitait visiter.
   * @param url Chemin ou URL cible à restituer après authentification.
   * @returns void
   */
  setRedirectUrl(url: string | null | undefined): void {
    const normalized = this.normalize(url);

    if (!normalized) {
      this.clearRedirectUrl();
      return;
    }

    this.memoryValue.set(normalized);
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEY, normalized);
      } catch {
        // Ignore quota or availability issues and rely on in-memory storage.
      }
    }
  }

  /**
   * Contexte : Utilisé par les pages d’authentification pour proposer une destination par défaut.
   * Raison d’être : Retourne la redirection stockée sans la consommer.
   * @param fallback Valeur de repli si aucune redirection n’est enregistrée.
   * @returns URL cible ou la valeur de repli.
   */
  peekRedirectUrl(fallback: string = DEFAULT_REDIRECT): string {
    const safeFallback = this.normalize(fallback) ?? DEFAULT_REDIRECT;
    return this.memoryValue() ?? this.readFromStorage() ?? safeFallback;
  }

  /**
   * Contexte : Appelé après un login ou une inscription réussie.
   * Raison d’être : Fournit l’URL de destination et purge l’état mémorisé.
   * @param fallback Valeur de repli si aucune redirection n’est enregistrée.
   * @returns URL cible prête à être transmise au routeur.
   */
  consumeRedirectUrl(fallback: string = DEFAULT_REDIRECT): string {
    const safeFallback = this.normalize(fallback) ?? DEFAULT_REDIRECT;
    const current = this.normalize(this.memoryValue() ?? this.readFromStorage());
    this.clearRedirectUrl();
    return current ?? safeFallback;
  }

  /**
   * Contexte : Permet aux écrans d’authentification d’initialiser l’état via un query param.
   * Raison d’être : Normalise et enregistre la valeur passée en paramètre `redirect`.
   * @param url Valeur potentielle provenant de l’URL.
   * @returns void
   */
  captureRedirectParam(url: string | null): void {
    if (!url) {
      return;
    }
    this.setRedirectUrl(url);
  }

  /**
   * Contexte : Utilisé pour purger manuellement l’état de redirection.
   * Raison d’être : Nettoie la mémoire et le storage lorsque nécessaire.
   * @returns void
   */
  clearRedirectUrl(): void {
    this.memoryValue.set(null);
    if (this.storage) {
      try {
        this.storage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage access issues.
      }
    }
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

  private readFromStorage(): string | null {
    if (!this.storage) {
      return null;
    }
    try {
      const value = this.storage.getItem(STORAGE_KEY);
      const normalized = this.normalize(value);
      if (normalized) {
        this.memoryValue.set(normalized);
        if (value !== normalized) {
          try {
            this.storage.setItem(STORAGE_KEY, normalized);
          } catch {
            // Ignore storage quota errors while keeping the in-memory value.
          }
        }
        return normalized;
      }

      if (value) {
        try {
          this.storage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore storage access issues when attempting to clean unsafe values.
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private normalize(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return null;
    }

    if (this.isExternalUrl(trimmed)) {
      return null;
    }

    const sanitized = `/${trimmed.replace(/^\/+/, '')}`;
    return sanitized === '//' ? '/' : sanitized;
  }

  private isExternalUrl(candidate: string): boolean {
    if (candidate.startsWith('//')) {
      return true;
    }

    return /^[a-z][a-z0-9+.-]*:/i.test(candidate);
  }
}
