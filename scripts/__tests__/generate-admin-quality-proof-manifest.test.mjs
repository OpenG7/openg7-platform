import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const generatorPath = path.resolve(
  import.meta.dirname,
  '../../packages/tooling/bin/generate-admin-quality-proof-manifest.mjs',
);

function generateManifest(t, args = [], env = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), 'og7-proof-manifest-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const output = path.join(directory, 'manifest.json');
  const impact = path.join(directory, 'impact.json');
  writeFileSync(impact, JSON.stringify({ entryIds: ['beta', 'alpha', 'alpha'] }));
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('GITHUB_') && !key.startsWith('MATRIX_'),
    ),
  );
  const result = spawnSync(
    process.execPath,
    [generatorPath, '--impact', impact, '--output', output, ...args],
    { encoding: 'utf8', env: { ...cleanEnv, ...env } },
  );
  return {
    ...result,
    manifest: existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')) : null,
  };
}

test('a manifest without executed checks does not claim success or an uploaded artifact', (t) => {
  const result = generateManifest(t, [], {
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_REPOSITORY: 'openg7/example',
    GITHUB_RUN_ID: '123',
    GITHUB_WORKFLOW: 'Quality validation',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.manifest.status, 'unknown');
  assert.deepEqual(result.manifest.checks, []);
  assert.deepEqual(result.manifest.specs, []);
  assert.equal(result.manifest.artifactUrl, null);
  assert.equal(
    result.manifest.workflowRunUrl,
    'https://github.com/openg7/example/actions/runs/123',
  );
});

test('successful manifests preserve declared checks, specs, commit and available artifact URL', (t) => {
  const command = 'node --test scripts/__tests__/resolve-admin-quality-matrix-impact.test.mjs';
  const spec = 'scripts/__tests__/resolve-admin-quality-matrix-impact.test.mjs';
  const artifactUrl = 'https://github.com/openg7/example/actions/runs/123/artifacts/456';
  const result = generateManifest(
    t,
    ['--status', 'success', '--check', command, '--spec', spec, '--artifact-url', artifactUrl],
    {
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'openg7/example',
      GITHUB_RUN_ID: '123',
      GITHUB_WORKFLOW: 'Quality validation',
      GITHUB_SHA: 'abc123def456',
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.manifest.status, 'success');
  assert.deepEqual(result.manifest.entryIds, ['alpha', 'beta']);
  assert.deepEqual(result.manifest.checks, [command]);
  assert.deepEqual(result.manifest.specs, [spec]);
  assert.equal(result.manifest.commitSha, 'abc123def456');
  assert.equal(result.manifest.workflowRunId, '123');
  assert.equal(
    result.manifest.workflowRunUrl,
    'https://github.com/openg7/example/actions/runs/123',
  );
  assert.equal(result.manifest.artifactUrl, artifactUrl);
});

test('success without checks fails without writing a proof file', (t) => {
  const result = generateManifest(t, ['--status', 'success', '--commit-sha', 'abc123']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires explicit executed checks and a commit SHA/);
  assert.equal(result.manifest, null);
});

test('success without a commit fails without writing a proof file', (t) => {
  const result = generateManifest(t, ['--status', 'success', '--check', 'yarn lint']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires explicit executed checks and a commit SHA/);
  assert.equal(result.manifest, null);
});

test('a failed validation remains failed in its manifest', (t) => {
  const result = generateManifest(t, ['--status', 'failure', '--check', 'yarn lint']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.manifest.status, 'failure');
  assert.deepEqual(result.manifest.checks, ['yarn lint']);
  assert.equal(result.manifest.artifactUrl, null);
});
