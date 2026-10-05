<script lang="ts">
  import { Car, ClipboardCheck, Check, ShieldCheck, Award, ChevronLeft, ChevronRight } from '@lucide/svelte';
  let i = 0;
  const N = 2;
  function go(n: number) {
    i = (n + N) % N;
  }
  function prev() {
    go(i - 1);
  }
  function next() {
    go(i + 1);
  }
  let tx = 0;
  function onTouchStart(e: TouchEvent) {
    tx = e.touches[0].clientX;
  }
  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - tx;
    if (dx > 40) prev();
    else if (dx < -40) next();
  }
  const texts = [
    'Jasa pengecekan mobil second yang dilakukan oleh verifikator yang memiliki sertifikat ahli dalam inspeksi mobil.',
    'Verifikator mobil yang ahli dalam melakukan inspeksi mobil secara menyeluruh yang memiliki sertifikat ahli dalam inspeksi mobil.'
  ];
</script>
<svelte:head><title>TruSight — Transparency You Can Trust</title></svelte:head>
<div class="flex flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 text-center lg:h-full lg:min-h-0 lg:pt-2">
  <img src="/logo.png" alt="TruSight" class="mx-auto h-14 w-auto lg:h-10" />
  <h1 class="mt-1 text-xl font-extrabold tracking-wide text-ink-900">TRUSIGHT</h1>

  <div class="flex min-h-0 flex-1 flex-col items-center justify-center py-6 lg:py-3" role="region" aria-roledescription="carousel" aria-label="Intro TruSight" on:touchstart={onTouchStart} on:touchend={onTouchEnd}>
    <div class="flex w-full items-center justify-between gap-2">
      <button class="ts-back shrink-0" on:click={prev} aria-label="Slide sebelumnya"><ChevronLeft class="size-5" /></button>
      <div class="relative flex items-end justify-center gap-2">
        {#if i === 0}
          <span class="grid size-28 place-items-center rounded-3xl bg-ink-900 text-white lg:size-20"><Car class="size-14 lg:size-10" /></span>
          <span class="grid w-24 place-items-center rounded-3xl bg-white p-3 shadow-sm lg:w-20 lg:p-2">
            <ClipboardCheck class="size-8 text-brand-600 lg:size-6" />
            <span class="mt-1 grid gap-1">
              <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
              <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
              <span class="h-1 w-12 rounded bg-slate-200"></span>
            </span>
          </span>
        {:else}
          <span class="grid size-28 place-items-center rounded-3xl bg-ink-900 text-white lg:size-20"><ShieldCheck class="size-14 lg:size-10" /></span>
          <span class="grid w-24 place-items-center rounded-3xl bg-white p-3 shadow-sm lg:w-20 lg:p-2">
            <Award class="size-8 text-brand-600 lg:size-6" />
            <span class="mt-1 grid gap-1">
              <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
              <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
              <span class="h-1 w-12 rounded bg-slate-200"></span>
            </span>
          </span>
        {/if}
      </div>
      <button class="ts-back shrink-0" on:click={next} aria-label="Slide berikutnya"><ChevronRight class="size-5" /></button>
    </div>
    <div class="mt-6 flex gap-1.5">
      {#each [0, 1] as n}
        <button class="size-2 rounded-full {i === n ? 'bg-brand-600' : 'bg-slate-300'}" on:click={() => go(n)} aria-label="Ke slide {n + 1}"></button>
      {/each}
    </div>
    {#key i}
      <p class="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-900">{texts[i]}</p>
    {/key}
  </div>

  <div class="mt-auto grid w-full gap-3">
    <div class="h-px w-full bg-ink-900/70"></div>
    <a href="/login" class="btn-navy w-full">Login</a>
    <a href="/register" class="btn-outline w-full">Register</a>
    <a href="/app/home" class="link-blue mt-2 text-[15px]">Continue as a guest</a>
  </div>
</div>
