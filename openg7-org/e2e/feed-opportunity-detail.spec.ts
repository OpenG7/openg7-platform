import './setup';
import { expect, test } from '@playwright/test';

const opportunityItem = {
  id: 'opportunity-300mw',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:02:00.000Z',
  type: 'REQUEST',
  sectorId: 'energy',
  title: 'Short-term import of 300 MW',
  summary: 'Need short-term import of 300 MW to secure peak load.',
  fromProvinceId: null,
  toProvinceId: null,
  mode: 'IMPORT',
  quantity: {
    value: 300,
    unit: 'MW',
  },
  urgency: 3,
  credibility: 2,
  tags: ['energy', 'import', 'winter'],
  source: {
    kind: 'PARTNER',
    label: 'Grid Ops',
  },
};

test.describe('Feed opportunity detail', () => {
  test('renders details, opens offer drawer, and filters by chip', async ({ page }) => {
    await page.route('**/api/feed/stream**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
        },
        body: '',
      });
    });

    await page.route('**/api/feed**', async (route) => {
      if (route.request().method().toUpperCase() !== 'GET') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [opportunityItem],
          cursor: null,
        }),
      });
    });

    await page.goto('/feed/opportunities/opportunity-300mw');

    await expect(page.locator('[data-og7="opportunity-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-og7="opportunity-detail-header"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Short-term import of 300 MW' })).toBeVisible();
    await expect(page.locator('[data-og7="opportunity-context-aside"]')).toBeVisible();

    await page.locator('[data-og7-id="opportunity-make-offer"]').click();
    await expect(page.locator('[data-og7="opportunity-offer-drawer"]')).toBeVisible();

    await page.locator('[data-og7="opportunity-offer-drawer"] input[type="number"]').fill('280');
    await page.locator('[data-og7="opportunity-offer-drawer"] textarea').fill('We can secure balancing and deliver in 15-minute ramps.');
    await page.locator('[data-og7-id="opportunity-offer-submit"]').click();
    await expect(page.locator('[data-og7="opportunity-offer-drawer"]')).toBeHidden();

    await page.locator('[data-og7-id="opportunity-make-offer"]').click();
    await expect(page.locator('[data-og7="opportunity-offer-drawer"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-og7="opportunity-offer-drawer"]')).toBeHidden();

    await page.locator('[data-og7-id="opportunity-chip-import"]').click();
    await expect(page).toHaveURL(/\/feed\?.*mode=IMPORT/);
  });
});
