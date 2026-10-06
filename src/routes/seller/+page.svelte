<script lang="ts">
  import { onMount } from 'svelte';
  import { BellRing, CircleUserRound } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { shareOrCopy } from '$lib/share';
  let msg = '';
  type Req = { id: string; vehicle: string; buyer: string; status: string };
  let incoming: Req[] = [];
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<Req[]>(`/orders/incoming?sellerId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) incoming = r.data;
  });
</script>
<svelte:head><title>Seller — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div>
    <p class="text-sm text-slate-500">Dashboard Penjual,</p>
    <h1 class="flex items-center gap-3 text-[26px] font-bold tracking-tight"><CircleUserRound class="size-12 shrink-0 text-slate-300" /> Hendra Wijaya</h1>
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-2">
    <div class="grid content-start gap-4">
      <h2 class="text-lg font-bold">Mobil Anda (1)</h2>
      <div class="ts-card flex items-start justify-between gap-2">
        <p class="text-lg font-bold">Honda Civic Turbo 2021</p>
        <span class="pill-amber shrink-0">Belum Bersertifikat</span>
      </div>
      <div class="ts-card flex items-start justify-between gap-2">
        <p class="text-lg font-bold">Toyota Fortuner VRZ 2020</p>
        <span class="pill-green shrink-0">Certified A</span>
      </div>
    </div>
    <div class="grid content-start gap-4">
      {#if incoming.length}
        {#each incoming as q}
          <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5">
            <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Ada Permintaan Inspeksi Baru!</p>
            <p class="mt-1 text-[13px] text-slate-500">Calon pembeli '{q.buyer}' mengajukan inspeksi TruSight untuk mobil {q.vehicle} Anda ({q.id}).</p>
            <a href={`/seller/schedule?order=${encodeURIComponent(q.id)}`} class="btn-blue mt-3 w-full">Atur & Setujui Jadwal</a>
          </div>
        {/each}
      {:else}
        <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5">
          <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Ada Permintaan Inspeksi Baru!</p>
          <p class="mt-1 text-[13px] text-slate-500">Calon pembeli 'Rian F.' mengajukan inspeksi TruSight untuk mobil Honda Civic Anda.</p>
          <a href="/seller/schedule" class="btn-blue mt-3 w-full">Atur & Setujui Jadwal</a>
        </div>
      {/if}
      <div class="rounded-[20px] bg-ink-900 p-5 text-white">
        <p class="font-bold">Naikkan Harga Jual Hingga 15%!</p>
        <p class="mt-1 text-[13px] text-white/70">Dapatkan lencana emas 'TruSight Certified' di listing Anda.</p>
        <a href="/seller/certification" class="mt-3 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-ink-900">Ajukan Sertifikasi Mandiri</a>
      </div>
    </div>
  </div>
  {#if msg}<p class="text-sm">{msg}</p>{/if}
</div>
