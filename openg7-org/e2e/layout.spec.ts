import './setup';
import { test, expect } from '@playwright/test';

test('global layout renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-og7="app"]')).toBeVisible();
  const header = page.locator('og7-site-header');
  await expect(header).toBeVisible();
  await expect(header.locator('[data-og7="search-box"]')).toBeVisible();
  await expect(header.getByRole('button', { name: 'FR' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'EN' })).toBeVisible();
});
