/**
 * Persistence for the Aesthetics Profile quiz answers.
 *
 * concern/area remain stored in the existing text columns for a no-migration
 * rollout. New multi-select values are JSON-encoded; legacy scalar rows are
 * still accepted and normalized to one-item arrays on hydration.
 */

import { supabase } from './supabaseClient';
import { RULES_VERSION } from '../../src/domain/recommendation';
import type { AreaId, ConcernId, QuizAnswers } from '../../src/domain/quiz';

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

function parseSelection<T extends string>(value: string): T[] {
  if (!value) return [];
  if (value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      // Fall through to legacy scalar handling.
    }
  }
  return [value as T];
}

function toQuizAnswers(row: Row): QuizAnswers {
  return {
    concern: parseSelection<ConcernId>(row.concern),
    area: parseSelection<AreaId>(row.area),
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
        concern: JSON.stringify(answers.concern),
        area: JSON.stringify(answers.area),
        intensity: answers.intensity,
        downtime: answers.downtime,
        comfort: answers.comfort,
        budget: answers.budget,
        rules_version: RULES_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;
  },
};
