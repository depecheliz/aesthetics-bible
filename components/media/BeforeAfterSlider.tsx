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
 * LEFT of the divider = before, RIGHT of the divider = after. The
 * "before" image is the top layer, clipped to the divider's x-position
 * (0..dividerX, the left region); the "after" image is the full image
 * underneath, showing through to the right of the clip. Dragging the
 * divider right grows the before-clip window (reveals more before);
 * dragging left shrinks it (reveals more after).
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

/** Pure clamp used both by the live drag handler and by tests — kept
 * exported so drag-bounds behavior is directly testable without having to
 * simulate React Native's internal touch-history machinery, which
 * PanResponder needs for real gesture math but this component's own
 * handlers never touch. */
export function clampToWidth(x: number, width: number): number {
  return Math.max(0, Math.min(width, x));
}

/** Clamps a normalized (0–1) starting position; a non-finite input (NaN,
 * missing) falls back to the 0.5 default rather than clamping toward an
 * edge. Exported for direct testing, same rationale as `clampToWidth`. */
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

  // Stable identities: react-native-web's <Image> re-runs its own load
  // effect whenever onLoad/onError change reference, so new inline arrow
  // functions here would re-trigger the load on every render — which
  // flips `loaded`, which re-renders this component, which would create
  // new inline functions again, forever. Same precedent as
  // EditorialImage.tsx. useCallback breaks that cycle.
  const handleBeforeLoad = useCallback(() => setLoaded((value) => ({ ...value, before: true })), []);
  const handleAfterLoad = useCallback(() => setLoaded((value) => ({ ...value, after: true })), []);

  // Set on the first user-initiated drag or accessibility action; once
  // true it stays true for the lifetime of this mount, so a user who
  // interacts before or during the auto-demo sweep permanently owns the
  // divider and the sweep can never resume or restart.
  const userInteractedRef = useRef(false);
  // Guards the demo effect below to a single run per mount even if its
  // dependencies (containerWidth, loaded) change again afterward.
  const demoStartedRef = useRef(false);
  const demoAnimRef = useRef<Animated.Value | null>(null);

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

  // One-shot auto-demo sweep (roughly initialPosition → 80% → 50%),
  // gated on layout + both images being ready so it never animates over
  // a blank/loading frame. Runs at most once per mount (demoStartedRef)
  // and bails entirely if the user already interacted before it could
  // start; the PanResponder handlers above stop it immediately if the
  // user interacts while it's running.
  useEffect(() => {
    if (!autoDemo) return undefined;
    if (demoStartedRef.current) return undefined;
    if (userInteractedRef.current) return undefined;
    if (containerWidth <= 0 || !loaded.before || !loaded.after) return undefined;

    demoStartedRef.current = true;
    const anim = new Animated.Value(resolvedDividerX);
    demoAnimRef.current = anim;
    const listenerId = anim.addListener(({ value }) => {
      if (!userInteractedRef.current) {
        setDividerX(value);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolvedDividerX is only read as this effect's animation *starting point*, not a reactive dependency: including it would restart/redefine the sequence on every drag-driven dividerX change, which is exactly what demoStartedRef/userInteractedRef exist to prevent.
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
          {/* After — full image, bottom layer. Shows through to the right
              of the before-clip window below. */}
          <Image
            testID="before-after-slider-after-image"
            source={afterImage}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            onLoad={handleAfterLoad}
            onError={onImageError}
          />

          {/* Before — top layer, clipped to the divider position (the
              left region, 0..dividerX). */}
          <View pointerEvents="none" style={[styles.beforeClip, { width: resolvedDividerX }]}>
            <Image
              testID="before-after-slider-before-image"
              source={beforeImage}
              style={[StyleSheet.absoluteFill, { width: containerWidth }]}
              resizeMode="contain"
              onLoad={handleBeforeLoad}
              onError={onImageError}
            />
          </View>

          <View pointerEvents="none" style={[styles.divider, { left: resolvedDividerX - 1 }]} />
          <View
            pointerEvents="none"
            style={[styles.handle, { left: resolvedDividerX - HANDLE_SIZE / 2 }]}
          />

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
  beforeClip: {
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
