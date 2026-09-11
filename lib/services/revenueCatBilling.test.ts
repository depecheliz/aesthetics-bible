/**
 * Covers `revenueCatBilling.ts` with RevenueCat treated as configured (a
 * valid platform API key, not a closed-testing build) — the normal path.
 * See `revenueCatBilling.unconfigured.test.ts` and
 * `revenueCatBilling.closedTesting.test.ts` for the two distinct reasons
 * `isRevenueCatConfigured` can be false and what that does to every call
 * here. Split into separate files (rather than reloading the module per
 * test) because `isRevenueCatConfigured` is computed once from `env` at
 * module load — each test file gets its own fresh module registry, so a
 * single static `jest.mock('../env', ...)` per file is enough.
 */
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';

jest.mock('../env', () => ({
  env: {
    appEnv: 'development',
    supabaseUrl: '',
    supabaseAnonKey: '',
    revenueCatIosApiKey: 'test-ios-key',
    revenueCatAndroidApiKey: 'test-android-key',
    googlePlacesClientKey: '',
    analyticsWriteKey: '',
  },
}));

import {
  configureRevenueCat,
  fetchCurrentOffering,
  identifyRevenueCatUser,
  isRevenueCatConfigured,
  isUserCancelledPurchase,
  resetRevenueCatUser,
  revenueCatBilling,
} from './revenueCatBilling';

const mockPurchases = Purchases as unknown as {
  configure: jest.Mock;
  getOfferings: jest.Mock;
  getCustomerInfo: jest.Mock;
  purchasePackage: jest.Mock;
  restorePurchases: jest.Mock;
  logIn: jest.Mock;
  logOut: jest.Mock;
};

