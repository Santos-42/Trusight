<script lang="ts">
  import { onMount } from 'svelte';
  import { BellRing, CalendarClock, CircleUserRound, Plus, X } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { loadCatalog, type CatalogVehicle } from '$lib/catalog';
  import { certificationBadge, type MockVehicle } from '$lib/mocks';
  import { fileUrl } from '$lib/files';
  import { compressImage, uploadMedia } from '$lib/upload';
  import { rupiah } from '$lib/format';
  let msg = '';
  // Permintaan "mau lihat mobil" — dari order RAHASIA. Datang tanpa konteks
  // inspeksi, seller cukup melihatnya sebagai calon pembeli biasa.
  type Viewing = { request_id: string; vehicle: string; requester: string; slot: string; status: string };
  // Order purna-beli (garansi / sertifikasi) — di sini seller memang tahu itu inspeksi.
  type Req = { id: string; vehicle: string; buyer: string; status: string };
  let viewings: Viewing[] = [];
  let incoming: Req[] = [];
  let live = false;
  let loaded = false;
  // Katalog milik seller — hanya locationArea (kota/kecamatan); lokasi detail tidak
  // pernah dikirim ke seller (lihat src/lib/server/d1.ts listOrders).
  let myVehicles: CatalogVehicle[] = [];

  // --- tambah iklan sendiri ---
  let showForm = false;
  let saving = false;
  let formErr = '';
  let form = { title: '', year: '', price: '', mileage: '', locationArea: '', color: '', plateNo: '' };
  let photoFile: File | null = null;
  let photoPreview = '';
  let photoMsg = '';

  async function refreshCatalog(uid: string) {
    myVehicles = await loadCatalog(uid);
  }

  /** Hasil inspeksi baru boleh terlihat seller SETELAH mobil terjual. */
  function badgeOf(v: MockVehicle): { cls: string; label: string } {
    const b = certificationBadge(v);
    if (b.revealed) return { cls: 'pill-green shrink-0', label: b.grade ? `Certified ${b.grade}` : 'Terjual' };
    return { cls: 'pill-amber shrink-0', label: 'Dijual' };
  }

  async function markSold(id: string) {
    const r = await api.post(`/vehicles/${id}/sold`, {});
    if (!r.ok) return;
    await refreshCatalog(getSession()?.id ?? '');
  }

  /** Pilih foto dari file — nanti otomatis masuk ke folder bernama mobilnya. */
  async function pickPhoto(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      formErr = 'File harus berupa gambar.';
      return;
    }
    photoFile = f;
    photoPreview = URL.createObjectURL(f);
    formErr = '';
  }

  async function addListing() {
    formErr = '';
    if (!form.title.trim() || !form.year || !form.price || !form.locationArea.trim()) {
      formErr = 'Nama mobil, tahun, harga, dan area wajib diisi.';
      return;
    }
    saving = true;
    const r = await api.post<{ id: string }>('/vehicles', {
      sellerId: getSession()?.id,
      title: form.title.trim(),
      year: Number(form.year),
      price: Number(form.price),
      mileage: form.mileage ? Number(form.mileage) : undefined,
      locationArea: form.locationArea.trim(),
      color: form.color.trim() || undefined,
      plateNo: form.plateNo.trim() || undefined
    });
    if (!r.ok) {
      saving = false;
      formErr = r.error.message;
      return;
    }

    // Foto disimpan sebagai blob di D1 — langsung tayang, tanpa perlu commit.
    if (photoFile) {
      try {
        // 600 KB supaya base64-nya muat di nilai TEXT D1 (batas 1 MB per nilai).
        const small = await compressImage(photoFile, 600);
        const up = await uploadMedia(new File([small], 'hero.jpg', { type: 'image/jpeg' }));
        await api.post(`/vehicles/${r.data.id}/cover`, { cover: up.url });
        photoMsg = `Foto tersimpan dan langsung tayang (${(small.size / 1024).toFixed(0)} KB).`;
      } catch (e2) {
        formErr = e2 instanceof Error ? `Foto gagal diunggah: ${e2.message}` : 'Foto gagal diunggah.';
        saving = false;
        await refreshCatalog(getSession()?.id ?? '');
        return;
      }
    }

    saving = false;
    form = { title: '', year: '', price: '', mileage: '', locationArea: '', color: '', plateNo: '' };
    photoFile = null;
    photoPreview = '';
    showForm = false;
    msg = 'Iklan baru ditambahkan dan langsung tayang di katalog.';
    await refreshCatalog(getSession()?.id ?? '');
  }

  onMount(async () => {
    const uid = getSession()?.id;
    if (uid) {
      await refreshCatalog(uid);

      const v = await api.get<Viewing[]>(`/viewings/incoming?sellerId=${encodeURIComponent(uid)}`);
      if (v.ok) viewings = v.data;

      const r = await api.get<Req[]>(`/orders/incoming?sellerId=${encodeURIComponent(uid)}`);
      if (r.ok) {
        live = true;
        incoming = r.data.filter((x) => x.status === 'pending');
      }
    }
    loaded = true;
  });
