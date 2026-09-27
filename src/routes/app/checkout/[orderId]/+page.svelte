<script lang="ts">
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  $: orderId = $page.params.orderId;
  let method:'CARD'|'QRIS'|'TRANSFER'='QRIS', msg='';
  async function pay(){
    msg='';
    const r = await api.post<{redirectUrl:string}>(`/orders/${orderId}/pay`, { method });
    if(!r.ok){ msg=r.error.message; return; }
    location.href=`/app/success/${orderId}`;
  }
</script>
<svelte:head><title>Checkout — TruSight</title></svelte:head>
<div class="mx-auto max-w-xl grid gap-4">
  <h1 class="text-xl font-extrabold">Checkout • {orderId}</h1>
  <div class="rounded-2xl border bg-white p-5 grid gap-3">
    <p class="text-sm text-slate-500">INSPECTION SUMMARY • Fast Track Priority Queue</p>
    <div class="grid grid-cols-3 gap-2">
      {#each ['CARD','QRIS','TRANSFER'] as m}
        <button class="rounded-xl border p-3 text-sm font-bold {method===m?'border-brand-600 bg-brand-50':''}" on:click={()=>method=m}>{m}</button>
      {/each}
    </div>
    {#if msg}<p class="text-sm text-red-600">{msg}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" on:click={pay}>PAY NOW</button>
  </div>
</div>
