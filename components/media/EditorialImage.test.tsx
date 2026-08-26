import { render, screen } from '@testing-library/react-native';
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
