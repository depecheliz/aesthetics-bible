jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// react-native-purchases' native module has no JSDOM/test-runner binding.
// Screens/services under test should stub `lib/services/revenueCatBilling`
// directly where behavior matters (see EntitlementContext tests); this
// mock only exists so importing it doesn't crash the test environment.
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    getOfferings: jest.fn().mockResolvedValue({ current: null }),
    getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    logIn: jest.fn(),
    logOut: jest.fn(),
  },
  // Real value (not just a type) so revenueCatBilling's cancellation check
  // (`PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR`) has something to read
  // under test — matches the SDK's actual string value for that code.
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: '1' },
}));

// Native inset events do not run in Jest; use the library's provider/hook mock.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
