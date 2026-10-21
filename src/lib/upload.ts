import { API_BASE } from './config';

export interface UploadedFile {
  /** Path relatif ke static/, mis. vehicles/honda-brio-rs-2021/hero.jpg */
  path: string;
  /** URL publik, mis. /vehicles/honda-brio-rs-2021/hero.jpg */
  url: string;
  bytes: number;
  contentType: string;
  /** false kalau file tidak bisa ditulis ke disk (mis. produksi). */
  saved: boolean;
}

/**
 * Unggah file ke folder statis.
 *
 * Server menaruhnya di `<vehicles|licenses|inspections>/<folder>/<nama file>.<ext>` —
 * jadi foto otomatis masuk ke subfoldernya, di dalam folder static yang sudah ada.
 */
export async function uploadFile(
  file: File,
  opts: { purpose: 'vehicle' | 'license' | 'inspection'; folder: string; filename?: string }
): Promise<UploadedFile> {
  const fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('purpose', opts.purpose);
  fd.append('folder', opts.folder);
  if (opts.filename) fd.append('filename', opts.filename);
  const r = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: fd });
  const j = (await r.json().catch(() => null)) as
    | { ok: true; data: UploadedFile }
    | { ok: false; error: { message: string } }
    | null;
  if (!j?.ok) throw new Error(j?.error?.message ?? 'Upload gagal');
  return j.data;
}

export async function compressImage(file: File, maxKB = 1024): Promise<Blob> {
  // MVP: downscale via canvas agar <1MB sebelum upload (hemat R2 + cepat di HP)
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, Math.sqrt((maxKB * 1024) / file.size) || 1);
  const w = Math.max(1, Math.round(bitmap.width * Math.min(1, scale) || 1));
  const h = Math.max(1, Math.round(bitmap.height * Math.min(1, scale) || 1));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('compress gagal'))), 'image/jpeg', 0.82)
  );
}
