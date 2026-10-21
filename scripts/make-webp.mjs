// Gera as versões WebP (340 e 510 px) do retrato a partir de public/img/viviane-roque-retrato.png. Rode de novo se a foto mudar.
import path from 'node:path';
import sharp from 'sharp';
const img = path.resolve(import.meta.dirname, '..', 'public', 'img');
for (const w of [340, 510]) await sharp(path.join(img, 'viviane-roque-retrato.png')).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(img, `viviane-roque-retrato-${w}w.webp`));
console.log('webp gerados');
