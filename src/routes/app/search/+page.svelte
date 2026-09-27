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
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each filtered as v}<VehicleCard {v} />{/each}
  </div>
  {#if !filtered.length}<p class="text-sm text-slate-500">Tidak ada hasil untuk "{q}".</p>{/if}
</div>
