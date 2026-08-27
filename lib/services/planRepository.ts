/**
 * Persistence for the computed plan snapshot and separately saved plan
 * items. The snapshot is a traceable record (top/alternate category ids +
 * rules_version) — never opaque output, since there is no LLM in this
 * flow. Rehydrating the full RecommendationResult (with explanations, etc.)
 * happens by re-running the local recommendation engine against the
 * persisted quiz answers, not by reading fields back out of this table.
 */

import { supabase } from './supabaseClient';
import { RULES_VERSION, type RecommendationResult, type TreatmentCategoryId } from '../../src/domain/recommendation';

export interface PlanRepository {
  savePlan(userId: string, result: RecommendationResult): Promise<void>;
  loadSavedItemIds(userId: string): Promise<TreatmentCategoryId[]>;
  saveItem(userId: string, categoryId: TreatmentCategoryId): Promise<void>;
}

export const supabasePlanRepository: PlanRepository = {
  async savePlan(userId, result) {
    const { error } = await supabase.from('aesthetics_plans').upsert(
      {
        user_id: userId,
        primary_concern: result.concern,
        top_category_id: result.topMatch.category.id,
        alternative_category_ids: result.alternates.map((c) => c.id),
        rules_version: RULES_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;
  },

  async loadSavedItemIds(userId) {
    const { data, error } = await supabase.from('saved_plan_items').select('category_id').eq('user_id', userId);

    if (error) throw error;
    return (data ?? []).map((row) => row.category_id as TreatmentCategoryId);
  },

  async saveItem(userId, categoryId) {
    const { error } = await supabase
      .from('saved_plan_items')
      .upsert({ user_id: userId, category_id: categoryId }, { onConflict: 'user_id,category_id', ignoreDuplicates: true });

    if (error) throw error;
  },
};
