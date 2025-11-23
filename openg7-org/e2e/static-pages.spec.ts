import './setup';
import { expect, test } from '@playwright/test';

interface PageExpectation {
  readonly linkSelector: string;
  readonly urlPart: string;
  readonly pageAttr: string;
  readonly headings: readonly string[];
}

const staticPages: readonly PageExpectation[] = [
  {
    linkSelector: '[data-og7="footer-link-faq"]',
    urlPart: '/faq',
    pageAttr: 'faq',
    headings: ['Frequently asked questions', 'Foire aux questions'],
  },
  {
    linkSelector: '[data-og7="footer-link-terms"]',
    urlPart: '/terms',
    pageAttr: 'terms',
    headings: ['Terms of Service', 'Conditions d’utilisation'],
  },
  {
    linkSelector: '[data-og7="footer-link-privacy"]',
    urlPart: '/privacy',
    pageAttr: 'privacy',
    headings: ['Privacy policy', 'Politique de confidentialité'],
  },
  {
    linkSelector: '[data-og7="footer-link-legal"]',
    urlPart: '/legal',
    pageAttr: 'legal',
    headings: ['Legal notice', 'Mentions légales'],
  },
];

test.describe('Static informational pages', () => {
  for (const pageExpectation of staticPages) {
    test(`navigates to ${pageExpectation.pageAttr} page from the footer`, async ({ page }) => {
      await page.goto('/');
      await page.locator(pageExpectation.linkSelector).click();
      await page.waitForURL(`**${pageExpectation.urlPart}`);

      const container = page.locator(`[data-og7-page="${pageExpectation.pageAttr}"]`);
      await expect(container).toBeVisible();

      const heading = container.locator('h1');
      await expect(heading).toBeVisible();
      const text = (await heading.innerText()).trim();
      expect(pageExpectation.headings.some(expected => text.includes(expected))).toBeTruthy();
    });
  }
});
