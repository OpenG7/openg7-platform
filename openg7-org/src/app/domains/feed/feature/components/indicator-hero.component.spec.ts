import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { IndicatorHeroComponent } from './indicator-hero.component';

describe('IndicatorHeroComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorHeroComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        feed: {
          title: 'Feed',
          indicator: {
            detail: {
              breadcrumbIndicators: 'Indicators',
              breadcrumbCurrent: 'Ontario electricity',
              actions: {
                subscribe: 'Subscribe',
                subscribed: 'Subscribed',
                share: 'Share',
                createAlert: 'Create alert',
              },
              connection: {
                online: 'Connected',
              },
              chips: {
                windowHours: '{{ value }}h',
              },
              granularity: {
                hour: 'Spot / hourly',
                '15m': '15 min',
                day: 'Daily',
              },
            },
          },
        },
      },
      true
    );
    translate.use('en');
  });

  it('emits subscribe toggle when clicking the subscribe action', () => {
    const fixture = TestBed.createComponent(IndicatorHeroComponent);
    const subscribeSpy = jasmine.createSpy('toggleSubscribe');
    fixture.componentInstance.toggleSubscribe.subscribe(subscribeSpy);

    setRequiredInputs(fixture, { subscribed: false });
    fixture.detectChanges();

    const subscribeButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('[data-og7-id="indicator-subscribe"]');
    expect(subscribeButton).toBeTruthy();

    subscribeButton?.click();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('renders subscribed label when subscribed input is true', () => {
    const fixture = TestBed.createComponent(IndicatorHeroComponent);

    setRequiredInputs(fixture, { subscribed: false });
    fixture.detectChanges();

    const subscribeButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('[data-og7-id="indicator-subscribe"]');
    expect(subscribeButton?.textContent).toContain('Subscribe');

    setRequiredInputs(fixture, { subscribed: true });
    fixture.detectChanges();
    expect(subscribeButton?.textContent).toContain('Subscribed');
  });

  it('emits createAlert when clicking the create alert action', () => {
    const fixture = TestBed.createComponent(IndicatorHeroComponent);
    const createAlertSpy = jasmine.createSpy('createAlert');
    fixture.componentInstance.createAlert.subscribe(createAlertSpy);

    setRequiredInputs(fixture, { subscribed: false });
    fixture.detectChanges();

    const createAlertButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('[data-og7-id="indicator-create-alert"]');
    expect(createAlertButton).toBeTruthy();

    createAlertButton?.click();
    expect(createAlertSpy).toHaveBeenCalledTimes(1);
  });
});

function setRequiredInputs(
  fixture: ReturnType<typeof TestBed.createComponent<IndicatorHeroComponent>>,
  options: { subscribed: boolean }
): void {
  fixture.componentRef.setInput('title', 'Spot electricity price up 12 percent');
  fixture.componentRef.setInput('subtitle', 'Ontario - Electricity - Spot');
  fixture.componentRef.setInput('deltaPctLabel', '+12%');
  fixture.componentRef.setInput('deltaAbsLabel', '+1.13 c/kWh');
  fixture.componentRef.setInput('windowHours', 72);
  fixture.componentRef.setInput('granularityLabel', 'Spot / hourly');
  fixture.componentRef.setInput('lastUpdatedLabel', '2 min ago');
  fixture.componentRef.setInput('subscribed', options.subscribed);
}
