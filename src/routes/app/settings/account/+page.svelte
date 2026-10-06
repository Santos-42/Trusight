<script lang="ts">
  import { ChevronLeft, ShieldCheck, CircleUserRound } from '@lucide/svelte';
  import { authed, getSession } from '$lib/guest';
  const s = getSession();
  const rows = [
    { k: 'Nama', v: s?.name ?? 'Tamu' },
    { k: 'User ID', v: s?.id ?? '—' },
    { k: 'Email', v: s?.email ?? '—' },
    { k: 'Telepon', v: '+62 856-1908-7645' },
    { k: 'Trust score', v: '98% • Protection level: HIGH' },
    { k: 'Status', v: 'Terverifikasi' }
  ];
</script>
<svelte:head><title>Detail Akun — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 lg:max-w-2xl">
  <div class="ts-appbar-flush">
    <a href="/app/settings" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Detail Akun</p>
  </div>
  {#if $authed}
    <div class="ts-card flex items-center gap-4">
      <CircleUserRound class="size-14 shrink-0 text-slate-300" />
      <div>
        <p class="text-lg font-extrabold">{s?.name}</p>
        <p class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><ShieldCheck class="size-4" /> Akun terverifikasi</p>
      </div>
    </div>
    <div class="ts-card divide-y divide-slate-100 !p-0">
      {#each rows as r}
        <div class="flex items-center justify-between gap-3 p-4 text-sm">
          <span class="text-slate-400">{r.k}</span>
          <span class="text-right font-bold">{r.v}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="ts-card text-center">
      <p class="font-bold">Harus login dulu</p>
      <a href="/login" class="btn-blue mt-3 inline-flex">Masuk</a>
    </div>
  {/if}
</div>
