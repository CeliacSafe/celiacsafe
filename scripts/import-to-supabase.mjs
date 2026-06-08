/**
 * JSON → Supabase (service role / secret key)
 * node scripts/import-to-supabase.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

function restaurantRow(r, { includeMapsUrls = true } = {}) {
  const row = {
    id: r.id,
    name: r.name,
    country_code: r.country_code ?? 'ES',
    region_code: r.region_code,
    region_name: r.region_name,
    city: r.city,
    verification_status: r.verification_status ?? 'to_be_verified',
    is_published: r.is_published ?? true,
    is_hidden: r.is_hidden ?? false,
  };
  let optional = [
    'slug', 'province', 'district', 'postal_code', 'address_street',
    'latitude', 'longitude', 'venue_type', 'price_range',
    'last_verified_at', 'national_authority', 'phone', 'whatsapp',
    'email', 'website', 'menu_url', 'google_maps_url', 'apple_maps_url',
    'instagram', 'facebook', 'opening_hours',
    'seasonal_closure', 'description_es', 'description_en', 'description_de',
    'featured_image_url',
  ];
  if (!includeMapsUrls) {
    optional = optional.filter((k) => k !== 'google_maps_url' && k !== 'apple_maps_url');
  }
  for (const key of optional) {
    if (r[key] != null && r[key] !== '') row[key] = r[key];
  }
  for (const key of ['cuisine_types', 'meal_types', 'verification_methods']) {
    if (r[key]?.length) row[key] = r[key];
  }
  for (const key of ['face_program', 'aoecs_certified', 'is_premium_partner']) {
    if (r[key] != null) row[key] = r[key];
  }
  return row;
}

async function upsertLinks(client, restaurantId, links, table) {
  for (const link of links ?? []) {
    if (!link.platform) continue;
    const { error } = await client.from(table).upsert(
      {
        restaurant_id: restaurantId,
        platform: link.platform,
        url: link.url ?? '',
        is_active: link.is_active ?? true,
      },
      { onConflict: 'restaurant_id,platform' },
    );
    if (error) throw new Error(`${table} ${restaurantId}/${link.platform}: ${error.message}`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadEnv();

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const jsonPath = resolve(ROOT, 'src/data/restaurants.json');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const restaurants = payload.restaurants ?? [];
  console.log(`Lade ${restaurants.length} Restaurants aus restaurants.json`);

  if (dryRun) {
    console.log('Dry-run — keine Schreiboperationen.');
    return;
  }

  const client = createClient(url, key);

  let includeMapsUrls = true;
  const { error: schemaProbe } = await client
    .from('restaurants')
    .select('google_maps_url,apple_maps_url')
    .limit(0);
  if (schemaProbe) {
    includeMapsUrls = false;
    console.warn(
      'Hinweis: google_maps_url/apple_maps_url fehlen in Supabase — Import ohne Maps-URLs.',
    );
    console.warn('Bitte supabase/pending_maps_and_menu.sql ausführen, dann erneut importieren.');
  }

  for (const item of restaurants) {
    const rid = item.id;
    const { error: rErr } = await client
      .from('restaurants')
      .upsert(restaurantRow(item, { includeMapsUrls }), { onConflict: 'id' });
    if (rErr) throw new Error(`restaurants ${rid}: ${rErr.message}`);

    await upsertLinks(client, rid, item.delivery_links, 'delivery_links');
    await upsertLinks(client, rid, item.reservation_links, 'reservation_links');
  }

  console.log(`Fertig: ${restaurants.length} Restaurants in Supabase.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
