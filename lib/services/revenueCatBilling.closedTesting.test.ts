/**
 * Covers the Android closed-testing purchase path. A store-distributed test
 * build must configure RevenueCat when its Android public SDK key is present;
 * Google Play license testers prevent real charges while RevenueCat continues
 * to verify the real `premium` entitlement.
 */
import Purchases from 'react-native-purchases';

jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const platform = {
    OS: 'android',
    select: (options: Record<string, unknown>) => options.android ?? options.default,
  };
  return { __esModule: true, default: platform, ...platform };
});

jest.mock('../env', () => ({
  env: {
    appEnv: 'closed-testing',
    supabaseUrl: '',
    supabaseAnonKey: '',
    revenueCatIosApiKey: 'test-ios-key',
    revenueCatAndroidApiKey: 'test-android-key',
    googlePlacesClientKey: '',
    analyticsWriteKey: '',
  },
}));

import { configureRevenueCat, isRevenueCatConfigured } from './revenueCatBilling';

const mockPurchases = Purchases as unknown as { configure: jest.Mock };

describe('revenueCatBilling (closed-testing build)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is configured when a valid Android public SDK key is present', () => {
    expect(isRevenueCatConfigured).toBe(true);
  });

  it('configures the SDK with the platform public key', () => {
    configureRevenueCat();
    expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: 'test-android-key' });
  });
});
