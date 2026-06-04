/**
 * Erzeugt App-Icons aus assets/brand/*.svg (Glutenfrei-Symbol).
 * Einmalig: npm install && node scripts/generate-brand-assets.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = resolve(root, 'assets', 'brand');
const assets = resolve(root, 'assets');

async function renderSvg(svgPath, outPath, width, height = width) {
  const svg = readFileSync(svgPath);
  await sharp(svg).resize(width, height).png().toFile(outPath);
  console.log(`OK ${outPath} (${width}x${height})`);
}

const iconSvg = resolve(brand, 'gluten-free-icon.svg');
const fgSvg = resolve(brand, 'gluten-free-adaptive-fg.svg');
const splashSvg = resolve(brand, 'gluten-free-splash.svg');

await renderSvg(iconSvg, resolve(assets, 'icon.png'), 1024);
await renderSvg(fgSvg, resolve(assets, 'adaptive-icon-fg.png'), 1024);
await renderSvg(fgSvg, resolve(assets, 'android-icon-monochrome.png'), 1024);
await renderSvg(iconSvg, resolve(assets, 'favicon.png'), 48);
await renderSvg(splashSvg, resolve(assets, 'splash.png'), 1284, 2778);

console.log('\nBranding-Assets aktualisiert. Prüfung: .\\scripts\\validate-icon-assets.ps1');
