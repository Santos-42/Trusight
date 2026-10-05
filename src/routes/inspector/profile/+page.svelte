<script lang="ts">
  import { ChevronLeft, LogOut, ShieldCheck, Star } from '@lucide/svelte';
  import { clearSession } from '$lib/guest';
  function logout() {
    clearSession();
    location.href = '/';
  }
</script>
<svelte:head><title>Profil & Sertifikat — Inspector</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center justify-between">
    <a href="/inspector" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-lg font-bold">Profil &amp; Sertifikat</h1>
    <span class="w-9"></span>
  </div>
  <div class="ts-card grid justify-items-center gap-1 py-6 text-center">
    <span class="grid size-16 place-items-center rounded-full bg-ink-900 text-xl font-bold text-white">BS</span>
    <p class="mt-1 text-lg font-bold">Budi Santoso</p>
    <p class="text-[13px] text-slate-500">Lisensi Utama #1294</p>
    <span class="pill-doc mt-1">GPS Verified</span>
  </div>
  <div class="ts-card grid grid-cols-2 divide-x divide-slate-100 py-4 text-center">
    <div>
      <p class="flex items-center justify-center gap-1 text-lg font-bold"><Star class="size-4 fill-gold-400 text-gold-400" /> 4.9</p>
      <p class="text-xs text-slate-500">Rating Kerja</p>
    </div>
    <div>
      <p class="text-lg font-bold">420+</p>
      <p class="text-xs text-slate-500">Total Inspeksi</p>
    </div>
  </div>
  <div class="grid gap-2 rounded-2xl bg-gold-50 p-5 text-center ring-1 ring-gold-200">
    <ShieldCheck class="mx-auto size-8 text-ink-900" />
    <p class="font-bold text-ink-900">Lisensi Keahlian Verifikator</p>
    <p class="text-[13px] leading-relaxed text-slate-600">Lisensi ini menyatakan bahwa pemilik terdaftar secara sah sebagai pemeriksa klinis mesin, chassis, dan kelistrikan mobil bekas oleh TruSight.</p>
  </div>
  <button class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700" on:click={logout}><LogOut class="size-4" /> Logout</button>
</div>
