import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sql = readFileSync(resolve(root, 'supabase/apply_all.sql'));
const b64 = sql.toString('base64');
const expression = `(() => {
  const sql = atob(${JSON.stringify(b64)});
  const m = window.monaco?.editor?.getModels?.();
  if (!m?.length) return 'no monaco';
  m[0].setValue(sql);
  return 'ok ' + sql.length;
})()`;

writeFileSync(
  resolve(root, '.tmp-cdp-b64.json'),
  JSON.stringify({ method: 'Runtime.evaluate', params: { expression, returnByValue: true } }),
);
console.log('ready', expression.length);
