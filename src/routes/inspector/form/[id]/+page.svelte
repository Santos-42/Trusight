<script lang="ts">
  import { page } from '$app/stores';
  import { X, Wrench, Car, Armchair } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { gradeFromScore, recoFromScore, recoLabel } from '$lib/format';
  import PhotoUpload from '$lib/components/inspector/PhotoUpload.svelte';
  import SignaturePad from '$lib/components/inspector/SignaturePad.svelte';
  $: id = $page.params.id;
  let tab: 'mesin' | 'bodi' | 'interior' = 'mesin', score = 85, msg = '';
  let repairEstimate = 2000000;
  let photos: string[] = [];
  let signed = false;
  // Grade & rekomendasi DITURUNKAN dari score — tidak ada pilihan manual lagi.
  $: grade = gradeFromScore(score);
  $: reco = recoFromScore(score);
  const tabs = [
    { id: 'mesin', icon: Wrench },
    { id: 'bodi', icon: Car },
    { id: 'interior', icon: Armchair }
  ] as const;
  type CheckKey = (typeof tabs)[number]['id'];
  type CheckRow = { label: string; st: string };
  // Tiap kategori punya itemnya sendiri — sebelumnya semua tab menampilkan
  // daftar yang sama.
  const CHECKLIST: Record<CheckKey, CheckRow[]> = {
    mesin: [
      { label: 'Kondisi Pelumas & Oli Mesin', st: 'Normal' },
      { label: 'Kebocoran Radiator', st: 'Rembesan' },
      { label: 'Kebisingan Suara Mesin', st: 'Normal' },
      { label: 'Tegangan Aki Kendaraan', st: 'Normal' },
      { label: 'Kondisi Filter Oli', st: 'Normal' }
    ],
    bodi: [
      { label: 'Ketebalan Cat Bodi', st: 'Normal' },
      { label: 'Kusam / Baret Bodi', st: 'Normal' },
      { label: 'Kesesuaian Gap Panel', st: 'Normal' },
      { label: 'Kondisi Kaca & Spion', st: 'Rembesan' },
      { label: 'Kondisi Kampas Rem', st: 'Aus' }
    ],
    interior: [
      { label: 'Kondisi Kursi & Jok', st: 'Normal' },
      { label: 'Fungsi AC & Pemanas', st: 'Normal' },
      { label: 'Kebisingan Interior', st: 'Normal' },
      { label: 'Kondisi Setir & Tombol', st: 'Normal' },
      { label: 'Kondisi Karpet & Seatbelt', st: 'Normal' }
    ]
  };
  $: rows = CHECKLIST[tab];
  const keyOf = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, '_');
  async function doSubmit() {
    msg = '';
    if (!photos.length) { msg = 'Tambah minimal 1 foto lapangan dulu.'; return; }
    if (!signed) { msg = 'Bubuhkan TTD digital dulu.'; return; }
    // Kirim SEMUA kategori, bukan cuma tab yang sedang aktif.
    const items = (Object.keys(CHECKLIST) as CheckKey[]).flatMap((cat) =>
      CHECKLIST[cat].map((w) => ({ category: cat, key: keyOf(w.label), label: w.label, condition: w.st }))
    );
    const r = await api.post<{ reportId: string }>('/inspections/submit', {
      orderId: id, inspectorId: getSession()?.id ?? 'u-bsantoso', score, grade, recommendation: reco,
      repairEstimate,
      items,
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
            <p class="text-[0.875rem] font-medium">{r.label}</p>
            <span class={r.st === 'Normal' ? 'pill-green' : 'pill-red'}>{r.st}</span>
          </div>
        {/each}
      </div>
      <PhotoUpload folder={id ?? ''} onDone={(r) => { photos = [...photos, r.key]; }} />
      {#if photos.length}
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {#each photos as p}
            <img src={p} alt="Foto lapangan" class="aspect-square w-full rounded-xl object-cover" />
          {/each}
        </div>
        <p class="text-xs text-slate-500">{photos.length} foto terlampir.</p>
      {/if}
      <SignaturePad onSave={() => { signed = true; msg = 'TTD tersimpan.'; }} />
    </div>
    <aside class="grid content-start gap-3 lg:sticky lg:top-20">
      <div class="ts-card grid gap-2">
        <p class="ts-eyebrow">Ringkasan</p>
        <label class="text-xs font-semibold">Score
          <input type="number" min="0" max="100" class="ts-field-sm mt-1" bind:value={score} />
        </label>
        <div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
          <p class="text-xs font-semibold">Grade</p>
          <span class="rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-bold text-white">{grade}</span>
        </div>
        <div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
          <p class="text-xs font-semibold">Rekomendasi</p>
          <span class="rounded-lg px-2.5 py-1 text-xs font-bold {reco === 'beli' ? 'bg-emerald-600 text-white' : reco === 'nego' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'}">{recoLabel(reco)}</span>
        </div>
        <label class="text-xs font-semibold">Estimasi Perbaikan (Rp)
          <input type="number" min="0" class="ts-field-sm mt-1" bind:value={repairEstimate} />
        </label>
        <p class="text-[0.6875rem] text-slate-400">Grade &amp; rekomendasi dihitung otomatis dari score.</p>
      </div>
      {#if msg}<p class="text-sm">{msg}</p>{/if}
      <button class="btn-blue w-full" on:click={submit}>Lanjutkan ke Ringkasan Laporan</button>
    </aside>
  </div>
</div>
