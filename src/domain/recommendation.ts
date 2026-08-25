/**
 * Mock recommendation engine.
 *
 * Deterministic, rule-based matching from quiz answers to a treatment
 * category — no LLM, no randomness. Rules are versioned (RULES_VERSION)
 * so behavior changes are visible in diffs/tests rather than silent.
 *
 * This is educational category matching, not diagnosis or prescription
 * (see CLAUDE.md Product Boundaries): it never analyzes a photo and never
 * outputs an invasive-procedure dose/placement instruction.
 */

import {
  areaLabels,
  comfortLabels,
  concernLabels,
  intensityLabels,
  type AreaId,
  type ComfortId,
  type ConcernId,
  type DowntimeId,
  type IntensityId,
  type QuizAnswers,
} from './quiz';

export const RULES_VERSION = 'v1';

export type ComfortLevel = 'skincare' | 'device' | 'injectable';
export type DowntimeTier = 'none' | 'short' | 'medium' | 'long';

export type TreatmentCategoryId =
  | 'tox'
  | 'fillers'
  | 'skin_boosters'
  | 'biostimulators'
  | 'lasers'
  | 'rf'
  | 'ultrasound'
  | 'microneedling'
  | 'peels'
  | 'threads'
  | 'skincare'
  | 'at_home_devices';

export type TreatmentCategory = {
  id: TreatmentCategoryId;
  name: string;
  overview: string;
  bestSuitedFor: string;
  comfortLevel: ComfortLevel;
  downtimeTier: DowntimeTier;
  costTier: 1 | 2 | 3 | 4;
  downtimeContext: string;
  costContext: string;
  longevityContext: string;
};

