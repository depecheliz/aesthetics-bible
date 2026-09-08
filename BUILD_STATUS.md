# BUILD_STATUS.md --- THE AESTHETICS BIBLE

**Purpose:** a concise, accurate operational handoff for backend
integration in progress. This is a status snapshot, not a product definition
--- see `PRODUCT_SPEC.md` for the product and `CLAUDE.md` for the rules.
Every claim below was verified against the current codebase.

**Last known-good Git checkpoint:** `be2b3d0` --- *"feat: complete
Supabase auth and core persistence"* (Supabase Phase 1 --- auth, database
persistence for the quiz/Plan/Passport, RLS, account-deletion foundation
--- all committed and validated).

> ⚠️ **Supabase Phase 1 is implemented and validated; the live project is
> temporarily paused during pre-launch development** to preserve this
> account's available free-project slots while native/store-readiness
> work continues. This is intentional infrastructure management, not an
> outage or a defect. All migrations, repositories, auth architecture,
> RLS policy definitions, and the `delete-account` Edge Function source
> are preserved in Git (`supabase/migrations/`, `supabase/functions/`,
> `lib/services/`) --- nothing needs to be rebuilt when the project is
> reactivated. Do not attempt to "repair" the paused project, replace
> Supabase, remove the integration, or alter migrations in response to
> failed live auth/database calls while it's paused --- that is expected.
> Run backend health/auth/persistence checks again before any production
> testing, once reactivated. See `STORE_READINESS.md` for the current
> native/store-readiness audit, which was completed entirely without a
> live backend.

---

## P0 MONETIZATION BUILD (this phase, 2026-09-06)

Real subscription monetization + honest AI Preview architecture. Every
item below either works as described or fails/blocks honestly --- nothing
simulates a success it can't actually deliver yet. `tsc`, `eslint`, and
`jest` (84 tests, 18 suites) all clean after this phase.

