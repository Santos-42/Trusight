<svelte:head><title>Inspector — TruSight</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Selamat Tugas • Budi Santoso (#1294) • 4.9 Pro</h1>
  {#each [{t:'Honda Civic Turbo 2021 • 14:00-15:30 • Kalibata (3.2 km)', id:'insp-1'},{t:'Avanza Veloz 2022 • 16:00-17:30 • Tebet (5.1 km)', id:'insp-2'}] as j}
    <div class="rounded-2xl border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <p class="text-sm font-semibold">{j.t}</p>
      <a href={`/inspector/task/${j.id}`} class="min-h-11 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white">Mulai Tugas</a>
    </div>
  {/each}
</div>
