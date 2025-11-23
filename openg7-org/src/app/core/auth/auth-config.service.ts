import { Injectable, inject, signal } from '@angular/core';
import { AUTH_MODE, AuthMode } from '../config/environment.tokens';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/auth ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Auth Config ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns AuthConfigService gérée par le framework.
 */
export class AuthConfigService {
  private readonly mode = inject(AUTH_MODE);

  readonly authMode = signal<AuthMode>(this.mode);

  /**
   * Contexte : Consulted by login screens to decide whether the email/password form should be visible.
   * Raison d’être : Interprets the configured auth mode so UI logic stays declarative.
   * @returns True when local credentials are allowed.
   */
  hasLocalCredentials(): boolean {
    return this.authMode() !== 'sso-only';
  }

  /**
   * Contexte : Used by login and onboarding flows to toggle the SSO buttons.
   * Raison d’être : Provides a simple predicate telling the UI when social providers are available.
   * @returns True when at least one social/SSO provider should be displayed.
   */
  hasSocialProviders(): boolean {
    return this.authMode() !== 'local-only';
  }
}
