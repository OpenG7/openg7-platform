import {
  AdminQualityMatrixEntry,
  normalizeAdminQualityMatrixBucket,
} from '../data-access/admin-quality-matrix.service';

export interface AdminQualityReactorCounts {
  readonly total: number;
  readonly covered: number;
  readonly proofGap: number;
  readonly productGap: number;
  readonly scopeLimit: number;
  readonly notEvaluated: number;
  readonly highPriorityGap: number;
}

export type AdminQualityReactorState = 'stable' | 'attention' | 'critical' | 'excellent';

export function countAdminQualityReactorCategories(
  entries: readonly Pick<AdminQualityMatrixEntry, 'managementBucket' | 'priority'>[],
): AdminQualityReactorCounts {
  const counts = {
    total: entries.length,
    covered: 0,
    proofGap: 0,
    productGap: 0,
    scopeLimit: 0,
    notEvaluated: 0,
    highPriorityGap: 0,
  };

  for (const entry of entries) {
    const bucket = normalizeAdminQualityMatrixBucket(entry.managementBucket);
    switch (bucket) {
      case 'covered':
        counts.covered += 1;
        break;
      case 'proof-gap':
        counts.proofGap += 1;
        break;
      case 'product-gap':
        counts.productGap += 1;
        break;
      case 'scope-limit':
        counts.scopeLimit += 1;
        break;
      case 'not-evaluated':
        counts.notEvaluated += 1;
        break;
    }
    if (bucket !== 'covered' && entry.priority === 'haute') {
      counts.highPriorityGap += 1;
    }
  }

  return counts;
}

export function resolveAdminQualityReactorState(
  counts: AdminQualityReactorCounts,
): AdminQualityReactorState {
  if (counts.total === 0) {
    return 'stable';
  }

  const unresolvedRatio = (counts.total - counts.covered) / counts.total;
  if (
    counts.highPriorityGap / counts.total >= 0.25 ||
    unresolvedRatio >= 0.5 ||
    counts.notEvaluated / counts.total >= 0.25
  ) {
    return 'critical';
  }
  if (counts.highPriorityGap > 0 || unresolvedRatio >= 0.2 || counts.notEvaluated > 0) {
    return 'attention';
  }
  return counts.covered === counts.total ? 'excellent' : 'stable';
}
