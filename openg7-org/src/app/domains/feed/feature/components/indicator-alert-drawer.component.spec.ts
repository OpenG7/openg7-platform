import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { IndicatorAlertDrawerComponent } from './indicator-alert-drawer.component';

describe('IndicatorAlertDrawerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorAlertDrawerComponent, TranslateModule.forRoot()],
    });
  });

  it('renders threshold, window, and frequency fields with blueprint hooks', () => {
    const fixture = TestBed.createComponent(IndicatorAlertDrawerComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-og7-id="threshold-direction"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-og7-id="threshold-value"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-og7-id="window"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-og7-id="frequency"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-og7-id="notify-delta"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-og7-id="note"]')).toBeTruthy();
  });

  it('emits submitted draft from form values when clicking submit', () => {
    const fixture = TestBed.createComponent(IndicatorAlertDrawerComponent);
    const submittedSpy = jasmine.createSpy('submitted');
    fixture.componentInstance.submitted.subscribe(submittedSpy);

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const thresholdDirection: HTMLSelectElement = fixture.nativeElement.querySelector('[data-og7-id="threshold-direction"]');
    const thresholdValue: HTMLInputElement = fixture.nativeElement.querySelector('[data-og7-id="threshold-value"]');
    const windowSelect: HTMLSelectElement = fixture.nativeElement.querySelector('[data-og7-id="window"]');
    const frequencySelect: HTMLSelectElement = fixture.nativeElement.querySelector('[data-og7-id="frequency"]');
    const notifyDelta: HTMLInputElement = fixture.nativeElement.querySelector('[data-og7-id="notify-delta"]');
    const note: HTMLTextAreaElement = fixture.nativeElement.querySelector('[data-og7-id="note"]');
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('[data-og7-id="indicator-alert-submit"]');

    thresholdDirection.value = 'lt';
    thresholdDirection.dispatchEvent(new Event('change'));

    thresholdValue.value = '18';
    thresholdValue.dispatchEvent(new Event('input'));

    windowSelect.value = '24h';
    windowSelect.dispatchEvent(new Event('change'));

    frequencySelect.value = 'daily';
    frequencySelect.dispatchEvent(new Event('change'));

    notifyDelta.checked = false;
    notifyDelta.dispatchEvent(new Event('change'));

    note.value = '  Add evening threshold watch  ';
    note.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    submitButton.click();

    expect(submittedSpy).toHaveBeenCalledTimes(1);
    expect(submittedSpy).toHaveBeenCalledWith({
      thresholdDirection: 'lt',
      thresholdValue: 18,
      window: '24h',
      frequency: 'daily',
      notifyDelta: false,
      note: 'Add evening threshold watch',
    });
  });
});
