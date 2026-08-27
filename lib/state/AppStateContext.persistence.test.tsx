import { Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppStateProvider, useAppState } from './AppStateContext';
import { getRecommendation } from '../../src/domain/recommendation';
import type { TreatmentCategoryId } from '../../src/domain/recommendation';
import type { QuizAnswers } from '../../src/domain/quiz';
import type { PersistenceAdapter } from '../services/persistenceAdapter';
import type { NewPassportEntryInput, PassportEntry } from '../../src/domain/passport';

const answers: QuizAnswers = {
  concern: 'fine_lines',
  area: 'forehead',
  intensity: 'subtle',
  downtime: 'none',
  comfort: 'injectables',
  budget: '1500_3000',
};

function createFakeAdapter(overrides: Partial<PersistenceAdapter> = {}): PersistenceAdapter {
  return {
    userId: 'user-1',
    loadHydrationData: jest.fn(async () => ({ result: null, savedPlanItemIds: [], passportEntries: [] })),
    saveQuizAnswersAndPlan: jest.fn(async () => {}),
    saveItem: jest.fn(async () => {}),
    createPassportEntry: jest.fn(async (id: string, input: NewPassportEntryInput) => ({
      ...input,
      id,
      photos: {},
    })),
    ...overrides,
  };
}

function StateProbe() {
  const { result, savedPlanItems, passportEntries, isHydrating, isAuthenticated } = useAppState();
  return (
    <>
      <Text testID="hydrating">{String(isHydrating)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="result">{result?.topMatch.category.id ?? 'none'}</Text>
      <Text testID="savedCount">{savedPlanItems.length}</Text>
      <Text testID="passportCount">{passportEntries.length}</Text>
    </>
  );
}

describe('AppStateContext persistence', () => {
  it('is unauthenticated and purely local when no persistence adapter is supplied', async () => {
    await render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('authenticated').props.children).toBe('false');
    // Sample entries only appear in the anonymous/local path.
    expect(Number(screen.getByTestId('passportCount').props.children)).toBeGreaterThan(0);
  });

  it('hydrates result, saved plan items, and passport entries from the adapter on sign-in', async () => {
    const seededResult = getRecommendation(answers);
    const adapter = createFakeAdapter({
      loadHydrationData: jest.fn(async () => ({
        result: seededResult,
        savedPlanItemIds: ['fillers'] as TreatmentCategoryId[],
        passportEntries: [
          {
            id: 'remote-1',
            treatment: 'Botox',
            date: '2026-01-01',
            provider: 'Studio',
            cost: 400,
            product: 'Botox',
            amountUnits: '20 units',
            area: 'Forehead',
            notes: '',
            satisfaction: 5,
            wouldDoAgain: true,
            photos: {},
          } satisfies PassportEntry,
        ],
      })),
    });

    await render(
      <AppStateProvider persistence={adapter}>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('hydrating').props.children).toBe('false'));

    expect(screen.getByTestId('authenticated').props.children).toBe('true');
    expect(screen.getByTestId('result').props.children).toBe(seededResult.topMatch.category.id);
    expect(screen.getByTestId('savedCount').props.children).toBe(1);
    // Real (possibly non-sample) data replaces the anonymous samples once authenticated.
    expect(screen.getByTestId('passportCount').props.children).toBe(1);
  });

  it('does not show fake sample entries for a brand-new authenticated user with no data', async () => {
    const adapter = createFakeAdapter();

    await render(
      <AppStateProvider persistence={adapter}>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('hydrating').props.children).toBe('false'));
    expect(screen.getByTestId('passportCount').props.children).toBe(0);
  });

  it('persists the quiz result via the adapter when authenticated', async () => {
    const adapter = createFakeAdapter();

    function Trigger() {
      const { setAnswer } = useAppState();
      return (
        <Text
          testID="complete-quiz"
          onPress={() => {
            (Object.keys(answers) as (keyof QuizAnswers)[]).forEach((key) => setAnswer(key, answers[key]));
          }}
        />
      );
    }

    function CompleteAndSubmit() {
      const { quizAnswers, setResult } = useAppState();
      return (
        <Text
          testID="submit"
          onPress={() => setResult(getRecommendation(quizAnswers as QuizAnswers))}
        />
      );
    }

    await render(
      <AppStateProvider persistence={adapter}>
        <Trigger />
        <CompleteAndSubmit />
      </AppStateProvider>,
    );

    await act(async () => {
      await fireEvent.press(screen.getByTestId('complete-quiz'));
    });
    await act(async () => {
      await fireEvent.press(screen.getByTestId('submit'));
    });

    await waitFor(() => expect(adapter.saveQuizAnswersAndPlan).toHaveBeenCalledTimes(1));
    expect(adapter.saveQuizAnswersAndPlan).toHaveBeenCalledWith(answers, expect.objectContaining({ concern: 'fine_lines' }));
  });

  it('persists a saved plan item via the adapter when authenticated', async () => {
    const adapter = createFakeAdapter();

    function Trigger() {
      const { savePlanItem } = useAppState();
      return <Text testID="save" onPress={() => savePlanItem('fillers')} />;
    }

    await render(
      <AppStateProvider persistence={adapter}>
        <Trigger />
      </AppStateProvider>,
    );

    await act(async () => {
      await fireEvent.press(screen.getByTestId('save'));
    });

    await waitFor(() => expect(adapter.saveItem).toHaveBeenCalledWith('fillers'));
  });

  it('sets saveError when a background save fails, without losing the local change', async () => {
    const adapter = createFakeAdapter({
      saveItem: jest.fn(async () => {
        throw new Error('network down');
      }),
    });

    function Trigger() {
      const { savePlanItem, saveError, savedPlanItems } = useAppState();
      return (
        <>
          <Text testID="save" onPress={() => savePlanItem('fillers')} />
          <Text testID="error">{saveError ?? 'none'}</Text>
          <Text testID="count">{savedPlanItems.length}</Text>
        </>
      );
    }

    await render(
      <AppStateProvider persistence={adapter}>
        <Trigger />
      </AppStateProvider>,
    );

    await act(async () => {
      await fireEvent.press(screen.getByTestId('save'));
    });

    await waitFor(() => expect(screen.getByTestId('error').props.children).not.toBe('none'));
    // The bookmark still shows locally even though the remote save failed.
    expect(screen.getByTestId('count').props.children).toBe(1);
  });

  it('awaits the repository before adding a Passport entry, and does not add it locally on failure', async () => {
    const adapter = createFakeAdapter({
      createPassportEntry: jest.fn(async () => {
        throw new Error('insert failed');
      }),
    });

    function Trigger() {
      const { addPassportEntry, passportEntries } = useAppState();
      return (
        <>
          <Text
            testID="add"
            onPress={() => {
              addPassportEntry({
                treatment: 'Botox',
                date: '2026-01-01',
                provider: '',
                cost: 0,
                product: '',
                amountUnits: '',
                area: '',
                notes: '',
                satisfaction: 5,
                wouldDoAgain: true,
              }).catch(() => {});
            }}
          />
          <Text testID="count">{passportEntries.length}</Text>
        </>
      );
    }

    await render(
      <AppStateProvider persistence={adapter}>
        <Trigger />
      </AppStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(0));

    await act(async () => {
      await fireEvent.press(screen.getByTestId('add'));
    });

    expect(adapter.createPassportEntry).toHaveBeenCalledTimes(1);
    // Failed remote write must not silently appear to have succeeded locally.
    expect(screen.getByTestId('count').props.children).toBe(0);
  });

  it('resets to anonymous local defaults on sign-out (no data leakage between users)', async () => {
    const adapter = createFakeAdapter({
      loadHydrationData: jest.fn(async () => ({
        result: getRecommendation(answers),
        savedPlanItemIds: ['fillers'] as TreatmentCategoryId[],
        passportEntries: [],
      })),
    });

    const { rerender } = await render(
      <AppStateProvider persistence={adapter}>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('result').props.children).not.toBe('none'));

    await rerender(
      <AppStateProvider persistence={undefined}>
        <StateProbe />
      </AppStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('authenticated').props.children).toBe('false'));
    expect(screen.getByTestId('result').props.children).toBe('none');
    expect(screen.getByTestId('savedCount').props.children).toBe(0);
  });
});
