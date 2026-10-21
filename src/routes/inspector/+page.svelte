<script lang="ts">
  import { onMount } from 'svelte';
  import { CircleUserRound, Clock, FileText, MapPin, Star } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';

  type Job = { id: string; title: string; time: string; loc: string; reportId?: string | null };
  type Profile = { name: string; license_no: string | null; rating: number | null; total_inspections: number | null };

  const seed: Job[] = [
    { id: 'insp-1', title: 'Honda Civic Turbo 2021', time: 'Terjadwal', loc: 'Kalibata, Jakarta Selatan (3.2 km)' },
    { id: 'insp-2', title: 'Toyota Avanza Veloz 2022', time: 'Terjadwal', loc: 'Tebet, Jakarta Selatan (5.1 km)' }
  ];
  let jobs: Job[] = seed;
  let me: Profile | null = null;

  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    // Nama, lisensi, dan rating mengikuti akun yang sedang login — sebelumnya
    // diketik manual dan selalu menampilkan "Budi Santoso".
    const p = await api.get<Profile>(`/inspectors/me?userId=${encodeURIComponent(uid)}`);
    if (p.ok) me = p.data;

    const r = await api.get<{ id: string; vehicle: string; location: string; report_id?: string | null }[]>(
      `/orders/assigned?inspectorId=${encodeURIComponent(uid)}`
    );
    if (r.ok && r.data.length) {
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
  <h2 class="text-lg font-bold sm:col-span-full">Tugas Inspeksi ({jobs.length})</h2>
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
</div>
