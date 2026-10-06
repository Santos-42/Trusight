<script lang="ts">
  import { page } from '$app/stores';
  import { X, Wrench, Car, Armchair } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import PhotoUpload from '$lib/components/inspector/PhotoUpload.svelte';
  import SignaturePad from '$lib/components/inspector/SignaturePad.svelte';
  $: id = $page.params.id;
  let tab: 'mesin' | 'bodi' | 'interior' = 'mesin', score = 85, grade = 'B+', reco = 'nego', msg = '';
  let photos: string[] = [];
  let signed = false;
  const tabs = [
    { id: 'mesin', icon: Wrench },
    { id: 'bodi', icon: Car },
    { id: 'interior', icon: Armchair }
  ] as const;
  const rows = [
    { label: 'Kondisi Pelumas & Oli Mesin', st: 'Normal' },
    { label: 'Kebocoran Radiator', st: 'Rembesan' },
    { label: 'Kebisingan Suara Mesin', st: 'Normal' },
    { label: 'Tegangan Aki Kendaraan', st: 'Normal' },
    { label: 'Kondisi Kampas Rem', st: 'Aus' }
  ];
  async function doSubmit() {
    msg = '';
    if (!photos.length) { msg = 'Tambah minimal 1 foto lapangan dulu.'; return; }
    if (!signed) { msg = 'Bubuhkan TTD digital dulu.'; return; }
    const r = await api.post<{ reportId: string }>('/inspections/submit', {
      orderId: id, inspectorId: getSession()?.id ?? 'u-bsantoso', score, grade, recommendation: reco,
      repairEstimate: 2000000,
      items: rows.map((w) => ({ category: tab, key: w.label.toLowerCase().replace(/[^a-z]+/g, '_'), label: w.label, condition: w.st })),
      photoKeys: photos
    });
    msg = r.ok ? `Laporan diterbitkan (${r.data.reportId}) + garansi 30 hari.` : r.error.message;
  }
  function submit() {
    requireAuth(() => void doSubmit(), `/inspector/form/${id}`);
  }
</script>
<svelte:head><title>Form {id} — Inspector</title></svelte:head>
<div class="grid gap-4">
  <div class="ts-appbar-flush">
    <a href="/inspector" class="ts-back" aria-label="Tutup"><X class="size-5" /></a>
    <p class="ts-appbar-title">Formulir Inspeksi Klinis</p>
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
    <div class="grid gap-4">
      <div class="flex gap-4">
        {#each tabs as t}
          <button class="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold capitalize {tab === t.id ? 'bg-ink-900 text-white' : 'text-slate-400'}" on:click={() => (tab = t.id)}>
            <svelte:component this={t.icon} class="size-4" /> {t.id}
          </button>
        {/each}
      </div>
      <div class="grid gap-3">
        {#each rows as r}
          <div class="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <p class="text-[14px] font-medium">{r.label}</p>
            <span class={r.st === 'Normal' ? 'pill-green' : 'pill-red'}>{r.st}</span>
          </div>
        {/each}
      </div>
      <PhotoUpload onDone={(r) => { photos = [...photos, r.key]; }} />
      {#if photos.length}<p class="text-xs text-slate-500">{photos.length} foto terlampir.</p>{/if}
      <SignaturePad onSave={() => { signed = true; msg = 'TTD tersimpan.'; }} />
    </div>
    <aside class="grid content-start gap-3 lg:sticky lg:top-20">
      <div class="ts-card grid gap-2">
        <p class="ts-eyebrow">Ringkasan</p>
        <label class="text-xs font-semibold">Score<input type="number" class="ts-field-sm mt-1" bind:value={score} /></label>
        <label class="text-xs font-semibold">Grade<input class="ts-field-sm mt-1" bind:value={grade} /></label>
        <label class="text-xs font-semibold">Rekomendasi<select class="ts-field-sm mt-1" bind:value={reco}><option value="beli">beli</option><option value="nego">nego</option><option value="hindari">hindari</option></select></label>
      </div>
      {#if msg}<p class="text-sm">{msg}</p>{/if}
      <button class="btn-blue w-full" on:click={submit}>Lanjutkan ke Ringkasan Laporan</button>
    </aside>
  </div>
</div>
