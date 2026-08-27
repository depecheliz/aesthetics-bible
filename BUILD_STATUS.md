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
- **Result screen, Plan tab, The Bible, Bible detail pages, Compare,
  Botox Bestie (mocked), Progress Photos, Near Me (mocked), Preview,
  Glow, Mock Paywall, Brand system, Campaign image architecture:**
  unchanged from the prior checkpoint --- see git history for detail if
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

Present in the UI, but backed by static data, session state, or a
disabled/alert action --- not a real service call.

- **Preview / Glow generation:** no image is ever generated. The hero
  and preset images are static campaign photography; "Try Preview,"
  "Try Glow," and "Apply My Look" are disabled buttons.
- **Near Me:** 3 hardcoded providers; no Google Places call; View and
  Directions show a "coming soon" alert.
- **Premium purchases:** the paywall is fully mocked; tapping either
  plan shows an alert and changes nothing. There is no entitlement
  concept anywhere in the app (Premium content isn't actually gated).
- **Restore Purchases:** does not exist as a UI element yet.
- **Analytics:** `lib/services/analytics.ts` exports only a `noopAnalytics`
  implementation. No events are actually recorded or sent anywhere.
- **AI report/flag flow:** the `PreviewAIProvider`/`GlowAIProvider`
  interfaces define `reportGeneration()`, but no screen calls it --- there
  is no "report this image" UI.
- **Progress Photos / Passport photo thumbnails:** tapping "Add Photo"
  just flips a local boolean to simulate a photo existing --- no camera,
  no photo library, no file is ever touched, no Supabase Storage.
- **Provider/photo imagery in Near Me and Progress Photos:** deliberately
  left as icon-only placeholders (not stocked with campaign photography)
  because they represent a business's or a user's own content --- see
  `CLAUDE.md` → Campaign Imagery.

---

## NOT CONNECTED

- **RevenueCat** --- no SDK installed, no entitlement checks anywhere.
  `lib/services/billing.ts` is an interface only.
- **Google Places** --- no API key, no network call. `lib/services/places.ts`
  is an interface only; Near Me uses a hardcoded array.
- **Any live AI/image-generation provider** --- no API key, no network
  call. `lib/services/ai.ts` defines `PreviewAIProvider`/`GlowAIProvider`
  interfaces only.
- **Any analytics provider** (Segment, Amplitude, PostHog, etc.).
- **Any LLM** for Botox Bestie or elsewhere.
- **Supabase Storage** --- no bucket exists; photo uploads are explicitly
  out of scope for this phase (see PRODUCT_SPEC.md → Photos when that
  phase starts).

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

1. **RevenueCat** --- real entitlement checks behind `lib/services/billing.ts`;
   gate Premium content server-verifiably, not just visually; wire
   Restore Purchases. Requires Supabase reactivated for entitlement
   testing; App Store Connect/Play Console product setup can start
   while it's still paused (see `STORE_READINESS.md`).
2. **Google Places** --- replace Near Me's static array with a real
   `ProviderSearchService` implementation; add location permission
   handling.
3. **Preview/Glow AI** --- real server-side image generation behind
   `PreviewAIProvider`/`GlowAIProvider`; quotas, rate limits, cost
   telemetry, and the report/flag flow per `CLAUDE.md` → AI Calls. Needs
   Supabase Storage for private photo upload first.
4. **Grounded Botox Bestie** --- replace the static Q&A array with a
   retrieval-grounded assistant over Bible content, keeping the same
   boundary (no dose/placement/diagnosis) and the same secondary
   positioning relative to the master brand.
5. **Production QA** --- real-device testing (iOS + Android), security
   audit per `CLAUDE.md` → Security Audit, privacy/terms/support screens,
   rate limiting, analytics provider, and a decision on email-confirmation
   UX/custom SMTP before real users sign up.

---

## LATER (explicitly out of scope for now)

Unchanged from `PRODUCT_SPEC.md`/`CLAUDE.md`'s NOT V1 list, plus items
this build surfaced as real gaps:

- Beauty Calendar, Beauty Budget (named in the spec; no code exists yet).
- Aesthetics Wrapped (a one-line "coming soon" teaser exists in Passport;
  no feature).
- The full "Preserve / Restore / Rebuild" framework, seven layers of
  facial aging, face zones, and self-assessment content --- The Bible's
  current 10 treatments/7 concerns don't yet implement these source-book
  structures.
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
- The current 79 passing tests and clean `tsc`/`eslint`/`expo-doctor`
  baseline --- run all five after any change.

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
