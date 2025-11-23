import { AuthMode, FeatureFlags } from '../app/core/config/environment.tokens';

export interface ContentSecurityPolicyConfig {
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
}

export interface EnvironmentConfig {
  API_URL: string;
  API_WITH_CREDENTIALS: boolean;
  API_TOKEN: string | null;
  HOMEPAGE_PREVIEW_TOKEN: string | null;
  I18N_PREFIX: string;
  FEATURE_FLAGS: FeatureFlags;
  AUTH_MODE: AuthMode;
  NOTIFICATION_WEBHOOK_URL: string | null;
  ANALYTICS_ENDPOINT: string | null;
  CONTENT_SECURITY_POLICY: ContentSecurityPolicyConfig;
}

export const environment: EnvironmentConfig = {
  API_URL: 'http://localhost:1337',
  API_WITH_CREDENTIALS: true,
  API_TOKEN: null,
  HOMEPAGE_PREVIEW_TOKEN: null,
  I18N_PREFIX: '/assets/i18n/',
  FEATURE_FLAGS: {
    componentLab: false,
  },
  AUTH_MODE: 'hybrid',
  NOTIFICATION_WEBHOOK_URL: null,
  ANALYTICS_ENDPOINT: null,
  CONTENT_SECURITY_POLICY: {
    scriptSrc: [],
    styleSrc: [],
    imgSrc: [],
    fontSrc: [],
    connectSrc: [],
  },
};
