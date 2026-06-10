/**
 * Lists public tables and RLS status on the linked Supabase project.
 * node scripts/check-rls-status.mjs
 */
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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

function dbUrls() {
  if (process.env.SUPABASE_DB_URL) return [process.env.SUPABASE_DB_URL];
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = (process.env.SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!password || !ref) return [];
  const encoded = encodeURIComponent(password);
  return [
    `postgresql://postgres.${ref}:${encoded}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  ];
}

async function connectPg() {
  let lastError;
  for (const url of dbUrls()) {
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);
    }
  }
  throw lastError ?? new Error('Keine DB-Verbindung möglich');
}

async function main() {
  loadEnv();
  const client = await connectPg();
  try {
    const { rows } = await client.query(`
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by c.relname
    `);
    console.log('Public tables:');
    for (const row of rows) {
      console.log(`${row.rls_enabled ? 'OK ' : 'NO '} ${row.table_name}`);
    }

    const { rows: policies } = await client.query(`
      select tablename, count(*)::int as policies
      from pg_policies
      where schemaname = 'public'
      group by tablename
      order by tablename
    `);
    console.log('\nPolicies:');
    for (const row of policies) {
      console.log(`  ${row.tablename}: ${row.policies}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
