import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';

import {
  API_URL,
  API_WITH_CREDENTIALS,
  API_TOKEN,
  HOMEPAGE_PREVIEW_TOKEN,
  I18N_PREFIX,
  FEATURE_FLAGS,
  AUTH_MODE,
  NOTIFICATION_WEBHOOK_URL,
  ANALYTICS_ENDPOINT,
} from './core/config/environment.tokens';
import { RuntimeConfigService } from './core/config/runtime-config.service';

export function appConfigProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: API_URL,
      useFactory: () => inject(RuntimeConfigService).apiUrl(),
    },
    {
      provide: API_WITH_CREDENTIALS,
      useFactory: () => inject(RuntimeConfigService).apiWithCredentials(),
    },
    {
      provide: API_TOKEN,
      useFactory: () => inject(RuntimeConfigService).apiToken(),
    },
    {
      provide: HOMEPAGE_PREVIEW_TOKEN,
      useFactory: () => inject(RuntimeConfigService).homepagePreviewToken(),
    },
    {
      provide: I18N_PREFIX,
      useFactory: () => inject(RuntimeConfigService).i18nPrefix(),
    },
    {
      provide: FEATURE_FLAGS,
      useFactory: () => inject(RuntimeConfigService).featureFlags(),
    },
    {
      provide: AUTH_MODE,
      useFactory: () => inject(RuntimeConfigService).authMode(),
    },
    {
      provide: NOTIFICATION_WEBHOOK_URL,
      useFactory: () => inject(RuntimeConfigService).notificationWebhookUrl(),
    },
    {
      provide: ANALYTICS_ENDPOINT,
      useFactory: () => inject(RuntimeConfigService).analyticsEndpoint(),
    },
  ]);
}
