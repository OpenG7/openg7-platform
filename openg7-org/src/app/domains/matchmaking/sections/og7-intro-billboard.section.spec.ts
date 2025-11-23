import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA, PLATFORM_ID, ViewChild, signal } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { from, of, throwError } from 'rxjs';
import { IntroductionRequestContext, Og7IntroBillboardSection } from './og7-intro-billboard.section';
import { AnalyticsService } from '@app/core/observability/analytics.service';
import { NotificationStore } from '@app/core/observability/notification.store';
import { TranslateService } from '@ngx-translate/core';
import { PartnerProfileService } from '@app/core/services/partner-profile.service';
import { PartnerProfile } from '@app/core/models/partner-profile';
import { ShareResult, ShareService } from '@app/core/services/share.service';
import { NotificationPanelComponent } from '@app/shared/components/layout/notification-panel.component';
import { OpportunityMatch } from '@app/core/models/opportunity';

describe('Og7IntroBillboardSection (downloads)', () => {
  let fixture: ComponentFixture<Og7IntroBillboardSection>;
  let component: Og7IntroBillboardSection;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let partnerProfiles: jasmine.SpyObj<PartnerProfileService>;
  let notifications: {
    info: jasmine.Spy;
    success: jasmine.Spy;
    error: jasmine.Spy;
    dismiss: jasmine.Spy;
  };
  let shareService: jasmine.SpyObj<ShareService>;

  const profile: PartnerProfile = {
    id: 42,
    role: 'supplier',
    legalName: 'Hydrogen Labs',
  };

  function configureTestBed(platformId: Object = 'browser') {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['emit']);
    partnerProfiles = jasmine.createSpyObj<PartnerProfileService>('PartnerProfileService', [
      'getProfile',
      'downloadProfile',
    ]);
    partnerProfiles.getProfile.and.returnValue(of(null));

    shareService = jasmine.createSpyObj<ShareService>('ShareService', ['sharePartnerProfile']);
    shareService.sharePartnerProfile.and.returnValue(from(Promise.resolve<ShareResult>('shared')));

    notifications = {
      info: jasmine.createSpy('info').and.returnValue('pending-id'),
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
      dismiss: jasmine.createSpy('dismiss'),
    };

    const translateStub = {
      currentLang: 'en',
      instant: (key: string) => key,
    } as unknown as TranslateService;

    TestBed.configureTestingModule({
      imports: [Og7IntroBillboardSection],
      providers: [
        provideMockStore(),
        { provide: AnalyticsService, useValue: analytics },
        { provide: NotificationStore, useValue: notifications },
        { provide: TranslateService, useValue: translateStub },
        { provide: PartnerProfileService, useValue: partnerProfiles },
        { provide: ShareService, useValue: shareService },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(Og7IntroBillboardSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    TestBed.resetTestingModule();
  });

  it('renders the introduction assistant in the primary panel slot when opened', fakeAsync(() => {
    configureTestBed('browser');

    const selection = signal<string | null>('42');
    fixture.componentRef.setInput('selectedPartnerId', selection);
    fixture.componentRef.setInput('forcePanelOpen', true);

    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    const primarySlot: HTMLElement | null = fixture.nativeElement.querySelector('[og7panelprimary]');
    expect(primarySlot).withContext('primary slot should exist').not.toBeNull();
    expect(primarySlot!.querySelector('og7-intro-stepper')).withContext('stepper should render inside primary slot').not.toBeNull();
  }));

  describe('introduction requests', () => {
    const profile: PartnerProfile = {
      id: 11,
      role: 'buyer',
      legalName: 'Northern Buyer',
    };

    const match: OpportunityMatch = {
      id: 73,
      commodity: 'Hydrogen',
      mode: 'import',
      buyer: { id: 1, name: 'Buyer Inc', province: 'QC', sector: 'energy', capability: 'import' },
      seller: { id: 2, name: 'Supplier Ltd', province: 'ON', sector: 'energy', capability: 'export' },
      confidence: 0.78,
    };

    it('delegates introduction requests to the inline content and emits the request context', fakeAsync(() => {
      configureTestBed('browser');
      fixture.componentRef.setInput('forcePanelOpen', true);
      fixture.componentRef.setInput('matchSelected', match);

      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      const content = (component as any).contentRef();
      expect(content).withContext('inline content should be available').not.toBeNull();
      const handler = spyOn(content!, 'handleIntroductionRequest');
      const requests: IntroductionRequestContext[] = [];
      component.introductionRequested.subscribe((ctx) => requests.push(ctx));

      (component as any).handleIntroductionRequested(profile);

      expect(handler).toHaveBeenCalledWith(profile);
      expect(requests).toEqual([{ profile, match }]);
    }));
  });

  describe('sharing (unit)', () => {
    it('shares buyer link and notifies success', fakeAsync(() => {
      configureTestBed('browser');
      shareService.sharePartnerProfile.and.returnValue(from(Promise.resolve<ShareResult>('copied')));

      const buyerProfile: PartnerProfile = {
        id: 7,
        role: 'buyer',
        legalName: 'Northwind Buyer',
      };

      (component as any).buyerProfileSignal.set(buyerProfile);

      (component as any).handleShare(buyerProfile);

      expect(shareService.sharePartnerProfile).toHaveBeenCalledWith(buyerProfile);

      flushMicrotasks();

      expect(notifications.success).toHaveBeenCalledWith(
        'introBillboard.shareSuccess',
        jasmine.objectContaining({
          source: 'matches',
          metadata: jasmine.objectContaining({
            action: 'share-profile',
            profileId: 7,
            strategy: 'copied',
          }),
        })
      );
      expect(notifications.error).not.toHaveBeenCalled();
    }));

    it('shares supplier link and reports an error when the share fails', fakeAsync(() => {
      configureTestBed('browser');
      shareService.sharePartnerProfile.and.returnValue(from(Promise.reject(new Error('share_failed'))));

      const supplierProfile: PartnerProfile = {
        id: 9,
        role: 'supplier',
        legalName: 'Supplier Labs',
      };

      (component as any).supplierProfileSignal.set(supplierProfile);

      (component as any).handleShare(supplierProfile);

      expect(shareService.sharePartnerProfile).toHaveBeenCalledWith(supplierProfile);

      flushMicrotasks();

      expect(notifications.error).toHaveBeenCalledWith(
        'introBillboard.shareError',
        jasmine.objectContaining({
          source: 'matches',
          metadata: jasmine.objectContaining({
            action: 'share-profile',
            profileId: 9,
          }),
        })
      );
      expect(notifications.success).not.toHaveBeenCalled();
    }));
  });

  describe('sharing (integration)', () => {
    @Component({
      selector: 'og7-intro-billboard-host',
      standalone: true,
      imports: [Og7IntroBillboardSection, NotificationPanelComponent],
      templateUrl: './og7-intro-billboard.section.spec.html',
    })
    class HostComponent {
      @ViewChild(Og7IntroBillboardSection, { static: true })
      section!: Og7IntroBillboardSection;
    }

    let hostFixture: ComponentFixture<HostComponent> | null = null;
    let hostComponent: HostComponent | null = null;

    afterEach(() => {
      if (hostFixture) {
        hostFixture.destroy();
        hostFixture = null;
        hostComponent = null;
      }
    });

    it('renders the success notification when sharing succeeds', fakeAsync(() => {
      TestBed.resetTestingModule();

      shareService = jasmine.createSpyObj<ShareService>('ShareService', ['sharePartnerProfile']);
      shareService.sharePartnerProfile.and.returnValue(from(Promise.resolve<ShareResult>('shared')));

      const translateStub = {
        currentLang: 'en',
        instant: (key: string) => key,
      } as unknown as TranslateService;

      analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['emit']);
      partnerProfiles = jasmine.createSpyObj<PartnerProfileService>('PartnerProfileService', [
        'getProfile',
        'downloadProfile',
      ]);
      partnerProfiles.getProfile.and.returnValue(of(null));

      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          provideMockStore(),
          { provide: AnalyticsService, useValue: analytics },
          NotificationStore,
          { provide: TranslateService, useValue: translateStub },
          { provide: PartnerProfileService, useValue: partnerProfiles },
          { provide: ShareService, useValue: shareService },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      hostFixture = TestBed.createComponent(HostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture!.detectChanges();

      const profile: PartnerProfile = {
        id: 12,
        role: 'buyer',
        legalName: 'Integration Buyer',
      };

      (hostComponent!.section as any).buyerProfileSignal.set(profile);
      (hostComponent!.section as any).handleShare(profile);

      flushMicrotasks();
      hostFixture!.detectChanges();

      const panel: HTMLElement | null = hostFixture!.nativeElement.querySelector('[data-og7="notification-panel"]');
      expect(panel?.textContent).toContain('introBillboard.shareSuccess');
    }));
  });

  it('downloads the partner profile and notifies success', () => {
    configureTestBed('browser');
    const blob = new Blob(['test'], { type: 'application/pdf' });
    partnerProfiles.downloadProfile.and.returnValue(of(blob));

    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:download');
    const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    const originalCreateElement = document.createElement.bind(document);
    const anchor = originalCreateElement('a');
    const clickSpy = spyOn(anchor, 'click');
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName.toLowerCase() === 'a') {
        return anchor;
      }
      return originalCreateElement(tagName);
    });

    (component as any).handleDownload(profile);

    expect(analytics.emit).toHaveBeenCalledWith(
      'partner_card_download',
      { id: profile.id, role: profile.role },
      { priority: true }
    );
    expect(partnerProfiles.downloadProfile).toHaveBeenCalledWith(String(profile.id), profile.role);
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:download');
    expect(notifications.info).toHaveBeenCalledWith('introBillboard.downloadPending', jasmine.any(Object));
    expect(notifications.success).toHaveBeenCalledWith('introBillboard.downloadSuccess', jasmine.any(Object));
    expect(notifications.dismiss).toHaveBeenCalledWith('pending-id');
    expect((component as any).downloadingProfileSignal()).toBeFalse();
  });

  it('emits an error notification when the download fails', () => {
    configureTestBed('browser');
    partnerProfiles.downloadProfile.and.returnValue(throwError(() => new Error('network')));

    const createObjectURLSpy = spyOn(URL, 'createObjectURL');

    (component as any).handleDownload(profile);

    expect(analytics.emit).toHaveBeenCalled();
    expect(partnerProfiles.downloadProfile).toHaveBeenCalledWith(String(profile.id), profile.role);
    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
    expect(notifications.dismiss).toHaveBeenCalledWith('pending-id');
    expect((component as any).downloadingProfileSignal()).toBeFalse();
  });

  it('shows an unsupported message when running outside the browser', () => {
    configureTestBed('server');

    (component as any).handleDownload(profile);

    expect(analytics.emit).toHaveBeenCalledWith(
      'partner_card_download',
      { id: profile.id, role: profile.role },
      { priority: true }
    );
    expect(partnerProfiles.downloadProfile).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(
      'introBillboard.downloadUnsupported',
      jasmine.objectContaining({ metadata: jasmine.objectContaining({ profileId: profile.id }) })
    );
    expect(notifications.info).not.toHaveBeenCalled();
    expect((component as any).downloadingProfileSignal()).toBeFalse();
  });
});
