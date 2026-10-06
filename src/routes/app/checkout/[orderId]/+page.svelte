<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { ChevronLeft, CreditCard, QrCode, Landmark, Lock, BadgeCheck, TicketPercent } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  $: orderId = $page.params.orderId;
  let method: 'CARD' | 'QRIS' | 'TRANSFER' = 'CARD', msg = '';
  let claimed: string[] = [];
  let voucher = '';
  const usable = ['TRU20', 'HEMAT50'];
  onMount(async () => {
    if (browser) {
      try { claimed = JSON.parse(localStorage.getItem('trusight_vouchers') ?? '[]'); } catch { /* abaikan */ }
    }
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ code: string; used_at?: string | null }[]>(`/vouchers/mine?userId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) claimed = r.data.filter((v) => !v.used_at).map((v) => v.code);
  });
  $: vouchers = claimed.filter((c) => usable.includes(c));
  const methods = [
    { id: 'CARD', icon: CreditCard },
    { id: 'QRIS', icon: QrCode },
    { id: 'TRANSFER', icon: Landmark }
  ] as const;
  async function doPay() {
    msg = '';
    const r = await api.post<{ redirectUrl: string; amount: number; discount: number }>(`/orders/${orderId}/pay`, {
      method, voucherCode: voucher || undefined, buyerId: getSession()?.id ?? ''
    });
    if (!r.ok) { msg = r.error.message; return; }
    location.href = `/app/success/${orderId}`;
  }
  function pay() {
    requireAuth(() => void doPay(), `/app/checkout/${orderId}`);
  }
</script>
<svelte:head><title>Checkout — TruSight</title></svelte:head>
<div class="grid gap-5 pb-8">
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
          <span class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink-900 text-white"><img src="/vehicles/porsche-911-2022/hero.jpg" alt="Porsche 911 Carrera S 2022" class="h-full w-full object-cover" /></span>
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
        {#if vouchers.length}
          <div class="mt-3 grid gap-2">
            <p class="ts-eyebrow">Pakai voucher</p>
            <div class="flex flex-wrap gap-2">
              <button class="pill {voucher === '' ? 'pill-blue' : ''}" on:click={() => (voucher = '')}>Tanpa voucher</button>
              {#each vouchers as c}
                <button class="pill {voucher === c ? 'pill-blue' : ''}" on:click={() => (voucher = voucher === c ? '' : c)}>
                  <TicketPercent class="size-3.5" /> {c}{c === 'TRU20' ? ' −20%' : ' −Rp50rb'}
                </button>
              {/each}
            </div>
            {#if voucher}<p class="text-xs text-emerald-700">Diskon dihitung server saat bayar — nominal akhir tercatat di pembayaran.</p>{/if}
          </div>
        {/if}
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
