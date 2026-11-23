<script lang="ts">
  import { onMount } from 'svelte';
  import { CircleUserRound, Clock, FileText, MapPin, Star } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';

  type Job = { id: string; title: string; time: string; loc: string; reportId?: string | null };
  type Profile = { name: string; license_no: string | null; rating: number | null; total_inspections: number | null };

  let jobs: Job[] = [];
  let loading = true;
  let me: Profile | null = null;

  onMount(async () => {
    loading = true;
    const uid = getSession()?.id;
    if (!uid) {
      loading = false;
      return;
    }
    // Nama, lisensi, dan rating mengikuti akun yang sedang login
    const p = await api.get<Profile>(`/inspectors/me?userId=${encodeURIComponent(uid)}`);
    if (p.ok) me = p.data;

    const r = await api.get<{ id: string; vehicle: string; location: string; report_id?: string | null }[]>(
      `/orders/assigned?inspectorId=${encodeURIComponent(uid)}`
    );
    loading = false;
    if (r.ok) {
      jobs = r.data.map((o) => ({
        id: o.id,
        title: o.vehicle,
        time: o.report_id ? 'Dokumen telah terbit' : 'Terjadwal',
        loc: o.location ?? '',
        reportId: o.report_id ?? null
      }));
    }
  });
</script>
<svelte:head><title>Inspector — TruSight</title></svelte:head>
<div class="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <div class="flex items-start justify-between sm:col-span-full">
    <div>
      <p class="text-sm text-slate-500">Selamat Tugas,</p>
      <h1 class="flex items-center gap-3 text-[1.625rem] font-bold leading-tight tracking-tight">
        <CircleUserRound class="size-12 shrink-0 text-slate-300" />
        {me?.name ?? '—'}{me?.license_no ? ` (ID ${me.license_no.replace('#', '')})` : ''}
      </h1>
    </div>
    <span class="pill-navy"><Star class="size-4 fill-gold-400 text-gold-400" /> {me?.rating ?? '—'} (Pro)</span>
  </div>
  <h2 class="text-lg font-bold sm:col-span-full">Tugas Inspeksi ({loading ? '…' : jobs.length})</h2>
  {#if loading}
    <div class="sm:col-span-full ts-card py-10 text-center text-slate-400">
      <div class="inline-block size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2"></div>
      <p class="text-xs">Memuat tugas inspeksi…</p>
    </div>
  {:else if !jobs.length}
    <div class="sm:col-span-full ts-card py-10 text-center">
      <p class="font-bold text-slate-700">Belum Ada Tugas Inspeksi</p>
      <p class="mt-1 text-xs text-slate-400">Order baru yang ditugaskan ke Anda akan muncul di sini.</p>
    </div>
  {:else}
    {#each jobs as j}
      <div class="ts-card grid gap-2">
        <div class="flex items-start justify-between gap-2">
          <p class="font-bold">{j.title}</p>
          <span class={j.reportId ? 'pill-green shrink-0' : 'pill-amber shrink-0'}>{j.reportId ? 'Dokumen Terbit' : 'Terjadwal'}</span>
        </div>
        <p class="flex items-center gap-2 text-[0.8125rem] text-slate-500"><Clock class="size-4" /> {j.time}</p>
        <p class="flex items-center gap-2 text-[0.8125rem] text-slate-500"><MapPin class="size-4" /> {j.loc}</p>
        {#if j.reportId}
          <a href={`/app/report/${j.reportId}`} class="btn-blue mt-1 w-full"><FileText class="size-4" /> Lihat Dokumen</a>
        {:else}
          <a href={`/inspector/task/${j.id}`} class="btn-blue mt-1 w-full">Mulai Tugas Navigasi</a>
        {/if}
      </div>
    {/each}
  {/if}
</div>
