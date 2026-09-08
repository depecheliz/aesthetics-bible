# THE AESTHETICS BIBLE --- PRODUCT_SPEC.md

**Status:** Product definition locked for phased build\
**Product:** Aestella (consumer-facing app name); The Aesthetics Bible
remains the descriptor/category positioning and content-library name\
**Positioning:** *See your potential. Build your plan.*

For what is actually built, mocked, or not yet connected right now, see
`BUILD_STATUS.md`.

------------------------------------------------------------------------

## 1. Product Vision

The Aesthetics Bible is a luxury consumer aesthetics platform that helps
users:

1.  Understand aesthetic treatments and terminology.
2.  Identify treatment categories worth researching based on their
    stated goals and preferences.
3.  Visualize aesthetic looks with clearly labeled AI simulations.
4.  Enhance photos for social use through a separate Glow experience.
5.  Find nearby aesthetics providers.
6.  Track treatments, providers, photos, costs, notes, and results.
7.  Maintain a long-term personal aesthetics history.

The app is not designed to diagnose a user's face or autonomously
prescribe medical treatment.

### Core customer promise

> Tell us what matters to you. We help you understand your options,
> visualize possibilities, organize your journey, find providers, and
> remember what you've done.

------------------------------------------------------------------------

## 2. Brand Architecture

### Master brand

**THE AESTHETICS BIBLE**

### Brand direction

-   Luxury editorial, not generic beauty-tech.
-   Black, warm ivory, champagne.
-   Sophisticated editorial serif for display typography.
-   Clean sans serif for functional UI.
-   Restrained iconography.
-   Generous whitespace.
-   High-fashion editorial imagery.
-   No bubblegum pink, neon gradients, cartoon medical imagery, or
    generic med-spa aesthetic.

### Visual system (as implemented)

-   Palette: black `#0B0B0C`, espresso `#332C25`, warm ivory `#F6EFE6`,
    champagne `#C9A97E`.
-   Typography: Playfair Display (editorial display), Montserrat
    (functional UI).
-   "AB" monogram (`components/brand/Monogram.tsx`) used sparingly at
    genuine brand moments --- Home, Paywall, shareable cards --- never as
    decoration.
-   Editorial layout favors thin champagne rules, numbering, and
    generous whitespace over boxed cards; cards are reserved for objects
    that need real containment (pricing tiers, locked-roadmap teaser,
    share cards).
-   Approved first-pass campaign photography lives in
    `assets/brand/campaign/` and renders through the shared
    `EditorialImage` / `BeforeAfterFrame` components. Marketing/editorial
    slots may show an approved default photo; slots representing a
    user's own content (progress photos, a saved provider) never default
    to stock imagery.

### Working tagline

**See your potential. Build your plan.**

### Named product features

-   **My Plan** --- personalized educational roadmap.
-   **Preview** --- AI aesthetic-look visualization.
-   **Glow** --- social-photo enhancement studio.
-   **The Bible** --- structured aesthetics knowledge library.
-   **Compare** --- treatment comparison engine.
-   **Near Me** --- provider discovery.
-   **Aesthetics Passport** --- private treatment history.
-   **Beauty Calendar** --- reminders and planning.
-   **Beauty Budget** --- planned vs. actual aesthetics spending.
-   **Ask the Bible** --- curated conversational education.
-   **Botox Bestie** --- optional friendly conversational
    personality/feature name; not the master brand.
-   **Aesthetics Wrapped** --- future annual recap.
-   **Advanced / DIY** --- future modular educational section.

------------------------------------------------------------------------

## 3. Core Product Framework

### Core function

Help a user understand her aesthetic goals and turn them into a
personalized, organized aesthetics journey.

### Core loop

1.  User completes a short multiple-choice Aesthetics Profile.
2.  App immediately reveals her strongest educational match.
3.  Result explains why it matched.
4.  User can **Learn**, **Preview**, **Find**, or **Save**.
5.  Additional roadmap results create the Premium conversion
    opportunity.

### First-session goal

Deliver a meaningful personalized result in approximately 60--120
seconds.

### Retention model

Aesthetics is episodic; do not manufacture a daily streak. Retention
comes from: - treatment/result photo reminders; - Passport history; -
Beauty Calendar; - saved plans; - progress photos; - budget tracking; -
Glow reuse; - relevant new education; - annual Aesthetics Wrapped.

