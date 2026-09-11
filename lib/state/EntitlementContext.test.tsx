import { Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { EntitlementProvider, useEntitlement } from './EntitlementContext';
import * as revenueCatBillingModule from '../services/revenueCatBilling';

/**
 * The billing/RevenueCat SDK boundary itself is covered by
 * `lib/services/revenueCatBilling.test.ts`. These tests cover the layer the
 * rest of the app actually talks to — `EntitlementProvider`/`useEntitlement`
 * — so `../services/revenueCatBilling` is mocked wholesale rather than
 * exercising the real (native-backed) SDK.
 */
jest.mock('../services/revenueCatBilling', () => ({
  __esModule: true,
  isRevenueCatConfigured: true,
  revenueCatBilling: {
    getEntitlement: jest.fn(),
    purchaseWeekly: jest.fn(),
    purchaseAnnual: jest.fn(),
    restorePurchases: jest.fn(),
  },
  fetchCurrentOffering: jest.fn(),
  isUserCancelledPurchase: jest.fn(),
}));

jest.mock('../services/analyticsClient', () => ({
  analytics: { track: jest.fn() },
}));

const mocked = revenueCatBillingModule as unknown as {
  isRevenueCatConfigured: boolean;
  revenueCatBilling: {
    getEntitlement: jest.Mock;
    purchaseWeekly: jest.Mock;
    purchaseAnnual: jest.Mock;
    restorePurchases: jest.Mock;
  };
  fetchCurrentOffering: jest.Mock;
  isUserCancelledPurchase: jest.Mock;
};

function Probe() {
  const {
    isPremium,
    isLoading,
    error,
    restoreMessage,
    offering,
    purchaseWeekly,
    purchaseAnnual,
    restorePurchases,
  } = useEntitlement();
  return (
    <>
      <Text testID="isPremium">{String(isPremium)}</Text>
      <Text testID="isLoading">{String(isLoading)}</Text>
      <Text testID="error">{error ?? 'none'}</Text>
      <Text testID="restoreMessage">{restoreMessage ?? 'none'}</Text>
      <Text testID="hasOffering">{String(offering !== null)}</Text>
      <Text testID="purchaseWeekly" onPress={() => purchaseWeekly()}>
        weekly
      </Text>
      <Text testID="purchaseAnnual" onPress={() => purchaseAnnual()}>
        annual
      </Text>
      <Text testID="restore" onPress={() => restorePurchases()}>
        restore
      </Text>
    </>
  );
}

async function renderProbe() {
  await render(
    <EntitlementProvider>
      <Probe />
    </EntitlementProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('isLoading').props.children).toBe('false'));
}

describe('EntitlementContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked.isRevenueCatConfigured = true;
    mocked.revenueCatBilling.getEntitlement.mockResolvedValue('free');
    mocked.fetchCurrentOffering.mockResolvedValue(null);
    mocked.isUserCancelledPurchase.mockReturnValue(false);
  });

  it('checks entitlement on mount and starts free when nothing is active', async () => {
    await renderProbe();
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
    expect(mocked.revenueCatBilling.getEntitlement).toHaveBeenCalledTimes(1);
  });

  it('skips the entitlement check entirely when RevenueCat is not configured for this build', async () => {
    mocked.isRevenueCatConfigured = false;
    await renderProbe();
    expect(mocked.revenueCatBilling.getEntitlement).not.toHaveBeenCalled();
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
  });

  it('falls back to "free" — never crashes or silently grants premium — when the entitlement check fails', async () => {
    mocked.revenueCatBilling.getEntitlement.mockRejectedValue(new Error('network error'));
    await renderProbe();
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
  });

  it('loads the current RevenueCat offering for live pricing display', async () => {
    mocked.fetchCurrentOffering.mockResolvedValue({ weekly: {}, annual: {} });
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('hasOffering').props.children).toBe('true'));
  });

  it('purchasing annual updates isPremium to true on success', async () => {
    mocked.revenueCatBilling.purchaseAnnual.mockResolvedValue('premium');
    await renderProbe();

    fireEvent.press(screen.getByTestId('purchaseAnnual'));

    await waitFor(() => expect(screen.getByTestId('isPremium').props.children).toBe('true'));
    expect(screen.getByTestId('error').props.children).toBe('none');
  });

  it('purchasing weekly and succeeding updates isPremium the same way', async () => {
    mocked.revenueCatBilling.purchaseWeekly.mockResolvedValue('premium');
    await renderProbe();

    fireEvent.press(screen.getByTestId('purchaseWeekly'));

    await waitFor(() => expect(screen.getByTestId('isPremium').props.children).toBe('true'));
  });

  it('purchase failure for a real reason (not a cancellation) shows an error and stays free', async () => {
    mocked.revenueCatBilling.purchaseWeekly.mockRejectedValue(new Error('Store unavailable'));
    await renderProbe();

    fireEvent.press(screen.getByTestId('purchaseWeekly'));

    await waitFor(() => expect(screen.getByTestId('error').props.children).toBe('Store unavailable'));
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
  });

  it('purchasing and cancelling does not show an error state', async () => {
    mocked.revenueCatBilling.purchaseAnnual.mockRejectedValue({ userCancelled: true });
    mocked.isUserCancelledPurchase.mockReturnValue(true);
    await renderProbe();

    fireEvent.press(screen.getByTestId('purchaseAnnual'));

    await waitFor(() => expect(screen.getByTestId('isLoading').props.children).toBe('false'));
    expect(screen.getByTestId('error').props.children).toBe('none');
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
  });

  it('restoring with an active entitlement reports success, distinctly from a generic message', async () => {
    mocked.revenueCatBilling.restorePurchases.mockResolvedValue('premium');
    await renderProbe();

    fireEvent.press(screen.getByTestId('restore'));

    await waitFor(() => expect(screen.getByTestId('isPremium').props.children).toBe('true'));
    expect(screen.getByTestId('restoreMessage').props.children).toMatch(/restored/i);
    expect(screen.getByTestId('error').props.children).toBe('none');
  });

  it('restoring with nothing to restore says so plainly — not "restored" and not an error', async () => {
    mocked.revenueCatBilling.restorePurchases.mockResolvedValue('free');
    await renderProbe();

    fireEvent.press(screen.getByTestId('restore'));

    await waitFor(() =>
      expect(screen.getByTestId('restoreMessage').props.children).toMatch(/no active purchase/i),
    );
    expect(screen.getByTestId('isPremium').props.children).toBe('false');
    expect(screen.getByTestId('error').props.children).toBe('none');
  });

  it('a real restore failure surfaces as an error, never as a false "restored"', async () => {
    mocked.revenueCatBilling.restorePurchases.mockRejectedValue(new Error('Network error'));
    await renderProbe();

    fireEvent.press(screen.getByTestId('restore'));

    await waitFor(() => expect(screen.getByTestId('error').props.children).toBe('Network error'));
    expect(screen.getByTestId('restoreMessage').props.children).toBe('none');
  });
});
