<script lang="ts">
  import { ChevronLeft, Landmark } from '@lucide/svelte';
  import { rupiah } from '$lib/format';
  import { requireAuth } from '$lib/guest';
  let amount = 500000;
  let msg = '';
  const saldo = 1250000;
  const quick = [250000, 500000, 1000000];
  function submit() {
    requireAuth(() => {
      if (!amount || amount < 50000) { msg = 'Nominal minimal Rp 50.000.'; return; }
      if (amount > saldo) { msg = 'Nominal melebihi saldo.'; return; }
      msg = `Penarikan ${rupiah(amount)} ke BCA •••• 8821 diproses. Dana masuk ≤1×24 jam.`;
    }, '/seller/withdraw');
  }
</script>
<svelte:head><title>Penarikan Dana — Seller</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center gap-3">
    <a href="/seller/profile" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Penarikan Dana</h1>
  </div>
  <div class="ts-card">
    <p class="ts-eyebrow">Saldo tersedia</p>
    <p class="mt-1 text-2xl font-extrabold">{rupiah(saldo)}</p>
    <p class="mt-2 flex items-center gap-2 text-[13px] text-slate-500"><Landmark class="size-4" /> BCA •••• 8821 • Hendra Wijaya</p>
  </div>
  <div class="ts-card grid gap-3">
    <label class="grid gap-1 text-sm font-bold">Nominal penarikan
      <input type="number" min="50000" step="10000" bind:value={amount} class="ts-field" />
    </label>
    <div class="flex gap-2">
      {#each quick as q}
        <button class="flex-1 rounded-xl border px-2 py-2 text-[13px] font-bold {amount === q ? 'border-brand-600 text-brand-700' : ''}" on:click={() => (amount = q)}>{rupiah(q)}</button>
      {/each}
    </div>
    {#if msg}<p class="text-sm text-emerald-700">{msg}</p>{/if}
    <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" on:click={submit}>Tarik Dana</button>
  </div>
</div>
