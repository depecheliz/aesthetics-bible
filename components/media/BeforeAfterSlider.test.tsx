import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { BeforeAfterSlider, clampToWidth, clampInitialPosition } from './BeforeAfterSlider';

const beforeImage = { uri: 'https://example.com/before.jpg' };
const afterImage = { uri: 'https://example.com/after.jpg' };

async function layout(element: ReturnType<typeof screen.getByTestId>, width: number) {
  await act(async () => {
    fireEvent(element, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: width } } });
  });
}

async function loadBothImages() {
  await act(async () => {
    fireEvent(screen.getByTestId('before-after-slider-before-image'), 'load');
    fireEvent(screen.getByTestId('before-after-slider-after-image'), 'load');
  });
}

async function fireAccessibilityAction(actionName: 'increment' | 'decrement') {
  await act(async () => {
    screen.getByTestId('before-after-slider').props.onAccessibilityAction({
      nativeEvent: { actionName },
    });
  });
}

async function advanceTime(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('clampToWidth', () => {
  // The actual drag handler is wired through PanResponder, whose internal
  // gesture math depends on native touch-history bookkeeping that isn't
  // meaningfully simulatable in this test environment. The clamping logic
  // itself — the only real decision this component makes on drag — is a
  // pure function, so it's tested directly here instead.
  it('passes through a value already inside the bounds', () => {
    expect(clampToWidth(90, 300)).toBe(90);
  });

  it('clamps a value past the right edge down to the container width', () => {
    expect(clampToWidth(5000, 300)).toBe(300);
  });

  it('clamps a negative value up to zero', () => {
    expect(clampToWidth(-500, 300)).toBe(0);
  });

  it('handles a zero-width container without going negative', () => {
    expect(clampToWidth(50, 0)).toBe(0);
  });
});

describe('clampInitialPosition', () => {
  it('passes through a value already inside 0-1', () => {
    expect(clampInitialPosition(0.2)).toBe(0.2);
  });

  it('clamps a value above 1 down to 1', () => {
    expect(clampInitialPosition(1.7)).toBe(1);
  });

  it('clamps a negative value up to 0', () => {
    expect(clampInitialPosition(-0.3)).toBe(0);
  });

  it('falls back to 0.5 when undefined', () => {
    expect(clampInitialPosition(undefined)).toBe(0.5);
  });

  it('falls back to 0.5 when not finite', () => {
    expect(clampInitialPosition(NaN)).toBe(0.5);
  });
});

describe('BeforeAfterSlider', () => {
  it('starts the divider at 50% once its width is known from layout (default initialPosition)', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');

    await layout(slider, 300);

    expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(50);
  });

  it('starts the divider at a custom initialPosition', async () => {
    await render(
      <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} initialPosition={0.2} />,
    );
    const slider = screen.getByTestId('before-after-slider');

    await layout(slider, 300);

    expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(20);
  });

  it('clamps an out-of-range initialPosition into 0-100 on the accessibility value', async () => {
    await render(
      <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} initialPosition={5} />,
    );
    const slider = screen.getByTestId('before-after-slider');

    await layout(slider, 300);

    expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(100);
  });

  it('reports drag position as an accessibility value between 0 and 100', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');
    await layout(slider, 300);

    const { min, max, now } = screen.getByTestId('before-after-slider').props.accessibilityValue;
    expect(min).toBe(0);
    expect(max).toBe(100);
    expect(now).toBeGreaterThanOrEqual(0);
    expect(now).toBeLessThanOrEqual(100);
  });

  it('is wired as an interactive responder (drag handlers attached)', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');

    expect(typeof slider.props.onStartShouldSetResponder).toBe('function');
    expect(typeof slider.props.onResponderMove).toBe('function');
  });

  // Manual dragging itself is exercised above only as far as "the handlers
  // are wired" — real PanResponder gesture recognition depends on native
  // touch-history bookkeeping (see the clampToWidth block comment) that
  // can't be meaningfully faked here. The accessibility increment/decrement
  // path below moves the exact same `dividerX` state through the exact
  // same `clamp` function a real drag would, so it's used here as the
  // interactive, user-driven movement test.
  it('moves the divider via the accessibility increment/decrement actions', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');
    await layout(slider, 300);

    await fireAccessibilityAction('increment');
    expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(60);

    await fireAccessibilityAction('decrement');
    expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(50);
  });

  it('renders default BEFORE/AFTER labels, or custom ones when provided', async () => {
    const { rerender } = await render(
      <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />,
    );
    const slider = screen.getByTestId('before-after-slider');
    await layout(slider, 300);

    expect(await screen.findByText('BEFORE')).toBeTruthy();
    expect(await screen.findByText('AFTER')).toBeTruthy();

    await rerender(
      <BeforeAfterSlider
        beforeImage={beforeImage}
        afterImage={afterImage}
        beforeLabel="TODAY"
        afterLabel="MY VISUALIZATION"
      />,
    );
    const rerenderedSlider = screen.getByTestId('before-after-slider');
    await layout(rerenderedSlider, 300);

    expect(await screen.findByText('TODAY')).toBeTruthy();
    expect(await screen.findByText('MY VISUALIZATION')).toBeTruthy();
  });

  describe('autoDemo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('is opt-in: without it, the divider never moves on its own even after layout, image loads, and time passing', async () => {
      await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
      const slider = screen.getByTestId('before-after-slider');
      await layout(slider, 300);
      await loadBothImages();

      await advanceTime(5000);

      expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(50);
    });

    it('does not move before layout/images are ready, and does not throw once they are', async () => {
      await render(
        <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} autoDemo />,
      );
      const slider = screen.getByTestId('before-after-slider');
      await layout(slider, 300);

      // Before both images report loaded, the demo must not have started.
      await advanceTime(2000);
      expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(50);

      await loadBothImages();
      await advanceTime(2000);

      // Whatever the animated engine did under fake timers, it must not
      // have crashed and the value must still be a valid 0-100 reading.
      const now = screen.getByTestId('before-after-slider').props.accessibilityValue.now;
      expect(now).toBeGreaterThanOrEqual(0);
      expect(now).toBeLessThanOrEqual(100);
    });

    it('manual interaction immediately overrides autoDemo and does not resume after', async () => {
      await render(
        <BeforeAfterSlider
          beforeImage={beforeImage}
          afterImage={afterImage}
          autoDemo
          initialPosition={0.2}
        />,
      );
      const slider = screen.getByTestId('before-after-slider');
      await layout(slider, 300);
      await loadBothImages();

      await fireAccessibilityAction('increment');
      expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(30);

      // Further time passing must not fight the user's chosen position —
      // once interacted with, the auto sequence is permanently cancelled.
      await advanceTime(5000);
      expect(screen.getByTestId('before-after-slider').props.accessibilityValue.now).toBe(30);
    });
  });
});
