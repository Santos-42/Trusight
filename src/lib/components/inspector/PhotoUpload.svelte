<script lang="ts">
  import { compressPhoto, readExif } from '$lib/exif';
  import { uploadMedia } from '$lib/upload';

  export let onDone: (r: { key: string; note: string }) => void = () => {};

  let status = 'Pilih foto lapangan — kamera atau galeri.';
  let busy = false;
  let error = '';

  /** Batas nilai TEXT di D1 = 1.000.000 byte; base64 menambah ~33%. */
  const MAX_BYTES = 700 * 1024;

  /**
   * Browser ini bisa decode format fotonya? Foto HEIC dari iPhone sering tidak
   * bisa, dan canvas pun gagal. Lebih baik ditolak dengan pesan jelas daripada
   * membuat alur inspections diam-diam macet.
   */
  async function canDecode(file: File): Promise<boolean> {
    if (typeof createImageBitmap !== 'function') return true;
    try {
      const bmp = await createImageBitmap(file);
      bmp.close?.();
      return true;
    } catch {
      return false;
    }
  }

  async function pick(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    // Kosongkan input SEBELUM await, tapi simpan dulu referensinya supaya file
    // yang sama bisa dipilih ulang.
    input.value = '';
    if (!file) return;
    error = '';
    busy = true;
    status = 'Membaca EXIF + kompres...';
    try {
      if (!(await canDecode(file))) {
        error = 'Format foto ini tidak didukung browser ini (HEIC?). Simpan sebagai JPG/PNG lalu pilih ulang.';
        status = 'Foto ditolak.';
        return;
      }
      const exif = await readExif(file);
      // Kompresi ke <= 500 KB supaya base64-nya masih muat di nilai TEXT D1.
      const small = await compressPhoto(file, 0.5);
      if (small.size > MAX_BYTES) {
        error = `Foto masih ${(small.size / 1024 / 1024).toFixed(1)} MB. Ambil foto dengan resolusi lebih rendah.`;
        status = 'Foto terlalu besar.';
        return;
      }
      // Disimpan sebagai blob di D1 — di produksi filesystem read-only, jadi
      // foto yang diambil di lokasi tidak bisa ditulis ke static/.
      const up = await uploadMedia(new File([small], 'lapangan.jpg', { type: 'image/jpeg' }));
      status = `${file.name} • ${(small.size / 1024).toFixed(0)} KB${exif.valid ? ' • GPS tercatat' : ''}`;
      onDone({ key: up.url, note: status });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Gagal mengunggah foto.';
      status = 'Gagal mengunggah.';
    } finally {
      // Tombol upload tidak pernah boleh terkunci — kalau ini macet, form tidak
      // bisa pernah dikirim.
      busy = false;
    }
  }
</script>
<div class="rounded-2xl border bg-white p-4">
  <p class="text-sm font-bold">Bukti Foto Anti-Fraud</p>
  <label class="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-bold">
    {busy ? 'Memproses...' : 'Ambil / Pilih Foto'}
    <!-- Tanpa `capture`: dengan capture, Android Chrome memaksa kamera terbuka
         dan galeri tidak bisa diakses sama sekali. -->
    <input type="file" accept="image/*" class="hidden" on:change={pick} disabled={busy} />
  </label>
  <p class="mt-2 text-xs text-slate-500">{status}</p>
  {#if error}<p class="mt-1 text-xs font-semibold text-red-600">{error}</p>{/if}
</div>
