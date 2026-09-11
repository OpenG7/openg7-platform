import './setup';
import { expect, test, type Page } from '@playwright/test';

import { seedAuthenticatedSession } from './helpers/auth-session';
import {
  DEFAULT_PROFILE,
  mockAdminOpsApis,
  mockProfileAndFavoritesApis,
} from './helpers/domain-mocks';

const NOW = '2026-09-08T12:00:00.000Z';
const ADMIN_PROFILE = { ...DEFAULT_PROFILE, email: 'contact@openg7.test', roles: ['admin'] };
const REACTOR = '[data-og7="admin-quality-reactor"]';
const COVERAGE = '[data-og7-id="admin-quality-reactor-coverage"]';

type Bucket = 'covered' | 'proof-gap' | 'product-gap' | 'scope-limit';

function entry(id: string, bucket: Bucket, overrides: Record<string, unknown> = {}) {
  return {
    id,
    domain: `Domaine ${id}`,
    need: 'Conserver une évaluation traçable du parcours.',
    summaryStatus: bucket === 'covered' ? 'oui' : 'partiel',
    businessStatus: 'oui',
    implementationStatus: bucket === 'product-gap' ? 'partiel' : 'oui',
    e2eStatus: bucket === 'covered' ? 'oui' : 'partiel',
    priority: bucket === 'proof-gap' || bucket === 'product-gap' ? 'haute' : 'moyenne',
    managementBucket: bucket,
    needsProductWorkFirst: bucket === 'product-gap',
    observedGap: bucket === 'covered' ? 'Parcours vérifié.' : 'Une lacune reste à traiter.',
    nextMove: 'Revoir le parcours et conserver sa preuve.',
    evidence: ['e2e/admin-quality-reactor.spec.ts'],
    reviewedAt: '2026-09-07',
    repoSignalAt: null,
    signalDispatch: {},
    ...overrides,
  };
}

const AUDIT_ENTRIES = [
  ...Array.from({ length: 9 }, (_, index) => entry(`covered-${index}`, 'covered')),
  entry('proof-gap', 'proof-gap'),
  ...Array.from({ length: 4 }, (_, index) => entry(`product-gap-${index}`, 'product-gap')),
  // This editorial flag previously counted the same domain in two categories.
  entry('linkup-workflow', 'scope-limit', { needsProductWorkFirst: true }),
];

function matrix(entries: ReturnType<typeof entry>[]) {
  return { data: { generatedAt: NOW, sourceStatus: 'fresh', sourceMessage: null, entries } };
}

function gate() {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release };
}

async function mockPage(page: Page, entries: ReturnType<typeof entry>[]) {
  await page.clock.setFixedTime(new Date(NOW));
  await mockProfileAndFavoritesApis(page, ADMIN_PROFILE);
  await mockAdminOpsApis(page);
  await page.route('**/api/admin/ops/ai/proofs', (route) =>
    route.fulfill({ json: { data: { generatedAt: NOW, providers: [] } } }),
  );
  await page.route('**/api/admin/quality/mission-decisions**', (route) =>
    route.fulfill({ json: { data: { generatedAt: NOW, decisions: [] } } }),
  );
  await page.route(/\/api\/admin\/quality\/matrix(?:\?.*)?$/, (route) =>
    route.fulfill({ json: matrix(entries) }),
  );
}

async function openPage(page: Page, locale: 'fr' | 'en' = 'fr') {
  await seedAuthenticatedSession(page, ADMIN_PROFILE);
  await page.goto('/admin/quality');
  await expect(page).toHaveURL(/\/admin\/quality$/);
  await expect(page.locator(REACTOR)).toBeVisible();
  if (locale === 'en') {
    await page.locator('[data-og7="lang"] > button').click();
    await page.getByRole('option', { name: 'English', exact: true }).click();
    await expect(page.locator('#admin-quality-reactor-title')).toHaveText('Quality Reactor');
  }
}

