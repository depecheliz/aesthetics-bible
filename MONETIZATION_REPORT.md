# Monetization / RevenueCat audit — 2026-09-11 (Agent #4)

Scope: monetization/RevenueCat/paywall/entitlements only. Device shell
(`device_bash`) was unavailable for this entire session — validation
commands could not be run; see "Validation" below for exact commands to
run and what to watch for.

## 1. What already worked (before this pass)

RevenueCat was already wired client-side and server-side, done well:
`lib/services/revenueCatBilling.ts` (configure/identify/reset/purchase/
restore, anonymous-purchase-then-`logIn()` identity model), `lib/state/
EntitlementContext.tsx` (app-wide `isPremium`), `app/paywall.tsx` (annual
preselected, weekly secondary, single CTA, Restore Purchases, disabled
state when unconfigured), `AppProviders.tsx` (identity aliasing on sign-in/
sign-out), and the server-side entitlement + quota boundary in
`supabase/functions/generate-preview/index.ts` (RevenueCat secret-key
REST check + atomic `acquire_preview_request` RPC, only a successful
generation ever inserts a row). Closed-testing safety (`EXPO_PUBLIC_APP_ENV
=closed-testing` disables purchases even with a key present) was already
correct. None of this needed to change.

## 2. What this pass added

- **Live pricing** (`app/paywall.tsx`, `EntitlementContext.tsx`,
  `revenueCatBilling.ts`): the paywall previously hardcoded "$99"/"$11.99"/
  "$1.90". Added `fetchCurrentOffering()` (never throws — display-only) and
  wired the paywall to show `product.priceString` / `product.
  pricePerWeekString` from the live RevenueCat offering when it has
  loaded, falling back to the same static copy as before when it hasn't
  (unconfigured build, still loading, or the fetch fails). No behavior
  change when RevenueCat isn't reachable.
- **Purchase cancellation handled distinctly from a real failure**
  (`revenueCatBilling.ts`, `EntitlementContext.tsx`): a user backing out of
  the store sheet previously showed the same error banner as a real
  failure (e.g. "Store unavailable"). Added `isUserCancelledPurchase()`
  (checks `PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR`, falls back to
  the deprecated `userCancelled` flag) and a `purchase_cancelled` analytics
  event, separate from `purchase_failed`. Cancelling no longer sets `error`.
- **Restore Purchases distinguishes "restored" from "nothing to restore"**
  (`EntitlementContext.tsx`, `app/paywall.tsx`): previously any successful
  restore call tracked `purchase_restored` and showed nothing else,
  whether or not an entitlement actually came back. Added `restoreMessage`
  state (separate from `error`) and a `restore_no_entitlement` analytics
  event: a restore that succeeds but finds no active purchase now says so
  plainly, without implying either "restored" or a failure.
- **Tests**: `lib/services/revenueCatBilling.test.ts` (+ `.unconfigured.
  test.ts` + `.closedTesting.test.ts`) and `lib/state/EntitlementContext.
  test.tsx`, covering: entitlement parsing, correct package purchased,
  purchase success/failure/cancellation, restore success/no-entitlement/
  failure, configured/unconfigured/closed-testing gating, and login/logout
  identity transitions (`identifyRevenueCatUser`/`resetRevenueCatUser`).
  `jest.setup.js`'s `react-native-purchases` mock gained a
  `PURCHASES_ERROR_CODE` export (needed by the new cancellation check).

## 3. Not touched

AI Preview's provider adapter, prompts, storage, and the
`generate-preview` entitlement/quota boundary — that boundary already
reads `isPremium`/RevenueCat correctly and was left exactly as Agent #3
built it. EAS/release config, Android package ID, branding, Near Me/Maps,
onboarding — untouched, as instructed.

## 4. Entitlement / offerings / products

Entitlement identifier: `premium` (client SDK check in `revenueCatBilling.
ts`; server-side REST check in `generate-preview` using
`REVENUECAT_SECRET_API_KEY`). Offering: RevenueCat's `current` offering,
expected to expose a `weekly` and an `annual` package (`offering.weekly`
/ `offering.annual` — RevenueCat's standard package-type shortcuts, not a
custom identifier this code invents). No monthly package is read or
referenced anywhere.

**Exact external configuration still required** (unchanged from
`BUILD_STATUS.md`'s "NEXT BUILD" §4 — repeating here since it's this
agent's lane): a RevenueCat project with iOS + Android public API keys
set as `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `_ANDROID_API_KEY`; App
Store Connect / Google Play Console subscription products for $11.99/week
and $99/year (no monthly); both attached to a `premium` entitlement in
RevenueCat; a `current` offering with `weekly` and `annual` packages; and
`REVENUECAT_SECRET_API_KEY` set via `supabase secrets set` for the
Edge Function's server-side check. No product IDs are invented here —
the store assigns them when the products are created.

## 5. Validation NOT run this session

`device_bash` (the shell on Liz's computer) returned "no Plan9 drive
shares mounted" on every attempt this session — a device/session issue,
not a code issue. Nothing here was verified by actually running it.
Run these from the project root before trusting this change set:

```
npm run typecheck
npm run lint
npm test -- --runInBand
```

Things worth a second look given tests couldn't run: the `PurchasesPackage`
/`PurchasesStoreProduct` field names used in `paywall.tsx`
(`product.priceString`, `product.pricePerWeekString`) against the
installed `react-native-purchases@10.9.0` types; and whether
`react-hooks/set-state-in-effect` or `import/first` (if enabled in this
project's eslint config) flag anything in the new offering-fetch effect or
the new test files' `jest.mock` placement.