export const treatmentCategories: Record<TreatmentCategoryId, TreatmentCategory> = {
  tox: {
    id: 'tox',
    name: 'Tox / Neuromodulators',
    overview:
      'Injectable treatments that soften the look of dynamic lines caused by repeated muscle movement, such as around the forehead and eyes.',
    bestSuitedFor: 'Forehead lines, crow’s feet, and other lines caused by expression.',
    comfortLevel: 'injectable',
    downtimeTier: 'none',
    costTier: 2,
    downtimeContext: 'Typically no downtime — most people return to normal activity immediately.',
    costContext: 'Commonly $300–$700 per session, depending on area and provider.',
    longevityContext: 'Results are commonly explored as lasting roughly 3–4 months.',
  },
  fillers: {
    id: 'fillers',
    name: 'Fillers',
    overview:
      'Injectable treatments used to add volume or soften contours in areas such as the lips, cheeks, or jawline.',
    bestSuitedFor: 'Volume loss, lip shape, and softening contours in the cheeks or jawline.',
    comfortLevel: 'injectable',
    downtimeTier: 'short',
    costTier: 3,
    downtimeContext: 'Some swelling or bruising is common for a few days.',
    costContext: 'Commonly $600–$1,200 per syringe, depending on area and product.',
    longevityContext: 'Results are commonly explored as lasting 6–18 months depending on area.',
  },
  skin_boosters: {
    id: 'skin_boosters',
    name: 'Skin Boosters',
    overview:
      'Injectable hydration treatments aimed at improving skin quality and radiance, often explored for under-eye or overall skin appearance.',
    bestSuitedFor: 'Under-eye hollowing, skin hydration, and overall radiance.',
    comfortLevel: 'injectable',
    downtimeTier: 'none',
    costTier: 2,
    downtimeContext: 'Minimal downtime — light redness or small bumps may settle within a day.',
    costContext: 'Commonly $350–$700 per session.',
    longevityContext: 'Results are commonly explored as building over a short series, lasting months.',
  },
  biostimulators: {
    id: 'biostimulators',
    name: 'Biostimulators',
    overview:
      'Injectable treatments that work gradually to support the skin’s own structure, often explored for overall volume loss.',
    bestSuitedFor: 'Gradual, overall volume loss across the face.',
    comfortLevel: 'injectable',
    downtimeTier: 'short',
    costTier: 3,
    downtimeContext: 'Mild swelling or tenderness for a few days is common.',
    costContext: 'Commonly $700–$1,500 per session, often in a series.',
    longevityContext: 'Results are commonly explored as building gradually and lasting a year or more.',
  },
  lasers: {
    id: 'lasers',
    name: 'Lasers',
    overview:
      'Light-based treatments commonly explored for pigmentation, sun damage, and overall skin resurfacing.',
    bestSuitedFor: 'Pigmentation, sun damage, and overall skin resurfacing.',
    comfortLevel: 'device',
    downtimeTier: 'medium',
    costTier: 3,
    downtimeContext: 'Redness or flaking commonly explored for several days depending on intensity.',
    costContext: 'Commonly $300–$900 per session.',
    longevityContext: 'Results are commonly explored as building over a short series.',
  },
  rf: {
    id: 'rf',
    name: 'RF (Radiofrequency)',
    overview:
      'Device-based treatments that use heat energy, often explored for skin texture and mild firming.',
    bestSuitedFor: 'Skin texture, pores, and mild firming.',
    comfortLevel: 'device',
    downtimeTier: 'short',
    costTier: 3,
    downtimeContext: 'Mild redness or swelling for a few days is common with more intensive devices.',
    costContext: 'Commonly $500–$1,200 per session, often in a series.',
    longevityContext: 'Results are commonly explored as building gradually over several months.',
  },
  ultrasound: {
    id: 'ultrasound',
    name: 'Ultrasound',
    overview:
      'Non-invasive device treatments commonly explored for skin laxity and gentle lifting.',
    bestSuitedFor: 'Mild-to-moderate skin laxity and gentle lifting.',
    comfortLevel: 'device',
    downtimeTier: 'none',
    costTier: 4,
    downtimeContext: 'Typically no downtime, though mild tenderness may occur.',
    costContext: 'Commonly $1,000–$2,500 per session.',
    longevityContext: 'Results are commonly explored as building over months and lasting up to a year.',
  },
  microneedling: {
    id: 'microneedling',
    name: 'Microneedling',
    overview:
      'A device-based treatment that creates controlled micro-injury, commonly explored for texture, pores, and acne scarring.',
    bestSuitedFor: 'Texture, enlarged pores, and acne scarring.',
    comfortLevel: 'device',
    downtimeTier: 'short',
    costTier: 2,
    downtimeContext: 'Redness commonly explored for 1–3 days.',
    costContext: 'Commonly $300–$700 per session, often in a series.',
    longevityContext: 'Results are commonly explored as building gradually over a series of sessions.',
  },
  peels: {
    id: 'peels',
    name: 'Peels',
    overview:
      'Topical exfoliating treatments commonly explored for pigmentation, texture, and overall skin brightness.',
    bestSuitedFor: 'Pigmentation, dullness, and mild texture concerns.',
    comfortLevel: 'device',
    downtimeTier: 'short',
    costTier: 1,
    downtimeContext: 'Flaking or peeling commonly explored for several days depending on strength.',
    costContext: 'Commonly $150–$400 per session.',
    longevityContext: 'Results are commonly explored as building with a regular series.',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    overview:
      'A minimally invasive treatment used to support the look of firmer contours, commonly explored for jawline and lower face laxity.',
    bestSuitedFor: 'Jawline definition and lower-face laxity.',
    comfortLevel: 'injectable',
    downtimeTier: 'medium',
    costTier: 3,
    downtimeContext: 'Mild swelling, tenderness, or pulling sensation commonly explored for about a week.',
    costContext: 'Commonly $1,000–$2,500 per session.',
    longevityContext: 'Results are commonly explored as lasting around 12–18 months.',
  },
  skincare: {
    id: 'skincare',
    name: 'Skincare',
    overview:
      'A topical regimen — active ingredients such as retinoids, antioxidants, and SPF — as a foundational, lowest-commitment starting point.',
    bestSuitedFor: 'A foundational starting point for nearly any concern, at the lowest commitment level.',
    comfortLevel: 'skincare',
    downtimeTier: 'none',
    costTier: 1,
    downtimeContext: 'No downtime — fits into a normal daily routine.',
    costContext: 'Commonly $30–$150 per month depending on products chosen.',
    longevityContext: 'Results are commonly explored as building gradually with consistent daily use.',
  },
  at_home_devices: {
    id: 'at_home_devices',
    name: 'At-Home Devices',
    overview:
      'Consumer-grade devices used at home, commonly explored as a gentle, low-commitment complement to a skincare routine.',
    bestSuitedFor: 'A gentle, low-commitment complement to a skincare routine.',
    comfortLevel: 'skincare',
    downtimeTier: 'none',
    costTier: 2,
    downtimeContext: 'No downtime — used at home on your own schedule.',
    costContext: 'Commonly $150–$500 as a one-time device cost.',
    longevityContext: 'Results are commonly explored as building gradually with regular use.',
  },
};

export const concernCandidates: Record<ConcernId, TreatmentCategoryId[]> = {
  fine_lines: ['tox', 'skin_boosters', 'peels', 'skincare'],
  sagging_skin: ['ultrasound', 'rf', 'threads', 'biostimulators'],
  pigmentation: ['lasers', 'peels', 'skincare', 'at_home_devices'],
  texture_pores: ['microneedling', 'rf', 'peels', 'skincare'],
  acne_scarring: ['microneedling', 'lasers', 'rf', 'peels'],
  volume_loss: ['fillers', 'biostimulators', 'skin_boosters', 'threads'],
  under_eye: ['skin_boosters', 'fillers', 'peels', 'at_home_devices'],
  lips: ['fillers', 'skin_boosters', 'skincare'],
  jawline: ['fillers', 'threads', 'rf', 'ultrasound'],
  not_sure: ['skincare', 'tox', 'microneedling', 'at_home_devices'],
};

