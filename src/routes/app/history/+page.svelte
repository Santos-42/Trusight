<script lang="ts">
  import { Archive, ChevronLeft } from '@lucide/svelte';
  import { authed } from '$lib/guest';
  const items = [
    { id:'#TS-98211', title:'Porsche 911 Carrera S', status:'IN PROGRESS', date:'Oct 24', note:'ENGINE DIAGNOSTICS' },
    { id:'#TS-77642', title:'BMW M4 Competition', status:'DONE', date:'Oct 12', note:'142 POINTS VERIFIED' }
  ];
</script>
<svelte:head><title>History — TruSight</title></svelte:head>
<div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <div class="flex items-center gap-3 sm:col-span-full">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">ARCHIVE • Verification History</h1>
  </div>
  {#if $authed}
    {#each items as it}
      <a href="/app/report/REP-3401" class="rounded-2xl border bg-white p-4 flex justify-between items-center">
        <div><p class="font-bold text-sm">{it.title} <span class="text-xs text-slate-400">{it.id}</span></p><p class="text-xs text-slate-500">{it.date} • {it.note}</p></div>
        <span class="rounded-full px-3 py-1 text-[11px] font-bold {it.status==='DONE'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}">{it.status}</span>
      </a>
    {/each}
    {#if !items.length}<div class="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">No History Available</div>{/if}
  {:else}
    <div class="grid justify-items-center gap-2 rounded-2xl border bg-white p-10 text-center sm:col-span-full">
      <Archive class="size-10 text-slate-300" />
      <p class="font-bold">No History Results</p>
      <p class="max-w-xs text-[13px] text-slate-500">Access your complete verification records, real-time inspection updates, and detailed clinical reports.</p>
      <a href="/login?returnTo=%2Fapp%2Fhistory" class="btn-navy mt-1">Login / Register</a>
    </div>
  {/if}
</div>
