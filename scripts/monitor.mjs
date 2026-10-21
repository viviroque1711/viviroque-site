// Monitoramento do site PUBLICADO (roda todo dia pelo GitHub Actions: .github/workflows/monitor.yml).
// Falhou = o job fica vermelho e o GitHub avisa por e-mail. Checa o que quebra sem ninguém ver:
// páginas respondendo 200 com título, 1 <h1>, canonical e indexação liberada; robots.txt com os robôs de IA liberados;
// sitemap e llms.txt; 404 real; http→https e www→raiz; validade do certificado; HTML inicial com conteúdo (sem JavaScript).
// Uso: node scripts/monitor.mjs [url-do-site]   (padrão: o domínio de produção do site.mjs)
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import { SITE } from '../src/data/site.mjs';
import { BOTS } from './bots.mjs';

const root = path.resolve(import.meta.dirname, '..');
const site = (process.argv[2] || SITE.url).replace(/\/$/, '');
const host = new URL(site).host;
const urls = fs.readFileSync(path.join(root, 'scripts', 'urls.txt'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const results = [];
const add = (name, ok, detail = '') => results.push({ name, ok, detail });
const GET = (u, opt = {}) => fetch(u, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) site-monitor' }, ...opt });
const txt = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

for (const u of urls) {
  try {
    const r = await GET(site + u); const h = await r.text();
    const title = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
    const canon = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    const robots = (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
    const h1 = (h.match(/<h1[\s>]/g) || []).length;
    const words = txt(h).split(' ').length;
    add(`página ${u}`, r.status === 200 && !!title && h1 === 1 && canon === SITE.url + u && !/noindex/i.test(robots) && words > 100, `${r.status} | ${title || 'sem title'} | h1 ${h1} | canonical ${canon === SITE.url + u ? 'ok' : canon} | robots "${robots}" | ${words} palavras no HTML inicial`);
  } catch (e) { add(`página ${u}`, false, e.message); }
}
try {
  const r = await GET(site + '/robots.txt'); const t = await r.text();
  const miss = BOTS.filter((b) => !new RegExp(`User-agent: ${b}\\s+Allow: /`, 'i').test(t));
  add('robots.txt libera robôs de busca e de IA', r.status === 200 && !miss.length && t.includes(`Sitemap: ${SITE.url}/sitemap.xml`), miss.length ? 'faltam ' + miss.join(', ') : `${BOTS.length} robôs`);
} catch (e) { add('robots.txt', false, e.message); }
try {
  const r = await GET(site + '/sitemap.xml'); const t = await r.text();
  const locs = [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  add('sitemap.xml lista todas as páginas', r.status === 200 && urls.every((u) => locs.includes(SITE.url + u)), `${locs.length} URLs`);
} catch (e) { add('sitemap.xml', false, e.message); }
try { const r = await GET(site + '/llms.txt'); add('llms.txt', r.status === 200, String(r.status)); } catch (e) { add('llms.txt', false, e.message); }
try { const r = await GET(site + '/nao-existe-monitor/'); add('404 real', r.status === 404, String(r.status)); } catch (e) { add('404 real', false, e.message); }
try { const r = await GET(`http://${host}/`); add('http redireciona para https', [301, 302, 308].includes(r.status) && (r.headers.get('location') || '').startsWith('https://'), `${r.status} → ${r.headers.get('location')}`); } catch (e) { add('http→https', false, e.message); }
try { const r = await GET(`https://www.${host}/`); add('www redireciona para a raiz', [301, 302, 308].includes(r.status) && (r.headers.get('location') || '').includes(`//${host}`), `${r.status} → ${r.headers.get('location')}`); } catch (e) { add('www→raiz', false, e.message); }
await new Promise((resolve) => {
  const s = tls.connect(443, host, { servername: host }, () => {
    const c = s.getPeerCertificate(); const days = Math.floor((new Date(c.valid_to) - Date.now()) / 864e5);
    add('certificado HTTPS válido por mais de 14 dias', s.authorized && days > 14, `${days} dias, ${s.authorized ? 'confiável' : s.authorizationError}`); s.end(); resolve();
  });
  s.on('error', (e) => { add('certificado HTTPS', false, e.message); resolve(); });
});

let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'OK    ' : 'FALHA '}${r.name}  ${r.detail}`); }
console.log(`\n${results.length - fail}/${results.length} OK em ${site}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Monitor ${site}\n\n${results.map((r) => `- ${r.ok ? '✅' : '❌'} ${r.name}: ${r.detail}`).join('\n')}\n`);
process.exit(fail ? 1 : 0);
