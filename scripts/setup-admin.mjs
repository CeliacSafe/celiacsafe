/**
 * Legt Admin-User an (falls nicht vorhanden) und setzt profiles.role = 'admin'.
 * node scripts/setup-admin.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

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

const ADMIN_EMAIL = process.env.CELIACSAFE_ADMIN_EMAIL ?? 'admin@celiacsafe.eu';

async function main() {
  loadEnv();
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen in .env');
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;

  let user = list.users.find((u) => u.email === ADMIN_EMAIL);
  let password = null;

  if (!user) {
    password = randomBytes(12).toString('base64url');
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log('Neuer Admin-User angelegt:', ADMIN_EMAIL);
  } else {
    console.log('Admin-User existiert bereits:', ADMIN_EMAIL);
  }

  const { error: profileErr } = await admin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);
  if (profileErr) throw profileErr;

  const credPath = resolve(ROOT, 'docs/ADMIN-LOGIN.local.txt');
  const lines = [
    `E-Mail: ${ADMIN_EMAIL}`,
    `User-ID: ${user.id}`,
    password ? `Passwort (einmalig, bitte ändern): ${password}` : 'Passwort: (bestehendes Konto — im Dashboard zurücksetzen falls nötig)',
    '',
    'Web-Admin: http://localhost:5173',
  ];
  writeFileSync(credPath, lines.join('\n'), 'utf8');
  console.log('Rolle admin gesetzt. Zugangsdaten:', credPath);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