------------------------------------------------------------------------

## 4. Primary Navigation

Keep the primary mobile navigation to five destinations.

### 1. Home

Personal dashboard: - greeting / profile state; - next best action; -
current plan summary; - recent Passport activity; - next reminder; -
quick access to Preview/Glow; - saved provider/treatment shortcuts.

### 2. Plan

Contains: - Aesthetics Profile quiz; - profile results; - personalized
roadmap; - treatment-category matches; - saved goals; - comparisons; -
wishlist.

### 3. Preview

Contains two clearly separated modes: - **Preview:** aesthetic
visualization. - **Glow:** social-photo enhancement.

### 4. Bible

Contains: - search; - treatment library; - concern library; -
categories; - comparisons; - references; - educational FAQs.

### 5. Passport

Contains: - treatment history; - photos; - providers; - Beauty
Calendar; - Beauty Budget; - reminders; - results notes.

Near Me can be reached contextually from Home, Plan, Bible, and
treatment pages without requiring a sixth permanent tab.

------------------------------------------------------------------------

## 5. Aesthetics Profile / My Plan

### Inputs

Multiple-choice questions should include: - primary concerns; -
face/body area; - desired result intensity; - downtime tolerance; -
comfort with procedures; - budget range; - preferences such as
subtle/natural; - treatments or categories the user wants to avoid; -
optional prior-treatment context.

### Recommendation principle

Recommendations are based on **user-stated goals and preferences plus
curated educational rules**.

Do not make a photo-analysis model autonomously diagnose the user or
prescribe a treatment.

### Result structure

Each match should include: - category/treatment name; - why it
matched; - what it is commonly explored for; - expected downtime
context; - longevity context; - cost context; - alternatives; - relevant
Bible content; - Compare action; - Preview action where appropriate; -
Find Provider action; - Save to Plan action.

### Paywall behavior

Do not immediately hide the quiz payoff.

Free users receive: - their strongest match; - enough explanation to
understand why it was selected.

Premium unlocks: - all matches; - complete roadmap; - richer
comparisons; - saved/updated plan; - Premium planning tools.

------------------------------------------------------------------------

## 6. Preview --- AI Aesthetic Visualization

### Purpose

Let a user explore a visual *look*, not predict a medical outcome.

### User flow

1.  Upload/select selfie.
2.  Choose a visualization goal.
3.  Choose intensity: subtle / moderate / enhanced.
4.  Generate.
5.  Show original and generated image with before/after comparison.
6.  Clearly label generated output **AI Visualization**.
7.  Save privately or export.

### Initial visualization categories

-   softer-looking lines;
-   more even-looking skin tone;
-   reduced appearance of pigmentation;
-   brighter complexion;
-   subtle lip-volume look;
-   jawline-definition look;
-   cheek-volume look;
-   brow look;
-   under-eye appearance;
-   smile/teeth appearance;
-   overall refreshed look.

### Product rule

Never present the generated image as: - guaranteed treatment outcome; -
prediction of what a specific procedure will do; - diagnosis; -
prescription.

------------------------------------------------------------------------

## 7. Glow --- Social Photo Studio

Glow is distinct from Preview.

### Promise

**Make me look polished in this photo.**

### Initial presets

-   Natural Me
-   Polished
-   Date Night
-   Soft Glam
-   Golden Hour
-   Studio
-   Fresh Face
-   Vacation Glow

### Potential controls

-   lighting;
-   gentle skin smoothing;
-   temporary blemish cleanup;
-   under-eye appearance;
-   teeth brightness;
-   makeup intensity;
-   background cleanup;
-   overall polish.

### My Look

Users can save a preferred enhancement profile and apply it to later
images.

Example: **My Natural Look** - subtle smoothing; - slight eye
brightening; - slight teeth brightening; - minimal makeup; - no
intentional face reshaping; - soft studio lighting.

### Export

Support useful export ratios such as: - original HD; - Instagram post; -
Instagram/Facebook story; - dating profile; - LinkedIn/profile image.

AI generation must be metered because it creates variable cost.

------------------------------------------------------------------------

## 8. The Bible --- Content System

