<script lang="ts">
  const tabs = ['All Orders', 'Pending', 'Scheduled', 'In Progress', 'Verified', 'Failed'];
  let tab = 'All Orders';
  let rows = [
    { id: '#TS-9021', car: 'Toyota Camry 2020', cust: 'Rian Santoso', sched: '04 Jun, 10:00', insp: 'Budi Wijaya', st: 'Verified', pay: 'Paid' },
    { id: '#TS-9022', car: 'Honda Civic 2018', cust: 'Anita Putri', sched: '04 Jun, 14:00', insp: 'Dedi Setiadi', st: 'In Progress', pay: 'Paid' },
    { id: '#TS-9023', car: 'Mitsubishi Pajero 2021', cust: 'Farhan Aziz', sched: 'Pending', insp: 'Unassigned', st: 'Pending', pay: 'Unpaid' },
    { id: '#TS-9024', car: 'Suzuki Swift 2019', cust: 'Dian Pratama', sched: '05 Jun, 09:00', insp: 'Hendra Lesmana', st: 'Scheduled', pay: 'Paid' },
    { id: '#TS-9025', car: 'Hyundai Creta 2022', cust: 'Riko AJ', sched: '03 Jun, 11:00', insp: 'Budi Wijaya', st: 'Failed', pay: 'Refunded' }
  ];
  $: filtered = tab === 'All Orders' ? rows : rows.filter((r) => r.st === tab);
  function assign(id: string) {
    rows = rows.map((r) => (r.id === id ? { ...r, insp: 'Budi Santoso', sched: '06 Jun, 10:00', st: 'Scheduled', pay: 'Paid' } : r));
  }
  function stCls(s: string) {
    return s === 'Verified' ? 'pill-green' : s === 'In Progress' ? 'pill-blue' : s === 'Pending' ? 'pill-amber' : s === 'Failed' ? 'pill-red' : 'pill';
  }
  function payCls(p: string) {
    return p === 'Paid' ? 'pill-green' : p === 'Unpaid' ? 'pill-red' : 'pill';
  }
</script>
<svelte:head><title>Admin Orders — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div>
    <p class="text-sm text-slate-500">TruSight Admin</p>
    <h1 class="text-[24px] font-bold tracking-tight">Inspection Orders</h1>
    <p class="text-[13px] text-slate-500">Manage, track, and assign verifikators for used car inspections.</p>
  </div>
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each tabs as t}
      <button class="shrink-0 rounded-full px-4 py-2 text-xs font-semibold {tab === t ? 'bg-ink-900 text-white' : 'bg-white text-slate-500'}" on:click={() => (tab = t)}>{t}</button>
    {/each}
  </div>
  <div class="hidden overflow-auto rounded-[20px] bg-white shadow-sm md:block">
    <table class="w-full text-[13px]">
      <thead><tr class="text-left text-slate-400"><th class="p-4 font-semibold">ID</th><th class="p-4 font-semibold">Vehicle Model</th><th class="p-4 font-semibold">Customer</th><th class="p-4 font-semibold">Schedule</th><th class="p-4 font-semibold">Inspector</th><th class="p-4 font-semibold">Status</th><th class="p-4 font-semibold">Payment</th><th class="p-4 font-semibold">Action</th></tr></thead>
      <tbody>
        {#each filtered as r}
          <tr class="border-t border-slate-100">
            <td class="p-4 font-bold">{r.id}</td><td class="p-4">{r.car}</td><td class="p-4">{r.cust}</td><td class="p-4">{r.sched}</td><td class="p-4">{r.insp}</td>
            <td class="p-4"><span class={stCls(r.st)}>{r.st}</span></td>
            <td class="p-4"><span class={payCls(r.pay)}>{r.pay}</span></td>
            <td class="p-4">{#if r.st === 'Pending'}<button class="font-bold text-brand-600" on:click={() => assign(r.id)}>Assign</button>{:else}<a href="/admin/reports" class="font-bold text-brand-600">View</a>{/if}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="grid gap-2 md:hidden">
    {#each filtered as r}
      <div class="ts-card grid gap-1 text-sm">
        <div class="flex justify-between"><b>{r.id}</b><span class={stCls(r.st)}>{r.st}</span></div>
        <p class="text-slate-500">{r.car} • {r.cust} • {r.sched}</p>
      </div>
    {/each}
  </div>
</div>
