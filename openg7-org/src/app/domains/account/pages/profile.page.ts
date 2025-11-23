import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';
import { injectNotificationStore } from '@app/core/observability/notification.store';
import { AuthUser, UpdateProfilePayload } from '@app/core/auth/auth.types';

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

  protected readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control(''),
    lastName: this.fb.nonNullable.control(''),
    jobTitle: this.fb.nonNullable.control(''),
    organization: this.fb.nonNullable.control(''),
    phone: this.fb.nonNullable.control(''),
    email: this.fb.control(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required, Validators.email] }
    ),
    avatarUrl: this.fb.nonNullable.control(''),
    sectorPreferences: this.fb.nonNullable.control(''),
    provincePreferences: this.fb.nonNullable.control(''),
    emailNotifications: this.fb.nonNullable.control(false),
    notificationWebhook: this.fb.nonNullable.control(''),
  });

  constructor() {
    this.form.controls.avatarUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.avatarPreview.set(this.normalizeString(value)));

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

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.avatarPreview.set(this.normalizeString(profile.avatarUrl));
    this.notifications.updatePreferences(this.buildNotificationPreferences(profile));
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
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
}
