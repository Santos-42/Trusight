<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { requireAuth } from '$lib/guest';
  import { ChevronLeft, BadgeCheck, Car, Fuel, MapPin, CheckCircle2, Cog } from '@lucide/svelte';
  import { mockVehicles } from '$lib/mocks';
  import { rupiah, km } from '$lib/format';
  $: id = $page.params.id;
  $: v = mockVehicles.find(x => x.id === id) ?? mockVehicles[0];
  $: fromLink = $page.url.searchParams.get('from') === 'link';
  $: linkSrc = $page.url.searchParams.get('src') ?? '';
  let slide = 0;
  const slides = [
    { pos: 'center', label: 'Tampak utama' },
    { pos: 'left center', label: 'Sisi kiri' },
    { pos: 'right center', label: 'Sisi kanan' }
  ];
  let touchX: number | null = null;
  function swipeEnd(e: TouchEvent) {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (dx < -40) slide = (slide + 1) % slides.length;
    else if (dx > 40) slide = (slide - 1 + slides.length) % slides.length;
  }
  function order() {
    requireAuth(() => goto('/app/new-inspection'), `/app/vehicle/${id}`);
  }
</script>
<svelte:head><title>{v.title} — TruSight</title></svelte:head>
<div class="grid gap-4 pb-24 lg:grid-cols-3 lg:pb-10">
  <div class="ts-appbar lg:col-span-3">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Vehicle Detail</p>
  </div>

  {#if fromLink}
    <div class="ts-card !border-brand-200 !bg-brand-50 lg:col-span-3">
      <p class="text-sm"><b>Terdeteksi dari link{linkSrc ? `: ${linkSrc}` : ''}.</b> Foto, nama mobil, dan lokasi penjual di bawah ini mengikuti katalog terdekat (mode demo).</p>
    </div>
  {/if}
  <div class="grid gap-4 lg:col-span-2">
    <div
      role="region" aria-label="Galeri foto kendaraan"
      class="relative h-60 select-none overflow-hidden rounded-[20px] bg-[#14181e] text-white lg:h-72"
      on:touchstart={(e) => (touchX = e.touches[0].clientX)}
      on:touchend={swipeEnd}
    >
      <div class="flex h-full transition-transform duration-300" style="transform: translateX(-{slide * 100}%)">
        {#each slides as s}
          <div class="relative h-full w-full shrink-0">
            {#if v.cover}
              <img src={v.cover} alt={`${v.title} — ${s.label}`} class="h-full w-full object-cover" style="object-position: {s.pos}" draggable="false" />
              <span class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></span>
            {:else}
              <span class="grid h-full place-items-center"><Car class="size-40 opacity-95" /></span>
            {/if}
          </div>
        {/each}
      </div>
      <span class="pill-hero absolute bottom-4 left-4"><BadgeCheck class="size-4 text-brand-600" /> TRUSIGHT VERIFIED</span>
      <span class="absolute bottom-4 right-6 flex gap-1.5">
        {#each slides as _, i}
          <button aria-label="Foto {i + 1}" on:click={() => (slide = i)} class={i === slide ? 'h-1.5 w-5 rounded-full bg-brand-500' : 'size-1.5 rounded-full bg-white/40'}></button>
        {/each}
      </span>
      <button aria-label="Sebelumnya" on:click={() => (slide = (slide - 1 + slides.length) % slides.length)} class="absolute left-2 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white lg:grid">‹</button>
      <button aria-label="Berikutnya" on:click={() => (slide = (slide + 1) % slides.length)} class="absolute right-2 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white lg:grid">›</button>
    </div>
    <h1 class="text-[26px] font-bold tracking-tight">{v.title}</h1>
    <div class="grid grid-cols-2 gap-3">
      <div class="ts-card"><p class="ts-eyebrow">Transmission</p><p class="mt-1 font-bold">Manual</p><Cog class="mt-2 size-6 text-brand-600" /></div>
      <div class="ts-card"><p class="ts-eyebrow">Fuel Type</p><p class="mt-1 font-bold">Gas</p><Fuel class="mt-2 size-6 text-brand-600" /></div>
    </div>
    <a class="ts-card flex items-center justify-between" href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(v.location)}" target="_blank" rel="noreferrer" title="Buka di Google Maps">
      <div><p class="ts-eyebrow">Location</p><p class="mt-1 font-bold">{v.location}</p><p class="text-[11px] text-slate-400">{v.year} MODEL • {km(v.mileage).toUpperCase()}</p></div>
      <MapPin class="size-7 text-brand-600" />
    </a>
  </div>

  <div class="grid content-start gap-4">
    <div class="ts-card">
      <p class="ts-eyebrow">Asking Price</p>
      <p class="mt-1 text-[28px] font-extrabold text-brand-600">{rupiah(v.price)}</p>
      <p class="text-[11px] text-slate-400">EXCL. TAX • OLX • VERIFIED PARTNER</p>
    </div>
    <div class="rounded-[20px] bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
      <p class="flex items-center gap-2 font-bold"><CheckCircle2 class="size-5" /> VERIFICATION PASSED</p>
      <p class="mt-1 text-[13px] text-white/85">150 Point Inspection Passed by TruSight Certified Verifier.</p>
    </div>
    <button class="btn-navy hidden w-full lg:inline-flex" on:click={order}>ORDER VERIFICATION</button>
  </div>
</div>
<button class="fixed bottom-24 left-1/2 z-40 inline-flex min-h-[56px] w-[min(92%,28rem)] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-bold tracking-widest text-white shadow-xl lg:hidden" on:click={order}>ORDER VERIFICATION</button>
