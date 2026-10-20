<script lang="ts">
  import { onMount } from 'svelte';
  import { BellRing, CircleUserRound } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { shareOrCopy } from '$lib/share';
  import { mockVehicles } from '$lib/mocks';
  import { rupiah } from '$lib/format';
  let msg = '';
  type Req = { id: string; vehicle: string; buyer: string; status: string };
  let incoming: Req[] = [];
  let live = false;
  let loaded = false;
  // Katalog milik seller — hanya locationArea (kota/kecamatan); lokasi detail tidak
  // pernah dikirim ke seller (lihat src/lib/server/d1.ts listOrders).
  const myVehicles = mockVehicles;
  onMount(async () => {
    const uid = getSession()?.id;
    if (uid) {
      const r = await api.get<Req[]>(`/orders/incoming?sellerId=${encodeURIComponent(uid)}`);
      if (r.ok) {
        live = true;
        incoming = r.data.filter((x) => x.status === 'pending');
      }
    }
    loaded = true;
  });
</script>
<svelte:head><title>Seller — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div>
    <p class="text-sm text-slate-500">Dashboard Penjual,</p>
    <h1 class="flex items-center gap-3 text-[1.625rem] font-bold tracking-tight"><CircleUserRound class="size-12 shrink-0 text-slate-300" /> Hendra Wijaya</h1>
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-2">
    <div class="grid content-start gap-4">
      <h2 class="text-lg font-bold">Mobil Anda ({myVehicles.length})</h2>
      <div class="grid max-h-[26rem] gap-3 overflow-y-auto pr-1">
        {#each myVehicles as v (v.id)}
          <div class="ts-card flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-lg font-bold">{v.title}</p>
              <p class="text-xs text-slate-500">{v.locationArea} • {rupiah(v.price)}</p>
            </div>
            <span class={v.status === 'certified' ? 'pill-green shrink-0' : 'pill-amber shrink-0'}>
              {v.status === 'certified' ? `Certified ${v.grade ?? ''}`.trim() : 'Belum Bersertifikat'}
            </span>
          </div>
        {/each}
      </div>
    </div>
    <div class="grid content-start gap-4">
      {#if !loaded}
        <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5 text-[0.8125rem] text-slate-500">Memuat permintaan…</div>
      {:else if incoming.length}
        {#each incoming as q}
          <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5">
            <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Ada Permintaan Inspeksi Baru!</p>
            <p class="mt-1 text-[0.8125rem] text-slate-500">Calon pembeli '{q.buyer}' mengajukan inspeksi TruSight untuk mobil {q.vehicle} Anda ({q.id}).</p>
            <a href={`/seller/schedule?order=${encodeURIComponent(q.id)}`} class="btn-blue mt-3 w-full">Atur & Setujui Jadwal</a>
          </div>
        {/each}
      {:else if live}
        <div class="rounded-[20px] border border-slate-100 bg-white p-5 text-center">
          <p class="font-bold">Belum ada permintaan inspeksi baru</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Permintaan dari calon pembeli akan muncul di sini dan di menu Jadwal.</p>
        </div>
      {:else}
        <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5">
          <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Ada Permintaan Inspeksi Baru!</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Calon pembeli 'Rian F.' mengajukan inspeksi TruSight untuk mobil Honda Civic Anda.</p>
          <a href="/seller/schedule" class="btn-blue mt-3 w-full">Atur & Setujui Jadwal</a>
        </div>
      {/if}
      <div class="rounded-[20px] bg-ink-900 p-5 text-white">
        <p class="font-bold">Naikkan Harga Jual Hingga 15%!</p>
        <p class="mt-1 text-[0.8125rem] text-white/70">Dapatkan lencana emas 'TruSight Certified' di listing Anda.</p>
        <a href="/seller/certification" class="mt-3 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-ink-900">Ajukan Sertifikasi Mandiri</a>
      </div>
    </div>
  </div>
  {#if msg}<p class="text-sm">{msg}</p>{/if}
</div>
