import { router } from 'expo-router';
import { useAppState } from './AppStateContext';
import { showAlert } from '../utils/crossPlatformAlert';

/**
 * Gates a persistence action behind authentication — used at the exact
 * moment a user tries to save something (Plan item, Passport entry), not
 * for browsing. Signed-in users run the action immediately; signed-out
 * users see a prompt and, if they continue to sign in/up, `router.back()`
 * (the auth screens' default when there's no `redirect` param) returns
 * them to this same screen.
 *
 * Reads `isAuthenticated` from AppStateContext rather than AuthContext
 * directly so this stays usable anywhere AppStateProvider is mounted,
 * including existing tests that render screens with only AppStateProvider.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAppState();

  return (action: () => void) => {
    if (isAuthenticated) {
      action();
      return;
    }

    showAlert('Sign In to Save', 'Create a free account to keep this saved to your Aesthetics Profile.', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Sign In', onPress: () => router.push('/auth/sign-in') },
    ]);
  };
}
