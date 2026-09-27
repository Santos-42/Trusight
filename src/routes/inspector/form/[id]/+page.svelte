<script lang="ts">
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import PhotoUpload from '$lib/components/inspector/PhotoUpload.svelte';
  import SignaturePad from '$lib/components/inspector/SignaturePad.svelte';
  $: id = $page.params.id;
  let tab:'mesin'|'bodi'|'interior'='mesin', score=85, grade='B+', reco='nego', msg='';
  let photos: string[] = [];
  let signed = false;

  async function submit(){
    msg='';
    if (!photos.length) { msg = 'Mockup: tambah minimal 1 foto lapangan dulu.'; return; }
    if (!signed) { msg = 'Mockup: bubuhkan TTD digital dulu.'; return; }
    const r = await api.post(`/inspections/${id}/submit`, { score, grade, recommendation: reco, repair_estimate: 2000000, summary: 'Butuh perbaikan ringan' });
    msg = r.ok ? 'Laporan diterbitkan + garansi 30 hari (mockup).' : r.error.message;
  }
</script>
<svelte:head><title>Form {id} — Inspector</title></svelte:head>
<div class="grid gap-3 max-w-2xl">
  <h1 class="text-xl font-extrabold">Formulir Inspeksi Klinis • {id}</h1>
  <div class="flex gap-2">{#each ['mesin','bodi','interior'] as c}<button class="rounded-xl border px-4 min-h-11 text-sm font-bold {tab===c?'bg-brand-50 border-brand-600':''}" on:click={()=>tab=c}>{c}</button>{/each}</div>
  <div class="rounded-2xl border bg-white p-5 text-sm grid gap-2">
    <p>Oli Mesin: Normal • Radiator: Rembesan • Aki: Normal • Rem: Aus</p>
    <div class="grid sm:grid-cols-3 gap-2">
      <label>Score<input type="number" class="min-h-11 w-full rounded-xl border px-3" bind:value={score} /></label>
      <label>Grade<input class="min-h-11 w-full rounded-xl border px-3" bind:value={grade} /></label>
      <label>Rekomendasi<select class="min-h-11 w-full rounded-xl border px-3" bind:value={reco}><option value="beli">beli</option><option value="nego">nego</option><option value="hindari">hindari</option></select></label>
    </div>
  </div>
  <PhotoUpload onDone={(r) => { photos = [...photos, r.key]; }} />
  {#if photos.length}<p class="text-xs text-slate-500">{photos.length} foto mockup terlampir.</p>{/if}
  <SignaturePad onSave={() => { signed = true; msg = 'TTD tersimpan (mockup lokal).'; }} />
  {#if msg}<p class="text-sm">{msg}</p>{/if}
  <button class="min-h-12 rounded-2xl bg-brand-600 font-bold text-white" on:click={submit}>Tanda Tangan & Terbitkan</button>
</div>
