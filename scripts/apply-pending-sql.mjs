/**
 * Wendet supabase/pending_maps_and_menu.sql an.
 * Benötigt SUPABASE_DB_PASSWORD oder SUPABASE_DB_URL in .env
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
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

function dbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const m = (process.env.SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && m) {
    const ref = m[1];
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
  }
  return null;
}

async function main() {
  loadEnv();
  const url = dbUrl();
  if (!url) {
    console.error('SUPABASE_DB_PASSWORD fehlt in .env');
    console.error('Alternative: supabase/pending_maps_and_menu.sql im SQL Editor ausführen');
    process.exit(1);
  }

  const sql = readFileSync(resolve(ROOT, 'supabase/pending_maps_and_menu.sql'), 'utf8');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('SQL erfolgreich angewendet (menu_url, google_maps_url, apple_maps_url).');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
