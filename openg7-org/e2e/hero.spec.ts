import './setup';
import { test, expect } from '@playwright/test';

test('hero section and actions render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-og7="hero"]')).toBeVisible();
  await expect(page.locator('[data-og7="hero-copy"]')).toBeVisible();
  await expect(page.locator('[data-og7="hero-ctas"]')).toBeVisible();
  const action = (id: string) => page.locator(`[data-og7="action"][data-og7-id="${id}"]`);
  await expect(action('view-sectors')).toBeVisible();
  await expect(action('pro-mode')).toBeVisible();
  await expect(action('register-company')).toBeVisible();
  await expect(action('preview')).toBeVisible();
});
