/**
 * Penyimpanan foto untuk listing mobil & lisensi inspektur.
 *
 * Foto ditulis ke folder statis yang SUDAH ADA:
 *   static/vehicles/<nama-mobil>/hero.jpg
 *   static/licenses/<kode>/hero.jpg
 * Jadi tidak ada folder "vehicles" baru — hanya dibuat subfolder baru bernama
 * mobilnya di dalam folder yang sudah ada.
 *
 * CATATAN PENTING
 * Di produksi (Cloudflare Pages) filesystem read-only, jadi file yang diunggah
 * saat runtime hanya bisa tersimpan di mesin dev. Agar tayang di produksi, file
 * di static/ perlu di-commit lalu di-deploy ulang. Di lokal (npm run dev)
 * file langsung bisa dilihat di browser.
 */

export type MediaPurpose = 'vehicle' | 'license' | 'inspection';

export interface StoredMedia {
  /** Path relatif terhadap static/, mis. vehicles/honda-brio-rs-2021/hero.jpg */
  path: string;
  /** URL publik, mis. /vehicles/honda-brio-rs-2021/hero.jpg */
  url: string;
  bytes: number;
  contentType: string;
  /** false kalau file tidak bisa ditulis ke disk (mis. produksi). */
  saved: boolean;
}

/** Folder statis tujuan — semuanya sudah ada, tidak ada yang baru. */
const STATIC_FOLDER: Record<MediaPurpose, string> = {
  vehicle: 'vehicles',
  license: 'licenses',
  inspection: 'inspections'
};

function safeSegment(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Simpan file ke folder statis: `<folder tujuan>/<nama folder>/<nama file>.<ext>`.
 * Nama file dinormalkan supaya tidak ada karakter aneh di path.
 *
 * `filename` dipakai kalau satu folder butuh lebih dari satu file — mis. foto
 * lapangan inspeksi: inspections/TS-1234/1-hero.jpg, 2-hero.jpg, dan seterusnya.
 */
export async function storeMedia(args: {
  file: File;
  purpose: MediaPurpose;
  folder: string;
  filename?: string;
}): Promise<StoredMedia> {
  const folder = safeSegment(args.folder) || 'umum';
  const ext = (args.file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const name = safeSegment(args.filename || 'hero').replace(/\.+/g, '-') || 'hero';
  const rel = `${STATIC_FOLDER[args.purpose]}/${folder}/${name}.${ext}`;
  const buf = await args.file.arrayBuffer();
  const contentType = args.file.type || 'image/jpeg';
  const saved = await writeLocal(rel, buf);
  return { path: rel, url: `/${rel}`, bytes: buf.byteLength, contentType, saved };
}

/**
 * Tulis file ke static/ (hanya jalan di Node — dev lokal).
 *
 * Modul node sengaja di-import lewat variabel + @vite-ignore supaya Vite tidak
 * membundelnya: di produksi (workerd) import ini gagal lalu ditangkap, dan
 * pemanggil diminta menyimpan manual. Build Cloudflare tetap aman.
 */
const nodeModule = (name: string) => name;

async function writeLocal(rel: string, buf: ArrayBuffer): Promise<boolean> {
  try {
    const fs = (await import(/* @vite-ignore */ nodeModule('node:fs/promises'))) as {
      mkdir(p: string, o: { recursive: boolean }): Promise<void>;
      writeFile(p: string, d: Uint8Array): Promise<void>;
    };
    const path = (await import(/* @vite-ignore */ nodeModule('node:path'))) as {
      join(...s: string[]): string;
      dirname(p: string): string;
    };
    const cwd = (globalThis as { process?: { cwd(): string } }).process?.cwd() ?? '.';
    const dest = path.join(cwd, 'static', rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, new Uint8Array(buf));
    return true;
  } catch {
    // Produksi: filesystem read-only. Pemanggil harus menyimpan manual.
    return false;
  }
}