const comfortToLevel: Partial<Record<ComfortId, ComfortLevel>> = {
  skincare_only: 'skincare',
  devices_lasers: 'device',
  injectables: 'injectable',
};

const downtimeToleranceOrder: DowntimeTier[] = ['none', 'short', 'medium', 'long'];

const downtimeAcceptable: Record<DowntimeId, DowntimeTier[]> = {
  none: ['none'],
  short: ['none', 'short'],
  week: ['none', 'short', 'medium'],
  not_concern: [...downtimeToleranceOrder],
};

const budgetTierByAnswer: Record<QuizAnswers['budget'], 1 | 2 | 3 | 4> = {
  under_500: 1,
  '500_1500': 2,
  '1500_3000': 3,
  '3000_plus': 4,
};

function dedupe(ids: TreatmentCategoryId[]): TreatmentCategoryId[] {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function filterByComfort(ids: TreatmentCategoryId[], comfort: ComfortId): TreatmentCategoryId[] {
  const level = comfortToLevel[comfort];
  if (!level) return ids;
  return ids.filter((id) => treatmentCategories[id].comfortLevel === level);
}

function filterByDowntime(ids: TreatmentCategoryId[], downtime: DowntimeId): TreatmentCategoryId[] {
  const accepted = downtimeAcceptable[downtime];
  return ids.filter((id) => accepted.includes(treatmentCategories[id].downtimeTier));
}

/**
 * Resolves the ordered, filtered candidate list for a concern + comfort +
 * downtime combination, relaxing constraints in a fixed, deterministic
 * order so a result is always returned:
 *   1. comfort + downtime filtered
 *   2. comfort filtered only
 *   3. downtime filtered only
 *   4. unfiltered concern candidates
 */
function resolveCandidates(concern: ConcernId, comfort: ComfortId, downtime: DowntimeId): TreatmentCategoryId[] {
  const base = concernCandidates[concern];

  const comfortFiltered = filterByComfort(base, comfort);
  const comfortAndDowntime = filterByDowntime(comfortFiltered, downtime);
  if (comfortAndDowntime.length > 0) return comfortAndDowntime;

  if (comfortFiltered.length > 0) return comfortFiltered;

  const downtimeFiltered = filterByDowntime(base, downtime);
  if (downtimeFiltered.length > 0) return downtimeFiltered;

  return base;
}

function buildExplanation(answers: QuizAnswers, category: TreatmentCategory): string {
  const concern = concernLabels[answers.concern].toLowerCase();
  const area = areaLabels[answers.area].toLowerCase();
  const intensity = intensityLabels[answers.intensity].toLowerCase();
  const comfort = comfortLabels[answers.comfort].toLowerCase();

  return `Because you're most interested in improving ${concern} around your ${area}, prefer a result that feels ${intensity}, and are comfortable exploring ${comfort}, ${category.name} is commonly explored as a starting point.`;
}

function buildBudgetNote(category: TreatmentCategory, budget: QuizAnswers['budget']): string {
  const budgetTier = budgetTierByAnswer[budget];
  if (category.costTier > budgetTier) {
    return 'Typical cost for this category may run above your stated budget — the alternatives below tend to fit more comfortably.';
  }
  return 'Typical cost for this category generally fits within your stated budget.';
}

export type RecommendationMatch = {
  category: TreatmentCategory;
  explanation: string;
};

export type RecommendationResult = {
  rulesVersion: string;
  concern: ConcernId;
  area: AreaId;
  intensity: IntensityId;
  topMatch: RecommendationMatch;
  alternates: TreatmentCategory[];
  budgetNote: string;
};

export function getRecommendation(answers: QuizAnswers): RecommendationResult {
  const resolved = resolveCandidates(answers.concern, answers.comfort, answers.downtime);
  const [topId, ...restResolved] = resolved;
  const topCategory = treatmentCategories[topId];

  const fullConcernList = concernCandidates[answers.concern].filter((id) => id !== topId);
  const alternatePool = dedupe([...restResolved, ...fullConcernList]);
  const alternates = alternatePool.slice(0, 2).map((id) => treatmentCategories[id]);

  return {
    rulesVersion: RULES_VERSION,
    concern: answers.concern,
    area: answers.area,
    intensity: answers.intensity,
    topMatch: {
      category: topCategory,
      explanation: buildExplanation(answers, topCategory),
    },
    alternates,
    budgetNote: buildBudgetNote(topCategory, answers.budget),
  };
}
