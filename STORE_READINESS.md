# STORE_READINESS.md --- THE AESTHETICS BIBLE

**Purpose:** track native/store submission readiness. This is a
checklist and audit record, not a product definition --- see
`PRODUCT_SPEC.md` and `CLAUDE.md`. Every claim below was verified against
the current codebase and `app.json`/`package.json` as of this audit.

**Status of this phase:** audit + configuration only. Nothing has been
submitted, built for a store, or purchased. Supabase is intentionally
paused during this phase (see `BUILD_STATUS.md`) --- none of the items
below required a live backend to complete.

---

## Identifiers

- **iOS bundle identifier:** `com.aestheticsbible.app`
- **Android package name:** `com.aestheticsbible.app`
- Consistent across both platforms in `app.json`. **COMPLETE.** No
  change made or needed.
- **URL scheme:** `aestheticsbible` --- already present in `app.json`,
  unchanged. **COMPLETE.**

---

## iOS

| Item | Status | Notes |
|---|---|---|
| Bundle ID | COMPLETE | `com.aestheticsbible.app` |
| App icon | **COMPLETE (pending your visual sign-off)** | Real brand icon --- black `#0B0B0C` background, centered champagne "AB" monogram in Playfair Display SemiBold, no generic Expo art remains. See "Icon & Splash" below. |
| Splash screen | **COMPLETE (pending your visual sign-off)** | Centered AB monogram + "THE AESTHETICS BIBLE" wordmark in the same treatment used on Home, on the brand black background. No generic Expo art remains. |
| Development build | READY BUT NOT LIVE | `expo-dev-client` installed, `eas.json` has a `development` profile; no build has been run |
| Apple Developer account | BLOCKED / MANUAL STEP | Needs your Apple Developer Program membership |
| App Store Connect app record | BLOCKED / MANUAL STEP | Needs the Apple Developer account first |
| Privacy disclosures (App Privacy / nutrition label) | READY BUT NOT LIVE | Data-collection audit below is accurate as of today; the actual App Store Connect form still needs to be filled in by you |
| Account deletion | READY BUT NOT LIVE | UI exists (Passport → Account → Delete Account) and the Edge Function was validated end-to-end before the backend was paused; **must be re-tested after reactivation, before submission** |
| Subscription configuration | NOT STARTED | No App Store Connect subscription products exist yet --- see RevenueCat Prerequisites |
| Restore Purchases | NOT STARTED | No RevenueCat SDK installed yet |
| Screenshots | NOT STARTED | Needs real device/simulator captures of the finished UI |
| Description / keywords | NOT STARTED | Marketing copy, not yet drafted |
| Support URL | BLOCKED / MANUAL STEP | Needs a real hosted URL (domain decision is yours) |
| Privacy policy URL | BLOCKED / MANUAL STEP | Needs a real hosted URL and a written policy reflecting the data audit below |
| TestFlight | NOT STARTED | Requires a development/preview build first |
| Review notes | NOT STARTED | Should reference the product-boundary language audited below (educational/planning tool, not diagnostic) |

## Android

| Item | Status | Notes |
|---|---|---|
| Package name | COMPLETE | `com.aestheticsbible.app` |
| App icon (adaptive) | **COMPLETE (pending your visual sign-off)** | Foreground (AB monogram, transparent), background (solid brand black), and monochrome (white silhouette for Android 13+ themed icons) all replaced with real brand art, verified safe within circle/rounded-square/squircle adaptive masks. |
| Splash screen | **COMPLETE (pending your visual sign-off)** | Same asset as iOS. |
| Development build | READY BUT NOT LIVE | Same `expo-dev-client` + `eas.json` as iOS |
| Google Play Console account | BLOCKED / MANUAL STEP | Needs your Google Play Developer account |
| Play Console app record | BLOCKED / MANUAL STEP | Needs the Play Console account first |
| Data safety disclosures | READY BUT NOT LIVE | Same audit below applies; Play Console's Data Safety form still needs to be filled in by you |
| Account deletion | READY BUT NOT LIVE | Same as iOS --- Google now requires an in-app account-deletion path (Play policy), which exists; re-test after backend reactivation |
| Subscription configuration | NOT STARTED | No Play Console subscription products exist yet |
| Restore Purchases | NOT STARTED | No RevenueCat SDK installed yet |
| Screenshots | NOT STARTED | |
| Description / keywords | NOT STARTED | |
| Support URL | BLOCKED / MANUAL STEP | Same as iOS |
| Privacy policy URL | BLOCKED / MANUAL STEP | Same as iOS |
| Internal testing track | NOT STARTED | Requires a development/preview build first |
| Review notes | NOT STARTED | |

