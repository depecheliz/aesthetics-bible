// Builds outputs/scoresheet.csv from outputs/manifest.jsonl — one row per
// generation, pre-filled with everything the harness captured, with empty
// columns for you to fill in while reviewing (see review page).
// Run after run-benchmark.js --confirm has produced a manifest.

const fs = require('fs');
const path = require('path');

const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const MANIFEST_PATH = path.join(OUTPUTS_DIR, 'manifest.jsonl');
const SCORESHEET_PATH = path.join(OUTPUTS_DIR, 'scoresheet.csv');

const SCORE_COLUMNS = [
  'identity_preservation_pass_fail',
  'prompt_adherence_1_5',
  'unintended_changes_1_5',
  'realism_1_5',
  'consistency_between_repeats_1_5',
  'human_acceptance_accept_reject',
  'notes',
];

const METADATA_COLUMNS = [
  'provider_id',
  'provider_label',
  'replicate_model',
  'source_image_id',
  'transformation_mode',
  'transformation_id',
  'transformation_label',
  'intensity',
  'repeat',
  'output_file',
  'latency_ms',
  'cost_usd',
  'cost_source',
  'success',
  'error_type',
  'timestamp',
];

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`No manifest found at ${path.relative(__dirname, MANIFEST_PATH)} — run run-benchmark.js --confirm first.`);
    process.exit(1);
  }

  const lines = fs.readFileSync(MANIFEST_PATH, 'utf8').split('\n').filter(Boolean);
  const records = lines.map((line) => JSON.parse(line));

  const header = [...METADATA_COLUMNS, ...SCORE_COLUMNS];
  const rows = [header.join(',')];

  for (const record of records) {
    const metadataValues = METADATA_COLUMNS.map((col) => csvEscape(record[col]));
    const blankScores = SCORE_COLUMNS.map(() => '');
    rows.push([...metadataValues, ...blankScores].join(','));
  }

  fs.writeFileSync(SCORESHEET_PATH, rows.join('\n') + '\n');
  console.log(`Wrote ${records.length} rows to ${path.relative(__dirname, SCORESHEET_PATH)}`);
  console.log('Fill in the score columns (identity_preservation_pass_fail, etc.) while reviewing, then run summarize-results.js.');
}

main();
