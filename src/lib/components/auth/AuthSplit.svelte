<script lang="ts">
  import { ShieldCheck, ClipboardCheck, BadgeCheck, Star } from '@lucide/svelte';
</script>

<!-- Mobile: invisible wrapper (halaman mockup tampil apa adanya).
     Desktop (lg): kartu split-screen — panel brand kiri + form kanan. -->
<div class="flex flex-1 flex-col lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[1fr_1.1fr] lg:bg-white">
  <aside class="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex lg:min-h-0 xl:p-14">
    <div class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-600/25"></div>
    <div class="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-brand-600/15"></div>
    <div class="relative flex items-center gap-3">
      <img src="/logo.png" alt="TruSight" class="h-11 w-auto brightness-0 invert" />
      <div>
        <p class="text-lg font-extrabold tracking-wide">TRUSIGHT</p>
        <p class="text-xs text-white/60">Transparency You Can Trust</p>
      </div>
    </div>
    <div class="relative">
      <h2 class="text-[28px] font-extrabold leading-snug">Beli mobil bekas<br />tanpa rasa <span class="text-brand-500">was-was.</span></h2>
      <ul class="mt-6 grid gap-4 text-[14px]">
        <li class="flex items-start gap-3"><ShieldCheck class="mt-0.5 size-5 shrink-0 text-emerald-400" /><span><b>150-point surgical inspection</b> oleh verifikator bersertifikat.</span></li>
        <li class="flex items-start gap-3"><ClipboardCheck class="mt-0.5 size-5 shrink-0 text-emerald-400" /><span><b>Skor, estimasi perbaikan & rekomendasi</b> berbasis data.</span></li>
        <li class="flex items-start gap-3"><BadgeCheck class="mt-0.5 size-5 shrink-0 text-emerald-400" /><span><b>Garansi 30 hari</b> untuk mesin & transmisi.</span></li>
      </ul>
    </div>
    <div class="relative grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
      <div><p class="text-xl font-extrabold">1.105+</p><p class="text-[11px] text-white/55">Inspeksi</p></div>
      <div><p class="flex items-center justify-center gap-1 text-xl font-extrabold"><Star class="size-4 fill-gold-400 text-gold-400" />4.9</p><p class="text-[11px] text-white/55">Rating</p></div>
      <div><p class="text-xl font-extrabold">94</p><p class="text-[11px] text-white/55">Skor rata-rata</p></div>
    </div>
  </aside>
  <div class="flex flex-1 flex-col lg:min-h-0 lg:items-center lg:justify-center lg:p-6 xl:p-10">
    <div class="flex w-full flex-1 flex-col lg:block lg:max-w-md lg:flex-none"><slot /></div>
  </div>
</div>
