# CLAUDE.md --- THE AESTHETICS BIBLE

Read this file before changing the project.

## Product

**The Aesthetics Bible** is a luxury consumer aesthetics app.

Positioning:

> **See your possibilities. Discover your options. Plan your aesthetic
> journey.**

The app combines: - personalized aesthetics education; - structured
content from The Facial Aesthetics Bible; - AI visualization; -
social-photo enhancement; - provider discovery; - private treatment
tracking.

The complete product definition lives in `PRODUCT_SPEC.md`. Treat it as
the product source of truth.

For what is actually built, mocked, or not yet connected right now, see
`BUILD_STATUS.md` --- treat it as the current operational status, not a
substitute for the product definition above.

------------------------------------------------------------------------

## Current Build Goal

Build the **V1 only**.

Do not implement post-launch features merely because they appear in
`PRODUCT_SPEC.md`.

Before implementing any new feature, classify it:

1.  **V1 REQUIRED**
2.  **POST-LAUNCH**
3.  **OUT OF SCOPE**

If it is not V1 REQUIRED, do not silently add it.

------------------------------------------------------------------------

## V1 Core Loop

The primary user journey is:

**Aesthetics Profile quiz → top personalized match → explanation → Learn
/ Preview / Find / Save**

The first meaningful payoff should occur in roughly 60--120 seconds.

Do not bury the first useful result behind a paywall.

------------------------------------------------------------------------

## Primary Navigation

Maintain five primary destinations:

1.  **Home**
2.  **Plan**
3.  **Preview**
4.  **Bible**
5.  **Passport**

Do not add permanent tabs without explicit approval.

Near Me is contextual and can be entered from relevant screens.

------------------------------------------------------------------------

## Brand Rules

This must look like a luxury editorial beauty brand, not a generic
mobile template.

### Visual direction

-   black;
-   warm ivory;
-   champagne;
-   editorial serif display typography;
-   clean sans-serif functional typography;
-   generous whitespace;
-   restrained icons;
-   sophisticated photography;
-   minimal chrome.

### Do not introduce

-   bubblegum pink;
-   neon gradients;
-   cartoon anatomy;
-   generic med-spa visuals;
-   crowded dashboards;
-   excessive pills/badges;
-   emoji as core navigation icons;
-   random design-system changes.

Reuse design tokens. Do not hardcode one-off visual values across
screens.

### Brand Mark

An "AB" monogram (`components/brand/Monogram.tsx`) exists for sparing
use at genuine brand moments --- Home, Paywall, and shareable cards. Do
not scatter it across every screen or use it as decorative filler.

### Campaign Imagery

Approved editorial photography lives in `assets/brand/campaign/` and is
surfaced only through the existing `EditorialImage` /
`BeforeAfterFrame` components --- never through new one-off image
components. Marketing/editorial slots (portrait, social, treatment
variants) may fall back to an approved default photo; slots that
represent a user's own content (progress photos, a specific saved
provider) must never default to stock photography, since that would
misrepresent it as real.

------------------------------------------------------------------------

## Product Boundaries

### The app MAY

-   educate;
-   compare treatments;
-   organize user-stated goals;
-   surface treatment categories worth researching;
-   provide provider questions;
-   show cost/downtime/longevity context;
-   help users find providers;
-   track treatments entered by the user;
-   create clearly labeled AI aesthetic visualizations;
-   enhance social photos.

### The app MUST NOT be designed to

-   diagnose a face from a photo;
-   promise a medical result;
-   present an AI image as a predicted treatment outcome;
-   autonomously prescribe treatment;
-   provide personalized exact invasive injection placement/dose/depth
    instructions.

If a requested implementation crosses this boundary, stop and surface
the conflict before coding it.

------------------------------------------------------------------------

## Preview vs Glow

These are separate product modes.

### Preview

Aesthetic-look visualization.

Every output must be clearly presented as an **AI Visualization**, not a
guaranteed result.

### Glow

