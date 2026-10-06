<script lang="ts">
  import { buildReportPdf } from '$lib/reportPdf';
  const stats = [
    { k: 'Published Reports', v: '1.105', d: 'Live', dc: 'pill-green' },
    { k: 'Pending Reviews', v: '12', d: 'Audit Required', dc: 'pill-amber' },
    { k: 'Avg Inspection Score', v: '88.4%', d: 'Clinical Standard', dc: 'pill-blue' }
  ];
  type Row = { id: string; car: string; insp: string; score: number; st: string; date: string };
  let rows: Row[] = [
    { id: '#REP-3401', car: 'Porsche 911 Carrera S', insp: 'Budi Santoso', score: 94, st: 'Published', date: '03 Jun 2026' },
    { id: '#REP-3402', car: 'Civic Turbo 2021', insp: 'Firman Comstir', score: 85, st: 'Pending Review', date: '03 Jun 2026' },
    { id: '#REP-3403', car: 'Avanza Veloz 2022', insp: 'Budi Santoso', score: 76, st: 'Draft', date: '02 Jun 2026' }
  ];
  let editing: string | null = null;
  let editScore = 0;
  let msg = '';
  const stPill = (s: string) => s === 'Published' ? 'pill-green' : s === 'Pending Review' ? 'pill-amber' : 'pill';
  const scoreCls = (s: number) => s >= 90 ? 'text-emerald-600' : s >= 80 ? 'text-brand-600' : 'text-amber-600';
  function review(id: string) {
    rows = rows.map((r) => (r.id === id ? { ...r, st: 'Published' } : r));
    msg = `${id} dipublish.`;
  }
  async function download(r: Row) {
    msg = '';
    const blob = await buildReportPdf({ reportId: r.id, vehicle: r.car, score: r.score, grade: r.score >= 90 ? 'A' : r.score >= 80 ? 'B' : 'C', inspector: r.insp, date: r.date });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${r.id.replace('#', '')}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    msg = `${r.id} terunduh.`;
  }
  function startEdit(r: Row) {
    editing = r.id;
    editScore = r.score;
  }
  function saveEdit(id: string) {
    const s = Math.max(0, Math.min(100, Math.round(editScore) || 0));
    rows = rows.map((r) => (r.id === id ? { ...r, score: s } : r));
    editing = null;
    msg = `${id} skor diperbarui ke ${s}.`;
  }
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
            <td class="px-4 py-3 font-bold {scoreCls(r.score)}">{r.score} / 100</td>
            <td class="px-4 py-3"><span class={stPill(r.st)}>{r.st}</span></td><td class="px-4 py-3">{r.date}</td>
            <td class="px-4 py-3">
              {#if r.st === 'Published'}
                <button class="font-bold text-brand-600" title="Unduh PDF laporan" on:click={() => download(r)}>Download</button>
              {:else if r.st === 'Pending Review'}
                <button class="font-bold text-brand-600" title="Setujui dan publish laporan" on:click={() => review(r.id)}>Review</button>
              {:else if editing === r.id}
                <span class="flex items-center gap-1">
                  <input type="number" min="0" max="100" bind:value={editScore} class="w-16 rounded-lg border px-2 py-1 text-sm" aria-label="Skor baru" />
                  <button class="font-bold text-emerald-600" on:click={() => saveEdit(r.id)}>Simpan</button>
                </span>
              {:else}
                <button class="font-bold text-brand-600" title="Ubah skor laporan" on:click={() => startEdit(r)}>Edit</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
