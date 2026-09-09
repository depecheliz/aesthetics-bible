import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

const BAND_COUNT = 5;
const BAND_WIDTH = 6;

type EdgeFadeProps = {
  side?: 'left' | 'right';
  /** Match the surface this sits on top of — defaults to the screen background. */
  color?: string;
};

/**
 * A dependency-free stand-in for a real edge gradient — expo-linear-gradient
 * isn't installed, and adding a new dependency is out of scope for this
 * polish sprint. Stacks a few semi-transparent strips of the surrounding
 * surface color to approximate a fade, signaling "more content" past a
 * horizontally scrollable row (e.g. Bible's filter chips) instead of a
 * hard-cut edge. Purely decorative — never intercepts touches.
 */
export function EdgeFade({ side = 'right', color = colors.background }: EdgeFadeProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: BAND_COUNT }).map((_, index) => {
        const offset = index * BAND_WIDTH;
        const positionStyle = side === 'right' ? { right: offset } : { left: offset };
        const opacity = ((index + 1) / BAND_COUNT) * 0.9;
        return <View key={index} style={[styles.band, positionStyle, { backgroundColor: color, opacity }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: BAND_WIDTH,
  },
});
