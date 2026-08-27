// Stage 1 benchmark orchestrator. Isolated from the app entirely — reads
// only from benchmarks/image-providers/, writes only to
// benchmarks/image-providers/outputs/.
//
// Usage:
//   node run-benchmark.js --dry-run     # prints the plan + cost estimate, calls nothing, spends nothing
//   node run-benchmark.js --confirm     # actually runs all (source x transformation x provider x repeat) calls
//
// Requires benchmarks/image-providers/.env with REPLICATE_API_TOKEN (see .env.example)
// and exactly 3 source portraits in benchmarks/image-providers/inputs/.

const fs = require('fs');
const path = require('path');
const { transformations } = require('./transformations');
const { providers, computeActualCost } = require('./providers');
const { runPrediction, outputUrls, downloadToFile } = require('./replicateClient');

const DIR = __dirname;
const INPUTS_DIR = path.join(DIR, 'inputs');
const OUTPUTS_DIR = path.join(DIR, 'outputs');
const MANIFEST_PATH = path.join(OUTPUTS_DIR, 'manifest.jsonl');
const REPEATS = 2;

function loadEnvFile() {
  const envPath = path.join(DIR, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

function loadSourceImages() {
  const files = fs
    .readdirSync(INPUTS_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  return files.map((filename) => ({
    id: path.basename(filename, path.extname(filename)),
    filename,
    fullPath: path.join(INPUTS_DIR, filename),
  }));
}

function toDataUri(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const base64 = fs.readFileSync(filePath).toString('base64');
  return `data:image/${mime};base64,${base64}`;
}

function buildPlan(sources) {
  const plan = [];
  for (const source of sources) {
    for (const transformation of transformations) {
      for (const provider of providers) {
        for (let repeat = 1; repeat <= REPEATS; repeat++) {
          plan.push({ source, transformation, provider, repeat });
        }
      }
    }
  }
  return plan;
}

function estimateCost(plan) {
  return plan.reduce((sum, cell) => sum + cell.provider.estimatedCostPerImage, 0);
}

function printPlan(plan, sources) {
  console.log(`Source portraits found (${sources.length}, expected 3):`);
  for (const s of sources) console.log(`  - ${s.filename} (id: ${s.id})`);
  console.log('');
  console.log(`Transformations (${transformations.length}):`);
  for (const t of transformations) console.log(`  - [${t.mode}] ${t.label}${t.intensity ? ` (${t.intensity})` : ''}`);
  console.log('');
  console.log(`Providers (${providers.length}):`);
  for (const p of providers) console.log(`  - ${p.label}  →  ${p.replicateModel}  (~$${p.estimatedCostPerImage}/image)`);
  console.log('');
  console.log(`Repeats per cell: ${REPEATS}`);
  console.log(`Total planned generations: ${plan.length}`);
  console.log(`Estimated total cost: $${estimateCost(plan).toFixed(2)}`);
}

function appendManifestRecord(record) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
  fs.appendFileSync(MANIFEST_PATH, JSON.stringify(record) + '\n');
}

async function runCell(cell, index, total) {
  const { source, transformation, provider, repeat } = cell;
  const label = `[${index + 1}/${total}] ${source.id} / ${transformation.mode}:${transformation.id} / ${provider.id} / repeat ${repeat}`;
  console.log(label);

  const outDir = path.join(OUTPUTS_DIR, source.id, `${transformation.mode}_${transformation.id}`, provider.id);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `repeat_${repeat}.jpg`);
  const relativeOutFile = path.relative(OUTPUTS_DIR, outFile);

  const baseRecord = {
    provider_id: provider.id,
    provider_label: provider.label,
    replicate_model: provider.replicateModel,
    source_image_id: source.id,
    transformation_mode: transformation.mode,
    transformation_id: transformation.id,
    transformation_label: transformation.label,
    intensity: transformation.intensity,
    repeat,
    output_file: null,
    latency_ms: null,
    cost_usd: null,
    cost_source: null,
    success: false,
    error_type: null,
    timestamp: new Date().toISOString(),
  };

  const startedAt = Date.now();
  try {
    const imageDataUri = toDataUri(source.fullPath);
    const input = provider.buildInput(transformation.instruction, imageDataUri);
    const prediction = await runPrediction(provider.replicateModel, input);
    const latencyMs = Date.now() - startedAt;

    if (prediction.status !== 'succeeded') {
      appendManifestRecord({
        ...baseRecord,
        latency_ms: latencyMs,
        success: false,
        error_type: prediction.error ? String(prediction.error).slice(0, 200) : `status_${prediction.status}`,
      });
      console.log(`  FAILED: ${prediction.status} ${prediction.error ?? ''}`);
      return;
    }

    const urls = outputUrls(prediction);
    if (urls.length === 0) {
      appendManifestRecord({ ...baseRecord, latency_ms: latencyMs, success: false, error_type: 'no_output_returned' });
      console.log('  FAILED: no output URL returned');
      return;
    }

    await downloadToFile(urls[0], outFile);
    const cost = computeActualCost(provider, prediction);

    appendManifestRecord({
      ...baseRecord,
      output_file: relativeOutFile,
      latency_ms: latencyMs,
      cost_usd: Number(cost.value.toFixed(4)),
      cost_source: cost.source,
      success: true,
    });
    console.log(`  OK  (${latencyMs}ms, ~$${cost.value.toFixed(4)})`);
  } catch (err) {
    appendManifestRecord({
      ...baseRecord,
      latency_ms: Date.now() - startedAt,
      success: false,
      error_type: String(err.message || err).slice(0, 200),
    });
    console.log(`  ERROR: ${err.message || err}`);
  }
}

async function main() {
  loadEnvFile();
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirmed = args.includes('--confirm');

  const sources = loadSourceImages();
  const plan = buildPlan(sources);

  if (sources.length !== 3) {
    console.warn(`WARNING: expected exactly 3 source portraits in inputs/, found ${sources.length}.`);
  }

  if (dryRun || !confirmed) {
    printPlan(plan, sources);
    if (!confirmed) {
      console.log('\nDry run only (no API calls made, nothing charged). Pass --confirm to actually run it.');
    }
    return;
  }

  if (sources.length !== 3) {
    console.error('Refusing to run the paid benchmark without exactly 3 source portraits. Aborting.');
    process.exit(1);
  }

  printPlan(plan, sources);
  console.log('\nStarting live run — this will call the Replicate API and incur real cost.\n');

  for (let i = 0; i < plan.length; i++) {
    await runCell(plan[i], i, plan.length);
  }

  console.log(`\nDone. Manifest: ${path.relative(DIR, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
