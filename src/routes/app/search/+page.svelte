<script lang="ts">
  import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
  import { mockVehicles } from '$lib/mocks';
  let q='';
  $: filtered = mockVehicles.filter(v => v.title.toLowerCase().includes(q.toLowerCase()));
</script>
<svelte:head><title>Cari — TruSight</title></svelte:head>
<div class="grid gap-4">
  <h1 class="text-xl font-extrabold">Cari Mobil Bekas</h1>
  <input class="min-h-12 rounded-xl border px-4" placeholder="Cari Civic, Avanza, 911..." bind:value={q} />
  <div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
    {#each filtered as v}<VehicleCard {v} />{/each}
  </div>
  {#if !filtered.length}<p class="text-sm text-slate-500">Tidak ada hasil untuk "{q}".</p>{/if}
</div>
