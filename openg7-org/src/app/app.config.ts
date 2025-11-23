import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  TransferState,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpBackend, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideTranslateService,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { provideTranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { AppTranslateLoader } from './core/i18n/translate-loader';
import { authInterceptor } from './core/http/auth.interceptor';
import { csrfInterceptor } from './core/http/csrf.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './state/auth/auth.reducer';
import { userReducer } from './state/user/user.reducer';
import { catalogReducer } from './state/catalog/catalog.reducer';
import { mapReducer } from './state/map/map.reducer';
import { appConfigProvider } from './app.config.provider';
import { PLATFORM_ID } from '@angular/core';
import { connectionsReducer } from './store/connections/connections.reducer';
import { ConnectionsEffects } from './store/connections/connections.effects';
import { feedReducer } from './store/feed/feed.reducer';
import { provideTheme } from './theme/provide-theme';
import { DialogModule } from '@angular/cdk/dialog';
import { statisticsReducer } from './store/statistics/statistics.reducer';
import { StatisticsEffects } from './store/statistics/statistics.effects';
import { I18N_PREFIX } from './core/config/environment.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    appConfigProvider(),
    provideTheme(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor, csrfInterceptor, errorInterceptor])),
    provideTranslateService(),
    provideAnimations(),
    ...provideTranslateHttpLoader(),
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useFactory: () => ({ prefix: inject(I18N_PREFIX), suffix: '.json' }),
    },
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
    importProvidersFrom(DialogModule),
    TransferState,
    provideStore({
      auth: authReducer,
      user: userReducer,
      catalog: catalogReducer,
      map: mapReducer,
      connections: connectionsReducer,
      feed: feedReducer,
      statistics: statisticsReducer,
    }),
    provideEffects(ConnectionsEffects, StatisticsEffects),
  ],
};
