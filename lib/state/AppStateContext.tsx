import { createContext, useContext, useState, type ReactNode } from 'react';
import type { QuizAnswers } from '../../src/domain/quiz';
import type { RecommendationResult, TreatmentCategoryId } from '../../src/domain/recommendation';

/**
 * App-wide local state: quiz progress, the computed recommendation, and
 * saved plan items. Session-only (in-memory) for this build — no
 * AsyncStorage dependency added yet, per the "dependency-light" workspace
 * rule. Nothing here is a live backend; this is local, mocked app state.
 */

type SavedPlanItem = {
  categoryId: TreatmentCategoryId;
  savedAt: string;
};

type AppState = {
  quizAnswers: Partial<QuizAnswers>;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  resetQuiz: () => void;

  result: RecommendationResult | null;
  setResult: (result: RecommendationResult | null) => void;

  savedPlanItems: SavedPlanItem[];
  savePlanItem: (categoryId: TreatmentCategoryId) => void;
  isPlanItemSaved: (categoryId: TreatmentCategoryId) => boolean;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [savedPlanItems, setSavedPlanItems] = useState<SavedPlanItem[]>([]);

  const setAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setQuizAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setResult(null);
  };

  const savePlanItem = (categoryId: TreatmentCategoryId) => {
    setSavedPlanItems((prev) =>
      prev.some((item) => item.categoryId === categoryId)
        ? prev
        : [...prev, { categoryId, savedAt: new Date().toISOString() }],
    );
  };

  const isPlanItemSaved = (categoryId: TreatmentCategoryId) =>
    savedPlanItems.some((item) => item.categoryId === categoryId);

  const value: AppState = {
    quizAnswers,
    setAnswer,
    resetQuiz,
    result,
    setResult,
    savedPlanItems,
    savePlanItem,
    isPlanItemSaved,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
