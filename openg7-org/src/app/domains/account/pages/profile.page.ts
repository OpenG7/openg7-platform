import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '@app/core/auth/auth.service';
import {
  AccountStatus,
  AuthUser,
  ChangePasswordPayload,
  EmailChangePayload,
  UpdateProfilePayload,
} from '@app/core/auth/auth.types';
import { injectNotificationStore } from '@app/core/observability/notification.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

function optionalUrlValidator(options: { httpsOnly?: boolean } = {}): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const raw = control.value;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return null;
    }

    try {
      const parsed = new URL(raw.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { invalidUrl: true };
      }
      if (options.httpsOnly && parsed.protocol !== 'https:') {
        return { invalidHttpsUrl: true };
      }
      return null;
    } catch {
      return { invalidUrl: true };
    }
  };
}

function optionalPhoneValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const raw = control.value;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return null;
    }

    return /^[+()0-9.\-\s]{7,24}$/.test(raw.trim()) ? null : { invalidPhone: true };
  };
}

function csvListValidator(maxItems: number, maxItemLength: number): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const raw = control.value;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return null;
    }

    const entries = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (entries.length > maxItems) {
      return { listTooLong: true };
    }

    if (entries.some((entry) => entry.length > maxItemLength)) {
      return { listItemTooLong: true };
    }

    return null;
  };
}

function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const raw = control.value;
    if (typeof raw !== 'string' || raw.length === 0) {
      return null;
    }

    const hasUppercase = /[A-Z]/.test(raw);
    const hasLowercase = /[a-z]/.test(raw);
    const hasDigit = /[0-9]/.test(raw);
    const hasSymbol = /[^A-Za-z0-9]/.test(raw);

    return hasUppercase && hasLowercase && hasDigit && hasSymbol ? null : { weakPassword: true };
  };
}

function matchingPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const passwordConfirmation = group.get('passwordConfirmation')?.value;

  if (typeof password !== 'string' || typeof passwordConfirmation !== 'string') {
    return null;
  }

  return password === passwordConfirmation ? null : { passwordMismatch: true };
}

