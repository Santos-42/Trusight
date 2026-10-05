<script lang="ts">
  import { requireAuth } from '$lib/guest';
  function approve() {
    requireAuth(() => {
      document.getElementById('jadwal-msg')!.textContent = 'Jadwal disetujui (mockup). Inspektur dinotifikasi.';
    }, '/seller/schedule');
  }
</script>
<svelte:head><title>Jadwal — Seller</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Jadwal Inspeksi</h1>
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <div class="flex items-center justify-between gap-2">
      <p class="font-bold">Honda Civic Turbo 2021</p>
      <span class="pill-amber">Inspeksi Dijadwalkan</span>
    </div>
    <p>Kamis, 4 Juni • 14:00 WIB • Inspektur: Budi Santoso (GPS Lock)</p>
    <p id="jadwal-msg" class="text-sm text-emerald-700"></p>
    <div class="flex gap-2">
      <button class="min-h-11 flex-1 rounded-xl bg-brand-600 font-bold text-white" on:click={approve}>Setujui Jadwal</button>
      <button class="min-h-11 flex-1 rounded-xl border font-bold">Alternatif</button>
    </div>
  </div>
</div>