---

## Icon & Splash --- now implemented

Replaced every generic Expo template graphic with real Aesthetics Bible
brand art, generated deterministically from the same tokens the in-app
UI already uses (no new colors, no new typography, no new mark ---
`constants/theme.ts` + the approved `components/brand/Monogram.tsx`
treatment). Full detail and regeneration instructions in
`assets/brand/native/README.md`.

**Design:** black `#0B0B0C` background, centered "AB" monogram set in
Playfair Display SemiBold at champagne `#C9A97E`, generous negative
space, no border/box (the in-app Monogram's thin border reads fine as a
small UI badge but disappears/adds noise at icon sizes, so it was
dropped here per "if illegible, simplify rather than decorate"). The
splash additionally sets "THE AESTHETICS BIBLE" beneath the monogram in
the exact eyebrow treatment (Montserrat SemiBold, wide tracking,
champagne) already used on the Home screen's brand row.

**Generated (`scripts/generate-native-brand-assets.js`, not hand-drawn
art --- see that file's header for why a deterministic render was used):**
- `assets/icon.png` (1024×1024, opaque --- no alpha channel, per iOS
  requirements).
- `assets/android-icon-foreground.png` (1024×1024, transparent, AB
  monogram sized to occupy ~34% of canvas width).
- `assets/android-icon-background.png` (1024×1024, solid `#0B0B0C`).
- `assets/android-icon-monochrome.png` (1024×1024, transparent, white
  silhouette, same sizing as the foreground).
- `assets/splash-icon.png` (transparent, monogram + wordmark stack).
- `assets/favicon.png` (256×256, opaque, bare monogram --- no wordmark,
  since it disappears at favicon sizes).

**Visual QA performed (not just generated and assumed correct):**
- Composited the adaptive foreground over the background and clipped it
  through circle, rounded-square, and squircle masks at full 1024px
  resolution --- the monogram sits fully inside all three with clear
  margin to spare, confirmed by direct visual inspection of each masked
  render.
- Downscaled the icon to 60px, 40px, and 29px (the smallest sizes iOS
  actually uses --- Settings/Spotlight/Notification) and inspected each
  at native pixel resolution --- "AB" stays legible at all three; this
  was a pessimistic nearest-neighbor check, so real device rendering
  (proper anti-aliasing at native resolution) will look cleaner still.
- Confirmed no residual Expo template branding remains anywhere in
  `assets/` after generation.

**Marked COMPLETE, not provisional** --- these meet every criterion in
your brief (palette, mark, negative space, small-size legibility, no
prohibited imagery) and were QA'd against real failure modes (masking,
small-size illegibility), not just produced and left unchecked.
Still **pending your visual sign-off**, since you haven't seen the
actual renders yet --- sent alongside this report. If you want a
different treatment (a genuinely custom-drawn mark, a bordered variant,
different weight/sizing), say so and I'll iterate; the generator script
makes that a parameter change, not a rebuild.

**Config change required and made:** `app.json`'s
`expo-splash-screen` plugin `imageWidth` was `160` --- too narrow for the
wordmark beneath the monogram to read at a legible size once scaled down
(would have rendered around 7px). Increased to `280`, which renders the
wordmark at roughly the same on-screen size as the app's own "eyebrow"
text style (~12pt) --- a deliberate, brand-consistent choice, not an
arbitrary number. No other `app.json` value changed.

---

## Development Build / EAS

- **`expo-dev-client`:** now installed (`~57.0.16`). The project no
  longer needs to depend on Expo Go for native testing once a dev build
  exists.
- **`eas.json`:** created with three profiles:
  - `development` --- `developmentClient: true`, internal distribution,
    Android APK (for installing straight onto a test device).
  - `preview` --- internal distribution, Android APK (for internal
    testers without a dev client).
  - `production` --- Android App Bundle (`.aab`, required by Play
    Console), `autoIncrement` on for build numbers.
