<script lang="ts">
  import { CircleUserRound, Clock, MapPin, Star } from '@lucide/svelte';
  const jobs = [
    { id: 'insp-1', title: 'Honda Civic Turbo 2021', time: '14:00 - 15:30 WIB', loc: 'Kalibata, Jakarta Selatan (3.2 km)' },
    { id: 'insp-2', title: 'Toyota Avanza Veloz 2022', time: '16:00 - 17:30 WIB', loc: 'Tebet, Jakarta Selatan (5.1 km)' }
  ];
</script>
<svelte:head><title>Inspector — TruSight</title></svelte:head>
<div class="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <div class="flex items-start justify-between sm:col-span-full">
    <div>
      <p class="text-sm text-slate-500">Selamat Tugas,</p>
      <h1 class="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-tight"><CircleUserRound class="size-12 shrink-0 text-slate-300" /> Budi Santoso (ID #1294)</h1>
    </div>
    <span class="pill-navy"><Star class="size-4 fill-gold-400 text-gold-400" /> 4.9 (Pro)</span>
  </div>
  <h2 class="text-lg font-bold sm:col-span-full">Tugas Inspeksi Hari Ini (2)</h2>
  {#each jobs as j}
    <div class="ts-card grid gap-2">
      <div class="flex items-start justify-between gap-2">
        <p class="font-bold">{j.title}</p>
        <span class="pill-amber shrink-0">Terjadwal</span>
      </div>
      <p class="flex items-center gap-2 text-[13px] text-slate-500"><Clock class="size-4" /> {j.time}</p>
      <p class="flex items-center gap-2 text-[13px] text-slate-500"><MapPin class="size-4" /> {j.loc}</p>
      <a href={`/inspector/task/${j.id}`} class="btn-blue mt-1 w-full">Mulai Tugas Navigasi</a>
    </div>
  {/each}
</div>
