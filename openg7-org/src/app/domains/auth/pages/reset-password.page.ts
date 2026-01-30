import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'og7-reset-password-page',
  imports: [ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './reset-password.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Reset Password » du dossier « domains/auth/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ResetPasswordPage gérée par le framework.
 */
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    token: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
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
    this.success.set(false);
    this.loading.set(true);

    const payload = this.form.getRawValue();

    this.auth
      .resetPassword(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          void this.router.navigate(['/login']);
        },
        error: (error) => {
          const message = this.resolveErrorMessage(error);
          this.apiError.set(message);
        },
      });
  }

  private resolveErrorMessage(error: unknown): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
    }

    return this.translate.instant('auth.errors.resetPassword');
  }
}
