<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { PRICING } from '$lib/config';
  import { rupiah } from '$lib/format';
  let vehicleId = 'civic-2021', type: 'standard' | 'fast-track' = 'fast-track', err = '', ok = '';
  async function submit() {
    err = ''; ok = '';
    const r = await api.post<{ orderId: string; total: number }>('/orders', { vehicleId, type });
    if (!r.ok) { err = r.error.message; return; }
    ok = `Order ${r.data.orderId} dibuat (${rupiah(r.data.total)}). Lanjut ke checkout.`;
  }
</script>
<svelte:head><title>Inspeksi Baru — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-4xl gap-4">
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
    </div>
  </div>
</div>
