<script lang="ts">
  import { page } from '$app/stores';
  import { Check, Zap, Car, RotateCw, FileText } from '@lucide/svelte';
  $: orderId = $page.params.orderId ?? 'TS-98211';
</script>
<svelte:head><title>Payment Success — TruSight</title></svelte:head>
<div class="grid gap-5 pb-8">
  <p class="ts-appbar-title text-center lg:col-span-2">Payment Success</p>
  <h1 class="text-center text-[30px] font-extrabold tracking-tight lg:col-span-2">Verification Ordered</h1>
  <div class="grid items-start gap-5 lg:grid-cols-2">
    <div class="grid content-start gap-5">
      <div class="mx-auto grid size-24 place-items-center rounded-full bg-white shadow-sm">
        <span class="grid size-14 place-items-center rounded-full bg-[#34c759] text-white"><Check class="size-8" /></span>
      </div>
      <p class="text-center text-[15px] text-slate-500">Your verification request for the <b class="text-ink-900">2022 Porsche 911 Carrera S</b> has been received.</p>
      <div class="ts-card grid gap-4">
        <div><p class="ts-eyebrow">Order ID</p><p class="mt-0.5 font-bold">{orderId}</p></div>
        <div><p class="ts-eyebrow">Date</p><p class="mt-0.5 font-bold">Oct 24, 2023</p></div>
        <div><p class="ts-eyebrow">Service Type</p><p class="mt-0.5 flex items-center gap-1.5 font-bold"><Zap class="size-4 text-brand-600" /> Fast Track</p></div>
        <div class="flex gap-3">
          <span class="grid size-16 shrink-0 place-items-center rounded-xl bg-ink-900 text-white"><Car class="size-8" /></span>
          <div class="text-[13px]">
            <p class="ts-eyebrow">Target Vehicle</p>
            <p class="font-bold">Porsche 911 Carrera S (992)</p>
            <p class="text-slate-400">VIN: WP0AA2A92PSXXXXXX</p>
          </div>
        </div>
      </div>
    </div>
    <div class="grid content-start gap-4">
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Langkah berikutnya</p>
        <p class="flex gap-2"><FileText class="mt-0.5 size-4 shrink-0 text-brand-600" /> Inspektur tersertifikasi dijadwalkan ≤ 1×24 jam dan kamu bisa pantau progres live.</p>
        <p class="flex gap-2"><RotateCw class="mt-0.5 size-4 shrink-0 text-brand-600" /> Laporan resmi + skor + garansi 30 hari terbit otomatis setelah inspeksi.</p>
      </div>
      <a href={`/app/tracking/${orderId}`} class="btn-teal w-full gap-2">VIEW PROGRESS <RotateCw class="size-4" /></a>
      <a href="/app/history" class="btn-outline w-full">Lihat Riwayat</a>
    </div>
  </div>
</div>
