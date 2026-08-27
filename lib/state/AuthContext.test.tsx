import { Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthContextProvider, useAuth } from './AuthContext';
import type { AuthProvider } from '../services/auth';

function createFakeAuthProvider(overrides: Partial<AuthProvider> = {}): AuthProvider {
  return {
    getCurrentUser: jest.fn(async () => null),
    signInWithEmail: jest.fn(async () => ({ id: 'user-1', email: 'a@example.com' })),
    signUpWithEmail: jest.fn(async () => ({ user: { id: 'user-1', email: 'a@example.com' }, needsEmailConfirmation: false })),
    signOut: jest.fn(async () => {}),
    deleteAccount: jest.fn(async () => {}),
    onAuthStateChange: jest.fn(() => () => {}),
    ...overrides,
  };
}

function Probe() {
  const { status, user, error } = useAuth();
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="user">{user?.email ?? 'none'}</Text>
      <Text testID="error">{error ?? 'none'}</Text>
    </>
  );
}

describe('AuthContext', () => {
  it('starts in "restoring" and resolves to "signedOut" when there is no session', async () => {
    const provider = createFakeAuthProvider();

    await render(
      <AuthContextProvider provider={provider}>
        <Probe />
      </AuthContextProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status').props.children).toBe('signedOut'));
    expect(screen.getByTestId('user').props.children).toBe('none');
  });

  it('resolves to "signedIn" when a session already exists on launch', async () => {
    const provider = createFakeAuthProvider({
      getCurrentUser: jest.fn(async () => ({ id: 'user-1', email: 'returning@example.com' })),
    });

    await render(
      <AuthContextProvider provider={provider}>
        <Probe />
      </AuthContextProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status').props.children).toBe('signedIn'));
    expect(screen.getByTestId('user').props.children).toBe('returning@example.com');
  });

  it('surfaces a sign-in failure as an error without crashing', async () => {
    const provider = createFakeAuthProvider({
      signInWithEmail: jest.fn(async () => {
        throw new Error('Invalid login credentials');
      }),
    });

    function SignInProbe() {
      const auth = useAuth();
      return (
        <>
          <Probe />
          <Text testID="trigger" onPress={() => auth.signIn('a@example.com', 'wrong-password').catch(() => {})}>
            trigger
          </Text>
        </>
      );
    }

    await render(
      <AuthContextProvider provider={provider}>
        <SignInProbe />
      </AuthContextProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status').props.children).toBe('signedOut'));

    await fireEvent.press(screen.getByTestId('trigger'));

    await waitFor(() => expect(screen.getByTestId('error').props.children).toBe('Invalid login credentials'));
  });
});
