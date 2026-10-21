<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { Archive, ChevronLeft } from '@lucide/svelte';
  import { authed } from '$lib/guest';
  type Item = { id: string; title: string; status: string; date: string; note: string; reportId?: string };
  // Data contoh — HANYA dipakai kalau server tidak bisa dihubungi.
  // Tidak ada reportId palsu di sini: laporan yang tidak ada di database cuma
  // akan membuka halaman kosong, dan dua kartu yang menunjuk ke ID yang sama
  // membuat keduanya membuka laporan yang sama.
  const seed: Item[] = [
    { id:'#TS-98211', title:'Porsche 911 Carrera S', status:'IN PROGRESS', date:'Oct 24', note:'ENGINE DIAGNOSTICS' },
    { id:'#TS-77642', title:'BMW M4 Competition', status:'DONE', date:'Oct 12', note:'142 POINTS VERIFIED' }
  ];
  let items: Item[] = [];
  let live = false;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) { items = seed; return; }
    const r = await api.get<Record<string, unknown>[]>(`/orders/mine?buyerId=${encodeURIComponent(uid)}`);
    if (r.ok) {
      live = true;
      items = (r.data as { id: string; vehicle: string; status: string; created_at: string; report_id?: string }[]).map((o) => ({
        id: `#${o.id}`, title: o.vehicle, status: o.status === 'verified' ? 'DONE' : 'IN PROGRESS',
        date: String(o.created_at ?? '').slice(0, 10), note: o.status.toUpperCase(), reportId: o.report_id ?? undefined
      }));
    } else {
      // Server tak terjangkau — tampilkan data contoh, ditandai jelas.
      items = seed;
    }
  });
</script>
<svelte:head><title>History — TruSight</title></svelte:head>
<div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <div class="flex items-center gap-3 sm:col-span-full">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">ARCHIVE • Verification History</h1>
  </div>
  {#if $authed}
    {#if !live}
      <p class="text-xs text-slate-400 sm:col-span-full">Data contoh — server tidak bisa dihubungi. Buat order dulu untuk melihat riwayat asli.</p>
    {/if}
    {#each items as it}
      <a href={it.reportId ? `/app/report/${it.reportId}` : `/app/tracking/${it.id.replace('#', '')}`} class="rounded-2xl border bg-white p-4 flex justify-between items-center">
        <div><p class="font-bold text-sm">{it.title} <span class="text-xs text-slate-400">{it.id}</span></p><p class="text-xs text-slate-500">{it.date} • {it.note}</p></div>
        <span class="rounded-full px-3 py-1 text-[0.6875rem] font-bold {it.status==='DONE'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}">{it.status}</span>
      </a>
    {/each}
    {#if !items.length}<div class="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Belum ada riwayat inspeksi. Order pertama akan muncul di sini.</div>{/if}
  {:else}
    <div class="grid justify-items-center gap-2 rounded-2xl border bg-white p-10 text-center sm:col-span-full">
      <Archive class="size-10 text-slate-300" />
      <p class="font-bold">No History Results</p>
      <p class="max-w-xs text-[0.8125rem] text-slate-500">Access your complete verification records, real-time inspection updates, and detailed clinical reports.</p>
      <a href="/login?returnTo=%2Fapp%2Fhistory" class="btn-navy mt-1">Login / Register</a>
    </div>
  {/if}
</div>
