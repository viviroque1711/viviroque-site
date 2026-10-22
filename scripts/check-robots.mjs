// Confere que o robots.txt e as páginas deixam os robôs de busca e de IA entrarem em TODO o site (rodar sobre uma build de produção).
// Uso: node scripts/check-robots.mjs [dist]            confere os arquivos da build (SITE_ENV=production)
//      node scripts/check-robots.mjs --live <url-base> confere o site no ar, pedindo cada página com o user-agent de cada robô
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const live = process.argv.includes('--live');
const arg = process.argv.slice(2).filter((a) => a !== '--live')[0];
// robôs que a Viviane pediu; o robots.txt do site pode ter mais, nunca menos
const PEDIDOS = ['Googlebot', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
const UA = {
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'OAI-SearchBot': 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
  'ChatGPT-User': 'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
  'Claude-SearchBot': 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)',
  'Claude-User': 'Mozilla/5.0 (compatible; Claude-User/1.0; +https://www.anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  'Perplexity-User': 'Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
};

const falhas = [];
const ok = (m) => console.log('OK    ' + m);
const bad = (m) => { falhas.push(m); console.log('FALHA ' + m); };

function grupos(txt) {
  const out = []; let cur = null;
  for (const raw of txt.split(/\r?\n/)) {
    const l = raw.replace(/#.*/, '').trim(); if (!l) { continue; }
    const m = l.match(/^([A-Za-z-]+)\s*:\s*(.*)$/); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') { if (!cur || cur.regras.length) { cur = { agentes: [], regras: [] }; out.push(cur); } cur.agentes.push(v.toLowerCase()); }
    else if (cur && (k === 'allow' || k === 'disallow')) cur.regras.push([k, v]);
  }
  return out;
}
function liberado(gs, bot) {
  const g = gs.find((x) => x.agentes.includes(bot.toLowerCase())) || gs.find((x) => x.agentes.includes('*'));
  if (!g) return { ok: true, porque: 'sem regra (liberado)' };
  const bloq = g.regras.filter(([k, v]) => k === 'disallow' && v !== '');
  if (bloq.length) return { ok: false, porque: 'Disallow: ' + bloq.map((b) => b[1]).join(', ') };
  return { ok: true, porque: g.regras.some(([k, v]) => k === 'allow' && v === '/') ? 'Allow: /' : 'sem Disallow' };
}

async function texto(u, ua) { const r = await fetch(u, { headers: ua ? { 'user-agent': ua } : {}, redirect: 'follow' }); return { status: r.status, xrobots: r.headers.get('x-robots-tag') || '', body: await r.text() }; }

if (!live) {
  const dist = path.resolve(root, arg || 'dist');
  const siteMjs = path.join(root, 'src', 'data', 'site.mjs');
  let SITE;
  try { ({ SITE } = await import('file://' + siteMjs.replace(/\\/g, '/'))); } catch {
    // repositório sem site.mjs (aurorapremium.com): usa o endereço que está no próprio sitemap
    SITE = { url: new URL((fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').match(/<loc>([^<]+)<\/loc>/) || [])[1]).origin };
  }
  const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
  const gs = grupos(robots);
  for (const b of PEDIDOS) { const r = liberado(gs, b); (r.ok && gs.some((g) => g.agentes.includes(b.toLowerCase())) ? ok : bad)(`robots.txt: ${b} — ${r.porque}${gs.some((g) => g.agentes.includes(b.toLowerCase())) ? '' : ' (sem regra própria)'}`); }
  const geral = liberado(gs, '*'); (geral.ok ? ok : bad)('robots.txt: demais robôs (*) — ' + geral.porque);
  /Sitemap:\s*(\S+)/i.test(robots) && RegExp.$1 === SITE.url + '/sitemap.xml' ? ok('robots.txt: Sitemap ' + RegExp.$1) : bad('robots.txt: linha Sitemap ausente ou diferente de ' + SITE.url + '/sitemap.xml');
  // cada página da build
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let semProblema = 0;
  for (const u of urls) {
    const p = new URL(u).pathname; const f = path.join(dist, p, 'index.html');
    if (!fs.existsSync(f)) { bad('página do sitemap sem arquivo: ' + p); continue; }
    const h = fs.readFileSync(f, 'utf8');
    const robotsMeta = (h.match(/<meta[^>]+name="robots"[^>]*content="([^"]*)"/i) || [])[1] || '';
    const canon = (h.match(/<link[^>]+rel="canonical"[^>]*href="([^"]*)"/i) || [])[1] || '';
    const probs = [];
    if (/noindex|nofollow|none/i.test(robotsMeta)) probs.push('meta robots "' + robotsMeta + '"');
    if (canon !== u) probs.push('canonical ' + canon);
    if (/data-nosnippet|nosnippet/i.test(h)) probs.push('nosnippet');
    probs.length ? bad(p + ' — ' + probs.join('; ')) : semProblema++;
  }
  (semProblema === urls.length ? ok : bad)(`${semProblema}/${urls.length} páginas do sitemap: indexáveis, sem noindex, canonical = próprio endereço`);
  // a 404 deve ficar de fora do índice
  const nf = path.join(dist, '404.html'); if (fs.existsSync(nf)) /noindex/i.test(fs.readFileSync(nf, 'utf8')) ? ok('404.html: noindex (correto)') : bad('404.html sem noindex');
} else {
  const base = (arg || '').replace(/\/$/, ''); if (!base) { console.error('informe a url-base'); process.exit(2); }
  const rb = await texto(base + '/robots.txt'); const gs = grupos(rb.body);
  for (const b of PEDIDOS) { const r = liberado(gs, b); (r.ok ? ok : bad)(`${base}/robots.txt: ${b} — ${r.porque}`); }
  const sm = (await texto(base + '/sitemap.xml')).body; const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const b of PEDIDOS) {
    let n = 0; const ruins = [];
    for (const u of urls) { const r = await texto(u, UA[b]); if (r.status !== 200 || /noindex|none/i.test(r.xrobots) || /<meta[^>]+name="robots"[^>]*content="[^"]*noindex/i.test(r.body)) ruins.push(new URL(u).pathname + ' (' + r.status + (r.xrobots ? ' ' + r.xrobots : '') + ')'); else n++; }
    (ruins.length ? bad : ok)(`${b}: ${n}/${urls.length} páginas entregues com 200 e sem noindex${ruins.length ? ' — ' + ruins.slice(0, 5).join(', ') : ''}`);
  }
}
console.log(falhas.length ? `\n${falhas.length} FALHA(S)` : '\nTudo certo');
process.exit(falhas.length ? 1 : 0);
