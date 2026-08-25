import { fireEvent, render, screen } from '@testing-library/react-native';
import QuizScreen from './index';
import { AppStateProvider } from '../../lib/state/AppStateContext';
import { quizQuestions } from '../../src/domain/quiz';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    replace: jest.fn(),
  },
}));

describe('Quiz completion flow', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('walks through all 6 questions and navigates to the result screen on completion', async () => {
    await render(
      <AppStateProvider>
        <QuizScreen />
      </AppStateProvider>,
    );

    expect(screen.getByText(quizQuestions[0].title)).toBeTruthy();

    for (let i = 0; i < quizQuestions.length; i += 1) {
      const question = quizQuestions[i];
      const isLast = i === quizQuestions.length - 1;

      await fireEvent.press(screen.getByRole('radio', { name: question.options[0].label }));
      await fireEvent.press(screen.getByRole('button', { name: isLast ? 'See My Top Match' : 'Continue' }));
    }

    expect(mockPush).toHaveBeenCalledWith('/quiz/result');
  });

  it('does not allow continuing before an option is selected', async () => {
    await render(
      <AppStateProvider>
        <QuizScreen />
      </AppStateProvider>,
    );

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('going back on the first question calls router.back instead of decrementing past 0', async () => {
    await render(
      <AppStateProvider>
        <QuizScreen />
      </AppStateProvider>,
    );

    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
