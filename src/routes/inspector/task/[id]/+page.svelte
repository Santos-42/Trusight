<script lang="ts">
  import { page } from '$app/stores';
  import OsmMap from '$lib/components/inspector/OsmMap.svelte';
  import { withinRadius } from '$lib/gps';
  import { reverseGeocode } from '$lib/geocode';
  $: id = $page.params.id;
  const CAR = { lat: -6.2581, lng: 106.8451 };
  let msg = 'Tombol check-in aktif hanya dalam radius 50 m dari mobil (mockup).';
  let addr = 'Kalibata City Tower Jasmine';
  let canOpen = false;

  async function locate() {
    addr = 'Mencari alamat (OSM)...';
    if (!('geolocation' in navigator)) {
      // Fallback mockup: titik demo 12 m dari mobil
      const r = withinRadius(CAR.lat, CAR.lng, -6.2580, 106.8450, 50);
      msg = `Mode mockup: ${r.distance_m} m — ${r.valid ? 'valid' : 'di luar radius'}.`;
      canOpen = r.valid;
      addr = await reverseGeocode(CAR.lat, CAR.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const r = withinRadius(CAR.lat, CAR.lng, pos.coords.latitude, pos.coords.longitude, 50);
        canOpen = r.valid;
        msg = r.valid
          ? `Check-in valid (${r.distance_m} m). Lanjut ke form.`
          : `Di luar radius (${r.distance_m} m) — mendekat dulu (mockup).`;
        addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      async () => {
        const r = withinRadius(CAR.lat, CAR.lng, -6.2580, 106.8450, 50);
        msg = `GPS ditolak — mode mockup: ${r.distance_m} m, valid.`;
        canOpen = true;
        addr = await reverseGeocode(CAR.lat, CAR.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
</script>
<svelte:head><title>Tugas {id} — Inspector</title></svelte:head>
<div class="grid gap-3 max-w-xl">
  <h1 class="text-xl font-extrabold">Detail Tugas • Honda Civic B 1234 SG • {id}</h1>
  <OsmMap lat={CAR.lat} lng={CAR.lng} />
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <p>Penjual: Ahmad Subarjo • {addr}</p>
    <p>{msg}</p>
    <div class="flex gap-2">
      <button class="min-h-11 flex-1 rounded-xl bg-brand-600 font-bold text-white" on:click={locate}>Tiba & Verifikasi GPS</button>
      {#if canOpen}
        <a href={`/inspector/form/${id}`} class="min-h-11 flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 font-bold text-white">Buka Formulir</a>
      {:else}
        <span class="min-h-11 flex-1 inline-flex items-center justify-center rounded-xl border font-bold text-slate-400">Formulir terkunci</span>
      {/if}
    </div>
  </div>
</div>
