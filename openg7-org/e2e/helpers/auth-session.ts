import { expect, type Locator, type Page } from '@playwright/test';

export interface E2eAuthProfile {
  id: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  notificationPreferences: {
    emailOptIn: boolean;
    webhookUrl: string | null;
  };
}

const DEFAULT_PROFILE: E2eAuthProfile = {
  id: 'e2e-user-1',
  email: 'e2e.user@openg7.test',
  roles: ['editor'],
  firstName: 'E2E',
  lastName: 'User',
  notificationPreferences: {
    emailOptIn: false,
    webhookUrl: null,
  },
};

export async function mockAuthenticatedSessionApis(
  page: Page,
  profile: E2eAuthProfile = DEFAULT_PROFILE
): Promise<void> {
  await page.route('**/api/sectors**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/provinces**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/companies**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.route('**/api/auth/local**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        jwt: 'header.payload.signature',
        user: profile,
      }),
    });
  });

  await page.route('**/api/users/me**', async route => {
    const request = route.request();
    const method = request.method().toUpperCase();
    const url = new URL(request.url());
    const path = url.pathname.toLowerCase();

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }

    if (method === 'GET') {
      if (path.endsWith('/saved-searches') || path.includes('/saved-searches/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }

      if (path.endsWith('/favorites') || path.includes('/favorites/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }

      if (path.endsWith('/alerts') || path.includes('/alerts/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }

      if (path.endsWith('/sessions') || path.includes('/sessions/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            current: null,
            others: [],
            revoked: [],
          }),
        });
        return;
      }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(profile),
    });
  });
}

export async function loginAsAuthenticatedE2eUser(
  page: Page,
  redirect = '/profile'
): Promise<void> {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  const loginForm = page.locator('form[data-og7="auth-login"]');
  await expect(loginForm).toBeVisible();
  const emailField = loginForm.locator('#auth-login-email');
  const passwordField = loginForm.locator('#auth-login-password');
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();
  await expect(emailField).toBeEditable();
  await expect(passwordField).toBeEditable();

  await fillInputStable(emailField, 'e2e.user@openg7.test');
  await fillInputStable(passwordField, 'StrongPass123!');

  const submitButton = loginForm.locator('[data-og7="auth-login-submit"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/, { timeout: 15000 });
}

async function fillInputStable(locator: Locator, value: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.click();
    await locator.fill(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 1000 });
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
    }
  }
}
