import { API_BASE } from './config';

export interface UploadedMedia {
  id: string;
  /** URL publik, mis. /api/media/MED-abc123 */
  url: string;
  bytes: number;
}

/**
 * Unggah foto — disimpan sebagai blob di D1, lalu disajikan lewat /api/media/<id>.
 *
 * Dipakai untuk foto listing seller maupun foto lapangan inspeksi. Di produksi
 * filesystem Cloudflare Pages read-only, jadi file yang diunggah saat runtime
 * tidak bisa ditulis ke static/ — dengan begitu fotonya tetap bisa dilihat
 * tanpa perlu commit + deploy.
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const fd = new FormData();
  fd.append('file', file, file.name);
  const r = await fetch(`${API_BASE}/media`, { method: 'POST', body: fd });
  const j = (await r.json().catch(() => null)) as
    | { ok: true; data: UploadedMedia }
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
