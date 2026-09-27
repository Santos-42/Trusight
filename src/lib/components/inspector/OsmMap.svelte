<script lang="ts">
  import { onMount } from 'svelte';
  export let lat = -6.2581;
  export let lng = 106.8451;
  let el: HTMLDivElement;
  let err = '';

  onMount(async () => {
    try {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      const map = L.map(el).setView([lat, lng], 16);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
      setTimeout(() => map.invalidateSize(), 200);
    } catch {
      err = 'Peta Leaflet gagal dimuat — gunakan tautan OSM di bawah.';
    }
  });
  $: osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
</script>
<div class="rounded-2xl border bg-white p-3">
  <p class="px-1 pb-2 text-sm font-bold">Lokasi Tugas <span class="font-normal text-slate-500">(OSS: Leaflet + OSM)</span></p>
  <div bind:this={el} class="h-52 w-full rounded-xl bg-slate-100"></div>
  {#if err}<p class="mt-2 text-xs text-amber-700">{err}</p>{/if}
  <a href={osmLink} target="_blank" rel="noreferrer" class="mt-2 inline-block text-xs font-bold text-brand-700">Buka di OpenStreetMap →</a>
</div>