- **Not done, and requiring you:** no `eas build` has been run (would
  consume EAS build minutes/credits and requires you to be logged into
  an Expo account via `eas login`), and `app.json` has no
  `extra.eas.projectId` yet --- that gets populated the first time `eas
  init` or `eas build:configure` runs against your Expo account. I did
  not run either, since both require your account and the instruction
  was not to trigger a build.
- **Manual step for you, when ready:** `eas login`, then `eas
  build:configure` (or `eas build --profile development --platform ios`
  directly, which configures on first run) to link the project and
  populate the project ID.

---

## Native Permissions

**Currently declared:** none. `app.json` has no `ios.infoPlist` usage
description keys and no `android.permissions` array. No camera, photo
library, or location package is installed (`expo-image-picker`,
`expo-camera`, `expo-location`, etc. are all absent from
`package.json`). This is correct for the app's current functionality ---
Preview/Glow/Passport-photo/Near Me are all still mocked (see
`BUILD_STATUS.md`), so nothing today actually touches the camera, photo
library, or GPS. No permission was requested that isn't needed yet.

**Future permission strategy (documented, not implemented):**

| Feature | Permission | iOS key | Android permission |
|---|---|---|---|
| Preview (selfie for visualization) | Photo library (+ optionally camera) | `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription` if camera capture is offered | `READ_MEDIA_IMAGES` (API 33+) / `READ_EXTERNAL_STORAGE` (older) |
| Glow (photo enhancement) | Same as Preview | Same | Same |
| Passport progress photos | Photo library (+ optionally camera) | Same | Same |
| Saved/exported images | Photo library write | `NSPhotoLibraryAddUsageDescription` | `WRITE_EXTERNAL_STORAGE` only on very old Android; modern Android uses the system share sheet / MediaStore, no broad permission needed |
| Near Me | Location (optional --- can also accept a manually entered city/zip) | `NSLocationWhenInUseUsageDescription` | `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` |

Add each permission's plugin config (`expo-image-picker`,
`expo-location`, etc.) and usage-description string **only when that
feature is actually built**, not now.

---

## Supabase Native-Auth Audit

Audited the committed Phase 1 code (no live backend needed for this ---
static review only):

- **Session storage:** `lib/services/supabaseClient.ts` passes
  `AsyncStorage` (`@react-native-async-storage/async-storage`) as the
  Supabase `auth.storage` option explicitly. This is the standard
  React Native-safe storage adapter and works identically on iOS,
  Android, and web (where `@react-native-async-storage/async-storage`
  falls back to browser storage internally) --- **no direct `localStorage`
  calls exist anywhere in the app** (grepped the full source tree,
  zero matches outside `node_modules`).
- **Session restoration:** `AuthContext.tsx`'s effect calls
  `getCurrentUser()` (→ `supabase.auth.getSession()`) and subscribes via
  `onAuthStateChange()` on mount --- both are plain `supabase-js` calls
  with no web-specific API. `AppProviders.tsx` shows a loading state
  (`status === 'restoring'`) until this resolves, matching the same
  behavior on every platform.
- **Sign-out:** `supabase.auth.signOut()` + local state reset in
  `AppStateContext` --- platform-agnostic.
- **Account deletion:** the client calls `supabase.functions.invoke(...)`
  --- an HTTPS call, identical on native and web.
- **Email confirmation architecture:** already correctly branches on
  `needsEmailConfirmation` from `signUpWithEmail` (see
  `lib/services/supabaseAuth.ts` / `app/auth/sign-up.tsx`) rather than
  assuming an instant session --- this is what makes it native-safe: on
  native there is no URL bar to show a "check your email" state, so this
  explicit state (not URL parsing) is exactly the right architecture.
  `supabaseClient.ts` also sets `detectSessionInUrl: false`, which is
  correct for native and doesn't block a real deep-link handler being
  added later.
- **Password-reset architecture:** not yet built (no password-reset UI
  exists --- this wasn't part of Phase 1 scope and remains a **new
  feature**, out of scope for this readiness pass per your instruction).
  The pieces it will need are already in place architecturally: the
  `aestheticsbible://` scheme, Expo Router's file-based routing (so a
  future `app/auth/reset-password.tsx` route "just works" once linked),
  and the `AuthProvider` interface pattern already used for sign-in/up.
