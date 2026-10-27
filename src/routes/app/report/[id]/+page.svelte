<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, Share2, CalendarDays, User, ShieldCheck, CheckCircle2, AlertTriangle, Car, Wrench, FileText } from '@lucide/svelte';
  import ScoreRing from '$lib/components/vehicle/ScoreRing.svelte';
  import ScoreBadge from '$lib/components/vehicle/ScoreBadge.svelte';
  import { buildReportPdf } from '$lib/reportPdf';
  import { rupiah, recoLabel } from '$lib/format';
  import { api } from '$lib/api';
  import { shareOrCopy } from '$lib/share';

  type Item = { category: string; item_key: string; item_label: string; condition: string; note?: string | null };
  type Photo = { r2_key: string; taken_at?: string | null; category?: string | null };
  type ReportDetail = {
    vehicle: string;
    inspector: string;
    score_snapshot: number;
    grade_snapshot: string;
    recommendation?: string | null;
    repair_estimate?: number | null;
    summary?: string | null;
    guarantee_until?: string | null;
    published_at?: string | null;
    created_at: string;
    order_status: string;
    items: Item[];
    photos: Photo[];
  };

  // Tanpa fallback ID palsu — REP-3401 tidak pernah ada, dan diam-diam membuka
  // halaman kosong hanya membingungkan.
  $: id = $page.params.id ?? '';
  let live: ReportDetail | null = null;
  /** Laporan tidak ada di database — halaman harus bilang, bukan loading selamanya. */
  let notFound = false;
  /** Error lain (server/network) — masih mungkin dicoba ulang. */
  let loadError = false;
  let loading = false;

  async function load() {
    loading = true;
    notFound = false;
    loadError = false;
    try {
      const r = await api.get<ReportDetail>(`/reports/${encodeURIComponent(id)}`);
      if (r.ok) {
        live = r.data;
        return;
      }
      if (r.error.code === 'NOT_FOUND') notFound = true;
      else loadError = true;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void load();
  });

  $: vehicle = live?.vehicle ?? 'Memuat kendaraan…';
  $: score = live?.score_snapshot ?? 0;
  $: grade = live?.grade_snapshot ?? '—';
  $: inspector = live?.inspector ?? '—';
  $: recommendation = live?.recommendation ?? null;
  $: repairEstimate = live?.repair_estimate ?? 0;
  $: guaranteeUntil = live?.guarantee_until ?? null;
  $: verifiedAt = live?.published_at ?? live?.created_at ?? '';
  $: items = live?.items ?? [];
  $: photos = live?.photos ?? [];

  const CATEGORY_LABEL: Record<string, string> = {
    mesin: 'Mesin & Kelistrikan',
    bodi: 'Bodi & Cat',
    interior: 'Interior & Kaki-kaki'
  };

  // Kelompokkan checklist per kategori, pertahankan urutan kemunculan.
  $: grouped = (() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const key = it.category || 'lainnya';
      const list = map.get(key) ?? [];
      list.push(it);
      map.set(key, list);
    }
    return [...map.entries()];
  })();

  function categoryLabel(key: string): string {
    return CATEGORY_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
  }

  function prettyDate(v: string | null | undefined): string {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  let msg = '';
  async function downloadPdf() {
    msg = 'Membuat PDF (pdf-lib, OSS)...';
    const blob = await buildReportPdf({ reportId: id, vehicle, score, grade, inspector, date: prettyDate(verifiedAt) });
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

  {#if notFound}
    <div class="ts-card grid justify-items-center gap-2 p-10 text-center">
      <FileText class="size-10 text-slate-300" />
      <p class="font-bold">Laporan tidak ditemukan</p>
      <p class="max-w-xs text-[0.8125rem] text-slate-500">
        Laporan <b>{id}</b> belum ada. Laporan terbit setelah inspeksi selesai dan admin menerbitkannya.
      </p>
      <div class="mt-1 flex flex-wrap justify-center gap-2">
        <a href="/app/history" class="btn-navy">Kembali ke Riwayat</a>
        <a href="/app/home" class="btn-outline">Ke Beranda</a>
      </div>
    </div>
  {:else if loadError}
    <div class="ts-card grid justify-items-center gap-2 p-10 text-center">
      <AlertTriangle class="size-10 text-amber-400" />
      <p class="font-bold">Gagal memuat laporan</p>
      <p class="max-w-xs text-[0.8125rem] text-slate-500">Server tidak merespons. Coba lagi sebentar lagi.</p>
      <button class="btn-navy mt-1 disabled:opacity-50" disabled={loading} on:click={() => void load()}>
        {loading ? 'Memuat...' : 'Coba Lagi'}
      </button>
    </div>
  {:else}
  <div class="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
    <div class="grid gap-5">
      <div><span class="pill-doc">OFFICIAL DOCUMENT</span></div>

      <div>
        <h1 class="text-[1.625rem] font-bold tracking-tight">{vehicle}</h1>
        <div class="mt-2 grid gap-1 text-[0.8125rem] text-slate-500">
          <p class="flex items-center gap-2"><CalendarDays class="size-4" /> Verified: {prettyDate(verifiedAt)}</p>
          <p class="flex items-center gap-2">
            <User class="size-4" /> Inspector: {inspector}
            <span class="ml-1 inline-flex items-center gap-1 font-bold text-brand-700"><ShieldCheck class="size-4" /> {grade}</span>
          </p>
        </div>
      </div>

      <ScoreRing {score} />

      {#if photos.length}
        <div>
          <p class="ts-eyebrow">Dokumentasi Inspeksi</p>
          <div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {#each photos as p, i (p.r2_key + i)}
              <div class="relative grid h-32 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#3a4350] to-[#14181e] text-white/70">
                <Car class="size-10" />
                <img
                  src={p.r2_key}
                  alt={`Foto inspeksi ${i + 1}`}
                  class="absolute inset-0 h-full w-full object-cover"
                  on:error={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
                {#if p.category}<span class="pill-solid absolute bottom-2 left-2">{p.category}</span>{/if}
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="grid h-52 place-items-center overflow-hidden rounded-[20px] bg-gradient-to-b from-[#3a4350] to-[#14181e] text-white/90">
          <div class="grid justify-items-center gap-2">
            <Car class="size-20 opacity-90" />
            <p class="text-[0.8125rem] text-white/70">Belum ada foto dokumentasi.</p>
          </div>
        </div>
      {/if}

      {#if live?.summary}
        <div class="ts-card">
          <p class="ts-eyebrow">Ringkasan Inspektor</p>
          <p class="mt-2 text-[0.875rem] leading-relaxed text-slate-600">{live.summary}</p>
        </div>
      {/if}

      {#if grouped.length}
        {#each grouped as [cat, rows] (cat)}
          <div class="ts-card">
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="text-lg font-bold">{categoryLabel(cat)}</h2>
              <p class="text-[0.8125rem] text-slate-400">{rows.filter((r) => r.condition === 'Normal').length}/{rows.length} normal</p>
            </div>
            <p class="ts-eyebrow mt-0.5">Hasil Pemeriksaan</p>
            <ul class="mt-3 grid gap-2">
              {#each rows as r (r.item_key)}
                <li class="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="min-w-0">
                    <p class="text-[0.875rem] font-medium">{r.item_label || r.item_key}</p>
                    {#if r.note}<p class="mt-0.5 text-[0.8125rem] text-slate-500">{r.note}</p>{/if}
                  </div>
                  <span class={r.condition === 'Normal' ? 'pill-green shrink-0' : 'pill-red shrink-0'}>{r.condition || '—'}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      {:else if live}
        <div class="ts-card">
          <p class="ts-eyebrow">Hasil Pemeriksaan</p>
          <p class="mt-2 text-[0.875rem] text-slate-500">Checklist detail belum tersedia untuk laporan ini.</p>
        </div>
      {/if}
    </div>

    <aside class="grid content-start gap-3 lg:sticky lg:top-20">
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Summary</p>
        <div><ScoreBadge {score} grade={grade} {recommendation} /></div>
        <p><b>Skor:</b> {score}/100 • <b>Grade:</b> {grade}</p>
        <p><b>Rekomendasi:</b> {recoLabel(recommendation)}</p>
        {#if repairEstimate}
          <p class="flex items-start gap-1.5"><Wrench class="mt-0.5 size-4 shrink-0 text-slate-400" /> Estimasi perbaikan: <b>{rupiah(repairEstimate)}</b></p>
        {/if}
        {#if guaranteeUntil}
          <p class="flex items-start gap-1.5"><ShieldCheck class="mt-0.5 size-4 shrink-0 text-brand-600" /> Garansi laporan sampai {prettyDate(guaranteeUntil)}.</p>
        {/if}
      </div>

      {#if items.length && items.some((i) => i.condition !== 'Normal')}
        <div class="ts-card grid gap-2 text-sm">
          <p class="flex items-center gap-2 font-bold text-amber-700"><AlertTriangle class="size-4" /> Perlu perhatian</p>
          <p class="text-slate-600">{items.filter((i) => i.condition !== 'Normal').length} item tidak normal — periksa sebelum memutuskan.</p>
        </div>
      {/if}

      {#if msg}<p class="text-sm">{msg}</p>{/if}
      <button class="btn-teal w-full" on:click={downloadPdf}>Download PDF (OSS)</button>
      <a href={`/app/warranty/${id}`} class="btn-outline w-full">Garansi & Komplain</a>
    </aside>
  </div>
  {/if}
</div>
