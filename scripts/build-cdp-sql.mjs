import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sql = readFileSync(resolve(root, 'supabase/apply_all.sql'), 'utf8');
const expression = `(() => {
  const sql = ${JSON.stringify(sql)};
  const models = window.monaco?.editor?.getModels?.();
  if (!models?.length) return 'no monaco';
  models[0].setValue(sql);
  return 'ok ' + sql.length;
})()`;

writeFileSync(
  resolve(root, '.tmp-cdp-expr.json'),
  JSON.stringify({ method: 'Runtime.evaluate', params: { expression, returnByValue: true } }),
);
console.log('ready', sql.length);
