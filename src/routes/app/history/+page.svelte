<script lang="ts">
  const items = [
    { id:'#TS-98211', title:'Porsche 911 Carrera S', status:'IN PROGRESS', date:'Oct 24', note:'ENGINE DIAGNOSTICS' },
    { id:'#TS-77642', title:'BMW M4 Competition', status:'DONE', date:'Oct 12', note:'142 POINTS VERIFIED' }
  ];
</script>
<svelte:head><title>History — TruSight</title></svelte:head>
<div class="grid gap-3 lg:grid-cols-2">
  <h1 class="text-xl font-extrabold lg:col-span-2">ARCHIVE • Verification History</h1>
  {#each items as it}
    <a href="/app/report/REP-3401" class="rounded-2xl border bg-white p-4 flex justify-between items-center">
      <div><p class="font-bold text-sm">{it.title} <span class="text-xs text-slate-400">{it.id}</span></p><p class="text-xs text-slate-500">{it.date} • {it.note}</p></div>
      <span class="rounded-full px-3 py-1 text-[11px] font-bold {it.status==='DONE'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}">{it.status}</span>
    </a>
  {/each}
  {#if !items.length}<div class="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">No History Available</div>{/if}
</div>
