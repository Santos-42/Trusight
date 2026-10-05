<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { requireAuth } from '$lib/guest';
  import { ChevronLeft, BadgeCheck, Car, Fuel, MapPin, CheckCircle2, Cog } from '@lucide/svelte';
  import { mockVehicles } from '$lib/mocks';
  import { rupiah, km } from '$lib/format';
  $: id = $page.params.id;
  $: v = mockVehicles.find(x => x.id === id) ?? mockVehicles[0];
  function order() {
    requireAuth(() => goto('/app/new-inspection'), `/app/vehicle/${id}`);
  }
</script>
<svelte:head><title>{v.title} — TruSight</title></svelte:head>
<div class="grid gap-4 pb-24 lg:grid-cols-3 lg:pb-10">
  <div class="ts-appbar lg:col-span-3">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Vehicle Detail</p>
  </div>

  <div class="grid gap-4 lg:col-span-2">
    <div class="relative h-60 overflow-hidden rounded-[20px] bg-[#14181e] text-white lg:h-72">
      {#if v.cover}
        <img src={v.cover} alt={v.title} class="h-full w-full object-cover" />
        <span class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></span>
      {:else}
        <span class="grid h-full place-items-center"><Car class="size-40 opacity-95" /></span>
      {/if}
      <span class="pill-hero absolute bottom-4 left-4"><BadgeCheck class="size-4 text-brand-600" /> TRUSIGHT VERIFIED</span>
      <span class="absolute bottom-4 right-6 flex gap-1.5"><span class="h-1.5 w-5 rounded-full bg-brand-500"></span><span class="size-1.5 rounded-full bg-white/40"></span><span class="size-1.5 rounded-full bg-white/40"></span></span>
    </div>
    <h1 class="text-[26px] font-bold tracking-tight">{v.title}</h1>
    <div class="grid grid-cols-2 gap-3">
      <div class="ts-card"><p class="ts-eyebrow">Transmission</p><p class="mt-1 font-bold">Manual</p><Cog class="mt-2 size-6 text-brand-600" /></div>
      <div class="ts-card"><p class="ts-eyebrow">Fuel Type</p><p class="mt-1 font-bold">Gas</p><Fuel class="mt-2 size-6 text-brand-600" /></div>
    </div>
    <div class="ts-card flex items-center justify-between">
      <div><p class="ts-eyebrow">Location</p><p class="mt-1 font-bold">{v.location}</p><p class="text-[11px] text-slate-400">{v.year} MODEL • {km(v.mileage).toUpperCase()}</p></div>
      <MapPin class="size-7 text-brand-600" />
    </div>
  </div>

  <div class="grid content-start gap-4">
    <div class="ts-card">
      <p class="ts-eyebrow">Asking Price</p>
      <p class="mt-1 text-[28px] font-extrabold text-brand-600">{rupiah(v.price)}</p>
      <p class="text-[11px] text-slate-400">EXCL. TAX • OLX • VERIFIED PARTNER</p>
    </div>
    <div class="rounded-[20px] bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
      <p class="flex items-center gap-2 font-bold"><CheckCircle2 class="size-5" /> VERIFICATION PASSED</p>
      <p class="mt-1 text-[13px] text-white/85">150 Point Inspection Passed by TruSight Certified Verifier.</p>
    </div>
    <button class="btn-navy hidden w-full lg:inline-flex" on:click={order}>ORDER VERIFICATION</button>
  </div>
</div>
<button class="fixed bottom-24 left-1/2 z-40 inline-flex min-h-[56px] w-[min(92%,28rem)] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-bold tracking-widest text-white shadow-xl lg:hidden" on:click={order}>ORDER VERIFICATION</button>
