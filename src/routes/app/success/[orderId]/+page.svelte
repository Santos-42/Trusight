<script lang="ts">
  import { page } from '$app/stores';
  import { Check, Zap, Car, RotateCw } from '@lucide/svelte';
  $: orderId = $page.params.orderId;
</script>
<svelte:head><title>Payment Success — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-md gap-5 pb-8">
  <p class="ts-appbar-title text-center">Payment Success</p>
  <h1 class="text-center text-[30px] font-extrabold tracking-tight">Verification Ordered</h1>
  <div class="mx-auto grid size-24 place-items-center rounded-full bg-white shadow-sm">
    <span class="grid size-14 place-items-center rounded-full bg-[#34c759] text-white"><Check class="size-8" /></span>
  </div>
  <p class="text-center text-[15px] text-slate-500">Your verification request for the <b class="text-ink-900">2022 Porsche 911 Carrera S</b> has been received.</p>
  <div class="ts-card grid gap-4">
    <div><p class="ts-eyebrow">Order ID</p><p class="mt-0.5 font-bold">{orderId}</p></div>
    <div><p class="ts-eyebrow">Date</p><p class="mt-0.5 font-bold">Oct 24, 2023</p></div>
    <div><p class="ts-eyebrow">Service Type</p><p class="mt-0.5 flex items-center gap-1.5 font-bold"><Zap class="size-4 text-brand-600" /> Fast Track</p></div>
    <div class="flex gap-3">
      <span class="grid size-16 shrink-0 place-items-center rounded-xl bg-ink-900 text-white"><Car class="size-8" /></span>
      <div class="text-[13px]">
        <p class="ts-eyebrow">Target Vehicle</p>
        <p class="font-bold">Porsche 911 Carrera S (992)</p>
        <p class="text-slate-400">VIN: WP0AA2A92PSXXXXXX</p>
      </div>
    </div>
  </div>
  <a href={`/app/tracking/${orderId}`} class="btn-teal w-full gap-2">VIEW PROGRESS <RotateCw class="size-4" /></a>
</div>
