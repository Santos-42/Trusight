/**
 * URL untuk ditampilkan di <img>.
 *
 * Dua bentuk cover yang sama-sama sah:
 * - path statis  → `/vehicles/honda-brio-rs-2021/hero.jpg` (file di static/)
 * - URL media    → `/api/media/MED-abc123` (blob di D1, untuk foto yang diunggah)
 *
 * Keduanya sudah berupa URL publik, jadi dipakai apa adanya. Fungsi ini hanya
 * menjaga agar cover yang kosong tidak jadi <img src="">.
 */
export function fileUrl(cover: string | null | undefined): string {
  if (!cover) return '';
  return cover.startsWith('/') ? cover : `/${cover}`;
}
