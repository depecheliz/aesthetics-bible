/**
 * Billing/entitlement provider interface. Backed by RevenueCat in a later
 * phase. Premium gating must never be enforced solely in the UI — the
 * server-verifiable entitlement check lives behind this interface.
 */

import type { Entitlement } from '../../types';

export interface BillingProvider {
  getEntitlement(): Promise<Entitlement>;
  purchaseWeekly(): Promise<Entitlement>;
  purchaseAnnual(): Promise<Entitlement>;
  restorePurchases(): Promise<Entitlement>;
}
