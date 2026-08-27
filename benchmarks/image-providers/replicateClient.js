// Minimal Replicate REST client — no SDK dependency, so this benchmark
// never touches the app's own package.json/dependency tree. Uses Node's
// built-in fetch (Node 18+).
//
// The token is read once from process.env and passed only in the
// Authorization header of each request. It is never logged, never written
// to any output file, and never included in a saved record.

const API_BASE = 'https://api.replicate.com/v1';

function getToken() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      'REPLICATE_API_TOKEN is not set. Copy benchmarks/image-providers/.env.example to ' +
        'benchmarks/image-providers/.env and fill in a real token (never commit that file).',
    );
  }
  return token;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs one prediction on `owner/model` and waits for it to finish.
 * Returns the raw Replicate prediction object (status, output, metrics, error).
 * Throws only on transport failure — a provider-side generation failure is
 * returned as a normal object with status: 'failed' so callers can record it.
 */
async function runPrediction(replicateModel, input, { pollTimeoutMs = 180000 } = {}) {
  const token = getToken();

  const createRes = await fetch(`${API_BASE}/models/${replicateModel}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify({ input }),
  });

  if (createRes.status === 401) {
    throw new Error('Replicate rejected the API token (401). Check REPLICATE_API_TOKEN.');
  }
  if (!createRes.ok && createRes.status !== 201 && createRes.status !== 200) {
    const text = await createRes.text().catch(() => '');
    throw new Error(`Replicate request failed (${createRes.status}): ${text.slice(0, 300)}`);
  }

  let prediction = await createRes.json();

  const start = Date.now();
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - start > pollTimeoutMs) {
      return { ...prediction, status: 'failed', error: 'benchmark_poll_timeout' };
    }
    await sleep(2000);
    const pollRes = await fetch(`${API_BASE}/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    prediction = await pollRes.json();
  }

  return prediction;
}

/** Normalizes a prediction's `output` (string | string[] | null) to an array of URLs. */
function outputUrls(prediction) {
  if (!prediction.output) return [];
  return Array.isArray(prediction.output) ? prediction.output : [prediction.output];
}

async function downloadToFile(url, destPath) {
  const fs = require('fs');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download output image (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

module.exports = { runPrediction, outputUrls, downloadToFile };
