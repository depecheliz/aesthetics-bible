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
 */

import { concernCandidates, treatmentCategories, type TreatmentCategoryId } from './recommendation';
import { concernLabels, type ConcernId } from './quiz';

export type BibleTreatmentId =
  | 'botox'
  | 'dysport'
  | 'fillers'
  | 'sculptra'
  | 'rf_microneedling'
  | 'ultherapy'
  | 'sofwave'
  | 'ipl_bbl'
  | 'laser_resurfacing'
  | 'microneedling';

export type BibleTreatment = {
  id: BibleTreatmentId;
  name: string;
  aliases: string[];
  categoryId: TreatmentCategoryId;
  overview: string;
  contentVersion: string;
  reviewDate: string;
};

export const bibleTreatments: BibleTreatment[] = [
  {
    id: 'botox',
    name: 'Botox',
    aliases: ['Botox / Neuromodulators', 'Tox', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'The most widely explored neuromodulator brand, commonly used to soften the look of expression lines on the upper face.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'dysport',
    name: 'Dysport',
    aliases: ['Abobotulinumtoxin', 'Neuromodulator'],
    categoryId: 'tox',
    overview:
      'A neuromodulator often explored as an alternative to Botox — a similar category of treatment with a different formulation and spread pattern.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'fillers',
    name: 'Fillers',
    aliases: ['Dermal Fillers', 'Hyaluronic Acid Filler'],
    categoryId: 'fillers',
    overview: treatmentCategories.fillers.overview,
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'sculptra',
    name: 'Sculptra',
    aliases: ['Poly-L-lactic Acid', 'Biostimulator'],
    categoryId: 'biostimulators',
    overview:
      'A biostimulator brand commonly explored for gradual, natural-looking volume restoration across the face.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'rf_microneedling',
    name: 'RF Microneedling',
    aliases: ['Morpheus8', 'Radiofrequency Microneedling'],
    categoryId: 'rf',
    overview:
      'Combines microneedling with radiofrequency energy, commonly explored for texture and mild skin firming.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'ultherapy',
    name: 'Ultherapy',
    aliases: ['Ultrasound Lifting'],
    categoryId: 'ultrasound',
    overview: treatmentCategories.ultrasound.overview,
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'sofwave',
    name: 'Sofwave',
    aliases: ['Ultrasound Lifting'],
    categoryId: 'ultrasound',
    overview:
      'An ultrasound-based device often explored as an alternative to Ultherapy for gentle lifting and firming.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'ipl_bbl',
    name: 'IPL / BBL',
    aliases: ['Intense Pulsed Light', 'BroadBand Light', 'Photofacial'],
    categoryId: 'lasers',
    overview:
      'Light-based treatments commonly explored for pigmentation, sun damage, and overall complexion brightness.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'laser_resurfacing',
    name: 'Laser Resurfacing',
    aliases: ['CO2 Laser', 'Fractional Laser'],
    categoryId: 'lasers',
    overview:
      'A more intensive laser treatment commonly explored for texture, fine lines, and overall skin resurfacing.',
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    aliases: ['Collagen Induction Therapy'],
    categoryId: 'microneedling',
    overview: treatmentCategories.microneedling.overview,
    contentVersion: 'v1',
    reviewDate: '2026-01-01',
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
  };
}
