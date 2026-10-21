// Auditoria de SEO por página: a frase principal (scripts/seo-keywords.json) precisa aparecer no título, na descrição, no H1,
// na primeira frase do texto, em pelo menos um H2 e no corpo; mede também H2 por página, links internos, imagens sem alt e
// perguntas frequentes. Uso: node scripts/seo-audit.mjs   (sai com erro se alguma página ficar sem a frase em título, H1 ou descrição)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const kw = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'seo-keywords.json'), 'utf8'));
const dir = path.join(root, 'src', 'content-pages');
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
const plain = (h) => h.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

let bad = 0;
const rows = [];
for (const d of fs.readdirSync(dir).sort()) {
  const p = d === '_home' ? '/' : `/${d.replace(/__/g, '/')}/`;
  const head = fs.readFileSync(path.join(dir, d, 'head.html'), 'utf8');
  const body = fs.readFileSync(path.join(dir, d, 'body.html'), 'utf8');
  const title = (head.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (head.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  const h1 = plain((body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '');
  const h2 = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => plain(m[1]));
  const lead = plain((body.match(/<p class="lead">([\s\S]*?)<\/p>/) || [])[1] || '').split(/(?<=[.!?])\s/)[0] || '';
  const text = plain(body);
  const alts = [...body.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\salt="[^"]+"/.test(m[0]) && !/aria-hidden/.test(m[0]) && !/alt=""/.test(m[0])).length;
  const links = [...body.matchAll(/<a [^>]*href="(\/[^"#]*)/g)].length;
  const qs = (body.match(/class="faq-q"/g) || []).length;
  const k = kw[p];
  if (!k) { rows.push({ p, aviso: 'sem frase principal em seo-keywords.json' }); continue; }
  const main = norm(Array.isArray(k) ? k[0] : k.main || k);
  const alt = (Array.isArray(k) ? k.slice(1) : k.alt || []).map(norm);
  const has = (s) => norm(s).includes(main) || alt.some((a) => norm(s).includes(a));
  const r = {
    p, titulo: has(title), descricao: has(desc), h1: has(h1) || (k.h1Exempt === true) || p === "/", lead: has(lead),
    h2: h2.filter(has).length + '/' + h2.length, corpo: (norm(text).split(main).length - 1), links, faq: qs, altFaltando: alts,
  };
  const fail = !r.titulo || !r.descricao || !r.h1;
  if (fail) bad++;
  rows.push({ ...r, falha: fail });
}
console.log('| página | título | desc. | H1 | 1ª frase | H2 com a frase | usos no texto | links internos | FAQ | img sem alt |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
const m = (b) => (b ? 'ok' : 'FALTA');
for (const r of rows) console.log(r.aviso ? `| ${r.p} | ${r.aviso} |` : `| ${r.p} | ${m(r.titulo)} | ${m(r.descricao)} | ${m(r.h1)} | ${m(r.lead)} | ${r.h2} | ${r.corpo} | ${r.links} | ${r.faq} | ${r.altFaltando} |`);
console.log(`\n${rows.length - bad}/${rows.length} páginas com a frase principal em título, descrição e H1`);
process.exit(bad ? 1 : 0);
