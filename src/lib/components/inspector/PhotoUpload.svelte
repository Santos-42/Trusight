<script lang="ts">
  import { compressPhoto, readExif } from '$lib/exif';
  import { uploadFile } from '$lib/upload';

  /** Folder tujuan di static/ — dipakai id order, jadi foto dikelompokkan perorder. */
  export let folder: string;
  export let purpose: 'inspection' = 'inspection';
  export let onDone: (r: { key: string; note: string }) => void = () => {};

  let status = 'Pilih foto lapangan (kamera HP).';
  let busy = false;
  let seq = 0;

  async function pick(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    busy = true;
    status = 'Membaca EXIF + kompres...';
    try {
      const exif = await readExif(file);
      const small = await compressPhoto(file, 1);
      seq += 1;
      const up = await uploadFile(new File([small], 'hero.jpg', { type: 'image/jpeg' }), {
        purpose,
        folder,
        filename: `${seq}-hero`
      });
      status = `${file.name} • ${(small.size / 1024).toFixed(0)} KB${exif.valid ? ' • GPS tercatat' : ''} — static/${up.path}`;
      onDone({ key: up.url, note: status });
    } catch (err) {
      status = err instanceof Error ? err.message : 'Gagal mengunggah foto.';
    } finally {
      busy = false;
      input.value = '';
    }
  }
</script>
<div class="rounded-2xl border bg-white p-4">
  <p class="text-sm font-bold">Bukti Foto Anti-Fraud</p>
  <label class="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-bold">
    {busy ? 'Memproses...' : 'Ambil / Pilih Foto'}
    <input type="file" accept="image/*" capture="environment" class="hidden" on:change={pick} disabled={busy} />
  </label>
  <p class="mt-2 text-xs text-slate-500">{status}</p>
</div>
