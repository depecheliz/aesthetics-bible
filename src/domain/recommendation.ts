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

export const RULES_VERSION = 'v2-multiconcern';

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
    longevityContext: 'Results typically last 3–4 months.',
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
    longevityContext: 'Results typically last 6–18 months, depending on the area treated.',
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
    longevityContext: 'Results typically build over a short series and last several months.',
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
    longevityContext: 'Results typically build gradually and last a year or more.',
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
    longevityContext: 'Results typically build over a short series of sessions.',
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
    longevityContext: 'Results typically build gradually over several months.',
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
    longevityContext: 'Results typically build over a few months and can last up to a year.',
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
    longevityContext: 'Results typically build gradually over a series of sessions.',
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
    longevityContext: 'Results typically build with a regular series of treatments.',
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
    longevityContext: 'Results typically last around 12–18 months.',
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
    longevityContext: 'Results typically build gradually with consistent daily use.',
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
    longevityContext: 'Results typically build gradually with regular use.',
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

const areaCandidates: Record<AreaId, TreatmentCategoryId[]> = {
  forehead: ['tox', 'skincare', 'peels'],
  eyes: ['tox', 'skin_boosters', 'fillers', 'skincare'],
  cheeks: ['fillers', 'biostimulators', 'lasers', 'peels', 'microneedling'],
  midface: ['fillers', 'biostimulators', 'threads'],
  lips: ['fillers', 'skin_boosters', 'skincare'],
  jawline: ['fillers', 'threads', 'rf', 'ultrasound'],
  neck: ['ultrasound', 'rf', 'skincare', 'microneedling', 'tox'],
  overall: [],
};

const comfortToLevel: Partial<Record<ComfortId, ComfortLevel>> = {
  skincare_only: 'skincare',
  devices_lasers: 'device',
  injectables: 'injectable',
};

const downtimeAcceptable: Record<DowntimeId, DowntimeTier[]> = {
  none: ['none'],
  short: ['none', 'short'],
  week: ['none', 'short', 'medium'],
  not_concern: ['none', 'short', 'medium', 'long'],
};

function scoreCandidates(answers: QuizAnswers): TreatmentCategoryId[] {
  const scores = new Map<TreatmentCategoryId, number>();

  answers.concern.forEach((concern, concernIndex) => {
    concernCandidates[concern].forEach((id, rank) => {
      const concernWeight = Math.max(12, 42 - rank * 10);
      const primaryBonus = concernIndex === 0 ? 8 : Math.max(0, 5 - concernIndex * 2);
      scores.set(id, (scores.get(id) ?? 0) + concernWeight + primaryBonus);
    });
  });

  answers.area.forEach((area, areaIndex) => {
    areaCandidates[area].forEach((id, rank) => {
      const areaWeight = Math.max(6, 20 - rank * 3);
      const primaryBonus = areaIndex === 0 ? 4 : 0;
      scores.set(id, (scores.get(id) ?? 0) + areaWeight + primaryBonus);
    });
  });

  // Respect an explicit procedure-comfort choice as a true qualifying gate.
  const requiredLevel = comfortToLevel[answers.comfort];
  let eligible = [...scores.keys()];
  if (requiredLevel) {
    const comfortMatches = eligible.filter((id) => treatmentCategories[id].comfortLevel === requiredLevel);
    if (comfortMatches.length > 0) {
      eligible = comfortMatches;
    } else if (requiredLevel === 'skincare') {
      // A skincare-only user should never silently receive an injectable/device
      // top match just because the concern list has no topical candidate.
      eligible = ['skincare', 'at_home_devices'];
      eligible.forEach((id, index) => scores.set(id, Math.max(scores.get(id) ?? 0, 16 - index * 2)));
    }
  }

  const acceptedDowntime = downtimeAcceptable[answers.downtime];
  eligible.forEach((id) => {
    if (acceptedDowntime.includes(treatmentCategories[id].downtimeTier)) {
      scores.set(id, (scores.get(id) ?? 0) + 8);
    } else {
      scores.set(id, (scores.get(id) ?? 0) - 12);
    }

    const budgetTier = budgetTierByAnswer[answers.budget];
    if (treatmentCategories[id].costTier <= budgetTier) {
      scores.set(id, (scores.get(id) ?? 0) + 3);
    }

    if (answers.intensity === 'subtle' && treatmentCategories[id].comfortLevel === 'skincare') {
      scores.set(id, (scores.get(id) ?? 0) + 5);
    }
    if (answers.intensity === 'more_visible' && treatmentCategories[id].comfortLevel !== 'skincare') {
      scores.set(id, (scores.get(id) ?? 0) + 4);
    }
  });

  return eligible.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
}

function joinLabels(values: string[]): string {
  if (values.length <= 1) return values[0] ?? '';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function buildExplanation(answers: QuizAnswers, category: TreatmentCategory): string {
  const concerns = joinLabels(answers.concern.map((id) => concernLabels[id].toLowerCase()));
  const areas = joinLabels(answers.area.map((id) => areaLabels[id].toLowerCase()));
  const intensity = intensityLabels[answers.intensity].toLowerCase();
  const comfort = comfortLabels[answers.comfort].toLowerCase();

  return `You told us you're focused on ${concerns}, especially around ${areas}. With a ${intensity} result in mind and your preference for ${comfort}, ${category.name} rises to the top of your Aestella profile.`;
}

function buildBudgetNote(category: TreatmentCategory, budget: QuizAnswers['budget']): string {
  const budgetTier = budgetTierByAnswer[budget];
  if (category.costTier > budgetTier) {
    return 'Typical cost for this category may run above your stated budget — your Blueprint can help you compare lower-investment alternatives.';
  }
  return 'Typical cost for this category generally fits within your stated budget.';
}

function buildConsideration(answers: QuizAnswers, category: TreatmentCategory): string | null {
  if (answers.comfort === 'skincare_only' && category.comfortLevel === 'skincare') {
    const primary = answers.concern[0];
    const bestLayerMatch = concernCandidates[primary]?.[0];
    if (bestLayerMatch && treatmentCategories[bestLayerMatch].comfortLevel !== 'skincare') {
      return `Your comfort preference changed the ranking: ${category.name} respects your skincare-only choice, while some options that more directly target ${concernLabels[primary].toLowerCase()} use a different treatment category.`;
    }
  }

  if (answers.concern.length > 1) {
    return 'You selected concerns that can involve different aesthetic layers. One treatment may not address every goal, so your full Blueprint compares complementary options rather than forcing everything into one category.';
  }

  return null;
}
export function getRecommendation(answers: QuizAnswers): RecommendationResult {
  const ranked = scoreCandidates(answers);
  const topId = ranked[0] ?? 'skincare';
  const topCategory = treatmentCategories[topId];

  const concernPool = dedupe(answers.concern.flatMap((concern) => concernCandidates[concern]));
  const alternatePool = dedupe([...ranked.slice(1), ...concernPool.filter((id) => id !== topId)]);
  const alternates = alternatePool.slice(0, 3).map((id) => treatmentCategories[id]);

  return {
    rulesVersion: RULES_VERSION,
    concern: answers.concern[0],
    area: answers.area[0],
    concerns: answers.concern,
    areas: answers.area,
    intensity: answers.intensity,
    topMatch: {
      category: topCategory,
      explanation: buildExplanation(answers, topCategory),
    },
    alternates,
    budgetNote: buildBudgetNote(topCategory, answers.budget),
    consideration: buildConsideration(answers, topCategory),
  };
}
