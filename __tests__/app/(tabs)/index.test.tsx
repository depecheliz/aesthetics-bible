import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../../../app/(tabs)/index';
import { AppStateProvider } from '../../../lib/state/AppStateContext';
import { getRecommendation } from '../../../src/domain/recommendation';
import type { QuizAnswers } from '../../../src/domain/quiz';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

const answers: QuizAnswers = {
  concern: 'fine_lines',
  area: 'forehead',
  intensity: 'subtle',
  downtime: 'none',
  comfort: 'injectables',
  budget: '1500_3000',
};

describe('Home dashboard', () => {
  it('shows the new-user hero when the quiz has not been completed', async () => {
    await render(
      <AppStateProvider initialResult={null}>
        <HomeScreen />
      </AppStateProvider>,
    );

    expect(screen.getByRole('button', { name: 'Build My Aesthetics Plan' })).toBeTruthy();
    expect(screen.queryByText('YOUR #1 MATCH')).toBeNull();
  });

  it('shows the returning-user dashboard once a recommendation result exists', async () => {
    const result = getRecommendation(answers);

    await render(
      <AppStateProvider initialResult={result}>
        <HomeScreen />
      </AppStateProvider>,
    );

    expect(screen.getByText('YOUR #1 MATCH')).toBeTruthy();
    expect(screen.getAllByText(result.topMatch.category.name).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Build My Aesthetics Plan' })).toBeNull();
  });
});
