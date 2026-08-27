import { supabaseAestheticsProfileRepository } from './aestheticsProfileRepository';
import { RULES_VERSION } from '../../src/domain/recommendation';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn() } }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('./supabaseClient');

describe('supabaseAestheticsProfileRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('load() returns null when no row exists for the user', async () => {
    const maybeSingle = jest.fn(async () => ({ data: null, error: null }));
    supabase.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle }) }) });

    const answers = await supabaseAestheticsProfileRepository.load('user-1');
    expect(answers).toBeNull();
  });

  it('load() maps a row back to QuizAnswers', async () => {
    const row = { concern: 'fine_lines', area: 'forehead', intensity: 'subtle', downtime: 'none', comfort: 'injectables', budget: '1500_3000' };
    const maybeSingle = jest.fn(async () => ({ data: row, error: null }));
    supabase.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle }) }) });

    const answers = await supabaseAestheticsProfileRepository.load('user-1');
    expect(answers).toEqual(row);
  });

  it('save() upserts on user_id with the current rules version', async () => {
    const upsert = jest.fn(async () => ({ data: null, error: null }));
    supabase.from.mockReturnValue({ upsert });

    await supabaseAestheticsProfileRepository.save('user-1', {
      concern: 'fine_lines',
      area: 'forehead',
      intensity: 'subtle',
      downtime: 'none',
      comfort: 'injectables',
      budget: '1500_3000',
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', concern: 'fine_lines', rules_version: RULES_VERSION }),
      { onConflict: 'user_id' },
    );
  });

  it('save() throws when the write is rejected (e.g. by RLS)', async () => {
    const upsert = jest.fn(async () => ({ data: null, error: new Error('new row violates row-level security policy') }));
    supabase.from.mockReturnValue({ upsert });

    await expect(
      supabaseAestheticsProfileRepository.save('user-1', {
        concern: 'fine_lines',
        area: 'forehead',
        intensity: 'subtle',
        downtime: 'none',
        comfort: 'injectables',
        budget: '1500_3000',
      }),
    ).rejects.toThrow('row-level security');
  });
});
