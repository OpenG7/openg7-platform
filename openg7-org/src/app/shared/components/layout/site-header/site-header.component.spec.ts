import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes as appRoutes } from '@app/app.routes';
import { AuthConfigService } from '@app/core/auth/auth-config.service';
import { AuthService } from '@app/core/auth/auth.service';
import { AuthMode } from '@app/core/config/environment.tokens';
import { FavoritesService } from '@app/core/favorites.service';
import { NotificationStore } from '@app/core/observability/notification.store';
import { RbacFacadeService } from '@app/core/security/rbac.facade';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { SiteHeaderComponent } from './site-header.component';

class MockTranslateService {
  currentLang = 'en';
  onLangChange = new Subject<{ lang: string }>();
  use(lang: string) {
    this.currentLang = lang;
  }
}

class MockAuthService {
  isAuthenticated = () => false;
}

class MockFavoritesService {
  count = signal(0);
}

class MockAuthConfigService {
  authMode = signal<AuthMode>('local-only');
}

class MockRbacFacadeService {
  hasPermission = jasmine.createSpy('hasPermission').and.returnValue(true);
  setContext = jasmine.createSpy('setContext');
}

class MockNotificationStore {
  entries = signal<any[]>([]);
  unreadCount = signal(0);
  markAllRead = jasmine.createSpy('markAllRead');
  clearHistory = jasmine.createSpy('clearHistory');
}

describe('SiteHeaderComponent', () => {
  let fixture: ComponentFixture<SiteHeaderComponent>;
  let component: SiteHeaderComponent;
  let router: Router;
  let translate: MockTranslateService;
  let favorites: MockFavoritesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent, RouterTestingModule.withRoutes(appRoutes)],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: FavoritesService, useClass: MockFavoritesService },
        { provide: AuthConfigService, useClass: MockAuthConfigService },
        { provide: RbacFacadeService, useClass: MockRbacFacadeService },
        { provide: NotificationStore, useClass: MockNotificationStore }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    translate = TestBed.inject(TranslateService) as unknown as MockTranslateService;
    favorites = TestBed.inject(FavoritesService) as unknown as MockFavoritesService;

    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switchLang updates TranslateService', () => {
    component.setLang('fr');
    expect(translate.currentLang).toBe('fr');
  });

  it('syncs queryControl to query signal', () => {
    component.queryControl.setValue('abc');
    expect(component.query()).toBe('abc');
  });

  it('clears the query when closing the search panel', () => {
    component.queryControl.setValue('hello');
    component.toggleSearch(true);
    expect(component.isSearchOpen()).toBeTrue();

    component.toggleSearch(false);
    expect(component.isSearchOpen()).toBeFalse();
    expect(component.query()).toBe('');
    expect(component.queryControl.value).toBe('');
  });

  it('shows favorite count only when > 0', () => {
    const link: HTMLElement = fixture.nativeElement.querySelector('.toolbar__favorite');
    expect(link.querySelector('span')).toBeNull();

    favorites.count.set(3);
    fixture.detectChanges();
    const badge = link.querySelector('span');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('renders the login link for guests with the /login target and computed label', () => {
    const authConfig = TestBed.inject(AuthConfigService) as unknown as MockAuthConfigService;
    const accountDebugEl = fixture.debugElement.query(By.css('.toolbar__account'));
    const accountLink: HTMLElement = accountDebugEl.nativeElement;
    const routerLink = accountDebugEl.injector.get(RouterLink);

    expect(routerLink.urlTree?.toString()).toBe('/login');
    expect(accountLink.textContent?.trim()).toBe('header.login');

    authConfig.authMode.set('sso-only');
    fixture.detectChanges();

    expect(accountLink.textContent?.trim()).toBe('header.signin');
  });

  it('binds router links to configured routes', () => {
    const configuredPaths = new Set(appRoutes.map(route => (route.path ? `/${route.path}` : '/')));
    const routerLinks = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(debugEl => debugEl.injector.get(RouterLink));

    const linkTargets = routerLinks.map(link => link.urlTree?.toString() ?? '');
    linkTargets.forEach(target => {
      expect(configuredPaths.has(target)).withContext(`Missing route for ${target}`).toBeTrue();
    });
  });
});

