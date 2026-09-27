<script lang="ts">
  import { page } from '$app/stores';
  import { ChevronLeft, CreditCard, QrCode, Landmark, Lock, BadgeCheck, Car } from '@lucide/svelte';
  import { api } from '$lib/api';
  $: orderId = $page.params.orderId;
  let method: 'CARD' | 'QRIS' | 'TRANSFER' = 'CARD', msg = '';
  const methods = [
    { id: 'CARD', icon: CreditCard },
    { id: 'QRIS', icon: QrCode },
    { id: 'TRANSFER', icon: Landmark }
  ] as const;
  async function pay() {
    msg = '';
    const r = await api.post<{ redirectUrl: string }>(`/orders/${orderId}/pay`, { method });
    if (!r.ok) { msg = r.error.message; return; }
    location.href = `/app/success/${orderId}`;
  }
</script>
<svelte:head><title>Checkout — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-4xl gap-5 pb-8">
  <div class="ts-appbar-flush">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Checkout</p>
  </div>
  <div class="grid items-start gap-5 lg:grid-cols-2">
    <div class="grid content-start gap-5">
      <div>
        <p class="ts-eyebrow">Inspection Summary</p>
        <h1 class="ts-h mt-1 text-[26px]">Order Details</h1>
      </div>
      <div class="ts-card">
        <div class="flex gap-4">
          <span class="grid size-20 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white"><Car class="size-10" /></span>
          <div class="flex flex-1 items-start justify-between gap-2">
            <div>
              <p class="font-bold">Fast Track Inspection</p>
              <p class="text-[13px] text-slate-500">2022 Porsche<br />911 Carrera S</p>
            </div>
            <p class="font-bold text-brand-600">Rp....</p>
          </div>
        </div>
        <div class="mt-3 flex justify-end"><span class="pill-blue"><BadgeCheck class="size-3.5" /> PRIORITY QUEUE</span></div>
        <div class="my-3 h-px bg-slate-100"></div>
        <div class="flex items-center justify-between"><p class="text-sm text-slate-500">Total Amount Due</p><p class="text-xl font-extrabold">Rp....</p></div>
      </div>
    </div>
    <div class="grid content-start gap-5">
      <div>
        <p class="ts-eyebrow">Secure Transaction</p>
        <h2 class="ts-h mt-1 text-[26px]">Payment Method</h2>
      </div>
      <div class="grid grid-cols-3 gap-3 lg:grid-cols-3">
        {#each methods as m}
          <button class="method-card {method === m.id ? 'method-active' : ''}" on:click={() => (method = m.id)}>
            <svelte:component this={m.icon} class="size-7 text-ink-900" />
            <span class="text-xs font-semibold tracking-widest text-slate-500">{m.id}</span>
          </button>
        {/each}
      </div>
      {#if msg}<p class="text-sm text-red-600">{msg}</p>{/if}
      <button class="btn-teal w-full gap-2" on:click={pay}>PAY NOW <Lock class="size-4" /></button>
    </div>
  </div>
</div>