The existing Facial Aesthetics Bible is the foundation of the knowledge
layer.

Do not simply display PDF pages. Convert owned content into structured
records.

### Initial categories

-   Tox / neuromodulators
-   Fillers
-   Skin boosters
-   Biostimulators
-   Lasers
-   RF
-   Ultrasound
-   Microneedling
-   Peels
-   Threads
-   Body
-   Skincare
-   At-home devices
-   Hair

### Treatment record schema

**As actually implemented** in `src/domain/bible.ts`'s `BibleTreatment`
type (this section previously described an aspirational future schema
that did not match the code; corrected here per the repo content-
integration pass): id; title; aliases; categoryId; overview;
contentVersion; reviewDate; stage (preserve / restore / rebuild); primary
layers (from the manuscript's 7-layer framework); what the treatment does
NOT address; discomfort; repeat frequency; value summary; who should
reconsider it. The last seven fields are sourced from the owned
manuscript ("The Facial Aesthetics Bible") and were added in the
manuscript content-integration pass — see the file-level comment in
`bible.ts` for sourcing notes.

Not yet in the schema: limitations/risks as a distinct field from "what
it does not address"; a dedicated references field; related-comparisons
or related-Preview-options links; a premium/free flag. These remain
possible future additions, not implemented now.

### Concern record schema

Examples: - dynamic lines; - laxity; - pigmentation; - texture; -
pores; - acne scarring; - volume loss; - under-eye concerns; -
jawline; - body concerns.

Each concern can link to multiple educational treatment categories.

**Current V1 implementation:** 28 named treatments across 9 of the 12
recommendation categories (tox, fillers, biostimulators, rf, ultrasound,
lasers, microneedling, peels, threads, skincare — skin_boosters and
at_home_devices remain unpopulated), plus 7 curated browsing concerns.
Content is sourced from the owned manuscript. Regenerative medicine (PRP,
PRF, exosomes, polynucleotides, stem-cell-derived products) and surgery
(blepharoplasty, brow lift, facelift variants, neck lift) are covered at
length in the manuscript but intentionally not represented: surgery has
no corresponding category id in `recommendation.ts`, and regenerative
medicine's best-fit category (skin_boosters) is not a precise match for
blood-derived and DNA-fragment products. Search, category filters, and
treatment detail pages (with hero image, Compare, Ask Bestie, and Find
Near Me actions) are built. Compare now supports comparing two named
treatments directly (e.g. Botox vs. Dysport), not only two generic
categories. See `BUILD_STATUS.md`.

### Existing book frameworks to preserve

-   Preserve / Restore / Rebuild.
-   Seven layers of facial aging.
-   Face zones.
-   Treatment education.
-   Treatment comparisons.
-   Goal-based plans.
-   Self-assessment.
-   Provider questions.
-   Tracking concepts.

------------------------------------------------------------------------

## 9. Compare

Comparison pages should support high-intent research.

Examples: - Botox vs Dysport; - Sofwave vs Ultherapy; - Morpheus8 vs
microneedling; - Sculptra vs filler; - IPL vs BBL; - CO2 vs RF
microneedling.

### Comparison dimensions

-   what each is;
-   commonly explored goals;
-   treatment type;
-   downtime;
-   longevity;
-   typical sessions;
-   cost context;
-   strengths;
-   tradeoffs;
-   alternatives;
-   questions to ask.

------------------------------------------------------------------------

## 10. Near Me

### Purpose

Capture high-intent searches such as: - Botox near me; - filler near
me; - laser near me; - microneedling near me.

### Data source

Google Places / Maps Platform.

### Provider cards

Where permitted by the API: - business name; - Google rating; - review
count; - distance; - category; - address; - map; - website; - call; -
directions.

### User functions

-   save provider;
-   private notes;
-   associate provider with Passport treatments;
-   later compare saved providers.

### Future monetization

-   enhanced provider profiles;
-   qualified lead/book actions;
-   clearly labeled sponsored placement.

Do not allow paid placement to masquerade as organic ranking.

------------------------------------------------------------------------

## 11. Aesthetics Passport

### Treatment entry

-   treatment;
-   date;
-   provider;
-   product;
-   cost;
-   user-recorded units/amount;
-   lot/batch number;
-   areas;
-   notes;
-   satisfaction;
-   would-do-again;
-   photos;
-   follow-up date/reminder.

### Dashboard

-   lifetime spend;
-   spend this year;
-   spend by treatment;
-   spend by provider;
-   recent treatments;
-   upcoming reminders.

### Photos

Private by default. Support: - baseline; - follow-up; - timeline; -
side-by-side comparison.

------------------------------------------------------------------------

## 12. Beauty Calendar

Can include: - aesthetic procedures; - facials; - hair; - nails; -
brows; - skincare events; - dental whitening; - user-defined beauty
appointments.

Users control reminders.

Educational spacing information may be shown as reference material where
supported, but the app should not position itself as autonomously
prescribing a medical treatment schedule.

------------------------------------------------------------------------

## 13. Beauty Budget

### User inputs

-   annual budget;
-   planned treatments;
-   wishlist;
-   actual spend.

### Outputs

-   planned spend;
-   actual spend;
-   remaining budget;
-   spend by category;
-   upcoming planned cost.

------------------------------------------------------------------------

## 14. Ask the Bible / Botox Bestie

Conversational interface grounded in curated Aesthetics Bible content.

### Appropriate examples

-   "What is the difference between Sofwave and Ultherapy?"
-   "Show me categories people research for pigmentation when they want
    low downtime."
-   "What questions should I ask at a Botox consultation?"
-   "Compare Botox and Dysport."

### Boundary

Do not answer by prescribing exact invasive treatment placement, dose,
depth, or individualized injection instructions.

**Current V1 implementation:** a mocked UI at `/botox-bestie` with 5
curated static Q&A pairs and a visible boundary disclaimer --- no LLM, no
grounded retrieval yet. Entry points exist from Home (teaser module),
the Bible tab, and every Bible treatment detail page. See
`BUILD_STATUS.md`.

------------------------------------------------------------------------

## 15. Shop / Affiliate Architecture

Build the architecture even before affiliate relationships exist.

### Shop by goal

Potential categories: - glow; - pigmentation; - texture; - anti-aging; -
post-treatment care; - SPF; - devices.

### Revenue possibilities

-   approved affiliate links;
-   brand partnerships;
-   sponsored collections;
-   provider monetization.

Affiliate destinations must be configurable so ordinary links can later
be replaced with approved tracked links.

Do not use private treatment/health history for advertising targeting.

------------------------------------------------------------------------

## 16. Advanced / DIY

This is a future modular section.

Potential content: - terminology; - anatomy education; - product
knowledge; - references; - safety education; - complication awareness; -
tracking.

### Launch rule

The initial App Store/Play Store proposition and core value must not
depend on approval of advanced DIY invasive-procedure instruction.

------------------------------------------------------------------------

## 17. Monetization

### Free

-   basic Bible education;
-   searchable high-intent content;
-   Aesthetics Profile quiz;
-   strongest personalized result;
-   provider search;
-   limited Passport;
-   limited AI generations.

### Premium

**Launch test:** \$11.99/week or \$99/year --- no monthly plan.

Annual is preselected as the "Best Value" hero offer. Both plans grant
the same Premium entitlement.

Premium includes: - complete roadmap; - full Bible; - comparisons; -
full Passport; - private photo history; - calendar; - budget; - Ask the
Bible; - Premium planning tools; - monthly Preview/Glow AI allowance; -
My Look; - HD export.

### Additional revenue

-   AI credit packs;
-   affiliates;
-   provider leads/enhanced listings;
-   sponsorships.

### Pricing rule

Do not sell lifetime access while AI, image storage, maps, and
infrastructure create ongoing variable costs.

------------------------------------------------------------------------

## 18. Web Product / SEO

The product should eventually include a web acquisition layer in
addition to iOS and Android.

Potential indexable pages: - What is Botox? - Botox cost. - Botox near
me. - Botox vs Dysport. - What is Sofwave? - Sofwave vs Ultherapy. -
Best treatment categories to research for \[concern\]. - Treatment
explainers and comparisons.

### Funnel

Search → useful free content → quiz → personalized result → app/account
→ Premium.

The app owns the persistent layer: - plan; - Passport; - photos; -
Glow; - tracking; - saved providers.

------------------------------------------------------------------------

## 19. V1 --- Required

V1 is intentionally smaller than the complete vision.

### Required

-   luxury onboarding;
-   authentication;
-   Aesthetics Profile quiz;
-   top personalized match;
-   locked full-roadmap state;
-   structured Bible for initial highest-demand categories;
-   treatment/concern search;
-   Google Places provider finder;
-   basic Passport;
-   private progress photos;
-   one Preview flow;
-   one Glow flow;
-   RevenueCat subscriptions;
-   restore purchases;
-   analytics;
-   privacy/support/terms;
-   AI reporting mechanism where required;
-   account deletion;
-   secure data/storage;
-   rate limiting;
-   real-device QA.

------------------------------------------------------------------------

## 20. Explicitly NOT V1

Do not silently add these during the initial build: - full Advanced /
DIY module; - affiliate marketplace; - provider paid listings; -
Aesthetics Wrapped; - dozens of AI presets; - full AI concierge; -
complete conversion of every book chapter; - complex social/community
system; - user-to-user messaging; - public photo feeds; - provider
booking engine; - autonomous photo diagnosis; - personalized
invasive-procedure prescription.

Architect so these can be added later without bloating V1.

------------------------------------------------------------------------

## 21. Data Model --- Initial Entities

Exact schema may evolve, but preserve these domains:

-   `users`
-   `profiles`
-   `aesthetics_profile_answers`
-   `aesthetics_plans`
-   `plan_matches`
-   `goals`
-   `concerns`
-   `treatments`
-   `treatment_content`
-   `comparisons`
-   `saved_treatments`
-   `providers`
-   `saved_providers`
-   `passport_entries`
-   `passport_photos`
-   `beauty_calendar_events`
-   `budgets`
-   `budget_items`
-   `ai_generations`
-   `saved_looks`
-   `subscriptions`
-   `entitlements`
-   `content_references`
-   `affiliate_destinations`
-   `user_reports`

All user-owned tables require ownership controls/RLS.

------------------------------------------------------------------------

## 22. AI Architecture

### Separate AI domains

**Preview** - image-to-image aesthetic visualization.

**Glow** - image enhancement/stylization.

**Ask the Bible** - grounded text assistant, later phase unless pulled
into V1.

### Requirements

-   server-side provider calls;
-   no client API secrets;
-   authenticated generation;
-   quotas;
-   rate limiting;
-   cost telemetry;
-   failure/retry states;
-   report/flag flow;
-   deletion flow;
-   generation metadata;
-   no private image content in logs.

### AI provider abstraction

Do not tightly couple UI/business logic to one AI vendor. Create an
interface that permits provider replacement.

------------------------------------------------------------------------

## 23. Image Privacy

User photos are high-sensitivity product data.

Requirements: - private storage by default; - per-user authorization; -
short-lived signed URLs where appropriate; - explicit deletion; -
account deletion cascades; - no public bucket; - no training/reuse
without explicit permission; - minimal metadata; - no image URLs in
analytics; - no private image content in logs.

------------------------------------------------------------------------

## 24. Entitlement Matrix

Feature access must be enforced in UI **and server-side where cost/data
exposure exists**.

  Feature              Free              Premium
  -------------------- ----------------- -------------------
  Basic Bible          Yes               Yes
  Full Bible           Limited           Yes
  Quiz                 Yes               Yes
  Top match            Yes               Yes
  Full roadmap         No                Yes
  Near Me              Yes               Yes
  Basic Passport       Limited           Yes
  Full photo history   Limited           Yes
  Preview              Limited credits   Monthly allowance
  Glow                 Limited credits   Monthly allowance
  My Look              No                Yes
  Calendar             Limited/TBD       Yes
  Budget               Limited/TBD       Yes
  Compare              Limited           Yes
  Ask the Bible        No/TBD            Yes

Final quotas are configurable and should not be hardcoded throughout the
UI.

------------------------------------------------------------------------

## 25. Analytics Events

At minimum: - `onboarding_started` - `onboarding_completed` -
`quiz_started` - `quiz_completed` - `top_match_viewed` -
`full_roadmap_clicked` - `paywall_viewed` - `weekly_selected` -
`annual_selected` - `purchase_started` - `weekly_purchased` -
`annual_purchased` - `purchase_failed` - `restore_started` -
`purchase_restored` - `restore_failed` - `bible_search` -
`treatment_viewed` - `comparison_viewed` - `provider_search` -
`provider_viewed` - `provider_saved` - `passport_entry_created` -
`passport_photo_added` - `preview_started` - `preview_generated` -
`preview_failed` - `glow_started` - `glow_generated` - `glow_failed` -
`image_exported` - `reminder_created` - `account_deleted`

Never send private treatment notes, photos, raw health-like data, or
sensitive free text as analytics parameters.

------------------------------------------------------------------------

## 26. Definition of Done

A feature is not done because it renders.

It is done when: 1. happy path works; 2. empty state works; 3. loading
state works; 4. error state works; 5. offline/poor-network behavior is
acceptable where relevant; 6. authorization is verified; 7. Premium
gating is verified; 8. analytics events are verified; 9. real-device UX
is tested; 10. accessibility basics are checked; 11. no secrets/private
data leak into logs; 12. relevant tests pass; 13. documentation is
updated.

------------------------------------------------------------------------

## 27. Build Phases

### Phase 1

V1 approval: - core loop; - Premium; - Preview/Glow; - Passport; - Bible
starter library; - Near Me.

### Phase 2

-   broader book ingestion;
-   richer comparisons;
-   richer plan;
-   additional AI presets.

### Phase 3

-   Ask the Bible / Botox Bestie;
-   richer budget intelligence;
-   Aesthetics Wrapped.

### Phase 4

-   Affiliate Shop;
-   provider enhancements/leads;
-   web SEO expansion.

### Phase 5

-   Advanced / DIY module after policy/legal/content review and after
    the core product is established.

------------------------------------------------------------------------

## 28. Decision Log

Record meaningful decisions here rather than allowing future coding
sessions to infer them.

  -----------------------------------------------------------------------
  Decision                Current choice          Why
  ----------------------- ----------------------- -----------------------
  Master brand            The Aesthetics Bible    Broad, premium,
                                                  supports entire
                                                  ecosystem

  Botox Bestie            Feature/personality,    Viral/friendly without
                          not master brand        narrowing brand

  Core recommendation     Multiple-choice stated  Useful personalization
  input                   goals                   without photo diagnosis

  Premium launch test     \$11.99/wk or \$99/yr,  Supersedes the earlier
                          no monthly plan          $14.99/mo figure;
                                                    supports recurring
                                                    AI/storage costs

  Lifetime plan           No                      Ongoing variable costs

  Navigation              Five primary tabs       Controls surface area

  AI photo modes          Preview + Glow          Avoids confusing
                          separated               treatment visualization
                                                  with social editing

  DIY                     Post-launch modular     Core approval/value
                          layer                   should not depend on it

  Botox Bestie V1         Mocked static Q&A UI,   Gives the personality
  visibility               no LLM                  brand presence without
                                                    building the grounded
                                                    assistant early

  Brand mark               "AB" text monogram      No licensed vector
                                                    logo yet; typographic
                                                    lockup avoids
                                                    reproducing any
                                                    protected mark

  Campaign photography      First-pass photo set   Replaces generic
                            wired via              placeholder captions
                            EditorialImage/         with real imagery
                            BeforeAfterFrame        while staying
                                                    swappable later

  Backend project           Dedicated Supabase     Keep this app's data
                            project per product     isolated from other
                            ("The Aesthetics        products on the same
                            Bible")                 account

  Consumer app name         Aestella; The           Reconciliation pass
                            Aesthetics Bible         confirmed Aestella as
                            stays the descriptor/    the consumer-facing
                            content-library name     product name; scope
                                                      limited to docs +
                                                      existing paywall/
                                                      analyzing-screen
                                                      copy for this pass
                                                      --- no broader
                                                      codebase rename,
                                                      bundle-ID change, or
                                                      asset/nav redesign
  -----------------------------------------------------------------------

Update this table whenever a major product decision changes.

------------------------------------------------------------------------

## 29. Product Rule

> **Define the complete product once. Build one verified layer at a
> time.**

New ideas should be classified as: - **V1 REQUIRED** - **POST-LAUNCH** -
**OUT OF SCOPE**

Do not expand V1 merely because a feature is exciting.
