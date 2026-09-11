import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { buildImpactMapFromMatrix } from '../admin-quality-matrix-model.mjs';
import { resolveImpactWithMap } from '../resolve-admin-quality-matrix-impact.mjs';

const FIXTURE_DIR = path.join(import.meta.dirname, 'fixtures');

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

// Build a reusable context from the minimal fixture matrix so every test
// operates on known, stable data instead of the real matrix.
function buildContext(snapshot) {
  const impactMap = buildImpactMapFromMatrix(snapshot);
  return {
    allEntryIds: (snapshot.entries ?? []).map((e) => e.id),
    impactRules: impactMap.rules,
    globalPrefixes: impactMap.globalPrefixes,
  };
}

const snapshot = loadFixture('matrix-minimal.json');
const ctx = buildContext(snapshot);

// ─── targeted: path-prefix match ────────────────────────────────────────────

test('targeted — matches single entry via path-prefix', () => {
  const result = resolveImpactWithMap(['packages/alpha/src/widget.ts'], ctx);
  assert.equal(result.mode, 'targeted');
  assert.deepEqual(result.entryIds, ['test-entry-alpha']);
  assert.ok(result.impactMapping['test-entry-alpha']?.includes('packages/alpha/src/widget.ts'));
});

test('targeted — matches multiple entries when files span both prefixes', () => {
  const result = resolveImpactWithMap(['packages/alpha/src/a.ts', 'packages/beta/src/b.ts'], ctx);
  assert.equal(result.mode, 'targeted');
  assert.ok(result.entryIds.includes('test-entry-alpha'));
  assert.ok(result.entryIds.includes('test-entry-beta'));
  assert.equal(result.entryIds.length, 2);
});

test('targeted — matches entry beta via second prefix', () => {
  const result = resolveImpactWithMap(['openg7-org/src/beta/component.ts'], ctx);
  assert.equal(result.mode, 'targeted');
  assert.deepEqual(result.entryIds, ['test-entry-beta']);
});

test('targeted — exact prefix path matches (no trailing slash required)', () => {
  const result = resolveImpactWithMap(['packages/alpha/'], ctx);
  assert.equal(result.mode, 'targeted');
  assert.deepEqual(result.entryIds, ['test-entry-alpha']);
});

test('targeted — deduplicates entry IDs when multiple files hit same entry', () => {
  const result = resolveImpactWithMap(['packages/alpha/src/a.ts', 'packages/alpha/src/b.ts'], ctx);
  assert.deepEqual(result.entryIds, ['test-entry-alpha']);
  assert.equal(result.impactMapping['test-entry-alpha'].length, 2);
});

test('targeted — entryIds are sorted', () => {
  const result = resolveImpactWithMap(['packages/beta/x.ts', 'packages/alpha/y.ts'], ctx);
  assert.deepEqual(result.entryIds, ['test-entry-alpha', 'test-entry-beta']);
});

// ─── targeted: no match ─────────────────────────────────────────────────────

test('none — unrelated file, no product code', () => {
  const result = resolveImpactWithMap(['docs/README.md'], ctx);
  assert.equal(result.mode, 'none');
  assert.deepEqual(result.entryIds, []);
  assert.equal(result.reason, 'No matrix-impacting file detected.');
});

test('none — empty file list', () => {
  const result = resolveImpactWithMap([], ctx);
  assert.equal(result.mode, 'none');
  assert.deepEqual(result.entryIds, []);
  assert.equal(result.reason, 'No changed file provided.');
});

// ─── global: globalPrefixes trigger ─────────────────────────────────────────

test('global — file matching globalPrefix triggers global mode', () => {
  const result = resolveImpactWithMap(['shared/contracts/types.ts'], ctx);
  assert.equal(result.mode, 'global');
  assert.equal(result.reason, 'Global matrix infrastructure changed.');
  assert.deepEqual(result.entryIds, ctx.allEntryIds);
  assert.ok(Array.isArray(result.impactMapping['*']));
  assert.ok(result.impactMapping['*'].includes('shared/contracts/types.ts'));
});

test('global — second globalPrefix also triggers', () => {
  const result = resolveImpactWithMap(['contracts/schema.ts'], ctx);
  assert.equal(result.mode, 'global');
  assert.deepEqual(result.entryIds, ctx.allEntryIds);
});

