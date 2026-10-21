// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/data/site.mjs';
import { REDIRECTS } from './src/data/redirects.mjs';

// SITE_ENV=staging publica o endereço de teste do GitHub Pages (/<repo>/) com noindex; production publica no domínio.
const staging = process.env.SITE_ENV === 'staging';
const B = staging ? `/${SITE.repo}` : '';
const redirects = Object.fromEntries(Object.entries(REDIRECTS).map(([from, to]) => [from, to.startsWith('http') ? to : B + to]));

export default defineConfig({
  site: SITE.url,
  base: staging ? `/${SITE.repo}` : '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  redirects,
});
