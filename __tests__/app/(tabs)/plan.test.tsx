import { render, screen } from '@testing-library/react-native';
import PlanScreen from '../../../app/(tabs)/plan';
import { AppStateProvider } from '../../../lib/state/AppStateContext';
import { getRecommendation } from '../../../src/domain/recommendation';
import type { QuizAnswers } from '../../../src/domain/quiz';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

const answers: QuizAnswers = {
  concern: 'volume_loss',
  area: 'cheeks',
  intensity: 'natural',
  downtime: 'not_concern',
  comfort: 'injectables',
  budget: '3000_plus',
};

describe('Plan tab', () => {
  it('shows the empty state when the quiz has not been completed', async () => {
    await render(
      <AppStateProvider initialResult={null}>
        <PlanScreen />
      </AppStateProvider>,
    );

    expect(screen.getByText('Your face.\nYour goals.\nYour plan.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Build My Plan' })).toBeTruthy();
  });

  it('shows the full plan once a recommendation result exists', async () => {
    const result = getRecommendation(answers);

    await render(
      <AppStateProvider initialResult={result}>
        <PlanScreen />
      </AppStateProvider>,
    );

    expect(screen.getByText('MY AESTHETICS PLAN')).toBeTruthy();
    expect(screen.getAllByText(result.topMatch.category.name).length).toBeGreaterThan(0);
    expect(screen.queryByText('Your face.\nYour goals.\nYour plan.')).toBeNull();
  });
});