describe('revenueCatBilling (configured)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPurchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: {} } });
    mockPurchases.getOfferings.mockResolvedValue({ current: null });
    mockPurchases.restorePurchases.mockResolvedValue({ entitlements: { active: {} } });
  });

  it('is configured when a platform API key is set and the app is not in closed-testing', () => {
    expect(isRevenueCatConfigured).toBe(true);
  });

  describe('configureRevenueCat', () => {
    it('configures the SDK exactly once, even if called again', () => {
      configureRevenueCat();
      configureRevenueCat();
      expect(mockPurchases.configure).toHaveBeenCalledTimes(1);
    });
  });

  describe('identifyRevenueCatUser / resetRevenueCatUser (login/logout identity transitions)', () => {
    it('aliases the anonymous purchaser to the signed-in account via logIn', async () => {
      await identifyRevenueCatUser('supabase-user-123');
      expect(mockPurchases.logIn).toHaveBeenCalledWith('supabase-user-123');
    });

    it('logs the RevenueCat user out on sign-out so a shared device cannot leak entitlement', async () => {
      await resetRevenueCatUser();
      expect(mockPurchases.logOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEntitlement (premium entitlement parsing)', () => {
    it('resolves "premium" when the "premium" entitlement is active', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { premium: {} } } });
      await expect(revenueCatBilling.getEntitlement()).resolves.toBe('premium');
    });

    it('resolves "free" when no entitlement is active', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: {} } });
      await expect(revenueCatBilling.getEntitlement()).resolves.toBe('free');
    });

    it('resolves "free" when an unrelated entitlement is active but not "premium"', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValue({ entitlements: { active: { some_other_tier: {} } } });
      await expect(revenueCatBilling.getEntitlement()).resolves.toBe('free');
    });
  });

  describe('purchaseWeekly / purchaseAnnual (correct package purchased)', () => {
    it('purchases the weekly package from the current offering', async () => {
      const weeklyPkg = { identifier: 'weekly_pkg' };
      mockPurchases.getOfferings.mockResolvedValue({ current: { weekly: weeklyPkg, annual: null } });
      mockPurchases.purchasePackage.mockResolvedValue({
        customerInfo: { entitlements: { active: { premium: {} } } },
      });

      await expect(revenueCatBilling.purchaseWeekly()).resolves.toBe('premium');
      expect(mockPurchases.purchasePackage).toHaveBeenCalledWith(weeklyPkg);
    });

    it('purchases the annual package from the current offering, not the weekly one', async () => {
      const weeklyPkg = { identifier: 'weekly_pkg' };
      const annualPkg = { identifier: 'annual_pkg' };
      mockPurchases.getOfferings.mockResolvedValue({ current: { weekly: weeklyPkg, annual: annualPkg } });
      mockPurchases.purchasePackage.mockResolvedValue({
        customerInfo: { entitlements: { active: { premium: {} } } },
      });

      await expect(revenueCatBilling.purchaseAnnual()).resolves.toBe('premium');
      expect(mockPurchases.purchasePackage).toHaveBeenCalledWith(annualPkg);
      expect(mockPurchases.purchasePackage).not.toHaveBeenCalledWith(weeklyPkg);
    });

    it('rejects when there is no current offering configured in RevenueCat', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: null });
      await expect(revenueCatBilling.purchaseWeekly()).rejects.toThrow(/offering/i);
    });

    it('rejects when the offering has no weekly package', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: { weekly: null, annual: {} } });
      await expect(revenueCatBilling.purchaseWeekly()).rejects.toThrow(/weekly/i);
    });

    it('rejects when the offering has no annual package', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: { weekly: {}, annual: null } });
      await expect(revenueCatBilling.purchaseAnnual()).rejects.toThrow(/annual/i);
    });

    it('propagates a purchase failure (e.g. store error) to the caller', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: { weekly: {}, annual: {} } });
      mockPurchases.purchasePackage.mockRejectedValue(new Error('Store unavailable'));
      await expect(revenueCatBilling.purchaseAnnual()).rejects.toThrow('Store unavailable');
    });
  });

  describe('restorePurchases', () => {
    it('resolves "premium" when the restored account has an active entitlement', async () => {
      mockPurchases.restorePurchases.mockResolvedValue({ entitlements: { active: { premium: {} } } });
      await expect(revenueCatBilling.restorePurchases()).resolves.toBe('premium');
    });

    it('resolves "free" (not an error) when there is nothing to restore', async () => {
      mockPurchases.restorePurchases.mockResolvedValue({ entitlements: { active: {} } });
      await expect(revenueCatBilling.restorePurchases()).resolves.toBe('free');
    });

    it('propagates a real restore failure to the caller', async () => {
      mockPurchases.restorePurchases.mockRejectedValue(new Error('Network error'));
      await expect(revenueCatBilling.restorePurchases()).rejects.toThrow('Network error');
    });
  });

  describe('fetchCurrentOffering (live pricing lookup)', () => {
    it('returns the current offering when one is configured', async () => {
      const offering = { weekly: { identifier: 'weekly_pkg' }, annual: { identifier: 'annual_pkg' } };
      mockPurchases.getOfferings.mockResolvedValue({ current: offering });
      await expect(fetchCurrentOffering()).resolves.toBe(offering);
    });

    it('returns null (never throws) when no current offering is set', async () => {
      mockPurchases.getOfferings.mockResolvedValue({ current: null });
      await expect(fetchCurrentOffering()).resolves.toBeNull();
    });

    it('returns null (never throws) when the SDK call itself fails — display-only, must not break the paywall', async () => {
      mockPurchases.getOfferings.mockRejectedValue(new Error('network error'));
      await expect(fetchCurrentOffering()).resolves.toBeNull();
    });
  });

  describe('isUserCancelledPurchase', () => {
    it('is true for the documented PURCHASE_CANCELLED_ERROR code', () => {
      expect(isUserCancelledPurchase({ code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR })).toBe(true);
    });

    it('is true for the deprecated userCancelled flag, for SDK paths that only set that', () => {
      expect(isUserCancelledPurchase({ userCancelled: true })).toBe(true);
    });

    it('is false for an unrelated error, so real failures still surface', () => {
      expect(isUserCancelledPurchase(new Error('Store unavailable'))).toBe(false);
      expect(isUserCancelledPurchase({ code: 'SOME_OTHER_CODE' })).toBe(false);
    });

    it('is false for null/undefined/non-object input', () => {
      expect(isUserCancelledPurchase(null)).toBe(false);
      expect(isUserCancelledPurchase(undefined)).toBe(false);
      expect(isUserCancelledPurchase('some string')).toBe(false);
    });
  });
});
