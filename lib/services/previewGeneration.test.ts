import {
  requestPreviewGeneration,
  getPreviewGenerationsUsedThisMonth,
  getPreviewImageUrls,
} from './previewGeneration';
import { supabase } from './supabaseClient';
import { uploadPreviewSourcePhoto } from './previewStorage';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    functions: { invoke: jest.fn() },
    rpc: jest.fn(),
    storage: { from: jest.fn() },
  },
}));
jest.mock('./previewStorage', () => ({ uploadPreviewSourcePhoto: jest.fn() }));
const request = {
  userId: 'user',
  requestId: 'request-id',
  sourcePhotoUri: 'file:photo',
  visualizationGoal: 'Subtle Lip-Volume Look',
  intensity: 'subtle' as const,
};
const invoke = jest.mocked(supabase.functions.invoke);

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(supabase.auth.getUser)
    .mockResolvedValue({ data: { user: { id: 'user' } }, error: null } as never);
  jest.mocked(uploadPreviewSourcePhoto).mockResolvedValue('user/request-id.jpg');
});
it('uploads and forwards the selected goal/intensity, then returns only a real stored result', async () => {
  invoke.mockResolvedValue({
    data: { generationId: 'generation', resultStoragePath: 'user/result.jpg' },
    error: null,
  });
  expect(await requestPreviewGeneration(request)).toEqual({
    status: 'success',
    generationId: 'generation',
    resultStoragePath: 'user/result.jpg',
  });
  expect(invoke).toHaveBeenCalledWith(
    'generate-preview',
    expect.objectContaining({
      body: {
        sourceStoragePath: 'user/request-id.jpg',
        visualizationGoal: request.visualizationGoal,
        intensity: 'subtle',
      },
    }),
  );
  expect(supabase.rpc).not.toHaveBeenCalled(); // Client cannot increment quota.
});
it.each([
  null,
  {},
  { generationId: 'g' },
  { generationId: 'g', resultStoragePath: 'another-user/photo.jpg' },
])('rejects malformed/unowned success payload %p', async (data) => {
  invoke.mockResolvedValue({ data, error: null });
  expect(await requestPreviewGeneration(request)).toMatchObject({
    status: 'failure',
    code: 'malformed_response',
  });
});
it('does not call generation after failed upload', async () => {
  jest.mocked(uploadPreviewSourcePhoto).mockRejectedValue(new Error('network'));
  expect(await requestPreviewGeneration(request)).toMatchObject({
    status: 'failure',
    code: 'upload_failed',
  });
  expect(invoke).not.toHaveBeenCalled();
});
it('blocks unauthenticated uploads', async () => {
  jest
    .mocked(supabase.auth.getUser)
    .mockResolvedValue({ data: { user: null }, error: null } as never);
  expect(await requestPreviewGeneration(request)).toMatchObject({
    status: 'failure',
    code: 'unauthenticated',
  });
  expect(uploadPreviewSourcePhoto).not.toHaveBeenCalled();
});
it('uses the same request identity when retried after an error', async () => {
  invoke.mockResolvedValueOnce({
    data: { error: 'failed', code: 'generation_failed' },
    error: null,
  });
  invoke.mockResolvedValueOnce({
    data: { generationId: 'g', resultStoragePath: 'user/result.jpg' },
    error: null,
  });
  expect(await requestPreviewGeneration(request)).toMatchObject({ status: 'failure' });
  expect(await requestPreviewGeneration(request)).toMatchObject({ status: 'success' });
  expect(jest.mocked(uploadPreviewSourcePhoto).mock.calls).toEqual([
    ['user', 'file:photo', 'request-id'],
    ['user', 'file:photo', 'request-id'],
  ]);
});
it('handles thrown network failures honestly', async () => {
  invoke.mockRejectedValue(new Error('network'));
  expect(await requestPreviewGeneration(request)).toMatchObject({ status: 'failure' });
});
it('does not start a cancelled request', async () => {
  const controller = new AbortController();
  controller.abort();
  expect(await requestPreviewGeneration(request, controller.signal)).toMatchObject({
    status: 'failure',
    code: 'cancelled',
  });
  expect(uploadPreviewSourcePhoto).not.toHaveBeenCalled();
});
it('bounds even a stalled authentication/upload stage and never starts generation afterward', async () => {
  jest.useFakeTimers();
  jest.mocked(supabase.auth.getUser).mockImplementation(() => new Promise(() => undefined));
  const result = requestPreviewGeneration(request);
  await jest.advanceTimersByTimeAsync(125_000);
  expect(await result).toMatchObject({ status: 'failure', code: 'generation_timeout' });
  expect(invoke).not.toHaveBeenCalled();
  jest.useRealTimers();
});
it('does not display a failed quota lookup as zero usage', async () => {
  jest
    .mocked(supabase.rpc)
    .mockResolvedValue({ data: null, error: { message: 'offline' } } as never);
  await expect(getPreviewGenerationsUsedThisMonth()).rejects.toThrow();
});
it('renews private image links every time the saved result is opened', async () => {
  const sign = jest
    .fn()
    .mockResolvedValue({ data: { signedUrl: 'https://private/link' }, error: null });
  jest.mocked(supabase.storage.from).mockReturnValue({ createSignedUrl: sign } as never);
  const row = { source_storage_path: 'user/source', result_storage_path: 'user/result' };
  await getPreviewImageUrls(row);
  await getPreviewImageUrls(row);
  expect(sign).toHaveBeenCalledTimes(4);
  expect(sign).toHaveBeenCalledWith('user/result', 600);
});