- **No web-only assumption found.** The one thing that *would* have been
  a web-only assumption --- `Alert.alert` being a no-op on
  `react-native-web` --- was already found and fixed during Phase 1 (see
  `lib/utils/crossPlatformAlert.ts`); on native, `Alert.alert` works
  natively, so `showAlert` is a no-op wrapper there (just calls straight
  through).

**Conclusion: the auth implementation is cross-platform-correct as
committed.** No code changes were needed or made in this section.

---

## Deep Linking

- **Scheme:** `aestheticsbible` (already configured in `app.json`,
  unchanged this phase).
- **Current handling:** Expo Router auto-registers this scheme; any
  route under `app/` is reachable via `aestheticsbible://<path>` once a
  dev/production build exists (Expo Go uses its own `exp://` scheme
  instead, which is one more reason a dev client build matters before
  real device auth-redirect testing).
- **Architecture is ready to eventually handle**, without further code
  restructuring:
  - **Email confirmation** --- Supabase redirects to a configured URL
    after the user taps the email link; that URL can be set to
    `aestheticsbible://auth/confirm` (or similar) once a corresponding
    route exists.
  - **Password reset** --- same pattern, e.g.
    `aestheticsbible://auth/reset-password`.
  - **Auth redirects generally** --- `AuthContext`'s `onAuthStateChange`
    subscription means once a session exists (however it arrived), the
    whole app reacts automatically; no additional plumbing needed beyond
    the route existing.
  - **Future Apple Sign-In/OAuth callbacks** --- same scheme-based
    redirect pattern; not built now per your instruction.
- **Manual step for later, in the Supabase dashboard (not done now,
  requires a decision from you):** Authentication → URL Configuration →
  add `aestheticsbible://*` to the Redirect URLs allowlist once the
  corresponding in-app routes are built, and decide whether email
  templates should link to a hosted web confirmation page (needs a real
  domain) or go straight to the native scheme. **I have not invented a
  production redirect URL** --- that decision needs a domain choice from
  you.

---

## Privacy / Data-Collection Audit

Distinguishing what the app **actually does today** from what's **planned
but not implemented** --- verified against the current schema and code,
not the aspirational product spec.

| Data type | Currently collected? | Where | Notes for App Store/Play privacy forms |
|---|---|---|---|
| Account/email | **Yes** | Supabase `auth.users`, mirrored to `public.profiles` | Used for authentication only; not used for advertising |
| Quiz/profile answers (concern, area, intensity, downtime, comfort, budget) | **Yes**, only when signed in | `aesthetics_profile_answers` | Tied to account, RLS-scoped, never shared |
| Computed Plan/recommendation | **Yes**, only when signed in | `aesthetics_plans`, `saved_plan_items` | Deterministic local computation; only the input/output is stored, not a third-party AI result |
| Aesthetic treatment history (Passport entries: treatment, date, provider, cost, product, notes, satisfaction) | **Yes**, only when signed in | `passport_entries` | User-entered, never inferred or diagnosed by the app |
| User photos | **Not yet** | N/A | Preview/Glow/Passport photo UI exists but is fully mocked --- no image is ever uploaded, stored, or processed today. **Planned, not implemented.** |
| AI-generated images | **Not yet** | N/A | No AI provider is connected; Preview/Glow show only static campaign photography. **Planned, not implemented.** |
| Purchases/subscriptions | **Not yet** | N/A | No RevenueCat/IAP SDK installed; the paywall is a fully mocked UI with no purchase processed. **Planned, not implemented.** |
| Location / provider search | **Not yet** | N/A | Near Me shows 3 hardcoded sample providers; no Google Places call, no device location is read. **Planned, not implemented.** |
| Analytics | **Not yet** | N/A | `lib/services/analytics.ts` exports only a no-op implementation; no event is ever sent anywhere. **Planned, not implemented.** |

**Do not fill out App Store/Play privacy forms claiming photo, purchase,
location, or analytics data collection yet** --- none of that is true of
the shipped code today. Update this table (and the store forms) again
once each of those phases goes live.

---

## Product Boundary / Store-Review Language Audit

