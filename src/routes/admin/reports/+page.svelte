<script lang="ts">
  const stats = [
    { k: 'Published Reports', v: '1.105', d: 'Live', dc: 'pill-green' },
    { k: 'Pending Reviews', v: '12', d: 'Audit Required', dc: 'pill-amber' },
    { k: 'Avg Inspection Score', v: '88.4%', d: 'Clinical Standard', dc: 'pill-blue' }
  ];
  const rows = [
    { id: '#REP-3401', car: 'Porsche 911 Carrera S', insp: 'Budi Santoso', score: '94 / 100', sc: 'text-emerald-600', st: 'Published', date: '03 Jun 2026', act: 'Download' },
    { id: '#REP-3402', car: 'Civic Turbo 2021', insp: 'Firman Comstir', score: '85 / 100', sc: 'text-brand-600', st: 'Pending Review', date: '03 Jun 2026', act: 'Review' },
    { id: '#REP-3403', car: 'Avanza Veloz 2022', insp: 'Budi Santoso', score: '76 / 100', sc: 'text-amber-600', st: 'Draft', date: '02 Jun 2026', act: 'Edit' }
  ];
  const stPill = (s: string) => s === 'Published' ? 'pill-green' : s === 'Pending Review' ? 'pill-amber' : 'pill';
  let msg = '';
</script>
<svelte:head><title>Admin Reports</title></svelte:head>
<div class="grid gap-4">
  <div>
    <h1 class="text-[24px] font-bold tracking-tight">Inspection Reports</h1>
    <p class="text-[13px] text-slate-500">Audit, verify, and publish clinical vehicle inspection reports.</p>
  </div>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {#each stats as s}
      <div class="ts-card"><p class="ts-eyebrow">{s.k}</p><p class="mt-1 flex flex-wrap items-center gap-2 text-xl font-extrabold">{s.v} <span class={s.dc}>{s.d}</span></p></div>
    {/each}
  </div>
  {#if msg}<p class="text-sm text-emerald-700">{msg}</p>{/if}
  <div class="ts-card overflow-x-auto !p-0">
    <table class="w-full min-w-[680px] text-sm">
      <thead><tr class="text-left text-slate-400"><th class="px-4 py-3 font-semibold">Report ID</th><th class="px-4 py-3 font-semibold">Vehicle Model</th><th class="px-4 py-3 font-semibold">Inspector</th><th class="px-4 py-3 font-semibold">Score</th><th class="px-4 py-3 font-semibold">Status</th><th class="px-4 py-3 font-semibold">Date</th><th class="px-4 py-3 font-semibold">Action</th></tr></thead>
      <tbody>
        {#each rows as r}
          <tr class="border-t border-slate-100">
            <td class="px-4 py-3 font-semibold">{r.id}</td><td class="px-4 py-3">{r.car}</td><td class="px-4 py-3">{r.insp}</td>
            <td class="px-4 py-3 font-bold {r.sc}">{r.score}</td>
            <td class="px-4 py-3"><span class={stPill(r.st)}>{r.st}</span></td><td class="px-4 py-3">{r.date}</td>
            <td class="px-4 py-3"><button class="font-bold text-brand-600" on:click={() => (msg = `${r.act} ${r.id} segera hadir.`)}>{r.act}</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
