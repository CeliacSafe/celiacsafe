/**
 * Laedt einmalig Platzhalter-Fotos pro venue_type (Pexels, freie Nutzung).
 * Ausgabe: assets/venue-types/<venue_type>.jpg
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'assets', 'venue-types');

const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;

/** Food-Fotos passend zur Restaurant-Art */
const VENUE_PHOTOS = {
  restaurant: pexels(262978),
  cafe: pexels(302899),
  bakery: pexels(1775043),
  pastry_shop: pexels(2915283),
  ice_cream: pexels(1352278),
  pizzeria: pexels(1146760),
  bar_tapas: pexels(1279330),
  fast_food: pexels(70497),
  hotel_restaurant: pexels(271743),
  food_truck: pexels(1633525),
  catering: pexels(696218),
  brunch_place: pexels(1099680),
  burger_joint: pexels(1633578),
  asian_restaurant: pexels(357756),
};

mkdirSync(outDir, { recursive: true });

async function saveJpeg(venueType, url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CeliacSafe-Asset-Script/1.0' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const jpg = await sharp(buffer).resize(1200, 800, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  writeFileSync(resolve(outDir, `${venueType}.jpg`), jpg);
}

for (const [venueType, url] of Object.entries(VENUE_PHOTOS)) {
  const target = resolve(outDir, `${venueType}.jpg`);
  try {
    await saveJpeg(venueType, url);
    console.log(`OK ${venueType}.jpg`);
  } catch (error) {
    console.warn(`WARN ${venueType}: ${error.message}`);
    const fallback = resolve(outDir, 'restaurant.jpg');
    if (existsSync(fallback)) {
      copyFileSync(fallback, target);
      console.log(`     → Fallback restaurant.jpg`);
    }
  }
}

const expected = Object.keys(VENUE_PHOTOS).length;
const found = Object.keys(VENUE_PHOTOS).filter((v) =>
  existsSync(resolve(outDir, `${v}.jpg`))
).length;
console.log(`\n${found}/${expected} Fotos in assets/venue-types/`);
if (found < expected) {
  process.exit(1);
}
