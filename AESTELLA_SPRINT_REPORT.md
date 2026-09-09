# Aestella — P0 UI/UX Polish Sprint Report

**Base commit:** `5854e4eafebcd799d27bfc58ce90a7e1f37f4d1f` (branch `master`, working tree was clean before this sprint).
**Status:** All P0 items complete. P1 items complete. Verification complete. **Not committed or pushed** — stopped for review as instructed.

Three corrections from your message were applied instead of the audit's literal wording, per your explicit direction:
- P0-1 removes the auto-paywall entirely rather than retiming it.
- The image plan uses a small curated/rotating set of recurring subjects, not 28 unique photos.
- Compare stays contextual — no new picker/selection UI was built.

---

## Files changed

15 modified, 9 new (5 of the new files are the re-cropped image assets). No file outside this list was touched.

```
 app/(tabs)/bible.tsx                   | 54 ++++++++++++++++------------
 app/(tabs)/index.tsx                   |  8 ++---
 app/(tabs)/passport.tsx                | 32 ++++++++++++++++-
 app/(tabs)/plan.tsx                    |  5 ++-
 app/(tabs)/preview.tsx                 |  2 +-
 app/botox-bestie/index.tsx             |  2 +-
 app/compare/index.tsx                  | 39 +++++++++++++++++---
 app/near-me/index.tsx                  | 24 ++++++++-----
 app/passport/photos.tsx                |  5 ++-
 app/paywall.tsx                        | 65 +++++++++++++++++++++++-----------
 app/quiz/result.tsx                    | 24 ++++---------
 assets/brand/campaign/index.ts         | 14 ++++++++
 components/media/EditorialImage.tsx    |  4 +--
 components/plan/PremiumRoadmapCard.tsx | 26 ++++++++++++--
 src/domain/recommendation.ts           | 24 ++++++-------
 15 files changed, 230 insertions(+), 98 deletions(-)

New files:
 AESTELLA_IMAGE_SHOT_LIST.md
 AESTELLA_SPRINT_REPORT.md               (this file)
 assets/brand/campaign/botox-bestie-crop.jpg
 assets/brand/campaign/home-hero-crop.jpg
 assets/brand/campaign/preview-hero-crop.jpg
 assets/brand/campaign/skin-detail-crop.jpg
 assets/brand/campaign/treatment-editorial-crop.jpg
 components/media/PlanPreviewMockup.tsx
 components/ui/EdgeFade.tsx
 scripts/recrop-campaign-images.py
```

Not touched: RevenueCat, Supabase, the AI Preview provider, Google Places, EAS/store config, or any subscription plumbing — confirmed by the diff above (no `lib/services/purchases*`, `lib/services/supabase*`, `lib/services/places.ts` logic, or `app.json`/`eas.json` in the changed-files list; `lib/services/places.ts` was only *read*, not edited, to confirm `rating`/`reviewCount` already accept `null`).

---

## P0 items — what changed and why

**P0-1 — Removed the forced auto-paywall.** `app/quiz/result.tsx`: deleted the `AUTO_PAYWALL_DELAY_MS` constant and the `useEffect` that called `router.push('/paywall')` on a timer, plus the now-unused `useEntitlement`/`isPremium` wiring that only existed to gate it. `PremiumRoadmapCard` at the bottom of Result is now the only, user-initiated path to the paywall. Verified live: after completing the quiz, the app sits on `/quiz/result` indefinitely (tested past 6 seconds, well beyond the old 3.5s timer) with no redirect, and tapping "Unlock My Full Plan" correctly navigates to `/paywall`.

**P0-2 — Replaced the paywall's photographic hero.** `app/paywall.tsx`: removed the `BeforeAfterFrame` (`TODAY`/`ORGANIZED`, using `homeHero`/`paywallStory`) and its caption. Built `components/media/PlanPreviewMockup.tsx` — a UI-only, wireframe-style composition (skeleton header, three roadmap rows with icons, one shown locked) ending in the line "Your personalized aesthetics intelligence is already waiting." It's built entirely from design tokens (no photography, no fabricated "result"), so it can't be read as a simulated treatment outcome. `BeforeAfterFrame.tsx` and `paywall-story.jpg` are left in place, unused, rather than deleted (see the Shot List's note on this) — deleting a still-valid, documented component felt like scope creep for a "don't redesign" sprint.

**P0-3 — Strengthened annual-plan dominance.** `app/paywall.tsx`: `BEST VALUE` tag switched from the low-contrast `accentLight` to solid `accent`; the selected card's border widened (1px → 2px) and gained a filled checkmark badge; the *unselected* card now dims to 55% opacity (previously both cards looked equally weighted regardless of selection); added an explicit comparison line on the weekly card — "That's $11.99 every week — the annual plan works out to just $1.90/week." Locked pricing, plan names, and the "Unlock My Aestella Plan" CTA are unchanged. Verified both selection states via Jest (existing test asserts exactly one `selected: true` card either way) and live screenshots.

