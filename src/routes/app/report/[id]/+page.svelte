<script lang="ts">
  import ScoreBadge from '$lib/components/vehicle/ScoreBadge.svelte';
  import { page } from '$app/stores';
  $: id = $page.params.id;
</script>
<svelte:head><title>Report {id} — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="rounded-3xl bg-white border p-6">
    <p class="text-xs tracking-widest text-slate-400">VERIFICATION REPORT • OFFICIAL DOCUMENT</p>
    <h1 class="text-xl font-extrabold">Porsche 911 Carrera S, 2022 • Verified Oct 24, 2023</h1>
    <p class="text-sm text-slate-500">Inspector: Firman Comstir • PASSED • Report {id}</p>
    <div class="mt-3"><ScoreBadge score={94} grade="A" recommendation="beli" /></div>
    <ul class="mt-4 text-sm text-slate-600 grid gap-1">
      <li>• Exterior & Paint: thickness consistent with factory</li>
      <li>• Engine: compression within 2% across cylinders</li>
      <li>• Estimasi perbaikan: Rp 2.000.000 (kampas rem aus)</li>
      <li>• Garansi mesin 30 hari • TTD digital terlampir</li>
    </ul>
    <div class="mt-4 flex flex-col sm:flex-row gap-2">
      <button class="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">Download PDF</button>
      <a href="/app/history" class="min-h-11 inline-flex items-center justify-center rounded-xl border px-4 text-sm font-bold">Kembali ke History</a>
    </div>
  </div>
</div>
