<script lang="ts">
  import ScoreBadge from '$lib/components/vehicle/ScoreBadge.svelte';
  import { page } from '$app/stores';
  import { buildReportPdf } from '$lib/reportPdf';
  import { shareOrCopy } from '$lib/share';
  $: id = $page.params.id;
  let msg = '';

  async function downloadPdf() {
    msg = 'Membuat PDF (pdf-lib, OSS)...';
    const blob = await buildReportPdf({
      reportId: id, vehicle: 'Porsche 911 Carrera S 2022',
      score: 94, grade: 'A', inspector: 'Firman Comstir', date: '24 Okt 2023'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.pdf`;
    a.click();
    msg = 'PDF mockup terunduh.';
  }

  async function share() {
    msg = await shareOrCopy({
      title: 'TruSight Certified', text: 'Lihat laporan verifikasi TruSight:',
      url: `${location.origin}/app/report/${id}`
    }) === 'shared' ? 'Dibagikan.' : 'Tautan disalin — tempel ke OLX.';
  }
</script>
<svelte:head><title>Report {id} — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="rounded-3xl bg-white border p-6">
    <p class="text-xs tracking-widest text-slate-400">VERIFICATION REPORT • MOCKUP FASE 4</p>
    <h1 class="text-xl font-extrabold">Porsche 911 Carrera S, 2022 • Verified Oct 24, 2023</h1>
    <p class="text-sm text-slate-500">Inspector: Firman Comstir • PASSED • Report {id}</p>
    <div class="mt-3"><ScoreBadge score={94} grade="A" recommendation="beli" /></div>
    <ul class="mt-4 text-sm text-slate-600 grid gap-1">
      <li>• Exterior & Paint: thickness consistent with factory</li>
      <li>• Engine: compression within 2% across cylinders</li>
      <li>• Estimasi perbaikan: Rp 2.000.000 (kampas rem aus)</li>
      <li>• Garansi mesin 30 hari • TTD digital terlampir (mockup)</li>
    </ul>
    {#if msg}<p class="mt-2 text-sm">{msg}</p>{/if}
    <div class="mt-4 flex flex-col sm:flex-row gap-2">
      <button class="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white" on:click={downloadPdf}>Download PDF (OSS)</button>
      <button class="min-h-11 rounded-xl border px-4 text-sm font-bold" on:click={share}>Bagikan / Salin Tautan</button>
      <a href={`/app/warranty/${id}`} class="min-h-11 inline-flex items-center justify-center rounded-xl border px-4 text-sm font-bold">Garansi & Komplain</a>
      <a href="/app/history" class="min-h-11 inline-flex items-center justify-center rounded-xl border px-4 text-sm font-bold">Kembali</a>
    </div>
  </div>
</div>
