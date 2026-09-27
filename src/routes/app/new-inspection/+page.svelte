<script lang="ts">
  import { api } from '$lib/api';
  import { PRICING } from '$lib/config';
  import { rupiah } from '$lib/format';
  let vehicleId='civic-2021', type:'standard'|'fast-track'='fast-track', err='', ok='';
  async function submit(){
    err=''; ok='';
    const r = await api.post<{orderId:string; total:number}>('/orders',{vehicleId, type});
    if(!r.ok){ err=r.error.message; return; }
    ok=`Order ${r.data.orderId} dibuat (${rupiah(r.data.total)}). Lanjut ke checkout.`;
  }
</script>
<svelte:head><title>Inspeksi Baru — TruSight</title></svelte:head>
<div class="mx-auto max-w-xl grid gap-4">
  <div><h1 class="text-xl font-extrabold">NEW INSPECTION</h1><p class="text-sm text-slate-500">Secure your next investment with precision.</p></div>
  <div class="rounded-2xl border bg-white p-5 grid gap-3">
    <label class="text-sm font-semibold">Vehicle
      <select class="mt-1 min-h-12 w-full rounded-xl border px-3" bind:value={vehicleId}>
        <option value="civic-2021">Honda Civic Turbo 2021 — Kalibata</option>
        <option value="porsche-911-2022">Porsche 911 Carrera S 2022 — Jakut</option>
        <option value="avanza-2022">Avanza Veloz 2022 — Tebet</option>
      </select>
    </label>
    <div class="grid grid-cols-2 gap-2">
      <button class="rounded-2xl border p-3 {type==='standard'?'border-brand-600 bg-brand-50':''}" on:click={()=>type='standard'}><p class="text-xs">Standard</p><p class="font-extrabold">{rupiah(PRICING.standard)}</p></button>
      <button class="rounded-2xl border p-3 {type==='fast-track'?'border-brand-600 bg-brand-50':''}" on:click={()=>type='fast-track'}><p class="text-xs">Fast-Track Priority</p><p class="font-extrabold">{rupiah(PRICING['fast-track'])}</p></button>
    </div>
    {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
    {#if ok}<p class="text-sm text-emerald-700">{ok}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" on:click={submit}>Buat Order</button>
  </div>
</div>
