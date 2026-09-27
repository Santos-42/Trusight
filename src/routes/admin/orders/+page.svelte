<svelte:head><title>Admin Orders</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Inspection Orders</h1>
  <div class="hidden md:block overflow-auto rounded-2xl border bg-white"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500"><th class="p-3">ID</th><th class="p-3">Vehicle</th><th class="p-3">Status</th></tr></thead><tbody><tr class="border-t"><td class="p-3">#TS-9021</td><td class="p-3">Camry 2020</td><td class="p-3">Scheduled</td></tr><tr class="border-t"><td class="p-3">#TS-9022</td><td class="p-3">Civic 2021</td><td class="p-3">Pending</td></tr></tbody></table></div>
  <div class="md:hidden grid gap-2">{#each ['#TS-9021 Camry — Scheduled','#TS-9022 Civic — Pending'] as t}<div class="rounded-2xl border bg-white p-4 text-sm font-semibold">{t}</div>{/each}</div>
</div>
