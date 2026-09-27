import { compressImage as canvasCompress } from './upload';

// OSS: exifr (MIT) untuk baca EXIF + browser-image-compression (MIT) untuk hemat R2.
// Mockup-first: file tanpa EXIF tetap bisa lanjut tapi ditandai exif_valid=0.

export type ExifCheck = {
  valid: boolean;
  lat: number | null;
  lng: number | null;
  takenAt: string | null;
  reason: string;
};

export async function readExif(file: File | Blob): Promise<ExifCheck> {
  try {
    const { default: exifr } = await import('exifr');
    const gps = await exifr.gps(file).catch(() => null);
    const tags = await exifr
      .parse(file, { pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude'] })
      .catch(() => null);
    const lat = (gps as { latitude?: number } | null)?.latitude ?? null;
    const lng = (gps as { longitude?: number } | null)?.longitude ?? null;
    const takenAt =
      (tags as Record<string, unknown> | null)?.DateTimeOriginal instanceof Date
        ? ((tags as Record<string, Date>)['DateTimeOriginal'] as Date).toISOString()
        : null;
    if (lat == null || lng == null) {
      return { valid: false, lat, lng, takenAt, reason: 'Tanpa GPS EXIF — ditandai manual, perlu verifikasi admin' };
    }
    return { valid: true, lat, lng, takenAt, reason: 'EXIF GPS valid' };
  } catch {
    return { valid: false, lat: null, lng: null, takenAt: null, reason: 'EXIF tidak terbaca — mode mockup' };
  }
}

export async function compressPhoto(file: File, maxMB = 1): Promise<Blob> {
  try {
    const { default: imageCompression } = await import('browser-image-compression');
    return await imageCompression(file, { maxSizeMB: maxMB, maxWidthOrHeight: 1600, useWebWorker: true });
  } catch {
    // Fallback canvas lokal (tanpa dep) bila worker gagal
    return canvasCompress(file, maxMB * 1024);
  }
}
