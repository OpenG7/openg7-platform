import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfilePage } from './profile.page';
import { AuthService } from '@app/core/auth/auth.service';
import { NotificationStore, NotificationStoreApi } from '@app/core/observability/notification.store';
import { TranslateService } from '@ngx-translate/core';
import { AuthUser } from '@app/core/auth/auth.types';

class TranslateStub {
  instant(key: string): string {
    return key;
  }

  get(key: string) {
    return of(key);
  }
}

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let component: ProfilePage;
  let auth: jasmine.SpyObj<AuthService>;
  let notifications: jasmine.SpyObj<NotificationStoreApi>;

  const profile: AuthUser = {
    id: 'user-1',
    email: 'user@example.com',
    roles: ['user'],
    firstName: 'Jane',
    lastName: 'Doe',
    jobTitle: 'Director',
    organization: 'OpenG7',
    phone: '+1 555-1000',
    avatarUrl: 'https://cdn.example.com/avatar.png',
    sectorPreferences: ['energy', 'agri'],
    provincePreferences: ['qc'],
    notificationPreferences: { emailOptIn: true, webhookUrl: 'https://hooks.example.com/og7' },
  };

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getProfile', 'updateProfile']);
    notifications = jasmine.createSpyObj<NotificationStoreApi>('NotificationStore', [
      'success',
      'error',
      'updatePreferences',
    ]);

    auth.getProfile.and.returnValue(of(profile));
    auth.updateProfile.and.returnValue(of(profile));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: NotificationStore, useValue: notifications },
        { provide: TranslateService, useClass: TranslateStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the profile on init and fills the form', () => {
    expect(auth.getProfile).toHaveBeenCalled();
    const form = (component as any).form;

    expect(form.controls.firstName.value).toBe(profile.firstName);
    expect(form.controls.lastName.value).toBe(profile.lastName);
    expect(form.controls.jobTitle.value).toBe(profile.jobTitle);
    expect(form.controls.sectorPreferences.value).toBe('energy, agri');
    expect(form.controls.provincePreferences.value).toBe('qc');
    expect(form.controls.emailNotifications.value).toBeTrue();
    expect(form.controls.notificationWebhook.value).toBe(
      'https://hooks.example.com/og7'
    );

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-og7="user-profile-email"]')?.textContent).toContain(
      profile.email
    );
    expect(notifications.updatePreferences).toHaveBeenCalled();
  });

  it('submits the form and updates the profile', () => {
    const updated: AuthUser = {
      ...profile,
      firstName: 'Janet',
      avatarUrl: 'https://cdn.example.com/avatar-new.png',
      sectorPreferences: ['energy', 'mining'],
      provincePreferences: ['qc', 'on'],
    };

    auth.updateProfile.and.returnValue(of(updated));

    const form = (component as any).form;
    form.controls.firstName.setValue('Janet');
    form.controls.sectorPreferences.setValue('energy, mining');
    form.controls.provincePreferences.setValue('qc, on');
    form.controls.avatarUrl.setValue(updated.avatarUrl ?? '');
    form.controls.emailNotifications.setValue(false);
    form.controls.notificationWebhook.setValue('');

    (component as any).onSubmit();

    expect(auth.updateProfile).toHaveBeenCalledWith({
      firstName: 'Janet',
      lastName: 'Doe',
      jobTitle: 'Director',
      organization: 'OpenG7',
      phone: '+1 555-1000',
      avatarUrl: updated.avatarUrl,
      sectorPreferences: ['energy', 'mining'],
      provincePreferences: ['qc', 'on'],
      notificationPreferences: { emailOptIn: false, webhookUrl: null },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'auth.profile.success',
      jasmine.objectContaining({ source: 'auth' })
    );
    expect(form.controls.firstName.value).toBe('Janet');
  });

  it('notifies the user when profile update fails', () => {
    auth.updateProfile.and.returnValue(throwError(() => new Error('fail')));

    const form = (component as any).form;
    form.controls.firstName.setValue('Error');

    (component as any).onSubmit();

    expect(notifications.error).toHaveBeenCalledWith(
      'auth.profile.error',
      jasmine.objectContaining({ source: 'auth' })
    );
  });
});
