import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { HomeHeroSectionComponent } from './home-hero-section.component';
import { StatMetric } from '@app/shared/components/hero/hero-stats/hero-stats.component';

describe('HomeHeroSectionComponent', () => {
  const stats: StatMetric[] = [
    {
      id: 'tradeValue',
      labelKey: 'metrics.tradeValue',
      value: 2100000,
      kind: 'money',
    },
    {
      id: 'exchangeQty',
      labelKey: 'metrics.exchangeQty',
      value: 60,
      kind: 'count',
      suffixKey: 'metrics.transactions',
    },
    {
      id: 'sectors',
      labelKey: 'metrics.sectors',
      value: 5,
      kind: 'count',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeHeroSectionComponent, TranslateModule.forRoot()],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        hero: {
          title: 'Mapping Canada’s Interprovincial Trade.',
          subtitle: 'Where supply meets demand, from coast to coast',
          quote: { text: 'Quote', author: 'Author' },
          actions: {
            viewSectors: 'View sectors',
            proMode: 'Pro mode',
            registerCompany: 'Register company',
            preview: 'Preview',
          },
        },
        metrics: {
          tradeValue: 'Trade value',
          exchangeQty: 'Exchange quantity',
          sectors: 'Sectors',
          transactions: 'transactions',
        },
        map: {
          badges: { units: { transactions: 'transactions' } },
        },
      },
      true,
    );
    translate.use('en');
  });

  it('renders hero copy and CTA container', () => {
    const fixture = TestBed.createComponent(HomeHeroSectionComponent);
    fixture.componentRef.setInput('stats', stats);
    fixture.detectChanges();

    const section: HTMLElement = fixture.nativeElement.querySelector('og7-hero-section');
    expect(section).toBeTruthy();
    const heading: HTMLElement | null = section.querySelector('#home-hero-heading');
    expect(heading?.textContent).toContain('Mapping Canada’s Interprovincial Trade.');
    expect(section.querySelector('[data-og7="hero"][data-og7-id="ctas"]')).toBeTruthy();
  });

  it('exposes three hero stats badges', () => {
    const fixture = TestBed.createComponent(HomeHeroSectionComponent);
    fixture.componentRef.setInput('stats', stats);
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('og7-hero-stats li');
    expect(badges.length).toBe(3);
  });
});

