/**
 * RevenueCat-backed implementation of `BillingProvider`.
 *
 * Identity model (see decision in project notes): purchases happen against
 * RevenueCat's auto-generated anonymous App User ID — no Supabase account
 * is required before buying. Once the user signs in/up with Supabase (which
 * the app already requires to persist a Plan or Passport entry), call
 * `identifyRevenueCatUser(supabaseUserId)` to alias the anonymous purchaser
 * to the real account via `Purchases.logIn()`. Restore Purchases resolves
 * against the store receipt, so it works regardless of when that linking
 * happens.
 *
 * Entitlement identifier expected in the RevenueCat dashboard: "premium".
 * Product identifiers expected: weekly and annual subscription products
 * priced at $11.99/week and $99/year respectively (no monthly plan at
 * launch) — configured in App Store Connect / Google Play Console and
 * attached to the "premium" entitlement in RevenueCat. This file does not
 * hardcode product IDs; it reads whatever RevenueCat's current offering
 * returns, so pricing/product IDs are configured on the RevenueCat/store
 * side, not in this code.
 */

import Purchases, { type CustomerInfo, type PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import type { Entitlement } from '../../types';
import type { BillingProvider } from './billing';
import { env } from '../env';

const PREMIUM_ENTITLEMENT_ID = 'premium';

export const isRevenueCatConfigured = Boolean(
  Platform.OS === 'ios' ? env.revenueCatIosApiKey : env.revenueCatAndroidApiKey,
);

let configured = false;

/** Call once at app startup, before any billing call is made. */
export function configureRevenueCat() {
  if (configured || !isRevenueCatConfigured) {
    return;
  }
  const apiKey = Platform.OS === 'ios' ? env.revenueCatIosApiKey : env.revenueCatAndroidApiKey;
  Purchases.configure({ apiKey });
  configured = true;
}

/** Call after a successful Supabase sign-in/sign-up to alias the anonymous purchaser. */
export async function identifyRevenueCatUser(supabaseUserId: string): Promise<void> {
  if (!isRevenueCatConfigured) {
    return;
  }
  await Purchases.logIn(supabaseUserId);
}

/** Call after Supabase sign-out so a shared device doesn't leak entitlement across accounts. */
export async function resetRevenueCatUser(): Promise<void> {
  if (!isRevenueCatConfigured) {
    return;
  }
  await Purchases.logOut();
}

function entitlementFromCustomerInfo(info: CustomerInfo): Entitlement {
  return info.entitlements.active[PREMIUM_ENTITLEMENT_ID] ? 'premium' : 'free';
}

async function getOffering(): Promise<PurchasesOffering> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;
  if (!offering) {
    throw new Error(
      'No RevenueCat offering is configured for this app. Set a "current" offering with the weekly and annual packages in the RevenueCat dashboard.',
    );
  }
  return offering;
}

export const revenueCatBilling: BillingProvider = {
  async getEntitlement() {
    if (!isRevenueCatConfigured) {
      throw new Error(
        'RevenueCat is not configured (missing EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY). Not defaulting to "premium" or "free" silently — surface this as a real error.',
      );
    }
    const info = await Purchases.getCustomerInfo();
    return entitlementFromCustomerInfo(info);
  },

  async purchaseWeekly() {
    const offering = await getOffering();
    const pkg = offering.weekly;
    if (!pkg) {
      throw new Error('No weekly package found on the current RevenueCat offering.');
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return entitlementFromCustomerInfo(customerInfo);
  },

  async purchaseAnnual() {
    const offering = await getOffering();
    const pkg = offering.annual;
    if (!pkg) {
      throw new Error('No annual package found on the current RevenueCat offering.');
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return entitlementFromCustomerInfo(customerInfo);
  },

  async restorePurchases() {
    const info = await Purchases.restorePurchases();
    return entitlementFromCustomerInfo(info);
  },
};
