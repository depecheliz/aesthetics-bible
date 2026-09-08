import { useCallback, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  PanResponder,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { colors, radius, spacing } from '../../constants/theme';

/**
 * Before/after comparison slider for an already-generated AI Preview
 * result. Presentation only — this component never requests, retries, or
 * counts a generation; it just compares two images the caller already
 * has. It has no awareness of entitlement, quota, or the Preview request
 * flow (see `lib/services/previewGeneration.ts` for that) and must stay
 * that way.
 *
 * The "after" image is the top layer, clipped by a draggable vertical
 * divider to reveal the "before" image underneath — drag right to see
 * more of the after result, drag left to see more of the original.
 */

type BeforeAfterSliderProps = {
  beforeImage: ImageSourcePropType;
  afterImage: ImageSourcePropType;
  beforeLabel?: string;
  afterLabel?: string;
  /** Default 4/5, matching the app's portrait image variant elsewhere. */
  aspectRatio?: number;
  style?: ViewStyle;
};

const HANDLE_SIZE = 32;

/** Pure clamp used both by the live drag handler and by tests — kept
 * exported so drag-bounds behavior is directly testable without having to
 * simulate React Native's internal touch-history machinery, which
 * PanResponder needs for real gesture math but this component's own
 * handlers never touch. */
export function clampToWidth(x: number, width: number): number {
  return Math.max(0, Math.min(width, x));
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  aspectRatio = 4 / 5,
  style,
}: BeforeAfterSliderProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [dividerX, setDividerX] = useState<number | null>(null);
  const widthRef = useRef(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    widthRef.current = width;
    setContainerWidth(width);
    setDividerX((current) => current ?? width / 2);
  }, []);

  const clamp = useCallback((x: number) => clampToWidth(x, widthRef.current), []);

  // widthRef (not containerWidth state) is read inside the PanResponder's
  // handlers deliberately: panResponder is created once via the lazy
  // useState initializer below and never recreated, so if its handlers
  // closed over `containerWidth` state instead, they'd forever clamp
  // against the width at first render (stale closure) rather than the
  // current one. The ref is only ever read inside onPanResponderGrant/Move
  // — real event handlers, not render — the lint rule can't see that
  // through the closure.
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => setDividerX(clamp(evt.nativeEvent.locationX)),
      onPanResponderMove: (evt: GestureResponderEvent) => setDividerX(clamp(evt.nativeEvent.locationX)),
    }),
  );

  const resolvedDividerX = dividerX ?? containerWidth / 2;

  return (
    <View
      testID="before-after-slider"
      style={[styles.container, { aspectRatio }, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Before and after comparison slider"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: containerWidth > 0 ? Math.round((resolvedDividerX / containerWidth) * 100) : 50,
      }}
    >
      {containerWidth > 0 && (
        <>
          {/* Before — full image, bottom layer */}
          <Image source={beforeImage} style={StyleSheet.absoluteFill} resizeMode="cover" />

          {/* After — top layer, clipped to the divider position */}
          <View style={[styles.afterClip, { width: resolvedDividerX }]}>
            <Image
              source={afterImage}
              style={[StyleSheet.absoluteFill, { width: containerWidth }]}
              resizeMode="cover"
            />
          </View>

          <View style={[styles.divider, { left: resolvedDividerX - 1 }]} />
          <View style={[styles.handle, { left: resolvedDividerX - HANDLE_SIZE / 2 }]} />

          <View style={styles.beforeLabelChip}>
            <ThemedText variant="caption" color={colors.textPrimary} style={styles.labelText}>
              {beforeLabel}
            </ThemedText>
          </View>
          <View style={styles.afterLabelChip}>
            <ThemedText variant="caption" color={colors.textPrimary} style={styles.labelText}>
              {afterLabel}
            </ThemedText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.imageSurface,
  },
  afterClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.accent,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    marginTop: -HANDLE_SIZE / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.textOnIvory,
  },
  beforeLabelChip: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  afterLabelChip: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  labelText: {
    letterSpacing: 1.2,
  },
});
