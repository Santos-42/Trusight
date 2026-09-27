<script lang="ts">
  import { Car, ClipboardCheck, Check } from '@lucide/svelte';
</script>
<svelte:head><title>TruSight — Transparency You Can Trust</title></svelte:head>
<div class="mx-auto flex min-h-[85dvh] max-w-md flex-col items-center px-6 pb-10 pt-14 text-center">
  <img src="/logo.png" alt="TruSight" class="h-14 w-auto" />
  <h1 class="mt-1 text-xl font-extrabold tracking-wide text-ink-900">TRUSIGHT</h1>

  <div class="relative mt-8 flex items-end justify-center gap-2 lg:hidden">
    <span class="grid size-28 place-items-center rounded-3xl bg-ink-900 text-white"><Car class="size-14" /></span>
    <span class="grid w-24 place-items-center rounded-3xl bg-white p-3 shadow-sm">
      <ClipboardCheck class="size-8 text-brand-600" />
      <span class="mt-1 grid gap-1">
        <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
        <span class="flex items-center gap-1"><Check class="size-3.5 text-[#1e9e5a]" /><span class="h-1 w-10 rounded bg-slate-200"></span></span>
        <span class="h-1 w-12 rounded bg-slate-200"></span>
      </span>
    </span>
  </div>

  <div class="mt-6 flex gap-1.5 lg:hidden"><span class="size-2 rounded-full bg-brand-600"></span><span class="size-2 rounded-full bg-slate-300"></span></div>
  <p class="mt-3 text-[15px] leading-relaxed text-ink-900 lg:hidden">Jasa pengecekan mobil second yang dilakukan oleh verifikator yang memiliki sertifikat ahli dalam inspeksi mobil.</p>
  <div class="my-6 h-px w-full bg-ink-900/70 lg:hidden"></div>

  <div class="grid w-full gap-3">
    <a href="/login" class="btn-navy w-full">Login</a>
    <a href="/register" class="btn-outline w-full">Register</a>
    <a href="/app/home" class="link-blue mt-2 text-[15px]">Continue as a guest</a>
  </div>
</div>
