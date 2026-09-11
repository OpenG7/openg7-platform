import {
  ADMIN_QUALITY_REVIEW_MAX_AGE_MS,
  hasExpiredQualityReview,
} from '@openg7/admin-quality/lib/pages/admin-quality-review-freshness';

describe('Quality review freshness', () => {
  it('expires after seven complete days following the review day', () => {
    const deadline = Date.parse('2026-09-01T23:59:59.999Z');
    expect(hasExpiredQualityReview('2026-09-01', deadline + ADMIN_QUALITY_REVIEW_MAX_AGE_MS)).toBeFalse();
    expect(hasExpiredQualityReview('2026-09-01', deadline + ADMIN_QUALITY_REVIEW_MAX_AGE_MS + 1)).toBeTrue();
  });

  it('does not accept missing, invalid or future review dates as verified evidence', () => {
    const now = Date.parse('2026-09-08T12:00:00Z');
    for (const date of ['', '2026-02-30', 'invalid', '2026-09-09']) {
      expect(hasExpiredQualityReview(date, now)).withContext(date).toBeTrue();
    }
    expect(hasExpiredQualityReview('2026-09-08', now)).toBeFalse();
  });
});
