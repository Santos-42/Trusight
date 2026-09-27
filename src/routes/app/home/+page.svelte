<script lang="ts">
  import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
  import { mockVehicles } from '$lib/mocks';
  import { Search, BadgePercent } from '@lucide/svelte';
</script>
<svelte:head><title>Home — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="rounded-3xl bg-slate-900 text-white p-6 sm:p-8">
    <p class="text-xs tracking-widest text-slate-300">VERIFIED PRECISION • CLINICAL STANDARDS</p>
    <h1 class="mt-2 text-2xl sm:text-3xl font-extrabold">Every vehicle undergoes a 150-point surgical verification.</h1>
    <div class="mt-4 flex flex-col sm:flex-row gap-2">
      <a href="/app/search" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-900 text-sm"><Search class="size-4"/> Cari Mobil</a>
      <a href="/app/new-inspection" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 font-bold text-sm">Ajukan Inspeksi</a>
    </div>
  </div>
  <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
    <BadgePercent class="size-6 text-amber-600" />
    <div><p class="font-bold text-sm">SUMMER OFFER — 20% Off Verification</p><p class="text-xs text-slate-600">Valid until Oct 30, 2026. Fast-Track priority queue.</p></div>
  </div>
  <h2 class="font-extrabold text-lg">Rekomendasi Terverifikasi</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each mockVehicles as v}<VehicleCard {v} />{/each}
  </div>
</div>