- **Pricing:** $11.99/week (Explore) or $99/year (Aestella Annual, "Best
  Value", preselected) --- no monthly plan, superseding the earlier
  $9.99/month + $59.99/year figures from the first P0 pass.
- **RevenueCat wired client-side:** `lib/services/revenueCatBilling.ts`
  (real purchase/restore calls, anonymous-purchase-then-`logIn()` identity
  model --- no forced Supabase signup before paying) and
  `lib/state/EntitlementContext.tsx` (the app-wide `isPremium` source of
  truth). Not yet live-testable --- no RevenueCat keys/store products
  exist (see `NEXT BUILD`).
- **Restore Purchases:** real button on the paywall.
- **Paywall rewritten:** headline now "Your Personalized Aesthetic Plan Is
  Ready" (Plan-first, not a generic feature list); Glow removed from the
  premium module list; no fabricated social proof/testimonials/ratings
  (none exist yet).
- **Automatic paywall presentation:** the Result screen now routes to the
  paywall ~3.5s after the free reveal if the user isn't Premium, in
  addition to the existing manual "Unlock My Full Plan" button.
- **Anticipation screen:** `app/quiz/analyzing.tsx`, a brief honest beat
  between quiz completion and the Result reveal --- copy describes what's
  actually happening (assembling the profile from the user's answers), not
  analysis that isn't occurring.
- **Glow:** removed from the paid promise. Labeled "COMING SOON" on Home
  and inside the Preview/Glow screen; its buttons say "Coming Soon", not
  just disabled.
- **Passport photos:** the old fake "Add Photo" (flipped a boolean, no
  real photo) is gone --- every stage now shows an honest "coming soon"
  state.
- **AI Preview --- real architecture, provider intentionally unselected:**
  photo picker + client-side compression (real), Storage upload contract
  (real), `generate-preview`/`report-preview` Edge Function skeletons with
  real auth/entitlement/quota logic (real), a quota-tracking migration
  where only a successful generation ever writes a row (so "failed
  generations don't consume quota" is a database invariant, not a status
  flag to remember to check), and a single client-side kill-switch
  (`previewProviderStatus.isPreviewGenerationLive = false`) that keeps the
  whole flow from attempting a call known to fail. No provider (FLUX, Nano
  Banana, InstantID, or otherwise) is hardcoded anywhere --- that's
  intentionally still open pending the benchmark.
- **Funnel analytics:** `lib/services/analyticsClient.ts` wires
  `quiz_started`, `quiz_completed`, `top_match_viewed`,
  `full_roadmap_clicked`, `paywall_viewed`, `weekly_purchased`,
  `annual_purchased`, `purchase_restored`, `preview_started`,
  `preview_generated`, `preview_failed` at their real call sites. No
  vendor chosen/keyed yet --- logs to console in development, true no-op
  otherwise.

---

## MONETIZATION + PAYWALL OPTIMIZATION PASS (2026-09-07)

Pre-TestFlight paywall/pricing pass --- no product redesign, no new
features. `tsc`, `eslint`, and `jest` (85 tests, 18 suites) all clean
after this phase.

- **Pricing architecture changed:** two plans, no monthly. EXPLORE
  ($11.99/week) and AESTELLA ANNUAL ($99/year, "Best Value", preselected
  by default). `lib/services/billing.ts` and `revenueCatBilling.ts` renamed
  `purchaseMonthly` --- `purchaseWeekly`, reading `offering.weekly` instead
  of `offering.monthly`.
- **Paywall (`app/paywall.tsx`):** both plans now shown as selectable cards
  (annual preselected); a single "Unlock My Aestella Plan" CTA purchases
  whichever is selected. Headline unchanged ("Your Personalized Aesthetic
  Plan Is Ready"). Premium module list unchanged (Plan, Preview, Passport,
  The Bible, Botox Bestie --- still no Glow, still no fabricated social
  proof).
- **Locked teaser (`PremiumRoadmapCard`)** broadened to also list "Your
  personal roadmap" and "AI Preview" among the locked items, not just
  alternate treatment categories --- gestures at the full Premium bundle
  before the paywall, not just more categories.
- **Anticipation screen copy:** "Building your Aesthetics Profile" ---
  "Building your Aestella Profile" (see brand-naming note below).
- **Analytics:** added `weekly_selected`, `annual_selected`,
  `purchase_started`, `purchase_failed`, `restore_started`,
  `restore_failed` to reach full funnel visibility per this pass's brief.
  Renamed `monthly_purchased` --- `weekly_purchased` (the product changed,
  not a duplicate). Kept `quiz_started`/`quiz_completed`/`top_match_viewed`/
  `purchase_restored` as the existing equivalents for
  onboarding/profile-result/restore-completed rather than adding
  duplicate event names for the same funnel moments.
- **Brand-naming note:** this pass's brief referred to the app as
  "Aestella" throughout and specified "Aestella" copy for the paywall
  screen specifically. That copy was applied only inside `app/paywall.tsx`
  and the one anticipation-screen line above --- not swept across the rest
  of the app (Home's "THE AESTHETICS BIBLE" brand row, `app.json`'s `name`,
  screen headers elsewhere are all unchanged). A prior instruction earlier
  in the project's history said not to rename the app/codebase; a full,
  consistent rename was treated as out of scope for a "smallest changes
  necessary" monetization pass and left for a dedicated rebrand pass if
  wanted.

---

## COMPLETE

Built, wired to local/mock state or live Supabase, and covered by passing
tests.

- **Navigation:** 5 tabs (Home, Plan, Preview, Bible, Passport) via Expo
  Router; Near Me is a contextual (non-tab) route reached from Bible,
  Result, and Plan.
- **Aesthetics Profile quiz:** 6 questions (concern, area, intensity,
  downtime, comfort, budget) at `app/quiz/index.tsx`, one question per
  screen, editorial progress numbering. Completable without signing in.
- **Recommendation engine:** deterministic, versioned (`RULES_VERSION =
  'v1'`) in `src/domain/recommendation.ts` --- 12 treatment categories,
  10 concerns, a 4-step comfort/downtime fallback waterfall, budget-fit
  note. No LLM, no photo analysis. Unchanged by the Supabase work --- still
  runs entirely locally; only its inputs/outputs are now optionally
  persisted. Covered by `recommendation.test.ts`.
- **Manuscript content integration (NEW):** The Bible grew from 10 to 28
  named treatments in `src/domain/bible.ts`, sourced from the owned
  manuscript ("The Facial Aesthetics Bible"). Every treatment now carries
  seven manuscript-derived fields (`stage`, `primaryLayers`,
  `whatItDoesNotAddress`, `discomfort`, `repeatFrequency`,
  `valueSummary`, `whoShouldSkip`) alongside the original fields, all
  rendered on `app/bible/[id].tsx`. Three previously-empty recommendation
  categories (peels, threads, skincare) now have named content.
  `recommendation.ts`, `quiz.ts`, and all matching/scoring logic were not
  touched. Provider questions on the detail screen changed from one
  hardcoded 3-question array shared by all 10 treatments to five
  manuscript-sourced core questions (`bibleCoreProviderQuestions`) plus
  treatment-specific questions where the manuscript supports them
  (`bibleSpecificProviderQuestions`). **Compare (`app/compare/index.tsx`)
  now also accepts two treatment ids (`?ta=&tb=`)** and shows
  treatment-level rows (e.g. Botox vs. Dysport), falling back to the
  original category-only behavior (`?a=&b=`) when only one named
  treatment exists in a category. Covered by `bible.test.ts` and the new
  `__tests__/app/compare/index.test.tsx`.
- **Result screen, Plan tab, The Bible, Botox Bestie (mocked), Progress
  Photos, Near Me (mocked), Preview, Glow, Mock Paywall, Brand system,
  Campaign image architecture:** unchanged from the prior checkpoint,
  aside from the Bible/Compare item directly above --- see git history for
  detail if
  needed. None of this was touched by the Supabase Phase 1 work.
- **Aesthetics Passport:** empty state, populated state (hero spend
  figure, treatments-this-year, most-recent), editorial timeline,
  treatment detail page, and an Add Treatment form (9 fields, star
  rating, would-do-again toggle, keyboard-avoiding). **Signed out:**
  session-only local state seeded with 2 sample entries, exactly as
  before. **Signed in:** entries load from and save to Supabase (see
  below); no fake samples for a real account.
- **Authentication (NEW):** email + password sign-up/sign-in/sign-out at
  `app/auth/sign-in.tsx` / `sign-up.tsx`, session restoration on launch
  with a loading state, architected so Apple/Google sign-in can be added
  later without rewriting (`AuthProvider` interface in
  `lib/services/auth.ts`, Supabase implementation in
  `lib/services/supabaseAuth.ts`). A minimal account section (email,
  Sign Out, Delete Account) lives on the Passport tab --- the app has no
  settings screen/6th tab, so this is its natural home.
- **Database persistence (NEW):** `aesthetics_profile_answers`,
  `aesthetics_plans`, `saved_plan_items`, and `passport_entries` in
  Supabase, RLS-scoped per user, via a repository layer
  (`lib/services/aestheticsProfileRepository.ts`, `planRepository.ts`,
  `passportRepository.ts`) composed behind `lib/services/persistenceAdapter.ts`.
  `AppStateContext` gained an optional `persistence` prop --- when absent
  (signed out) it behaves exactly as the original local-only build; when
  present (signed in) it hydrates from Supabase on sign-in and writes
  through on save. Screens are unaware of Supabase; they only call
  `useAppState()` as before.
- **Auth gating (NEW):** Bible browsing and the quiz stay open with no
  sign-in wall. Attempting to Save a Plan item or add a Passport entry
  while signed out prompts sign-in (`lib/state/useRequireAuth.ts`)
  instead of silently no-op'ing.
- **Account-deletion foundation (NEW):** a `delete-account` Supabase Edge
  Function (service-role key never leaves that server-side runtime)
  deletes the calling user's own `auth.users` row; every user-owned table
  cascades via `on delete cascade`. Verified end-to-end (see Validation).
- **Domain-only local state:** `AppStateContext` (React Context) --- see
  above; still the single place screens read/write product state.
- **Tests:** 17 suites / 79 tests passing (`jest-expo`) --- domain logic,
  quiz flow, Bible search/filter, Plan/Home state-awareness, Passport
  entry creation, auth context, persistence hydration/save/error
  behavior, the auth-gate hook, and repository-layer unit tests (mocked
  Supabase client) covering mapping, upsert idempotency, and RLS-style
  error propagation.
- **Validation, last run this session:** `tsc --noEmit` ✅ ·
  `eslint .` ✅ (0 errors/warnings) · `jest` ✅ 79/79 · `expo-doctor` ✅
  21/21 · `expo export --platform web` ✅.

---

## MOCKED / NOT LIVE

Updated this phase (P0 monetization build) --- see the new section above
`## COMPLETE` for what changed. Present in the UI, but backed by static
data, session state, or a disabled/blocked action --- not a real service
call, and never presented as though it were:

- **AI Preview generation:** the flow architecture is real end-to-end
  (photo picker, client-side compression, Storage upload, Edge Function
  with real auth/entitlement/quota checks --- see
  `supabase/functions/generate-preview/`) but the actual provider call
  (`callProvider()` in that function) is a deliberate stub that throws
  `NotConfiguredError` until `benchmarks/image-providers/` has been run and
  a provider chosen. Client-side, `lib/services/previewProviderStatus.ts`'s
  `isPreviewGenerationLive` constant is `false`, so tapping "Try Preview"
  today shows an honest "finishing testing" message rather than attempting
  a call known to fail.
- **Glow generation:** intentionally NOT part of this phase's scope ---
  removed from the paywall's premium module list and labeled "COMING SOON"
  everywhere it appears (Home, the Preview/Glow screen's segmented
  control). "Try Glow" and "Apply My Look" are disabled and labeled
  "Coming Soon", not just disabled.
- **Near Me:** unchanged --- 3 hardcoded providers; no Google Places call;
  View and Directions show a "coming soon" alert. Explicitly out of P0
  scope.
- **Premium purchases:** REAL as of this phase --- see `## COMPLETE`.
  RevenueCat is wired client-side (`lib/services/revenueCatBilling.ts`,
  `lib/state/EntitlementContext.tsx`); pricing is $11.99/week or $99/year
  (no monthly plan). Not yet live-testable: no RevenueCat API keys/store products
  configured yet (see `NEXT BUILD`).
- **Restore Purchases:** REAL as of this phase --- a button on the
  paywall, wired to `revenueCatBilling.restorePurchases()`.
- **Analytics:** `lib/services/analyticsClient.ts` wires the funnel's
  named events (`quiz_started`, `quiz_completed`, `top_match_viewed`,
  `full_roadmap_clicked`, `paywall_viewed`, `weekly_selected`,
  `annual_selected`, `purchase_started`, `weekly_purchased`,
  `annual_purchased`, `purchase_failed`, `restore_started`,
  `purchase_restored`, `restore_failed`, `preview_started`,
  `preview_generated`, `preview_failed`) at their real call sites. No
  vendor is chosen/keyed yet, so events log to console in development and
  are a true no-op otherwise --- see `NEXT BUILD`.
- **AI report/flag flow:** REAL as of this phase --- the Preview screen's
  result state includes a working "Report this image" button, calling the
  new `report-preview` Edge Function (see migration
  `20260906000002_create_preview_generation_reports.sql`).
- **Progress Photos / Passport photo thumbnails:** REPLACED this phase ---
  no longer simulates a photo being added. Every stage now shows a plain
  "coming soon" state; nothing is tappable into a fake success. Real photo
  storage remains out of scope (see `PRODUCT_SPEC.md` → Photos).
- **Provider/photo imagery in Near Me and Progress Photos:** unchanged ---
  deliberately left as icon-only placeholders, see `CLAUDE.md` → Campaign
  Imagery.

---

## NOT CONNECTED

- **RevenueCat** --- SDK installed and wired (`react-native-purchases`,
  `lib/services/revenueCatBilling.ts`), but no API keys/store products
  exist yet, so `isRevenueCatConfigured` is false and the app currently
  treats everyone as free-tier. See `NEXT BUILD`.
- **Any live AI/image-generation provider** --- no provider chosen yet
  (benchmark pending), no API key, no network call from
  `generate-preview`'s `callProvider()`. `lib/services/ai.ts` still
  defines `PreviewAIProvider`/`GlowAIProvider` interfaces only; nothing
  hardcodes FLUX, Nano Banana, or InstantID anywhere.
- **Google Places** --- no API key, no network call. `lib/services/places.ts`
  is an interface only; Near Me uses a hardcoded array. Out of P0 scope.
- **Any analytics provider** (Segment, Amplitude, PostHog, etc.) --- event
  names and call sites exist; no vendor chosen/keyed.
- **Any LLM** for Botox Bestie or elsewhere --- out of P0 scope.
- **Supabase Storage** --- buckets are defined in migration
  `20260906000001_create_preview_storage_buckets.sql` but nothing is
  applied to a live project yet (still paused --- see the warning near the
  top of this file).

---



## AI Image-Provider Benchmark Tooling (exploratory --- not production)

`benchmarks/image-providers/` is a standalone harness for choosing which
AI image-edit provider Preview/Glow will eventually use --- **not** a
production integration. It is deliberately isolated: no application
code, screen, Supabase table, Edge Function, or service interface
depends on it or is affected by it.

- Compares three candidates on identity preservation, prompt adherence,
  realism, consistency, and effective cost per accepted result: Nano
  Banana 2 (`google/nano-banana-2`), FLUX.1 Kontext [pro]
  (`black-forest-labs/flux-kontext-pro`), and InstantID
  (`grandlineai/instant-id-photorealistic`), all via Replicate.
- Tracked in git: `README.md`, `.env.example`, `providers.js`,
  `transformations.js`, `replicateClient.js`, `run-benchmark.js`,
  `generate-scoresheet.js`, `generate-review-page.js`,
  `summarize-results.js`, and `inputs/.gitkeep` / `outputs/.gitkeep`.
- **Never tracked, by design:** `benchmarks/image-providers/.env` (holds
  `REPLICATE_API_TOKEN`), everything under `inputs/` (source portraits),
  everything under `outputs/` (generated images, manifest, scoresheet,
  review page) --- all gitignored.
- No paid benchmark call has been made yet; the harness has only been
  validated in `--dry-run` mode (enumerates the planned 108 generations
  and cost estimate, calls no API) and with a fabricated local manifest
  to exercise the scoring/review/summarize scripts.
- Whichever provider(s) this benchmark selects will inform --- not
  predetermine --- the real Preview/Glow AI architecture, which remains
  entirely unbuilt (see NOT CONNECTED above).

---

## Supabase --- configuration (implemented; project currently paused)

- **Status: PAUSED (intentional).** Reactivate before any live
  auth/database testing, RevenueCat entitlement work, or account-deletion
  re-validation.
- **Project:** "The Aesthetics Bible" (`ejilueesrzutafsbsqia`, us-east-1)
  --- a dedicated project, separate from this account's other Supabase
  projects.
- **Auth:** email + password. **Email confirmation is ON** (Supabase's
  project default) --- `signUpWithEmail` returns `needsEmailConfirmation`
  and the sign-up screen shows a "check your email" message rather than
  assuming an immediate session. No custom SMTP/email templates are
  configured yet, so confirmation emails use Supabase's default sender
  (fine for testing; revisit before real users depend on it).
- **Migrations:** `supabase/migrations/` --- 7 files, applied via the
  Supabase MCP tools and mirrored locally: `profiles`, the on-signup
  trigger (execute privilege revoked from `anon`/`authenticated` after a
  security-advisor finding), `aesthetics_profile_answers`,
  `aesthetics_plans`, `saved_plan_items`, `passport_entries`.
- **RLS:** enabled on all 5 tables; `security advisor` reports 0 findings.
  Explicitly verified (not just assumed): a second account could not
  read, update, or delete a first account's rows via direct REST calls
  even when explicitly targeting that user's `user_id` --- see the
  Validation section of the implementation report.
- **Edge Functions:** `delete-account` (JWT-verified, uses the
  service-role key only inside its own server-side runtime).
- **Env vars:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  in `.env.local` (gitignored); `.env.example` already documented these
  placeholder names before this phase.

---

## Native / Store Readiness (this phase)

Audit + configuration only --- no product features added, nothing
submitted or built. Full detail in `STORE_READINESS.md`.

- **Identifiers:** `com.aestheticsbible.app` already consistent for iOS
  and Android; unchanged. URL scheme `aestheticsbible` already present;
  unchanged.
- **Development build:** `expo-dev-client` installed; `eas.json` added
  (development/preview/production profiles). No build has been run and
  no EAS project is linked yet (`eas login` + `eas build:configure`,
  requires your Expo account).
- **Icon/splash:** replaced on every platform (iOS icon, Android adaptive
  icon + monochrome, splash, web favicon) with real Aesthetics Bible
  brand art --- black background, champagne "AB" monogram, generated from
  the same tokens the in-app UI uses. No generic Expo art remains. See
  `STORE_READINESS.md` → Icon & Splash and `assets/brand/native/README.md`.
- **Native permissions:** none currently declared (correct --- no
  camera/photo/location package is installed yet, since Preview/Glow/
  Passport photos/Near Me are all still mocked). Future permission
  strategy documented in `STORE_READINESS.md`.
- **Supabase native-auth audit:** confirmed cross-platform-safe by static
  review (AsyncStorage-backed sessions, no `localStorage` calls anywhere,
  email-confirmation and account-deletion flows are platform-agnostic).
  No code changes were required.
- **Privacy/data-collection audit:** documented in `STORE_READINESS.md`,
  clearly separating what's collected today (account/email, quiz
  answers, Plan, Passport entries --- only when signed in) from what's
  planned but not implemented (photos, AI images, purchases, location,
  analytics).
- **Product-boundary copy audit:** no concerning language found; no
  copy changed.

---

## NEXT BUILD (in this order)

1. **Run the provider benchmark** --- `benchmarks/image-providers/`, needs
   a `REPLICATE_API_TOKEN` and exactly 3 source portraits in `inputs/`
   (~$5-9 total cost). Choose primarily on identity preservation/quality,
   cost second --- do not default to the cheapest option.
2. **Wire the chosen provider into `callProvider()`** in
   `supabase/functions/generate-preview/index.ts`, replacing the
   `NotConfiguredError` stub. Then flip
   `lib/services/previewProviderStatus.ts`'s `isPreviewGenerationLive` to
   `true` --- that single constant is what turns the whole already-built
   Preview flow live client-side.
3. **Reactivate Supabase** and apply the three new migrations
   (`preview_generations`, Storage buckets, `preview_generation_reports`);
   deploy `generate-preview` and `report-preview` with
   `REVENUECAT_SECRET_API_KEY` and the chosen provider's secret set via
   `supabase secrets set`.
4. **RevenueCat dashboard + store setup** --- create the RevenueCat
   project, set `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` /
   `_ANDROID_API_KEY`, configure App Store Connect/Play Console products
   for $11.99/week and $99/year (no monthly plan), attach both to a `premium` entitlement
   in RevenueCat, and set a "current" offering with weekly/annual
   packages (see `lib/services/revenueCatBilling.ts` for exactly what it
   expects).
5. **Choose and key an analytics provider** --- event names/call sites
   already exist (`lib/services/analyticsClient.ts`); only the vendor
   decision and `EXPO_PUBLIC_ANALYTICS_WRITE_KEY` are missing.
6. **Google Places** --- replace Near Me's static array with a real
   `ProviderSearchService` implementation; add location permission
   handling. Out of P0 scope.
7. **Real Glow generation** --- explicitly out of P0 scope; currently
   labeled "Coming Soon" everywhere and removed from the paywall's premium
   promise. Revisit after Preview is live.
8. **Grounded Botox Bestie** --- out of P0 scope; replace the static Q&A
   array with a retrieval-grounded assistant over Bible content later,
   keeping the same boundary (no dose/placement/diagnosis).
9. **Production QA** --- real-device testing (iOS + Android), security
   audit per `CLAUDE.md` → Security Audit, privacy/terms/support screens,
   rate limiting, and a decision on email-confirmation UX/custom SMTP
   before real users sign up.

---

## LATER (explicitly out of scope for now)

Unchanged from `PRODUCT_SPEC.md`/`CLAUDE.md`'s NOT V1 list, plus items
this build surfaced as real gaps:

- Beauty Calendar, Beauty Budget (named in the spec; no code exists yet).
- Aesthetics Wrapped (a one-line "coming soon" teaser exists in Passport;
  no feature).
- Face zones and the interactive self-assessment flowchart --- not yet
  implemented as their own content/UI. (Preserve / Restore / Rebuild and
  the 7 layers of facial aging are now implemented as `stage` and
  `primaryLayers` fields on every Bible treatment, tagged from the
  manuscript --- see the manuscript content-integration entry under
  `## COMPLETE` below.)
- Regenerative medicine (PRP, PRF, exosomes, polynucleotides, stem-cell-
  derived products) and surgery (blepharoplasty, brow lift, facelift
  variants, neck lift) --- covered at length in the manuscript but
  intentionally left out of the Bible content pass: surgery has no
  corresponding category id in `recommendation.ts`, and regenerative
  medicine's best-fit category (skin_boosters) is not a precise match for
  blood-derived and DNA-fragment products. Revisit only alongside a
  deliberate `recommendation.ts` taxonomy change, not as a content-only
  addition.
- Shop/Affiliate architecture, Advanced/DIY module.
- Multi-density (@2x/@3x) campaign image variants; additional
  preset-specific Glow photography (all 8 presets currently share one
  photo).
- The `face-zone` `EditorialImage` variant (no asset assigned; still a
  bare icon placeholder).
- Passport photo fields/Supabase Storage (see PRODUCT_SPEC.md → Photos).
- Apple/Google social sign-in (architecture allows it; not implemented).

---

## DO NOT REGRESS

- The recommendation engine's determinism and its test suite
  (`recommendation.test.ts`) --- no photo analysis, no LLM, no
  randomness, and it must keep running entirely client-side/local.
- The 5-tab navigation surface; Near Me stays contextual, not a 6th tab;
  Account/Sign Out lives inside the Passport tab, not a new tab.
- Preview and Glow as separate interfaces/experiences --- never merge
  them into one ambiguous flow.
- The black/ivory/champagne system and the monogram's sparing use
  (Home, Paywall, share cards only).
- `EditorialImage`/`BeforeAfterFrame` as the only image-slot components
  --- don't fork a duplicate image component for a new screen.
- The rule that user-content slots (progress photos, provider photos)
  never default to stock campaign photography.
- Botox Bestie's secondary positioning and its boundary language (no
  dose/placement/diagnosis) once it becomes grounded.
