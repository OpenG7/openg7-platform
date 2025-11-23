import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { injectNotificationStore } from '../observability/notification.store';
import { SUPPRESS_ERROR_TOAST } from './error.interceptor.tokens';

/**
 * Contexte : Registered globally to surface consistent toast notifications when HTTP requests fail.
 * Raison d’être : Centralises translation lookup and notification publishing so individual services stay lean.
 * @param req Original HTTP request emitted by Angular.
 * @param next Handler used to forward the request.
 * @returns Observable mirroring the original stream while side-effecting on errors.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const translate = inject(TranslateService);
  const notifications = injectNotificationStore();

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (req.context.get(SUPPRESS_ERROR_TOAST)) {
        return throwError(() => err);
      }
      const key = `errors.${err.status}`;
      let message = translate.instant(key);
      if (message === key) {
        const generic = translate.instant('errors.generic');
        message = generic === 'errors.generic' ? err.statusText || err.message : generic;
      }
      notifications.error(message, {
        source: 'http',
        context: { status: err.status, url: err.url },
        metadata: { status: err.status },
      });
      return throwError(() => err);
    })
  );
};
