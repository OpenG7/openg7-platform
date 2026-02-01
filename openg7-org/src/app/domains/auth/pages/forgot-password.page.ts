import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'og7-forgot-password-page',
  imports: [ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './forgot-password.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Forgot Password » du dossier « domains/auth/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ForgotPasswordPage gérée par le framework.
 */
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  private readonly emailInputRef = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  private readonly formDirective = viewChild(FormGroupDirective);

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => this.focusFirstInvalidControl());
      return;
    }

    this.apiError.set(null);
    this.success.set(false);
    this.loading.set(true);

    const payload = this.form.getRawValue();

    this.auth
      .requestPasswordReset(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.form.reset();
          this.formDirective()?.resetForm();
          queueMicrotask(() => this.focusEmailField());
        },
        error: (error) => {
          const message = this.resolveErrorMessage(error);
          this.apiError.set(message);
        },
      });
  }

  private focusFirstInvalidControl(): void {
    if (this.form.controls.email.invalid) {
      this.focusEmailField();
    }
  }

  private focusEmailField(): void {
    const emailInput = this.emailInputRef();
    if (emailInput?.nativeElement) {
      emailInput.nativeElement.focus();
    }
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

    return this.translate.instant('auth.errors.passwordResetRequest');
  }
}
