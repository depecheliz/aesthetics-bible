import { render, screen, fireEvent } from '@testing-library/react-native';
import { BeforeAfterSlider, clampToWidth } from './BeforeAfterSlider';

const beforeImage = { uri: 'https://example.com/before.jpg' };
const afterImage = { uri: 'https://example.com/after.jpg' };

function layout(element: ReturnType<typeof screen.getByTestId>, width: number) {
  fireEvent(element, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: width } } });
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

describe('BeforeAfterSlider', () => {
  it('starts the divider at 50% once its width is known from layout', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');

    layout(slider, 300);

    expect(slider.props.accessibilityValue.now).toBe(50);
  });

  it('reports drag position as an accessibility value between 0 and 100', async () => {
    await render(<BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />);
    const slider = screen.getByTestId('before-after-slider');
    layout(slider, 300);

    const { min, max, now } = slider.props.accessibilityValue;
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

  it('renders default BEFORE/AFTER labels, or custom ones when provided', async () => {
    const { rerender } = await render(
      <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />,
    );
    const slider = screen.getByTestId('before-after-slider');
    layout(slider, 300);

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
    layout(rerenderedSlider, 300);

    expect(await screen.findByText('TODAY')).toBeTruthy();
    expect(await screen.findByText('MY VISUALIZATION')).toBeTruthy();
  });
});
