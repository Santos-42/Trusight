<script lang="ts">
  import { BadgeCheck, Car } from '@lucide/svelte';
  import { rupiah } from '$lib/format';
  export let v: { id: string; title: string; price: number; location: string; score: number | null; cover?: string };
</script>
<a href={`/app/vehicle/${v.id}`} class="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(28,35,43,0.08)]">
  <div class="relative h-44 overflow-hidden bg-gradient-to-b from-[#3a4350] to-[#14181e] text-white/90">
    {#if v.cover}
      <img src={v.cover} alt={v.title} class="h-full w-full object-cover" loading="lazy" />
      <span class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></span>
    {:else}
      <span class="grid h-full place-items-center"><Car class="size-24 opacity-90" /></span>
    {/if}
    <span class="pill-solid absolute left-3 top-3"><BadgeCheck class="size-3.5" /> TRUSIGHT VERIFIED</span>
    <span class="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold">OLX</span>
  </div>
  <div class="flex items-center justify-between gap-2 px-4 py-3.5 lg:grid lg:gap-1 lg:py-4">
    <p class="text-[16px] font-bold lg:line-clamp-2 lg:min-h-[3rem]">{v.title}</p>
    <p class="text-[16px] font-bold text-brand-600 lg:text-lg">{rupiah(v.price)}</p>
  </div>
</a>
