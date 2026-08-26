// One-off script to resize/re-encode the approved campaign photography into
// assets/brand/campaign/. Not part of the app runtime — run with:
//   node scripts/optimize-campaign-images.js
// Requires `sharp` (installed with --no-save; not a project dependency).
const sharp = require('sharp');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'Images');
const outDir = path.join(__dirname, '..', 'assets', 'brand', 'campaign');

const jobs = [
  { src: '1.png', out: 'home-hero.jpg' },
  { src: '2.png', out: 'glow-social.jpg' },
  { src: '3.png', out: 'preview-hero.jpg' },
  { src: '4.png', out: 'skin-detail.jpg' },
  { src: '5.png', out: 'paywall-story.jpg' },
  { src: '6.png', out: 'preview-visualization.jpg' },
  { src: '7.png', out: 'treatment-editorial.jpg' },
  { src: '8.png', out: 'botox-bestie.jpg' },
];

async function run() {
  for (const job of jobs) {
    const inputPath = path.join(sourceDir, job.src);
    const outputPath = path.join(outDir, job.out);
    const before = (await sharp(inputPath).metadata());

    await sharp(inputPath)
      .resize({ width: 900, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outputPath);

    const after = await sharp(outputPath).metadata();
    const fs = require('fs');
    const beforeSize = fs.statSync(inputPath).size;
    const afterSize = fs.statSync(outputPath).size;
    console.log(
      `${job.src} -> ${job.out}: ${before.width}x${before.height} (${(beforeSize / 1024).toFixed(0)}KB) -> ${after.width}x${after.height} (${(afterSize / 1024).toFixed(0)}KB)`,
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
