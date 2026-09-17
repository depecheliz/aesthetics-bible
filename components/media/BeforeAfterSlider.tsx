import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Image,
  ActivityIndicator,
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
 * LEFT of the divider = before, RIGHT of the divider = after. Both images
 * are always rendered in the exact same full-size coordinate space. The
 * before layer is then clipped by a wrapper whose width follows the
 * divider. This is important: resizing the image itself with the clip
 * would make the portrait appear to move/zoom while dragging.
 */

type BeforeAfterSliderProps = {
  beforeImage: ImageSourcePropType;
  afterImage: ImageSourcePropType;
  beforeLabel?: string;
  afterLabel?: string;
  /** Default 4/5, matching the app's portrait image variant elsewhere. */
  aspectRatio?: number;
  /** Normalized starting divider position, 0 (all after) to 1 (all
   * before). Default 0.5. Out-of-range or non-finite values are clamped
   * to 0–1 (falling back to 0.5 when not finite at all). */
  initialPosition?: number;
  /**
   * One-shot, opt-in demonstration sweep (roughly 20% → 80% → 50%) that
   * plays once layout and both images are ready. Any user interaction
   * (drag or the accessibility increment/decrement actions) cancels it
   * immediately and it never restarts for the lifetime of this mount.
   * Default false — every existing call site (PreviewResult's real
   * generated-image slider) is completely unaffected.
   */
  autoDemo?: boolean;
  style?: ViewStyle;
  onImageError?: () => void;
};

const HANDLE_SIZE = 32;
const AUTO_DEMO_PEAK = 0.8;
const AUTO_DEMO_SETTLE = 0.5;
const AUTO_DEMO_STEP_DURATION = 700;

export function clampToWidth(x: number, width: number): number {
  return Math.max(0, Math.min(width, x));
}

export function clampInitialPosition(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  aspectRatio = 4 / 5,
  initialPosition,
  autoDemo = false,
  style,
  onImageError,
}: BeforeAfterSliderProps) {
  const [loaded, setLoaded] = useState({ before: false, after: false });
  const [containerWidth, setContainerWidth] = useState(0);
  const [dividerX, setDividerX] = useState<number | null>(null);
  const widthRef = useRef(0);
  const initialFraction = clampInitialPosition(initialPosition);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      const previousWidth = widthRef.current;
      widthRef.current = width;
      setContainerWidth(width);
      setDividerX((current) =>
        current === null || !previousWidth
          ? width * initialFraction
          : clampToWidth((current / previousWidth) * width, width),
      );
    },
    [initialFraction],
  );

  const clamp = useCallback((x: number) => clampToWidth(x, widthRef.current), []);

  const handleBeforeLoad = useCallback(() => setLoaded((value) => ({ ...value, before: true })), []);
  const handleAfterLoad = useCallback(() => setLoaded((value) => ({ ...value, after: true })), []);

  const userInteractedRef = useRef(false);
  const demoStartedRef = useRef(false);
  const demoAnimRef = useRef<Animated.Value | null>(null);

  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        userInteractedRef.current = true;
        demoAnimRef.current?.stopAnimation();
        setDividerX(clamp(evt.nativeEvent.locationX));
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        userInteractedRef.current = true;
        demoAnimRef.current?.stopAnimation();
        setDividerX(clamp(evt.nativeEvent.locationX));
      },
    }),
  );

  const resolvedDividerX = dividerX ?? containerWidth * initialFraction;

  useEffect(() => {
    if (!autoDemo) return undefined;
    if (demoStartedRef.current) return undefined;
    if (userInteractedRef.current) return undefined;
    if (containerWidth <= 0 || !loaded.before || !loaded.after) return undefined;

    demoStartedRef.current = true;
    const anim = new Animated.Value(resolvedDividerX);
    demoAnimRef.current = anim;
    const listenerId = anim.addListener(({ value }) => {
      if (!userInteractedRef.current) setDividerX(value);
    });

    const sequence = Animated.sequence([
      Animated.timing(anim, {
        toValue: containerWidth * AUTO_DEMO_PEAK,
        duration: AUTO_DEMO_STEP_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(anim, {
        toValue: containerWidth * AUTO_DEMO_SETTLE,
        duration: AUTO_DEMO_STEP_DURATION,
        useNativeDriver: false,
      }),
    ]);
    sequence.start();

    return () => {
      anim.removeListener(listenerId);
      anim.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo, containerWidth, loaded.before, loaded.after]);

  return (
    <View
      testID="before-after-slider"
      style={[styles.container, { aspectRatio }, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Before and after comparison slider"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        userInteractedRef.current = true;
        demoAnimRef.current?.stopAnimation();
        setDividerX(
          clamp(
            resolvedDividerX +
              ((event.nativeEvent.actionName === 'increment' ? 1 : -1) * containerWidth) / 10,
          ),
        );
      }}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: containerWidth > 0 ? Math.round((resolvedDividerX / containerWidth) * 100) : 50,
      }}
    >
      {containerWidth > 0 && (
        <>
          {/* Full after image underneath. `contain` keeps the entire face
              visible rather than cropping/zooming it on narrow phones. */}
          <Image
            testID="before-after-slider-after-image"
            source={afterImage}
            style={styles.fullImage}
            resizeMode="contain"
            onLoad={handleAfterLoad}
            onError={onImageError}
          />

          {/* The clip changes width, but the before image does NOT. Its
              fixed container-sized frame stays perfectly registered with
              the after image while the divider moves. */}
          <View pointerEvents="none" style={[styles.beforeClip, { width: resolvedDividerX }]}>
            <Image
              testID="before-after-slider-before-image"
              source={beforeImage}
              style={[styles.beforeImage, { width: containerWidth }]}
              resizeMode="contain"
              onLoad={handleBeforeLoad}
              onError={onImageError}
            />
          </View>

          <View pointerEvents="none" style={[styles.divider, { left: resolvedDividerX - 1 }]} />
          <View pointerEvents="none" style={[styles.handle, { left: resolvedDividerX - HANDLE_SIZE / 2 }]} />

          <View pointerEvents="none" style={styles.beforeLabelChip}>
            <ThemedText variant="caption" color={colors.textPrimary} style={styles.labelText}>
              {beforeLabel}
            </ThemedText>
          </View>
          <View pointerEvents="none" style={styles.afterLabelChip}>
            <ThemedText variant="caption" color={colors.textPrimary} style={styles.labelText}>
              {afterLabel}
            </ThemedText>
          </View>
          {(!loaded.before || !loaded.after) && (
            <ActivityIndicator
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Loading comparison"
            />
          )}
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
  fullImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  beforeClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  beforeImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
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
