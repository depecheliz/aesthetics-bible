// Builds a single self-contained, purely local HTML page
// (outputs/review.html) grouping every generation by
// source -> transformation -> provider, for side-by-side review.
// References images via relative file paths only — open it directly in a
// browser (file://...); nothing here is uploaded anywhere.

const fs = require('fs');
const path = require('path');
const { transformations } = require('./transformations');
const { providers } = require('./providers');

const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const INPUTS_DIR = path.join(__dirname, 'inputs');
const MANIFEST_PATH = path.join(OUTPUTS_DIR, 'manifest.jsonl');
const REVIEW_PATH = path.join(OUTPUTS_DIR, 'review.html');

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`No manifest found at ${path.relative(__dirname, MANIFEST_PATH)} — run run-benchmark.js --confirm first.`);
    process.exit(1);
  }

  const lines = fs.readFileSync(MANIFEST_PATH, 'utf8').split('\n').filter(Boolean);
  const records = lines.map((line) => JSON.parse(line));
  const sourceIds = [...new Set(records.map((r) => r.source_image_id))].sort();
  const inputFiles = fs.existsSync(INPUTS_DIR) ? fs.readdirSync(INPUTS_DIR) : [];

  const sections = [];
  for (const sourceId of sourceIds) {
    const sourceInputFile = inputFiles.find((f) => path.basename(f, path.extname(f)) === sourceId);
    sections.push(`<h2>Source: ${esc(sourceId)}</h2>`);
    if (sourceInputFile) {
      sections.push(`<img class="source-thumb" src="../inputs/${esc(sourceInputFile)}" alt="source ${esc(sourceId)}" />`);
    }

    for (const transformation of transformations) {
      const rowLabel = `[${transformation.mode}] ${transformation.label}${transformation.intensity ? ` (${transformation.intensity})` : ''}`;
      sections.push(`<h3>${esc(rowLabel)}</h3>`);
      sections.push('<div class="provider-row">');
      for (const provider of providers) {
        const cells = records.filter(
          (r) => r.source_image_id === sourceId && r.transformation_mode === transformation.mode && r.transformation_id === transformation.id && r.provider_id === provider.id,
        );
        sections.push('<div class="provider-col">');
        sections.push(`<div class="provider-label">${esc(provider.label)}</div>`);
        for (const cell of cells) {
          if (cell.success && cell.output_file) {
            sections.push(
              `<div class="cell"><img src="${esc(cell.output_file)}" alt="repeat ${cell.repeat}" />` +
                `<div class="meta">repeat ${cell.repeat} · ${cell.latency_ms}ms · $${Number(cell.cost_usd).toFixed(4)}</div></div>`,
            );
          } else {
            sections.push(`<div class="cell failed"><div class="meta">repeat ${cell.repeat} · FAILED: ${esc(cell.error_type)}</div></div>`);
          }
        }
        sections.push('</div>');
      }
      sections.push('</div>');
    }
  }

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Image provider benchmark review</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #111; color: #eee; padding: 24px; }
  h2 { border-top: 2px solid #444; padding-top: 24px; margin-top: 32px; }
  h3 { color: #ccc; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
  .source-thumb { max-width: 160px; border-radius: 4px; margin-bottom: 12px; }
  .provider-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .provider-col { background: #1a1a1a; padding: 12px; border-radius: 6px; }
  .provider-label { font-weight: 600; margin-bottom: 8px; font-size: 13px; }
  .cell { display: inline-block; margin-right: 8px; vertical-align: top; }
  .cell img { max-width: 200px; border-radius: 4px; display: block; }
  .cell.failed { width: 200px; padding: 12px; background: #331111; border-radius: 4px; }
  .meta { font-size: 11px; color: #999; margin-top: 4px; }
</style>
</head>
<body>
<h1>Image provider benchmark — review</h1>
<p>Generated locally from outputs/manifest.jsonl. Not uploaded anywhere.</p>
${sections.join('\n')}
</body>
</html>`;

  fs.writeFileSync(REVIEW_PATH, html);
  console.log(`Wrote ${path.relative(__dirname, REVIEW_PATH)} — open it directly in a browser to review.`);
}

main();
