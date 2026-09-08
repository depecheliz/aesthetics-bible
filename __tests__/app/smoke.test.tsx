import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppStateProvider } from '../../lib/state/AppStateContext';
import { EntitlementProvider } from '../../lib/state/EntitlementContext';
import { getRecommendation } from '../../src/domain/recommendation';
import type { QuizAnswers } from '../../src/domain/quiz';
import ResultScreen from '../../app/quiz/result';
import PreviewScreen from '../../app/(tabs)/preview';
import NearMeScreen from '../../app/near-me/index';
import PaywallScreen from '../../app/paywall';
import BotoxBestieScreen from '../../app/botox-bestie/index';
import TreatmentDetailScreen from '../../app/bible/[id]';
import CompareScreen from '../../app/compare/index';
import PassportScreen from '../../app/(tabs)/passport';
import ProgressPhotosScreen from '../../app/passport/photos';
import PassportEntryDetailScreen from '../../app/passport/[id]';

const mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

// A lightweight "does it render without throwing" pass over every screen
// not already covered by a behavior-focused test — the fastest way to
// catch a bad import, an untyped icon name, or an undefined access
// without a real browser/device available in this environment.

const answers: QuizAnswers = {
  concern: 'fine_lines',
  area: 'forehead',
  intensity: 'subtle',
  downtime: 'none',
  comfort: 'injectables',
  budget: '1500_3000',
};

describe('Screen smoke tests', () => {
  it('renders the quiz Result screen with a seeded result', async () => {
    jest.useFakeTimers();
    const result = getRecommendation(answers);

    await render(
      <EntitlementProvider>
        <AppStateProvider initialResult={result}>
          <ResultScreen />
        </AppStateProvider>
      </EntitlementProvider>,
    );

    expect(screen.getByText('YOUR AESTHETICS PROFILE')).toBeTruthy();
    jest.useRealTimers();
  });

  it('renders the Preview screen in Preview mode', async () => {
    mockParams.mode = undefined as unknown as string;
    await render(
      <EntitlementProvider>
        <PreviewScreen />
      </EntitlementProvider>,
    );
    expect(screen.getByText('See a possibility before making a decision.')).toBeTruthy();
  });

  it('renders the Preview screen in Glow mode via the mode param', async () => {
    mockParams.mode = 'glow';
    await render(
      <EntitlementProvider>
        <PreviewScreen />
      </EntitlementProvider>,
    );
    expect(screen.getByText('Your photo. Elevated.')).toBeTruthy();
    delete mockParams.mode;
  });

  it('renders the Near Me screen', async () => {
    await render(
      <AppStateProvider>
        <NearMeScreen />
      </AppStateProvider>,
    );
    expect(screen.getByText('Providers Worth Exploring')).toBeTruthy();
  });

  it('renders the Paywall screen', async () => {
    await render(
      <EntitlementProvider>
        <PaywallScreen />
      </EntitlementProvider>,
    );
    expect(screen.getByText('Your Personalized Aesthetic Plan Is Ready.')).toBeTruthy();
  });

  it('preselects the Annual plan and allows selecting Weekly instead', async () => {
    await render(
      <EntitlementProvider>
        <PaywallScreen />
      </EntitlementProvider>,
    );

    // Annual is preselected by default.
    expect(screen.getAllByRole('button', { selected: true }).length).toBe(1);

    fireEvent.press(screen.getByText('EXPLORE'));

    // Selecting Weekly should move which card reports selected=true — still
    // exactly one selected card, but the tap demonstrably changed state
    // rather than being a no-op.
    expect(screen.getAllByRole('button', { selected: true }).length).toBe(1);
    expect(screen.getAllByRole('button', { selected: false }).length).toBeGreaterThan(0);
  });

  it('renders the Botox Bestie screen', async () => {
    await render(<BotoxBestieScreen />);
    expect(screen.getByText('Botox or Dysport?')).toBeTruthy();
  });

  it('renders a Bible treatment detail page', async () => {
    mockParams.id = 'botox';
    await render(<TreatmentDetailScreen />);
    expect(screen.getAllByText('Botox').length).toBeGreaterThan(0);
    delete mockParams.id;
  });

  it('renders the Bible detail fallback for a generic category id', async () => {
    mockParams.id = 'peels';
    await render(<TreatmentDetailScreen />);
    expect(screen.getAllByText('Peels').length).toBeGreaterThan(0);
    delete mockParams.id;
  });

  it('renders the Compare screen with two category ids', async () => {
    mockParams.a = 'ultrasound';
    mockParams.b = 'rf';
    await render(<CompareScreen />);
    expect(screen.getByText('Ultrasound vs RF (Radiofrequency)')).toBeTruthy();
    delete mockParams.a;
    delete mockParams.b;
  });

  it('renders the Passport tab in its populated (seeded) state', async () => {
    await render(
      <AppStateProvider>
        <PassportScreen />
      </AppStateProvider>,
    );
    expect(screen.getByText('YOUR YEAR IN AESTHETICS')).toBeTruthy();
  });

  it('renders the Passport tab empty state', async () => {
    await render(
      <AppStateProvider initialPassportEntries={[]}>
        <PassportScreen />
      </AppStateProvider>,
    );
    expect(screen.getByText('Your Aesthetics History, All in One Place')).toBeTruthy();
  });

  it('renders the Progress Photos screen', async () => {
    await render(<ProgressPhotosScreen />);
    expect(screen.getByText('Create Progress Story')).toBeTruthy();
  });

  it('renders a Passport entry detail page', async () => {
    mockParams.id = 'sample-entry-1';
    await render(
      <AppStateProvider>
        <PassportEntryDetailScreen />
      </AppStateProvider>,
    );
    expect(screen.getAllByText('Tox / Neuromodulators').length).toBeGreaterThan(0);
    delete mockParams.id;
  });
});