@Component({
  standalone: true,
  selector: 'og7-profile-page',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.page.html',
})
/**
 * Contexte : Chargee par le routeur Angular pour afficher la page "Profile" du dossier "domains/account/pages".
 * Raison d'etre : Lie le template standalone et les dependances de cette page pour la rendre navigable.
 * @param dependencies Dependances injectees automatiquement par Angular.
 * @returns ProfilePage geree par le framework.
 */
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = injectNotificationStore();
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly requestingEmailChange = signal(false);
  protected readonly sendingActivationEmail = signal(false);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly profile = signal<AuthUser | null>(null);
  protected readonly accountStatus = computed<AccountStatus>(() => {
    const status = this.profile()?.accountStatus;
    return status ?? 'active';
  });
  protected readonly accountStatusKey = computed(() => {
    switch (this.accountStatus()) {
      case 'disabled':
        return 'auth.profile.security.status.disabled';
      case 'emailNotConfirmed':
        return 'auth.profile.security.status.emailNotConfirmed';
      default:
        return 'auth.profile.security.status.active';
    }
  });
  protected readonly canResendActivation = computed(() => {
    const current = this.profile();
    return (
      !!current?.email &&
      this.accountStatus() === 'emailNotConfirmed' &&
      !this.loading() &&
      !this.sendingActivationEmail()
    );
  });
  protected readonly canSave = computed(() => {
    return !this.loading() && !this.saving() && this.form.dirty && this.form.valid;
  });
  protected readonly canChangePassword = computed(() => {
    return (
      !this.loading() &&
      !this.changingPassword() &&
      this.passwordForm.dirty &&
      this.passwordForm.valid
    );
  });
  protected readonly canRequestEmailChange = computed(() => {
    return (
      !this.loading() &&
      !this.requestingEmailChange() &&
      this.emailChangeForm.dirty &&
      this.emailChangeForm.valid
    );
  });
  protected readonly hasUnsavedChanges = computed(() => {
    const hasDirtyForm = this.form.dirty || this.passwordForm.dirty || this.emailChangeForm.dirty;
    const isBusy =
      this.saving() || this.changingPassword() || this.requestingEmailChange() || this.loading();
    return hasDirtyForm && !isBusy;
  });

  protected readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    lastName: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
    jobTitle: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    organization: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    phone: this.fb.nonNullable.control('', [optionalPhoneValidator()]),
    email: this.fb.control(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required, Validators.email] }
    ),
    avatarUrl: this.fb.nonNullable.control('', [optionalUrlValidator()]),
    sectorPreferences: this.fb.nonNullable.control('', [csvListValidator(20, 40)]),
    provincePreferences: this.fb.nonNullable.control('', [csvListValidator(20, 20)]),
    emailNotifications: this.fb.nonNullable.control(false),
    notificationWebhook: this.fb.nonNullable.control('', [optionalUrlValidator({ httpsOnly: true })]),
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(10), strongPasswordValidator()]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: [matchingPasswordsValidator] }
  );

  protected readonly emailChangeForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.syncWebhookAvailability(this.form.controls.emailNotifications.value, false);

    this.form.controls.avatarUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.avatarPreview.set(this.normalizeString(value)));

    this.form.controls.emailNotifications.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => this.syncWebhookAvailability(Boolean(enabled), true));

    this.fetchProfile(() => this.loading.set(false));
  }

  protected buildInitials(user: AuthUser): string {
    const first = user.firstName?.trim().charAt(0) ?? '';
    const last = user.lastName?.trim().charAt(0) ?? '';
    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  }

  protected onSubmit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: UpdateProfilePayload = {
      firstName: this.normalizeString(raw.firstName),
      lastName: this.normalizeString(raw.lastName),
      jobTitle: this.normalizeString(raw.jobTitle),
      organization: this.normalizeString(raw.organization),
      phone: this.normalizeString(raw.phone),
      avatarUrl: this.normalizeString(raw.avatarUrl),
      sectorPreferences: this.parseList(raw.sectorPreferences),
      provincePreferences: this.parseList(raw.provincePreferences),
      notificationPreferences: {
        emailOptIn: Boolean(raw.emailNotifications),
        webhookUrl: this.normalizeString(raw.notificationWebhook),
      },
    };

    this.saving.set(true);
    this.auth
      .updateProfile(payload)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (profile) => {
          this.applyProfile(profile);
          this.notifications.success(this.translate.instant('auth.profile.success'), {
            source: 'auth',
            metadata: { action: 'profile-update' },
          });
        },
        error: (error) => {
          const message = this.translate.instant('auth.profile.error');
          this.notifications.error(message, {
            source: 'auth',
            context: error,
            metadata: { action: 'profile-update' },
            deliver: { email: true },
          });
        },
      });
  }

  protected onChangePassword(): void {
    if (this.changingPassword()) {
      return;
    }

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const raw = this.passwordForm.getRawValue();
    if (raw.currentPassword === raw.password) {
      this.passwordForm.controls.password.setErrors({ sameAsCurrent: true });
      this.passwordForm.controls.password.markAsTouched();
      return;
    }

    const payload: ChangePasswordPayload = {
      currentPassword: raw.currentPassword,
      password: raw.password,
      passwordConfirmation: raw.passwordConfirmation,
    };

    this.changingPassword.set(true);
    this.auth
      .changePassword(payload)
      .pipe(
        finalize(() => this.changingPassword.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.resetPasswordForm();
          this.notifications.success(this.translate.instant('auth.profile.security.password.success'), {
            source: 'auth',
            metadata: { action: 'change-password' },
          });
        },
        error: (error) => {
          this.notifications.error(
            this.resolveErrorMessage(error, 'auth.profile.security.password.error'),
            {
              source: 'auth',
              context: error,
              metadata: { action: 'change-password' },
              deliver: { email: true },
            }
          );
        },
      });
  }

  protected onRequestEmailChange(): void {
    if (this.requestingEmailChange()) {
      return;
    }

    if (this.emailChangeForm.invalid) {
      this.emailChangeForm.markAllAsTouched();
      return;
    }

    const currentEmail = this.profile()?.email?.toLowerCase() ?? null;
    const raw = this.emailChangeForm.getRawValue();
    const nextEmail = raw.email.trim().toLowerCase();

    if (currentEmail === nextEmail) {
      this.emailChangeForm.controls.email.setErrors({ sameAsCurrent: true });
      this.emailChangeForm.controls.email.markAsTouched();
      return;
    }

    const payload: EmailChangePayload = {
      currentPassword: raw.currentPassword,
      email: nextEmail,
    };

    this.requestingEmailChange.set(true);
    this.auth
      .requestEmailChange(payload)
      .pipe(
        finalize(() => this.requestingEmailChange.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.resetEmailChangeForm();
          this.notifications.success(this.translate.instant('auth.profile.security.emailChange.success'), {
            source: 'auth',
            metadata: { action: 'email-change-request' },
          });
          this.refreshProfile();
        },
        error: (error) => {
          this.notifications.error(
            this.resolveErrorMessage(error, 'auth.profile.security.emailChange.error'),
            {
              source: 'auth',
              context: error,
              metadata: { action: 'email-change-request' },
              deliver: { email: true },
            }
          );
        },
      });
  }

  protected onSendActivationEmail(): void {
    if (!this.canResendActivation()) {
      return;
    }

    const email = this.profile()?.email?.trim();
    if (!email) {
      return;
    }

    this.sendingActivationEmail.set(true);
    this.auth
      .sendEmailConfirmation({ email })
      .pipe(
        finalize(() => this.sendingActivationEmail.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success(this.translate.instant('auth.login.activationEmailSent'), {
            source: 'auth',
            metadata: { action: 'profile-send-email-confirmation' },
          });
        },
        error: (error) => {
          this.notifications.error(this.resolveActivationEmailError(error), {
            source: 'auth',
            context: error,
            metadata: { action: 'profile-send-email-confirmation' },
          });
        },
      });
  }

  protected resetPendingChanges(): void {
    const profile = this.profile();
    if (!profile || this.saving()) {
      return;
    }
    this.applyProfile(profile);
    this.resetPasswordForm();
    this.resetEmailChangeForm();
  }

  public hasPendingChanges(): boolean {
    return this.hasUnsavedChanges();
  }

  protected onAvatarPreviewError(): void {
    this.avatarPreview.set(null);
  }

  private fetchProfile(onFinalize?: () => void): void {
    this.auth
      .getProfile()
      .pipe(
        finalize(() => onFinalize?.()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (profile) => this.applyProfile(profile),
        error: (error) => {
          const message = this.translate.instant('auth.profile.error');
          this.notifications.error(message, {
            source: 'auth',
            context: error,
            metadata: { action: 'profile-load' },
            deliver: { email: true },
          });
        },
      });
  }

  private refreshProfile(): void {
    this.fetchProfile();
  }

  private applyProfile(profile: AuthUser): void {
    this.profile.set(profile);

    this.form.patchValue(
      {
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        jobTitle: profile.jobTitle ?? '',
        organization: profile.organization ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        sectorPreferences: this.joinList(profile.sectorPreferences),
        provincePreferences: this.joinList(profile.provincePreferences),
        emailNotifications: profile.notificationPreferences?.emailOptIn ?? false,
        notificationWebhook: profile.notificationPreferences?.webhookUrl ?? '',
      },
      { emitEvent: false }
    );

    this.avatarPreview.set(this.normalizeString(profile.avatarUrl));
    this.syncWebhookAvailability(profile.notificationPreferences?.emailOptIn ?? false, true);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.notifications.updatePreferences(this.buildNotificationPreferences(profile));
  }

  private syncWebhookAvailability(enabled: boolean, clearWhenDisabled: boolean): void {
    const webhookControl = this.form.controls.notificationWebhook;

    if (!enabled) {
      if (clearWhenDisabled) {
        webhookControl.setValue('', { emitEvent: false });
      }
      webhookControl.disable({ emitEvent: false });
      webhookControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    webhookControl.enable({ emitEvent: false });
    webhookControl.updateValueAndValidity({ emitEvent: false });
  }

  private buildNotificationPreferences(profile: AuthUser) {
    const prefs = profile.notificationPreferences ?? null;
    return {
      emailAddress: profile.email,
      emailOptIn: Boolean(prefs?.emailOptIn),
      webhookUrl: prefs?.webhookUrl ?? null,
    };
  }

  private joinList(values?: readonly string[] | null): string {
    if (!values?.length) {
      return '';
    }
    return values.join(', ');
  }

  private parseList(value: string): string[] {
    const unique = new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    );
    return Array.from(unique);
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private resetPasswordForm(): void {
    this.passwordForm.reset({
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    });
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
  }

  private resetEmailChangeForm(): void {
    this.emailChangeForm.reset({
      currentPassword: '',
      email: '',
    });
    this.emailChangeForm.markAsPristine();
    this.emailChangeForm.markAsUntouched();
  }

  private resolveActivationEmailError(error: unknown): string {
    const extracted = this.extractErrorMessage(error);
    if (!extracted) {
      return this.translate.instant('auth.login.activationEmailError');
    }

    const normalized = extracted.toLowerCase();
    if (normalized.includes('already confirmed')) {
      return this.translate.instant('auth.login.activationAlreadyConfirmed');
    }
    if (normalized.includes('blocked') || normalized.includes('inactive') || normalized.includes('disabled')) {
      return this.translate.instant('auth.errors.accountDisabled');
    }
    if (normalized.includes('too many') || normalized.includes('rate')) {
      return this.translate.instant('auth.errors.tooManyAttempts');
    }
    if (normalized.includes('email confirmation') && normalized.includes('disabled')) {
      return this.translate.instant('auth.login.activationUnavailable');
    }

    return extracted;
  }

  private resolveErrorMessage(error: unknown, fallbackKey: string): string {
    return this.extractErrorMessage(error) ?? this.translate.instant(fallbackKey);
  }

  private extractErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim().length > 0) {
        return payload.trim();
      }
      if (payload && typeof payload === 'object') {
        const candidate = (payload as { message?: unknown }).message;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          return candidate.trim();
        }
      }
      if (typeof error.message === 'string' && error.message.trim().length > 0) {
        return error.message.trim();
      }
      if (typeof error.statusText === 'string' && error.statusText.trim().length > 0) {
        return error.statusText.trim();
      }
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error.trim();
    }

    if (error && typeof error === 'object') {
      const candidate = (error as { message?: unknown }).message;
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  }
}

