import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';
import { FavoritesService } from '@app/core/favorites.service';
import { AuthConfigService } from '@app/core/auth/auth-config.service';
import { injectNotificationStore } from '@app/core/observability/notification.store';

type LangCode = 'en' | 'fr';

type SpotlightStaticItem = {
  readonly id: string;
  readonly icon: string;
  readonly labelKey: string;
  readonly descriptionKey?: string;
  readonly commands: string[];
  readonly queryParams?: Record<string, unknown>;
  readonly tags: readonly string[];
};

const SPOTLIGHT_DATA: readonly SpotlightStaticItem[] = [
  {
    id: 'matches',
    icon: '🤝',
    labelKey: 'header.search.results.matches',
    descriptionKey: 'header.search.results.matchesDesc',
    commands: ['/favorites'],
    tags: ['match', 'matches', 'favoris', 'favorites', 'opportunité'],
  },
  {
    id: 'stats',
    icon: '📊',
    labelKey: 'header.search.results.stats',
    descriptionKey: 'header.search.results.statsDesc',
    commands: ['/statistics'],
    tags: ['stat', 'stats', 'statistics', 'données', 'data'],
  },
  {
    id: 'pricing',
    icon: '💳',
    labelKey: 'header.search.results.pricing',
    descriptionKey: 'header.search.results.pricingDesc',
    commands: ['/pricing'],
    tags: ['pricing', 'tarifs', 'abonnement', 'plan'],
  },
  {
    id: 'registration',
    icon: '📝',
    labelKey: 'header.search.results.registration',
    descriptionKey: 'header.search.results.registrationDesc',
    commands: ['/inscription'],
    tags: ['registration', 'inscription', 'company', 'international', 'signup'],
  },
];

