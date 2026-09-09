# Aestella — Image Shot List

Companion to the P0 UI/UX Polish Sprint (see `AESTELLA_SPRINT_REPORT.md`). This
replaces the audit's original suggestion of ~28 unique treatment photos with a
**small curated, rotating set of recurring subjects** — per direction given at
kickoff: *"A curated image system is smarter than making the Bible visually
noisy."* Every screen still gets a well-composed, on-brand photo; no screen
gets a bespoke commission of its own.

## How to use this document

1. **Roster** — the recurring "faces of Aestella." Two of the three already
   exist in `assets/brand/campaign/`; one is a gap this sprint surfaced and
   does not fabricate a fix for (see Finding, below).
2. **Slot map** — every place a campaign photo renders in the app today, what
   subject/spec it needs, and its current sourcing status.
3. **Finding** — the diversity gap the original audit asked for, named
   plainly rather than silently worked around.

---

## Finding: current library has no male or 55+ subject

The existing 8 assets in `assets/brand/campaign/` are all one of two women,
both appearing to be roughly late-20s–40s. The original audit asked for "one
male subject, one 55+ subject, multiple women of varied ages" — this sprint's
image work (cropping/re-framing, see below) could only re-frame what already
exists; it could not invent a male or older subject that isn't in the source
library. **New photography or licensed stock for Subject C and Subject D
below is a follow-up commissioning task**, not something fixed by this
polish sprint. Flagging it here rather than leaving it implicit.

---

## Roster

| Subject | Status | Age range | Gender | Description (from existing photos) |
|---|---|---|---|---|
| **A** | Existing | Late 20s–mid 30s | Woman | Fair skin, light brown hair, warm/golden single-source lighting. Appears in `home-hero`, `preview-hero`. |
| **B** | Existing | Mid 30s–40s | Woman | Olive/tan skin, dark wavy hair, warm amber lighting. Appears in `botox-bestie`, `treatment-editorial`, `skin-detail`. |
| **C** — *needs sourcing* | Gap | 55+ | Woman or man | Not present in current library. Needed to satisfy "one 55+ subject." |
| **D** — *needs sourcing* | Gap | 35–50 | Man | Not present in current library. Needed to satisfy "one male subject." |

Recommendation once C and D are sourced: rotate them into the same slot map
below (e.g. Subject D standing in for Subject A on alternating Home
sessions, or a future personalization hook) rather than adding new slots —
keeps the "small curated set" principle intact as the roster grows.

---

## Slot map (current, as of this sprint)

Each row is one place a campaign photo renders today. "Aspect ratio" is the
`EditorialImage` variant's configured ratio; "Asset" is the current file in
`assets/brand/campaign/`.

### 1. Home hero
- **Screen / component:** `app/(tabs)/index.tsx`, `NewUserHome` — brand hero under the headline.
- **Asset:** `home-hero-crop.jpg` (558×698, cropped from `home-hero.jpg` this sprint — see `scripts/recrop-campaign-images.py`).
- **Aspect ratio:** 4:5 (`portrait` variant).
- **Subject:** A.
- **Pose:** Three-quarter profile, chin slightly down, eyes toward camera.
- **Facial framing:** Tight — brow to jaw fills most of the frame.
- **Lighting:** Single warm key light from camera-left, deep shadow fall-off (dramatic, editorial — not flat beauty lighting).
- **Wardrobe:** Not visible in frame (face/shoulder crop only).
- **Background:** Near-black, no visible set.
- **Emotional effect:** Quiet confidence, aspirational, "already has it together."
- **Sourcing:** Existing photo, re-cropped this sprint to remove ~40% of dead dark space below the subject.

### 2. Preview hero
- **Screen / component:** `app/(tabs)/preview.tsx` — header portrait, labeled "AI VISUALIZATION"; also reused at `app/(tabs)/index.tsx` Discover module 02.
- **Asset:** `preview-hero-crop.jpg` (738×922, cropped from `preview-hero.jpg` this sprint).
- **Aspect ratio:** 4:5 (`portrait` variant).
- **Subject:** A.
- **Pose:** Close three-quarter, hair swept back off the face.
- **Facial framing:** Eye, brow, cheekbone — tight beauty crop.
- **Lighting:** Warm, softer fill than the Home hero; skin texture visible and intentional (not retouched flat).
- **Wardrobe:** Not visible.
- **Background:** Warm neutral, softly out of focus.
- **Emotional effect:** Curious, open — "considering a possibility," matching the screen's "see a possibility before making a decision" copy.
- **Sourcing:** Existing photo, re-cropped this sprint to trim dead space at the bottom ~18% of frame.

### 3. Treatment / Bible editorial
- **Screen / component:** `app/quiz/result.tsx` hero (default `treatment` variant), `app/bible/[id].tsx` detail hero.
- **Asset:** `treatment-editorial-crop.jpg` (500×750, cropped from `treatment-editorial.jpg` this sprint).
- **Aspect ratio:** 2:3 (`treatment` variant).
- **Subject:** B.
- **Pose:** Reclined, hand resting near jaw, head tilted.
- **Facial framing:** Full face, relaxed — not as tight a crop as the two heroes above.
- **Lighting:** Warm rim light catching hair and cheekbone; darker ambient fill.
- **Wardrobe:** Dark, unbranded — reads as loungewear/robe, not clinical.
- **Background:** Warm dark neutral.
- **Emotional effect:** Ease, self-possession — appropriate for "your #1 priority" and treatment-education contexts where the tone should stay editorial, not clinical.
- **Sourcing:** Existing photo, re-cropped this sprint — this one already had a reasonably bright, well-framed subject band; the fix mainly tightened dead margin.

