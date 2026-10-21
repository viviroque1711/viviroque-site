// Favicons a partir do símbolo (constelação) em public/img/marca-simbolo.png: transparente para o navegador, sobre grafite para o celular.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const pub = path.resolve(import.meta.dirname, '..', 'public');
const sym = path.join(pub, 'img', 'marca-simbolo.png');
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const graphite = { r: 38, g: 42, b: 49, alpha: 1 };
const square = async (size, pad, bg) => {
  const inner = Math.round(size * (1 - pad * 2));
  const p = Math.round(size * pad);
  return sharp(sym).resize(inner, inner, { fit: 'contain', background: clear }).extend({ top: p, bottom: size - inner - p, left: p, right: size - inner - p, background: bg }).png().toBuffer();
};
fs.writeFileSync(path.join(pub, 'favicon-32x32.png'), await square(32, .03, clear));
fs.writeFileSync(path.join(pub, 'favicon-16x16.png'), await square(16, .02, clear));
fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), await square(180, .17, graphite));
fs.writeFileSync(path.join(pub, 'android-chrome-192x192.png'), await square(192, .17, graphite));
fs.writeFileSync(path.join(pub, 'android-chrome-512x512.png'), await square(512, .17, graphite));
const png48 = await square(48, .03, clear);
const hdr = Buffer.alloc(22); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
hdr.writeUInt8(48, 6); hdr.writeUInt8(48, 7); hdr.writeUInt16LE(1, 10); hdr.writeUInt16LE(32, 12); hdr.writeUInt32LE(png48.length, 14); hdr.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(pub, 'favicon.ico'), Buffer.concat([hdr, png48]));
console.log('ícones gerados');
