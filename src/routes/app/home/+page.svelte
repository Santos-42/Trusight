<script lang="ts">
  import { Bell, SlidersHorizontal, Car } from '@lucide/svelte';
  import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
  import { mockVehicles } from '$lib/mocks';
</script>
<svelte:head><title>Home — TruSight</title></svelte:head>
<div class="grid gap-5">
  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-[24px] font-bold leading-snug tracking-tight">Verified Precision, <span class="text-brand-600">Clinical Standards.</span></h1>
      <p class="mt-1 text-[13px] text-slate-500">Every vehicle in our network undergoes a 150-point surgical verification process.</p>
    </div>
    <a href="/app/inbox" class="ts-back relative shrink-0" aria-label="Notifikasi"><Bell class="size-5" /><span class="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white">3</span></a>
  </div>
  <div class="flex justify-end"><a href="/app/vouchers" class="text-xs font-bold tracking-widest text-brand-600">VIEW ALL</a></div>

  <div class="flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
    <div class="relative min-w-[260px] snap-start overflow-hidden rounded-[20px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-5 text-white md:min-w-0">
      <Car class="absolute -right-6 -top-6 size-36 opacity-20" />
      <p class="text-[11px] font-bold tracking-[0.18em]">SUMMER OFFER</p>
      <p class="mt-2 text-[22px] font-bold leading-tight">20% Off Verification</p>
      <p class="mt-1 text-[13px] text-white/85">Full surgical inspection for your next purchase.</p>
    </div>
    <div class="relative min-w-[260px] snap-start overflow-hidden rounded-[20px] bg-gradient-to-br from-ink-800 to-ink-900 p-5 text-white md:min-w-0">
      <Car class="absolute -right-6 -top-6 size-36 opacity-20" />
      <p class="text-[11px] font-bold tracking-[0.18em] text-gold-400">PRIORITY REWARDS</p>
      <p class="mt-2 text-[22px] font-bold leading-tight">Fast-Track Queue</p>
      <p class="mt-1 text-[13px] text-white/70">Valid until Oct 30, 2026</p>
    </div>
  </div>

  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-[20px] font-bold tracking-tight">Recommended Inventory</h2>
      <p class="text-[13px] text-slate-500">Curated from top marketplaces</p>
    </div>
    <a href="/app/search" class="ts-back" aria-label="Filter"><SlidersHorizontal class="size-5" /></a>
  </div>
  <div class="grid grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
    {#each mockVehicles as v}<VehicleCard {v} />{/each}
  </div>
  <a href="/app/search" class="btn-outline w-full gap-2"><Car class="size-5" /> Lihat Semua Mobil</a>
</div>
