import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../../constants/theme';

type ScreenProps = ViewProps & {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({ children, style, edges = ['top', 'bottom', 'left', 'right'], ...rest }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={Array.from(new Set([...edges, 'left', 'right'] as const))}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
