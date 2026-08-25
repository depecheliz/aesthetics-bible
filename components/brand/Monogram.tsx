import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { colors, fontFamily } from '../../constants/theme';

type MonogramSize = 'sm' | 'md' | 'lg';
type MonogramTone = 'dark' | 'ivory';

const sizeConfig: Record<MonogramSize, { box: number; font: number; border: number }> = {
  sm: { box: 26, font: 12, border: 1 },
  md: { box: 40, font: 18, border: 1 },
  lg: { box: 64, font: 28, border: 1.5 },
};

/**
 * The Aesthetics Bible "AB" monogram — a simple typographic lockup (not a
 * reproduction of any protected mark), used sparingly at brand moments:
 * Home, Paywall, and shareable cards. Prefer this over repeating the full
 * wordmark everywhere.
 */
export function Monogram({ size = 'md', tone = 'dark' }: { size?: MonogramSize; tone?: MonogramTone }) {
  const config = sizeConfig[size];
  const borderColor = colors.rule;
  const textColor = tone === 'dark' ? colors.accent : colors.textOnIvory;

  return (
    <View
      style={[
        styles.box,
        {
          width: config.box,
          height: config.box,
          borderColor,
          borderWidth: config.border,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.mark,
          {
            fontSize: config.font,
            color: textColor,
            fontFamily: fontFamily.display,
          },
        ]}
      >
        AB
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    letterSpacing: 0,
  },
});
