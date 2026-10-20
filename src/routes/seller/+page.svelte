<script lang="ts">
  import { onMount } from 'svelte';
  import { BellRing, CalendarClock, CircleUserRound } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { mockVehicles, certificationBadge, type MockVehicle } from '$lib/mocks';
  import { rupiah } from '$lib/format';
  let msg = '';
  // Permintaan "mau lihat mobil" — dari order RAHASIA. Datang tanpa konteks
  // inspeksi, seller cukup melihatnya sebagai calon pembeli biasa.
  type Viewing = { request_id: string; vehicle: string; requester: string; slot: string; status: string };
  // Order purna-beli (garansi / sertifikasi) — di sini seller memang tahu itu inspeksi.
  type Req = { id: string; vehicle: string; buyer: string; status: string };
  let viewings: Viewing[] = [];
  let incoming: Req[] = [];
  let live = false;
  let loaded = false;
  // Katalog milik seller — hanya locationArea (kota/kecamatan); lokasi detail tidak
  // pernah dikirim ke seller (lihat src/lib/server/d1.ts listOrders).
  let myVehicles = [...mockVehicles];

  /** Hasil inspeksi baru boleh terlihat seller SETELAH mobil terjual. */
  function badgeOf(v: MockVehicle): { cls: string; label: string } {
    const b = certificationBadge(v);
    if (b.revealed) return { cls: 'pill-green shrink-0', label: b.grade ? `Certified ${b.grade}` : 'Terjual' };
    return { cls: 'pill-amber shrink-0', label: 'Dijual' };
  }

  async function markSold(id: string) {
    const r = await api.post(`/vehicles/${id}/sold`, {});
    if (!r.ok) return;
    const target = myVehicles.find((x) => x.id === id);
    if (target) target.status = 'sold';
    myVehicles = [...myVehicles];
  }

  onMount(async () => {
    const uid = getSession()?.id;
    if (uid) {
      const v = await api.get<Viewing[]>(`/viewings/incoming?sellerId=${encodeURIComponent(uid)}`);
      if (v.ok) viewings = v.data;

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
              {#if v.status !== 'sold'}
                <button class="mt-1 text-xs font-bold text-brand-600" on:click={() => markSold(v.id)}>Tandai Terjual</button>
              {/if}
            </div>
            <span class={badgeOf(v).cls}>{badgeOf(v).label}</span>
          </div>
        {/each}
      </div>
    </div>
    <div class="grid content-start gap-4">
      {#if !loaded}
        <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5 text-[0.8125rem] text-slate-500">Memuat permintaan…</div>
      {:else if viewings.length}
        {#each viewings as q (q.request_id)}
          <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5">
            <p class="flex items-center gap-2 font-bold"><CalendarClock class="size-5" /> Ada yang mau lihat mobil Anda</p>
            <p class="mt-1 text-[0.8125rem] text-slate-500">Calon pembeli '{q.requester}' ingin melihat {q.vehicle} Anda.</p>
            <a href="/seller/schedule" class="btn-blue mt-3 w-full">Atur Waktu Lihat</a>
          </div>
        {/each}
      {:else if live}
        <div class="rounded-[20px] border border-slate-100 bg-white p-5 text-center">
          <p class="font-bold">Belum ada yang mau lihat mobil Anda</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Permintaan dari calon pembeli akan muncul di sini dan di menu Jadwal.</p>
        </div>
      {/if}

      {#each incoming as q (q.id)}
        <div class="rounded-[20px] border border-slate-100 bg-white p-5">
          <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Permintaan Inspeksi Purna-Beli</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Pemilik mobil '{q.buyer}' mengajukan inspeksi untuk mobil {q.vehicle} ({q.id}).</p>
          <a href={`/seller/schedule?order=${encodeURIComponent(q.id)}`} class="btn-blue mt-3 w-full">Atur &amp; Setujui Jadwal</a>
        </div>
      {/each}
      <div class="rounded-[20px] bg-ink-900 p-5 text-white">
        <p class="font-bold">Naikkan Harga Jual Hingga 15%!</p>
        <p class="mt-1 text-[0.8125rem] text-white/70">Dapatkan lencana emas 'TruSight Certified' di listing Anda.</p>
        <a href="/seller/certification" class="mt-3 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-ink-900">Ajukan Sertifikasi Mandiri</a>
      </div>
    </div>
  </div>
  {#if msg}<p class="text-sm">{msg}</p>{/if}
</div>
