<script lang="ts">
  import LicensePreview from '$lib/components/license/LicensePreview.svelte';

  // licImg menunjuk ke static/licenses/*.jpg — kalau belum ada filenya, tampil fallback inisial.
  const dir = [
    { n: 'Budi Santoso', ini: 'BS', lic: '#LIC-1294', licImg: '/licenses/lic-1294.jpg', region: 'DKI Jakarta', jobs: '420+ jobs', rating: '4.9', st: 'On-duty' },
    { n: 'Firman Comstir', ini: 'FC', lic: '#LIC-2100', licImg: '/licenses/lic-2100.jpg', region: 'Bandung', jobs: '186 jobs', rating: '4.8', st: 'Active' },
    { n: 'Dedi Setiadi', ini: 'DS', lic: '#LIC-2101', licImg: '/licenses/lic-2101.jpg', region: 'Bekasi', jobs: '98 jobs', rating: '4.7', st: 'Offline' }
  ];
  const pending = [
    { n: 'Ahmad Sugeng', w: 'Jakarta Timur', ini: 'AS', licImg: '/licenses/sample-license.jpg' },
    { n: 'Indra Wijaya', w: 'Bekasi Kota', ini: 'IW', licImg: null as string | null }
  ];
  const stPill = (s: string) => s === 'On-duty' ? 'pill-green' : s === 'Active' ? 'pill-blue' : 'pill';
  let msg = '';
</script>
<svelte:head><title>Admin Inspectors</title></svelte:head>
<div class="grid gap-4">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-[1.5rem] font-bold tracking-tight">Certified Inspectors</h1>
      <p class="text-[0.8125rem] text-slate-500">Manage verificator licenses, rating performance, and active duty assignments.</p>
    </div>
    <button class="inline-flex min-h-11 items-center rounded-xl bg-ink-900 px-4 text-sm font-bold text-white" on:click={() => (msg = 'Tambah inspektor segera hadir.')}>+ Add New Inspector</button>
  </div>
  {#if msg}<p class="text-sm text-emerald-700">{msg}</p>{/if}
  <div class="grid items-start gap-4 lg:grid-cols-3">
    <div class="ts-card overflow-x-auto !p-0 lg:col-span-2">
      <p class="p-4 font-bold">Directory</p>
      <table class="w-full min-w-[780px] text-sm">
        <thead><tr class="text-left text-slate-400"><th class="px-4 py-2 font-semibold">Inspector</th><th class="px-4 py-2 font-semibold">License ID</th><th class="px-4 py-2 font-semibold">License</th><th class="px-4 py-2 font-semibold">Region</th><th class="px-4 py-2 font-semibold">Completed</th><th class="px-4 py-2 font-semibold">Rating</th><th class="px-4 py-2 font-semibold">Status</th><th class="px-4 py-2 font-semibold">Action</th></tr></thead>
        <tbody>
          {#each dir as d}
            <tr class="border-t border-slate-100">
              <td class="px-4 py-3"><span class="mr-2 inline-grid size-8 place-items-center rounded-full bg-ink-900 align-middle text-[0.6875rem] font-bold text-white">{d.ini}</span><span class="font-semibold">{d.n}</span></td>
              <td class="px-4 py-3">{d.lic}</td>
              <td class="px-4 py-3">
                <LicensePreview src={d.licImg} alt={`Lisensi ${d.n}`} initials={d.ini} size="sm" />
              </td>
              <td class="px-4 py-3">{d.region}</td><td class="px-4 py-3">{d.jobs}</td><td class="px-4 py-3">☆ {d.rating}</td>
              <td class="px-4 py-3"><span class={stPill(d.st)}>{d.st}</span></td>
              <td class="px-4 py-3"><button class="font-bold text-brand-600" on:click={() => (msg = `Edit ${d.n} segera hadir.`)}>Edit</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="ts-card">
      <p class="font-bold">Pending Applications</p>
      <div class="mt-3 grid gap-3">
        {#each pending as p}
          <div class="flex items-center gap-3">
            <LicensePreview src={p.licImg} alt={`Lisensi diajukan ${p.n}`} initials={p.ini} size="sm" />
            <div class="min-w-0"><p class="truncate text-sm font-bold">{p.n}</p><p class="text-xs text-slate-500">Region: {p.w}</p><p class="text-xs text-slate-400">Menunggu verifikasi lisensi</p></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