Grepped all screen copy for diagnostic/prescriptive/guarantee language.
**No concerning language found.** The one relevant match is exactly the
correct, existing disclaimer on the Preview screen:

> "Preview visualizations are illustrative, not a predicted treatment
> outcome, diagnosis, or guarantee."

This matches `CLAUDE.md`'s Product Boundaries and Preview vs Glow
sections. Botox Bestie's on-screen disclaimer (*"not a diagnosis, a
prescription, or an exact plan for your face"*) and the Result screen's
"why this matched you" framing (stated goals/preferences, never a photo
diagnosis) were previously audited in `BUILD_STATUS.md` and remain
unchanged this phase. **No copy was rewritten** --- nothing questionable
was found that would need it.

---

## Account Deletion Readiness

- UI: Passport tab → Account section → "Delete Account" (confirmation
  dialog, then calls the `delete-account` Edge Function).
- Backend: implemented and was validated end-to-end in Phase 1 (full
  cascade delete confirmed across all 5 user-owned tables before the
  project was paused).
- **Per your instruction, this was not re-tested live in this phase**
  (the backend is intentionally paused). **Action required before
  submission:** re-run the account-deletion validation (sign up → delete
  → confirm cascade) once Supabase is reactivated, and before App
  Store/Play review --- both platforms require a working in-app deletion
  path.

---

## RevenueCat Prerequisites (architecture only --- not integrated)

Audited `lib/services/billing.ts` (the existing `BillingProvider`
interface: `getEntitlement()`, `purchaseWeekly()`, `purchaseAnnual()`,
`restorePurchases()`) and `types/index.ts` (`Entitlement = 'free' |
'premium'`). The interface already matches what RevenueCat's SDK needs
to sit behind. Nothing was changed --- RevenueCat itself was **not**
installed or configured this phase, per your instruction.

**What the RevenueCat phase will require from you (decisions/manual
setup, not invented here):**

- An **App Store Connect** subscription group with two products:
  monthly and annual, priced to match `CLAUDE.md`'s launch test
  ($14.99/mo, $99/yr, annual as the hero offer). Apple assigns the
  actual product IDs when you create them --- I have not invented
  placeholder IDs.
- The equivalent **Google Play Console** subscription products (base
  plans for monthly/annual under one subscription).
- A **RevenueCat** account/project with:
  - iOS and Android API keys (client-safe, `EXPO_PUBLIC_*` --- already
    anticipated in `.env.example`).
  - One entitlement, presumably named `premium`, mapped to both
    products.
  - App Store Connect / Play Console credentials linked so RevenueCat
    can validate receipts server-side.
- Client work (next phase, not done now): install
  `react-native-purchases`, implement `BillingProvider` against it,
  wire `Restore Purchases` (required by both stores), and make Premium
  gating server-verifiable per `CLAUDE.md` → AI Calls / Premium (not
  UI-only).

---

## Validation (this session)

```
npm run typecheck   # tsc --noEmit                → clean
npm run lint        # eslint .                     → clean
npm test             # jest — 17 suites / 79 tests  → all passing
npx expo-doctor      # 21/21 checks                 → passing
npx expo export --platform web                      → succeeds
```

All five re-run after adding `expo-dev-client` and `eas.json` to confirm
neither broke anything. Live Supabase auth/database validation was
intentionally **not** attempted --- the project is paused, per your
instruction, and none of this phase's checks require it.

---

## Recommended Next Phase (while Supabase stays paused)

Any of the following can proceed without a live backend:

1. **Your visual sign-off on the new icon/splash** --- generated and QA'd
   this phase; iterate on the generator script if you want a different
   treatment.
2. **RevenueCat architecture** --- App Store Connect / Play Console
   product setup is entirely account-side and doesn't need the app's
   backend live; the actual SDK integration can follow once Supabase is
   back (Premium entitlement checks will eventually be server-verified
   through it).
3. **Analytics provider selection** --- picking and wiring a provider
   behind the existing `AnalyticsProvider` interface doesn't depend on
   Supabase.
4. **Privacy policy / support page copy** --- can be drafted now from
   the data-collection audit above, once you choose a domain.

Reactivate Supabase before: RevenueCat entitlement testing end-to-end,
account-deletion re-validation, or any real device auth/persistence QA.
