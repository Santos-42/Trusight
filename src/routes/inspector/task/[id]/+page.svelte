<script lang="ts">
  import { page } from '$app/stores';
  import { ChevronLeft, Clock, MapPin } from '@lucide/svelte';
  import OsmMap from '$lib/components/inspector/OsmMap.svelte';
  import { withinRadius } from '$lib/gps';
  import { reverseGeocode } from '$lib/geocode';
  $: id = $page.params.id;
  const CAR = { lat: -6.2581, lng: 106.8451 };
  let msg = 'Tombol check-in aktif hanya dalam radius 50 m dari mobil.';
  let addr = 'Apartemen Kalibata City Tower Jasmine';
  let canOpen = false;
  async function locate() {
    addr = 'Mencari alamat (OSM)...';
    if (!('geolocation' in navigator)) {
      const r = withinRadius(CAR.lat, CAR.lng, -6.2580, 106.8450, 50);
      msg = `${r.distance_m} m — ${r.valid ? 'valid' : 'di luar radius'}.`;
      canOpen = r.valid;
      addr = await reverseGeocode(CAR.lat, CAR.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const r = withinRadius(CAR.lat, CAR.lng, pos.coords.latitude, pos.coords.longitude, 50);
        canOpen = r.valid;
        msg = r.valid ? `Check-in valid (${r.distance_m} m). Lanjut ke form.` : `Di luar radius (${r.distance_m} m) — mendekat dulu.`;
        addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      async () => {
        const r = withinRadius(CAR.lat, CAR.lng, -6.2580, 106.8450, 50);
        msg = `GPS ditolak — pakai lokasi demo: ${r.distance_m} m, valid.`;
        canOpen = true;
        addr = await reverseGeocode(CAR.lat, CAR.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
</script>
<svelte:head><title>Tugas {id} — Inspector</title></svelte:head>
<div class="grid gap-4">
  <div class="ts-appbar-flush">
    <a href="/inspector" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Detail Tugas Inspeksi</p>
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-2">
    <OsmMap lat={CAR.lat} lng={CAR.lng} />
    <div class="ts-card grid content-start gap-2">
      <p class="text-lg font-bold">Honda Civic Turbo 2021</p>
      <p class="text-sm text-slate-500">B 1234 SG (Hitam)</p>
      <p class="flex items-center gap-2 text-[13px] text-slate-500"><Clock class="size-4" /> 14:00 - 15:30 WIB • Penjual: Ahmad Subarjo</p>
      <p class="flex items-center gap-2 text-[13px] text-slate-500"><MapPin class="size-4" /> {addr}</p>
      <p class="text-[13px]">{msg}</p>
      <div class="flex flex-col gap-2 sm:flex-row">
        <button class="btn-blue flex-1" on:click={locate}>Tiba & Verifikasi GPS</button>
        {#if canOpen}<a href={`/inspector/form/${id}`} class="btn-navy flex-1">Buka Formulir</a>{/if}
      </div>
    </div>
  </div>
</div>
