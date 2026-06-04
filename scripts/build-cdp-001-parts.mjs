import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sql = readFileSync(resolve(root, 'supabase/migrations/001_initial_schema.sql'), 'utf8');

// Split at blank lines near 3000-char boundaries
const chunks = [];
let rest = sql;
while (rest.length > 3200) {
  let cut = rest.lastIndexOf('\n\n', 3200);
  if (cut < 1000) cut = 3200;
  chunks.push(rest.slice(0, cut));
  rest = rest.slice(cut);
}
if (rest.trim()) chunks.push(rest);

chunks.forEach((chunk, i) => {
  const b64 = Buffer.from(chunk, 'utf8').toString('base64');
  const expression =
    i === 0
      ? `(() => {
  window.__celiacSql = atob(${JSON.stringify(b64)});
  const m = window.monaco?.editor?.getModels?.();
  if (!m?.length) return 'no monaco';
  m[0].setValue(window.__celiacSql);
  return 'part1 ' + window.__celiacSql.length;
})()`
      : `(() => {
  window.__celiacSql = (window.__celiacSql || '') + atob(${JSON.stringify(b64)});
  const m = window.monaco?.editor?.getModels?.();
  if (!m?.length) return 'no monaco';
  m[0].setValue(window.__celiacSql);
  return 'part${i + 1} ' + window.__celiacSql.length;
})()`;

  writeFileSync(
    resolve(root, `.tmp-cdp-001-part${i + 1}.json`),
    JSON.stringify({ method: 'Runtime.evaluate', params: { expression, returnByValue: true } }),
  );
  console.log(`part${i + 1}`, expression.length, 'sql', chunk.length);
});
