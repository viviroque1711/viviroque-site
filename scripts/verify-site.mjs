// Verifica o site servido (local, endereço de teste ou produção) olhando o HTML RECEBIDO, sem executar JavaScript:
// é o que Googlebot e robôs de IA leem primeiro. Uso:
//   node scripts/verify-site.mjs <url-base> [prefixo]
//   ex.: node scripts/verify-site.mjs http://127.0.0.1:4321  |  node scripts/verify-site.mjs https://viviroque1711.github.io viviroque-site
// Confere por página: status 200, <title>, descrição, 1 <h1> com o texto esperado, canonical, robots, JSON-LD válido e sem
// duplicados, FAQPage = perguntas visíveis, links internos <a href> que respondem, imagens que existem, nenhuma referência a
// CDN antigo. Confere também robots.txt (robôs de IA liberados), sitemap, llms.txt, 404 real e as URLs antigas.
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../src/data/site.mjs';
import { BOTS } from './bots.mjs';

const root = path.resolve(import.meta.dirname, '..');
const base = process.argv[2].replace(/\/$/, '');
const prefix = process.argv[3] ? '/' + process.argv[3].replace(/^\/|\/$/g, '') : '';
const staging = !!prefix;
const lines = (f) => (fs.existsSync(path.join(root, 'scripts', f)) ? fs.readFileSync(path.join(root, 'scripts', f), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean) : []);
const urls = lines('urls.txt');
const oldUrls = lines('old-urls.txt');
const phrases = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'verify-phrases.json'), 'utf8'));
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textOf = (h) => dec(h.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
const flat = (s) => s.replace(/\s+/g, '');
const get = async (p, opt) => fetch(base + (p.startsWith('/') ? prefix + p : p), opt);

const rows = [];
let fail = 0;
const add = (name, ok, detail = '') => { rows.push({ name, ok, detail }); if (!ok) fail++; };
const linkCache = new Map();
const linkOk = async (href) => {
  if (!linkCache.has(href)) linkCache.set(href, (async () => { const r = await get(href); const h = r.status === 200 ? await r.text() : ''; return r.status === 200 && (!/http-equiv="refresh"/.test(h) || /url=/.test(h)); })());
  return linkCache.get(href);
};

for (const u of urls) {
  const res = await get(u);
  const html = await res.text();
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const h1n = (html.match(/<h1[\s>]/g) || []).length;
  const txt = textOf(html);
  const phOk = (phrases[u] || []).length > 0 && phrases[u].every((p) => flat(txt).includes(flat(dec(p))));
  const words = txt.split(' ').length;
  // JSON-LD
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  let ldOk = ld.length > 0; const types = {}; const faqLd = [];
  const visit = (o) => { if (Array.isArray(o)) o.forEach(visit); else if (o && typeof o === 'object') { if (o['@type']) { const t = Array.isArray(o['@type']) ? o['@type'][0] : o['@type']; types[t] = (types[t] || 0) + 1; if (t === 'FAQPage') faqLd.push(...(o.mainEntity || [])); } if (o['@graph']) visit(o['@graph']); } };
  for (const m of ld) { try { visit(JSON.parse(m[1])); } catch { ldOk = false; } }
  const dup = ['Organization', 'SoftwareApplication', 'FAQPage', 'Person'].some((t) => types[t] > 1);
  const noRating = !/"(aggregateRating|Review|offers)"/.test(ld.map((m) => m[1]).join(''));
  const qs = (html.match(/class="faq-q"/g) || []).length;
  const faqOk = qs === faqLd.length && faqLd.every((q) => flat(txt).includes(flat(dec(q.acceptedAnswer.text))));
  // imagens e links
  const imgs = [...new Set([...html.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((x) => x.trim().split(/\s+/)[0])).filter((x) => x.startsWith('/') && !x.startsWith('//')))];
  let broken = 0;
  await Promise.all(imgs.map(async (i) => { const r = await get(i, { method: 'HEAD' }); if (!r.ok) broken++; }));
  const links = [...new Set([...html.matchAll(/<a [^>]*href="(\/[^"#?]*)[^"]*"/g)].map((m) => m[1]).filter((x) => !x.startsWith('//')))].map((x) => (prefix && x.startsWith(prefix + '/') ? x.slice(prefix.length) : x));
  const badLinks = [];
  await Promise.all(links.map(async (l) => { if (!/\.(png|jpe?g|webp|ico|svg|xml|txt|css|js)$/.test(l) && !(await linkOk(l))) badLinks.push(l); }));
  const remote = (html.match(/horizons-cdn\.hostinger|hostingerapp|fonts\.googleapis|fonts\.gstatic/g) || []).length;
  const wantCanon = SITE.url + u;
  const robotsOk = staging ? /noindex/.test(robots) : /index/.test(robots) && !/noindex/.test(robots);
  const ok = res.status === 200 && title && desc && desc.length <= 160 && h1n === 1 && phOk && canon === wantCanon && robotsOk && ldOk && !dup && noRating && faqOk && broken === 0 && !badLinks.length && !remote && words > 100;
  add(`página ${u}`, ok, `${res.status} | "${title.slice(0, 48)}" | h1 ${h1n} | frase ${phOk ? 'ok' : 'FALTA'} | canon ${canon === wantCanon ? 'ok' : 'ERRO ' + canon} | robots ${robotsOk ? 'ok' : 'ERRO ' + robots} | ld ${ldOk && !dup && noRating ? 'ok' : 'ERRO'} (${Object.entries(types).map(([k, v]) => k + v).join(',')}) | faq ${qs}/${faqLd.length} ${faqOk ? 'ok' : 'ERRO'} | imgs ${imgs.length} (${broken} quebradas) | links ${links.length} (${badLinks.length} ruins${badLinks.length ? ': ' + badLinks.join(',') : ''}) | remotos ${remote} | ${words} palavras`);
}

// robots.txt: todos os robôs de busca e de IA com permissão explícita
{
  const r = await get('/robots.txt'); const t = await r.text();
  const miss = BOTS.filter((b) => !new RegExp(`User-agent: ${b}\\s+Allow: /`, 'i').test(t));
  add('robots.txt: robôs de busca e de IA liberados', r.status === 200 && !miss.length && !/Disallow: \//.test(t.replace(/Disallow:\s*\n/g, '')) && (staging || t.includes(`Sitemap: ${SITE.url}/sitemap.xml`)), miss.length ? 'faltam: ' + miss.join(', ') : `${BOTS.length} robôs${staging ? '' : ' + Sitemap'}`);
}
// sitemap: todas as páginas, com lastmod real
{
  const r = await get('/sitemap.xml'); const t = await r.text();
  const locs = [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lms = [...t.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  add('sitemap.xml: todas as páginas com lastmod', r.status === 200 && urls.every((u) => locs.includes(SITE.url + u)) && locs.length === lms.length && lms.every((d) => /^\d{4}-\d\d-\d\d$/.test(d)), `${locs.length} URLs`);
}
{
  const r = await get('/llms.txt'); const t = await r.text();
  add('llms.txt', r.status === 200 && /^# /.test(t) && urls.every((u) => t.includes(SITE.url + u)), `${t.split('\n').length} linhas`);
}
// URLs antigas nunca dão 404
for (const o of oldUrls) {
  const withSlash = o.endsWith('/') ? o : o + '/';
  const r = await get(withSlash); const h = r.status === 200 ? await r.text() : '';
  const meta = (h.match(/url=([^"]+)"/) || [])[1];
  let ok = r.status === 200;
  // destino de outro domínio (ex.: aurorapremium.com): confere só que a página de redirecionamento aponta para ele
  if (ok && meta && !meta.startsWith('http')) { const t = await get(meta); ok = t.status === 200; }
  add(`URL antiga ${o}`, ok, `${r.status}${meta ? ' → ' + meta : ''}`);
}
{
  const r = await get('/nao-existe-xyz/');
  add('404 real em endereço inexistente', r.status === 404, String(r.status));
}
for (const r of rows) console.log(`${r.ok ? 'OK    ' : 'FALHA '}${r.name}  ${r.detail}`);
console.log(`\n${rows.length - fail}/${rows.length} OK`);
process.exit(fail ? 1 : 0);
