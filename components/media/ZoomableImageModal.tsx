import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

/**
 * Full-screen, pinch-to-zoom viewer for a single diagram.
 *
 * Presentation only — it never fetches, generates, or picks an image; the
 * caller (EditorialImage) hands it a resolved source and open/close state.
 * `resizeMode="contain"` always, so the full diagram is never cropped
 * regardless of zoom level.
 *
 * Pinch/pan is implemented with core React Native `PanResponder` +
 * `Animated` — no new dependency. See EditorialImage.tsx for why
 * react-native-gesture-handler was deliberately not used.
 */

type ZoomableImageModalProps = {
  visible: boolean;
  source: ImageSourcePropType;
  /** Real UI copy — the diagram's own caption/name, read by the close button's a11y label. */
  label?: string;
  onClose: () => void;
};

const MAX_SCALE = 4;

export function ZoomableImageModal({ visible, source, label, onClose }: ZoomableImageModalProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const [translate] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));

  // Plain numbers (not read from the Animated values, which aren't
  // synchronously readable) tracking pinch/pan gesture state between
  // PanResponder callbacks. A ref, not state: it's mutated and read only
  // from imperative gesture handlers, never during render, so it should
  // never itself cause a re-render.
  const gestureState = useRef({
    baseScale: 1,
    baseDistance: 0,
    baseTranslate: { x: 0, y: 0 },
  });

  const resetTransform = useCallback(() => {
    gestureState.current.baseScale = 1;
    gestureState.current.baseTranslate = { x: 0, y: 0 };
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translate, { toValue: { x: 0, y: 0 }, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [scale, translate]);

  const handleClose = useCallback(() => {
    resetTransform();
    onClose();
  }, [onClose, resetTransform]);

  const distanceBetween = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  // panResponder is created once via the lazy useState initializer and
  // never recreated, so its handlers read gestureState.current only from
  // within real event callbacks (onPanResponderGrant/Move/Release) —
  // never during render — even though the lint rule can't see that
  // through the closure. Same precedent as BeforeAfterSlider.tsx.
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        if (evt.nativeEvent.touches.length === 2) {
          gestureState.current.baseDistance = distanceBetween(evt.nativeEvent.touches);
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent, gesture) => {
        const { touches } = evt.nativeEvent;
        if (touches.length === 2) {
          if (gestureState.current.baseDistance === 0) {
            gestureState.current.baseDistance = distanceBetween(touches);
            return;
          }
          const nextScale = Math.min(
            MAX_SCALE,
            Math.max(
              1,
              gestureState.current.baseScale * (distanceBetween(touches) / gestureState.current.baseDistance),
            ),
          );
          scale.setValue(nextScale);
        } else if (touches.length === 1 && gestureState.current.baseScale > 1) {
          translate.setValue({
            x: gestureState.current.baseTranslate.x + gesture.dx,
            y: gestureState.current.baseTranslate.y + gesture.dy,
          });
        }
      },
      onPanResponderRelease: () => {
        gestureState.current.baseDistance = 0;
        // @ts-expect-error -- Animated.Value exposes the private current
        // value via __getValue at runtime; there is no public sync getter.
        const currentScale: number = scale.__getValue();
        if (currentScale <= 1) {
          resetTransform();
          return;
        }
        gestureState.current.baseScale = currentScale;
        gestureState.current.baseTranslate = {
          // @ts-expect-error -- see above.
          x: translate.x.__getValue(),
          // @ts-expect-error -- see above.
          y: translate.y.__getValue(),
        };
      },
    }),
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
      testID="zoomable-image-modal"
    >
      <View style={styles.container}>
        <View style={styles.imageWrap} {...panResponder.panHandlers}>
          <Animated.Image
            testID="zoomable-image-modal-image"
            source={source}
            resizeMode="contain"
            accessible
            accessibilityLabel={label ?? 'Diagram'}
            style={[
              styles.image,
              { transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] },
            ]}
          />
        </View>

        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close image viewer"
          hitSlop={12}
        >
          <Feather name="x" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
