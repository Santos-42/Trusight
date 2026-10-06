<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, Share2, CalendarDays, User, ShieldCheck, CheckCircle2, Car } from '@lucide/svelte';
  import ScoreRing from '$lib/components/vehicle/ScoreRing.svelte';
  import { buildReportPdf } from '$lib/reportPdf';
  import { rupiah } from '$lib/format';
  import { api } from '$lib/api';
  import { shareOrCopy } from '$lib/share';
  $: id = $page.params.id ?? 'REP-3401';
  type Live = { vehicle: string; inspector: string; score_snapshot: number; grade_snapshot: string; published: number; created_at: string; order_status: string };
  let live: Live | null = null;
  onMount(async () => {
    if (!id || id === 'REP-3401') return;
    const r = await api.get<Live>(`/reports/${encodeURIComponent(id)}`);
    if (r.ok) live = r.data;
  });
  $: vehicle = live?.vehicle ?? 'Porsche 911 Carrera S 2022';
  $: score = live?.score_snapshot ?? 94;
  $: grade = live?.grade_snapshot ?? 'A';
  $: inspector = live?.inspector ?? 'Firman Comstir';
  let msg = '';
  async function downloadPdf() {
    msg = 'Membuat PDF (pdf-lib, OSS)...';
    const blob = await buildReportPdf({ reportId: id, vehicle, score, grade, inspector, date: '24 Okt 2023' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.pdf`;
    a.click();
    msg = 'PDF terunduh.';
  }
  async function share() {
    msg = (await shareOrCopy({ title: 'TruSight Certified', text: 'Lihat laporan verifikasi TruSight:', url: `${location.origin}/app/report/${id}` })) === 'shared' ? 'Dibagikan.' : 'Tautan disalin — tempel ke OLX.';
  }
</script>
<svelte:head><title>Report {id} — TruSight</title></svelte:head>
<div class="grid gap-5 pb-8">
  <div class="ts-appbar-flush">
    <a href="/app/history" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title flex-1">Verification Report</p>
    <button class="ts-back" on:click={share} aria-label="Bagikan"><Share2 class="size-5" /></button>
  </div>
  <div class="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
    <div class="grid gap-5">
      <div><span class="pill-doc">OFFICIAL DOCUMENT</span></div>
      <div>
        <h1 class="text-[26px] font-bold tracking-tight">{vehicle}</h1>
        <div class="mt-2 grid gap-1 text-[13px] text-slate-500">
          <p class="flex items-center gap-2"><CalendarDays class="size-4" /> Verified: Oct 24, 2023</p>
          <p class="flex items-center gap-2"><User class="size-4" /> Inspector: {inspector} <span class="ml-1 inline-flex items-center gap-1 font-bold text-brand-700"><ShieldCheck class="size-4" /> PASSED</span></p>
        </div>
      </div>
      <ScoreRing {score} />
      <div class="grid h-52 place-items-center overflow-hidden rounded-[20px] bg-gradient-to-b from-[#3a4350] to-[#14181e] text-white/90"><Car class="size-28" /></div>
      <div class="ts-card">
        <div class="flex items-baseline justify-between">
          <h2 class="text-lg font-bold">Exterior & Paint</h2>
          <p class="text-xl font-extrabold"><span class="text-brand-600">92</span><span class="text-sm text-slate-400">/100</span></p>
        </div>
        <p class="ts-eyebrow mt-0.5">Visual Inspection</p>
        <ul class="mt-3 grid gap-3 text-[14px] text-slate-600 lg:grid-cols-3">
          <li class="flex gap-2"><CheckCircle2 class="mt-0.5 size-5 shrink-0 text-brand-600" /> Paint thickness measurements consistent with factory standards across all panels.</li>
          <li class="flex gap-2"><CheckCircle2 class="mt-0.5 size-5 shrink-0 text-brand-600" /> Panel gaps are within 0.5mm of manufacturing tolerance.</li>
          <li class="flex gap-2"><CheckCircle2 class="mt-0.5 size-5 shrink-0 text-brand-600" /> Estimasi perbaikan: Rp 2.000.000 (kampas rem aus) • Garansi 30 hari.</li>
        </ul>
      </div>
    </div>
    <aside class="grid content-start gap-3 lg:sticky lg:top-20">
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Summary</p>
        <p><b>Skor:</b> {score}/100 • <b>Grade:</b> {grade}</p>
        <p><b>Rekomendasi:</b> Beli dengan negosiasi ringan</p>
        <p class="text-slate-500">Garansi mesin & transmisi 30 hari.</p>
      </div>
      {#if msg}<p class="text-sm">{msg}</p>{/if}
      <button class="btn-teal w-full" on:click={downloadPdf}>Download PDF (OSS)</button>
      <a href={`/app/warranty/${id}`} class="btn-outline w-full">Garansi & Komplain</a>
    </aside>
  </div>
</div>
