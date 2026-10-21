// Gera favicons e imagens de compartilhamento (1200x630) com Chrome headless e as fontes do próprio site.
// Uso: node scripts/og-build.mjs <caminho-do-puppeteer-core>   (só roda no computador, não no deploy)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const pup = await import(pathToFileURL(path.resolve(process.argv[2])).href);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// as fontes entram no HTML como data URI (o Chrome não carrega arquivos locais a partir de setContent)
const fontCss = (f) => {
  const dir = path.join(root, 'node_modules', '@fontsource', f.split('/')[0]);
  const re = /url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\([^)]+\) format\('woff'\)/g;
  return fs.readFileSync(path.join(dir, f.split('/')[1]), 'utf8').replace(re, (m, file) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(dir, 'files', file)).toString('base64')}) format('woff2')`);
};
const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(path.join(root, p)).toString('base64');

const PAGES = {
  home: ['Viviane Roque', 'Tecnologia de grande empresa a serviço de quem empreende'],
  'quem-sou': ['Quem é Viviane Roque', 'Trajetória desde 1998 em tecnologia e operações'],
  'minha-atuacao': ['Atuação de Viviane Roque', 'Empresas e lideranças'],
  'trabalhe-comigo': ['Mentoria com Viviane Roque', 'Para líderes e empresários'],
  'para-empresas': ['Para empresas', 'Roque Business Evolution'],
  conteudos: ['Conteúdos de Viviane Roque', 'Gestão, estratégia e tecnologia'],
  contato: ['Fale com Viviane Roque', 'WhatsApp +55 11 97396-7161'],
};
const css = ['literata/latin-600.css', 'literata/latin-400.css', 'schibsted-grotesk/latin-500.css', 'schibsted-grotesk/latin-600.css'].map(fontCss).join('\n');
const html = (t, s) => `<!doctype html><meta charset="utf-8"><style>${css}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#E7E8EA;position:relative;overflow:hidden;font-family:"Literata",serif;color:#262A31}
.ph{position:absolute;right:0;top:0;height:630px;-webkit-mask-image:linear-gradient(to right,transparent 0,#000 30%);}
.t{position:absolute;left:72px;top:150px;width:640px}
h1{font:600 62px/1.1 "Literata";margin:0 0 24px;letter-spacing:-.01em}
p{font:500 28px/1.35 "Schibsted Grotesk";color:#585E68;margin:0}
.n{position:absolute;left:72px;bottom:56px;font:600 26px "Schibsted Grotesk";color:#262A31;display:flex;align-items:center;gap:14px}
.n i{display:block;width:44px;height:2px;background:#A87000}
</style><img class="ph" src="${b64('public/img/viviane-roque-retrato.png')}"><div class="t"><h1>${t}</h1><p>${s}</p></div><div class="n"><i></i>viviroque.com.br</div>`;

const b = await (pup.default ?? pup).launch({ executablePath: CHROME, headless: 'new' });
const pg = await b.newPage(); await pg.setViewport({ width: 1200, height: 630 });
for (const [k, [t, s]] of Object.entries(PAGES)) {
  await pg.setContent(html(t, s), { waitUntil: 'load', timeout: 60000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(root, 'public', 'og', k + '.jpg'), type: 'jpeg', quality: 82 });
}
await b.close();
console.log('imagens de compartilhamento geradas (ícones: node scripts/make-icons.mjs)');