test('global — takes precedence even when a targeted prefix also matches', () => {
  const result = resolveImpactWithMap(['shared/lib/util.ts', 'packages/alpha/src/x.ts'], ctx);
  assert.equal(result.mode, 'global');
  assert.deepEqual(result.entryIds, ctx.allEntryIds);
});

// ─── global: product code without targeted match ─────────────────────────────

test('global — openg7-org/src/ file with no targeted match triggers global', () => {
  const result = resolveImpactWithMap(['openg7-org/src/app/app.config.ts'], ctx);
  assert.equal(result.mode, 'global');
  assert.equal(result.reason, 'Product code changed without a specific impact mapping.');
  assert.deepEqual(result.entryIds, ctx.allEntryIds);
});

test('global — strapi/src/ file with no targeted match triggers global', () => {
  const result = resolveImpactWithMap(['strapi/src/extensions/config.ts'], ctx);
  assert.equal(result.mode, 'global');
  assert.equal(result.reason, 'Product code changed without a specific impact mapping.');
});

test('global — an unmapped product file is not hidden by a mapped file', () => {
  const result = resolveImpactWithMap(
    ['openg7-org/src/beta/component.ts', 'openg7-org/src/app/unmapped.ts'],
    ctx,
  );
  assert.equal(result.mode, 'global');
  assert.deepEqual(result.entryIds, ctx.allEntryIds);
});

test('global — package code falls back even without an explicit global rule', () => {
  for (const file of [
    'packages/admin-quality/src/lib/pages/admin-quality-reactor.component.ts',
    'packages/admin-quality/src/lib/pages/admin-quality.page.ts',
    'packages/new-product/src/index.ts',
  ]) {
    const result = resolveImpactWithMap([file], ctx);
    assert.equal(result.mode, 'global', file);
    assert.equal(result.reason, 'Product code changed without a specific impact mapping.');
    assert.deepEqual(result.entryIds, ctx.allEntryIds);
  }
});

test('global — IDs are sorted and deduplicated like server ingestion', () => {
  const result = resolveImpactWithMap(['packages/unmapped/src/index.ts'], {
    ...ctx,
    allEntryIds: ['zeta', 'alpha', 'zeta'],
  });
  assert.deepEqual(result.entryIds, ['alpha', 'zeta']);
});

test('global — exported infrastructure rules cover the reactor and shared dependencies', () => {
  const source = JSON.parse(
    readFileSync(
      path.join(import.meta.dirname, '../../tools/admin-quality-matrix-global-rules.json'),
      'utf8',
    ),
  );
  const infrastructureContext = buildContext({ ...snapshot, ...source });
  for (const file of [
    'packages/admin-quality/src/lib/pages/admin-quality-reactor.component.ts',
    'packages/admin-quality/src/lib/pages/admin-quality.page.ts',
    'packages/contracts/src/index.ts',
    'packages/tooling/bin/generate-admin-quality-proof-manifest.mjs',
    'scripts/admin-quality-matrix-model.mjs',
    'scripts/export-admin-quality-matrix.mjs',
    'scripts/generate-admin-quality-impact-map.mjs',
    'scripts/repair-admin-quality-classifications.mjs',
    'scripts/resolve-admin-quality-matrix-impact.mjs',
    'scripts/validate-admin-quality-matrix.mjs',
    'openg7-org/src/app/domains/admin/data-access/admin-quality-matrix.service.ts',
    'tools/admin-quality-matrix-global-rules.json',
    'tools/admin-quality-matrix-impact-map.json',
  ]) {
    const result = resolveImpactWithMap([file], infrastructureContext);
    assert.equal(result.mode, 'global', file);
    assert.equal(result.reason, 'Global matrix infrastructure changed.', file);
  }
});

test('no global fallback — openg7-org/src/ file that also matches a targeted prefix stays targeted', () => {
  // openg7-org/src/beta/ is in test-entry-beta impactRules, so it's targeted, not global
  const result = resolveImpactWithMap(['openg7-org/src/beta/component.ts'], ctx);
  assert.equal(result.mode, 'targeted');
  assert.deepEqual(result.entryIds, ['test-entry-beta']);
});

// ─── context with no rules ───────────────────────────────────────────────────

test('empty context — product code requests global refresh with no known entries', () => {
  const emptyCtx = { allEntryIds: [], impactRules: [], globalPrefixes: [] };
  const result = resolveImpactWithMap(['openg7-org/src/anything.ts'], emptyCtx);
  assert.equal(result.mode, 'global');
  assert.deepEqual(result.entryIds, []);
});
