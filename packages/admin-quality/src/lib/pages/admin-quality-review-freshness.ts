/** Reviews expire after seven full days, or when later product work needs verification. */
export const ADMIN_QUALITY_REVIEW_MAX_AGE_MS = 7 * 86_400_000;

export function hasExpiredQualityReview(reviewedAt: string, now: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) return true;
  const deadline = Date.parse(`${reviewedAt}T23:59:59.999Z`);
  if (!Number.isFinite(deadline) || new Date(deadline).toISOString().slice(0, 10) !== reviewedAt) {
    return true;
  }
  const start = Date.parse(`${reviewedAt}T00:00:00.000Z`);
  return start > now || now - deadline > ADMIN_QUALITY_REVIEW_MAX_AGE_MS;
}
