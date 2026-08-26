# BUILD_STATUS.md --- THE AESTHETICS BIBLE

**Purpose:** a concise, accurate operational handoff before backend
integration begins. This is a status snapshot, not a product definition
--- see `PRODUCT_SPEC.md` for the product and `CLAUDE.md` for the rules.
Every claim below was verified against the current codebase.

**Last known-good Git checkpoint:** `b00695c` --- *"feat: complete
branded luxury UI and image architecture"*

> ⚠️ The working tree currently has **uncommitted changes** on top of
> that checkpoint: the campaign image integration (`assets/brand/campaign/`,
> `EditorialImage` local-asset support, per-variant default photos, the
> pre-composed Preview before/after image, and wiring across
> Home/Preview/Paywall/Botox Bestie/Passport). This work is complete and
> validated but intentionally not committed yet, pending your visual
> review. Commit it before starting backend work so the checkpoint
> reflects what's actually in the app.

---

## COMPLETE

Built, wired to local/mock state, and covered by passing tests.

- **Navigation:** 5 tabs (Home, Plan, Preview, Bible, Passport) via Expo
  Router; Near Me is a contextual (non-tab) route reached from Bible,
  Result, and Plan.
- **Aesthetics Profile quiz:** 6 questions (concern, area, intensity,
  downtime, comfort, budget) at `app/quiz/index.tsx`, one question per
  screen, editorial progress numbering.
- **Recommendation engine:** deterministic, versioned (`RULES_VERSION =
  'v1'`) in `src/domain/recommendation.ts` --- 12 treatment categories,
  10 concerns, a 4-step comfort/downtime fallback waterfall, budget-fit
  note. No LLM, no photo analysis. Covered by `recommendation.test.ts`.
- **Result screen:** hero image, "why this matched you" compact summary,
  full free top match (name, best-suited-for, downtime, cost, longevity,
  budget note), Learn/Preview/Find Near Me/Save actions, a locked
  "Complete Aesthetics Roadmap" teaser, and a "My Aesthetics Profile"
  share-card concept.
- **Plan tab:** empty state (quiz CTA) and completed state (top match,
  saved items, alternates, same locked-roadmap teaser) driven by the same
  recommendation result --- no second recommendation engine.
- **The Bible:** `src/domain/bible.ts` --- 10 named treatments (Botox,
  Dysport, Fillers, Sculptra, RF Microneedling, Ultherapy, Sofwave,
  IPL/BBL, Laser Resurfacing, Microneedling) mapped to the 12 categories,
  7 browsing concerns, search, category filters, a numbered "Treatment
  Index," a "Most Explored" teaser, and one curated Compare link. Covered
  by `bible.test.ts` and `bible.test.tsx`.
- **Bible treatment detail pages:** hero image, overview, aliases, thin
  editorial info rows, provider questions, and Compare / Ask Bestie /
  Find Near Me actions. Compare pairing is resolved automatically via
  `findComparableCategoryId` (reuses recommendation data; no hardcoded
  pair list).
- **Compare screen:** side-by-side category comparison at `/compare`.
- **Botox Bestie (mocked):** `/botox-bestie` --- 5 curated Q&A pairs from
  `src/domain/botoxBestie.ts`, accordion UI, visible boundary disclaimer.
  Entry points from Home (teaser module, placed above the Discover
  modules), the Bible tab, and every Bible treatment detail page. No LLM.
- **Aesthetics Passport:** empty state, populated state (hero spend
  figure, treatments-this-year, most-recent), editorial timeline,
  treatment detail page, and an Add Treatment form (9 fields, star
  rating, would-do-again toggle, keyboard-avoiding). Backed by local
  state seeded with 2 sample entries.
- **Progress Photos:** `/passport/photos` --- Baseline / 2 Weeks / 1
  Month / 3 Months mock stages, a "Create Progress Story" concept
  (unlocks after 2+ photos, itself still mocked), explicitly separated
  from Preview/Glow.
- **Near Me (mocked):** 3 static sample providers shaped exactly like the
  future `ProviderResult` type, with View/Save/Directions actions (Save
  persists to session state; View/Directions show a "coming soon" alert).
- **Preview:** hero image, 6 visual goal chips, a 3-step Subtle↔Enhanced
  control, and a pre-composed before/after visualization image. Clearly
  labeled "AI Visualization" throughout. "Try Preview" is disabled (no
  live generation).
- **Glow:** distinct mode within the same Preview tab (`?mode=glow`
  deep-link supported) --- 8 preset tiles, a "My Natural Look" concept
  card, export-destination chips. "Try Glow" / "Apply My Look" disabled.
- **Mock Paywall:** `$99/year` (hero, "$8.25/month" framing) and
  "$14.99/month" secondary, matching `CLAUDE.md`'s launch test exactly.
  6 Premium modules listed (Plan/Preview/Glow/Passport/Bible/Botox
  Bestie). Pressing a plan shows a "Coming Soon" alert --- no purchase
  processed, no RevenueCat.
