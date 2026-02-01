import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConfigService } from '@app/core/auth/auth-config.service';
import { AuthRedirectService } from '@app/core/auth/auth-redirect.service';
import { AuthService } from '@app/core/auth/auth.service';
import { injectNotificationStore } from '@app/core/observability/notification.store';
import { SocialAuthButtonsComponent } from '@app/shared/components/auth/social-auth-buttons.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'og7-login-page',
  imports: [ReactiveFormsModule, TranslateModule, SocialAuthButtonsComponent, RouterLink],
  templateUrl: './login.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Login » du dossier « domains/auth/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns LoginPage gérée par le framework.
 */
export class LoginPage implements AfterViewInit, OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = injectNotificationStore();
  private readonly translate = inject(TranslateService);
  private readonly authConfig = inject(AuthConfigService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly authRedirect = inject(AuthRedirectService);

  @ViewChild('emailInput')
  private readonly emailInput?: ElementRef<HTMLInputElement>;

  protected readonly emailErrorId = 'auth-login-email-error';
  protected readonly passwordErrorId = 'auth-login-password-error';

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly authMode = this.authConfig.authMode;
  protected readonly passwordVisible = signal(false);
  protected readonly redirectTarget = signal('/profile');

  protected readonly loginSubtitleKey = computed(() => {
    const mode = this.authMode();
    switch (mode) {
      case 'sso-only':
        return 'auth.login.subtitleSsoOnly';
      case 'hybrid':
        return 'auth.login.subtitleHybrid';
      default:
        return 'auth.login.subtitleLocal';
    }
  });

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    const redirectParam = this.route.snapshot.queryParamMap.get('redirect');
    if (redirectParam) {
      this.authRedirect.captureRedirectParam(redirectParam);
    }

    this.redirectTarget.set(this.authRedirect.peekRedirectUrl('/profile'));
  }

  ngAfterViewInit(): void {
    if (this.authMode() === 'sso-only' || !isPlatformBrowser(this.platformId)) {
      return;
    }

    queueMicrotask(() => {
      this.emailInput?.nativeElement.focus({ preventScroll: true });
    });
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((value) => !value);
  }

  protected onSubmit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.apiError.set(null);
    this.loading.set(true);
    this.form.disable({ emitEvent: false });

    const credentials = this.form.getRawValue();

    this.auth
      .login(credentials)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.form.enable({ emitEvent: false });
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success(this.translate.instant('auth.login.success'), {
            source: 'auth',
            metadata: { action: 'login' },
          });
          const destination = this.authRedirect.consumeRedirectUrl('/profile');
          void this.router.navigateByUrl(destination);
        },
        error: (error) => {
          const { message, code, status } = this.resolveErrorMessage(error);
          this.apiError.set(message);
          this.notifications.error(message, {
            source: 'auth',
            context: error,
            metadata: { action: 'login', status: status ?? null, code },
          });
        },
      });
  }

  private resolveErrorMessage(error: unknown): { message: string; code: string | null; status: number | null } {
    const fallback = 'auth.errors.api';
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      const normalized = this.normalizeApiError(payload);
      const explicitCode = this.resolveErrorCode(error.status, normalized?.code ?? null);

      if (explicitCode) {
        return { message: explicitCode, code: explicitCode, status: error.status ?? null };
      }

      if (typeof payload === 'string' && payload.trim()) {
        return { message: payload, code: null, status: error.status ?? null };
      }
      if (payload && typeof payload === 'object') {
        const candidate = (payload as { message?: unknown }).message;
        if (typeof candidate === 'string' && candidate.trim()) {
          return { message: candidate, code: null, status: error.status ?? null };
        }
        if (Array.isArray(candidate)) {
          const first = candidate.find((item) => typeof item === 'string' && item.trim());
          if (typeof first === 'string') {
            return { message: first, code: null, status: error.status ?? null };
          }
        }
      }
      if (typeof error.message === 'string' && error.message.trim()) {
        return { message: error.message, code: null, status: error.status ?? null };
      }
      if (typeof error.statusText === 'string' && error.statusText.trim()) {
        return { message: error.statusText, code: null, status: error.status ?? null };
      }
    }

    if (typeof error === 'string' && error.trim()) {
      return { message: error, code: null, status: null };
    }

    return { message: fallback, code: fallback, status: error instanceof HttpErrorResponse ? error.status ?? null : null };
  }

  private normalizeApiError(payload: unknown): { code?: string | null } | null {
    if (!payload) {
      return null;
    }
    if (typeof payload === 'object') {
      const candidate = payload as { code?: unknown; error?: unknown };
      if (candidate.code && typeof candidate.code === 'string') {
        return { code: candidate.code };
      }
      if (candidate.error && typeof candidate.error === 'object') {
        const nested = candidate.error as {
          code?: unknown;
          name?: unknown;
          message?: unknown;
          status?: unknown;
          details?: unknown;
        };
        if (nested.code && typeof nested.code === 'string') {
          return { code: nested.code };
        }
        if (nested.name && typeof nested.name === 'string') {
          return { code: nested.name };
        }
        if (nested.details && typeof nested.details === 'object') {
          const details = nested.details as { errors?: unknown };
          if (Array.isArray(details.errors)) {
            const first = details.errors.find((item) => typeof item === 'object' && item && 'code' in item);
            const detailCode =
              first && typeof (first as { code?: unknown }).code === 'string'
                ? ((first as { code?: string | undefined }).code ?? null)
                : null;
            if (detailCode) {
              return { code: detailCode };
            }
          }
        }
      }
    }
    return null;
  }

  private resolveErrorCode(status: number | null | undefined, candidate: string | null | undefined): string | null {
    const normalized = candidate?.toLowerCase();
    if (normalized) {
      if (normalized.includes('locked') || normalized.includes('suspended')) {
        return 'auth.errors.accountLocked';
      }
      if (normalized.includes('inactive') || normalized.includes('disabled')) {
        return 'auth.errors.accountDisabled';
      }
      if (normalized.includes('expired')) {
        return 'auth.errors.passwordExpired';
      }
      if (normalized.includes('attempt') || normalized.includes('rate')) {
        return 'auth.errors.tooManyAttempts';
      }
      if (normalized.includes('credential') || normalized.includes('invalid_login')) {
        return 'auth.errors.invalidCredentials';
      }
    }

    switch (status) {
      case 401:
        return 'auth.errors.invalidCredentials';
      case 403:
        return 'auth.errors.accountDisabled';
      case 423:
        return 'auth.errors.accountLocked';
      case 429:
        return 'auth.errors.tooManyAttempts';
      case 503:
        return 'auth.errors.serviceUnavailable';
      default:
        return null;
    }
  }
}

