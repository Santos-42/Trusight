<script lang="ts">
  import { page } from '$app/stores';
  $: id = $page.params.id;
  import { withinRadius } from '$lib/gps';
  let msg='Tombol aktif dalam radius 50m dari mobil.';
  function checkin(){
    const r = withinRadius(-6.2581, 106.8451, -6.2580, 106.8450, 50);
    msg = r.valid ? `Check-in valid (${r.distance_m} m). Lanjut ke form.` : `Di luar radius (${r.distance_m} m).`;
  }
</script>
<svelte:head><title>Tugas {id} — Inspector</title></svelte:head>
<div class="grid gap-3 max-w-xl">
  <h1 class="text-xl font-extrabold">Detail Tugas • Honda Civic B 1234 SG • {id}</h1>
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <p>Penjual: Ahmad Subarjo • Kalibata City Tower Jasmine</p>
    <p>{msg}</p>
    <div class="flex gap-2">
      <button class="min-h-11 flex-1 rounded-xl bg-brand-600 font-bold text-white" on:click={checkin}>Tiba & Verifikasi GPS</button>
      <a href={`/inspector/form/${id}`} class="min-h-11 flex-1 inline-flex items-center justify-center rounded-xl border font-bold">Buka Formulir</a>
    </div>
  </div>
</div>
