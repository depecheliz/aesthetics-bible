/**
 * Aesthetics Profile quiz — types, labels, and question data.
 *
 * Concerns and focus areas are intentionally multi-select so the profile can
 * represent a real multi-layer aesthetic goal instead of forcing one concern
 * into one zone. Recommendation logic remains deterministic and source-backed.
 */

export type ConcernId =
  | 'fine_lines'
  | 'sagging_skin'
  | 'pigmentation'
  | 'texture_pores'
  | 'acne_scarring'
  | 'volume_loss'
  | 'under_eye'
  | 'lips'
  | 'jawline'
  | 'not_sure';

export type AreaId = 'forehead' | 'eyes' | 'cheeks' | 'midface' | 'lips' | 'jawline' | 'neck' | 'overall';
export type IntensityId = 'subtle' | 'natural' | 'more_visible';
export type DowntimeId = 'none' | 'short' | 'week' | 'not_concern';
export type ComfortId = 'skincare_only' | 'devices_lasers' | 'injectables' | 'multiple' | 'not_sure';
export type BudgetId = 'under_500' | '500_1500' | '1500_3000' | '3000_plus';

export type QuizAnswers = {
  concern: ConcernId[];
  area: AreaId[];
  intensity: IntensityId;
  downtime: DowntimeId;
  comfort: ComfortId;
  budget: BudgetId;
};

export type QuizAnswerValue = ConcernId | AreaId | IntensityId | DowntimeId | ComfortId | BudgetId;

export const concernLabels: Record<ConcernId, string> = {
  fine_lines: 'Fine lines / wrinkles',
  sagging_skin: 'Loose or sagging skin',
  pigmentation: 'Pigmentation / sun damage',
  texture_pores: 'Texture / pores',
  acne_scarring: 'Acne scarring',
  volume_loss: 'Volume loss',
  under_eye: 'Under-eye appearance',
  lips: 'Lips',
  jawline: 'Jawline',
  not_sure: 'Not sure yet',
};

export const areaLabels: Record<AreaId, string> = {
  forehead: 'Forehead',
  eyes: 'Eyes',
  cheeks: 'Cheeks',
  midface: 'Midface',
  lips: 'Lips',
  jawline: 'Jawline',
  neck: 'Neck',
  overall: 'Overall face',
};

export const intensityLabels: Record<IntensityId, string> = {
  subtle: 'Very subtle',
  natural: 'Natural but noticeable',
  more_visible: 'More visible improvement',
};

export const downtimeLabels: Record<DowntimeId, string> = {
  none: 'None',
  short: '1–3 days',
  week: 'Up to a week',
  not_concern: 'Downtime is not a major concern',
};

export const comfortLabels: Record<ComfortId, string> = {
  skincare_only: 'Skincare only',
  devices_lasers: 'Devices / lasers',
  injectables: 'Injectables',
  multiple: 'Open to multiple categories',
  not_sure: 'Not sure',
};

export const budgetLabels: Record<BudgetId, string> = {
  under_500: 'Under $500',
  '500_1500': '$500–$1,500',
  '1500_3000': '$1,500–$3,000',
  '3000_plus': '$3,000+',
};

type SingleQuestionId = 'intensity' | 'downtime' | 'comfort' | 'budget';
type MultiQuestionId = 'concern' | 'area';

export type QuizQuestion =
  | {
      id: MultiQuestionId;
      title: string;
      helper: string;
      selection: 'multi';
      maxSelections: number;
      options: { value: ConcernId | AreaId; label: string }[];
    }
  | {
      id: SingleQuestionId;
      title: string;
      helper?: string;
      selection: 'single';
      options: { value: QuizAnswerValue; label: string }[];
    };

function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'concern',
    title: 'What would you most like to improve?',
    helper: 'Choose up to 3. Aestella will look across the different layers involved.',
    selection: 'multi',
    maxSelections: 3,
    options: toOptions(concernLabels),
  },
  {
    id: 'area',
    title: 'Where would you like to focus?',
    helper: 'Choose up to 2 areas.',
    selection: 'multi',
    maxSelections: 2,
    options: toOptions(areaLabels),
  },
  {
    id: 'intensity',
    title: 'What kind of result do you prefer?',
    selection: 'single',
    options: toOptions(intensityLabels),
  },
  {
    id: 'downtime',
    title: 'How much downtime are you comfortable with?',
    selection: 'single',
    options: toOptions(downtimeLabels),
  },
  {
    id: 'comfort',
    title: 'What are you comfortable exploring?',
    helper: 'We will respect this choice when selecting your top match.',
    selection: 'single',
    options: toOptions(comfortLabels),
  },
  {
    id: 'budget',
    title: 'Approximate annual aesthetics budget',
    selection: 'single',
    options: toOptions(budgetLabels),
  },
];
