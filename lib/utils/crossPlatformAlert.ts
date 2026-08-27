import { Alert, Platform } from 'react-native';

type AlertButton = { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' };

/**
 * react-native-web's Alert.alert() is a documented no-op — it renders
 * nothing on web (see node_modules/react-native-web/dist/exports/Alert).
 * Native iOS/Android keep the real Alert.alert; web falls back to
 * window.alert/confirm so prompts (sign-in gate, save failures, delete
 * confirmation) actually appear in a browser too.
 */
export function showAlert(title: string, message: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const primaryButton = buttons.find((b) => b !== cancelButton) ?? buttons[buttons.length - 1];

  if (window.confirm(text)) {
    primaryButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
