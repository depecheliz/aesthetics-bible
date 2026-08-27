import { supabasePlanRepository } from './planRepository';
import { getRecommendation, RULES_VERSION } from '../../src/domain/recommendation';
import type { QuizAnswers } from '../../src/domain/quiz';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn() } }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('./supabaseClient');

const answers: QuizAnswers = {
  concern: 'fine_lines',
  area: 'forehead',
  intensity: 'subtle',
  downtime: 'none',
  comfort: 'injectables',
  budget: '1500_3000',
};

describe('supabasePlanRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('savePlan() upserts a traceable snapshot (category ids + rules version), not opaque output', async () => {
    const upsert = jest.fn(async () => ({ data: null, error: null }));
    supabase.from.mockReturnValue({ upsert });

    const result = getRecommendation(answers);
    await supabasePlanRepository.savePlan('user-1', result);

    expect(supabase.from).toHaveBeenCalledWith('aesthetics_plans');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        top_category_id: result.topMatch.category.id,
        rules_version: RULES_VERSION,
      }),
      { onConflict: 'user_id' },
    );
  });

  it('loadSavedItemIds() returns the category ids for the user', async () => {
    const eq = jest.fn(async () => ({ data: [{ category_id: 'fillers' }, { category_id: 'tox' }], error: null }));
    supabase.from.mockReturnValue({ select: () => ({ eq }) });

    const ids = await supabasePlanRepository.loadSavedItemIds('user-1');
    expect(ids).toEqual(['fillers', 'tox']);
  });

  it('saveItem() upserts idempotently so re-saving the same item is a no-op, not a duplicate', async () => {
    const upsert = jest.fn(async () => ({ data: null, error: null }));
    supabase.from.mockReturnValue({ upsert });

    await supabasePlanRepository.saveItem('user-1', 'fillers');

    expect(upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', category_id: 'fillers' },
      { onConflict: 'user_id,category_id', ignoreDuplicates: true },
    );
  });
});
