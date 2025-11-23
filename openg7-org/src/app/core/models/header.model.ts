export type Og7Locale = 'fr' | 'en';

export interface Og7AnnouncementBar {
  readonly message: string;
  readonly link?: string;
}

export interface Og7SearchConfig {
  readonly placeholder: string;
  readonly suggestions: readonly string[];
}

export interface Og7LanguageSwitch {
  readonly current: Og7Locale;
  readonly available: readonly Og7Locale[];
}

export interface Og7HeaderPayload {
  readonly announcementBar?: Og7AnnouncementBar;
  readonly search: Og7SearchConfig;
  readonly languageSwitch: Og7LanguageSwitch;
}
