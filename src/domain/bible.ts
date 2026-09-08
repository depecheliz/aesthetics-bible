/**
 * The Bible — structured local content library.
 *
 * Modeled loosely on the future `treatments` content schema (see
 * PRODUCT_SPEC.md §8) so this can later be replaced by Supabase-backed
 * content without changing the UI. Named treatments here are more
 * specific than the 12 generic recommendation categories in
 * recommendation.ts and each links back to one via `categoryId`, so
 * downtime/cost/longevity context stays in one place (no second source
 * of truth for that data).
 *
 * Content source: "The Facial Aesthetics Bible" (the owned manuscript).
 * The seven fields below `contentVersion`/`reviewDate` on each treatment
 * are sourced from the manuscript's per-treatment chapters and its
 * "Worth the Money?" cost/value chapter. Where the manuscript only gives
 * category-level guidance (discomfort, repeat frequency, value, who
 * should skip) rather than a distinct figure per named product, that
 * category-level guidance is used for every treatment in the category,
 * matching how the manuscript itself presents it.
 *
 * Two categories the manuscript covers at length -- regenerative medicine
 * (PRP, PRF, exosomes, polynucleotides, stem-cell-derived products) and
 * surgery (blepharoplasty, brow lift, facelift variants, neck lift) --
 * are intentionally not represented here. Surgery has no corresponding
 * TreatmentCategoryId in recommendation.ts, and adding one is out of
 * scope for a content-only pass. Regenerative medicine's best-fit
 * category, skin_boosters, is not a precise match for blood-derived and
 * DNA-fragment products, so it is left out rather than filed under a
 * misleading category.
 */

import { concernCandidates, treatmentCategories, type TreatmentCategoryId } from './recommendation';
import { concernLabels, type ConcernId } from './quiz';

export type BibleTreatmentId =
  | 'botox'
  | 'dysport'
  | 'xeomin'
  | 'daxxify'
  | 'fillers'
  | 'sculptra'
  | 'radiesse'
  | 'rf_microneedling'
  | 'emface'
  | 'exion'
  | 'thermage_flx'
  | 'ultherapy'
  | 'sofwave'
  | 'ipl_bbl'
  | 'laser_resurfacing'
  | 'laser_genesis'
  | 'eryag'
  | 'fraxel'
  | 'halo'
  | 'microneedling'
  | 'chemical_peel'
  | 'pdo_threads'
  | 'plla_threads'
  | 'suspension_threads'
  | 'retinoid'
  | 'vitamin_c'
  | 'peptides'
  | 'growth_factors';

/** The three stages of facial aging used throughout the manuscript, roughly ages 20-35, 35-55, and 55+. */
export type BibleStage = 'preserve' | 'restore' | 'rebuild';

/** The seven layers of facial aging from the manuscript's core framework. */
export type FacialAgingLayer =
  | 'skin_quality'
  | 'pigmentation'
  | 'collagen_loss'
  | 'fat_pad_changes'
  | 'muscle_movement'
  | 'ligament_laxity'
  | 'bone_remodeling';

export const facialAgingLayerLabels: Record<FacialAgingLayer, string> = {
  skin_quality: 'Skin quality',
  pigmentation: 'Pigmentation',
  collagen_loss: 'Collagen loss',
  fat_pad_changes: 'Fat pad changes',
  muscle_movement: 'Muscle movement',
  ligament_laxity: 'Ligament laxity',
  bone_remodeling: 'Bone remodeling',
};

export const bibleStageLabels: Record<BibleStage, string> = {
  preserve: 'Preserve',
  restore: 'Restore',
  rebuild: 'Rebuild',
};

export type BibleTreatment = {
  id: BibleTreatmentId;
  name: string;
  aliases: string[];
  categoryId: TreatmentCategoryId;
  overview: string;
  contentVersion: string;
  reviewDate: string;
  stage: BibleStage;
  primaryLayers: FacialAgingLayer[];
  whatItDoesNotAddress: string;
  discomfort: string;
  repeatFrequency: string;
  valueSummary: string;
  whoShouldSkip: string;
};