### 4. Skin / detail (Home "Discover the Bible" module)
- **Screen / component:** `app/(tabs)/index.tsx`, `DiscoverModules` — module 01, "THE AESTHETICS BIBLE."
- **Asset:** `skin-detail-crop.jpg` (210×210 — cropped from `skin-detail.jpg`, then downsampled this sprint; see Finding in `AESTELLA_SPRINT_REPORT.md` about oversized source images in a small slot).
- **Aspect ratio:** 1:1 (`skin-detail` variant, this slot only).
- **Subject:** B.
- **Pose:** Same source image as slot 3, cropped to a tighter square on the cheek/jaw.
- **Facial framing:** Macro — skin texture, not a full face.
- **Lighting:** Same warm rim/fill as slot 3.
- **Wardrobe:** N/A (skin only).
- **Background:** N/A (skin fills frame).
- **Emotional effect:** Quality, texture, "there's real skin science under this" — matches the module's education framing.
- **Sourcing:** Existing photo, re-cropped and resized this sprint. This is the one thumbnail small enough that a dedicated macro/texture shot (rather than a repurposed portrait crop) would look sharper if a future commission happens.

### 5. Botox Bestie header
- **Screen / component:** `app/botox-bestie/index.tsx` — small header portrait beside the headline.
- **Asset:** `botox-bestie-crop.jpg` (190×411 — cropped from `botox-bestie.jpg`, then downsampled this sprint).
- **Aspect ratio:** ~0.463 (explicit `BESTIE_ASPECT_RATIO`, a deliberately narrow, secondary-sized slot).
- **Subject:** B.
- **Pose:** Close three-quarter, eye and brow prominent.
- **Facial framing:** Very tight — eye/brow/cheek only, by design (this is a small, secondary brand moment, not a hero).
- **Lighting:** Same warm key as slots 3–4.
- **Wardrobe:** Not visible.
- **Background:** Dark, out of focus.
- **Emotional effect:** Approachable, direct eye contact — matches "the aesthetics questions you actually want to ask" tone (friendly, not clinical).
- **Sourcing:** Existing photo, re-cropped and resized this sprint (see Finding in the sprint report — this slot's image was rendering as a wildly oversized, mis-cropped hair-only sliver before the resize pass).

### 6. Glow / social (Home "GLOW" module)
- **Screen / component:** `app/(tabs)/index.tsx`, `DiscoverModules` — module 03, badged "COMING SOON."
- **Asset:** `glow-social.jpg` (unchanged this sprint — Glow is explicitly out of scope; see `CLAUDE.md` NOT V1 list).
- **Aspect ratio:** 4:5 (`social` variant default).
- **Subject:** Not catalogued (untouched this sprint).
- **Sourcing:** Existing photo, not reviewed — Glow ships later; revisit its imagery alongside that feature, not as part of this polish pass.

### 7. Preview before/after visualization
- **Screen / component:** `app/(tabs)/preview.tsx`, `BeforeAfterSlider` (labeled "TEMPORARY PLACEHOLDER IMAGES" in-code).
- **Asset:** `preview-visualization.jpg` (unchanged — tied to the not-yet-live AI Preview provider integration, explicitly out of scope for this sprint per the ticket's guardrails).
- **Sourcing:** Placeholder; replace only when AI Preview generation goes live, not before.

### 8. Paywall story (retired this sprint)
- **Asset:** `paywall-story.jpg`.
- **Status:** No longer referenced anywhere in the app as of P0-2 — the paywall's photographic before/after (`BeforeAfterFrame`, `TODAY`/`ORGANIZED`) was replaced with a UI-only composition (`PlanPreviewMockup`) per this sprint's explicit direction to sell the product, not a simulated life outcome. `BeforeAfterFrame.tsx` itself is left in place (still a sanctioned, working component per `CLAUDE.md`) in case a future, deliberately-approved use case wants a real photographic before/after — it is simply unused today. The asset file is likewise left in place rather than deleted, in case that future use case wants it.

---

## Format/technical notes for future commissions

- Deliver source photography at least 2–2.5× the largest slot it will fill
  (e.g. ~700–900px on the long edge for a 4:5 hero at typical phone widths)
  — large enough for crisp retina rendering, but not dramatically oversized.
  This sprint found that a much-larger-than-needed source image, combined
  with how `EditorialImage` renders on the web preview tooling, can cause a
  photo to display as a tiny, wrongly-positioned corner crop instead of a
  properly scaled photo (full root-cause in `AESTELLA_SPRINT_REPORT.md`).
- Keep the same single-warm-key, dark-background lighting language across
  any new subjects (C, D) so they read as part of the same photography set,
  not a mismatched addition.
- All photography should look like real, un-simulated people in an editorial
  beauty context — never a "before/after" of an actual treatment outcome,
  per `CLAUDE.md`'s product boundaries.
