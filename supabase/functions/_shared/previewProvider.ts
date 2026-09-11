export class PreviewProviderError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export type ProviderConfig = { model?: string; token?: string };
export type ProviderResult = {
  resultBytes: Uint8Array;
  providerId: string;
  costUsd: null;
  contentType: string;
};

// Existing benchmark candidates only; deliberately no default/automatic fallback.
export function providerInput(model: string, source: string, prompt: string) {
  if (model === 'black-forest-labs/flux-kontext-pro') {
    return { prompt, input_image: source, output_format: 'jpg' };
  }
  if (model === 'google/nano-banana-2') {
    return {
      prompt,
      image_input: [source],
      aspect_ratio: 'match_input_image',
      output_format: 'jpg',
    };
  }
  throw new PreviewProviderError(
    'provider_not_configured',
    'A tested Preview model must be configured on the server.',
  );
}

export function validateProviderConfig(config: ProviderConfig) {
  providerInput(config.model ?? '', '', '');
  if (!config.token)
    throw new PreviewProviderError(
      'provider_not_configured',
      'The Preview provider credential is missing.',
    );
}

export function outputUrl(output: unknown): string {
  const value = Array.isArray(output) && output.length === 1 ? output[0] : output;
  if (typeof value !== 'string')
    throw new PreviewProviderError(
      'malformed_provider_response',
      'The provider returned no usable image.',
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PreviewProviderError(
      'malformed_provider_response',
      'The provider returned an invalid image.',
    );
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    !(url.hostname === 'replicate.delivery' || url.hostname.endsWith('.replicate.delivery'))
  ) {
    throw new PreviewProviderError(
      'malformed_provider_response',
      'The provider returned an unsupported image location.',
    );
  }
  return url.href;
}

// Bounded within an Edge request. No client keys, no provider payload logging.
export async function callPreviewProvider(
  source: string,
  prompt: string,
  config: ProviderConfig,
  fetcher: typeof fetch = fetch,
): Promise<ProviderResult> {
  validateProviderConfig(config);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 100_000);
  const headers = { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' };
  let predictionId: string | undefined;
  const api = 'https://api.replicate.com/v1';
  try {
    const created = await fetcher(`${api}/models/${config.model}/predictions`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'wait=5', 'Cancel-After': '90s' },
      body: JSON.stringify({ input: providerInput(config.model!, source, prompt) }),
      signal: controller.signal,
    });
    if (!created.ok)
      throw new PreviewProviderError(
        'provider_error',
        'The image provider could not accept the request. Please try again later.',
      );
    let prediction = await created.json();
    if (typeof prediction?.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(prediction.id)) {
      throw new PreviewProviderError(
        'malformed_provider_response',
        'The provider returned an invalid request.',
      );
    }
    predictionId = prediction.id;
    while (prediction.status === 'starting' || prediction.status === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const poll = await fetcher(`${api}/predictions/${predictionId}`, {
        headers,
        signal: controller.signal,
      });
      if (!poll.ok)
        throw new PreviewProviderError(
          'provider_error',
          'Could not retrieve the provider result. Please retry.',
        );
      prediction = await poll.json();
    }
    if (prediction.status !== 'succeeded')
      throw new PreviewProviderError(
        'generation_failed',
        'Your preview could not be generated. Please try another photo or retry.',
      );
    const result = await fetcher(outputUrl(prediction.output), {
      signal: controller.signal,
      redirect: 'error',
    });
    if (!result.ok)
      throw new PreviewProviderError(
        'result_download_failed',
        'The generated image could not be retrieved. Please retry.',
      );
    const contentType = result.headers.get('content-type')?.split(';')[0];
    if (
      contentType !== 'image/jpeg' &&
      contentType !== 'image/png' &&
      contentType !== 'image/webp'
    ) {
      throw new PreviewProviderError(
        'malformed_provider_response',
        'The provider did not return an image.',
      );
    }
    const resultBytes = new Uint8Array(await result.arrayBuffer());
    const isImage =
      contentType === 'image/jpeg'
        ? resultBytes[0] === 255 && resultBytes[1] === 216 && resultBytes[2] === 255
        : contentType === 'image/png'
          ? resultBytes[0] === 137 &&
            resultBytes[1] === 80 &&
            resultBytes[2] === 78 &&
            resultBytes[3] === 71
          : String.fromCharCode(...resultBytes.slice(0, 4)) === 'RIFF' &&
            String.fromCharCode(...resultBytes.slice(8, 12)) === 'WEBP';
    if (!isImage || resultBytes.length > 20 * 1024 * 1024)
      throw new PreviewProviderError(
        'malformed_provider_response',
        'The generated image is invalid or too large.',
      );
    // Unknown billing remains null; do not misrepresent estimates as actual cost.
    return { resultBytes, providerId: config.model!, contentType, costUsd: null };
  } catch (error) {
    if (predictionId) {
      await fetcher(`${api}/predictions/${predictionId}/cancel`, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(3000),
      }).catch(() => undefined);
    }
    if (controller.signal.aborted)
      throw new PreviewProviderError(
        'generation_timeout',
        'Preview took too long. No preview was saved. Please retry.',
      );
    if (error instanceof PreviewProviderError) throw error;
    throw new PreviewProviderError(
      'provider_error',
      'Could not communicate with the image provider. Please retry.',
    );
  } finally {
    clearTimeout(timer);
  }
}
