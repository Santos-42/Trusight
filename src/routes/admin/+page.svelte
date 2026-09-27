<svelte:head><title>Admin — TruSight</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Admin Overview • Realtime</h1>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {#each [['Orders','1.105'],['Pending','12'],['Inspeksi hari ini','8'],['Revenue','Rp 3,2 Jt']] as [k,v]}
      <div class="rounded-2xl border bg-white p-4"><p class="text-xs text-slate-500">{k}</p><p class="text-xl font-extrabold">{v}</p></div>
    {/each}
  </div>
  <div class="rounded-2xl border bg-white p-4 text-sm">#TS-9021 Camry 2020 • #TS-9022 Civic 2021 • <a class="font-bold text-brand-700" href="/admin/orders">Kelola →</a></div>
</div>
