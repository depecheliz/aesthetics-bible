// One-off script that renders The Aesthetics Bible's native icon/splash/
// favicon assets from the same brand tokens the app UI uses (see
// constants/theme.ts and components/brand/Monogram.tsx) — not part of the
// app runtime. Run with:
//   node scripts/generate-native-brand-assets.js
// Requires `@napi-rs/canvas` and `sharp` (installed with --no-save; not
// project dependencies). Source-of-truth vector files live in
// assets/brand/native/source/*.svg, generated next to this script's run.
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NATIVE_DIR = path.join(ROOT, 'assets', 'brand', 'native');
const SOURCE_DIR = path.join(NATIVE_DIR, 'source');
fs.mkdirSync(SOURCE_DIR, { recursive: true });

const BLACK = '#0B0B0C';
const CHAMPAGNE = '#C9A97E';
const IVORY = '#F6EFE6';
const WHITE = '#FFFFFF';

GlobalFonts.registerFromPath(
  path.join(ROOT, 'node_modules/@expo-google-fonts/playfair-display/600SemiBold/PlayfairDisplay_600SemiBold.ttf'),
  'Playfair Display SemiBold',
);
GlobalFonts.registerFromPath(
  path.join(ROOT, 'node_modules/@expo-google-fonts/montserrat/600SemiBold/Montserrat_600SemiBold.ttf'),
  'Montserrat SemiBold',
);

/** Fits "AB" (Playfair Display SemiBold) to a target pixel width by binary-searching font size. */
function fitMonogram(ctx, targetWidth) {
  let lo = 10;
  let hi = 4000;
  let best = lo;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = `${mid}px "Playfair Display SemiBold"`;
    const width = ctx.measureText('AB').width;
    if (width <= targetWidth) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

function drawMonogram(ctx, size, { x, y, color, targetWidth }) {
  const fontSize = fitMonogram(ctx, targetWidth);
  ctx.font = `${fontSize}px "Playfair Display SemiBold"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AB', x, y);
  return fontSize;
}

function newCanvas(size) {
  const canvas = createCanvas(size, size);
  return { canvas, ctx: canvas.getContext('2d') };
}

async function savePng(canvas, outPath, { flatten } = {}) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  let pipeline = sharp(canvas.toBuffer('image/png'));
  if (flatten) pipeline = pipeline.flatten({ background: BLACK });
  await pipeline.png().toFile(outPath);
  console.log('wrote', path.relative(ROOT, outPath));
}

async function main() {
  // 1. Master icon — full-bleed, no transparency (iOS requires opaque).
  //    "AB" sized generously (~46% of canvas width) with real breathing room.
  {
    const { canvas, ctx } = newCanvas(1024);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, 1024, 1024);
    drawMonogram(ctx, 1024, { x: 512, y: 540, color: CHAMPAGNE, targetWidth: 470 });
    await savePng(canvas, path.join(NATIVE_DIR, 'icon-master-1024.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'icon.png'), { flatten: true });
  }

  // 2. Android adaptive foreground — transparent background, "AB" sized to
  //    stay inside the ~66%-diameter guaranteed-visible safe zone across
  //    circle/rounded-square/squircle masks, with real margin to spare.
  {
    const { canvas, ctx } = newCanvas(1024);
    drawMonogram(ctx, 1024, { x: 512, y: 512, color: CHAMPAGNE, targetWidth: 340 });
    await savePng(canvas, path.join(NATIVE_DIR, 'android-adaptive-foreground-1024.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'android-icon-foreground.png'));
  }

  // 3. Android adaptive background — solid brand black, no content.
  {
    const { canvas, ctx } = newCanvas(1024);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, 1024, 1024);
    await savePng(canvas, path.join(NATIVE_DIR, 'android-adaptive-background-1024.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'android-icon-background.png'));
  }

  // 4. Android monochrome (Android 13+ themed icons) — single-color
  //    silhouette on transparent background; the OS applies its own tint.
  {
    const { canvas, ctx } = newCanvas(1024);
    drawMonogram(ctx, 1024, { x: 512, y: 512, color: WHITE, targetWidth: 340 });
    await savePng(canvas, path.join(NATIVE_DIR, 'android-monochrome-1024.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'android-icon-monochrome.png'));
  }

  // 5. Splash — transparent background (Expo composites over the
  //    configured backgroundColor). Centered "AB" monogram with a small,
  //    restrained wordmark beneath it, matching the exact eyebrow
  //    treatment already used on Home (Montserrat SemiBold, wide tracking,
  //    champagne).
  {
    const width = 1000;
    const height = 1150;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    drawMonogram(ctx, width, { x: width / 2, y: 460, color: CHAMPAGNE, targetWidth: 360 });

    ctx.font = '44px "Montserrat SemiBold"';
    ctx.fillStyle = CHAMPAGNE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = 'THE AESTHETICS BIBLE';
    // Manual letter-spacing (canvas has no native letter-spacing support).
    const spacing = 10;
    const charWidths = [...label].map((ch) => ctx.measureText(ch).width);
    const totalWidth = charWidths.reduce((a, b) => a + b, 0) + spacing * (label.length - 1);
    let cursorX = width / 2 - totalWidth / 2;
    ctx.textAlign = 'left';
    for (let i = 0; i < label.length; i++) {
      ctx.fillText(label[i], cursorX, 660);
      cursorX += charWidths[i] + spacing;
    }

    await savePng(canvas, path.join(NATIVE_DIR, 'splash-source.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'splash-icon.png'));
  }

  // 6. Web favicon — small sizes read better as bare "AB" with no
  //    wordmark; render at 256 and let sharp downscale for the .ico-style
  //    PNG favicon Expo's web output expects.
  {
    const { canvas, ctx } = newCanvas(256);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, 256, 256);
    drawMonogram(ctx, 256, { x: 128, y: 136, color: CHAMPAGNE, targetWidth: 120 });
    await savePng(canvas, path.join(NATIVE_DIR, 'favicon-master-256.png'));
    await savePng(canvas, path.join(ROOT, 'assets', 'favicon.png'), { flatten: true });
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