test.describe('Quality reactor reliability', () => {
  test('counts the 15 audit domains once and opens the five priority gaps by keyboard', async ({
    page,
  }, testInfo) => {
    await mockPage(page, AUDIT_ENTRIES);
    await openPage(page);

    const reactor = page.locator(REACTOR);
    await expect(reactor.locator(COVERAGE)).toHaveText('60 %');
    for (const [key, count] of [
      ['covered', 9],
      ['proof-gap', 1],
      ['product-gap', 4],
      ['not-aligned', 1],
      ['not-evaluated', 0],
    ] as const) {
      await expect(reactor.locator(`[data-og7-id="${key}"]`)).toContainText(`${count} élément(s)`);
    }
    await expect(reactor).toHaveAttribute('data-reactor-state', 'critical');
    await expect(reactor).toContainText('Indisponible');
    await testInfo.attach('reactor-mixed-desktop-fr', {
      body: await reactor.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    });

    const action = reactor.locator('[data-og7-id="admin-quality-reactor-view-gaps"]');
    await action.focus();
    await expect(action).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-og7-id="admin-quality-filter-count"]')).toContainText(
      '5 domaines visibles sur 15',
    );
    await expect(
      page.locator('[data-og7="admin-quality-scroll-section"][data-og7-id="coverage"]'),
    ).toBeFocused();
    // Filtering the work list must not change the overall matrix denominator.
    await expect(reactor.locator(COVERAGE)).toHaveText('60 %');
  });

  for (const locale of ['fr', 'en'] as const) {
    test(`keeps an unknown classification readable on mobile in ${locale} with reduced motion`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockPage(page, [
        entry('covered', 'covered'),
        entry('unknown', 'proof-gap', { managementBucket: null, priority: 'moyenne' }),
      ]);
      await openPage(page, locale);
      await page.setViewportSize({ width: 390, height: 844 });

      const reactor = page.locator(REACTOR);
      await expect(reactor.locator(COVERAGE)).toHaveText('50 %');
      await expect(reactor.locator('[data-og7-id="admin-quality-reactor-completude"]')).toHaveText(
        '50 %',
      );
      const unknown = reactor.locator('[data-og7-id="not-evaluated"]');
      await expect(unknown).toContainText(locale === 'fr' ? 'Non évalués' : 'Not evaluated');
      await expect(unknown).toContainText(locale === 'fr' ? '1 élément(s)' : '1 item(s)');
      await expect(unknown).toHaveCSS('opacity', '1');
      await expect(reactor.getByRole('status')).toContainText(
        locale === 'fr' ? '1 domaine(s) non évalué(s)' : '1 domain(s) have not been assessed',
      );
      await expect(reactor.getByRole('status')).toHaveAttribute('aria-live', 'polite');
      expect(
        await reactor.evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .some((animation) => animation.playState === 'running'),
        ),
      ).toBe(false);
      expect(await reactor.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      await testInfo.attach(`reactor-unknown-mobile-${locale}`, {
        body: await reactor.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
    });
  }

  test('allows excellent only for current reviews and marks covered domains with expired reviews or newer repo signals', async ({
    page,
  }, testInfo) => {
    await mockPage(page, [entry('covered', 'covered')]);
    await openPage(page);
    const reactor = page.locator(REACTOR);
    await expect(reactor).toHaveAttribute('data-reactor-state', 'excellent');
    await expect(reactor.locator(COVERAGE)).toHaveText('100 %');
    await expect(reactor).toContainText('Indisponible');

    await page.route(/\/api\/admin\/quality\/matrix(?:\?.*)?$/, (route) =>
      route.fulfill({
        json: matrix([
          entry('expired', 'covered', { reviewedAt: '2026-07-01' }),
          entry('changed', 'covered', { repoSignalAt: '2026-09-08T10:00:00.000Z' }),
        ]),
      }),
    );
    await page.reload();
    await expect(reactor).toHaveAttribute('data-reactor-state', 'attention');
    await expect(reactor.locator(COVERAGE)).toHaveText('100 %');
    await expect(reactor.getByRole('status')).toContainText('2 domaine(s) à revalider');
    await expect(reactor).toContainText('À confirmer');
    await testInfo.attach('reactor-covered-review-required', {
      body: await reactor.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    });
  });

  test('announces recalculation and a failed refresh while retaining critical state and the last figures', async ({
    page,
  }) => {
    await mockPage(page, AUDIT_ENTRIES);
    const recalculation = gate();
    const refresh = gate();
    await page.route('**/api/admin/quality/matrix/recalculate', async (route) => {
      await recalculation.pending;
      await route.fulfill({
        json: {
          data: {
            generatedAt: NOW,
            scope: 'refresh-required',
            summary: { analyzedCount: 15, proposalCount: 0, unchangedCount: 15, blockedCount: 0 },
            entries: [],
          },
        },
      });
    });
    await openPage(page);
    const reactor = page.locator(REACTOR);
    await expect(reactor.locator(COVERAGE)).toHaveText('60 %');
    await page.route(/\/api\/admin\/quality\/matrix(?:\?.*)?$/, async (route) => {
      await refresh.pending;
      await route.fulfill({ status: 500, json: { error: { message: 'Refresh unavailable' } } });
    });

    try {
      await page.locator('[data-og7-id="admin-quality-recalculate-matrix"]').click();
      await expect(reactor.getByRole('status')).toContainText('Recalcul de la matrice en cours');
      await expect(reactor).toHaveAttribute('data-reactor-state', 'critical');
      await expect(reactor.locator(COVERAGE)).toHaveText('60 %');
      recalculation.release();
      await expect(reactor.getByRole('status')).toContainText(
        'Actualisation de la matrice en cours',
      );
      refresh.release();
      await expect(reactor.getByRole('status')).toContainText('L’actualisation a échoué');
      await expect(reactor.getByRole('status')).toContainText(
        'Les derniers chiffres connus sont conservés',
      );
      await expect(reactor.locator(COVERAGE)).toHaveText('60 %');
      await expect(reactor).toHaveAttribute('data-reactor-state', 'critical');
    } finally {
      recalculation.release();
      refresh.release();
    }
  });

  test('distinguishes first loading from an empty matrix without presenting zero as measured coverage', async ({
    page,
  }) => {
    await mockPage(page, []);
    const initialLoad = gate();
    await page.route(/\/api\/admin\/quality\/matrix(?:\?.*)?$/, async (route) => {
      await initialLoad.pending;
      await route.fulfill({ json: matrix([]) });
    });
    try {
      await openPage(page);
      const reactor = page.locator(REACTOR);
      await expect(reactor.getByRole('status')).toContainText('Chargement de la matrice');
      await expect(reactor.locator(COVERAGE)).toHaveText('—');
      initialLoad.release();
      await expect(reactor.getByRole('status')).toContainText('Aucun domaine disponible');
      await expect(reactor.locator(COVERAGE)).toHaveText('—');
      await expect(reactor).toContainText('Sans données');
      await expect(reactor).toContainText('À confirmer');
    } finally {
      initialLoad.release();
    }
  });
});
