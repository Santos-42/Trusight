<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Check, Zap, Car, RotateCw, FileText, MapPin, Lock } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { findVehicle } from '$lib/mocks';
  $: orderId = $page.params.orderId ?? 'TS-98211';
  type OrderInfo = { id: string; vehicle_id?: string; vehicle?: string; type: string; status: string; created_at?: string; location?: string; location_detail?: string | null; location_revealed?: boolean };
  let order: OrderInfo | null = null;
  onMount(async () => {
    const viewerId = getSession()?.id ?? '';
    const r = await api.get<OrderInfo>(`/orders/${orderId}?viewerId=${encodeURIComponent(viewerId)}`);
    if (r.ok) order = r.data;
  });
  $: car = order?.vehicle_id ? findVehicle(order.vehicle_id) : null;
  // Lokasi detail hanya tampil bila server mengizinkan (pembeli order + sudah bayar).
  $: detail = order?.location_revealed ? order.location_detail : null;
</script>
<svelte:head><title>Payment Success — TruSight</title></svelte:head>
<div class="grid gap-5 pb-8">
  <p class="ts-appbar-title text-center lg:col-span-2">Payment Success</p>
  <h1 class="text-center text-[1.875rem] font-extrabold tracking-tight lg:col-span-2">Verification Ordered</h1>
  <div class="grid items-start gap-5 lg:grid-cols-2">
    <div class="grid content-start gap-5">
      <div class="mx-auto grid size-24 place-items-center rounded-full bg-white shadow-sm">
        <span class="grid size-14 place-items-center rounded-full bg-[#34c759] text-white"><Check class="size-8" /></span>
      </div>
      <p class="text-center text-[0.9375rem] text-slate-500">Your verification request for the <b class="text-ink-900">{car?.title ?? order?.vehicle ?? 'kendaraanmu'}</b> has been received.</p>
      <div class="ts-card grid gap-4">
        <div><p class="ts-eyebrow">Order ID</p><p class="mt-0.5 font-bold">{orderId}</p></div>
        <div><p class="ts-eyebrow">Date</p><p class="mt-0.5 font-bold">Oct 24, 2023</p></div>
        <div><p class="ts-eyebrow">Service Type</p><p class="mt-0.5 flex items-center gap-1.5 font-bold"><Zap class="size-4 text-brand-600" /> {order?.type === 'fast-track' ? 'Fast Track' : 'Standard'}</p></div>
        <div class="flex gap-3">
          <span class="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-900 text-white">
            {#if car}<img src={car.cover} alt={car.title} class="h-full w-full object-cover" />{:else}<Car class="size-8" />{/if}
          </span>
          <div class="text-[0.8125rem]">
            <p class="ts-eyebrow">Target Vehicle</p>
            <p class="font-bold">{car?.title ?? order?.vehicle ?? 'Kendaraan'}</p>
            <p class="text-slate-400">{car ? `${car.year} • ${car.mileage.toLocaleString('id-ID')} km` : ''}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="grid content-start gap-4">
      {#if detail}
        <div class="ts-card !border-brand-200 !bg-brand-50 grid gap-2">
          <p class="ts-eyebrow flex items-center gap-1.5"><MapPin class="size-4 text-brand-600" /> Lokasi Detail Terbuka</p>
          <p class="font-bold">{detail}</p>
          <a
            class="font-bold text-brand-600"
            href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(detail)}"
            target="_blank"
            rel="noreferrer"
          >Buka di Google Maps →</a>
          <p class="text-[0.6875rem] text-slate-500">Hanya kamu (pemilik order) dan inspektor yang bisa melihat alamat ini.</p>
        </div>
      {:else}
        <div class="ts-card grid gap-2">
          <p class="ts-eyebrow flex items-center gap-1.5"><Lock class="size-4 text-slate-400" /> Lokasi</p>
          <p class="font-bold">{order?.location ?? '—'}</p>
          <p class="text-[0.6875rem] text-slate-500">Alamat detail terbuka untuk kamu dan inspektor setelah pembayaran tercatat.</p>
        </div>
      {/if}
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Langkah berikutnya</p>
        <p class="flex gap-2"><FileText class="mt-0.5 size-4 shrink-0 text-brand-600" /> Inspektor tersertifikasi dijadwalkan ≤ 1×24 jam dan kamu bisa pantau progres live.</p>
        <p class="flex gap-2"><RotateCw class="mt-0.5 size-4 shrink-0 text-brand-600" /> Laporan resmi + skor + garansi 30 hari terbit otomatis setelah inspeksi.</p>
      </div>
      <a href={`/app/tracking/${orderId}`} class="btn-teal w-full gap-2">VIEW PROGRESS <RotateCw class="size-4" /></a>
      <a href="/app/history" class="btn-outline w-full">Lihat Riwayat</a>
    </div>
  </div>
</div>
