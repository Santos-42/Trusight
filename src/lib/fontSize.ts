import { browser } from '$app/environment';

export type FontSize = 'small' | 'normal' | 'large';

const KEY = 'trusight_font_size';
const ORDER: FontSize[] = ['small', 'normal', 'large'];

/**
 * Ukuran font root (px) per preset. Semua teks memakai rem, jadi mengubah ini
 * ikut membesarkan/mengecilkan seluruh teks — termasuk tombol dan pill.
 */
export const FONT_PX: Record<FontSize, number> = { small: 15, normal: 16, large: 18 };

/** Label preset di UI (Indonesia — ikut konvensi copy TruSight). */
export const FONT_LABEL: Record<FontSize, string> = { small: 'Kecil', normal: 'Normal', large: 'Besar' };

/** Semua preset sesuai urutan tampil. */
export const FONT_OPTIONS: FontSize[] = ORDER;

/** Normalisasi nilai mentah (localStorage) → preset valid. */
export function resolveFontSize(raw: unknown): FontSize {
  return typeof raw === 'string' && (ORDER as string[]).includes(raw) ? (raw as FontSize) : 'normal';
}

/** Preferensi ukuran font yang tersimpan; default 'normal' saat kosong/SSR. */
export function getFontSize(): FontSize {
  if (!browser) return 'normal';
  return resolveFontSize(localStorage.getItem(KEY));
}

/** Terapkan preferensi ke elemen root (tanpa menyimpan). */
export function applyFontSize(size: FontSize = getFontSize()): void {
  if (!browser) return;
  document.documentElement.style.fontSize = `${FONT_PX[size]}px`;
}

/** Simpan preferensi lalu langsung terapkan. */
export function setFontSize(size: FontSize): void {
  if (!browser) return;
  try {
    localStorage.setItem(KEY, size);
  } catch {
    /* storage penuh/terblokir — tetap terapkan untuk sesi ini */
  }
  applyFontSize(size);
}
