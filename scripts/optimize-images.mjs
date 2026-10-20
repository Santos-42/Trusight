/**
 * Optimasi gambar statis: foto PNG -> JPEG yang jauh lebih ringan.
 *
 *   npm run images:optimize
 *
 * Menyasar dua tempat:
 *   static/vehicles/<id>/hero.(png|jpg)  -> hero.jpg   (maks 1280px lebar)
 *   static/licenses/*.(png|jpg)          -> *.jpg      (maks 1600px lebar, kualitas
 *                                                       lebih tinggi agar teks lisensi
 *                                                       tetap terbaca)
 *
 * File PNG aslinya dihapus setelah JPEG-nya tertulis. Jalankan sesudah menaruh
 * gambar baru ke static/.
 */
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, rmSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'static');
const MAX_W = { vehicle: 1280, license: 1600 };
const QUALITY = { vehicle: 82, license: 88 };

const jobs = [];

for (const dir of readdirSync(join(ROOT, 'vehicles'), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(join(ROOT, 'vehicles', dir.name))) {
    if (/\.(png|jpe?g)$/i.test(f)) {
      jobs.push({ kind: 'vehicle', file: join(ROOT, 'vehicles', dir.name, f), out: join(ROOT, 'vehicles', dir.name, 'hero.jpg') });
    }
  }
}

const licDir = join(ROOT, 'licenses');
if (existsSync(licDir)) {
  for (const f of readdirSync(licDir)) {
    if (/\.(png|jpe?g)$/i.test(f)) {
      jobs.push({ kind: 'license', file: join(licDir, f), out: join(licDir, `${basename(f, extname(f))}.jpg`) });
    }
  }
}

if (!jobs.length) {
  console.log('Tidak ada gambar untuk dioptimasi.');
  process.exit(0);
}

let before = 0;
let after = 0;

for (const job of jobs) {
  const inSize = statSync(job.file).size;
  mkdirSync(dirname(job.out), { recursive: true });

  // sharp menolak input == output, jadi tulis ke file sementara lalu timpa.
  const samePath = job.file === job.out;
  const tmpOut = samePath ? `${job.out}.tmp` : job.out;

  await sharp(job.file)
    .rotate() // hormati EXIF orientation
    .resize({ width: MAX_W[job.kind], withoutEnlargement: true })
    .jpeg({ quality: QUALITY[job.kind], mozjpeg: true })
    .toFile(tmpOut);

  if (samePath) {
    rmSync(job.file);
    renameSync(tmpOut, job.out);
  }

  const outSize = statSync(job.out).size;
  before += inSize;
  after += outSize;

  const rel = job.out.replace(ROOT, 'static');
  const saved = inSize ? Math.round((1 - outSize / inSize) * 100) : 0;
  console.log(`  ${(inSize / 1024).toFixed(0).padStart(5)} KB -> ${(outSize / 1024).toFixed(0).padStart(4)} KB  (-${saved}%)  ${rel}`);

  if (job.file !== job.out && existsSync(job.file)) rmSync(job.file);
}

console.log(`\nTotal: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`);
