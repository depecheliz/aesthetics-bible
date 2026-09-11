# THE AESTHETICS BIBLE — Audit Report

Run date: September 4, 2026
Scope: PASS 1 (audit), PASS 2 (safe P0 fix), PASS 3 (readiness checklists)

---

## 1. EXECUTIVE STATUS

This is a genuinely early-stage app, not a feature-complete one that just needs polish. The core loop — quiz, recommendation engine, Bible library, Plan, Passport, auth, and Supabase persistence with RLS — is real, tested, and working. Everything past that core loop (Preview/Glow AI, Botox Bestie, Near Me, Passport photos, and the entire paywall/subscription layer) is intentionally mocked or not connected at all — no RevenueCat, no image AI provider, no Google Places, no Supabase Storage. This isn't hidden: `BUILD_STATUS.md` in the repo already documents this accurately, and I verified its claims rather than trusting them blind. The codebase itself is clean — `tsc`, `eslint`, and `expo-doctor` all pass, and RLS policies are correctly scoped with no exposed secrets. The honest gap between "TestFlight-able" and "App Store launch-able" is entirely the subscription/paywall layer and a handful of product decisions on what ships in V1 vs. gets hidden.

## 2. READINESS SCORE

- **TestFlight readiness: ~70%.** The blockers are a real device/simulator build (not verifiable from this environment), a decision on what to do with the mocked features so they don't look broken, and reactivating the paused Supabase project.
- **App Store readiness: ~25%.** Blocked mainly by: no real subscription system (Apple will reject a "Coming Soon" paywall if it's presented as a purchasable product), no privacy policy/support URL, no App Store Connect setup, and founder-only steps (certificates, product IDs, screenshots).

## 3. WHAT IS WORKING (verified this session, not assumed)

- `tsc --noEmit` — clean, 0 errors.
- `eslint .` — clean, 0 errors/warnings.
- `expo-doctor` — 19/21 checks pass; the 2 failures are network-dependent checks that can't reach `exp.host` from this sandboxed environment, not app defects.
- Jest suite — mostly passing; see finding below on 2 flaky/slow integration tests.
- Supabase RLS — read every migration file directly. All 5 user-owned tables (`profiles`, `aesthetics_profile_answers`, `aesthetics_plans`, `saved_plan_items`, `passport_entries`) have RLS enabled with `user_id = auth.uid()` scoping on select/insert/update/delete. No policy lets a user touch another user's row. The `profiles` table intentionally has no client insert/delete policy — rows are created only by a `security definer` trigger, and that trigger has had `EXECUTE` revoked from `anon`/`authenticated` (a deliberate hardening step, not an oversight).
- `delete-account` Edge Function — service-role key stays server-side, JWT-verified, deletes only the calling user's own `auth.users` row, and every table cascades via `ON DELETE CASCADE`. This is correctly built.
- No secrets in client code — grepped for service-role keys, Replicate tokens, and other secret patterns across `app/`, `lib/`, `src/`, `components/`, `constants/`. Only the Supabase anon key (public-safe by design) is present in `.env.local`, and `.gitignore` correctly excludes `.env.local` from version control.
- Recommendation engine — deterministic, versioned (`RULES_VERSION = 'v1'`), runs entirely client-side with no photo analysis or LLM involved. This matters for the "no diagnosis" safety boundary Apple will scrutinize.
- Auth-gating — Bible and quiz are usable signed-out; only Save/persist actions require sign-in, which is the right pattern for time-to-value.

## 4. WHAT IS MOCKED

Confirmed by reading the actual code, not just the docs:

- **Paywall** (`app/paywall.tsx`) — pressing either plan shows an `Alert.alert('Coming Soon', ...)`. No RevenueCat SDK is installed (`package.json` has no `react-native-purchases`). No entitlement concept exists anywhere in the app — Premium content is not actually gated client-side or server-side.
- **Preview / Glow** — static campaign photography; buttons are disabled. No image generation call exists.
- **Near Me** — 3 hardcoded providers; "View" and "Directions" show a "coming soon" alert. No Google Places integration.
- **Botox Bestie** — static Q&A array, not an LLM.
- **Passport photos** — "Add Photo" flips a local boolean; no camera, no photo library, no file ever touches disk or Supabase Storage (no Storage bucket exists at all).
- **Restore Purchases** — did not exist as a UI element, yet the paywall footer claimed "Restore purchases from your account settings." I fixed this (see Section 14) — it's a factually false claim on a screen Apple reviewers read closely.
- **Analytics** — `lib/services/analytics.ts` exports a no-op implementation only.

## 5. WHAT IS BROKEN

Only what I could actually verify failing:

- **2 integration tests fail on timeout in this sandboxed environment**: `__tests__/app/smoke.test.tsx` (rendering the quiz Result screen) and `__tests__/app/quiz/index.test.tsx` (full quiz completion flow) both exceed Jest's default 5000ms render timeout. Individual test files here took 15–40 seconds to run — this environment (a remote device bridge) is unusually slow for React Native rendering, so I can't tell you with confidence whether this is a real hang in the app or purely an artifact of this sandbox. `BUILD_STATUS.md` claims 79/79 passed as of its last local run, which is plausible on normal hardware. **Action needed:** re-run `npm test` on your actual development machine and tell me if these two still fail there — if they do, it's a real bug in how the quiz/result screens mount under test; if they pass locally, this finding is sandbox noise and can be ignored.
- Nothing else failed. No crashes found, no broken imports, no exposed secrets, no RLS gaps.

## 6. P0 BLOCKERS (TestFlight)

1. **Supabase project is paused.** `BUILD_STATUS.md` confirms this is intentional (to conserve free-tier project slots), but it means auth/persistence cannot be live-tested right now. Reactivate before any TestFlight build.
2. **No real device/simulator build has been run** (confirmed — `BUILD_STATUS.md` states no EAS build has been triggered and no EAS project is linked). This audit was code-level only; I have no way to verify runtime behavior, visual layout, keyboard handling, or native permissions from this environment. This needs an actual `eas build --profile development` or `--profile preview` run.
3. **Confirm the 2 timeout test failures** above aren't a real quiz/result-screen hang before shipping.

No client-exposed secrets, no RLS gaps, no crash-on-launch code paths were found — so the "usual" P0s (broken auth, exposed keys, broken database access) are clean.

## 7. P1 ITEMS (public launch blockers)

1. **No subscription system.** This is the single largest gap between "app exists" and "app can charge money." Needs RevenueCat SDK, App Store Connect subscription products, entitlement checks, and a real Restore Purchases flow.
2. **Paywall makes a promise it can't keep.** Fixed the "Restore purchases from your account settings" line this session (Section 14) since it described a feature that doesn't exist.
3. **No password reset flow.** I grepped the whole app for password-reset code and found none — only sign-up/sign-in exist. Not fixing this without your say-so since it touches Supabase email templates/deep links, but flagging it as a real pre-launch gap: a user who forgets their password has no recovery path.
4. **No privacy policy URL, support URL, or terms.** Required by App Store Connect; none exist in the repo (no privacy-policy screen, no static page).
5. **Photo privacy is currently moot but will become P0 the moment Passport photos ship** — there's no Storage bucket yet, so there's nothing to audit there today, but this needs a signed-URL, user-scoped-path design before any real photo upload code is written.
6. **Mocked features need explicit V1 decisions** (see Section 8) so nothing "coming soon" ships looking finished — Apple review risk otherwise.

## 8. RECOMMENDED V1

Ship: Quiz → Recommendation → Plan → The Bible → Compare → Passport (text-only entries, no photos) → Auth (sign up/in/out, account deletion) — this is the real, working, tested core.

Do not ship as visible/interactive in V1 unless you decide to fund the build-out first: Preview/Glow (hide or clearly label "Coming Soon" as a locked teaser, not a disabled button that looks broken), Near Me (either hide the tab entry point or replace with a simple "search nearby providers" link out to Maps rather than fake hardcoded listings), Botox Bestie (fine to keep as a static, clearly-scoped FAQ if the copy is honest about it not being a live chat — currently it's presented as Q&A, so confirm the copy doesn't imply it's conversational/live), Passport photos (hide "Add Photo" entirely rather than a fake toggle), Paywall (do not submit for App Store review with a fake "Coming Soon" purchase button — Apple will reject this under guideline 3.1.1 if premium features are referenced as purchasable; either finish RevenueCat or remove pricing UI and ship V1 fully free).

## 9. HIDE UNTIL V1.1

RevenueCat/paid subscriptions (unless funded now), Preview/Glow AI generation, Google Places-backed Near Me, grounded Botox Bestie (LLM), Passport photo capture/storage, analytics provider, social sign-in (Apple/Google) — architecture allows it later, not implemented.

## 10. SECURITY FINDINGS

- **RLS: no findings.** Every user-owned table is correctly scoped; verified by reading policy SQL directly, not by trusting docs.
- **Secrets: no findings.** No service-role key, Replicate token, or other secret is bundled client-side; `.env.local` holds only the public anon key; `.gitignore` correctly excludes it.
- **Account deletion: no findings.** Server-side, JWT-verified, cascades correctly.
- **Photos: not applicable yet** — no Storage bucket exists, so there's no photo exposure risk today. This becomes a P0 audit item the moment photo upload code is written.
- One paywall-copy issue was a trust/honesty finding, not a security one — fixed (Section 14).

## 11. SUBSCRIPTION STATUS

RevenueCat: not installed, not configured, no entitlement concept anywhere in the app. `lib/services/billing.ts` is an interface only — this is scaffolding for later work, not a partial integration. Nothing here is "partially configured" — it's a clean not-started state. Treat the whole subscription layer as a from-scratch build.

## 12. APPLE REVIEW RISKS (ranked)

1. **High — Paywall references purchasable content with no working purchase mechanism.** Apple explicitly tests IAP flows; a "Coming Soon" alert on a priced screen is a near-certain rejection if submitted as-is. Mitigation: either finish RevenueCat + real IAP products, or strip pricing/purchase UI entirely for a free V1.
2. **High — Mocked features that look real** (Near Me hardcoded providers, Preview disabled buttons, fake photo toggle). Apple review guideline 4.2 (minimum functionality) and general "no placeholder content" scrutiny apply. Mitigation: hide or clearly label as not-yet-available rather than presenting broken/fake interactions.
3. **Medium — Account deletion.** Currently correctly implemented, satisfies Apple's requirement — no action needed, just don't regress it.
4. **Medium — Health/beauty claims.** I did not do a full line-by-line copy scan of every Bible entry this session (that's a real Phase 42 task worth a dedicated pass), but the recommendation engine and Botox Bestie disclaimer language documented in `BUILD_STATUS.md` ("not a diagnosis, a prescription, or an exact plan for your face") is the right posture. Worth a dedicated copy-review pass before submission.
5. **Low — Missing privacy policy/support URLs.** Required metadata, not a functional risk, but blocks submission entirely if absent.

## 13. FOUNDER ACTIONS (external, can't be done from the repo)

- Reactivate the paused Supabase project before any live testing.
- Apple Developer account: App ID, certificates/profiles, App Store Connect app record.
- Decide and configure RevenueCat (if funding the subscription build): account, products, entitlements, offerings.
- Create App Store Connect subscription products matching whatever RevenueCat entitlements you land on.
- Write and host a privacy policy URL and support URL.
- Take App Store screenshots once the UI is final.
- Write App Review notes/demo account instructions if login is required for review.
- Run `eas login` + `eas build:configure` (needs your Expo account) and trigger an actual `eas build` — I have no way to produce or verify a real iOS/Android build from this session.
- Re-run `npm test` on your own machine and confirm whether the 2 timeout failures reproduce (Section 5).

## 14. CHANGES I MADE

- `app/paywall.tsx` — removed the false claim "Restore purchases from your account settings" (no such feature exists anywhere in the app) and replaced it with an honest "Premium purchases are coming soon." line. Verified `tsc --noEmit` stays clean after the change. This was the only change I made — everything else in Sections 6–9 is a product/scope decision that belongs to you (per the audit's own rule: don't fabricate or finish functionality without a founder decision), not a safe automatic fix.

## 15. TEST RESULTS (actual output from this session)

```
tsc --noEmit        → PASS (0 errors), re-verified after the paywall fix
eslint .             → PASS (0 errors/warnings)
expo-doctor          → 19/21 passed; 2 failures are network checks unreachable
                        from this sandbox (exp.host), not app defects
jest (partial runs, this environment is slow — 15–40s per file):
  PASS  src/domain/recommendation.test.ts
  PASS  src/domain/bible.test.ts
  PASS  lib/services/passportRepository.test.ts
  PASS  lib/services/aestheticsProfileRepository.test.ts
  PASS  lib/services/planRepository.test.ts
  PASS  lib/state/AppStateContext.persistence.test.tsx
  PASS  lib/state/AuthContext.test.tsx
  PASS  lib/state/useRequireAuth.test.tsx
  PASS  components/media/EditorialImage.test.tsx
  FAIL  __tests__/app/smoke.test.tsx        (5000ms render timeout)
  FAIL  __tests__/app/quiz/index.test.tsx   (5000ms render timeout)
  Not run this session: __tests__/app/(tabs)/bible.test.tsx,
    __tests__/app/(tabs)/index.test.tsx, __tests__/app/(tabs)/plan.test.tsx,
    __tests__/app/passport/add.test.tsx — full suite exceeded this
    environment's execution time budget across repeated attempts
```

## 16. TESTFLIGHT CHECKLIST

- [x] TypeScript clean
- [x] Lint clean
- [x] expo-doctor clean (excluding network-only checks)
- [x] RLS verified secure
- [x] No client-side secrets
- [x] Account deletion works (verified in code; not live-tested against a running backend since Supabase is paused)
- [ ] Tests fully pass — 2 integration tests need re-verification on real hardware
- [ ] Supabase project reactivated and live-tested
- [ ] Real EAS build produced and installed on a device
- [ ] Mocked features hidden or honestly labeled (not yet done — needs your V1 decisions from Section 8)
- [ ] No visible "Coming Soon" purchase buttons if submitting for review (still present on paywall)

## 17. APP STORE CHECKLIST

- [ ] Subscription system built and tested (RevenueCat + App Store Connect products)
- [ ] Restore Purchases implemented
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Screenshots
- [ ] App Store Connect metadata
- [ ] Reviewer instructions / demo account if needed
- [ ] Final copy review for medical/beauty claims
- [ ] Password reset flow
- [x] Account deletion (done)
- [x] RLS / data security (done)

## 18. NEXT THREE ACTIONS

1. Reactivate the Supabase project and run `eas build --profile development` (or `preview`) to get this on a real device — everything in this audit was code-level; you need to see it run.
2. Decide, screen by screen, which of Preview/Glow/Near Me/Botox Bestie/Passport photos get hidden vs. shipped-honest for V1 (Section 8) — this is the highest-leverage decision blocking a clean App Store submission.
3. Decide whether V1 ships free (fastest path to TestFlight) or with real RevenueCat subscriptions (bigger lift, but needed before charging anyone) — this determines whether the paywall screen ships at all in the first release.
