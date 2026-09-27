<script lang="ts">
  import { ShieldCheck, MapPin, Camera, FileCheck, Star, ArrowRight, BadgeCheck } from '@lucide/svelte';
  import { PRICING, rupiah as fmtRp } from '$lib/format';
  import { rupiah } from '$lib/format';
  import { PRICING as P } from '$lib/config';
</script>

<svelte:head>
  <title>TruSight — Transparency You Can Trust</title>
</svelte:head>

<section class="mx-auto max-w-7xl">
  <div class="grid gap-8 lg:grid-cols-[1.1fr_.9fr] items-center py-10 lg:py-16">
    <div>
      <p class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
        <ShieldCheck class="size-4" /> Inspektor Independen • Jabodetabek
      </p>
      <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
        Beli mobil bekas tanpa <span class="text-brand-600">takut ditipu.</span>
      </h1>
      <p class="mt-4 text-base sm:text-lg text-slate-600 max-w-xl">
        Jasa pengecekan mobil second oleh verifikator bersertifikat. Kami cek 150+ titik langsung di lokasi penjual — cocokkan iklan vs kondisi nyata, kasih skor risiko, estimasi perbaikan, dan rekomendasi <b>BELI / NEGO / HINDARI</b>.
      </p>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="/register" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">
          Mulai Verifikasi <ArrowRight class="size-4" />
        </a>
        <a href="/app/search" class="inline-flex min-h-12 items-center justify-center rounded-2xl border px-6 font-semibold text-slate-700 hover:bg-slate-100">
          Lihat Mobil Terverifikasi
        </a>
        <a href="/login" class="inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-slate-500">Continue as guest →</a>
      </div>
      <dl class="mt-8 grid grid-cols-3 gap-3 max-w-md text-center">
        <div class="rounded-2xl bg-white p-3 border"><dt class="text-2xl font-extrabold">150+</dt><dd class="text-xs text-slate-500">titik inspeksi</dd></div>
        <div class="rounded-2xl bg-white p-3 border"><dt class="text-2xl font-extrabold">30<span class="text-sm">hr</span></dt><dd class="text-xs text-slate-500">garansi mesin</dd></div>
        <div class="rounded-2xl bg-white p-3 border"><dt class="text-2xl font-extrabold">Jabodetabek</dt><dd class="text-xs text-slate-500">fokus awal</dd></div>
      </dl>
    </div>
    <div class="rounded-3xl border bg-white p-5 shadow-sm">
      <p class="flex items-center gap-2 font-bold"><BadgeCheck class="size-5 text-emerald-600" /> Contoh Laporan Terverifikasi</p>
      <div class="mt-3 overflow-hidden rounded-2xl bg-slate-900 text-white p-5">
        <p class="text-xs text-slate-300">TRUSIGHT VERIFIED • 911 Carrera 2022 • 12.400 miles</p>
        <p class="mt-2 text-4xl font-extrabold">94 <span class="text-sm font-medium text-slate-300">/ 100 • Grade A</span></p>
        <p class="mt-2 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold">VERIFICATION PASSED • 150 POINT</p>
        <p class="mt-3 text-sm text-slate-300">Rp 4,75 M • Jakarta Utara • Manual • Bensin</p>
      </div>
      <ul class="mt-4 grid gap-2 text-sm text-slate-600">
        <li class="flex gap-2"><MapPin class="size-4 mt-0.5 text-brand-600" /> Cek langsung di lokasi penjual + GPS lock 50m</li>
        <li class="flex gap-2"><Camera class="size-4 mt-0.5 text-brand-600" /> Foto live timestamp + geotag anti-galeri</li>
        <li class="flex gap-2"><FileCheck class="size-4 mt-0.5 text-brand-600" /> PDF resmi + TTD digital inspektor</li>
        <li class="flex gap-2"><Star class="size-4 mt-0.5 text-brand-600" /> Naikkan harga jual hingga 15% dengan lencana emas</li>
      </ul>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-slate-50 p-3 border text-center"><p class="text-xs text-slate-500">Standard</p><p class="font-extrabold">{rupiah(P.standard)}</p></div>
        <div class="rounded-2xl bg-brand-600 p-3 text-center text-white"><p class="text-xs text-brand-100">Fast-Track</p><p class="font-extrabold">{rupiah(P['fast-track'])}</p></div>
      </div>
    </div>
  </div>

  <div class="grid sm:grid-cols-3 gap-3 pb-10">
    <div class="rounded-2xl bg-white border p-5"><p class="font-bold">1. Ajukan</p><p class="text-sm text-slate-600 mt-1">Pilih mobil / masukkan link iklan OLX, pilih jadwal. Untuk buyer awam mekanikal yang sibuk.</p></div>
    <div class="rounded-2xl bg-white border p-5"><p class="font-bold">2. Diverifikasi</p><p class="text-sm text-slate-600 mt-1">Inspektor datang, foto live, cek mesin/bodi/interior/surat. Skor + estimasi keluar.</p></div>
    <div class="rounded-2xl bg-white border p-5"><p class="font-bold">3. Putuskan</p><p class="text-sm text-slate-600 mt-1">Terima rekomendasi BELI / NEGO / HINDARI + garansi 30 hari. Hemat transport & anti-tipu.</p></div>
  </div>
</section>
