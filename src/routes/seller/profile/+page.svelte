<script lang="ts">
  import { Building2, ChevronLeft, ChevronRight, Landmark, ScrollText, Star } from '@lucide/svelte';
  const rows = [
    { icon: Building2, label: 'Informasi Kontak & Showroom' },
    { icon: Landmark, label: 'Rekening Bank & Penarikan' },
    { icon: ScrollText, label: 'Syarat & Ketentuan' }
  ];
</script>
<svelte:head><title>Profil Penjual — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center justify-between">
    <a href="/seller" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-lg font-bold">Profil Penjual</h1>
    <span class="w-9"></span>
  </div>
  <div class="ts-card grid justify-items-center gap-1 py-6 text-center">
    <span class="grid size-16 place-items-center rounded-full bg-ink-900 text-xl font-bold text-white">HW</span>
    <p class="mt-1 text-lg font-bold">Hendra Wijaya</p>
    <p class="flex items-center gap-1 text-[13px] text-slate-500"><Star class="size-3.5 fill-gold-400 text-gold-400" /> 4.8/5.0 Rating Penjual</p>
  </div>
  <div class="ts-card divide-y divide-slate-100 !p-0">
    {#each rows as r}
      <button class="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold">
        <svelte:component this={r.icon} class="size-5 text-slate-400" />
        <span class="flex-1">{r.label}</span>
        <ChevronRight class="size-4 text-slate-300" />
      </button>
    {/each}
  </div>
</div>
