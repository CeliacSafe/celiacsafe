import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrations = resolve(root, 'supabase/migrations');

function buildCdp(name, sql, append = false) {
  const b64 = Buffer.from(sql, 'utf8').toString('base64');
  const expression = append
    ? `(() => {
  const extra = atob(${JSON.stringify(b64)});
  const m = window.monaco?.editor?.getModels?.();
  if (!m?.length) return 'no monaco';
  m[0].setValue(m[0].getValue() + '\\n\\n' + extra);
  return 'append ' + m[0].getValue().length;
})()`
    : `(() => {
  const sql = atob(${JSON.stringify(b64)});
  const m = window.monaco?.editor?.getModels?.();
  if (!m?.length) return 'no monaco';
  m[0].setValue(sql);
  return 'ok ' + sql.length;
})()`;

  writeFileSync(
    resolve(root, `.tmp-cdp-${name}.json`),
    JSON.stringify({ method: 'Runtime.evaluate', params: { expression, returnByValue: true } }),
  );
  console.log(name, expression.length);
}

buildCdp('001', readFileSync(resolve(migrations, '001_initial_schema.sql'), 'utf8'));
buildCdp('002', readFileSync(resolve(migrations, '002_new_user_profile.sql'), 'utf8'), true);
