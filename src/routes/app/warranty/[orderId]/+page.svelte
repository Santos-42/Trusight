<script lang="ts">
  import { page } from '$app/stores';
  import { shareOrCopy } from '$lib/share';
  import { requireAuth } from '$lib/guest';
  $: orderId = $page.params.orderId;
  let reason = 'Mesin bunyi tidak seperti di laporan';
  let msg = '';
  function doClaim() {
    msg = `Klaim garansi ${orderId} tercatat (mockup): "${reason}". Admin akan menghubungi ≤1×24 jam.`;
  }
  function claim() {
    requireAuth(() => doClaim(), `/app/warranty/${orderId}`);
  }
</script>
<svelte:head><title>Garansi {orderId} — TruSight</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Garansi & Komplain • {orderId}</h1>
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <p>Garansi laporan 30 hari • mencakup kesalahan inspeksi mayor (mockup, tanpa syarat tersembunyi).</p>
    <label>Keluhan<textarea class="mt-1 min-h-24 w-full rounded-xl border p-3" bind:value={reason}></textarea></label>
    {#if msg}<p class="text-sm text-emerald-700">{msg}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" on:click={claim}>Ajukan Klaim (Mockup)</button>
    <button class="min-h-11 rounded-xl border text-sm font-bold" on:click={() => shareOrCopy({ title: 'TruSight', text: 'Laporan saya:', url: `${location.origin}/app/report/${orderId}` })}>Bagikan Laporan ke Penjual</button>
  </div>
</div>
