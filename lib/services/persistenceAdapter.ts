/**
 * Composes the three repositories into the single shape AppStateContext
 * needs — the only file that couples product state to "there are three
 * separate Supabase tables behind this." Screens never import this.
 */

import { getRecommendation, type RecommendationResult, type TreatmentCategoryId } from '../../src/domain/recommendation';
import type { QuizAnswers } from '../../src/domain/quiz';
import type { NewPassportEntryInput, PassportEntry } from '../../src/domain/passport';
import { supabaseAestheticsProfileRepository } from './aestheticsProfileRepository';
import { supabasePlanRepository } from './planRepository';
import { supabasePassportRepository } from './passportRepository';

export type HydrationData = {
  result: RecommendationResult | null;
  savedPlanItemIds: TreatmentCategoryId[];
  passportEntries: PassportEntry[];
};

export type PersistenceAdapter = {
  userId: string;
  loadHydrationData(): Promise<HydrationData>;
  saveQuizAnswersAndPlan(answers: QuizAnswers, result: RecommendationResult): Promise<void>;
  saveItem(categoryId: TreatmentCategoryId): Promise<void>;
  createPassportEntry(id: string, input: NewPassportEntryInput): Promise<PassportEntry>;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createPersistenceAdapter(userId: string): PersistenceAdapter {
  return {
    userId,

    async loadHydrationData() {
      const fetchAll = () =>
        Promise.all([
          supabaseAestheticsProfileRepository.load(userId),
          supabasePlanRepository.loadSavedItemIds(userId),
          supabasePassportRepository.list(userId),
        ]);

      let answers;
      let savedPlanItemIds;
      let passportEntries;
      try {
        [answers, savedPlanItemIds, passportEntries] = await fetchAll();
      } catch {
        // A fresh sign-in's token can very briefly race PostgREST's clock
        // ("JWT issued at future") immediately after issuance — retry once
        // after a short delay rather than surfacing a transient blip as an
        // error.
        await wait(1200);
        [answers, savedPlanItemIds, passportEntries] = await fetchAll();
      }

      return {
        result: answers ? getRecommendation(answers) : null,
        savedPlanItemIds,
        passportEntries,
      };
    },

    async saveQuizAnswersAndPlan(answers, result) {
      await supabaseAestheticsProfileRepository.save(userId, answers);
      await supabasePlanRepository.savePlan(userId, result);
    },

    async saveItem(categoryId) {
      await supabasePlanRepository.saveItem(userId, categoryId);
    },

    async createPassportEntry(id, input) {
      return supabasePassportRepository.create(userId, id, input);
    },
  };
}
