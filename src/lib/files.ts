/**
 * URL untuk ditampilkan di <img>.
 *
 * Foto disimpan sebagai file statis (static/vehicles/<nama-mobil>/hero.jpg),
 * jadi path-nya langsung dipakai apa adanya. Fungsi ini hanya menjaga agar
 * cover yang kosong tidak jadi <img src="">.
 */
export function fileUrl(cover: string | null | undefined): string {
  if (!cover) return '';
  return cover.startsWith('/') ? cover : `/${cover}`;
}
