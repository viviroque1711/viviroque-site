// Ferramentas do gerador de conteúdo. Cada página nasce de UMA descrição: o mesmo texto vira HTML visível e JSON-LD,
// então o FAQPage é sempre idêntico às perguntas mostradas na tela. Rode: npm run content
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../../src/data/site.mjs';

export const root = path.resolve(import.meta.dirname, '..', '..');
export const pagesDir = path.join(root, 'src', 'content-pages');
export const TODAY = '2026-10-21';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
export const plain = (html) => unesc(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
export const abs = (p) => (p.startsWith('http') ? p : SITE.url + p);
export const pageUrl = (p) => SITE.url + p;

export function check(page) {
  const errs = [];
  if (page.title.length > 65) errs.push(`title ${page.title.length} > 65: ${page.title}`);
  if (page.description.length > 155) errs.push(`description ${page.description.length} > 155: ${page.description}`);
  if (errs.length) throw new Error(`${page.path}: ${errs.join(' | ')}`);
}

/** <head> da página: title, description, canonical, robots, ícones, Open Graph e Twitter. */
export function headHtml({ path: p, title, description, image, ogType = 'website', themeColor = SITE.themeColor, siteName = SITE.name }) {
  const url = pageUrl(p);
  const img = abs(image);
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="${themeColor}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(siteName)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">
`;
}

/** Perguntas frequentes: devolve o HTML visível e o FAQPage com o MESMO texto. items = [{ q, a }] (a = HTML). */
export function faq(items, { heading = 'Perguntas frequentes', id = 'perguntas', pagePath }) {
  const html = `<section class="sec paper" id="${id}" aria-labelledby="${id}-h"><div class="wrap">
<h2 id="${id}-h">${esc(heading)}</h2>
<div class="faq">
${items.map((it, i) => `<details${i === 0 ? ' open' : ''}><summary><h3 class="faq-q">${esc(it.q)}</h3></summary><div class="ans">${it.a}</div></details>`).join('\n')}
</div>
</div></section>`;
  const ld = {
    '@type': 'FAQPage',
    '@id': pageUrl(pagePath) + '#faq',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })),
  };
  return { html, ld };
}

export const crumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: pageUrl(it.path) })),
});
export const crumbHtml = (items) => `<p class="crumb">${items.map((it, i) => (i < items.length - 1 ? `<a href="${it.path}">${esc(it.name)}</a>` : `<span aria-current="page">${esc(it.name)}</span>`)).join(' / ')}</p>`;

export const wa = (text) => `https://wa.me/${SITE.wa.number}?text=${encodeURIComponent(text)}`;

const written = [];
export function writePage(page) {
  check(page);
  const dir = page.path === '/' ? '_home' : page.path.replace(/^\/|\/$/g, '').replace(/\//g, '__');
  const d = path.join(pagesDir, dir);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'head.html'), headHtml(page));
  fs.writeFileSync(path.join(d, 'body.html'), page.body.trim() + '\n');
  fs.writeFileSync(path.join(d, 'ld.json'), JSON.stringify({ '@context': 'https://schema.org', '@graph': page.graph }, null, 1) + '\n');
  if (page.js) fs.writeFileSync(path.join(d, 'script.js'), page.js.trim() + '\n');
  else fs.rmSync(path.join(d, 'script.js'), { force: true });
  written.push(page);
}

export function finish() {
  // lastmod: as páginas geradas hoje; mantém as datas antigas das que não mudaram de conteúdo
  const lmFile = path.join(root, 'src', 'data', 'lastmod.json');
  const lm = fs.existsSync(lmFile) ? JSON.parse(fs.readFileSync(lmFile, 'utf8')) : {};
  const hashFile = path.join(root, 'scripts', 'content', '.hashes.json');
  const hashes = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, 'utf8')) : {};
  for (const p of written) {
    const h = JSON.stringify([p.title, p.description, p.body, p.graph]);
    if (hashes[p.path] !== h) { hashes[p.path] = h; lm[p.path] = TODAY; }
  }
  fs.writeFileSync(lmFile, JSON.stringify(Object.fromEntries(Object.entries(lm).sort()), null, 2) + '\n');
  fs.writeFileSync(hashFile, JSON.stringify(hashes));
  // verify-phrases: o H1 de cada página
  const vp = {};
  for (const p of written) { const m = p.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); vp[p.path] = [plain(m[1])]; }
  fs.writeFileSync(path.join(root, 'scripts', 'verify-phrases.json'), JSON.stringify(vp, null, 1) + '\n');
  // urls atuais (para o verify-site e o monitor)
  fs.writeFileSync(path.join(root, 'scripts', 'urls.txt'), written.map((p) => p.path).sort().join('\n') + '\n');
  console.log(`${written.length} páginas geradas`);
}
