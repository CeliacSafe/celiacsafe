/**
 * Führt supabase/migrations/*.sql aus.
 *
 * Benötigt in .env (eine Option):
 *   SUPABASE_DB_PASSWORD=...     (Dashboard → Settings → Database)
 *   SUPABASE_DB_URL=postgresql://...
 *   SUPABASE_ACCESS_TOKEN=...    (Dashboard → Account → Access Tokens)
 *
 * Optionen:
 *   --from=005   Nur Migrationen ab 005 (für bestehende DB)
 *   --dry-run    Nur anzeigen, nicht ausführen
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
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

function projectRef() {
  const m = (process.env.SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

function dbUrls() {
  if (process.env.SUPABASE_DB_URL) {
    return [process.env.SUPABASE_DB_URL];
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = projectRef();
  if (!password || !ref) {
    return [];
  }

  const encoded = encodeURIComponent(password);
  return [
    `postgresql://postgres.${ref}:${encoded}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  ];
}

async function runViaManagementApi(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message ?? body.error ?? res.statusText;
    throw new Error(`Management API: ${msg}`);
  }
  return body;
}

async function connectPg() {
  const urls = dbUrls();
  let lastError;

  for (const url of urls) {
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

async function ensureMigrationTable(client) {
  await client.query(`
    create table if not exists public._celiacsafe_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function isApplied(client, id) {
  const { rows } = await client.query(
    'select 1 from public._celiacsafe_migrations where id = $1',
    [id]
  );
  return rows.length > 0;
}

async function markApplied(client, id) {
  await client.query(
    'insert into public._celiacsafe_migrations (id) values ($1) on conflict do nothing',
    [id]
  );
}

function parseArgs() {
  const fromArg = process.argv.find((a) => a.startsWith('--from='));
  return {
    from: fromArg ? fromArg.split('=')[1] : null,
    dryRun: process.argv.includes('--dry-run'),
  };
}

async function applyFile(client, file, sql) {
  // 005 (enum value) muss isoliert laufen — nicht in einer Transaktion mit anderen DDL
  if (file === '005_add_viewer_role.sql') {
    await client.query(sql);
    return;
  }

  await client.query(sql);
}

async function main() {
  loadEnv();
  const { from, dryRun } = parseArgs();

  const dir = resolve(ROOT, 'supabase/migrations');
  let files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (from) {
    files = files.filter((f) => f >= `${from}_`);
  }

  if (files.length === 0) {
    console.log('Keine Migrationen zu applyen.');
    return;
  }

  if (dryRun) {
    console.log('Dry-run — würde anwenden:');
    for (const file of files) {
      console.log(`  ${file}`);
    }
    return;
  }

  const ref = projectRef();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const hasPg = dbUrls().length > 0;

  if (!hasPg && !(ref && accessToken)) {
    console.error('Fehlt in .env: SUPABASE_DB_PASSWORD oder SUPABASE_DB_URL');
    console.error('Alternativ: SUPABASE_ACCESS_TOKEN (Account → Access Tokens)');
    console.error('Oder: supabase/pending_security_hardening.sql im SQL Editor ausführen');
    process.exit(1);
  }

  if (hasPg) {
    const client = await connectPg();
    try {
      await ensureMigrationTable(client);

      for (const file of files) {
        if (await isApplied(client, file)) {
          console.log(`⏭ ${file} (bereits angewendet)`);
          continue;
        }

        const sql = readFileSync(resolve(dir, file), 'utf8');
        console.log(`→ ${file}`);
        await applyFile(client, file, sql);
        await markApplied(client, file);
      }

      console.log('Migrationen erfolgreich (Postgres).');
    } finally {
      await client.end();
    }
    return;
  }

  // Management API (kein Migrations-Tracking — idempotent via IF NOT EXISTS / CREATE OR REPLACE)
  for (const file of files) {
    const sql = readFileSync(resolve(dir, file), 'utf8');
    console.log(`→ ${file} (Management API)`);
    await runViaManagementApi(ref, accessToken, sql);
  }
  console.log('Migrationen erfolgreich (Management API).');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
