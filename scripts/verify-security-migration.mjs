/**
 * Prüft ob Security-Migrationen (005–008) aktiv sind.
 * node scripts/verify-security-migration.mjs
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

function dbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const m = (process.env.SUPABASE_URL ?? '').match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && m) {
    const ref = m[1];
    const encoded = encodeURIComponent(password);
    return `postgresql://postgres.${ref}:${encoded}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres`;
  }
  return null;
}

const CHECKS = [
  {
    name: 'viewer-Rolle im Enum',
    sql: `select exists (
      select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'app_role' and e.enumlabel = 'viewer'
    ) as ok`,
  },
  {
    name: 'is_staff() Funktion',
    sql: `select exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'is_staff'
    ) as ok`,
  },
  {
    name: 'Rate-Limit-Trigger',
    sql: `select exists (
      select 1 from pg_trigger where tgname = 'submissions_rate_limit'
    ) as ok`,
  },
  {
    name: 'Audit-Trigger restaurants',
    sql: `select exists (
      select 1 from pg_trigger where tgname = 'restaurants_audit'
    ) as ok`,
  },
  {
    name: 'Staff von Rate-Limit ausgenommen',
    sql: `select pg_get_functiondef(p.oid) like '%is_staff()%' as ok
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'enforce_submission_rate_limit'`,
  },
];

async function main() {
  loadEnv();
  const url = dbUrl();
  if (!url) {
    console.error('SUPABASE_DB_PASSWORD fehlt — Verifikation nicht möglich.');
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  let failed = 0;
  try {
    for (const check of CHECKS) {
      const { rows } = await client.query(check.sql);
      const ok = rows[0]?.ok === true || rows[0]?.ok === 't';
      console.log(`${ok ? '✓' : '✗'} ${check.name}`);
      if (!ok) failed += 1;
    }

    const { rows: applied } = await client.query(
      `select id from public._celiacsafe_migrations where id like '00%' order by id`
    ).catch(() => ({ rows: [] }));

    if (applied.length > 0) {
      console.log('\nAngewendet laut Tracking:');
      for (const row of applied) {
        console.log(`  ${row.id}`);
      }
    }
  } finally {
    await client.end();
  }

  if (failed > 0) {
    console.error(`\n${failed} Prüfung(en) fehlgeschlagen.`);
    process.exit(1);
  }
  console.log('\nSecurity-Migrationen verifiziert.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
