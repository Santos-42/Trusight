import { api } from './api';

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

export async function signAndUpload(
  file: File | Blob,
  purpose: 'vehicle' | 'inspection' | 'avatar' | 'license' | 'signature' | 'chat',
  contentType = 'image/jpeg'
): Promise<string> {
  const sign = await api.post<{ signedUrl: string | null; r2_key: string }>('/uploads/sign', {
    purpose,
    contentType,
    size: (file as Blob).size
  });
  if (!sign.ok) throw new Error(sign.error.message);
  // KV-only: signedUrl null → byte disimpan di IndexedDB (client), KV catat metadata.
  if (!sign.data.signedUrl) return sign.data.r2_key;
  const put = await fetch(sign.data.signedUrl, { method: 'PUT', body: file });
  if (!put.ok) throw new Error(`Upload gagal (${put.status})`);
  return sign.data.r2_key;
}
