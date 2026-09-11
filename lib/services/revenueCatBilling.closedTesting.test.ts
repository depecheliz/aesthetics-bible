/**
 * Covers the specific safety property from the Android closed-testing audit
 * (see ANDROID_CLOSED_TESTING.md): a closed-testing build must disable real
 * purchases even when a valid platform API key IS present, so testers never
 * accidentally trigger a real store charge. Keys are present here —
 * `revenueCatBilling.unconfigured.test.ts` covers the "no key at all" case.
 */
import Purchases from 'react-native-purchases';

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

  it('is not configured even though a valid platform API key is present', () => {
    expect(isRevenueCatConfigured).toBe(false);
  });

  it('never configures the SDK, so no real purchase can be triggered by a tester', () => {
    configureRevenueCat();
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });
});
