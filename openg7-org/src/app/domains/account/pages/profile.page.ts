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
import { AuthUser, UpdateProfilePayload } from '@app/core/auth/auth.types';
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

@Component({
  standalone: true,
  selector: 'og7-profile-page',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.page.html',
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Profile » du dossier « domains/account/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns ProfilePage gérée par le framework.
 */
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = injectNotificationStore();
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly profile = signal<AuthUser | null>(null);
  protected readonly canSave = computed(() => {
    return !this.loading() && !this.saving() && this.form.dirty && this.form.valid;
  });
  protected readonly hasUnsavedChanges = computed(() => this.form.dirty && !this.saving());

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

  constructor() {
    this.syncWebhookAvailability(this.form.controls.emailNotifications.value, false);

    this.form.controls.avatarUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.avatarPreview.set(this.normalizeString(value)));

    this.form.controls.emailNotifications.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => this.syncWebhookAvailability(Boolean(enabled), true));

    this.auth
      .getProfile()
      .pipe(
        finalize(() => this.loading.set(false)),
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

  protected resetPendingChanges(): void {
    const profile = this.profile();
    if (!profile || this.saving()) {
      return;
    }
    this.applyProfile(profile);
  }

  public hasPendingChanges(): boolean {
    return this.form.dirty && !this.saving();
  }

  protected onAvatarPreviewError(): void {
    this.avatarPreview.set(null);
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
}
