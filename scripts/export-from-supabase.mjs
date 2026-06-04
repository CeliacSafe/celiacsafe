/**
 * Supabase → src/data/restaurants.json
 * node scripts/export-from-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'src/data/restaurants.json');

const EXPORT_FIELDS = [
  'id', 'name', 'slug', 'country_code', 'region_code', 'region_name',
  'province', 'city', 'district', 'postal_code', 'address_street',
  'latitude', 'longitude', 'venue_type', 'cuisine_types', 'price_range',
  'meal_types', 'verification_status', 'verification_methods',
  'last_verified_at', 'face_program', 'aoecs_certified', 'national_authority',
  'phone', 'whatsapp', 'email', 'website', 'menu_url', 'instagram', 'facebook',
  'opening_hours', 'seasonal_closure', 'description_es', 'description_en',
  'description_de', 'featured_image_url',
];

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

function slim(row, delivery, reservation) {
  const out = {};
  for (const k of EXPORT_FIELDS) {
    const v = row[k];
    if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) out[k] = v;
  }
  if (delivery?.length) out.delivery_links = delivery;
  if (reservation?.length) out.reservation_links = reservation;
  return out;
}

async function main() {
  loadEnv();
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen');
    process.exit(1);
  }

  const client = createClient(url, key);
  const { data: rows, error } = await client
    .from('restaurants')
    .select('*')
    .eq('is_published', true)
    .eq('is_hidden', false);
  if (error) throw error;

  const restaurants = [];
  for (const row of rows ?? []) {
    const rid = row.id;
    const { data: d } = await client
      .from('delivery_links')
      .select('platform,url,is_active')
      .eq('restaurant_id', rid);
    const { data: r } = await client
      .from('reservation_links')
      .select('platform,url,is_active')
      .eq('restaurant_id', rid);
    restaurants.push(slim(row, d ?? [], r ?? []));
  }

  const payload = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    count: restaurants.length,
    restaurants,
  };
  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Exportiert: ${restaurants.length} Restaurants → ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
