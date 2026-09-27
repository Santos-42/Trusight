<script lang="ts">
  import { page } from '$app/stores';
  import { X, Wrench, Car, Armchair } from '@lucide/svelte';
  import { api } from '$lib/api';
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
  async function submit() {
    msg = '';
    if (!photos.length) { msg = 'Mockup: tambah minimal 1 foto lapangan dulu.'; return; }
    if (!signed) { msg = 'Mockup: bubuhkan TTD digital dulu.'; return; }
    const r = await api.post(`/inspections/${id}/submit`, { score, grade, recommendation: reco, repair_estimate: 2000000, summary: 'Butuh perbaikan ringan' });
    msg = r.ok ? 'Laporan diterbitkan + garansi 30 hari (mockup).' : r.error.message;
  }
</script>
<svelte:head><title>Form {id} — Inspector</title></svelte:head>
<div class="mx-auto grid max-w-4xl gap-4">
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
      {#if photos.length}<p class="text-xs text-slate-500">{photos.length} foto mockup terlampir.</p>{/if}
      <SignaturePad onSave={() => { signed = true; msg = 'TTD tersimpan (mockup lokal).'; }} />
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
