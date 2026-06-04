/**
 * Legt menu_url an (einmalig). Benötigt SUPABASE_DB_PASSWORD in .env
 * oder SUPABASE_DB_URL (Postgres-URI aus Supabase Dashboard).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
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
    return `postgresql://postgres.${m[1]}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
  }
  return null;
}

async function main() {
  loadEnv();
  const url = dbUrl();
  if (!url) {
    console.log('Führe im Supabase SQL Editor aus:');
    console.log(readFileSync(resolve(root, 'supabase/migrations/003_add_menu_url.sql'), 'utf8'));
    process.exit(1);
  }
  const pg = await import('pg');
  const client = new pg.default.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(
      readFileSync(resolve(root, 'supabase/migrations/003_add_menu_url.sql'), 'utf8'),
    );
    console.log('Spalte menu_url angelegt.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
