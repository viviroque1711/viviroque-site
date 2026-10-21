import { contentPages } from '../lib/pages.mjs';
import { SITE } from '../data/site.mjs';

export function GET() {
  const urls = contentPages()
    .map((p) => `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
