import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import PreviewScreen from '../../app/(tabs)/preview';
import { pickAndCompressPhoto } from '../../lib/services/imagePicker';
import {
  requestPreviewGeneration,
  getPreviewGenerationsUsedThisMonth,
  getPreviewImageUrls,
} from '../../lib/services/previewGeneration';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback: () => void) =>
    jest.requireActual('react').useEffect(callback, [callback]),
}));
jest.mock('../../lib/state/AuthContext', () => ({
  useOptionalAuth: () => ({ user: { id: 'owner' } }),
}));
jest.mock('../../lib/state/EntitlementContext', () => ({
  useEntitlement: () => ({ isPremium: true }),
}));
jest.mock('../../lib/services/previewProviderStatus', () => ({ isPreviewGenerationLive: true }));
jest.mock('../../lib/services/imagePicker', () => ({ pickAndCompressPhoto: jest.fn() }));
jest.mock('../../lib/services/previewGeneration', () => ({
  requestPreviewGeneration: jest.fn(),
  getPreviewGenerationsUsedThisMonth: jest.fn(),
  listSavedPreviews: jest.fn().mockResolvedValue([]),
  getPreviewImageUrls: jest.fn(),
  reportPreviewGeneration: jest.fn(),
  deleteSavedPreview: jest.fn(),
}));
jest.mock('../../lib/services/analyticsClient', () => ({ analytics: { track: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(pickAndCompressPhoto).mockResolvedValue({
    status: 'picked',
    photo: { uri: 'file:original.jpg', width: 300, height: 400 },
  });
  jest.mocked(getPreviewGenerationsUsedThisMonth).mockResolvedValue(0);
  jest
    .mocked(getPreviewImageUrls)
    .mockResolvedValue({ before: 'https://private/original', after: 'https://private/generated' });
});
it('selects a photo and goal, shows honest loading, then compares real saved images and refreshes usage', async () => {
  let finish!: (value: Awaited<ReturnType<typeof requestPreviewGeneration>>) => void;
  jest.mocked(requestPreviewGeneration).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await render(<PreviewScreen />);
  await fireEvent.press(screen.getByLabelText('Choose photo'));
  await screen.findByText('YOUR PHOTO');
  await fireEvent.press(screen.getByLabelText('Subtle Lip-Volume Look'));
  await fireEvent.press(screen.getByLabelText('Generate Preview'));
  await screen.findByLabelText('Stop waiting');
  expect(requestPreviewGeneration).toHaveBeenCalledWith(
    expect.objectContaining({
      sourcePhotoUri: 'file:original.jpg',
      visualizationGoal: 'Subtle Lip-Volume Look',
    }),
    expect.anything(),
  );
  jest.mocked(getPreviewGenerationsUsedThisMonth).mockResolvedValue(1);
  await act(async () =>
    finish({ status: 'success', generationId: 'saved', resultStoragePath: 'owner/result.jpg' }),
  );
  await screen.findByText('AI VISUALIZATION');
  expect(getPreviewImageUrls).toHaveBeenCalledWith(
    expect.objectContaining({
      result_storage_path: 'owner/result.jpg',
      source_storage_path: expect.stringMatching(/^owner\//),
    }),
  );
  await screen.findByText('1 of 10 visualizations used this month');
  const slider = screen.getByTestId('before-after-slider');
  await fireEvent(slider, 'layout', { nativeEvent: { layout: { width: 300, height: 375 } } });
  expect(await screen.findAllByText('PREVIEW')).toHaveLength(2);
  await screen.findByText('BEFORE');
});
it('keeps failed requests out of the result state and retries the same photo/request without reopening picker', async () => {
  jest.mocked(requestPreviewGeneration).mockResolvedValue({
    status: 'failure',
    code: 'generation_failed',
    message: 'Provider unavailable. Retry.',
  });
  await render(<PreviewScreen />);
  await fireEvent.press(screen.getByLabelText('Choose photo'));
  await screen.findByText('YOUR PHOTO');
  await fireEvent.press(screen.getByLabelText('Generate Preview'));
  await screen.findByText('Provider unavailable. Retry.');
  expect(screen.queryByTestId('before-after-slider')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Retry Preview'));
  await waitFor(() => expect(requestPreviewGeneration).toHaveBeenCalledTimes(2));
  expect(jest.mocked(requestPreviewGeneration).mock.calls[0][0]).toEqual(
    jest.mocked(requestPreviewGeneration).mock.calls[1][0],
  );
  expect(pickAndCompressPhoto).toHaveBeenCalledTimes(1);
  expect(getPreviewGenerationsUsedThisMonth).toHaveBeenCalledTimes(1);
});
it('picker cancellation never starts generation', async () => {
  jest.mocked(pickAndCompressPhoto).mockResolvedValue({ status: 'cancelled' });
  await render(<PreviewScreen />);
  await fireEvent.press(screen.getByLabelText('Choose photo'));
  await waitFor(() => expect(pickAndCompressPhoto).toHaveBeenCalled());
  expect(requestPreviewGeneration).not.toHaveBeenCalled();
});
it('stopping the wait ignores a late result without pretending the server was cancelled', async () => {
  let finish!: (value: Awaited<ReturnType<typeof requestPreviewGeneration>>) => void;
  jest.mocked(requestPreviewGeneration).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await render(<PreviewScreen />);
  await fireEvent.press(screen.getByLabelText('Choose photo'));
  await fireEvent.press(screen.getByLabelText('Generate Preview'));
  await fireEvent.press(screen.getByLabelText('Stop waiting'));
  expect(jest.mocked(requestPreviewGeneration).mock.calls[0][1]?.aborted).toBe(true);
  await act(async () =>
    finish({ status: 'success', generationId: 'late', resultStoragePath: 'owner/late.jpg' }),
  );
  expect(screen.queryByTestId('before-after-slider')).toBeNull();
  expect(screen.getByText(/A request already received by the server may finish/)).toBeTruthy();
});
