import './setup';
import { test, expect } from '@playwright/test';

test('map components render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-og7="trade-map"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-legend"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-kpi-badges"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-sector-chips"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-basemap-toggle"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-zoom-control"]')).toBeVisible();
  const layer = (id: string) => page.locator(`[data-og7="map-layer"][data-og7-layer="${id}"]`);
  await expect(layer('flows')).toBeVisible();
  await expect(layer('markers')).toBeVisible();
  await expect(layer('highlight')).toBeVisible();
  await expect(page.locator('[data-og7="map-tooltip"]')).toBeVisible();
  await expect(page.locator('[data-og7="map-aria-live"]')).toBeVisible();
});