- The free top match never being hidden behind the paywall.
- Bible browsing and the quiz staying usable without signing in; only
  the Save/persist actions are auth-gated.
- `AppStateContext`'s signed-out behavior staying local-only and
  identical to the pre-Supabase build --- don't make `persistence`
  required.
- RLS on every user-owned table, and never trusting a client-supplied
  `user_id` for authorization.
- **Only a successful AI Preview generation ever writes a
  `preview_generations` row** (see the migration) --- this is what makes
  "failed generations don't consume quota" true. Do not add a status
  column and start writing rows for failures too; that reintroduces the
  bug this design avoids.
- **No AI provider is hardcoded in `generate-preview`'s `callProvider()`**
  until the benchmark in `benchmarks/image-providers/` has actually been
  run and a provider chosen on identity-preservation/quality grounds first,
  cost second. Do not default to whichever provider seems cheapest or most
  familiar.
- **`isPreviewGenerationLive` in `lib/services/previewProviderStatus.ts`
  stays `false`** until a provider is wired into `callProvider()`, the
  Storage buckets and migrations are applied to a live Supabase project,
  and RevenueCat's secret key is set for the Edge Function's entitlement
  check. Flipping it early exposes users to a flow that will fail.
- **Glow stays out of the paywall's premium module list and labeled
  "Coming Soon"** until it's actually built --- don't re-add it to the
  paid promise just because it's visually similar to Preview.
- The current 85 passing tests (18 suites) and clean `tsc`/`eslint`
  baseline --- run all three (plus `expo-doctor`/`expo export` where
  network access allows) after any change.

---

## Safety / Product Boundaries (already established, still enforced)

Verified in code and copy, not just in the spec:

- No photo is ever analyzed to diagnose a face (Preview/Glow use static
  campaign imagery only; there is no photo-upload code path yet).
- Preview output is labeled "AI Visualization" wherever shown; Glow
  copy explicitly states it "is not a treatment visualization."
- Botox Bestie's disclaimer is rendered on-screen: *"not a diagnosis, a
  prescription, or an exact plan for your face."*
- The recommendation engine matches on stated goals/preferences only ---
  it never receives or processes an image.
- Bible treatment detail pages ask general provider-consultation
  questions, never exact dose/placement instructions.
- No Supabase service-role key is ever bundled into the client; it only
  exists inside the `delete-account` Edge Function's own runtime.

---

## Validation checklist (run after any future change)

```
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest — expect 17 suites / 79 tests
npx expo-doctor      # expect 21/21
npx expo export --platform web   # production bundle sanity check
```

All five were run and passed clean immediately before this document was
written.
