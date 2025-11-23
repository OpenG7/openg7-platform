import { HttpContext, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { NotificationStore, NotificationStoreApi } from '../observability/notification.store';
import { errorInterceptor } from './error.interceptor';
import { SUPPRESS_ERROR_TOAST } from './error.interceptor.tokens';

describe('errorInterceptor', () => {
  let notifications: NotificationStoreApi;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [NotificationStore],
    });
    notifications = TestBed.inject(NotificationStore) as NotificationStoreApi;
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      errors: { generic: 'generic', 404: 'not found' },
    });
    translate.use('en');
  });

  it('uses i18n and toast service for http errors', () => {
    spyOn(notifications, 'error');
    const req = new HttpRequest('GET', '/test');
    const handler = () =>
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
    TestBed.runInInjectionContext(() =>
      errorInterceptor(req, handler).subscribe({ error: () => {} })
    );
    expect(notifications.error).toHaveBeenCalledWith(
      'not found',
      jasmine.objectContaining({
        source: 'http',
        metadata: jasmine.objectContaining({ status: 404 }),
      })
    );
  });

  it('skips toast notification when the request opts out', () => {
    spyOn(notifications, 'error');
    const req = new HttpRequest('GET', '/test').clone({
      context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true),
    });
    const handler = () =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));
    TestBed.runInInjectionContext(() =>
      errorInterceptor(req, handler).subscribe({ error: () => {} })
    );
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
