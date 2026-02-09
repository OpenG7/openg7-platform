import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/core/auth/auth.service';
import { LoginResponse } from '@app/core/auth/auth.types';
import { AUTH_MODE } from '@app/core/config/environment.tokens';
import { NotificationStore } from '@app/core/observability/notification.store';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';

import { LoginPage } from './login.page';

class MockNotificationStore {
  success = jasmine.createSpy('success');
  info = jasmine.createSpy('info');
  error = jasmine.createSpy('error');
}

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;
  let navigateByUrlSpy: jasmine.Spy;
  let notifications: MockNotificationStore;
  const translateStub = {
    instant: (key: string) => key,
    get: (key: string) => of(key),
    stream: (key: string) => of(key),
    getCurrentLang: () => 'en',
    getFallbackLang: () => 'en',
    onLangChange: new Subject<unknown>(),
    onTranslationChange: new Subject<unknown>(),
    onFallbackLangChange: new Subject<unknown>(),
    onDefaultLangChange: new Subject<unknown>(),
  };

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'sendEmailConfirmation']);

    await TestBed.configureTestingModule({
      imports: [LoginPage, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: AUTH_MODE, useValue: 'hybrid' },
        { provide: NotificationStore, useClass: MockNotificationStore },
        { provide: TranslateService, useValue: translateStub },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    notifications = TestBed.inject(NotificationStore) as unknown as MockNotificationStore;
    navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits valid credentials via AuthService then navigates to profile', () => {
    const credentials = { email: 'user@example.com', password: 'secret' };
    auth.login.and.returnValue(
      of({ jwt: 'token', user: { id: '1', email: credentials.email, roles: [] } })
    );

    const form = (component as any).form;
    form.setValue(credentials);

    (component as any).onSubmit();

    expect(auth.login).toHaveBeenCalledWith(credentials);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/profile');
  });

  it('disables the form while submission is in progress', () => {
    const credentials = { email: 'locked@example.com', password: 'secret' };
    const response$ = new Subject<LoginResponse>();
    auth.login.and.returnValue(response$.asObservable());

    const form = (component as any).form;
    form.setValue(credentials);

    (component as any).onSubmit();
    fixture.detectChanges();

    expect(form.disabled).withContext('form should be disabled during submission').toBeTrue();
    expect((component as any).loading()).toBeTrue();

    response$.next({
      jwt: 'token',
      user: { id: '1', email: credentials.email, roles: [] },
    });
    response$.complete();
    fixture.detectChanges();

    expect(form.disabled).withContext('form should be re-enabled after completion').toBeFalse();
    expect((component as any).loading()).toBeFalse();
  });

  it('sends activation email when account is disabled', () => {
    const email = 'inactive@example.com';
    auth.sendEmailConfirmation.and.returnValue(of({ email, sent: true }));

    const form = (component as any).form;
    form.setValue({ email, password: 'secret' });
    (component as any).apiError.set('auth.errors.accountDisabled');

    (component as any).onSendActivationEmail();

    expect(auth.sendEmailConfirmation).toHaveBeenCalledWith({ email });
    expect(notifications.success).toHaveBeenCalledWith(
      'auth.login.activationEmailSent',
      jasmine.objectContaining({ source: 'auth' })
    );
  });

  it('rejects activation email when email field is invalid', () => {
    const form = (component as any).form;
    form.setValue({ email: 'invalid-email', password: 'secret' });
    (component as any).apiError.set('auth.errors.accountDisabled');

    (component as any).onSendActivationEmail();

    expect(auth.sendEmailConfirmation).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(
      'auth.errors.emailInvalid',
      jasmine.objectContaining({ source: 'auth' })
    );
  });
});
