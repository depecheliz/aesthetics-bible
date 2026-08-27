// Reads the human-scored outputs/scoresheet.csv and prints a per-provider
// summary, including the required "effective cost per accepted result"
// metric. Identity preservation is a hard gate: a row only counts as
// accepted if identity_preservation_pass_fail = "pass" AND
// human_acceptance_accept_reject = "accept" — a cheaper model cannot win
// on cost if it fails identity.

const fs = require('fs');
const path = require('path');

const SCORESHEET_PATH = path.join(__dirname, 'outputs', 'scoresheet.csv');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = {};
    header.forEach((col, i) => (row[col] = values[i] ?? ''));
    return row;
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      values.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

function main() {
  if (!fs.existsSync(SCORESHEET_PATH)) {
    console.error(`No scoresheet found at ${path.relative(__dirname, SCORESHEET_PATH)} — run generate-scoresheet.js first.`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(SCORESHEET_PATH, 'utf8'));
  const byProvider = new Map();

  for (const row of rows) {
    const key = row.provider_id || 'unknown';
    if (!byProvider.has(key)) {
      byProvider.set(key, {
        label: row.provider_label,
        total: 0,
        succeeded: 0,
        identityPass: 0,
        accepted: 0,
        totalCost: 0,
        avgLatencyMs: [],
      });
    }
    const stats = byProvider.get(key);
    stats.total += 1;

    if (row.success === 'true') {
      stats.succeeded += 1;
      stats.totalCost += Number(row.cost_usd) || 0;
      if (row.latency_ms) stats.avgLatencyMs.push(Number(row.latency_ms));
    }

    const identityPass = row.identity_preservation_pass_fail?.trim().toLowerCase() === 'pass';
    const accepted = row.human_acceptance_accept_reject?.trim().toLowerCase() === 'accept';
    if (identityPass) stats.identityPass += 1;
    if (identityPass && accepted) stats.accepted += 1;
  }

  console.log('Provider summary (identity preservation is a hard gate for "accepted"):\n');
  for (const [id, s] of byProvider) {
    const avgLatency = s.avgLatencyMs.length ? Math.round(s.avgLatencyMs.reduce((a, b) => a + b, 0) / s.avgLatencyMs.length) : null;
    const effectiveCostPerAccepted = s.accepted > 0 ? s.totalCost / s.accepted : null;
    console.log(`${s.label} (${id})`);
    console.log(`  generations attempted:     ${s.total}`);
    console.log(`  generations succeeded:     ${s.succeeded}`);
    console.log(`  identity preservation pass: ${s.identityPass}/${s.succeeded || s.total}`);
    console.log(`  accepted (identity pass + human accept): ${s.accepted}`);
    console.log(`  total generation cost:     $${s.totalCost.toFixed(4)}`);
    console.log(
      `  effective cost per accepted result: ${effectiveCostPerAccepted !== null ? '$' + effectiveCostPerAccepted.toFixed(4) : 'N/A (0 accepted)'}`,
    );
    console.log(`  avg latency:               ${avgLatency !== null ? avgLatency + 'ms' : 'N/A'}`);
    console.log('');
  }
}

main();
