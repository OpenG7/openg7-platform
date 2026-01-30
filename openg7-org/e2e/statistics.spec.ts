import './setup';
import { expect, test } from '@playwright/test';

const unique = (values: readonly (string | null)[]) => Array.from(new Set(values.filter((v): v is string => Boolean(v))));

test('statistics filters update the dataset', async ({ page }) => {
  await page.goto('/statistics');

  const summaryCards = page.locator('[data-og7="statistics-summary-card"]');
  await expect(summaryCards.first()).toBeVisible();

  // Switch scope to international to ensure we hit the API/observable flow.
  await page.locator('[data-og7="statistics-scope-toggle"] button').nth(1).click();
  await expect(summaryCards.first()).toBeVisible();

  // Apply intrant filter.
  await page.locator('[data-og7="statistics-intrant-filter"][data-og7-value="energy"]').click();
  await expect(summaryCards.first()).toBeVisible();

  const intrants = await summaryCards.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-og7-intrant'))
  );
  expect(unique(intrants)).toEqual(['energy']);

  // Select a specific period if available.
  const periodSelect = page.locator('[data-og7="statistics-period-filter"] select');
  const periodOptions = periodSelect.locator('option');
  const periodValue = await periodOptions.nth(1).getAttribute('value');
  if (periodValue) {
    await periodSelect.selectOption(periodValue);
    const periods = await summaryCards.evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-og7-period'))
    );
    expect(unique(periods)).toEqual([periodValue]);
  }

  // Select a province and confirm all cards match.
  const provinceSelect = page.locator('[data-og7="statistics-province-filter"] select');
  const provinceOptions = provinceSelect.locator('option');
  const provinceValue = await provinceOptions.nth(1).getAttribute('value');
  if (provinceValue) {
    await provinceSelect.selectOption(provinceValue);
    const provinces = await summaryCards.evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-og7-province'))
    );
    expect(unique(provinces)).toEqual([provinceValue]);
  }
});
