<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import { requireAuth } from '$lib/guest';
  let msg = '';
  let altOpen = false;
  const slots = ['Jumat, 5 Juni • 10:00 WIB', 'Jumat, 5 Juni • 13:00 WIB', 'Sabtu, 6 Juni • 09:00 WIB'];
  function approve() {
    requireAuth(() => {
      msg = 'Jadwal disetujui. Inspektur dinotifikasi.';
    }, '/seller/schedule');
  }
  function propose(s: string) {
    requireAuth(() => {
      msg = `Usulan jadwal baru terkirim ke Rian F.: ${s}.`;
      altOpen = false;
    }, '/seller/schedule');
  }
</script>
<svelte:head><title>Jadwal — Seller</title></svelte:head>
<div class="grid gap-3">
  <div class="flex items-center gap-3">
    <a href="/seller" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Jadwal Inspeksi</h1>
  </div>
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <div class="flex items-center justify-between gap-2">
      <p class="font-bold">Honda Civic Turbo 2021</p>
      <span class="pill-amber">Inspeksi Dijadwalkan</span>
    </div>
    <p>Kamis, 4 Juni • 14:00 WIB • Inspektur: Budi Santoso (GPS Lock)</p>
    {#if msg}<p class="text-sm text-emerald-700">{msg}</p>{/if}
    <div class="flex gap-2">
      <button class="min-h-11 flex-1 rounded-xl bg-brand-600 font-bold text-white" on:click={approve}>Setujui Jadwal</button>
      <button class="min-h-11 flex-1 rounded-xl border font-bold" on:click={() => (altOpen = !altOpen)}>Alternatif</button>
    </div>
    {#if altOpen}
      <div class="grid gap-2 border-t border-slate-100 pt-3">
        <p class="text-[13px] font-bold text-slate-500">Usulkan slot pengganti:</p>
        {#each slots as s}
          <button class="min-h-11 rounded-xl border px-4 text-left text-[13px] font-semibold hover:border-brand-400" on:click={() => propose(s)}>{s}</button>
        {/each}
      </div>
    {/if}
  </div>
</div>
