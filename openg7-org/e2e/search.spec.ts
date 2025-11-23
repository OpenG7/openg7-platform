import { test, expect } from '@playwright/test';

const BASE_URL = process.env['E2E_BASE_URL'] || 'http://127.0.0.1:4200/';

test.describe('Quick search modal', () => {
  test('opens with Ctrl+K shortcut', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.keyboard.press('Control+K');
    const heading = page.getByRole('heading', { name: /Quick search|Recherche rapide/ });
    await expect(heading).toBeVisible();
    const combobox = page.getByRole('combobox');
    await expect(combobox).toBeFocused();
  });
});
