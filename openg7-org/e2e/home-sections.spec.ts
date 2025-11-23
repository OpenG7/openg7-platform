import './setup';
import { expect, test } from '@playwright/test';

test.describe('Home sections', () => {
  test('renders hero, statistics, map and filters sections', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-og7="hero"]')).toBeVisible();
    await expect(page.locator('[data-og7="home-statistics"]')).toBeVisible();
    await expect(page.locator('[data-og7="home-map"]')).toBeVisible();
    await expect(page.locator('[data-og7="home-filters"]')).toBeVisible();
  });

  test('filters section exposes form controls', async ({ page }) => {
    await page.goto('/');

    const tradeModeSelect = page.locator('[data-og7="filters"] select[data-og7-id="trade-mode"]');
    await expect(tradeModeSelect).toBeVisible();
    await expect(tradeModeSelect).toHaveValue('all');

    const sectorOptions = page.locator('[data-og7="filters"] button[role="option"]');
    await expect(sectorOptions.first()).toBeVisible();
  });
});
