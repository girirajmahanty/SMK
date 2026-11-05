// Makes small WebP copies of the site's photos and logo, and writes src/images.json,
// which tells the site which widths exist. Run after adding or changing photos:
//   npm run images --prefix client
// The outputs are saved in public/, so the live server does not need sharp.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const pub = path.join(root, 'public');
const out = path.join(pub, 'opt');
const WIDTHS = [480, 960, 1600];
const manifest = {};

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? (d.name === 'opt' ? [] : walk(path.join(dir, d.name))) : [path.join(dir, d.name)]);

fs.mkdirSync(out, { recursive: true });
for (const file of walk(path.join(pub, 'gallery')).filter((f) => /\.jpe?g$/i.test(f))) {
  const rel = '/' + path.relative(pub, file).split(path.sep).join('/');
  const { width } = await sharp(file).metadata();
  const sizes = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1600)])];
  const base = path.basename(file).replace(/\.\w+$/, '');
  manifest[rel] = [];
  for (const w of sizes) {
    const name = `${base}-${w}.webp`;
    // festival photos fill the whole screen behind the festival section, so they get a higher quality
    const quality = rel.startsWith('/gallery/festivals/') ? 82 : 74;
    await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(path.join(out, name));
    manifest[rel].push([w, `/opt/${name}`]);
  }
}

// logo: WebP at the sizes the site shows
for (const s of [64, 192, 512]) {
  await sharp(path.join(pub, `logo/smk-logo-${s}.png`)).webp({ quality: 82, effort: 6 }).toFile(path.join(pub, `logo/smk-logo-${s}.webp`));
}

fs.writeFileSync(path.join(root, 'src/images.json'), JSON.stringify(manifest, null, 1) + '\n');
const kb = (d) => Math.round(fs.readdirSync(d).reduce((s, f) => s + fs.statSync(path.join(d, f)).size, 0) / 1024);
console.log(`${Object.keys(manifest).length} photos -> ${kb(out)} KB of WebP in public/opt`);
