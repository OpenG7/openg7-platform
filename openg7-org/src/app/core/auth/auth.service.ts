import { Inject, Injectable, computed, signal } from '@angular/core';
import { HttpClientService } from '../http/http-client.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { TokenStorageService } from '../security/token-storage.service';
import { OidcProvider, OidcService } from './oidc.service';
import {
  AuthResponse,
  AuthUser,
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  JwtPayload,
  UpdateProfilePayload,
} from './auth.types';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NotificationStore, NotificationStoreApi } from '../observability/notification.store';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Buffer } from 'buffer';
import { Role } from '../security/rbac.policy';
import { RbacFacadeService } from '../security/rbac.facade';
import { STRAPI_ROUTES, strapiUserById } from '../api/strapi.routes';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state/app.state';
import { AuthActions, UserActions } from '@app/state';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/auth ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Auth ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns AuthService gérée par le framework.
 */
export class AuthService {
  private tokenSig = signal<string | null>(null);
  readonly token = this.tokenSig.asReadonly();
  readonly token$ = toObservable(this.token);

  private userSig = signal<AuthUser | null>(null);
  readonly user = this.userSig.asReadonly();
  readonly user$ = toObservable(this.user);

  readonly isAuthenticated = computed(() => !!this.tokenSig());
  readonly isAuthenticated$ = toObservable(this.isAuthenticated);

  readonly isPremium = computed(() => !!this.userSig()?.premiumActive);
  readonly isPremium$ = toObservable(this.isPremium);

  readonly currentPlanId = computed(() => {
    const user = this.userSig();
    if (user?.premiumPlan) {
      return user.premiumPlan;
    }
    return user?.premiumActive ? 'premium' : null;
  });
  readonly currentPlanId$ = toObservable(this.currentPlanId);

  readonly jwt = computed<JwtPayload | null>(() => {
    const token = this.tokenSig();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      const json =
        typeof atob === 'function'
          ? atob(base64)
          : Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  });
  readonly jwt$ = toObservable(this.jwt);

  constructor(
    private http: HttpClientService,
    private tokenStorage: TokenStorageService,
    private oidc: OidcService,
    @Inject(NotificationStore) private notifications: NotificationStoreApi,
    private translate: TranslateService,
    private rbac: RbacFacadeService,
    private store: Store<AppState>
  ) {
    void this.restoreToken();
    this.syncRbac(this.userSig());
  }

  /**
   * Contexte : Called by the email/password login form when the user submits their credentials.
   * Raison d’être : Delegates authentication to the backend and persists the resulting session state.
   * @param credentials Email/password pair entered by the user.
   * @returns Observable emitting the login response payload.
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(STRAPI_ROUTES.auth.login, credentials).pipe(
      tap((res) => this.persistAuth(res))
    );
  }

  /**
   * Contexte : Triggered by the registration form for self-serve account creation.
   * Raison d’être : Calls the registration endpoint and stores the returned session upon success.
   * @param credentials Email/password pair provided during sign-up.
   * @returns Observable emitting the register response payload.
   */
  register(credentials: { email: string; password: string; username?: string }): Observable<RegisterResponse> {
    const payload = {
      ...credentials,
      username: credentials.username?.trim() || credentials.email,
    };

    return this.http.post<RegisterResponse>(STRAPI_ROUTES.auth.register, payload).pipe(
      tap((res) => this.persistAuth(res))
    );
  }

  /**
   * Contexte : Invoked when a user chooses an external identity provider to sign in.
   * Raison d’être : Delegates to the OIDC service to start the PKCE redirect flow.
   * @param provider Identifier of the OIDC provider to use.
   * @param options Optional redirect target to resume after login.
   * @returns Promise resolved once navigation to the provider has been initiated.
   */
  loginWithOidc(provider: OidcProvider, options?: { redirectUrl?: string }): Promise<void> {
    return this.oidc.startSignIn(provider, options?.redirectUrl);
  }

  /**
   * Contexte : Called by the callback page after exchanging the OIDC code for tokens.
   * Raison d’être : Persists the authenticated session returned by the backend.
   * @param response Auth payload returned by the OIDC callback endpoint.
   * @returns void
   */
  completeOidcLogin(response: AuthResponse): void {
    this.persistAuth(response);
  }

  /**
   * Contexte : Triggered when the user explicitly signs out or when the session expires.
   * Raison d’être : Clears tokens, user state and RBAC context across the app.
   * @returns void
   */
  logout(): void {
    void this.tokenStorage.clear();
    this.tokenSig.set(null);
    this.userSig.set(null);
    this.syncRbac(null);
    this.store.dispatch(AuthActions.sessionCleared());
    this.store.dispatch(UserActions.profileCleared());
  }

