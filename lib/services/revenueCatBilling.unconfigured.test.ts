/**
 * Covers `revenueCatBilling.ts` when no platform API key is set at all
 * (e.g. a local dev build before `.env.local` has RevenueCat keys). See
 * `revenueCatBilling.test.ts` for the configured path and
 * `revenueCatBilling.closedTesting.test.ts` for the closed-testing case,
 * where keys ARE present but purchases must still be disabled.
 */
import Purchases from 'react-native-purchases';

jest.mock('../env', () => ({
  env: {
    appEnv: 'development',
    supabaseUrl: '',
    supabaseAnonKey: '',
    revenueCatIosApiKey: '',
    revenueCatAndroidApiKey: '',
    googlePlacesClientKey: '',
    analyticsWriteKey: '',
  },
}));

import {
  configureRevenueCat,
  fetchCurrentOffering,
  identifyRevenueCatUser,
  isRevenueCatConfigured,
  resetRevenueCatUser,
  revenueCatBilling,
} from './revenueCatBilling';

const mockPurchases = Purchases as unknown as {
  configure: jest.Mock;
  getOfferings: jest.Mock;
  logIn: jest.Mock;
  logOut: jest.Mock;
};

describe('revenueCatBilling (no API key configured)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is not configured', () => {
    expect(isRevenueCatConfigured).toBe(false);
  });

  it('does not configure the SDK', () => {
    configureRevenueCat();
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });

  it('does not call logIn/logOut', async () => {
    await identifyRevenueCatUser('supabase-user-123');
    await resetRevenueCatUser();
    expect(mockPurchases.logIn).not.toHaveBeenCalled();
    expect(mockPurchases.logOut).not.toHaveBeenCalled();
  });

  it('getEntitlement throws instead of silently defaulting to free or premium', async () => {
    await expect(revenueCatBilling.getEntitlement()).rejects.toThrow();
  });

  it('fetchCurrentOffering resolves null without ever calling the SDK', async () => {
    await expect(fetchCurrentOffering()).resolves.toBeNull();
    expect(mockPurchases.getOfferings).not.toHaveBeenCalled();
  });
});