Social-photo enhancement.

Glow is not represented as a medical/aesthetic treatment outcome.

Do not merge these concepts into one ambiguous experience.

------------------------------------------------------------------------

## Recommendations

The Aesthetics Profile uses: - explicit multiple-choice user goals; -
preferences; - downtime tolerance; - budget; - treatment comfort; -
curated educational rules.

Do not replace this with uncontrolled LLM recommendation logic.

Recommendation rules should be testable and versionable.

------------------------------------------------------------------------

## Content

The owned Facial Aesthetics Bible is the foundation of the education
layer.

Convert content into structured records. Do not build the Bible as a
collection of hardcoded screens.

Preserve the source framework where applicable: - Preserve / Restore /
Rebuild; - seven layers of facial aging; - face zones; - treatment
education; - comparisons; - goal-based plans; - self-assessment; -
provider questions; - tracking concepts.

Content should support versioning/review dates and references.

------------------------------------------------------------------------

## Architecture

Preferred stack: - Expo; - React Native; - TypeScript; - Supabase; -
RevenueCat; - Google Places; - server-side AI/image integrations.

### General rules

-   TypeScript strictness where practical.
-   Separate UI, domain logic, data access, and external-provider
    adapters.
-   External AI/maps/billing providers should sit behind interfaces.
-   Do not couple core product logic directly to one AI vendor.
-   Centralize configuration.
-   Keep feature flags/quotas configurable.
-   Avoid duplicated business logic.
-   Use migrations for database changes.
-   Never modify production data casually.

------------------------------------------------------------------------

## Authentication and Data Ownership

Supabase is responsible for authentication and private user data.

Every user-owned table must have appropriate row-level security.

A user must never be able to access another user's: - plan; - quiz
answers; - Passport; - treatment history; - photos; - provider notes; -
budget; - saved looks; - AI generation records.

Do not trust client-supplied user IDs for authorization.

------------------------------------------------------------------------

## Photos

Treat user photos as private/high-sensitivity data.

Requirements: - private storage; - authenticated access; - signed URLs
where appropriate; - delete-photo flow; - account-deletion cascade; - no
public bucket; - no photo URLs in analytics; - no private image content
in logs; - no training/reuse without explicit user permission.

------------------------------------------------------------------------

## Secrets

Never commit: - Supabase service-role key; - AI provider secrets; -
RevenueCat secret keys; - Google server keys; - signing credentials; -
private tokens.

Client-safe public keys must still be handled through the documented
environment configuration.

`.env*` and secret files must be correctly covered by `.gitignore`.

------------------------------------------------------------------------

## AI Calls

AI/image generation must run through protected server-side
infrastructure.

Enforce: - authentication; - server-side entitlement checks where
relevant; - quotas; - rate limits; - cost telemetry; - safe failure
states; - report/flag mechanism where required.

Do not rely only on a disabled button in the client to protect a paid AI
endpoint.

------------------------------------------------------------------------

## Premium

Working launch test: - **\$14.99/month** - **\$99/year** --- hero offer

Use RevenueCat for native entitlements.

Do not sell lifetime access without an explicit product decision change.

Premium gating must not be enforced solely in the UI.

AI quotas must be server-verifiable.

Restore Purchases must work.

------------------------------------------------------------------------

## Paywall Rule

Quiz users should see their strongest personalized result before the
main roadmap paywall.

The paywall should sell the unlocked outcome: - full roadmap; - complete
Bible; - Passport/history; - Preview/Glow allowance; - planning tools; -
comparisons; - Premium utilities.

Do not turn the onboarding experience into a sequence of aggressive
paywalls.

------------------------------------------------------------------------

## V1 Required Features

-   luxury onboarding;
-   authentication;
-   Aesthetics Profile quiz;
-   top match;
-   locked full roadmap;
-   starter structured Bible;
-   search;
-   Google Places provider finder;
-   basic Passport;
-   private progress photos;
-   one Preview flow;
-   one Glow flow;
-   RevenueCat;
-   restore purchases;
-   analytics;
-   privacy/support/terms;
-   account deletion;
-   AI report flow where required;
-   secure storage;
-   rate limiting;
-   real-device testing.

