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

const alertItem = {
  id: 'alert-ice-storm',
  createdAt: '2026-01-22T14:00:00.000Z',
  updatedAt: '2026-01-22T14:02:00.000Z',
  type: 'ALERT',
  sectorId: 'energy',
  title: 'Ice storm risk on Ontario transmission lines',
  summary: 'Icing risk expected across Ontario transmission corridors.',
  fromProvinceId: null,
  toProvinceId: null,
  mode: 'BOTH',
  urgency: 3,
  credibility: 2,
  tags: ['weather', 'grid', 'ice'],
  source: {
    kind: 'GOV',
    label: 'Environment Canada',
  },
};

const indicatorItem = {
  id: 'indicator-spot-ontario',
  createdAt: '2026-01-21T09:00:00.000Z',
  updatedAt: '2026-01-21T09:03:00.000Z',
  type: 'INDICATOR',
  sectorId: 'energy',
  title: 'Spot electricity price up 12 percent',
  summary: 'Ontario spot electricity prices rose in the last 72 hours.',
  fromProvinceId: null,
  toProvinceId: null,
  mode: 'BOTH',
  urgency: 2,
  credibility: 2,
  tags: ['price', 'spot', 'ontario'],
  source: {
    kind: 'GOV',
    label: 'IESO',
  },
};

test.describe('Feed indicator detail', () => {
  test('renders indicator detail and supports alert drawer flow', async ({ page }) => {
    await page.route('**/api/feed/stream**', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
        },
        body: '',
      });
    });

    await page.route('**/api/feed**', async route => {
      if (route.request().method().toUpperCase() !== 'GET') {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [indicatorItem, alertItem, opportunityItem],
          cursor: null,
        }),
      });
    });

    await page.goto('/feed/indicators/indicator-spot-ontario');

    await expect(page.locator('[data-og7="indicator-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-og7="indicator-detail-header"]')).toBeVisible();
    await expect(page.locator('[data-og7="indicator-chart"]')).toBeVisible();
    await expect(page.locator('[data-og7="indicator-stats-aside"]')).toBeVisible();

    await page.locator('[data-og7-id="indicator-subscribe"]').click();
    await page.locator('[data-og7-id="indicator-timeframe-24h"]').click();
    await page.locator('[data-og7-id="indicator-granularity-hour"]').click();

    await page.locator('[data-og7-id="indicator-create-alert"]').click();
    await expect(page.locator('[data-og7="indicator-alert-drawer"]')).toBeVisible();
    await page.locator('[data-og7="indicator-alert-drawer"] input[type="number"]').fill('15');
    await page.locator('[data-og7="indicator-alert-drawer"] textarea').fill('Notify operations if spot prices exceed threshold.');
    await page.locator('[data-og7-id="indicator-alert-submit"]').click();
    await expect(page.locator('[data-og7="indicator-alert-drawer"]')).toBeHidden();

    await page.locator('[data-og7="indicator-related-opportunities"] ul li button').first().click();
    await expect(page).toHaveURL(/\/feed\/opportunities\/opportunity-300mw/);
  });
});