export const bibleTreatments: BibleTreatment[] = [
  {
    id: 'botox',
    name: 'Botox',
    aliases: ['Botox / Neuromodulators', 'Tox', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'The most widely explored neuromodulator brand, commonly used to soften the look of expression lines on the upper face.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['muscle_movement'],
    whatItDoesNotAddress:
      'Does not add volume, lift sagging tissue, or touch fat pads, ligaments, or bone. It only softens expression lines caused by muscle movement.',
    discomfort: 'Minimal -- brief injection discomfort, with occasional minor bruising.',
    repeatFrequency: 'Every three to four months for most patients.',
    valueSummary:
      'High value when the concern is genuinely dynamic muscle movement, though the repeat cost adds up over the years compared with living with the line.',
    whoShouldSkip:
      'Anyone whose actual concern is static lines (visible at rest) or volume loss rather than muscle movement -- a neuromodulator alone will not fully address either.',
  },
  {
    id: 'dysport',
    name: 'Dysport',
    aliases: ['Abobotulinumtoxin', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'A neuromodulator often explored as an alternative to Botox — a similar category of treatment with a different formulation and spread pattern.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['muscle_movement'],
    whatItDoesNotAddress:
      'Does not add volume, lift sagging tissue, or touch fat pads, ligaments, or bone, like all neuromodulators. It only softens expression lines caused by muscle movement.',
    discomfort: 'Minimal -- brief injection discomfort, with occasional minor bruising.',
    repeatFrequency: 'Every three to four months for most patients.',
    valueSummary:
      'High value for genuine dynamic muscle movement. Its smaller molecule size spreads further, which suits larger areas like the forehead but is less precise near the eyes.',
    whoShouldSkip: 'Anyone whose actual concern is static lines or volume loss rather than muscle movement.',
  },
  {
    id: 'xeomin',
    name: 'Xeomin',
    aliases: ['Incobotulinumtoxin', 'Naked Botulinum Toxin', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'A neuromodulator using a "naked" formulation without the accessory proteins found in Botox and Dysport, sometimes preferred for patients with documented reduced efficacy of other formulations.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['muscle_movement'],
    whatItDoesNotAddress:
      'Does not add volume, lift sagging tissue, or touch fat pads, ligaments, or bone, like all neuromodulators. It only softens expression lines caused by muscle movement.',
    discomfort: 'Minimal -- brief injection discomfort, with occasional minor bruising.',
    repeatFrequency: 'Every three to four months for most patients.',
    valueSummary:
      'High value for genuine dynamic muscle movement. The lack of accessory proteins means less diffusion and more localized control than Dysport.',
    whoShouldSkip: 'Anyone whose actual concern is static lines or volume loss rather than muscle movement.',
  },
  {
    id: 'daxxify',
    name: 'Daxxify',
    aliases: ['Daxibotulinumtoxin', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'A neuromodulator formulated for extended duration, with five-to-six-month data based primarily on studies of the glabellar (frown-line) area.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['muscle_movement'],
    whatItDoesNotAddress:
      'Does not add volume, lift sagging tissue, or touch fat pads, ligaments, or bone, like all neuromodulators. It only softens expression lines caused by muscle movement.',
    discomfort: 'Minimal -- brief injection discomfort, with occasional minor bruising.',
    repeatFrequency:
      'Two to three times a year for most patients -- less often than the other three neuromodulator brands.',
    valueSummary:
      'High value for genuine dynamic muscle movement. The longer duration usually comes at a higher per-treatment cost, which can be offset by fewer visits per year.',
    whoShouldSkip: 'Anyone whose actual concern is static lines or volume loss rather than muscle movement.',
  },
  {
    id: 'fillers',
    name: 'Fillers',
    aliases: ['Dermal Fillers', 'Hyaluronic Acid Filler', 'HA Filler'],
    categoryId: 'fillers',
    overview: treatmentCategories.fillers.overview,
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['fat_pad_changes'],
    whatItDoesNotAddress:
      'Does not stimulate meaningful new collagen production on its own, and does not address ligament laxity or bone remodeling. It replaces lost volume rather than rebuilding the structures underneath it.',
    discomfort: 'Mild to moderate, depending on treatment area and whether numbing is used.',
    repeatFrequency:
      'Annually or less for longer-lasting formulations; more frequently in high-movement areas like the lips, which metabolize filler faster.',
    valueSummary:
      'Strong value when matched to visible hollowing or flattening -- the most reversible of the volume-restoring options, since it can be dissolved with an enzyme if a correction is needed.',
    whoShouldSkip:
      'Anyone whose primary concern is structural descent rather than volume loss -- filler can camouflage descent but not correct it.',
  },
  {
    id: 'sculptra',
    name: 'Sculptra',
    aliases: ['Poly-L-lactic Acid', 'Biostimulator'],
    categoryId: 'biostimulators',
    overview:
      'A biostimulator brand commonly explored for gradual, natural-looking volume restoration across the face.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['fat_pad_changes', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not produce a same-day result. Expecting to look meaningfully different walking out of the first session applies the wrong mental model -- the HA filler model -- to a biostimulator that was never built to deliver that.',
    discomfort: 'Mild to moderate, depending on treatment area and whether numbing is used.',
    repeatFrequency: 'Delivered across a series of sessions spaced several weeks apart, then annually or less for maintenance.',
    valueSummary:
      'Strong long-term value per dollar given its extended duration, up to about two years, at the cost of slower, less immediate results.',
    whoShouldSkip: 'Anyone wanting an immediate, dramatic result, or whose primary concern is structural descent rather than volume.',
  },
  {
    id: 'radiesse',
    name: 'Radiesse',
    aliases: ['Calcium Hydroxylapatite', 'Biostimulator'],
    categoryId: 'biostimulators',
    overview:
      'A calcium hydroxylapatite biostimulator that provides some immediate volume from its gel carrier while also stimulating collagen production over time -- a hybrid between immediate-volume fillers and gradual biostimulators like Sculptra.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['fat_pad_changes', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not match the precision and reversibility of HA filler -- it cannot be dissolved with an enzyme, which makes provider skill and conservative dosing more important.',
    discomfort: 'Mild to moderate, depending on treatment area and whether numbing is used.',
    repeatFrequency: 'Annually or less for most patients.',
    valueSummary:
      'Strong long-term value, typically lasting twelve to eighteen months -- between the shorter duration of most HA fillers and the longer duration of Sculptra.',
    whoShouldSkip:
      'Anyone wanting an immediate, dramatic result comparable to HA filler, or whose primary concern is structural descent rather than volume.',
  },
  {
    id: 'rf_microneedling',
    name: 'RF Microneedling',
    aliases: ['Morpheus8', 'Radiofrequency Microneedling'],
    categoryId: 'rf',
    overview:
      'Combines microneedling with radiofrequency energy, commonly explored for texture and mild skin firming.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not add volume, relax muscle movement, or rebuild bone. Like the other Level 2 tools, it works on skin quality and early collagen decline, not structure.',
    discomfort: 'Mild, generally tolerable with topical numbing where used.',
    repeatFrequency: 'Every four to eight weeks during an active series, then periodic maintenance.',
    valueSummary:
      'Strong value in the Preserve stage specifically, where it matches the layers actually active; weaker value if used later as a substitute for a tool better matched to a more advanced concern.',
    whoShouldSkip:
      'Anyone expecting a dramatic, single-session transformation -- the value depends on realistic, insurance-style expectations.',
  },
  {
    id: 'emface',
    name: 'EMFACE',
    aliases: ['Radiofrequency Muscle Toning'],
    categoryId: 'rf',
    overview:
      'A device combining radiofrequency energy for collagen stimulation with synchronized muscle stimulation, similar in concept to EMSculpt for the body -- targeting both skin and facial muscles in the same session, with no needles and no downtime.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['collagen_loss', 'skin_quality'],
    whatItDoesNotAddress:
      'Does not add volume, relax expression-driven lines the way a neuromodulator does, or rebuild bone. Evidence is promising but still developing -- manufacturer-sponsored randomized controlled trials exist, with independent long-term data still emerging as of this edition.',
    discomfort: 'Mild to moderate -- among the more comfortable devices in this category, with no needles and minimal downtime.',
    repeatFrequency: 'A series of weekly sessions over about a month, then annual maintenance.',
    valueSummary:
      'Reasonable value for genuine skin laxity and quality concerns; weaker if used to chase results it is not built to produce, like meaningful volume restoration.',
    whoShouldSkip:
      'Anyone with significant ligament laxity or bone remodeling, or expecting a surgical-level result -- this is a genuine Level 5 tool, not a Level 6 or surgical substitute.',
  },
  {
    id: 'exion',
    name: 'Exion',
    aliases: ['Radiofrequency', 'AI-Guided Radiofrequency'],
    categoryId: 'rf',
    overview:
      'A device using monopolar radiofrequency with AI-guided energy delivery alongside ultrasound imaging for treatment guidance, typically used across a multi-session series for broader skin-quality and tightening.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['collagen_loss', 'skin_quality'],
    whatItDoesNotAddress:
      'Does not add volume, relax expression-driven lines, or rebuild bone. Evidence status is promising, with primarily manufacturer-sponsored studies available as of this edition.',
    discomfort: 'Mild to moderate, varying by energy level.',
    repeatFrequency:
      'A multi-session series, then annual maintenance -- more frequent than most other devices in this category during the initial series.',
    valueSummary:
      'Reasonable value for genuine skin laxity and quality concerns; weaker if used to chase results it is not built to produce, like meaningful volume restoration or a surgical-level lift.',
    whoShouldSkip: 'Anyone with significant ligament laxity or bone remodeling, or expecting a surgical-level result.',
  },
  {
    id: 'thermage_flx',
    name: 'Thermage FLX',
    aliases: ['Radiofrequency Skin Tightening'],
    categoryId: 'rf',
    overview:
      "A radiofrequency device delivering energy through the skin's surface to heat deeper tissue and stimulate collagen remodeling, with one of the longest track records of any device in this category.",
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['collagen_loss', 'skin_quality'],
    whatItDoesNotAddress: 'Does not add volume, relax expression-driven lines, or rebuild bone.',
    discomfort: 'Mild to moderate; sometimes involves brief swelling.',
    repeatFrequency: 'A single-session protocol, then annual maintenance for most patients.',
    valueSummary: 'Reasonable value for genuine skin laxity and texture concerns; weaker if used to chase a surgical-level lift.',
    whoShouldSkip: 'Anyone with significant ligament laxity or bone remodeling, or expecting a surgical-level result.',
  },
  {
    id: 'ultherapy',
    name: 'Ultherapy',
    aliases: ['Ultherapy Prime', 'Ultrasound Lifting'],
    categoryId: 'ultrasound',
    overview: treatmentCategories.ultrasound.overview,
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['collagen_loss', 'ligament_laxity'],
    whatItDoesNotAddress:
      'Is not structural ligament reattachment -- it is collagen-induced tissue firming, and results are generally more subtle than surgical lifting. Does not add volume or rebuild bone.',
    discomfort: 'Mild to moderate, varying by energy level.',
    repeatFrequency: 'Typically a single session, then annual maintenance.',
    valueSummary:
      'Reasonable value for early to moderate skin laxity in the lower face, jawline, and neck; weaker if used to chase a surgical-level result.',
    whoShouldSkip: 'Anyone with significant ligament laxity or bone remodeling, or expecting a surgical-level result.',
  },
  {
    id: 'sofwave',
    name: 'Sofwave',
    aliases: ['Ultrasound Lifting'],
    categoryId: 'ultrasound',
    overview:
      'An ultrasound-based device often explored as an alternative to Ultherapy for gentle lifting and firming.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'restore',
    primaryLayers: ['collagen_loss', 'skin_quality'],
    whatItDoesNotAddress: 'Does not add volume or rebuild bone, and results are generally more subtle than surgical lifting.',
    discomfort: 'Mild -- designed to minimize discomfort compared with older ultrasound devices.',
    repeatFrequency: 'Typically a single session, then annual maintenance.',
    valueSummary:
      'Reasonable value for skin quality and mild laxity concerns, particularly for patients prioritizing comfort and a shorter session; weaker if used to chase a surgical-level result.',
    whoShouldSkip: 'Anyone with significant ligament laxity or bone remodeling, or expecting a surgical-level result.',
  },
  {
    id: 'ipl_bbl',
    name: 'IPL / BBL',
    aliases: ['Intense Pulsed Light', 'BroadBand Light', 'Photofacial'],
    categoryId: 'lasers',
    overview:
      'Light-based treatments commonly explored for pigmentation, sun damage, and overall complexion brightness.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['pigmentation'],
    whatItDoesNotAddress:
      'Addresses pigmentation and redness only -- it does not touch volume, structure, or muscle movement, and will not address texture or deep static lines the way resurfacing lasers do.',
    discomfort: 'Minimal.',
    repeatFrequency:
      'Several sessions typically needed for a full result; treated spots darken and flake off over one to two weeks per session.',
    valueSummary:
      "Strong value for sun spots, redness, and early UV-driven pigmentation. BBL's collagen-support claim is real but modest -- do not choose it over dedicated collagen-banking treatments if collagen stimulation is the main goal.",
    whoShouldSkip: 'Anyone whose primary concern is texture, volume, or structure rather than pigmentation and redness.',
  },
  {
    id: 'laser_resurfacing',
    name: 'Laser Resurfacing',
    aliases: ['CO2 Laser', 'Fractional Laser', 'Fractional CO2'],
    categoryId: 'lasers',
    overview:
      'A more intensive laser treatment commonly explored for texture, fine lines, and overall skin resurfacing.',
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['skin_quality', 'pigmentation'],
    whatItDoesNotAddress:
      'Works on the surface layer only -- it does not touch ligament laxity or bone remodeling, the layers usually driving most of the change by this stage.',
    discomfort:
      'Mild to significant, scaling with treatment intensity -- this is the most aggressive resurfacing option, with the strongest single-session result.',
    repeatFrequency: 'A single aggressive session can suffice for years, or a series of gentler sessions repeated periodically.',
    valueSummary: 'Strong value when matched to genuine textural or pigmentation damage, and when Fitzpatrick skin-type considerations are taken seriously.',
    whoShouldSkip:
      'Anyone whose primary concern is volume or structure rather than surface quality. Deeper Fitzpatrick skin types (IV-VI) carry a real risk of pigment-related complications and need a provider with specific experience treating that skin type.',
  },
  {
    id: 'laser_genesis',
    name: 'Laser Genesis',
    aliases: ['Non-Ablative Laser'],
    categoryId: 'lasers',
    overview:
      'A non-ablative laser that gently heats the upper layers of skin to reduce redness, improve texture, and stimulate a mild collagen response, without the visible peeling or downtime of more aggressive resurfacing lasers.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality'],
    whatItDoesNotAddress:
      'Is not a substitute for ablative or fractional resurfacing lasers, which create a stronger injury for a stronger collagen response -- Laser Genesis sits well below that on the intensity scale.',
    discomfort: 'Minimal -- no visible peeling or downtime.',
    repeatFrequency: 'Low-commitment maintenance treatment rather than a single corrective procedure.',
    valueSummary: 'Strong value for general skin quality refinement, redness reduction, and pore appearance as ongoing maintenance rather than correction.',
    whoShouldSkip: 'Anyone seeking a stronger result for significant textural damage or deep static lines -- better matched to fractional or ablative resurfacing.',
  },
  {
    id: 'eryag',
    name: 'Er:YAG',
    aliases: ['Erbium YAG', 'Erbium Laser'],
    categoryId: 'lasers',
    overview:
      'An erbium YAG ablative laser absorbed more precisely by water in the skin than fractional CO2, allowing a more controlled depth of injury and typically a faster recovery for a broadly similar outcome at comparable ablation depths.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['skin_quality', 'pigmentation'],
    whatItDoesNotAddress:
      'Works on the surface layer only -- does not touch ligament laxity or bone remodeling. Results are generally considered somewhat less aggressive than a comparable fractional CO2 treatment.',
    discomfort: 'Moderate, scaling with treatment intensity.',
    repeatFrequency: 'A single session can suffice for meaningful results; periodic sessions for maintenance.',
    valueSummary:
      'Strong value when matched to genuine textural or pigmentation damage, as a middle option between fractional CO2 intensity and gentler non-ablative devices.',
    whoShouldSkip:
      'Anyone whose primary concern is volume or structure rather than surface quality. Deeper Fitzpatrick skin types (IV-VI) carry a real risk of pigment-related complications with ablative treatments and need a provider with specific experience treating that skin type.',
  },
  {
    id: 'fraxel',
    name: 'Fraxel',
    aliases: ['Fractional Laser'],
    categoryId: 'lasers',
    overview:
      'A brand name covering both non-ablative and ablative fractional laser platforms, with the non-ablative version being one of the more established, lower-downtime options for patients not ready for a more aggressive ablative treatment.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['skin_quality', 'pigmentation'],
    whatItDoesNotAddress:
      'Works on the surface layer only -- does not touch ligament laxity or bone remodeling. The non-ablative version trades some single-session strength for a shorter recovery.',
    discomfort: 'Mild to moderate, scaling with treatment intensity and whether the ablative or non-ablative version is used.',
    repeatFrequency: 'Frequently used as a repeated series rather than a single aggressive treatment.',
    valueSummary:
      'Strong value for mild to moderate textural concerns and pigmentation, for patients prioritizing minimal downtime over the strongest single-session result.',
    whoShouldSkip:
      'Anyone whose primary concern is volume or structure rather than surface quality, or who needs the strongest single-session result quickly. Deeper Fitzpatrick skin types (IV-VI) need a provider with specific experience treating that skin type, especially for the ablative version.',
  },
  {
    id: 'halo',
    name: 'Halo',
    aliases: ['Hybrid Fractional Laser'],
    categoryId: 'lasers',
    overview:
      'A hybrid fractional laser delivering both ablative and non-ablative wavelengths in a single treatment, balancing a more aggressive resurfacing effect against a gentler, broader collagen-stimulating effect.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['skin_quality', 'pigmentation'],
    whatItDoesNotAddress: 'Works on the surface layer only -- does not touch ligament laxity or bone remodeling.',
    discomfort: 'Moderate, shifting with how aggressively the ablative component is dialed in for that session.',
    repeatFrequency: 'A single session can suffice for meaningful results; periodic sessions for maintenance.',
    valueSummary:
      'Strong value when matched to genuine textural or pigmentation damage, as a calibrated middle ground between non-ablative devices and full fractional CO2.',
    whoShouldSkip:
      'Anyone whose primary concern is volume or structure rather than surface quality. Deeper Fitzpatrick skin types (IV-VI) carry a real risk of pigment-related complications with the ablative component and need a provider with specific experience treating that skin type.',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    aliases: ['Collagen Induction Therapy'],
    categoryId: 'microneedling',
    overview: treatmentCategories.microneedling.overview,
    contentVersion: 'v2',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not add volume, relax muscle movement, or rebuild bone -- it works on skin quality and early collagen decline through mechanical micro-injury alone, without radiofrequency.',
    discomfort: 'Gentlest option in its category -- minimal recovery.',
    repeatFrequency: 'Every four to eight weeks during an active series, then periodic maintenance.',
    valueSummary:
      'Strong value in the Preserve stage specifically, as a first entry point into collagen banking; weaker value if used later as a substitute for a tool better matched to a more advanced concern.',
    whoShouldSkip: 'Anyone expecting a dramatic, single-session transformation.',
  },
  {
    id: 'chemical_peel',
    name: 'Chemical Peel',
    aliases: ['Peel'],
    categoryId: 'peels',
    overview:
      "An acid solution applied to the skin's surface to remove the outermost damaged layers, prompting smoother, more even skin underneath as it heals. Ranges from light surface treatments with no downtime to medium-depth peels requiring several days of recovery.",
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'pigmentation'],
    whatItDoesNotAddress:
      "Does not address volume loss, structural change, or deep static lines -- it works on the skin's surface and was never built to reach anything underneath it.",
    discomfort: 'Mild, generally tolerable with topical numbing where used.',
    repeatFrequency: 'Every four to eight weeks during an active series, then periodic maintenance.',
    valueSummary: 'Strong value as one of the more accessible entry points into professional skin treatment, with minimal commitment and a fast return to normal activity.',
    whoShouldSkip: 'Anyone expecting it to address volume loss, structural change, or deep static lines.',
  },
  {
    id: 'pdo_threads',
    name: 'PDO Threads',
    aliases: ['Polydioxanone Threads'],
    categoryId: 'threads',
    overview:
      'The most established thread type, made from a material with a long track record in surgical sutures before being adapted for cosmetic lifting. Inserted under the skin, they provide an immediate mechanical lift while stimulating a mild collagen response as they gradually dissolve.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['ligament_laxity', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not touch bone remodeling, and is not a substitute for surgery in cases of significant descent or structural change -- the lift comes from repositioning and supporting existing soft tissue.',
    discomfort: 'Moderate -- more involved than injectables but less than surgery.',
    repeatFrequency:
      'Smooth mono threads dissolve in four to six months; barbed or cog threads provide mechanical lift lasting six months to a year. Repeat as needed, annually or longer.',
    valueSummary:
      'Reasonable value for the right candidate with genuine mild-to-moderate descent; poor value as a lower-cost substitute for a facelift when the underlying concern is structural enough to need one.',
    whoShouldSkip: 'Anyone with significant bone remodeling or extensive ligament laxity, where threads would camouflage rather than correct.',
  },
  {
    id: 'plla_threads',
    name: 'PLLA Threads',
    aliases: ['Poly-L-lactic Acid Threads'],
    categoryId: 'threads',
    overview:
      "Threads using the same biostimulating material found in Sculptra, combined with a thread's mechanical lifting structure -- giving a stronger, longer-lasting collagen response than PDO threads, at the cost of longer recovery and a higher price point.",
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['ligament_laxity', 'collagen_loss'],
    whatItDoesNotAddress: 'Does not touch bone remodeling, and is not a substitute for surgery when structural change, not just position, is the real concern.',
    discomfort: 'Moderate -- more involved than injectables but less than surgery.',
    repeatFrequency: 'Typically lasts a year to eighteen months; repeat as needed.',
    valueSummary:
      'Reasonable value for the right candidate wanting a more substantial biostimulating effect than PDO threads and comfortable with a gradual result; poor value as a facelift substitute for structural concerns.',
    whoShouldSkip: 'Anyone with significant bone remodeling or extensive ligament laxity, or unwilling to wait for a gradual result.',
  },
  {
    id: 'suspension_threads',
    name: 'Suspension Threads',
    aliases: ['Barbed Threads', 'Cog Threads'],
    categoryId: 'threads',
    overview:
      'Barbed or cog threads designed specifically for mechanical lift rather than collagen stimulation -- small barbs or cones along the thread grip surrounding tissue, allowing the provider to physically reposition and suspend descended tissue.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'rebuild',
    primaryLayers: ['ligament_laxity'],
    whatItDoesNotAddress:
      'Does not touch bone remodeling, and is not a substitute for surgery when structural change, not just position, is the real concern. Provides minimal collagen stimulation compared with PDO or PLLA threads.',
    discomfort: 'Moderate -- more involved than injectables but less than surgery.',
    repeatFrequency:
      'Typically lasts six months to a year -- generally shorter than PLLA threads, since the lift depends more on physical grip than a durable collagen response.',
    valueSummary:
      'Reasonable value for more noticeable jowling or midface descent needing a stronger mechanical lift, sometimes as a bridge before surgery; poor value as a permanent facelift substitute.',
    whoShouldSkip: 'Anyone with significant bone remodeling or extensive ligament laxity, where threads would camouflage rather than correct.',
  },
  {
    id: 'retinoid',
    name: 'Retinoid',
    aliases: ['Retinol', 'Tretinoin'],
    categoryId: 'skincare',
    overview:
      'A vitamin A derivative and the most studied topical anti-aging ingredient available without a prescription. It increases cell turnover and stimulates collagen production, making it one of the few topicals that actively builds rather than only protects.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress: 'Does not reverse existing volume loss or structural change -- this is a skin-quality and collagen-support ingredient, not a fix for the deeper layers.',
    discomfort: 'Minimal -- occasional irritation when starting.',
    repeatFrequency: 'Daily.',
    valueSummary: 'One of the highest-evidence topicals in the manuscript; visible improvement in texture and tone typically takes eight to twelve weeks of consistent use.',
    whoShouldSkip: 'Nobody as a category, though people with high sensitivity may need to start at a low concentration to build tolerance.',
  },
  {
    id: 'vitamin_c',
    name: 'Vitamin C',
    aliases: ['Topical Antioxidant'],
    categoryId: 'skincare',
    overview:
      'A topical antioxidant that helps neutralize free radical damage from UV exposure and pollution while directly supporting collagen synthesis, typically applied each morning underneath sunscreen.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress: 'Does not reverse existing volume loss or structural change -- this is a skin-quality and collagen-support ingredient, not a fix for the deeper layers.',
    discomfort: 'Minimal.',
    repeatFrequency: 'Daily, applied each morning under sunscreen.',
    valueSummary: 'High-evidence category; antioxidant effect is immediate, and collagen support builds over weeks to months.',
    whoShouldSkip: 'Nobody as a category.',
  },
  {
    id: 'peptides',
    name: 'Peptides',
    aliases: ['Peptide Serum'],
    categoryId: 'skincare',
    overview:
      'Short chains of amino acids that signal skin cells to behave the way they did when collagen production was higher. Evidence varies significantly by formulation -- some, like palmitoyl pentapeptide-4, have stronger clinical data than others.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not work as well as injectables or in-office devices, despite marketing language that sometimes implies otherwise. It is a complement to retinoids and vitamin C, not a replacement for either.',
    discomfort: 'Minimal -- tends to be better tolerated than retinoids.',
    repeatFrequency: 'Daily, alongside retinoids and vitamin C.',
    valueSummary: 'Moderate evidence, varying by formulation; a reasonable option for skin that cannot yet handle a strong retinoid.',
    whoShouldSkip: 'Anyone expecting it to substitute for the right treatment at the right stage -- it is a complement, not a replacement.',
  },
  {
    id: 'growth_factors',
    name: 'Growth Factors',
    aliases: ['Growth Factor Serum'],
    categoryId: 'skincare',
    overview:
      'Topical serums positioned to signal skin cells to produce collagen and elastin -- one of the more advanced topical categories, though the research base is smaller than for retinoids or vitamin C, and results vary more by formulation and concentration than marketing usually suggests.',
    contentVersion: 'v1',
    reviewDate: '2026-09-07',
    stage: 'preserve',
    primaryLayers: ['skin_quality', 'collagen_loss'],
    whatItDoesNotAddress:
      'Does not substitute for the fundamentals -- best used as an optional addition once sunscreen, vitamin C, and a retinoid are already in place and tolerated well.',
    discomfort: 'Minimal.',
    repeatFrequency: 'Daily, as an addition once the fundamentals are established.',
    valueSummary: 'Smaller evidence base than retinoids or vitamin C; a refinement rather than a starting point.',
    whoShouldSkip: 'Anyone who has not yet established sunscreen, vitamin C, and a retinoid -- this is a refinement, not a starting point.',
  },
];

export type BibleConcernId = 'fine_lines' | 'pigmentation' | 'sagging_skin' | 'texture_pores' | 'volume_loss' | 'under_eye' | 'jawline';

const bibleConcernLabelOverrides: Partial<Record<ConcernId, string>> = {
  sagging_skin: 'Skin laxity',
};

const bibleConcernIds: BibleConcernId[] = [
  'fine_lines',
  'pigmentation',
  'sagging_skin',
  'texture_pores',
  'volume_loss',
  'under_eye',
  'jawline',
];

export type BibleConcern = {
  id: BibleConcernId;
  name: string;
  relatedTreatments: BibleTreatment[];
};

function treatmentsForCategories(categoryIds: TreatmentCategoryId[]): BibleTreatment[] {
  return bibleTreatments.filter((treatment) => categoryIds.includes(treatment.categoryId));
}

export const bibleConcerns: BibleConcern[] = bibleConcernIds.map((id) => ({
  id,
  name: bibleConcernLabelOverrides[id] ?? concernLabels[id],
  relatedTreatments: treatmentsForCategories(concernCandidates[id]),
}));

export function searchBibleTreatments(query: string, source: BibleTreatment[] = bibleTreatments): BibleTreatment[] {
  const q = query.trim().toLowerCase();
  if (!q) return source;
  return source.filter((treatment) => {
    if (treatment.name.toLowerCase().includes(q)) return true;
    if (treatment.aliases.some((alias) => alias.toLowerCase().includes(q))) return true;
    if (treatmentCategories[treatment.categoryId].name.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function filterBibleTreatmentsByCategory(
  categoryId: TreatmentCategoryId | 'all',
  source: BibleTreatment[] = bibleTreatments,
): BibleTreatment[] {
  if (categoryId === 'all') return source;
  return source.filter((treatment) => treatment.categoryId === categoryId);
}

export const bibleCategoryFilters: TreatmentCategoryId[] = Array.from(
  new Set(bibleTreatments.map((treatment) => treatment.categoryId)),
);

/**
 * Looks up a Bible entry by id. Falls back to a generic recommendation
 * category (e.g. "/bible/tox") so links from the Result screen's
 * "Learn More" action keep working even when there's no dedicated named
 * Bible entry for that category yet.
 */
export function getBibleTreatmentById(id: string): BibleTreatment | undefined {
  const direct = bibleTreatments.find((treatment) => treatment.id === id);
  if (direct) return direct;

  const category = treatmentCategories[id as TreatmentCategoryId];
  if (!category) return undefined;

  return {
    id: category.id as BibleTreatmentId,
    name: category.name,
    aliases: [],
    categoryId: category.id,
    overview: category.overview,
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
    stage: 'restore',
    primaryLayers: [],
    whatItDoesNotAddress: '',
    discomfort: category.downtimeContext,
    repeatFrequency: '',
    valueSummary: '',
    whoShouldSkip: '',
  };
}

/**
 * Finds another category worth comparing a given one against, by looking
 * for a concern whose candidate list contains both. Pure lookup over
 * existing recommendation data — does not alter recommendation rules.
 * Used to offer a sensible default "Compare" pairing on Bible detail
 * pages without hardcoding all category pairs.
 */
export function findComparableCategoryId(categoryId: TreatmentCategoryId): TreatmentCategoryId | undefined {
  for (const candidates of Object.values(concernCandidates)) {
    if (!candidates.includes(categoryId)) continue;
    const other = candidates.find((id) => id !== categoryId);
    if (other) return other;
  }
  return undefined;
}

/**
 * Finds another named Bible treatment worth comparing a given one
 * against, preferring a treatment in the same category (e.g. Botox vs.
 * Dysport) so Compare can show real treatment-level differences rather
 * than only category-level ones. Returns undefined if this is the only
 * named treatment in its category.
 */
export function findComparableTreatmentId(treatmentId: BibleTreatmentId): BibleTreatmentId | undefined {
  const treatment = bibleTreatments.find((t) => t.id === treatmentId);
  if (!treatment) return undefined;
  const sameCategory = bibleTreatments.find((t) => t.id !== treatmentId && t.categoryId === treatment.categoryId);
  return sameCategory?.id;
}

/**
 * The five core provider questions from the manuscript's "Recommended
 * Questions for Any Provider" appendix -- the ones the manuscript says
 * apply to every treatment in the book without exception, from a Level 2
 * skincare routine to a Level 7 surgical procedure.
 */
export const bibleCoreProviderQuestions: string[] = [
  'Which layer is this treatment actually addressing?',
  'What will this not fix?',
  'What is the realistic timeline before I see the full result?',
  'What would make me a poor candidate for this?',
  'What does maintenance actually look like, and what does a year of this cost?',
];

/**
 * Treatment-specific provider questions, drawn only from cases where the
 * manuscript's own chapter content clearly supports a question beyond
 * the five core ones above. Deliberately not populated for every
 * treatment -- most are well covered by the five core questions alone.
 */
export const bibleSpecificProviderQuestions: Partial<Record<BibleTreatmentId, string[]>> = {
  botox: ['Of the four neuromodulator brands, which do you recommend for me, and why?'],
  dysport: ['Of the four neuromodulator brands, which do you recommend for me, and why?'],
  xeomin: ['Of the four neuromodulator brands, which do you recommend for me, and why?'],
  daxxify: ['Of the four neuromodulator brands, which do you recommend for me, and why?'],
  fillers: ['Can this be dissolved with an enzyme if I want to reverse or adjust it later?'],
  radiesse: ['Since this cannot be dissolved with an enzyme, how conservatively do you dose a first session?'],
  laser_resurfacing: ['What is your experience treating my specific Fitzpatrick skin type with this device?'],
  eryag: ['What is your experience treating my specific Fitzpatrick skin type with this device?'],
  fraxel: ['What is your experience treating my specific Fitzpatrick skin type with this device?'],
  halo: ['What is your experience treating my specific Fitzpatrick skin type with this device?'],
  pdo_threads: [
    'Which thread design and type fit my degree of laxity, and is a surgical consultation worth a second opinion first?',
  ],
  plla_threads: [
    'Which thread design and type fit my degree of laxity, and is a surgical consultation worth a second opinion first?',
  ],
  suspension_threads: [
    'Which thread design and type fit my degree of laxity, and is a surgical consultation worth a second opinion first?',
  ],
};
