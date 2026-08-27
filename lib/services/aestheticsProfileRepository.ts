/**
 * Persistence for the Aesthetics Profile quiz answers — one current record
 * per user (enforced by a unique constraint on user_id in Supabase).
 * Recommendation calculation itself stays local/domain-driven; this only
 * stores the inputs so they can be recomputed deterministically on hydration.
 */

import { supabase } from './supabaseClient';
import { RULES_VERSION } from '../../src/domain/recommendation';
import type { QuizAnswers } from '../../src/domain/quiz';

export interface AestheticsProfileRepository {
  load(userId: string): Promise<QuizAnswers | null>;
  save(userId: string, answers: QuizAnswers): Promise<void>;
}

type Row = {
  concern: string;
  area: string;
  intensity: string;
  downtime: string;
  comfort: string;
  budget: string;
};

function toQuizAnswers(row: Row): QuizAnswers {
  return {
    concern: row.concern as QuizAnswers['concern'],
    area: row.area as QuizAnswers['area'],
    intensity: row.intensity as QuizAnswers['intensity'],
    downtime: row.downtime as QuizAnswers['downtime'],
    comfort: row.comfort as QuizAnswers['comfort'],
    budget: row.budget as QuizAnswers['budget'],
  };
}

export const supabaseAestheticsProfileRepository: AestheticsProfileRepository = {
  async load(userId) {
    const { data, error } = await supabase
      .from('aesthetics_profile_answers')
      .select('concern, area, intensity, downtime, comfort, budget')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? toQuizAnswers(data) : null;
  },

  async save(userId, answers) {
    const { error } = await supabase.from('aesthetics_profile_answers').upsert(
      {
        user_id: userId,
        ...answers,
        rules_version: RULES_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;
  },
};
