import { Alert, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppStateProvider } from './AppStateContext';
import { useRequireAuth } from './useRequireAuth';
import type { PersistenceAdapter } from '../services/persistenceAdapter';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

function fakeAdapter(): PersistenceAdapter {
  return {
    userId: 'user-1',
    loadHydrationData: jest.fn(async () => ({ result: null, savedPlanItemIds: [], passportEntries: [] })),
    saveQuizAnswersAndPlan: jest.fn(async () => {}),
    saveItem: jest.fn(async () => {}),
    createPassportEntry: jest.fn(async (id, input) => ({ ...input, id, photos: {} })),
  };
}

function Gate({ action }: { action: () => void }) {
  const requireAuth = useRequireAuth();
  return <Text testID="gated" onPress={() => requireAuth(action)} />;
}

describe('useRequireAuth', () => {
  it('runs the action immediately when authenticated', async () => {
    const action = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await render(
      <AppStateProvider persistence={fakeAdapter()}>
        <Gate action={action} />
      </AppStateProvider>,
    );

    await fireEvent.press(screen.getByTestId('gated'));

    expect(action).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('blocks the action and prompts to sign in when unauthenticated', async () => {
    const action = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await render(
      <AppStateProvider>
        <Gate action={action} />
      </AppStateProvider>,
    );

    await fireEvent.press(screen.getByTestId('gated'));

    expect(action).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Sign In to Save', expect.any(String), expect.any(Array));
    alertSpy.mockRestore();
  });
});
