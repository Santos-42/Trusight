<script lang="ts">
  import { Upload } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { compressImage, uploadMedia } from '$lib/upload';
  import LicensePreview from '$lib/components/license/LicensePreview.svelte';
  let name='', email='', password='', license_no='', region='DKI Jakarta', err='', ok='';
  let licenseKey = '', licensePreview: string | null = null, licenseNote = '', busy = false;

  async function pickLicense(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { licenseNote = 'File harus berupa gambar.'; return; }
    busy = true;
    licenseNote = 'Mengompres gambar...';
    try {
      const small = await compressImage(file, 700);
      licensePreview = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error('Gagal membaca file'));
        r.readAsDataURL(small);
      });
      // Foto lisensi disimpan sebagai blob di D1 — URL-nya yang dipakai sebagai
      // referensi, sama seperti foto listing & foto lapangan inspeksi.
      const up = await uploadMedia(new File([small], 'lisensi.jpg', { type: 'image/jpeg' }));
      licenseKey = up.url;
      licenseNote = `${file.name} • ${(small.size / 1024).toFixed(0)} KB`;
    } catch (e2) {
      licenseNote = e2 instanceof Error ? e2.message : 'Gagal memproses gambar.';
    } finally {
      busy = false;
    }
  }

  async function submit() {
    err=''; ok='';
    const r = await api.post('/auth/request-account', { name, email, password, license_no, region, license_key: licenseKey || undefined });
    if (!r.ok) { err=r.error.message; return; }
    ok='Pengajuan terkirim. Admin akan verifikasi lisensi Anda.';
  }
</script>
<svelte:head><title>Request Inspektor — TruSight</title></svelte:head>
<div class="mx-auto max-w-md">
  <h1 class="text-2xl font-extrabold">Hello! Request account to get start inspecting!</h1>
  <form class="mt-6 grid gap-3" on:submit|preventDefault={submit}>
    <input class="min-h-12 rounded-xl border px-4" placeholder="Username" bind:value={name} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Email" bind:value={email} type="email" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Password" bind:value={password} type="password" required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Nomor Lisensi (cth #1294)" bind:value={license_no} required />
    <input class="min-h-12 rounded-xl border px-4" placeholder="Region" bind:value={region} required />
    <div class="grid gap-2 rounded-xl border border-dashed p-3">
      <p class="text-sm font-semibold">Foto Lisensi <span class="font-normal text-slate-500">(opsional, mempercepat verifikasi)</span></p>
      <div class="flex items-center gap-3">
        <LicensePreview src={licensePreview} alt="Pratinjau foto lisensi" initials="" size="sm" />
        <label class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-bold">
          <Upload class="size-4" />
          {busy ? 'Memproses...' : licensePreview ? 'Ganti Foto' : 'Pilih Foto'}
          <input type="file" accept="image/*" class="hidden" on:change={pickLicense} disabled={busy} />
        </label>
      </div>
      {#if licenseNote}<p class="text-xs text-slate-500">{licenseNote}</p>{/if}
    </div>
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if ok}<p class="text-sm text-emerald-700">{ok}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white">Request Account</button>
  </form>
</div>
