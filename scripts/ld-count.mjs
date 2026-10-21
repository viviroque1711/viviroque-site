// Conta tipos de JSON-LD de cada página gerada em dist/ (esperado: no máximo 1 de cada).
import fs from 'node:fs';
import path from 'node:path';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name === 'index.html' ? [path.join(d, e.name)] : []));
const dist = path.resolve(import.meta.dirname, '..', 'dist');
let bad = 0;
for (const f of walk(dist)) {
  const h = fs.readFileSync(f, 'utf8');
  const blocks = [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const types = {};
  const visit = (o) => { if (Array.isArray(o)) o.forEach(visit); else if (o && typeof o === 'object') { if (o['@type']) types[o['@type']] = (types[o['@type']] || 0) + 1; if (o['@graph']) visit(o['@graph']); } };
  blocks.forEach(visit);
  const rel = path.relative(dist, f).split(path.sep).join('/').replace(/index\.html$/, '') || '/';
  const flag = ['Organization', 'SoftwareApplication', 'FAQPage', 'Person'].some((t) => types[t] > 1) ? ' <-- DUPLICADO' : '';
  if (flag) bad++;
  console.log(rel.padEnd(42), 'blocos', blocks.length, JSON.stringify(types), flag);
}
process.exit(bad ? 1 : 0);
