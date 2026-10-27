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
  let sending = false;
  let msgError = false;
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
    msgError = false;
    if (!photos.length) { msg = 'Tambah minimal 1 foto lapangan dulu.'; msgError = true; return; }
    if (!signed) { msg = 'Bubuhkan TTD digital dulu.'; msgError = true; return; }
    // Kirim SEMUA kategori, bukan cuma tab yang sedang aktif.
    const items = (Object.keys(CHECKLIST) as CheckKey[]).flatMap((cat) =>
      CHECKLIST[cat].map((w) => ({ category: cat, key: keyOf(w.label), label: w.label, condition: w.st }))
    );
    sending = true;
    try {
      const r = await api.post<{ reportId: string }>('/inspections/submit', {
        orderId: id, inspectorId: getSession()?.id ?? 'u-bsantoso', score, grade, recommendation: reco,
        repairEstimate,
        items,
        photoKeys: photos
      });
      msg = r.ok ? `Laporan diterbitkan (${r.data.reportId}) + garansi 30 hari.` : r.error.message;
      msgError = !r.ok;
    } finally {
      sending = false;
    }
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
      <PhotoUpload onDone={(r) => { photos = [...photos, r.key]; }} />
      {#if photos.length}
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {#each photos as p, i (p + i)}
            <div class="relative">
              <img src={p} alt="Foto lapangan" class="aspect-square w-full rounded-xl object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/60 text-sm font-bold text-white"
                aria-label="Hapus foto {i + 1}"
                on:click={() => { photos = photos.filter((_, k) => k !== i); }}
              >×</button>
            </div>
          {/each}
        </div>
        <p class="text-xs text-slate-500">{photos.length} foto terlampir.</p>
      {/if}
      <SignaturePad onSave={() => { signed = true; msg = 'TTD tersimpan.'; msgError = false; }} />
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
      <!-- Syarat submit ditampilkan eksplisit — user tahu apa yang belum satisfied
           sebelum menekan tombol, bukan lewat pesan error setelahnya. -->
      <div class="ts-card grid gap-1 text-[0.8125rem]">
        <p class="font-bold">Syarat pelaporan</p>
        <p class={photos.length ? 'text-emerald-700' : 'text-amber-700'}>
          {photos.length ? '✓' : '○'} Foto lapangan minimal 1{photos.length ? ` (${photos.length})` : ''}
        </p>
        <p class={signed ? 'text-emerald-700' : 'text-amber-700'}>
          {signed ? '✓' : '○'} Tanda tangan digital
        </p>
      </div>
      <!-- Di HP tombol & pesan lengket di bawah — tidak tenggelam di bawah lipatan layar. -->
      <div class="sticky bottom-0 z-10 -mx-4 grid gap-2 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {#if msg}<p class="text-sm font-semibold {msgError ? 'text-red-600' : 'text-emerald-700'}">{msg}</p>{/if}
        <button class="btn-blue w-full disabled:opacity-50" disabled={sending} on:click={submit}>
          {sending ? 'Mengirim...' : 'Lanjutkan ke Ringkasan Laporan'}
        </button>
      </div>
    </aside>
  </div>
</div>
