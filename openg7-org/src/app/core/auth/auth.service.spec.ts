import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { STRAPI_ROUTES } from '../api/strapi.routes';
import { API_URL } from '../config/environment.tokens';
import { HttpClientService } from '../http/http-client.service';
import { NotificationStore, NotificationStoreApi } from '../observability/notification.store';
import { CryptoService } from '../security/crypto.service';
import { RbacFacadeService } from '../security/rbac.facade';
import { TokenStorageService } from '../security/token-storage.service';

import { AuthService } from './auth.service';
import { OidcService } from './oidc.service';

function flushAsync(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let storage: TokenStorageService;
  let oidc: jasmine.SpyObj<OidcService>;
  let notifications: jasmine.SpyObj<NotificationStoreApi>;
  let translate: { instant: jasmine.Spy };
  let rbac: jasmine.SpyObj<RbacFacadeService>;
  let store: jasmine.SpyObj<Store>;

  beforeEach(() => {
    sessionStorage.clear();
    oidc = jasmine.createSpyObj<OidcService>('OidcService', ['startSignIn']);
    notifications = jasmine.createSpyObj<NotificationStoreApi>('NotificationStore', [
      'success',
      'info',
      'error',
    ]);
    translate = { instant: jasmine.createSpy('instant').and.callFake((key: string) => key) };
    rbac = jasmine.createSpyObj<RbacFacadeService>('RbacFacadeService', ['setContext', 'hasPermission', 'isPremium']);
    rbac.hasPermission.and.returnValue(true);
    rbac.isPremium.and.returnValue(false);
    store = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenStorageService,
        CryptoService,
        HttpClientService,
        { provide: API_URL, useValue: '' },
        { provide: OidcService, useValue: oidc },
        { provide: NotificationStore, useValue: notifications },
        { provide: TranslateService, useValue: translate },
        { provide: RbacFacadeService, useValue: rbac },
        { provide: Store, useValue: store },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorageService);
    rbac.setContext.calls.reset();
  });

  afterEach(async () => {
    http.verify();
    await storage.clear();
    sessionStorage.clear();
    oidc.startSignIn.calls.reset();
    notifications.success.calls.reset();
    notifications.error.calls.reset();
    translate.instant.calls.reset();
    rbac.setContext.calls.reset();
  });

  it('login stores token and updates state', async () => {
    service.login({ email: 'a@a.com', password: '1234' }).subscribe();
    const req = http.expectOne(STRAPI_ROUTES.auth.login);
    expect(req.request.body).toEqual({ identifier: 'a@a.com', password: '1234' });
    const user = { id: '1', email: 'a@a.com', roles: [] };
    req.flush({ jwt: 'abc.def.ghi', user });
    await flushAsync();
    expect(service.token()).toBe('abc.def.ghi');
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBeTrue();
    expect(rbac.setContext).toHaveBeenCalledWith({ role: 'visitor', isPremium: false });
  });

  it('normalizes role metadata from Strapi login payload', async () => {
    service.login({ email: 'pro@example.com', password: '1234' }).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.auth.login);
    req.flush({
      jwt: 'abc.def.ghi',
      user: {
        id: 9,
        email: 'pro@example.com',
        role: { type: 'pro', name: 'Pro' },
      },
    });

    await flushAsync();

    expect(service.user()).toEqual(
      jasmine.objectContaining({
        id: '9',
        email: 'pro@example.com',
        roles: ['pro'],
      })
    );
    expect(rbac.setContext).toHaveBeenCalledWith({ role: 'editor', isPremium: false });
  });

  it('register does not persist a session when JWT is absent', async () => {
    service.register({ email: 'pending@example.com', password: 'secret' }).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.auth.register);
    expect(req.request.method).toBe('POST');
    req.flush({
      user: {
        id: 3,
        email: 'pending@example.com',
        role: { type: 'authenticated', name: 'Authenticated' },
      },
    });

    await flushAsync();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('logout clears token and user', async () => {
    await storage.setToken('token');
    service.logout();
    await flushAsync();
    await expectAsync(storage.getToken()).toBeResolvedTo(null);
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('getProfile updates user state', () => {
    service.getProfile().subscribe();
    const req = http.expectOne(STRAPI_ROUTES.users.meProfile);
    const user = { id: '1', email: 'b@b.com', roles: ['user'] };
    req.flush(user);
    expect(service.user()).toEqual(user);
  });

  it('updateProfile sends payload then updates user state', () => {
    const payload = {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1 555-1234',
      sectorPreferences: ['energy'],
    };

    service.updateProfile(payload).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.users.meProfile);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    const updatedUser = {
      id: '1',
      email: 'jane@example.com',
      roles: ['user'],
      ...payload,
      provincePreferences: ['qc'],
    };

    req.flush(updatedUser);

    expect(service.user()).toEqual(updatedUser);
  });

  it('loginWithOidc delegates to the OIDC service', async () => {
    oidc.startSignIn.and.returnValue(Promise.resolve());

    await service.loginWithOidc('google', { redirectUrl: '/target' });

    expect(oidc.startSignIn).toHaveBeenCalledWith('google', '/target');
  });

  it('completeOidcLogin synchronises token and user state', async () => {
    const response = {
      jwt: 'oidc.token.value',
      user: { id: '2', email: 'oidc@example.com', roles: ['user'] },
    };

    service.completeOidcLogin(response);
    await flushAsync();

    expect(service.token()).toBe(response.jwt);
    expect(service.user()).toEqual(response.user);
    expect(service.isAuthenticated()).toBeTrue();
    expect(rbac.setContext).toHaveBeenCalledWith({ role: 'visitor', isPremium: false });
  });

  it('requestPasswordReset posts payload and emits toast on success', () => {
    service.requestPasswordReset({ email: 'user@example.com' }).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.auth.forgotPassword);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@example.com' });

    req.flush(null);

    expect(notifications.success).toHaveBeenCalledWith(
      'auth.forgotPassword.success',
      jasmine.objectContaining({ source: 'auth' })
    );
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('sendEmailConfirmation posts payload and returns acknowledgment', () => {
    const payload = { email: 'pending@example.com' };
    let response: { email: string; sent: boolean } | undefined;

    service.sendEmailConfirmation(payload).subscribe((value) => {
      response = value;
    });

    const req = http.expectOne(STRAPI_ROUTES.auth.sendEmailConfirmation);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ email: payload.email, sent: true });

    expect(response).toEqual({ email: payload.email, sent: true });
  });

  it('changePassword posts payload and refreshes auth state', () => {
    const payload = {
      currentPassword: 'OldSecret123!',
      password: 'NewSecret456!',
      passwordConfirmation: 'NewSecret456!',
    };

    service.changePassword(payload).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.auth.changePassword);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    const response = {
      jwt: 'rotated.jwt.token',
      user: { id: '2', email: 'secure@example.com', roles: ['user'] },
    };

    req.flush(response);

    expect(service.token()).toBe(response.jwt);
    expect(service.user()).toEqual(response.user);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('requestEmailChange posts payload and returns backend acknowledgment', () => {
    const payload = { currentPassword: 'Current123!', email: 'next@example.com' };
    let response:
      | { email: string; sent: boolean; accountStatus: 'active' | 'emailNotConfirmed' | 'disabled' }
      | undefined;

    service.requestEmailChange(payload).subscribe((value) => {
      response = value;
    });

    const req = http.expectOne(STRAPI_ROUTES.users.meProfileEmailChange);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ email: payload.email, sent: true, accountStatus: 'emailNotConfirmed' });

    expect(response).toEqual({
      email: payload.email,
      sent: true,
      accountStatus: 'emailNotConfirmed',
    });
  });

  it('requestPasswordReset emits error message and triggers error toast', (done) => {
    service.requestPasswordReset({ email: 'bad@example.com' }).subscribe({
      next: () => done.fail('should not emit success'),
      error: (message) => {
        expect(message).toBe('Invalid email');
        expect(notifications.error).toHaveBeenCalledWith(
          'Invalid email',
          jasmine.objectContaining({ source: 'auth' })
        );
        done();
      },
    });

    const req = http.expectOne(STRAPI_ROUTES.auth.forgotPassword);
    req.flush('Invalid email', { status: 400, statusText: 'Bad Request' });
  });

  it('resetPassword posts payload and emits toast on success', () => {
    service.resetPassword({ token: 'abc', password: 'Secret123' }).subscribe();

    const req = http.expectOne(STRAPI_ROUTES.auth.resetPassword);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'abc', password: 'Secret123' });

    req.flush(null);

    expect(notifications.success).toHaveBeenCalledWith(
      'auth.resetPassword.success',
      jasmine.objectContaining({ source: 'auth' })
    );
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('resetPassword forwards error message and triggers error toast', (done) => {
    service.resetPassword({ token: 'oops', password: 'Secret123' }).subscribe({
      next: () => done.fail('should not emit success'),
      error: (message) => {
        expect(message).toBe('Token expired');
        expect(notifications.error).toHaveBeenCalledWith(
          'Token expired',
          jasmine.objectContaining({ source: 'auth' })
        );
        done();
      },
    });

    const req = http.expectOne(STRAPI_ROUTES.auth.resetPassword);
    req.flush('Token expired', { status: 400, statusText: 'Bad Request' });
  });
});
