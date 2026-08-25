import { fireEvent, render, screen } from '@testing-library/react-native';
import BibleScreen from './bible';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

describe('Bible tab', () => {
  it('shows the full starter library by default', async () => {
    await render(<BibleScreen />);
    expect(screen.getByText('Botox')).toBeTruthy();
    expect(screen.getByText('Sofwave')).toBeTruthy();
  });

  it('filters the list as the user types a search query', async () => {
    await render(<BibleScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('Search treatments'), 'sofwave');

    expect(screen.getByText('Sofwave')).toBeTruthy();
    expect(screen.queryByText('Botox')).toBeNull();
  });

  it('filters by category chip', async () => {
    await render(<BibleScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Tox / Neuromodulators' }));

    expect(screen.getByText('Botox')).toBeTruthy();
    expect(screen.getByText('Dysport')).toBeTruthy();
    expect(screen.queryByText('Sofwave')).toBeNull();
  });

  it('filters by concern card', async () => {
    await render(<BibleScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Pigmentation / sun damage' }));

    expect(screen.getByText('IPL / BBL')).toBeTruthy();
    expect(screen.queryByText('Sculptra')).toBeNull();
  });

  it('shows an empty-results message when nothing matches', async () => {
    await render(<BibleScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('Search treatments'), 'zzznotreal');

    expect(screen.getByText('No matches for that search.')).toBeTruthy();
  });
});
