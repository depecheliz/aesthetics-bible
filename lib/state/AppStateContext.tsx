import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { QuizAnswers } from '../../src/domain/quiz';
import type { RecommendationResult, TreatmentCategoryId } from '../../src/domain/recommendation';
import { samplePassportEntries, type NewPassportEntryInput, type PassportEntry } from '../../src/domain/passport';
import type { PersistenceAdapter } from '../services/persistenceAdapter';

/**
 * App-wide product state: quiz progress, the computed recommendation, saved
 * plan items, saved providers, and the Passport treatment log.
 *
 * Signed-out behavior is unchanged from the original mocked build: purely
 * local/in-memory, seeded with sample Passport entries. When an
 * authenticated `persistence` adapter is supplied (see AppProviders), this
 * additionally hydrates from — and writes through to — Supabase. Screens
 * never see the difference; they only ever call the functions below.
 */

type SavedPlanItem = {
  categoryId: TreatmentCategoryId;
  savedAt: string;
};

function isCompleteQuizAnswers(answers: Partial<QuizAnswers>): answers is QuizAnswers {
  return Boolean(
    answers.concern && answers.area && answers.intensity && answers.downtime && answers.comfort && answers.budget,
  );
}

function randomLocalId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type AppState = {
  /** True once a Supabase-backed persistence adapter is wired (i.e. signed in). */
  isAuthenticated: boolean;

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
  addPassportEntry: (input: NewPassportEntryInput) => Promise<void>;

  /** True while sign-in hydration is loading persisted data. */
  isHydrating: boolean;
  /** Set when a background save (quiz result or saved plan item) fails. */
  saveError: string | null;
  clearSaveError: () => void;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

type AppStateProviderProps = {
  children: ReactNode;
  /** Test-only seeding hooks — lets tests skip re-running the quiz UI to get to a given state. */
  initialResult?: RecommendationResult | null;
  initialSavedPlanItems?: SavedPlanItem[];
  initialPassportEntries?: PassportEntry[];
  /** Supplied by AppProviders once a user is signed in; undefined = local-only (anonymous), matching the original build exactly. */
  persistence?: PersistenceAdapter;
};

export function AppStateProvider({
  children,
  initialResult = null,
  initialSavedPlanItems = [],
  initialPassportEntries = samplePassportEntries,
  persistence,
}: AppStateProviderProps) {
  const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResultState] = useState<RecommendationResult | null>(initialResult);
  const [savedPlanItems, setSavedPlanItems] = useState<SavedPlanItem[]>(initialSavedPlanItems);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([]);
  const [passportEntries, setPassportEntries] = useState<PassportEntry[]>(initialPassportEntries);
  const [isHydrating, setIsHydrating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const quizAnswersRef = useRef(quizAnswers);
  useEffect(() => {
    quizAnswersRef.current = quizAnswers;
  }, [quizAnswers]);

  const hydratedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!persistence) {
      // Signed out: reset to anonymous local defaults so a previous user's
      // data never lingers on screen after sign-out.
      if (hydratedForUserRef.current !== null) {
        setResultState(null);
        setSavedPlanItems([]);
        setPassportEntries(samplePassportEntries);
        setQuizAnswers({});
      }
      hydratedForUserRef.current = null;
      return;
    }

    if (hydratedForUserRef.current === persistence.userId) {
      return;
    }
    hydratedForUserRef.current = persistence.userId;

    let cancelled = false;
    setIsHydrating(true);
    persistence
      .loadHydrationData()
      .then((data) => {
        if (cancelled) return;
        if (data.result) {
          setResultState(data.result);
        }
        setSavedPlanItems(
          data.savedPlanItemIds.map((categoryId) => ({ categoryId, savedAt: new Date().toISOString() })),
        );
        setPassportEntries(data.passportEntries);
      })
      .catch(() => {
        if (cancelled) return;
        setSaveError('Could not load your saved data. Pull to refresh or check your connection.');
      })
      .finally(() => {
        if (!cancelled) setIsHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [persistence]);

  const setAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setQuizAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setResultState(null);
  };

  const setResult = (nextResult: RecommendationResult | null) => {
    setResultState(nextResult);

    if (nextResult && persistence && isCompleteQuizAnswers(quizAnswersRef.current)) {
      persistence.saveQuizAnswersAndPlan(quizAnswersRef.current, nextResult).catch(() => {
        setSaveError('Your plan could not be saved. It will stay on this device until you try again.');
      });
    }
  };

  const savePlanItem = (categoryId: TreatmentCategoryId) => {
    setSavedPlanItems((prev) =>
      prev.some((item) => item.categoryId === categoryId)
        ? prev
        : [...prev, { categoryId, savedAt: new Date().toISOString() }],
    );

    if (persistence) {
      persistence.saveItem(categoryId).catch(() => {
        setSaveError('This item could not be saved to your account. It will stay on this device until you try again.');
      });
    }
  };

  const isPlanItemSaved = (categoryId: TreatmentCategoryId) =>
    savedPlanItems.some((item) => item.categoryId === categoryId);

  const toggleSavedProvider = (providerId: string) => {
    setSavedProviderIds((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId],
    );
  };

  const addPassportEntry = async (input: NewPassportEntryInput) => {
    const id = randomLocalId();

    if (persistence) {
      // Persist first — an authenticated save must not appear to succeed
      // locally if the write actually failed.
      const entry = await persistence.createPassportEntry(id, input);
      setPassportEntries((prev) => [entry, ...prev]);
      return;
    }

    const entry: PassportEntry = { ...input, id, photos: {} };
    setPassportEntries((prev) => [entry, ...prev]);
  };

  const clearSaveError = () => setSaveError(null);

  const value: AppState = {
    isAuthenticated: Boolean(persistence),
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
    isHydrating,
    saveError,
    clearSaveError,
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
