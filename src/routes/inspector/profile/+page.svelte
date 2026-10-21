<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronRight, Landmark, LogOut, ShieldCheck, Star, Upload } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { clearSession, getSession } from '$lib/guest';
  import { compressImage } from '$lib/upload';
  import LicensePreview from '$lib/components/license/LicensePreview.svelte';
  import FontSizePicker from '$lib/components/settings/FontSizePicker.svelte';

  type Profile = {
    id: string;
    name: string;
    email: string;
    license_no: string | null;
    rating: number | null;
    total_inspections: number | null;
    region: string | null;
  };
  let profile: Profile | null = null;

  const LICENSE_KEY = 'trusight_license_img';
  let licenseSrc: string | null = null;
  let licenseStatus = '';
  let busy = false;

  // Lisensi yang sudah disediakan di static/licenses/lic-<nomor>.jpg langsung dipakai
  // — jadi tidak perlu diunggah ulang.
  $: licenseFile = profile?.license_no ? `/licenses/lic-${profile.license_no.replace(/\D/g, '')}.jpg` : '';
  $: licensePreview = licenseSrc || licenseFile;
  $: initials = (profile?.name ?? '??')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  onMount(async () => {
    try {
      licenseSrc = localStorage.getItem(LICENSE_KEY);
    } catch {
      /* storage terblokir — abaikan */
    }
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<Profile>(`/inspectors/me?userId=${encodeURIComponent(uid)}`);
    if (r.ok) profile = r.data;
  });

  async function pickLicense(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      licenseStatus = 'File harus berupa gambar.';
      return;
    }
    busy = true;
    licenseStatus = 'Mengompres gambar...';
    try {
      const small = await compressImage(file, 700);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error('Gagal membaca file'));
        r.readAsDataURL(small);
      });
      licenseSrc = dataUrl;
      licenseStatus = `${file.name} • ${(small.size / 1024).toFixed(0)} KB — preview lokal, belum tersimpan di server.`;
      try {
        localStorage.setItem(LICENSE_KEY, dataUrl);
      } catch {
        licenseStatus += ' (terlalu besar untuk penyimpanan lokal)';
      }
    } catch (err) {
      licenseStatus = err instanceof Error ? err.message : 'Gagal memproses gambar.';
    } finally {
      busy = false;
    }
  }

  function logout() {
    clearSession();
    location.href = '/';
  }
</script>
<svelte:head><title>Profil & Sertifikat — Inspector</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center justify-center">
    <h1 class="text-lg font-bold">Profil &amp; Sertifikat</h1>
  </div>
  <div class="ts-card grid justify-items-center gap-1 py-6 text-center">
    {#if licensePreview}
      <img src={licensePreview} alt="Lisensi {profile?.license_no ?? ''}" class="max-h-44 w-auto max-w-[85%] rounded-xl border border-slate-200 object-contain" />
    {:else}
      <span class="grid size-16 place-items-center rounded-full bg-ink-900 text-xl font-bold text-white">{initials}</span>
    {/if}
    <p class="mt-1 text-lg font-bold">{profile?.name ?? '—'}</p>
    <p class="text-[0.8125rem] text-slate-500">Lisensi Utama {profile?.license_no ?? '—'}</p>
    <span class="pill-doc mt-1">GPS Verified</span>
  </div>
  <div class="ts-card grid grid-cols-2 divide-x divide-slate-100 py-4 text-center">
    <div>
      <p class="flex items-center justify-center gap-1 text-lg font-bold"><Star class="size-4 fill-gold-400 text-gold-400" /> {profile?.rating ?? '—'}</p>
      <p class="text-xs text-slate-500">Rating Kerja</p>
    </div>
    <div>
      <p class="text-lg font-bold">{profile?.total_inspections ?? '—'}</p>
      <p class="text-xs text-slate-500">Total Inspeksi</p>
    </div>
  </div>
  <div class="grid gap-3 rounded-2xl bg-gold-50 p-5 text-center ring-1 ring-gold-200">
    <ShieldCheck class="mx-auto size-8 text-ink-900" />
    <p class="font-bold text-ink-900">Lisensi Keahlian Verifikator</p>
    <p class="text-[0.8125rem] leading-relaxed text-slate-600">Lisensi ini menyatakan bahwa pemilik terdaftar secara sah sebagai pemeriksa klinis mesin, chassis, dan kelistrikan mobil bekas oleh TruSight.</p>
    <div class="mx-auto w-full max-w-xs">
      <LicensePreview src={licensePreview} alt="Lisensi Keahlian Verifikator" {initials} size="md" />
    </div>
    <label class="mx-auto inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-gold-200 bg-white px-4 text-sm font-bold text-ink-900">
      <Upload class="size-4" />
      {busy ? 'Memproses...' : licensePreview ? 'Ganti Foto Lisensi' : 'Unggah Foto Lisensi'}
      <input type="file" accept="image/*" class="hidden" on:change={pickLicense} disabled={busy} />
    </label>
    {#if licenseStatus}<p class="text-[0.75rem] text-slate-600">{licenseStatus}</p>{/if}
  </div>
  <a href="/inspector/withdraw" class="ts-card flex items-center gap-3 p-4 text-left text-sm font-semibold">
    <Landmark class="size-5 text-slate-400" />
    <span class="flex-1">Rekening &amp; Penarikan Dana</span>
    <ChevronRight class="size-4 text-slate-300" />
  </a>
  <FontSizePicker />
  <button class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700" on:click={logout}><LogOut class="size-4" /> Logout</button>
</div>
