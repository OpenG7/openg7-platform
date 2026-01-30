import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
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
  selector: 'og7-register-page',
  imports: [ReactiveFormsModule, TranslateModule, SocialAuthButtonsComponent, RouterLink],
  templateUrl: './register.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Register » du dossier « domains/auth/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns RegisterPage gérée par le framework.
 */
export class RegisterPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = injectNotificationStore();
  private readonly translate = inject(TranslateService);
  private readonly authConfig = inject(AuthConfigService);
  private readonly route = inject(ActivatedRoute);
  private readonly authRedirect = inject(AuthRedirectService);

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly authMode = this.authConfig.authMode;
  protected readonly redirectTarget = signal('/profile');

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

    const payload = this.form.getRawValue();

    this.auth
      .register(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(this.translate.instant('auth.register.success'), {
            source: 'auth',
            metadata: { action: 'register' },
          });
          this.form.reset({ email: '', password: '' });
          const destination = this.authRedirect.consumeRedirectUrl('/profile');
          void this.router.navigateByUrl(destination);
        },
        error: (error) => {
          const message = this.resolveErrorMessage(error);
          this.apiError.set(message);
          this.notifications.error(message, {
            source: 'auth',
            context: error,
            metadata: { action: 'register' },
          });
        },
      });
  }

  private resolveErrorMessage(error: unknown): string {
    const fallback = 'auth.errors.api';

    if (error instanceof HttpErrorResponse) {
      const payloadMessage =
        this.extractErrorMessage(error.error) ??
        this.extractErrorMessage(error.message) ??
        this.extractErrorMessage(error.statusText);
      if (payloadMessage) {
        return this.applyErrorMappings(payloadMessage) ?? payloadMessage;
      }
    }

    if (typeof error === 'string') {
      const trimmed = error.trim();
      if (trimmed) {
        return this.applyErrorMappings(trimmed) ?? trimmed;
      }
    }

    return fallback;
  }

  private extractErrorMessage(payload: unknown): string | null {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (Array.isArray(payload)) {
      for (const entry of payload) {
        const nested = this.extractErrorMessage(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const candidateKeys = ['message', 'error', 'errors', 'detail', 'details', 'data'];
      for (const key of candidateKeys) {
        if (record[key] === undefined) {
          continue;
        }
        const nested = this.extractErrorMessage(record[key]);
        if (nested) {
          return nested;
        }
      }
    }

    return null;
  }

  private applyErrorMappings(message: string): string | null {
    const trimmed = message.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('auth.')) {
      return trimmed;
    }

    const normalized = trimmed.toLowerCase();
    const duplicatePatterns = ['already taken', 'already registered', 'already exists', 'already used', 'in use'];
    if (normalized.includes('email')) {
      const matchesDuplicate = duplicatePatterns.some((pattern) => normalized.includes(pattern));
      if (matchesDuplicate) {
        return 'auth.errors.emailAlreadyExists';
      }
    }

    return null;
  }
}
