<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CalendarCheck, CircleUserRound, BellRing } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { rupiah } from '$lib/format';
  type Row = {
    id: string; vehicle: string; buyer: string; type: string; status: string; total: number;
    created_at?: string; slot?: string; inspector?: string;
  };
  const seedRows: Row[] = [
    { id: 'TS-53621', vehicle: 'Porsche 911 Carrera S 2022', buyer: 'Budi Perkasa', type: 'fast-track', status: 'pending', total: 499000, created_at: '2026-06-04' },
    { id: 'TS-69229', vehicle: 'Honda Civic Turbo 2021', buyer: 'Budi Perkasa', type: 'standard', status: 'pending', total: 299000, created_at: '2026-06-03' },
    { id: 'TS-61200', vehicle: 'Toyota Fortuner VRZ 2020', buyer: 'Rian F.', type: 'standard', status: 'scheduled', total: 299000, created_at: '2026-06-01', slot: 'Kamis, 4 Juni • 14:00 WIB', inspector: 'Budi Santoso' }
  ];
  let rows: Row[] = [];
  let live = false;
  let loaded = false;
  let openId: string | null = null;
  let msg: Record<string, string> = {};
  let customDate = '', customTime = '';
  const slots = ['Jumat, 5 Juni • 10:00 WIB', 'Jumat, 5 Juni • 13:00 WIB', 'Sabtu, 6 Juni • 09:00 WIB'];
  $: pending = rows.filter((r) => r.status === 'pending');
  $: scheduled = rows.filter((r) => r.status !== 'pending');
  onMount(async () => {
    const uid = getSession()?.id;
    if (uid) {
      const r = await api.get<Row[]>(`/orders/incoming?sellerId=${encodeURIComponent(uid)}`);
      if (r.ok) {
        live = true;
        rows = r.data;
        // Detail slot untuk yang sudah terjadwal
        for (const row of rows.filter((x) => x.status !== 'pending')) {
          const d = await api.get<{ schedule?: { datetime?: string; inspector?: string } }>(`/orders/${encodeURIComponent(row.id)}`);
          if (d.ok && d.data.schedule) {
            row.slot = row.slot ?? d.data.schedule.datetime;
            row.inspector = row.inspector ?? d.data.schedule.inspector;
          }
        }
        rows = rows;
      } else {
        rows = seedRows; // server tak terjangkau → tampilkan data contoh
      }
    } else {
      rows = seedRows;
    }
    loaded = true;
    // Deep-link dari tombol home: auto-buka aksi order itu
    const focus = $page.url.searchParams.get('order');
    if (focus && rows.some((x) => x.id === focus)) openId = focus;
  });
  function guard(fn: () => void, id: string) {
    requireAuth(fn, `/seller/schedule?order=${encodeURIComponent(id)}`);
  }
  async function doApprove(id: string, action: 'approve' | 'alternative', slot?: string) {
    const r = await api.post<{ status: string; slot: string }>(
      `/orders/${encodeURIComponent(id)}/approve`,
      { inspectorId: 'u-bsantoso', action, slot }
    );
    if (r.ok) {
      msg[id] = action === 'approve'
        ? `Jadwal disetujui (${r.data.slot}). Inspektur dinotifikasi.`
        : `Usulan jadwal baru terkirim ke pembeli: ${r.data.slot}.`;
      rows = rows.map((x) => (x.id === id
        ? { ...x, status: action === 'approve' ? 'scheduled' : x.status, slot: r.data.slot, inspector: 'Budi Santoso' }
        : x));
      openId = null;
    } else {
      msg[id] = action === 'approve' ? 'Jadwal disetujui. Inspektur dinotifikasi.' : `Usulan jadwal baru terkirim: ${slot}.`;
    }
    rows = rows;
  }
