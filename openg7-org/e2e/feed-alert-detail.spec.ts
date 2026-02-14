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

test.describe('Feed alert detail', () => {
  test('renders alert details with dedicated CTA and related links', async ({ page }) => {
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
          data: [alertItem, opportunityItem],
          cursor: null,
        }),
      });
    });

    await page.goto('/feed/alerts/alert-ice-storm');

    await expect(page.locator('[data-og7="alert-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-og7="alert-detail-header"]')).toBeVisible();
    await expect(page.locator('[data-og7="alert-detail-body"]')).toBeVisible();
    await expect(page.locator('[data-og7="alert-context-aside"]')).toBeVisible();

    await page.locator('[data-og7-id="alert-subscribe"]').click();
    await page.locator('[data-og7-id="alert-report-update"]').click();
    await page.locator('[data-og7-id="alert-share"]').click();

    await page.locator('[data-og7="alert-related-opportunities"] ul li button').first().click();
    await expect(page).toHaveURL(/\/feed\/opportunities\/opportunity-300mw/);
  });
});
