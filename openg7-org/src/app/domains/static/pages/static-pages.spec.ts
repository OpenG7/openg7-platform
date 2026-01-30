import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import en from '../../../../assets/i18n/en.json';

import { CreditsPage } from './credits.page';
import { FaqPage } from './faq.page';
import { GovernancePage } from './governance.page';
import { LegalPage } from './legal.page';
import { PrivacyPage } from './privacy.page';
import { TermsPage } from './terms.page';

describe('Static informational pages', () => {
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), TermsPage, PrivacyPage, LegalPage, FaqPage, CreditsPage, GovernancePage],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en as any, true);
    translate.use('en');
  });

  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the Terms page sections with translated content', () => {
    const fixture = createComponent(TermsPage);
    const element: HTMLElement = fixture.nativeElement;
    const container = element.querySelector('[data-og7-page="terms"]');

    expect(container).toBeTruthy();
    const headings = Array.from(container!.querySelectorAll('h2')).map(h => h.textContent?.trim());
    expect(headings).toContain('2. Acceptable use');

    const bulletLists = container!.querySelectorAll('ul');
    expect(bulletLists.length).withContext('Expected at least one bullet list').toBeGreaterThan(0);
  });

  it('renders the Privacy page with collection and rights sections', () => {
    const fixture = createComponent(PrivacyPage);
    const element: HTMLElement = fixture.nativeElement;
    const container = element.querySelector('[data-og7-page="privacy"]');

    expect(container).toBeTruthy();
    const headings = Array.from(container!.querySelectorAll('h2')).map(h => h.textContent?.trim());
    expect(headings).toContain('1. Data we collect');
    expect(headings).toContain('5. Your rights');
  });

  it('highlights legal credits and partners', () => {
    const fixture = createComponent(LegalPage);
    const element: HTMLElement = fixture.nativeElement;
    const container = element.querySelector('[data-og7-page="legal"]');

    expect(container).toBeTruthy();
    const creditsHeading = Array.from(container!.querySelectorAll('h2')).find(h =>
      h.textContent?.includes('Credits & partners')
    );
    expect(creditsHeading?.textContent?.trim()).toBe('Credits & partners');

    const partnersList = container!.querySelectorAll('ul li');
    expect(partnersList.length).withContext('Expected partner acknowledgements').toBeGreaterThan(0);

    const highlightLabels = Array.from(container!.querySelectorAll('[data-og7-legal-highlight] dt')).map(dt =>
      dt.textContent?.trim()
    );
    expect(highlightLabels).toContain('Registration');

    const contactEmails = Array.from(container!.querySelectorAll('[data-og7-legal-contact-channel] a')).map(a =>
      a.textContent?.trim()
    );
    expect(contactEmails).toContain('legal@openg7.org');
  });

  it('displays the FAQ items with questions and answers', () => {
    const fixture = createComponent(FaqPage);
    const element: HTMLElement = fixture.nativeElement;
    const container = element.querySelector('[data-og7-page="faq"]');

    expect(container).toBeTruthy();
    const questions = Array.from(container!.querySelectorAll('dt')).map(dt => dt.textContent?.trim());
    expect(questions).toContain('What is OpenG7?');

    const answers = container!.querySelectorAll('dd p');
    expect(answers.length).withContext('Expected FAQ answers to be rendered').toBeGreaterThan(0);
  });

  it('renders the Credits page hero and contributor cards', () => {
    const fixture = createComponent(CreditsPage);
    const element: HTMLElement = fixture.nativeElement;

    const heroTitle = element.querySelector('#creditsTitle');
    expect(heroTitle?.textContent?.trim()).toBe('An ecosystem built together');

    const contributorCards = element.querySelectorAll('article');
    expect(contributorCards.length).withContext('Expected four contributor cards by default').toBe(4);

    const filterButtons = Array.from(element.querySelectorAll('button')).map(btn => btn.textContent?.trim());
    expect(filterButtons).toContain('Reset');
  });

  it('presents the Governance page with commitments and board members', () => {
    const fixture = createComponent(GovernancePage);
    const element: HTMLElement = fixture.nativeElement;
    const container = element.querySelector('[data-og7-page="governance"]');

    expect(container).toBeTruthy();

    const commitmentCards = container!.querySelectorAll('article');
    expect(commitmentCards.length).withContext('Expected four governance commitments').toBe(4);

    const navLabels = Array.from(
      element.querySelectorAll('[data-og7-governance-nav] a')
    ).map(link => link.textContent?.trim());
    expect(navLabels).toContain('Board & stewardship');

    const boardMembers = element.querySelectorAll('[data-og7-board-member]');
    expect(boardMembers.length).withContext('Expected at least one board member card').toBeGreaterThan(0);
  });

  it('filters contributors by province when the signal changes', () => {
    const fixture = createComponent(CreditsPage);
    const component = fixture.componentInstance;

    component.provinceFilter.set('QC');
    fixture.detectChanges();

    const filteredCards = fixture.nativeElement.querySelectorAll('article');
    expect(filteredCards.length).toBe(2);

    component.resetFilters();
    fixture.detectChanges();

    const allCards = fixture.nativeElement.querySelectorAll('article');
    expect(allCards.length).toBe(component.contributors().length);
  });
});
