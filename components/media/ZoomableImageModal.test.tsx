import { fireEvent, render, screen } from '@testing-library/react-native';
import { ZoomableImageModal } from './ZoomableImageModal';

const SOURCE = { uri: 'https://example.com/diagram.jpg' };

describe('ZoomableImageModal', () => {
  it('renders nothing when not visible', async () => {
    await render(<ZoomableImageModal visible={false} source={SOURCE} onClose={jest.fn()} />);

    expect(screen.queryByTestId('zoomable-image-modal')).toBeNull();
  });

  it('renders the image when visible', async () => {
    await render(<ZoomableImageModal visible source={SOURCE} label="RF" onClose={jest.fn()} />);

    expect(screen.getByTestId('zoomable-image-modal')).toBeTruthy();
    expect(screen.getByTestId('zoomable-image-modal-image').props.source).toEqual(SOURCE);
  });

  it('calls onClose when the close button is pressed', async () => {
    const onClose = jest.fn();
    await render(<ZoomableImageModal visible source={SOURCE} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Close image viewer'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('gives the close button a usable accessibility role and label', async () => {
    await render(<ZoomableImageModal visible source={SOURCE} onClose={jest.fn()} />);

    const closeButton = screen.getByLabelText('Close image viewer');
    expect(closeButton.props.accessibilityRole).toBe('button');
  });
});
