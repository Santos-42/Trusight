<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { PRICING } from '$lib/config';
  import { rupiah } from '$lib/format';
  let vehicleId = 'civic-2021', type: 'standard' | 'fast-track' = 'fast-track', err = '', ok = '';
  let link = '', linkMsg = '', linkOk = false, checking = false;
  function checkLink() {
    if (!link.trim() || checking) return;
    checking = true;
    linkOk = false;
    linkMsg = 'Link sedang di check…';
    const url = link.trim();
    setTimeout(() => {
      checking = false;
      const known = /olx\.co\.id|mobil123|carmudi|mobilbekas|carsome|momobil/i.test(url);
      if (/^https?:\/\//i.test(url) && (known || /mobil/i.test(url))) {
        linkOk = true;
        linkMsg = 'Link valid — listing mobil bekas terdeteksi. Pilih kendaraan di atas lalu Buat Order.';
      } else {
        linkMsg = 'Link tidak dikenali sebagai listing mobil bekas. Periksa kembali tautannya.';
      }
    }, 1200);
  }
  async function doSubmit() {
    err = ''; ok = '';
    const r = await api.post<{ orderId: string; total: number; sellerId?: string }>('/orders', { vehicleId, type, buyerId: getSession()?.id ?? 'u-mock' });
    if (!r.ok) { err = r.error.message; return; }
    const buyerId = getSession()?.id ?? 'u-mock';
    if (r.data.sellerId) {
      await api.post('/conversations', { orderId: r.data.orderId, buyerId, sellerId: r.data.sellerId });
    }
    location.href = `/app/checkout/${r.data.orderId.replace('#', '')}`;
  }
  function submit() {
    requireAuth(() => void doSubmit(), '/app/new-inspection');
  }
</script>
<svelte:head><title>Inspeksi Baru — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="ts-appbar-flush">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
  </div>
  <div class="grid items-start gap-6 lg:grid-cols-2">
    <div>
      <p class="text-sm font-bold tracking-[0.3em] text-slate-500">NEW INSPECTION</p>
      <h1 class="ts-h mt-1 text-[26px]">Secure your next investment with precision.</h1>
      <p class="mt-1 text-[13px] text-slate-500">Provide the vehicle details below. Our certified experts will perform a clinical inspection.</p>
    </div>
    <div class="ts-card grid gap-3">
      <label class="text-sm font-semibold">Vehicle
        <select class="ts-field mt-1" bind:value={vehicleId}>
          <option value="civic-2021">Honda Civic Turbo 2021 — Kalibata</option>
          <option value="porsche-911-2022">Porsche 911 Carrera S 2022 — Jakut</option>
          <option value="avanza-2022">Avanza Veloz 2022 — Tebet</option>
        </select>
      </label>
      <div class="grid grid-cols-2 gap-2">
        <button class="rounded-2xl border-2 p-3 text-left {type === 'standard' ? 'border-brand-600 bg-brand-100/40' : 'border-slate-100'}" on:click={() => (type = 'standard')}><p class="text-xs text-slate-500">Standard</p><p class="font-extrabold">{rupiah(PRICING.standard)}</p></button>
        <button class="rounded-2xl border-2 p-3 text-left {type === 'fast-track' ? 'border-brand-600 bg-brand-100/40' : 'border-slate-100'}" on:click={() => (type = 'fast-track')}><p class="text-xs text-slate-500">Fast-Track Priority</p><p class="font-extrabold">{rupiah(PRICING['fast-track'])}</p></button>
      </div>
      {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
      {#if ok}<p class="text-sm text-emerald-700">{ok}</p>{/if}
      <button class="btn-blue w-full" on:click={submit}>Buat Order</button>
      <div class="border-t border-slate-100 pt-3">
        <p class="text-sm font-bold">…atau tempel link mobil bekas</p>
        <div class="mt-2 flex gap-2">
          <input bind:value={link} placeholder="https://olx.co.id/…" class="ts-field flex-1" aria-label="Link mobil bekas" />
          <button class="shrink-0 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={checking} on:click={checkLink}>{checking ? 'Checking…' : 'Check'}</button>
        </div>
        {#if linkMsg}<p class="mt-2 text-[13px] {linkOk ? 'text-emerald-700' : 'text-slate-500'}">{linkMsg}</p>{/if}
      </div>
    </div>
  </div>
</div>
