import { pathToFileURL } from 'node:url';

import { checkBucketConsistency } from './validate-admin-quality-matrix.mjs';

/** Withdraw contradictory coverage claims without promoting any business or proof status. */
export function planClassificationRepairs(entries) {
  return entries.flatMap((entry) => {
    const reasons = checkBucketConsistency(entry);
    if (!reasons.length) return [];
    return [{
      id: entry.id,
      reasons,
      previous: { managementBucket: entry.managementBucket, summaryStatus: entry.summaryStatus },
      patch: {
        managementBucket: 'not-evaluated',
        ...(entry.summaryStatus === 'oui' ? { summaryStatus: 'non' } : {}),
      },
    }];
  });
}

export async function repairClassifications({ baseUrl, token, apply = false }) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const response = await fetch(`${baseUrl}/api/admin/quality/matrix/export`, { headers });
  if (!response.ok) throw new Error(`Matrix export failed: HTTP ${response.status}`);
  const snapshot = (await response.json()).data;
  if (!Array.isArray(snapshot?.entries)) throw new Error('Invalid matrix export response.');
  const repairs = planClassificationRepairs(snapshot.entries);
  if (apply) {
    for (const repair of repairs) {
      const result = await fetch(`${baseUrl}/api/admin/quality/matrix/entries/${encodeURIComponent(repair.id)}`, {
        method: 'PATCH', headers, body: JSON.stringify(repair.patch),
      });
      if (!result.ok) throw new Error(`Repair failed for ${repair.id}: HTTP ${result.status}`);
    }
  }
  return { applied: apply, repairs };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const baseUrl = (urlIndex >= 0 ? args[urlIndex + 1] : process.env.STRAPI_URL) ?? 'http://localhost:1337';
  const token = process.env.STRAPI_OWNER_JWT ?? process.env.STRAPI_EXPORT_TOKEN;
  if (!token) throw new Error('Configure STRAPI_OWNER_JWT or STRAPI_EXPORT_TOKEN before reviewing the repair plan.');
  const result = await repairClassifications({ baseUrl, token, apply: args.includes('--apply') });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