  /**
   * Contexte : Used by account pages to refresh the authenticated user profile.
   * Raison d’être : Fetches profile data and synchronises local state accordingly.
   * @returns Observable emitting the latest profile payload.
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(STRAPI_ROUTES.users.me).pipe(
      tap((user) => {
        this.userSig.set(user);
        this.syncRbac(user);
        this.store.dispatch(
          UserActions.profileHydrated({ profile: user, permissions: user.roles ?? [] })
        );
      })
    );
  }

  /**
   * Contexte : Triggered by profile forms when the user saves updates.
   * Raison d’être : Submits the updated profile to the API and refreshes local state.
   * @param payload Profile fields to update.
   * @returns Observable emitting the updated profile.
   */
  updateProfile(payload: UpdateProfilePayload): Observable<ProfileResponse> {
    const userId = this.userSig()?.id;
    if (!userId) {
      return throwError(() => new Error('auth.errors.userNotLoaded'));
    }
    return this.http.put<ProfileResponse>(strapiUserById(userId), payload).pipe(
      tap((user) => {
        this.userSig.set(user);
        this.syncRbac(user);
        this.store.dispatch(
          UserActions.profileHydrated({ profile: user, permissions: user.roles ?? [] })
        );
      })
    );
  }

  /**
   * Contexte : Called by the forgot-password form when a user asks for a reset link.
   * Raison d’être : Triggers the backend email flow and surfaces a toast feedback.
   * @param payload Object containing the email address to reset.
   * @returns Observable completing once the request is handled.
   */
  requestPasswordReset(payload: { email: string }): Observable<void> {
    return this.http.post<void>(STRAPI_ROUTES.auth.forgotPassword, payload).pipe(
      tap(() =>
        this.notifications.success(
          this.translate.instant('auth.forgotPassword.success'),
          { source: 'auth', metadata: { action: 'forgot-password' } }
        )
      ),
      catchError((error) =>
        this.handleError(error, 'auth.errors.passwordResetRequest')
      )
    );
  }

  /**
   * Contexte : Executed by the reset-password page after the user sets a new password.
   * Raison d’être : Confirms the reset with the backend and notifies the user of success or failure.
   * @param payload Token and new password selected by the user.
   * @returns Observable completing when the reset has been processed.
   */
  resetPassword(payload: { token: string; password: string }): Observable<void> {
    return this.http.post<void>(STRAPI_ROUTES.auth.resetPassword, payload).pipe(
      tap(() =>
        this.notifications.success(
          this.translate.instant('auth.resetPassword.success'),
          { source: 'auth', metadata: { action: 'reset-password' } }
        )
      ),
      catchError((error) => this.handleError(error, 'auth.errors.resetPassword'))
    );
  }

  /**
   * Contexte : Used by billing UI to display the active subscription tier.
   * Raison d’être : Provides synchronous access to the computed plan identifier.
   * @returns The plan identifier or null when no subscription is active.
   */
  currentPlan(): string | null {
    return this.currentPlanId();
  }

  private syncRbac(user: AuthUser | null): void {
    const roles = user?.roles ?? [];
    const role = this.resolveRole(roles);
    this.rbac.setContext({ role, isPremium: !!user?.premiumActive });
  }

  private resolveRole(roles: readonly string[]): Role {
    if (roles.includes('admin')) {
      return 'admin';
    }
    if (roles.includes('editor')) {
      return 'editor';
    }
    return 'visitor';
  }

  private persistAuth(res: AuthResponse): void {
    void this.tokenStorage.setToken(res.jwt);
    this.tokenSig.set(res.jwt);
    this.userSig.set(res.user);
    this.syncRbac(res.user);
    const jwtExp = this.jwt()?.exp ?? null;
    this.store.dispatch(AuthActions.sessionHydrated({ user: res.user, jwtExp }));
    this.store.dispatch(
      UserActions.profileHydrated({ profile: res.user, permissions: res.user.roles ?? [] })
    );
  }

  private async restoreToken(): Promise<void> {
    const token = await this.tokenStorage.getToken();
    this.tokenSig.set(token);
  }

  private handleError(error: unknown, fallbackKey: string): Observable<never> {
    const message = this.extractErrorMessage(error) ?? this.translate.instant(fallbackKey);
    this.notifications.error(message, {
      source: 'auth',
      context: error,
      metadata: { fallbackKey },
      deliver: { email: true },
    });
    return throwError(() => message);
  }

  private extractErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
      if (payload && typeof payload === 'object') {
        const candidate = (payload as { message?: unknown }).message;
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }
        if (Array.isArray(candidate)) {
          const first = candidate.find((item) => typeof item === 'string' && item.trim());
          if (typeof first === 'string') {
            return first;
          }
        }
      }
      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
      if (typeof error.statusText === 'string' && error.statusText.trim()) {
        return error.statusText;
      }
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error && typeof error === 'object') {
      const candidate = (error as { message?: unknown }).message;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    return null;
  }
}
