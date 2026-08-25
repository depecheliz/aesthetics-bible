import { createContext, useContext, useState, type ReactNode } from 'react';
import type { QuizAnswers } from '../../src/domain/quiz';
import type { RecommendationResult, TreatmentCategoryId } from '../../src/domain/recommendation';
import { samplePassportEntries, type NewPassportEntryInput, type PassportEntry } from '../../src/domain/passport';

/**
 * App-wide local state: quiz progress, the computed recommendation, saved
 * plan items, saved providers, and the Passport treatment log.
 * Session-only (in-memory) for this build — no AsyncStorage dependency
 * added yet, per the "dependency-light" workspace rule. Nothing here is a
 * live backend; this is local, mocked app state.
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

  savedProviderIds: string[];
  toggleSavedProvider: (providerId: string) => void;

  passportEntries: PassportEntry[];
  addPassportEntry: (input: NewPassportEntryInput) => void;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

type AppStateProviderProps = {
  children: ReactNode;
  /** Test-only seeding hooks — lets tests skip re-running the quiz UI to get to a given state. */
  initialResult?: RecommendationResult | null;
  initialSavedPlanItems?: SavedPlanItem[];
  initialPassportEntries?: PassportEntry[];
};

export function AppStateProvider({
  children,
  initialResult = null,
  initialSavedPlanItems = [],
  initialPassportEntries = samplePassportEntries,
}: AppStateProviderProps) {
  const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResult] = useState<RecommendationResult | null>(initialResult);
  const [savedPlanItems, setSavedPlanItems] = useState<SavedPlanItem[]>(initialSavedPlanItems);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([]);
  const [passportEntries, setPassportEntries] = useState<PassportEntry[]>(initialPassportEntries);

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

  const toggleSavedProvider = (providerId: string) => {
    setSavedProviderIds((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId],
    );
  };

  const addPassportEntry = (input: NewPassportEntryInput) => {
    const entry: PassportEntry = {
      ...input,
      id: `entry-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      photos: {},
    };
    setPassportEntries((prev) => [entry, ...prev]);
  };

  const value: AppState = {
    quizAnswers,
    setAnswer,
    resetQuiz,
    result,
    setResult,
    savedPlanItems,
    savePlanItem,
    isPlanItemSaved,
    savedProviderIds,
    toggleSavedProvider,
    passportEntries,
    addPassportEntry,
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