</script>
<svelte:head><title>Seller — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div>
    <p class="text-sm text-slate-500">Dashboard Penjual,</p>
    <h1 class="flex items-center gap-3 text-[1.625rem] font-bold tracking-tight"><CircleUserRound class="size-12 shrink-0 text-slate-300" /> Hendra Wijaya</h1>
  </div>
  <div class="grid items-start gap-4 lg:grid-cols-2">
    <div class="grid content-start gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-bold">Mobil Anda ({myVehicles.length})</h2>
        <button
          class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-ink-900 px-3 text-xs font-bold text-white"
          on:click={() => { showForm = !showForm; formErr = ''; photoMsg = ''; }}
        >
          {#if showForm}<X class="size-4" /> Batal{:else}<Plus class="size-4" /> Tambah Iklan{/if}
        </button>
      </div>

      {#if showForm}
        <div class="ts-card grid gap-3">
          <p class="font-bold">Tambah Iklan Baru</p>
          <label class="grid gap-1 text-sm font-semibold">Nama Mobil
            <input class="ts-field-sm" placeholder="Honda Brio RS 2021" bind:value={form.title} />
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="grid gap-1 text-sm font-semibold">Tahun
              <input class="ts-field-sm" type="number" placeholder="2021" bind:value={form.year} />
            </label>
            <label class="grid gap-1 text-sm font-semibold">Harga (Rp)
              <input class="ts-field-sm" type="number" placeholder="178000000" bind:value={form.price} />
            </label>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <label class="grid gap-1 text-sm font-semibold">Kilometre
              <input class="ts-field-sm" type="number" placeholder="38000" bind:value={form.mileage} />
            </label>
            <label class="grid gap-1 text-sm font-semibold">Warna
              <input class="ts-field-sm" placeholder="Merah" bind:value={form.color} />
            </label>
          </div>
          <label class="grid gap-1 text-sm font-semibold">Area / Kota
            <input class="ts-field-sm" placeholder="Margonda, Kota Depok" bind:value={form.locationArea} />
          </label>
          <label class="grid gap-1 text-sm font-semibold">Nomor Pelat (opsional)
            <input class="ts-field-sm" placeholder="B 1234 XY" bind:value={form.plateNo} />
          </label>
          <label class="grid gap-1 text-sm font-semibold">Foto Mobil (opsional)
            <input
              class="ts-field-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              type="file"
              accept="image/*"
              on:change={pickPhoto}
            />
          </label>
          {#if photoPreview}
            <img src={photoPreview} alt="Pratinjau foto" class="h-40 w-full rounded-xl object-cover" />
            <p class="text-xs text-slate-500">Foto akan otomatis diletakkan di folder bernama mobil ini.</p>
          {/if}
          {#if formErr}<p class="text-sm text-red-600">{formErr}</p>{/if}
          <button class="btn-blue" disabled={saving} on:click={addListing}>{saving ? 'Menyimpan...' : 'Simpan & Tayangkan'}</button>
        </div>
      {/if}
      <div class="grid max-h-[26rem] gap-3 overflow-y-auto pr-1">
        {#each myVehicles as v (v.id)}
          <div class="ts-card flex items-start justify-between gap-3">
            {#if v.cover}
              <img src={fileUrl(v.cover)} alt={v.title} class="size-16 shrink-0 rounded-xl object-cover" />
            {/if}
            <div class="min-w-0 flex-1">
              <p class="text-lg font-bold">{v.title}</p>
              <p class="text-xs text-slate-500">{v.locationArea} • {rupiah(v.price)}</p>
              {#if v.status !== 'sold'}
                <button class="mt-1 text-xs font-bold text-brand-600" on:click={() => markSold(v.id)}>Tandai Terjual</button>
              {/if}
            </div>
            <span class={badgeOf(v).cls}>{badgeOf(v).label}</span>
          </div>
        {/each}
      </div>
    </div>
    <div class="grid content-start gap-4">
      {#if !loaded}
        <div class="rounded-[20px] border border-brand-200 bg-brand-100/50 p-5 text-[0.8125rem] text-slate-500">Memuat permintaan…</div>
      {:else if viewings.length}
        <a href="/seller/schedule" class="block rounded-[20px] border border-brand-200 bg-brand-100/50 p-5 transition hover:border-brand-400">
          <p class="flex items-center gap-2 font-bold"><CalendarClock class="size-5" /> Ada yang mau lihat mobil Anda</p>
          <p class="btn-blue mt-3 w-full">Atur Waktu Lihat</p>
        </a>
      {:else if live}
        <div class="rounded-[20px] border border-slate-100 bg-white p-5 text-center">
          <p class="font-bold">Belum ada yang mau lihat mobil Anda</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Permintaan dari calon pembeli akan muncul di sini dan di menu Jadwal.</p>
        </div>
      {/if}

      {#each incoming as q (q.id)}
        <div class="rounded-[20px] border border-slate-100 bg-white p-5">
          <p class="flex items-center gap-2 font-bold"><BellRing class="size-5" /> Permintaan Inspeksi Purna-Beli</p>
          <p class="mt-1 text-[0.8125rem] text-slate-500">Pemilik mobil '{q.buyer}' mengajukan inspeksi untuk mobil {q.vehicle} ({q.id}).</p>
          <a href={`/seller/schedule?order=${encodeURIComponent(q.id)}`} class="btn-blue mt-3 w-full">Atur &amp; Setujui Jadwal</a>
        </div>
      {/each}
      <div class="rounded-[20px] bg-ink-900 p-5 text-white">
        <p class="font-bold">Naikkan Harga Jual Hingga 15%!</p>
        <p class="mt-1 text-[0.8125rem] text-white/70">Dapatkan lencana emas 'TruSight Certified' di listing Anda.</p>
        <a href="/seller/certification" class="mt-3 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-ink-900">Ajukan Sertifikasi Mandiri</a>
      </div>
    </div>
  </div>
  {#if msg}<p class="text-sm">{msg}</p>{/if}
  {#if photoMsg}<p class="text-sm text-amber-700">{photoMsg}</p>{/if}
</div>
