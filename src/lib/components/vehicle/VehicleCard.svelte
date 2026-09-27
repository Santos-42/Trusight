<script lang="ts">
  import { BadgeCheck, Car } from '@lucide/svelte';
  import { rupiah } from '$lib/format';
  export let v: { id: string; title: string; price: number; location: string; score: number | null };
</script>
<a href={`/app/vehicle/${v.id}`} class="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(28,35,43,0.08)]">
  <div class="relative grid h-44 place-items-center bg-gradient-to-b from-[#3a4350] to-[#14181e] text-white/90">
    <Car class="size-24 opacity-90" />
    <span class="pill-solid absolute left-3 top-3"><BadgeCheck class="size-3.5" /> TRUSIGHT VERIFIED</span>
    <span class="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold">OLX</span>
  </div>
  <div class="flex items-center justify-between px-4 py-3.5">
    <p class="text-[16px] font-bold">{v.title}</p>
    <p class="text-[16px] font-bold text-brand-600">{rupiah(v.price)}</p>
  </div>
</a>