@Component({
  selector: 'og7-site-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/layout » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Site Header ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns SiteHeaderComponent gérée par le framework.
 */
export class SiteHeaderComponent {
  @Input({ required: false }) handset = false;
  @Output() menuToggle = new EventEmitter<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly favorites = inject(FavoritesService);
  private readonly authConfig = inject(AuthConfigService);
  private readonly notifications = injectNotificationStore();

  readonly isMobileMenuOpen = signal(false);
  readonly isLangOpen = signal(false);
  readonly isMoreOpen = signal(false);
  readonly isNotifOpen = signal(false);
  readonly isProfileOpen = signal(false);
  readonly isSearchOpen = signal(false);

  readonly currentLang = signal<LangCode>((this.translate.currentLang as LangCode) || 'fr');
  readonly languages: readonly LangCode[] = ['fr', 'en'];

  readonly queryControl = new FormControl<string>('', { nonNullable: true });
  readonly query = signal('');
  readonly hasQuery = computed(() => this.query().trim().length > 0);

  readonly authMode = this.authConfig.authMode;
  readonly loginLabelKey = computed(() => (this.authMode() === 'sso-only' ? 'header.signin' : 'header.login'));

  readonly userSig = this.auth.user;
  readonly isAuthSig = this.auth.isAuthenticated;
  readonly avatarUrlSig = computed(() => this.userSig()?.avatarUrl ?? null);
  readonly displayNameSig = computed(() => {
    const user = this.userSig();
    if (!user) {
      return '';
    }
    const first = user.firstName?.trim() ?? '';
    const last = user.lastName?.trim() ?? '';
    const full = `${first} ${last}`.trim();
    return full || user.email;
  });
  readonly initialsSig = computed(() => {
    const user = this.userSig();
    if (!user) {
      return '';
    }
    const first = user.firstName?.trim().charAt(0) ?? '';
    const last = user.lastName?.trim().charAt(0) ?? '';
    const initials = `${first}${last}`.trim();
    return initials ? initials.toUpperCase() : (user.email?.charAt(0) ?? '?').toUpperCase();
  });

  readonly matchesCountSig = this.favorites.count;

  readonly unreadCount = this.notifications.unreadCount;
  readonly hasUnread = computed(() => this.unreadCount() > 0);
  readonly notificationEntries = computed(() => this.notifications.entries().slice(0, 5));

  readonly spotlightResults = computed(() => {
    const lang = this.currentLang();
    const rawQuery = this.query().trim();
    const normalized = rawQuery.toLowerCase();
    if (!normalized) {
      return [] as {
        readonly id: string;
        readonly icon: string;
        readonly label: string;
        readonly description?: string;
        readonly commands: string[];
        readonly queryParams?: Record<string, unknown>;
      }[];
    }

    const translate = (key: string, params?: Record<string, unknown>) =>
      this.translate.instant(key, params);

    const staticMatches = SPOTLIGHT_DATA.filter((item) =>
      item.tags.some((tag) => tag.includes(normalized))
    ).map((item) => ({
      id: item.id,
      icon: item.icon,
      label: translate(item.labelKey, { query: rawQuery, lang }),
      description: item.descriptionKey ? translate(item.descriptionKey, { lang }) : undefined,
      commands: item.commands,
      queryParams: item.queryParams,
    }));

    return [
      {
        id: 'query',
        icon: '🔍',
        label: translate('header.search.results.query', { query: rawQuery, lang }),
        description: translate('header.search.results.queryDesc', { query: rawQuery, lang }),
        commands: ['/search'],
        queryParams: { q: rawQuery },
      },
      ...staticMatches,
    ];
  });

  constructor() {
    const sub = this.queryControl.valueChanges.subscribe((value) => this.query.set(value));
    this.destroyRef.onDestroy(() => sub.unsubscribe());

    const langSub = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang.set(event.lang as LangCode);
    });
    this.destroyRef.onDestroy(() => langSub.unsubscribe());

    effect(() => {
      const lang = this.currentLang();
      this.translate.use(lang);
    });

    effect(() => {
      const q = this.query();
      // Future integration point: dispatch NgRx search action or trigger local filtering.
      void q;
    });
  }

  setLang(lang: LangCode) {
    this.currentLang.set(lang);
    this.translate.use(lang);
    this.isLangOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  toggleSearch(force?: boolean) {
    const next = force ?? !this.isSearchOpen();
    this.isSearchOpen.set(next);
    if (next) {
      this.isMoreOpen.set(false);
      this.isNotifOpen.set(false);
      this.isProfileOpen.set(false);
      this.isMobileMenuOpen.set(false);
    } else {
      this.queryControl.setValue('', { emitEvent: false });
      this.query.set('');
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((value) => !value);
  }

  toggleLang() {
    this.isLangOpen.update((value) => !value);
  }

  toggleMore() {
    this.isMoreOpen.update((value) => !value);
  }

  toggleNotif() {
    this.isNotifOpen.update((value) => !value);
    if (this.isNotifOpen()) {
      this.notifications.markAllRead();
    }
  }

  toggleProfile() {
    this.isProfileOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.isProfileOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  trackNotification = (_: number, item: { id: string }) => item.id;

  trackResult = (_: number, item: { id: string }) => item.id;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const closeIfOutside = (selector: string, close: () => void) => {
      if (!target.closest(selector)) {
        close();
      }
    };

    closeIfOutside('[data-og7="lang"]', () => this.isLangOpen.set(false));
    closeIfOutside('[data-og7="more"]', () => this.isMoreOpen.set(false));
    closeIfOutside('[data-og7="notif"]', () => this.isNotifOpen.set(false));
    closeIfOutside('[data-og7="profile"]', () => this.isProfileOpen.set(false));

    if (this.isSearchOpen()) {
      const isInsideSpotlight = !!target.closest('[data-og7="spotlight-modal"]');
      const isSpotlightTrigger = !!target.closest('[data-og7="spotlight-trigger"]');
      if (!isInsideSpotlight && !isSpotlightTrigger) {
        this.toggleSearch(false);
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSearch(true);
      return;
    }

    if (event.key === 'Escape') {
      if (this.isSearchOpen()) {
        event.preventDefault();
        this.toggleSearch(false);
        return;
      }
      this.closeFlyouts();
    }
  }

  private closeFlyouts() {
    this.isLangOpen.set(false);
    this.isMoreOpen.set(false);
    this.isNotifOpen.set(false);
    this.isProfileOpen.set(false);
  }
}
