/**
 * Löscht Legacy-Restaurants (alte es_*-IDs) dauerhaft aus Supabase.
 * delivery_links / reservation_links werden per FK CASCADE mit entfernt.
 *
 * node scripts/delete-legacy-restaurants.mjs [--dry-run]
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

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadEnv();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen');
    process.exit(1);
  }

  const client = createClient(url, key);
  const { data, error } = await client
    .from('restaurants')
    .select('id')
    .like('id', 'es\\_%');

  if (error) throw error;

  const ids = (data ?? []).map((r) => r.id);
  console.log(`Legacy-Restaurants (es_*): ${ids.length}`);

  if (ids.length === 0) {
    console.log('Nichts zu löschen.');
    return;
  }

  if (dryRun) {
    console.log('Dry-run — keine Löschung.');
    console.log('Beispiel-IDs:', ids.slice(0, 5).join(', '));
    return;
  }

  // Vorschläge mit Legacy-Bezug entkoppeln (FK ohne CASCADE)
  const { error: subErr } = await client
    .from('submissions')
    .update({ promoted_to_restaurant_id: null })
    .in('promoted_to_restaurant_id', ids);
  if (subErr) {
    console.warn('submissions-Update:', subErr.message);
  }

  const { error: delErr, count } = await client
    .from('restaurants')
    .delete({ count: 'exact' })
    .like('id', 'es\\_%');

  if (delErr) throw delErr;

  console.log(`Gelöscht: ${count ?? ids.length} Legacy-Restaurants.`);

  const { count: remaining } = await client
    .from('restaurants')
    .select('id', { count: 'exact', head: true });
  console.log(`Verbleibend in Supabase: ${remaining ?? '?'}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
