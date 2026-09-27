<script lang="ts">
  import { compressPhoto, readExif } from '$lib/exif';
  export let onDone: (r: { key: string; note: string }) => void = () => {};
  let status = 'Pilih foto lapangan (kamera HP).';
  let busy = false;

  async function pick(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    busy = true;
    status = 'Membaca EXIF + kompres...';
    const exif = await readExif(file);
    const small = await compressPhoto(file, 1);
    status = `${exif.reason} • ${(small.size / 1024).toFixed(0)} KB (OSS: exifr + compression)`;
    onDone({ key: `inspection/mock-${Date.now()}.jpg`, note: status });
    busy = false;
  }
</script>
<div class="rounded-2xl border bg-white p-4">
  <p class="text-sm font-bold">Bukti Foto Anti-Fraud <span class="font-normal text-slate-500">(mockup)</span></p>
  <label class="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-bold">
    {busy ? 'Memproses...' : 'Ambil / Pilih Foto'}
    <input type="file" accept="image/*" capture="environment" class="hidden" on:change={pick} disabled={busy} />
  </label>
  <p class="mt-2 text-xs text-slate-500">{status}</p>
</div>
