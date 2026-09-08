import { render, screen } from '@testing-library/react-native';
import CompareScreen from '../../../app/compare/index';

let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

describe('Compare screen', () => {
  beforeEach(() => {
    mockParams = {};
  });

  it('shows the empty-state message when no ids are provided', async () => {
    await render(<CompareScreen />);
    expect(screen.getByText('Choose two categories to compare from your plan.')).toBeTruthy();
  });

  it('compares two categories by id, unchanged from prior behavior', async () => {
    mockParams = { a: 'ultrasound', b: 'rf' };
    await render(<CompareScreen />);

    expect(screen.getByText('Ultrasound vs RF (Radiofrequency)')).toBeTruthy();
    expect(screen.getAllByText('BEST SUITED FOR').length).toBe(2);
  });

  it('compares two named treatments and shows treatment-level rows', async () => {
    mockParams = { ta: 'botox', tb: 'dysport' };
    await render(<CompareScreen />);

    expect(screen.getByText('Botox vs Dysport')).toBeTruthy();
    // Treatment-level rows only present when comparing named treatments.
    expect(screen.getAllByText('REPEAT FREQUENCY').length).toBe(2);
    expect(screen.getAllByText('WHO SHOULD RECONSIDER THIS').length).toBe(2);
  });

  it('shows differing repeat frequency between Botox and Daxxify', async () => {
    mockParams = { ta: 'botox', tb: 'daxxify' };
    await render(<CompareScreen />);

    expect(screen.getByText('Every three to four months for most patients.')).toBeTruthy();
    expect(
      screen.getByText('Two to three times a year for most patients -- less often than the other three neuromodulator brands.'),
    ).toBeTruthy();
  });

  it('falls through to the empty state rather than fabricating a pairing when a treatment id does not resolve', async () => {
    mockParams = { ta: 'not-a-real-treatment', tb: 'dysport' };
    await render(<CompareScreen />);

    // Neither side resolves as a matched treatment pair, so this falls
    // through to the "choose two categories" empty state rather than
    // fabricating a comparison.
    expect(screen.getByText('Choose two categories to compare from your plan.')).toBeTruthy();
  });
});