- **Brand system:** black/espresso/ivory/champagne palette, Playfair
  Display + Montserrat, thin-rule editorial layout, "AB" monogram
  (`components/brand/Monogram.tsx`) used at Home, Paywall, and share
  cards only.
- **Campaign image architecture:** `assets/brand/campaign/` (8 optimized
  JPEGs, 52--116KB each, resized from 1.6--2.5MB originals via
  `scripts/optimize-campaign-images.js`), surfaced only through
  `EditorialImage` (per-variant default photo, local-asset support,
  aspect-ratio override) and `BeforeAfterFrame` --- no duplicate image
  components. *(Uncommitted --- see banner above.)*
- **Domain-only local state:** `AppStateContext` (React Context,
  session-only, no persistence) holds quiz answers, the computed
  result, saved plan items, saved provider ids, and Passport entries.
- **Tests:** 10 suites / 54 tests passing (`jest-expo`) --- domain logic,
  quiz flow, Bible search/filter, Plan/Home state-awareness, Passport
  entry creation, and a render-smoke pass over every screen without a
  dedicated behavioral test.
- **Validation, last run this session:** `tsc --noEmit` ✅ ·
  `eslint .` ✅ (0 errors/warnings) · `jest` ✅ 54/54 · `expo-doctor` ✅
  21/21 · `expo export --platform web` ✅.

---

## MOCKED / NOT LIVE

Present in the UI, but backed by static data, session state, or a
disabled/alert action --- not a real service call.

- **Authentication:** none. No login/signup screen exists; there is no
  concept of a logged-in user anywhere in the app.
- **Persistence:** none beyond in-memory React state. Closing the app
  loses everything (quiz answers, saved items, Passport entries added
  during the session).
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
  no photo library, no file is ever touched.
- **Provider/photo imagery in Near Me and Progress Photos:** deliberately
  left as icon-only placeholders (not stocked with campaign photography)
  because they represent a business's or a user's own content --- see
  `CLAUDE.md` → Campaign Imagery.

---

## NOT CONNECTED

No code path in this repo talks to any of these. Confirmed by searching
the codebase for live client usage --- only interface/type definitions
exist in `lib/services/`.

- **Supabase** --- no client initialized, no auth, no database, no
  storage. `lib/services/auth.ts` and `storage.ts` are interfaces only.
- **RevenueCat** --- no SDK installed, no entitlement checks anywhere.
  `lib/services/billing.ts` is an interface only.
- **Google Places** --- no API key, no network call. `lib/services/places.ts`
  is an interface only; Near Me uses a hardcoded array.
- **Any live AI/image-generation provider** --- no API key, no network
  call. `lib/services/ai.ts` defines `PreviewAIProvider`/`GlowAIProvider`
  interfaces only.
- **Any analytics provider** (Segment, Amplitude, PostHog, etc.).
- **Any LLM** for Botox Bestie or elsewhere.

---

## NEXT BUILD (in this order)

1. **Supabase** --- auth, RLS-scoped tables for quiz answers/plan/Passport/
   saved items, replacing `AppStateContext`'s in-memory state with
   persisted, per-user data. Wire `lib/services/auth.ts` and `storage.ts`.
2. **RevenueCat** --- real entitlement checks behind `lib/services/billing.ts`;
   gate Premium content server-verifiably, not just visually; wire
   Restore Purchases.
3. **Google Places** --- replace Near Me's static array with a real
   `ProviderSearchService` implementation; add location permission
   handling.
4. **Preview/Glow AI** --- real server-side image generation behind
   `PreviewAIProvider`/`GlowAIProvider`; quotas, rate limits, cost
   telemetry, and the report/flag flow per `CLAUDE.md` → AI Calls.
5. **Grounded Botox Bestie** --- replace the static Q&A array with a
   retrieval-grounded assistant over Bible content, keeping the same
   boundary (no dose/placement/diagnosis) and the same secondary
   positioning relative to the master brand.
6. **Production QA** --- real-device testing (iOS + Android), security
   audit per `CLAUDE.md` → Security Audit, account deletion, privacy/
   terms/support screens, rate limiting, analytics provider.

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

---

## DO NOT REGRESS

- The recommendation engine's determinism and its test suite
  (`recommendation.test.ts`) --- no photo analysis, no LLM, no
  randomness.
- The 5-tab navigation surface; Near Me stays contextual, not a 6th tab.
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
- The current 54 passing tests and clean `tsc`/`eslint`/`expo-doctor`
  baseline --- run all four after any change.

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

---

## Validation checklist (run after any future change)

```
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest — expect 10 suites / 54 tests
npx expo-doctor      # expect 21/21
npx expo export --platform web   # production bundle sanity check
```

All five were run and passed clean immediately before this document was
written.