**P0-4 — Personalized the locked roadmap.** `components/plan/PremiumRoadmapCard.tsx`: headline is now dynamic — `+{N} more matches selected for you, plus full comparisons.` where N is `alternates.length` (falls back to the original generic copy if N is 0). Added an optional `personalizedReason` line, not dimmed with the rest of the locked content, so it reads even though the roadmap itself stays hidden. Both call sites (`app/quiz/result.tsx`, `app/(tabs)/plan.tsx`) pass a reason built from the user's own quiz answers already in scope — `Matched to your ${concern} goals, focused on your ${area}.` — no new recommendation logic, no fabricated data. Verified live: with a "Fine lines / wrinkles" / "Forehead" quiz path, the card renders "+2 more matches selected for you, plus full comparisons." and "Matched to your fine lines / wrinkles goals, focused on your forehead."

**P0-5 — Fixed trust problems in Passport and Near Me.**
- `app/(tabs)/passport.tsx`: added an "EXAMPLE — sign in to build your own Passport" banner, shown whenever `useOptionalAuth()` reports no signed-in user — which is exactly when `AppStateContext` is serving its seeded `samplePassportEntries` rather than a real user's data.
- `app/near-me/index.tsx`: the three sample providers' `rating`/`reviewCount` are now `null` instead of fabricated precise numbers (4.9★/214 reviews, etc.); the "★ · N Google reviews" line only renders when both are non-null, so nothing fake displays. The existing "Sample results — live search coming soon." caption was already present and untouched.

**P0-6 — Hardened Compare's dead end.** `app/compare/index.tsx`: the `!categoryA || !categoryB` branch (reachable only via a direct/deep-link URL missing valid ids — every in-app entry point already guards against it) now shows an icon plus a "Browse The Bible" button routing to `/bible`, instead of leaving the user at a bare sentence with nothing to tap. The exact string `Choose two categories to compare from your plan.` is preserved verbatim (required by `__tests__/app/compare/index.test.tsx`, confirmed passing). No new selection/picker UI was built.

**P0-7 — Finished Aestella brand consistency on Home.** `app/(tabs)/index.tsx`: the brand-row eyebrow next to the monogram on `NewUserHome` changed from "THE AESTHETICS BIBLE" to "AESTELLA". The Discover module still titled "The Aesthetics Bible" (module 01) was left as-is — per `CLAUDE.md`, that's the legitimate content-library descriptor, not the brand name. "Aestella" and "See your potential. Build your plan." were already correct and untouched.

**P0-8 — Rewrote the 12 longevity lines.** `src/domain/recommendation.ts`: every `longevityContext` string changed from the awkward "Results are commonly explored as lasting/building X" construction to natural phrasing — e.g. `Results typically last 3–4 months.` / `Results typically build gradually over several months.` Meaning and hedging level preserved exactly (no stronger claims: "typically" replaces "commonly explored as," nothing became a guarantee). All 12 were matched and replaced exactly once each; no test asserted the old strings.

---

## Image crop pass + the oversized-source finding

**What the audit flagged:** Home/Preview/Botox Bestie/Bible-detail heroes showing 60–90% dead black space.

**Root cause:** the source JPEGs are dramatically lit portraits with the subject in the top 40–60% of the frame and near-black clothing/background filling the rest; several images' native aspect ratio already matched their container's configured ratio, so React Native's `resizeMode="cover"` (which has no focal-point control) was cropping nothing and showing the full, mostly-dark composition.

**Fix:** `scripts/recrop-campaign-images.py` (new, documented, reproducible — Pillow, no new npm dependency) re-crops five source JPEGs to a tighter window that keeps the bright/subject band, at the exact aspect ratio each placement needs, so no further runtime cropping happens. Wired into `assets/brand/campaign/index.ts` (5 new exports), `EditorialImage.tsx`'s `portrait`/`treatment` variant defaults, and the explicit `uri` props on Home/Preview/Botox Bestie. Bible detail and Plan's empty state pick up the fix automatically via the `treatment`/`portrait` variant defaults.

