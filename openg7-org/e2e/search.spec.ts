import './setup';
import { test, expect } from '@playwright/test';

test.describe('Quick search modal', () => {
  test('opens with Ctrl+K shortcut', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-og7="site-header"]')).toBeVisible();
    await page.keyboard.press('Control+K');
    const modal = page.locator('#quick-search-modal');
    await expect(modal).toBeVisible();
    const heading = modal.getByRole('heading', { name: /Quick search|Recherche rapide/ });
    await expect(heading).toBeVisible();
    const combobox = page.getByRole('combobox');
    await expect(combobox).toBeFocused();
  });
});
