/**
 * Erzeugt App-Icons aus assets/brand/celiacsafe-logo.png
 * npm run assets:generate
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = resolve(root, 'assets', 'brand');
const assets = resolve(root, 'assets');

const SOURCE = resolve(brand, 'celiacsafe-logo.png');
const BRAND_BG = { r: 248, g: 247, b: 244, alpha: 1 };
const SPLASH_BG = { r: 18, g: 18, b: 18, alpha: 1 };
const ADAPTIVE_BG = '#2E7D32';

if (!existsSync(SOURCE)) {
  console.error('Fehlt: assets/brand/celiacsafe-logo.png');
  process.exit(1);
}

async function logoScaled(maxWidth) {
  return sharp(SOURCE).resize(maxWidth, null, { fit: 'inside' }).png().toBuffer();
}

async function writeCompositeCentered(buffer, canvasW, canvasH, bg, outPath) {
  const meta = await sharp(buffer).metadata();
  const left = Math.round((canvasW - (meta.width ?? 0)) / 2);
  const top = Math.round((canvasH - (meta.height ?? 0)) / 2);
  await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: bg },
  })
    .composite([{ input: buffer, left: Math.max(0, left), top: Math.max(0, top) }])
    .png()
    .toFile(outPath);
}

/** Nur das Markenzeichen (Schild + Pin) für Adaptive Icon */
async function iconMarkBuffer(size) {
  const meta = await sharp(SOURCE).metadata();
  const cropW = Math.round((meta.width ?? 1) * 0.44);
  return sharp(SOURCE)
    .extract({ left: 0, top: 0, width: cropW, height: meta.height ?? 1 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

const logoFull = await logoScaled(920);
await writeCompositeCentered(logoFull, 1024, 1024, BRAND_BG, resolve(assets, 'icon.png'));
console.log('OK icon.png (1024x1024)');

const mark = await iconMarkBuffer(660);
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: mark, gravity: 'center' }])
  .png()
  .toFile(resolve(assets, 'adaptive-icon-fg.png'));
console.log('OK adaptive-icon-fg.png');

await sharp(mark)
  .grayscale()
  .linear(1.2, -40)
  .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile(resolve(assets, 'android-icon-monochrome.png'));
console.log('OK android-icon-monochrome.png');

const logoSplash = await logoScaled(720);
await writeCompositeCentered(logoSplash, 1284, 2778, SPLASH_BG, resolve(assets, 'splash.png'));
console.log('OK splash.png (1284x2778)');

const logoFav = await logoScaled(40);
await writeCompositeCentered(logoFav, 48, 48, BRAND_BG, resolve(assets, 'favicon.png'));
console.log('OK favicon.png');

console.log('\nBranding aus celiacsafe-logo.png erzeugt.');
