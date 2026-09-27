<script lang="ts">
  import { page } from '$app/stores';
  $: orderId = $page.params.orderId;
</script>
<svelte:head><title>Payment Success — TruSight</title></svelte:head>
<div class="mx-auto max-w-md text-center grid gap-3 rounded-3xl border bg-white p-8">
  <p class="text-4xl">✅</p>
  <h1 class="text-xl font-extrabold">Verification Ordered</h1>
  <p class="text-sm text-slate-500">Order <b>{orderId}</b> • Fast Track • Target: Porsche 911 Carrera S</p>
  <div class="grid grid-cols-2 gap-2">
    <a href="/app/history" class="min-h-11 inline-flex items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">Lihat History</a>
    <a href={`/app/tracking/${orderId}`} class="min-h-11 inline-flex items-center justify-center rounded-xl border text-sm font-bold">Live Tracking</a>
  </div>
</div>
