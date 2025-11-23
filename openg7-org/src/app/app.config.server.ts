import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom, TransferState } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { HttpBackend, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppTranslateLoader } from './core/i18n/translate-loader';
import { authInterceptor } from './core/http/auth.interceptor';
import { csrfInterceptor } from './core/http/csrf.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { PLATFORM_ID } from '@angular/core';

const serverOnly: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, csrfInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useClass: AppTranslateLoader,
          deps: [HttpBackend, TransferState, PLATFORM_ID],
        },
      })
    ),
    TransferState,
  ],
};

export const appConfigServer: ApplicationConfig = mergeApplicationConfig(appConfig, serverOnly);
