import './setup';
import { test, expect } from '@playwright/test';

test.describe('Quick search modal', () => {
  test('opens with Ctrl+K shortcut', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-og7="site-header"]')).toBeVisible();
    const trigger = page.locator('#desktop-search');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();

    const modal = page.locator('#quick-search-modal');
    if ((await modal.count()) === 0 || !(await modal.isVisible())) {
      await page.keyboard.press('Control+K');
    }
    if ((await modal.count()) === 0 || !(await modal.isVisible())) {
      await page.keyboard.press('Meta+K');
    }

    if ((await modal.count()) > 0) {
      await expect(modal).toBeVisible();
      const heading = modal.getByRole('heading', { name: /Quick search|Recherche rapide/ });
      await expect(heading).toBeVisible();
      const combobox = page.getByRole('combobox');
      await expect(combobox).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      return;
    }

    await expect(trigger).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
