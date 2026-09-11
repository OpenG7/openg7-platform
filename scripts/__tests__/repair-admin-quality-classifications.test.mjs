import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planClassificationRepairs } from '../repair-admin-quality-classifications.mjs';
import { checkBucketConsistency } from '../validate-admin-quality-matrix.mjs';

test('repair withdraws inconsistent claims without inventing verified evidence or a review date', () => {
  const entries = [
    { id: 'contradictory', managementBucket: 'covered', summaryStatus: 'partiel', e2eStatus: 'oui', reviewedAt: '2026-04-07' },
    { id: 'unproven', managementBucket: 'covered', summaryStatus: 'oui', e2eStatus: 'non' },
    { id: 'valid', managementBucket: 'covered', summaryStatus: 'oui', e2eStatus: 'oui' },
  ];
  const repairs = planClassificationRepairs(entries);
  assert.deepEqual(repairs.map((repair) => repair.id), ['contradictory', 'unproven']);
  for (const repair of repairs) {
    assert.equal(repair.patch.managementBucket, 'not-evaluated');
    assert.equal(repair.patch.e2eStatus, undefined);
    assert.equal(repair.patch.reviewedAt, undefined);
    assert.notEqual(repair.patch.summaryStatus, 'oui');
    const repaired = { ...entries.find((entry) => entry.id === repair.id), ...repair.patch };
    assert.deepEqual(checkBucketConsistency(repaired), []);
    assert.deepEqual(planClassificationRepairs([repaired]), []);
  }
  assert.equal(entries[0].managementBucket, 'covered');
});
