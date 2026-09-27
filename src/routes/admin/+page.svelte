<script lang="ts">
  import AdminChart from '$lib/components/admin/AdminChart.svelte';
</script>
<svelte:head><title>Admin — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div>
    <p class="text-sm text-slate-500">TruSight Admin</p>
    <h1 class="text-[24px] font-bold tracking-tight">Overview Dashboard</h1>
    <p class="text-[13px] text-slate-500">Real-time statistics, inspection tracking, and inspector status.</p>
  </div>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {#each [['Orders', '1.105'], ['Pending', '12'], ['Inspeksi hari ini', '8'], ['Revenue', 'Rp 3,2 Jt']] as [k, v]}
      <div class="ts-card"><p class="ts-eyebrow">{k}</p><p class="mt-1 text-xl font-extrabold">{v}</p></div>
    {/each}
  </div>
  <AdminChart />
  <div class="ts-card text-sm">#TS-9021 Camry 2020 • #TS-9022 Civic 2021 • <a class="font-bold text-brand-600" href="/admin/orders">Kelola →</a></div>
</div>
