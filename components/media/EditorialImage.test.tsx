import { fireEvent, render, screen } from '@testing-library/react-native';
import { EditorialImage } from './EditorialImage';

/**
 * Regression test for the "Maximum update depth exceeded" loop that
 * appeared on Home, Preview, and Paywall.
 *
 * Root cause: react-native-web's <Image> re-runs its own image-loading
 * useEffect whenever its onLoadStart/onLoad/onError props change
 * reference. EditorialImage used to pass brand-new inline arrow functions
 * on every render, so that effect re-fired every render, which flipped
 * `status`, which re-rendered EditorialImage, which created new inline
 * functions again — forever. This test asserts the actual contract that
 * prevents it (stable callback identity), not just that a console
 * warning is absent.
 */
describe('EditorialImage', () => {
  it('keeps onLoadStart/onLoad/onError referentially stable across re-renders', async () => {
    const { rerender } = await render(<EditorialImage variant="portrait" style={{ width: 100 }} />);

    const before = screen.getByTestId('editorial-image').props;
    const beforeHandlers = {
      onLoadStart: before.onLoadStart,
      onLoad: before.onLoad,
      onError: before.onError,
    };
    expect(beforeHandlers.onLoadStart).toBeInstanceOf(Function);

    // Force EditorialImage to re-render with an unrelated prop change —
    // the same situation a parent re-render (e.g. from context) causes.
    await rerender(<EditorialImage variant="portrait" style={{ width: 200 }} />);

    const after = screen.getByTestId('editorial-image').props;
    expect(after.onLoadStart).toBe(beforeHandlers.onLoadStart);
    expect(after.onLoad).toBe(beforeHandlers.onLoad);
    expect(after.onError).toBe(beforeHandlers.onError);
  });

  it('gives each mounted instance its own stable callbacks (not stale across instances)', async () => {
    const { unmount } = await render(<EditorialImage variant="portrait" />);
    const first = screen.getByTestId('editorial-image').props.onLoad;
    await unmount();

    await render(<EditorialImage variant="treatment" />);
    const second = screen.getByTestId('editorial-image').props.onLoad;

    expect(second).toBeInstanceOf(Function);
    expect(second).not.toBe(first);
  });
});

describe('EditorialImage — zoomable', () => {
  it('renders no zoom trigger or badge when zoomable is not passed (default false)', async () => {
    await render(<EditorialImage variant="treatment" label="RF" />);

    expect(screen.queryByTestId('editorial-image-zoom-trigger')).toBeNull();
    expect(screen.queryByTestId('zoomable-image-modal')).toBeNull();
  });

  it('opens the full-screen viewer on tap when zoomable is true', async () => {
    await render(<EditorialImage variant="treatment" zoomable label="RF" />);

    expect(screen.queryByTestId('zoomable-image-modal')).toBeNull();

    await fireEvent.press(screen.getByTestId('editorial-image-zoom-trigger'));

    expect(screen.getByTestId('zoomable-image-modal')).toBeTruthy();
  });

  it('falls back to the normal source for the zoom viewer when no zoomSource is given', async () => {
    const source = { uri: 'https://example.com/one-asset.jpg' };
    await render(<EditorialImage variant="treatment" uri={source} zoomable label="One asset" />);

    await fireEvent.press(screen.getByTestId('editorial-image-zoom-trigger'));

    expect(screen.getByTestId('zoomable-image-modal-image').props.source).toEqual(source);
  });

  it('opens the zoomSource (not the collapsed source) when a separate zoom source is given', async () => {
    const preview = { uri: 'https://example.com/preview.jpg' };
    const full = { uri: 'https://example.com/full-diagram.jpg' };
    await render(<EditorialImage variant="treatment" uri={preview} zoomSource={full} zoomable label="RF" />);

    await fireEvent.press(screen.getByTestId('editorial-image-zoom-trigger'));

    const modalImageSource = screen.getByTestId('zoomable-image-modal-image').props.source;
    expect(modalImageSource).toEqual(full);
    expect(modalImageSource).not.toEqual(preview);
  });

  it('closing the viewer removes it from the tree', async () => {
    await render(<EditorialImage variant="treatment" zoomable label="RF" />);

    await fireEvent.press(screen.getByTestId('editorial-image-zoom-trigger'));
    expect(screen.getByTestId('zoomable-image-modal')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Close image viewer'));
    expect(screen.queryByTestId('zoomable-image-modal')).toBeNull();
  });

  it('does not render a zoom trigger when zoomable is true but there is no image to show', async () => {
    await render(<EditorialImage variant="skin-detail" zoomable />);

    expect(screen.queryByTestId('editorial-image-zoom-trigger')).toBeNull();
  });
});
