import { useEffect } from 'react';
import { useAppState } from '../../lib/state/AppStateContext';
import { showAlert } from '../../lib/utils/crossPlatformAlert';

/**
 * Surfaces background persistence failures (quiz result / saved plan item)
 * as a single alert, reusing the same Alert.alert pattern already used
 * elsewhere in the app rather than introducing new banner UI.
 */
export function SaveErrorWatcher() {
  const { saveError, clearSaveError } = useAppState();

  useEffect(() => {
    if (!saveError) return;
    showAlert('Save Failed', saveError, [{ text: 'OK', onPress: clearSaveError }]);
  }, [saveError, clearSaveError]);

  return null;
}
