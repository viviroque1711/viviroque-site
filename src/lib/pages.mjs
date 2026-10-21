import lastmodMap from '../data/lastmod.json';
import { LLMS } from '../data/llms.mjs';

const heads = import.meta.glob('/src/content-pages/*/head.html', { query: '?raw', import: 'default', eager: true });
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Data da última alteração REAL de cada página (src/data/lastmod.json). Atualize a data ao mudar o conteúdo da página.
const lastmod = (path) => lastmodMap[path] || new Date().toISOString().slice(0, 10);

/** Todas as páginas: caminho, título, descrição, lastmod e dados do llms.txt. */
export function contentPages() {
  return Object.entries(heads).map(([file, head]) => {
    const dir = file.split('/').slice(-2, -1)[0];
    const path = dir === '_home' ? '/' : `/${dir.replace(/__/g, '/')}/`;
    const title = decode(head.match(/<title>([^<]*)<\/title>/)[1]);
    const description = decode(head.match(/<meta name="description" content="([^"]*)"/)[1]);
    return { dir, path, title, description, lastmod: lastmod(path), ...(LLMS[path] || {}) };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

const parts = import.meta.glob('/src/content-pages/*/*', { query: '?raw', import: 'default', eager: true });

/** Pedaços (head, css, ld, body, js) de uma página. */
export function pageParts(dir) {
  const get = (name) => parts[`/src/content-pages/${dir}/${name}`];
  return { head: get('head.html'), css: get('style.css'), ld: get('ld.json'), body: get('body.html'), js: get('script.js') };
}

export function pageDirs() {
  return [...new Set(Object.keys(parts).map((f) => f.split('/').slice(-2, -1)[0]))];
}
