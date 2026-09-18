/**
 * Aestella Profile Quiz V2.
 *
 * Concern and area are intentionally multi-select so the recommendation
 * engine can reason across more than one layer/zone. Age is optional context,
 * never a treatment trigger. Priorities are tie-breakers, not qualifiers.
 */
export type ConcernId =
  | 'fine_lines' | 'sagging_skin' | 'pigmentation' | 'texture_pores'
  | 'acne_scarring' | 'volume_loss' | 'under_eye' | 'lips' | 'jawline' | 'not_sure';

export type AreaId = 'forehead' | 'eyes' | 'cheeks' | 'midface' | 'lips' | 'jawline' | 'neck' | 'overall';
export type IntensityId = 'subtle' | 'natural' | 'more_visible';
export type DowntimeId = 'none' | 'short' | 'week' | 'not_concern';
export type ComfortId = 'skincare_only' | 'devices_lasers' | 'injectables' | 'multiple' | 'not_sure';
export type BudgetId = 'under_500' | '500_1500' | '1500_3000' | '3000_plus';
export type PriorityId = 'natural' | 'low_downtime' | 'longevity' | 'value' | 'avoid_needles' | 'fast_results';
export type AgeRangeId = 'under_30' | '30_44' | '45_59' | '60_plus';

export type QuizAnswers = {
  concerns: ConcernId[];
  areas: AreaId[];
  intensity: IntensityId;
  downtime: DowntimeId;
  comfort: ComfortId;
  budget: BudgetId;
  priorities: PriorityId[];
  ageRange?: AgeRangeId;
};

export const concernLabels: Record<ConcernId, string> = {
  fine_lines: 'Fine lines / wrinkles', sagging_skin: 'Loose or sagging skin',
  pigmentation: 'Pigmentation / sun damage', texture_pores: 'Texture / pores',
  acne_scarring: 'Acne scarring', volume_loss: 'Volume loss',
  under_eye: 'Under-eye appearance', lips: 'Lips', jawline: 'Jawline', not_sure: 'Not sure yet',
};
export const areaLabels: Record<AreaId, string> = {
  forehead: 'Forehead', eyes: 'Eyes', cheeks: 'Cheeks', midface: 'Midface',
  lips: 'Lips', jawline: 'Jawline', neck: 'Neck', overall: 'Overall face',
};
export const intensityLabels: Record<IntensityId, string> = {
  subtle: 'Very subtle', natural: 'Natural but noticeable', more_visible: 'More visible improvement',
};
export const downtimeLabels: Record<DowntimeId, string> = {
  none: 'None', short: '1–3 days', week: 'Up to a week', not_concern: 'Downtime is not a major concern',
};
export const comfortLabels: Record<ComfortId, string> = {
  skincare_only: 'Skincare only', devices_lasers: 'Devices / lasers',
  injectables: 'Injectables', multiple: 'Open to multiple categories', not_sure: 'Not sure',
};
export const budgetLabels: Record<BudgetId, string> = {
  under_500: 'Under $500', '500_1500': '$500–$1,500', '1500_3000': '$1,500–$3,000', '3000_plus': '$3,000+',
};
export const priorityLabels: Record<PriorityId, string> = {
  natural: 'Natural-looking results', low_downtime: 'Low downtime', longevity: 'Longevity',
  value: 'Affordability / value', avoid_needles: 'Avoiding needles', fast_results: 'Fast visible results',
};
export const ageRangeLabels: Record<AgeRangeId, string> = {
  under_30: 'Under 30', '30_44': '30–44', '45_59': '45–59', '60_plus': '60+',
};

type MultiQuestion = {
  id: 'concerns' | 'areas' | 'priorities'; title: string; helper: string;
  selection: 'multi'; maxSelections?: number; required: boolean;
  options: { value: string; label: string }[];
};
type SingleQuestion = {
  id: 'intensity' | 'downtime' | 'comfort' | 'budget' | 'ageRange'; title: string; helper?: string;
  selection: 'single'; required: boolean; skippable?: boolean;
  options: { value: string; label: string }[];
};
export type QuizQuestion = MultiQuestion | SingleQuestion;

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const quizQuestions: QuizQuestion[] = [
  { id: 'concerns', title: 'What would you most like to improve?', helper: 'Choose up to 3.', selection: 'multi', maxSelections: 3, required: true, options: toOptions(concernLabels) },
  { id: 'areas', title: 'Where would you like to focus?', helper: 'Select all that apply.', selection: 'multi', required: true, options: toOptions(areaLabels) },
  { id: 'intensity', title: 'What kind of change feels right for you?', selection: 'single', required: true, options: toOptions(intensityLabels) },
  { id: 'downtime', title: 'How much downtime works for your life?', selection: 'single', required: true, options: toOptions(downtimeLabels) },
  { id: 'comfort', title: 'What are you comfortable exploring?', helper: 'We’ll respect this as a boundary in your matches.', selection: 'single', required: true, options: toOptions(comfortLabels) },
  { id: 'budget', title: 'Approximate annual aesthetics budget', selection: 'single', required: true, options: toOptions(budgetLabels) },
  { id: 'priorities', title: 'What matters most to you?', helper: 'Choose up to 2.', selection: 'multi', maxSelections: 2, required: false, options: toOptions(priorityLabels) },
  { id: 'ageRange', title: 'What’s your age range?', helper: 'Optional. Used only for context — never to decide that you need a treatment.', selection: 'single', required: false, skippable: true, options: toOptions(ageRangeLabels) },
];

export function normalizeLegacyQuizAnswers(raw: Record<string, unknown>): Partial<QuizAnswers> {
  const concerns = Array.isArray(raw.concerns) ? raw.concerns : raw.concern ? [raw.concern] : undefined;
  const areas = Array.isArray(raw.areas) ? raw.areas : raw.area ? [raw.area] : undefined;
  return {
    concerns: concerns as ConcernId[] | undefined,
    areas: areas as AreaId[] | undefined,
    intensity: raw.intensity as IntensityId | undefined,
    downtime: raw.downtime as DowntimeId | undefined,
    comfort: raw.comfort as ComfortId | undefined,
    budget: raw.budget as BudgetId | undefined,
    priorities: (Array.isArray(raw.priorities) ? raw.priorities : []) as PriorityId[],
    ageRange: raw.ageRange as AgeRangeId | undefined,
  };
}
