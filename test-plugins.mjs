// node test-plugins.mjs — runs every plugin's tests and reports regex overlaps between plugins.
import { readFileSync, readdirSync } from 'node:fs';
const here = new URL('./', import.meta.url);
const index = JSON.parse(readFileSync(new URL('index.json', here), 'utf8'));
const plugins = readdirSync(here).filter(f => /^plugin-.*\.json$/.test(f)).map(f => JSON.parse(readFileSync(new URL(f, here), 'utf8')));
let failed = 0;
const now = Date.parse('2026-11-24T12:00:00Z');
for (const p of plugins) {
  if (!index.some(e => e.id === p.id)) { console.log(`✗ ${p.id}: missing from index.json`); failed++; }
  const solve = new Function('return (' + p.solve + ')')();
  const re = p.regex ? new RegExp(p.regex, 'i') : null;
  for (const t of p.tests || []) {
    const r = await solve(t.q, { now, locale: 'en-US' });
    const ok = String(r && r.answer).toLowerCase().includes(String(t.expect).toLowerCase());
    if (!ok || (re && !re.test(t.q))) { failed++; console.log(`✗ ${p.id}: "${t.q}" → ${r && r.answer}`); }
  }
  for (const o of plugins) if (o !== p && re) for (const t of o.tests || []) if (re.test(t.q)) console.log(`! ${p.id} also matches a ${o.id} question: "${t.q}"`);
}
console.log(failed ? `${failed} failure(s)` : `All ${plugins.length} plugins pass`);
process.exit(failed ? 1 : 0);