**Second finding, surfaced while verifying this in the web preview:** `EditorialImage`'s `<Image>` renders at the *source file's native pixel dimensions* on react-native-web, not the size of its styled container — the container's `overflow: hidden` then just clips to whichever corner of the oversized image lands inside it (top-left), rather than actually scaling the image down first. This went unnoticed for containers close in size to their source image (Home/Preview heroes, Bible detail: only ~1.5–2.2x oversized, so most of the intended crop still fell inside the visible area), but broke two small slots badly: Home's 96×96 Bible-teaser thumbnail was fed an 800×800 image (8.3x oversized — only a ~12% top-left sliver, a wash of skin tone, was ever visible) and Botox Bestie's 88pt-wide header was fed a 427×923 image (4.85x oversized — only hair, no eye or face, was ever visible). **Fix applied:** downsampled those two crops to roughly 2–2.2x their actual display size (same framing, just not needlessly high-resolution for a small slot) — `skin-detail-crop.jpg` to 210×210, `botox-bestie-crop.jpg` to 190×411. This is folded into `recrop-campaign-images.py` as a second `RESIZE_JOBS` pass, so the whole pipeline (crop, then right-size) is reproducible in one script run. Full before/after screenshots below.

I could not confirm whether this rendering quirk also affects real iOS/Android builds (only the Playwright/web preview was available in this environment) — it looks specific to how react-native-web + Metro's asset resolution interact with `StyleSheet.absoluteFill`, and RN's native `Image` component is expected to honor `resizeMode` correctly regardless of source resolution. The fix doesn't depend on that assumption either way: shipping right-sized images for a small fixed slot is correct practice on any platform. **Recommend confirming these two slots specifically on a real device** during your next device pass, since this wasn't something the original audit (also screenshot-based) had flagged as a distinct issue.

`AESTELLA_IMAGE_SHOT_LIST.md` (new) documents the full curated-subject plan per your correction — 2 existing subjects catalogued across all 8 image slots, plus an honest callout that the current library has **no male or 55+ subject**, which this sprint's re-cropping work could not fabricate a fix for (flagged as a follow-up commissioning task, not silently worked around).

---

## P1 polish

- **Bible chip-scroll affordance:** added `components/ui/EdgeFade.tsx` (new, dependency-free — `expo-linear-gradient` isn't installed and adding it was out of scope) — a stack of semi-transparent strips approximating a right-edge fade, wired onto both horizontal chip rows in `app/(tabs)/bible.tsx`. Honest caveat: on this very dark theme (fading to near-black `colors.background`), the effect is subtle in a static screenshot; the chips' own text-truncation at the edge remains the more visible scroll cue. It's a correct, safe addition either way, just not a dramatic one.
- **Progress Photos "COMING SOON" clipping:** `app/passport/photos.tsx` — the 72px-wide thumbnail was too narrow for that label chip to render without clipping, and the adjacent caption already said photos aren't available yet. Added `compact` to `EditorialImage` there, which suppresses the label via the component's existing `{label && !compact && ...}` guard — no component changes needed.
- Did **not** touch the Home personalization redesign or build new Progress Photos functionality, per your explicit instruction.

---

## Verification

- **Typecheck:** `npm run typecheck` — clean, no errors.
- **Lint:** `npm run lint` — clean, no errors.
- **Tests:** `npm test` — **106/106 passing across 20 suites**, including the Compare empty-state test (exact string preserved) and the paywall plan-selection test (exactly one card `selected: true` at all times).
- **Live app + screenshots:** ran `expo start --web` behind Playwright/Chromium at a 390×844 mobile viewport (same approach as the original audit). Captured: Home (top + Discover modules), Preview, Botox Bestie (before/after the resize fix), Near Me, Bible list, Bible detail, Compare (empty + filled), Passport (sample state with EXAMPLE banner), Progress Photos, Paywall (annual selected, full page + weekly selected, full page).
- **Journey retest:** scripted the full quiz (6 questions) → Result → Paywall path. Confirmed the URL stays on `/quiz/result` for 6+ seconds with no forced navigation (P0-1), confirmed the roadmap card's personalized copy renders correctly from real quiz answers (P0-4), and confirmed tapping "Unlock My Full Plan" correctly navigates to `/paywall` (user-initiated, as intended).

## Deferred / explicitly out of scope

- Sourcing a male and a 55+ subject for the photo library (flagged in the Shot List as a follow-up commission, not something this sprint could fabricate).
- Confirming the oversized-image rendering quirk's behavior on real iOS/Android hardware (only web preview was available here).
- Everything named out of scope in the ticket: Home personalization redesign, new Progress Photos functionality, a Compare picker UI, RevenueCat/Supabase/AI Preview/Google Places/EAS/subscription changes.

## Unintended behavior encountered

None outside the oversized-image rendering issue documented above, which was caught and fixed as part of the image-crop work rather than shipped broken. No regressions found in the full test suite, typecheck, or lint.

---

**Not committed or pushed**, per instruction — working tree has the changes listed above, ready for your review.
