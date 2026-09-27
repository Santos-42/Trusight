<script lang="ts">
  import { shareOrCopy } from '$lib/share';
  let msg = '';
  async function share(how: 'copy' | 'olx') {
    const url = `${location.origin}/cert/mock-civic-2021`;
    await shareOrCopy({ title: 'TruSight Certified — Civic 2021', text: how === 'olx' ? 'TruSight Certified Grade A — lihat laporan:' : 'Sertifikat:', url });
    msg = how === 'olx' ? 'Tautan disalin — tempel ke deskripsi OLX (mockup).' : 'Tautan sertifikat disalin.';
  }
</script>
<svelte:head><title>Sertifikasi — Seller</title></svelte:head>
<div class="grid gap-3 max-w-xl">
  <h1 class="text-xl font-extrabold">Sertifikasi Anda Siap! • Grade A</h1>
  <div class="rounded-2xl border bg-white p-5 text-sm">
    <p>TruSight Certified • Honda Civic Turbo 2021 (mockup)</p>
    {#if msg}<p class="mt-2">{msg}</p>{/if}
    <div class="mt-3 flex gap-2">
      <button class="min-h-11 rounded-xl border px-4 font-bold" on:click={() => share('copy')}>Salin Tautan Sertifikat</button>
      <button class="min-h-11 rounded-xl bg-brand-600 px-4 font-bold text-white" on:click={() => share('olx')}>Bagikan ke OLX</button>
    </div>
  </div>
</div>
