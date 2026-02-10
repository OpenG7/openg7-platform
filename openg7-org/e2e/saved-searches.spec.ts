import './setup';
import { expect, test } from '@playwright/test';

interface SavedSearchRecord {
  id: string;
  name: string;
  scope: 'all' | 'companies' | 'partners' | 'feed' | 'map' | 'opportunities';
  filters: Record<string, unknown>;
  notifyEnabled: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

test.describe('Saved searches page', () => {
  test('creates then deletes a saved search', async ({ page }) => {
    const savedSearches: SavedSearchRecord[] = [];

    await page.route('**/api/auth/local', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwt: 'header.payload.signature',
          user: {
            id: 'e2e-user-1',
            email: 'e2e.user@openg7.test',
            roles: ['editor'],
            firstName: 'E2E',
            lastName: 'User',
          },
        }),
      });
    });

    await page.route('**/api/users/me/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'e2e-user-1',
          email: 'e2e.user@openg7.test',
          roles: ['editor'],
          firstName: 'E2E',
          lastName: 'User',
          notificationPreferences: {
            emailOptIn: false,
            webhookUrl: null,
          },
        }),
      });
    });

    await page.route('**/api/users/me/saved-searches**', async (route) => {
      const request = route.request();
      const method = request.method().toUpperCase();
      const url = new URL(request.url());
      const idMatch = url.pathname.match(/\/saved-searches\/([^/]+)\/?$/i);
      const resourceId = idMatch ? decodeURIComponent(idMatch[1]) : null;
      const now = new Date().toISOString();

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204 });
        return;
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedSearches),
        });
        return;
      }

      if (method === 'POST') {
        const payload = (request.postDataJSON?.() ?? {}) as Partial<SavedSearchRecord>;
        const created: SavedSearchRecord = {
          id: `saved-${savedSearches.length + 1}`,
          name: String(payload.name ?? 'Saved search'),
          scope: (payload.scope as SavedSearchRecord['scope']) ?? 'all',
          filters:
            payload.filters && typeof payload.filters === 'object' && !Array.isArray(payload.filters)
              ? payload.filters
              : {},
          notifyEnabled: Boolean(payload.notifyEnabled),
          frequency: (payload.frequency as SavedSearchRecord['frequency']) ?? 'daily',
          lastRunAt: null,
          createdAt: now,
          updatedAt: now,
        };
        savedSearches.unshift(created);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }

      if (method === 'DELETE' && resourceId) {
        const index = savedSearches.findIndex((entry) => entry.id === resourceId);
        if (index >= 0) {
          savedSearches.splice(index, 1);
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: resourceId, deleted: true }),
        });
        return;
      }

      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unhandled saved-searches route' }),
      });
    });

    await page.goto('/login');

    await page.locator('#auth-login-email').fill('e2e.user@openg7.test');
    await page.locator('#auth-login-password').fill('StrongPass123!');
    await page.locator('[data-og7="auth-login-submit"]').click();

    await expect(page).toHaveURL(/\/profile$/);

    await page.locator('[data-og7="profile"] > button').click();
    await page.locator('[data-og7-id="saved-searches"]').first().click();
    await expect(page).toHaveURL(/\/saved-searches$/);
    await expect(page.locator('[data-og7="saved-searches"]')).toBeVisible();

    await page.locator('[data-og7-id="saved-search-name"]').fill('Import watch');
    await page.locator('[data-og7-id="saved-search-query"]').fill('lithium import');
    await page.locator('[data-og7-id="saved-search-create"]').click();

    const savedItem = page.locator('[data-og7="saved-search-item"]').first();
    await expect(savedItem).toContainText('Import watch');
    await expect(savedItem).toContainText('lithium import');

    await page.locator('[data-og7-id="saved-search-delete"]').first().click();
    await expect(page.locator('[data-og7-id="saved-search-empty"]')).toBeVisible();
  });
});
