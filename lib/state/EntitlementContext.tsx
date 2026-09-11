import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import type { Entitlement } from '../../types';
import {
  revenueCatBilling,
  isRevenueCatConfigured,
  fetchCurrentOffering,
  isUserCancelledPurchase,
} from '../services/revenueCatBilling';
import { analytics } from '../services/analyticsClient';

/**
 * Entitlement state, backed by RevenueCat. Screens read `isPremium` here
 * rather than re-implementing their own check — this is the single place
 * that talks to the billing provider. The client-side value here is for UI
 * responsiveness only; anything that spends real money (an AI Preview
 * generation) must re-verify entitlement server-side (see the
 * `generate-preview` Edge Function) rather than trusting this alone.
 */

type EntitlementState = {
  entitlement: Entitlement;
  isPremium: boolean;
  /** True while the initial entitlement check or a purchase/restore call is in flight. */
  isLoading: boolean;
  /** Set when a purchase/restore call fails for a real reason (not a user cancellation); cleared on the next attempt. */
  error: string | null;
  /**
   * Set after a restore call succeeds, whether or not it found anything to
   * restore — distinct from `error` so the UI never implies a real failure
   * when RevenueCat simply had nothing to restore for this account.
   */
  restoreMessage: string | null;
  /** The current RevenueCat offering's packages, for live pricing display. Null until loaded/if unavailable. */
  offering: PurchasesOffering | null;
  purchaseWeekly: () => Promise<void>;
  purchaseAnnual: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshEntitlement: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementState | undefined>(undefined);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Best-effort, one-time fetch on mount: a missing/failed offering just
    // means the paywall falls back to its static copy, so nothing here
    // touches isLoading/error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurrentOffering().then((result) => {
      if (!cancelled) setOffering(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runEntitlementCheck = useCallback(async () => {
    if (!isRevenueCatConfigured) {
      // Not configured yet in this environment — stay "free" and say so via
      // isLoading=false rather than silently pretending to be premium.
      setIsLoading(false);
      return;
    }
    try {
      const result = await revenueCatBilling.getEntitlement();
      setEntitlement(result);
    } catch {
      // A failed entitlement check should not crash the app or silently
      // grant premium — fall back to 'free' and let the user retry
      // (e.g. via Restore Purchases) rather than guessing.
      setEntitlement('free');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time entitlement check on mount, not a synchronize-every-render
    // pattern — every setState call inside is unconditional and idempotent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runEntitlementCheck();
  }, [runEntitlementCheck]);

  const purchaseWeekly = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRestoreMessage(null);
    analytics.track('purchase_started', { selected_product: 'weekly' });
    try {
      const result = await revenueCatBilling.purchaseWeekly();
      setEntitlement(result);
      analytics.track('weekly_purchased');
    } catch (err) {
      if (isUserCancelledPurchase(err)) {
        // Not a failure — the user backed out of the store sheet. No error
        // banner; just stop loading and let them try again if they want.
        analytics.track('purchase_cancelled', { selected_product: 'weekly' });
      } else {
        analytics.track('purchase_failed', { selected_product: 'weekly' });
        setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseAnnual = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRestoreMessage(null);
    analytics.track('purchase_started', { selected_product: 'annual' });
    try {
      const result = await revenueCatBilling.purchaseAnnual();
      setEntitlement(result);
      analytics.track('annual_purchased');
    } catch (err) {
      if (isUserCancelledPurchase(err)) {
        analytics.track('purchase_cancelled', { selected_product: 'annual' });
      } else {
        analytics.track('purchase_failed', { selected_product: 'annual' });
        setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRestoreMessage(null);
    analytics.track('restore_started');
    try {
      const result = await revenueCatBilling.restorePurchases();
      setEntitlement(result);
      if (result === 'premium') {
        analytics.track('purchase_restored');
        setRestoreMessage('Your Premium subscription has been restored.');
      } else {
        // The restore call itself succeeded — RevenueCat just has no active
        // entitlement for this account. This is not an error state.
        analytics.track('restore_no_entitlement');
        setRestoreMessage('No active purchase was found for this account.');
      }
    } catch (err) {
      analytics.track('restore_failed');
      setError(err instanceof Error ? err.message : 'Restore failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <EntitlementContext.Provider
      value={{
        entitlement,
        isPremium: entitlement === 'premium',
        isLoading,
        error,
        restoreMessage,
        offering,
        purchaseWeekly,
        purchaseAnnual,
        restorePurchases,
        refreshEntitlement: runEntitlementCheck,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementState {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error('useEntitlement must be used within EntitlementProvider');
  }
  return ctx;
}
