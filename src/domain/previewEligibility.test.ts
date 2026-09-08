import { checkPreviewEligibility, PREVIEW_MONTHLY_ALLOWANCE } from './previewEligibility';

describe('checkPreviewEligibility', () => {
  it('blocks a non-premium user before anything else', () => {
    expect(checkPreviewEligibility({ isPremium: false, isLive: true, usedThisMonth: 0 })).toEqual({
      allowed: false,
      reason: 'not_premium',
    });
  });

  it('blocks when generation is not live yet, even for a premium user with quota remaining', () => {
    expect(checkPreviewEligibility({ isPremium: true, isLive: false, usedThisMonth: 0 })).toEqual({
      allowed: false,
      reason: 'not_live',
    });
  });

  it('blocks once the monthly allowance is used up', () => {
    expect(
      checkPreviewEligibility({ isPremium: true, isLive: true, usedThisMonth: PREVIEW_MONTHLY_ALLOWANCE }),
    ).toEqual({ allowed: false, reason: 'quota_exceeded' });
  });

  it('allows a premium user, live generation, with quota remaining', () => {
    expect(
      checkPreviewEligibility({ isPremium: true, isLive: true, usedThisMonth: PREVIEW_MONTHLY_ALLOWANCE - 1 }),
    ).toEqual({ allowed: true });
  });

  it('does not consume quota for a failed generation — used count stays the caller\'s responsibility, not this function\'s', () => {
    // This function only reflects usedThisMonth as given; it never
    // increments it. The invariant "failed generations don't consume
    // quota" is enforced by the database (only a successful generation
    // ever inserts a preview_generations row — see the migration), not by
    // this pure check re-counting anything.
    expect(checkPreviewEligibility({ isPremium: true, isLive: true, usedThisMonth: 0 })).toEqual({
      allowed: true,
    });
  });
});
