// Converte os logos entregues pela Viviane (assets-originais/logo/*.png, com fundo branco ou preto sólido) em PNG com
// transparência real, cortados rente ao desenho, e gera a foto do escritório em WebP. Rode: node scripts/make-logos.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'assets-originais');
const out = path.join(root, 'public', 'img');
fs.mkdirSync(out, { recursive: true });

/** Fundo claro (branco) -> transparência. A cor do desenho é fixa (rgb) e o alfa vem do canal de referência (0 = tinta cheia, 255 = papel). */
async function onWhite(file, outName, ink, channel = 0, width) {
  const { data, info } = await sharp(path.join(src, 'logo', file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const low = Math.min(...[...Array(info.width * info.height).keys()].filter((i) => i % 37 === 0).map((i) => data[i * 4 + channel]));
  const buf = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = Math.max(0, Math.min(1, (255 - data[i + channel]) / (255 - low)));
    buf[i] = ink[0]; buf[i + 1] = ink[1]; buf[i + 2] = ink[2]; buf[i + 3] = Math.round(a * 255);
  }
  await finish(buf, info, outName, width);
}
/** Fundo escuro (preto) com desenho branco -> transparência: o brilho vira alfa. */
async function onBlack(file, outName, ink, width) {
  const { data, info } = await sharp(path.join(src, 'logo', file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) { buf[i] = ink[0]; buf[i + 1] = ink[1]; buf[i + 2] = ink[2]; buf[i + 3] = Math.min(255, Math.round((data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) * 1.0)); }
  await finish(buf, info, outName, width);
}
async function finish(buf, info, outName, width) {
  let img = sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } });
  const trimmed = await img.png().toBuffer();
  let t = sharp(trimmed).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 });
  if (width) t = t.resize({ width, withoutEnlargement: false });
  await t.png({ compressionLevel: 9 }).toFile(path.join(out, outName));
  const m = await sharp(path.join(out, outName)).metadata();
  console.log(outName, m.width + 'x' + m.height);
}

// assinatura "Vivi Roque": marrom oficial (#9D6900) para fundo claro; branco para fundo escuro
await onWhite('Logo Vivi Roque Sem fundo Brown #9d6900.png', 'logo-vivi-roque.png', [157, 105, 0], 2, 480);
await onBlack('Logo Vivi Roque fundo Preto letra branca.png', 'logo-vivi-roque-branco.png', [255, 255, 255], 480);
// símbolo (constelação) em dourado, sem o nome
await onWhite('6.png', 'marca-simbolo.png', [168, 112, 0], 2, 360);

// foto do escritório (600x600) em WebP, nas duas larguras usadas na página
for (const w of [400, 600]) await sharp(path.join(src, 'foto-vivi-escritorio.jpg')).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, `viviane-roque-escritorio-${w}w.webp`));
console.log('foto do escritório gerada');