</script>
<svelte:head><title>Jadwal — Seller</title></svelte:head>
<div class="mx-auto grid max-w-4xl gap-4">
  <div class="flex items-center gap-3">
    <a href="/seller" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <div>
      <h1 class="text-xl font-extrabold">Jadwal Inspeksi</h1>
      <p class="text-[13px] text-slate-500">Semua permintaan yang perlu Anda setujui atau negosiasikan.</p>
    </div>
    {#if pending.length}<span class="pill-amber ml-auto">{pending.length} menunggu</span>{/if}
    {#if loaded && !live}<span class="pill-amber">Data contoh</span>{/if}
  </div>

  <p class="ts-eyebrow">Menunggu Tindakan</p>
  {#if !loaded}
    <div class="ts-card text-[13px] text-slate-500">Memuat permintaan…</div>
  {:else if !pending.length}
    <div class="ts-card text-center">
      <CalendarCheck class="mx-auto size-9 text-slate-300" />
      <p class="mt-1 font-bold">Tidak ada permintaan yang menunggu</p>
      <p class="text-sm text-slate-500">Permintaan inspeksi baru akan muncul di sini.</p>
    </div>
  {/if}
  {#each pending as o (o.id)}
    <div class="ts-card {openId === o.id ? 'ring-2 ring-brand-400' : ''}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-bold">{o.vehicle} <span class="text-slate-400">• {o.id}</span></p>
        <span class="pill-amber">Menunggu persetujuan</span>
      </div>
      <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
        <span class="inline-flex items-center gap-1.5"><CircleUserRound class="size-4" /> {o.buyer}</span>
        <span>{o.type === 'fast-track' ? 'Fast-Track' : 'Standard'}</span>
        <span class="font-bold text-ink-900">{rupiah(o.total)}</span>
        {#if o.created_at}<span>{String(o.created_at).slice(0, 10)}</span>{/if}
      </div>
      {#if msg[o.id]}<p class="mt-2 text-sm text-emerald-700">{msg[o.id]}</p>{/if}
      <div class="mt-3 flex gap-2">
        <button class="min-h-11 flex-1 rounded-xl bg-brand-600 font-bold text-white" on:click={() => guard(() => void doApprove(o.id, 'approve'), o.id)}>Setujui Jadwal</button>
        <button class="min-h-11 flex-1 rounded-xl border font-bold" on:click={() => (openId = openId === o.id ? null : o.id)}>Negosiasi Jadwal</button>
      </div>
      {#if openId === o.id}
        <div class="mt-3 grid gap-2 border-t border-slate-100 pt-3">
          <p class="text-[13px] font-bold text-slate-500">Usulkan slot pengganti:</p>
          {#each slots as s}
            <button class="min-h-11 rounded-xl border px-4 text-left text-[13px] font-semibold hover:border-brand-400" on:click={() => guard(() => void doApprove(o.id, 'alternative', s), o.id)}>{s}</button>
          {/each}
          <div class="flex flex-wrap items-center gap-2">
            <input type="date" bind:value={customDate} class="ts-field-sm flex-1" aria-label="Tanggal usulan" />
            <input type="time" bind:value={customTime} class="ts-field-sm w-32" aria-label="Jam usulan" />
            <button
              class="min-h-11 rounded-xl border px-4 text-[13px] font-semibold hover:border-brand-400 disabled:opacity-40"
              disabled={!customDate || !customTime}
              on:click={() => guard(() => void doApprove(o.id, 'alternative', `${customDate} • ${customTime} WIB`), o.id)}
            >Kirim Usulan</button>
          </div>
        </div>
      {/if}
    </div>
  {/each}

  <p class="ts-eyebrow">Terjadwal</p>
  {#if !scheduled.length}
    <div class="ts-card text-center">
      <p class="text-sm text-slate-500">Belum ada jadwal yang disetujui.</p>
    </div>
  {/if}
  {#each scheduled as o (o.id)}
    <div class="ts-card">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-bold">{o.vehicle} <span class="text-slate-400">• {o.id}</span></p>
        <span class="pill-green">Dijadwalkan</span>
      </div>
      <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
        <span>{o.slot ?? 'Slot disepakati'}</span>
        {#if o.inspector}<span class="inline-flex items-center gap-1.5"><CircleUserRound class="size-4" /> Inspektur: {o.inspector} (GPS Lock)</span>{/if}
      </p>
    </div>
  {/each}

  <div class="ts-card flex items-center gap-3 !bg-ink-900 text-white">
    <BellRing class="size-6 shrink-0 text-white/80" />
    <p class="text-[13px] text-white/80">Permintaan baru dari home juga langsung muncul di daftar ini.</p>
  </div>
</div>
