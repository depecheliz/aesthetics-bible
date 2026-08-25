import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddPassportEntryScreen from '../../../app/passport/add';
import { AppStateProvider, useAppState } from '../../../lib/state/AppStateContext';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: (...args: unknown[]) => mockBack(...args), replace: jest.fn() },
}));

function EntryCountProbe() {
  const { passportEntries } = useAppState();
  return <Text testID="entry-count">{passportEntries.length}</Text>;
}

describe('Add Passport treatment form', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('disables Save until a treatment name is entered', async () => {
    await render(
      <AppStateProvider initialPassportEntries={[]}>
        <AddPassportEntryScreen />
      </AppStateProvider>,
    );

    const saveButton = screen.getByRole('button', { name: 'Save to My Passport' });
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('creates a new entry and returns to the previous screen on save', async () => {
    await render(
      <AppStateProvider initialPassportEntries={[]}>
        <EntryCountProbe />
        <AddPassportEntryScreen />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('entry-count').props.children).toBe(0);

    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Botox'), 'Botox');
    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Ivory & Ash Studio'), 'Ivory & Ash Studio');
    await fireEvent.changeText(screen.getByPlaceholderText('0'), '450');

    await fireEvent.press(screen.getByRole('button', { name: 'Save to My Passport' }));

    expect(screen.getByTestId('entry-count').props.children).toBe(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