------------------------------------------------------------------------

## NOT V1

Do not implement unless explicitly moved into V1:

-   full Advanced / DIY module;
-   affiliate marketplace;
-   paid provider listings;
-   Aesthetics Wrapped;
-   dozens of AI presets;
-   full Ask the Bible/Botox Bestie assistant;
-   every book chapter;
-   community;
-   messaging;
-   public photo feed;
-   full booking engine;
-   autonomous photo diagnosis;
-   personalized invasive-procedure prescription.

Architecture may anticipate these, but V1 UI/business logic should not
include them.

Botox Bestie currently exists only as a mocked, curated-content UI
(static Q&A, no LLM, at `/botox-bestie`) --- this is the approved V1
brand-visibility exception. The "full Ask the Bible/Botox Bestie
assistant" (grounded, LLM-backed) referenced above remains NOT V1 until
explicitly moved in.

------------------------------------------------------------------------

## Analytics

Use stable event names.

Minimum event set is defined in `PRODUCT_SPEC.md`.

Never include: - raw treatment notes; - private image URLs; - private
free text; - secrets/tokens; - unnecessary sensitive user data.

Analytics failures must never break the core user flow.

------------------------------------------------------------------------

## Testing Rule

Test after every meaningful change.

Do not stack multiple unrelated high-risk changes before testing.

For each feature verify: - happy path; - loading; - empty state; - error
state; - authorization; - Premium/free behavior; - real-device UX; -
analytics; - regression risk.

For native functionality, browser success is not sufficient. Test on
real devices.

------------------------------------------------------------------------

## Security Audit

Before release, run multiple fresh-context security audits.

At minimum check: - hardcoded secrets; - git history; - `.gitignore`; -
auth; - RLS; - private storage; - signed URLs; - IDOR; - API
authorization; - server-side validation; - AI abuse/cost-spam paths; -
Places abuse/cost-spam paths; - entitlement bypass; - logs; -
deletion; - image retention; - account deletion; - dependency issues.

Rank findings: - critical; - high; - medium; - low.

Fix and retest until no new material findings appear.

------------------------------------------------------------------------

## Definition of Done

A feature is complete only when: 1. implementation matches the approved
scope; 2. happy path works; 3. loading/empty/error states work; 4.
authorization is correct; 5. Premium gating is correct; 6. analytics are
correct; 7. real-device testing is complete where relevant; 8. tests
pass; 9. no private data/secrets leak; 10. documentation is updated.

------------------------------------------------------------------------

## Change Discipline

Before a large change: 1. read `PRODUCT_SPEC.md`; 2. read this file; 3.
inspect existing implementation; 4. identify affected flows; 5. state
the smallest safe change; 6. implement; 7. test; 8. update docs if
behavior changed.

Do not rewrite working architecture without a concrete reason.

Do not "clean up" unrelated code during a focused fix unless explicitly
requested.

------------------------------------------------------------------------

## Git Discipline

Use GitHub as the durable backup.

Before major phases: - confirm working tree; - commit a known-good
state; - use descriptive commit messages.

Do not commit secrets, generated credentials, or unnecessary build
artifacts.

------------------------------------------------------------------------

## Decision Log

Product decisions live in `PRODUCT_SPEC.md`.

If a decision changes --- pricing, paywall, navigation, AI provider,
recommendation rules, Premium boundary, V1 scope --- update the decision
log and this file where relevant.

Do not infer that an older code path overrides a newer documented
product decision.

------------------------------------------------------------------------

## Final Rule

> **Define the complete product once. Build one verified layer at a
> time.**

Protect: - the core loop; - the five-tab surface area; - the luxury
brand; - private user data; - store compliance; - V1 scope.
