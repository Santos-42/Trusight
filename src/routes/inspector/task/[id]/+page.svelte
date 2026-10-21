<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { ChevronLeft, Clock, MapPin, Lock } from '@lucide/svelte';
  import OsmMap from '$lib/components/inspector/OsmMap.svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { withinRadius } from '$lib/gps';
  import { reverseGeocode } from '$lib/geocode';
  $: id = $page.params.id;
  type OrderInfo = { id: string; vehicle?: string; location?: string; location_detail?: string | null; location_revealed?: boolean; paid?: boolean; viewing?: { id: string; datetime: string; status: string } | null };
  let order: OrderInfo | null = null;
  onMount(async () => {
    const viewerId = getSession()?.id ?? '';
    const r = await api.get<OrderInfo>(`/orders/${id}?viewerId=${encodeURIComponent(viewerId)}`);
    if (r.ok) order = r.data;
  });
  // Permintaan lihat mobil milik order ini. approved = seller sudah menyetujui waktunya.
  $: viewing = order?.viewing ?? null;
  $: approved = viewing?.status === 'approved';
  const RESCHEDULE_SLOTS = ['Senin, 8 Juni • 10:00 WIB', 'Selasa, 9 Juni • 14:00 WIB', 'Rabu, 10 Juni • 09:30 WIB'];
  // Alamat target hanya terbuka bila server mengizinkan (inspektor order ini + sudah bayar).
  $: revealedAddr = order?.location_revealed ? order.location_detail : null;
  let checkinSent = false;
  $: if (canOpen && id && !checkinSent) {
    checkinSent = true;
    void api.post('/inspections/checkin', { orderId: id, inspectorId: getSession()?.id ?? 'u-bsantoso', lat: CAR.lat, lng: CAR.lng, valid: true });
  }
  const CAR = { lat: -6.2581, lng: 106.8451 };
  let msg = 'Check-in GPS aktif dalam radius 50 m dari mobil.';
  let addr = '';
  let canOpen = false;
  let viewMsg = '';
  let showResched = false;
  /**
   * Ajukan "mau lihat mobil" ke penjual — TANPA identitas TruSight.
   * Di mata penjual ini calon pembeli biasa, jadi tidak ada yang perlu dirahasiakan
   * dari permintaannya.
   */
  async function requestViewing(slot = 'usulan waktu lihat') {
    viewMsg = 'Mengirim permintaan...';
    const r = await api.post<{ slot: string }>(`/orders/${id}/viewing`, {
      inspectorId: getSession()?.id ?? 'u-bsantoso',
      slot
    });
    viewMsg = r.ok
      ? 'Permintaan lihat mobil terkirim ke penjual. Menunggu konfirmasi waktu.'
      : r.error.message;
    if (r.ok) {
      const fresh = await api.get<OrderInfo>(`/orders/${id}?viewerId=${encodeURIComponent(getSession()?.id ?? '')}`);
      if (fresh.ok) order = fresh.data;
    }
  }
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
        msg = `GPS tidak diizinkan — memakai titik bawaan (${r.distance_m} m, valid).`;
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
      <p class="flex items-center gap-2 text-[0.8125rem] text-slate-500"><Clock class="size-4" /> 14:00 - 15:30 WIB • Penjual: Ahmad Subarjo</p>
      <p class="flex items-center gap-2 text-[0.8125rem] text-slate-500">
        <MapPin class="size-4" />
        {#if revealedAddr}
          {revealedAddr}
        {:else}
          <span class="flex items-center gap-1.5"><Lock class="size-3.5" /> {order?.location ?? 'Lokasi tersembunyi'} • menunggu pembayaran</span>
        {/if}
      </p>
      {#if addr}<p class="text-[0.6875rem] text-slate-400">Verifikasi GPS: {addr}</p>{/if}
      <p class="text-[0.8125rem]">{msg}</p>
      {#if viewMsg}<p class="text-[0.8125rem] text-brand-700">{viewMsg}</p>{/if}
      <div class="flex flex-col gap-2">
        {#if !viewing}
          <button class="btn-outline w-full" on:click={() => requestViewing()}>Ajukan Waktu Lihat</button>
          <button class="btn-blue w-full" disabled>Tiba &amp; Verifikasi GPS</button>
          <p class="text-[0.6875rem] text-slate-500">Ajukan waktu dulu, tunggu seller menyetujui, baru kamu datang.</p>
        {:else if !approved}
          <button class="btn-outline w-full" on:click={() => requestViewing()}>Ubah Usulan Waktu</button>
          <button class="btn-blue w-full" disabled>Tiba &amp; Verifikasi GPS</button>
          <p class="text-[0.6875rem] text-amber-700">Menunggu seller menyetujui waktu ({viewing.datetime}).</p>
        {:else}
          <button class="btn-blue w-full" on:click={locate}>Tiba &amp; Verifikasi GPS</button>
          {#if canOpen}
            <a href={`/inspector/form/${id}`} class="btn-navy w-full">Buka Formulir</a>
          {/if}
          <p class="text-[0.6875rem] text-emerald-700">Waktu sudah disetujui seller: {viewing.datetime}.</p>
          <button class="text-[0.6875rem] font-bold text-brand-600" on:click={() => (showResched = !showResched)}>
            {showResched ? 'Batal reschedule' : 'Reschedule (ubah waktu)'}
          </button>
          {#if showResched}
            <div class="grid gap-2 rounded-xl border border-slate-200 p-3">
              <p class="text-[0.8125rem] font-bold text-slate-500">Pilih waktu baru:</p>
              <div class="flex flex-wrap gap-2">
                {#each RESCHEDULE_SLOTS as s}
                  <button class="min-h-10 rounded-xl border px-3 text-[0.8125rem] font-semibold" on:click={() => requestViewing(s)}>{s}</button>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>
