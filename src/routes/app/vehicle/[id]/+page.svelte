<script lang="ts">
  import { page } from '$app/stores';
  import { mockVehicles } from '$lib/mocks';
  import ScoreBadge from '$lib/components/vehicle/ScoreBadge.svelte';
  import { rupiah, km } from '$lib/format';
  $: id = $page.params.id;
  $: v = mockVehicles.find(x => x.id === id) ?? mockVehicles[0];
</script>
<svelte:head><title>{v.title} — TruSight</title></svelte:head>
<div class="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
  <div>
    <div class="aspect-[4/3] rounded-3xl bg-slate-200 grid place-items-center text-slate-500">Galeri • {v.title}</div>
    <div class="mt-3 rounded-2xl border bg-white p-4">
      <p class="font-bold text-sm">TRUSIGHT VERIFIED • {v.year} • {km(v.mileage)}</p>
      <div class="mt-2"><ScoreBadge score={v.score} grade={v.grade} recommendation={v.recommendation} /></div>
      <ul class="mt-3 text-sm text-slate-600 grid gap-1">
        <li>Transmisi: Manual • Bahan bakar: Bensin</li>
        <li>Lokasi: {v.location}</li>
        <li>Verification Passed • 150 Point Inspection</li>
      </ul>
    </div>
  </div>
  <div>
    <div class="lg:sticky lg:top-20 rounded-3xl border bg-white p-5">
      <p class="text-xs text-slate-500">VERIFIED PARTNER</p>
      <h1 class="text-xl font-extrabold">{v.title}</h1>
      <p class="mt-1 text-2xl font-extrabold">{rupiah(v.price)} <span class="text-xs font-medium text-slate-400">EXCL. TAX</span></p>
      <div class="mt-4 grid gap-2">
        <a href="/app/new-inspection" class="min-h-12 inline-flex items-center justify-center rounded-2xl bg-brand-600 font-bold text-white">Ajukan Inspeksi Ini</a>
        <a href="/app/checkout/civic-2021" class="min-h-12 inline-flex items-center justify-center rounded-2xl border font-bold">Checkout Fast-Track</a>
      </div>
      <p class="mt-3 text-xs text-slate-500">Independen • Tidak afiliasi showroom/lelang • Garansi laporan 30 hari.</p>
    </div>
  </div>
</div>
