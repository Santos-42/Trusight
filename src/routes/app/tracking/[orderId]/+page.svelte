<script lang="ts">
  import { page } from '$app/stores';
  $: orderId = $page.params.orderId;
</script>
<svelte:head><title>Live Tracking — TruSight</title></svelte:head>
<div class="grid gap-4 lg:grid-cols-2">
  <h1 class="text-xl font-extrabold lg:col-span-2">LIVE VERIFICATION • {orderId}</h1>
  <div class="rounded-2xl border bg-white p-5">
    <p class="font-bold text-sm">Firman Comstir • SENIOR TECHNICAL AUDITOR • 4.9 (242)</p>
    <p class="text-xs text-slate-500">Expert in German high-performance diagnostics. Certified ADAC & Porsche Classic.</p>
    <div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full w-2/3 bg-brand-600"></div></div>
    <p class="mt-2 text-xs">Body & Chassis Structural Audit • VERIFIED • Engine Diagnostics • IN PROGRESS</p>
  </div>
  <a href="/app/report/REP-3401" class="min-h-12 inline-flex items-center justify-center rounded-2xl bg-brand-600 font-bold text-white lg:col-span-2">Lihat Laporan Sementara</a>
</div>
