<script lang="ts">
  import AdminChart from '$lib/components/admin/AdminChart.svelte';
  const stats = [
    { k: 'Active Inspections', v: '24', d: '+12%', dc: 'pill-green' },
    { k: 'Pending Assignments', v: '5', d: 'Action req', dc: 'pill-amber' },
    { k: 'Total Verified Cars', v: '1.284', d: '+6%', dc: 'pill-blue' },
    { k: 'Monthly Revenue', v: 'Rp 48,2 Jt', d: '+22%', dc: 'pill-green' }
  ];
  const recent = [
    { id: '#TS-9021', car: 'Civic Turbo 2021', cust: 'Rian F', insp: 'Budi Santoso', st: 'Verified' },
    { id: '#TS-9022', car: 'Avanza Veloz 2022', cust: 'Anita Putri', insp: 'Firman Comstir', st: 'In Progress' },
    { id: '#TS-9023', car: 'Porsche 911 Carrera S', cust: 'Farhan Adi', insp: 'Unassigned', st: 'Pending' }
  ];
  const avail = [
    { n: 'Budi Santoso', s: 'On-duty', c: 'Civic 2021', ini: 'BS' },
    { n: 'Firman Comstir', s: 'Active', c: 'Avanza 2022', ini: 'FC' },
    { n: 'Dedi Setiadi', s: 'Offline', c: '—', ini: 'DS' }
  ];
  const stPill = (s: string) => s === 'Verified' ? 'pill-green' : s === 'In Progress' ? 'pill-blue' : 'pill-amber';
</script>
<svelte:head><title>Admin — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p class="text-sm text-slate-500">TruSight Admin</p>
      <h1 class="text-[24px] font-bold tracking-tight">Overview Dashboard</h1>
      <p class="text-[13px] text-slate-500">Real-time statistics, inspection tracking, and inspector status.</p>
    </div>
    <a href="/admin/orders" class="inline-flex min-h-11 items-center rounded-xl bg-ink-900 px-4 text-sm font-bold text-white">+ New Inspection Request</a>
  </div>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {#each stats as s}
      <div class="ts-card"><p class="ts-eyebrow">{s.k}</p><p class="mt-1 flex flex-wrap items-center gap-2 text-xl font-extrabold">{s.v} <span class={s.dc}>{s.d}</span></p></div>
    {/each}
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-3">
    <div class="ts-card overflow-x-auto !p-0 lg:col-span-2">
      <p class="p-4 font-bold">Recent Inspection Requests</p>
      <table class="w-full min-w-[560px] text-sm">
        <thead><tr class="text-left text-slate-400"><th class="px-4 py-2 font-semibold">ID</th><th class="px-4 py-2 font-semibold">Vehicle</th><th class="px-4 py-2 font-semibold">Customer</th><th class="px-4 py-2 font-semibold">Inspector</th><th class="px-4 py-2 font-semibold">Status</th><th class="px-4 py-2 font-semibold">Action</th></tr></thead>
        <tbody>
          {#each recent as r}
            <tr class="border-t border-slate-100">
              <td class="px-4 py-3 font-semibold">{r.id}</td><td class="px-4 py-3">{r.car}</td><td class="px-4 py-3">{r.cust}</td><td class="px-4 py-3">{r.insp}</td>
              <td class="px-4 py-3"><span class={stPill(r.st)}>{r.st}</span></td>
              <td class="px-4 py-3"><a href="/admin/orders" class="font-bold text-brand-600">{r.st === 'Pending' ? 'Assign' : 'View'}</a></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="ts-card">
      <p class="font-bold">Inspector Availability</p>
      <div class="mt-3 grid gap-3">
        {#each avail as a}
          <div class="flex items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">{a.ini}</span>
            <div class="min-w-0"><p class="truncate text-sm font-bold">{a.n}</p><p class="text-xs text-slate-500">{a.s} • {a.c}</p></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <AdminChart />
</div>
